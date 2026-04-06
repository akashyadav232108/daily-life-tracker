package com.tracker.notification.controller;

import com.tracker.notification.model.dto.request.BroadcastRequest;
import com.tracker.notification.model.dto.response.ApiResponse;
import com.tracker.notification.model.dto.response.NotificationResponse;
import com.tracker.notification.model.enums.NotificationType;
import com.tracker.notification.service.InsightsService;
import com.tracker.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final InsightsService     insightsService;

    // ══════════════════════════════════════════════════════════
    //  USER ENDPOINTS — own notifications only
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/notifications?page=0&size=20
     * Get own notifications — paginated, newest first.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = (Long) auth.getPrincipal();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<NotificationResponse> result = notificationService.getNotifications(userId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", result));
    }

    /**
     * GET /api/notifications/unread
     * Get all unread notifications for the authenticated user.
     */
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            Authentication auth) {

        Long userId = (Long) auth.getPrincipal();
        List<NotificationResponse> result = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications fetched", result));
    }

    /**
     * GET /api/notifications/unread/count
     * Get the unread notification count — used for the bell badge.
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", count));
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Mark a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            Authentication auth,
            @PathVariable Long id) {

        Long userId = (Long) auth.getPrincipal();
        NotificationResponse result = notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", result));
    }

    /**
     * PATCH /api/notifications/read-all
     * Mark all notifications as read for the authenticated user.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    // ══════════════════════════════════════════════════════════
    //  ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════

    /**
     * GET /api/notifications/admin/users/{userId}
     * Admin: view any user's notifications.
     */
    @GetMapping("/admin/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @PathVariable Long userId) {

        List<NotificationResponse> result = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User notifications fetched", result));
    }

    /**
     * GET /api/notifications/admin/users/{userId}/insights
     * Admin: view any user's insights/daily summary.
     */
    @GetMapping("/admin/users/{userId}/insights")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getUserInsights(@PathVariable Long userId) {
        var todaySummary = insightsService.getTodaySummary(userId);
        return ResponseEntity.ok(ApiResponse.success("User insights fetched", todaySummary));
    }

    /**
     * GET /api/notifications/admin/stats
     * Admin: platform-wide notification statistics.
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlatformStats() {
        Map<String, Object> stats = notificationService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success("Platform stats fetched", stats));
    }

    /**
     * POST /api/notifications/admin/broadcast
     * Admin: send a notification to ALL active users (announcements).
     */
    @PostMapping("/admin/broadcast")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> broadcast(
            @Valid @RequestBody BroadcastRequest request) {

        List<Long> allUserIds = insightsService.getAllActiveUserIds();
        notificationService.broadcastNotification(
                allUserIds,
                request.getTitle(),
                request.getMessage(),
                NotificationType.DAILY_SUMMARY   // use DAILY_SUMMARY as the broadcast type
        );
        return ResponseEntity.ok(ApiResponse.success(
                "Broadcast sent to " + allUserIds.size() + " users", null));
    }

    /**
     * DELETE /api/notifications/admin/{notificationId}
     * Super Admin only: hard-delete any notification.
     */
    @DeleteMapping("/admin/{notificationId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long notificationId) {

        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
}
