package com.tracker.notification.repository;

import com.tracker.notification.model.entity.Notification;
import com.tracker.notification.model.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * All notifications for a user, newest first — paginated.
     * Used by GET /api/notifications
     */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Only unread notifications for a user, newest first.
     * Used by GET /api/notifications/unread
     */
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Count of unread notifications — used for the bell badge.
     * Used by GET /api/notifications/unread/count
     */
    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * Mark all notifications as read for a user.
     * Used by PATCH /api/notifications/read-all
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    void markAllReadByUserId(@Param("userId") Long userId);

    /**
     * Platform-wide total notification count (admin stats).
     */
    @Query("SELECT COUNT(n) FROM Notification n")
    long countAllNotifications();

    /**
     * Breakdown of notification counts by type (admin stats).
     * Returns [NotificationType, count] pairs.
     */
    @Query("SELECT n.type, COUNT(n) FROM Notification n GROUP BY n.type")
    List<Object[]> countByType();

    /**
     * Total unread count across ALL users (admin stats).
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false")
    long countAllUnread();

    /**
     * All notifications for a specific user ordered by date (admin view).
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Count notifications by type (for a specific notification type breakdown).
     */
    long countByType(NotificationType type);
}
