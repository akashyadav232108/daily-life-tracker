package com.tracker.notification.service;

import com.tracker.notification.model.dto.response.NotificationResponse;
import com.tracker.notification.model.entity.Notification;
import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private static final String UNREAD_KEY = "notification:unread:";

    private final NotificationRepository notificationRepository;
    private final RedisTemplate<String, String> redisTemplate;

    // ══════════════════════════════════════════════════════════
    //  INTERNAL — called by Kafka consumers and schedulers
    // ══════════════════════════════════════════════════════════

    /**
     * Persists a new notification and increments the Redis unread counter.
     * Called internally by consumers and schedulers — NOT exposed as API.
     */
    @Transactional
    public Notification createNotification(Long userId, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Increment Redis unread count
        redisTemplate.opsForValue().increment(UNREAD_KEY + userId);

        log.debug("Notification created [id={}] for user {} — type={}", saved.getId(), userId, type);
        return saved;
    }

    /**
     * Broadcast: create the same notification for a list of user IDs.
     * Used by admin broadcast and morning/evening schedulers.
     */
    @Transactional
    public void broadcastNotification(List<Long> userIds, String title, String message, NotificationType type) {
        for (Long userId : userIds) {
            createNotification(userId, title, message, type);
        }
        log.info("Broadcast notification sent to {} users — type={}", userIds.size(), type);
    }

    // ══════════════════════════════════════════════════════════
    //  USER API
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/notifications — paginated, newest first.
     */
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponse::fromEntity);
    }

    /**
     * GET /api/notifications/unread — all unread notifications for user.
     */
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    /**
     * GET /api/notifications/unread/count — fast badge count from Redis (fallback to DB).
     */
    public long getUnreadCount(Long userId) {
        String cached = redisTemplate.opsForValue().get(UNREAD_KEY + userId);
        if (cached != null) {
            try {
                return Long.parseLong(cached);
            } catch (NumberFormatException e) {
                log.warn("Invalid Redis unread count for userId={}: {}", userId, cached);
            }
        }
        // Redis miss or invalid — fall back to DB and re-sync cache
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        redisTemplate.opsForValue().set(UNREAD_KEY + userId, String.valueOf(count));
        return count;
    }

    /**
     * PATCH /api/notifications/{id}/read — mark a single notification as read.
     */
    @Transactional
    public NotificationResponse markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Notification not found or does not belong to this user"));

        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
            // Decrement Redis unread count (never go below 0)
            String key = UNREAD_KEY + userId;
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null && Long.parseLong(cached) > 0) {
                redisTemplate.opsForValue().decrement(key);
            }
        }

        return NotificationResponse.fromEntity(notification);
    }

    /**
     * PATCH /api/notifications/read-all — mark all as read, reset Redis counter.
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
        redisTemplate.opsForValue().set(UNREAD_KEY + userId, "0");
        log.debug("All notifications marked as read for user {}", userId);
    }

    /**
     * DELETE /api/notifications/{id} — user deletes their own notification.
     */
    @Transactional
    public void deleteOwnNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Notification not found or does not belong to this user"));

        if (!notification.getIsRead()) {
            String key = UNREAD_KEY + userId;
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null && Long.parseLong(cached) > 0) {
                redisTemplate.opsForValue().decrement(key);
            }
        }

        notificationRepository.delete(notification);
        log.debug("User {} deleted notification [id={}]", userId, notificationId);
    }

    // ══════════════════════════════════════════════════════════
    //  ADMIN API
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/notifications/admin/users/{userId} — admin view of any user's notifications.
     */
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    /**
     * DELETE /api/notifications/admin/{notificationId} — super admin hard delete.
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        // If it was unread, decrement the user's Redis counter
        if (!notification.getIsRead()) {
            String key = UNREAD_KEY + notification.getUserId();
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null && Long.parseLong(cached) > 0) {
                redisTemplate.opsForValue().decrement(key);
            }
        }

        notificationRepository.delete(notification);
        log.info("Admin deleted notification [id={}]", notificationId);
    }

    /**
     * Admin stats — total, unread, per-type breakdown.
     */
    public java.util.Map<String, Object> getPlatformStats() {
        long total = notificationRepository.countAllNotifications();
        long unread = notificationRepository.countAllUnread();
        List<Object[]> typeBreakdown = notificationRepository.countByType();

        java.util.Map<String, Long> byType = new java.util.LinkedHashMap<>();
        for (Object[] row : typeBreakdown) {
            byType.put(row[0].toString(), (Long) row[1]);
        }

        return java.util.Map.of(
                "totalNotifications", total,
                "totalUnread", unread,
                "byType", byType
        );
    }
}
