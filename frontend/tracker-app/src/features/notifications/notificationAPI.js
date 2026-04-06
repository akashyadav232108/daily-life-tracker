import { notificationAxios } from '../../app/axiosInstance';

/**
 * Notification Service API — maps to NotificationController & InsightsController.
 *
 * Base URL: VITE_NOTIFICATION_SERVICE_URL (default http://localhost:8085)
 *
 * Notification endpoints:
 *   GET    /api/notifications                    — paginated list
 *   GET    /api/notifications/unread/count       — unread badge count
 *   PUT    /api/notifications/:id/read           — mark one read
 *   PUT    /api/notifications/read-all           — mark all read
 *   DELETE /api/notifications/:id               — delete one
 *
 * Insights endpoints:
 *   GET    /api/insights/today                   — today's daily summary
 *   GET    /api/insights/streaks                 — user streaks list
 *   GET    /api/insights/weekly                  — last 7 days summary
 */

// ─── Notifications ─────────────────────────────────────────────────

/**
 * Fetch paginated notifications.
 * @param {Object} params - { page, size, unreadOnly }
 */
export const fetchNotifications = async (params = {}) => {
  const res = await notificationAxios.get('/api/notifications', { params });
  return res.data; // { success, data: Page<NotificationResponse> }
};

/**
 * Get the current unread notification count (used for badge).
 */
export const fetchUnreadCount = async () => {
  const res = await notificationAxios.get('/api/notifications/unread/count');
  return res.data; // { success, data: number }
};

/**
 * Mark a single notification as read.
 * @param {number} id - notification ID
 */
export const markAsRead = async (id) => {
  const res = await notificationAxios.patch(`/api/notifications/${id}/read`);
  return res.data;
};

/**
 * Mark all notifications as read.
 */
export const markAllRead = async () => {
  const res = await notificationAxios.patch('/api/notifications/read-all');
  return res.data;
};

/**
 * Delete a single notification.
 * @param {number} id - notification ID
 */
export const deleteNotification = async (id) => {
  const res = await notificationAxios.delete(`/api/notifications/${id}`);
  return res.data;
};

// ─── Insights ──────────────────────────────────────────────────────

/**
 * Fetch today's daily summary (tasks, health, exercise, top expense category).
 */
export const fetchTodaySummary = async () => {
  const res = await notificationAxios.get('/api/insights/today');
  return res.data; // { success, data: DailySummaryResponse }
};

/**
 * Fetch all user streaks (HEALTH_LOG, TASK_COMPLETE, EXERCISE).
 */
export const fetchStreaks = async () => {
  const res = await notificationAxios.get('/api/insights/streaks');
  return res.data; // { success, data: StreakResponse[] }
};

/**
 * Fetch the last 7 days aggregated summary.
 */
export const fetchWeeklySummary = async () => {
  const res = await notificationAxios.get('/api/insights/weekly');
  return res.data; // { success, data: WeeklySummaryResponse }
};
