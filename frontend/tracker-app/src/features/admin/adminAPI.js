import { authAxios, taskAxios, healthAxios } from '../../app/axiosInstance';

/**
 * Admin API calls — combines auth-service admin & task-service admin endpoints.
 */

// ─── Auth-Service Admin (/api/users/admin) ─────────────────────

/**
 * GET /api/users/admin/all — Paginated list of all users (searchable)
 * @param {{ search?: string, page?: number, size?: number, sortBy?: string, sortDir?: string }} params
 */
export const adminFetchAllUsers = async (params = {}) => {
  const response = await authAxios.get('/api/users/admin/all', { params });
  return response.data; // { success, message, data: Page<UserResponse> }
};

/**
 * GET /api/users/admin/:userId — Get any user's profile
 */
export const adminFetchUserById = async (userId) => {
  const response = await authAxios.get(`/api/users/admin/${userId}`);
  return response.data;
};

/**
 * PATCH /api/users/admin/:userId/deactivate — Deactivate user
 */
export const adminDeactivateUser = async (userId) => {
  const response = await authAxios.patch(`/api/users/admin/${userId}/deactivate`);
  return response.data;
};

/**
 * PATCH /api/users/admin/:userId/activate — Activate user
 */
export const adminActivateUser = async (userId) => {
  const response = await authAxios.patch(`/api/users/admin/${userId}/activate`);
  return response.data;
};

/**
 * PATCH /api/users/admin/:userId/role — Change user role (SUPER_ADMIN only)
 * @param {{ role: string }} data
 */
export const adminChangeUserRole = async (userId, data) => {
  const response = await authAxios.patch(`/api/users/admin/${userId}/role`, data);
  return response.data;
};

/**
 * DELETE /api/users/admin/:userId — Delete user permanently (SUPER_ADMIN only)
 */
export const adminDeleteUser = async (userId) => {
  const response = await authAxios.delete(`/api/users/admin/${userId}`);
  return response.data;
};

/**
 * GET /api/users/admin/stats — Platform user statistics
 */
export const adminFetchUserStats = async () => {
  const response = await authAxios.get('/api/users/admin/stats');
  return response.data;
};

// ─── Task-Service Admin (/api/tasks/admin) ─────────────────────

/**
 * GET /api/tasks/admin/stats — Platform-wide task statistics
 */
export const adminFetchTaskStats = async () => {
  const response = await taskAxios.get('/api/tasks/admin/stats');
  return response.data; // { success, message, data: TaskStatsResponse }
};

/**
 * GET /api/tasks/admin/users/:userId — Get all tasks for a specific user
 */
export const adminFetchUserTasks = async (userId) => {
  const response = await taskAxios.get(`/api/tasks/admin/users/${userId}`);
  return response.data; // { success, message, data: TaskResponse[] }
};

/**
 * DELETE /api/tasks/admin/:taskId — Delete any task (SUPER_ADMIN only)
 */
export const adminDeleteTask = async (taskId) => {
  const response = await taskAxios.delete(`/api/tasks/admin/${taskId}`);
  return response.data;
};

// ─── Health-Service Admin (/api/health/admin, /api/exercises/admin) ───────────
export const adminFetchHealthStats = async () => {
  const response = await healthAxios.get('/api/health/admin/stats');
  return response.data;
};

export const adminFetchExerciseStats = async () => {
  const response = await healthAxios.get('/api/exercises/admin/stats');
  return response.data;
};
