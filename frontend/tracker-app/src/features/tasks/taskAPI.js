import { taskAxios } from '../../app/axiosInstance';

/**
 * Task Service API — maps to TaskController & AdminTaskController endpoints.
 *
 * Base URL: VITE_TASK_SERVICE_URL (default http://localhost:8082)
 *
 * User endpoints:
 *   POST   /api/tasks                     — create
 *   GET    /api/tasks                     — list (with filters)
 *   GET    /api/tasks/:id                 — get by id
 *   PUT    /api/tasks/:id                 — update
 *   PATCH  /api/tasks/:id/complete        — mark completed
 *   PATCH  /api/tasks/:id/reopen          — reopen
 *   DELETE /api/tasks/:id                 — delete
 *
 * Admin endpoints:
 *   GET    /api/tasks/admin/users/:userId — view any user's tasks
 *   GET    /api/tasks/admin/stats         — platform stats
 *   DELETE /api/tasks/admin/:taskId       — delete any task (SUPER_ADMIN)
 */

// ─── User Task APIs ──────────────────────────────────────────────

/**
 * Fetch current user's tasks with optional query filters.
 * @param {Object} params - { date, from, to, status, priority, view }
 */
export const fetchTasks = async (params = {}) => {
  // Remove empty/undefined values so they aren't sent as query params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const response = await taskAxios.get('/api/tasks', { params: cleanParams });
  return response.data; // { success, message, data: TaskResponse[] }
};

/**
 * Fetch a single task by ID.
 */
export const fetchTaskById = async (taskId) => {
  const response = await taskAxios.get(`/api/tasks/${taskId}`);
  return response.data; // { success, message, data: TaskResponse }
};

/**
 * Create a new task.
 * @param {Object} taskData - { title, description, priority, dueDate, recurrenceType }
 */
export const createTask = async (taskData) => {
  const response = await taskAxios.post('/api/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task.
 * @param {number} taskId
 * @param {Object} taskData - { title, description, priority, dueDate, recurrenceType }
 */
export const updateTask = async (taskId, taskData) => {
  const response = await taskAxios.put(`/api/tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Mark a task as completed.
 */
export const completeTask = async (taskId) => {
  const response = await taskAxios.patch(`/api/tasks/${taskId}/complete`);
  return response.data;
};

/**
 * Reopen a completed task.
 */
export const reopenTask = async (taskId) => {
  const response = await taskAxios.patch(`/api/tasks/${taskId}/reopen`);
  return response.data;
};

/**
 * Delete a task.
 */
export const deleteTask = async (taskId) => {
  const response = await taskAxios.delete(`/api/tasks/${taskId}`);
  return response.data;
};

// ─── Admin Task APIs ─────────────────────────────────────────────

/**
 * (Admin) Fetch tasks for a specific user.
 */
export const adminFetchUserTasks = async (userId) => {
  const response = await taskAxios.get(`/api/tasks/admin/users/${userId}`);
  return response.data;
};

/**
 * (Admin) Fetch platform-wide task statistics.
 */
export const adminFetchStats = async () => {
  const response = await taskAxios.get('/api/tasks/admin/stats');
  return response.data;
};

/**
 * (Super Admin) Delete any user's task.
 */
export const adminDeleteTask = async (taskId) => {
  const response = await taskAxios.delete(`/api/tasks/admin/${taskId}`);
  return response.data;
};
