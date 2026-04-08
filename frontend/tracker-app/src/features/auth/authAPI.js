import { authAxios } from '../../app/axiosInstance';

/**
 * Auth Service API calls (auth-service :8081)
 */
const authAPI = {
  /**
   * POST /api/auth/register
   * @param {{ fullName: string, email: string, password: string }} data
   */
  register: (data) => authAxios.post('/api/auth/register', data),

  /**
   * POST /api/auth/login
   * @param {{ email: string, password: string }} data
   */
  login: (data) => authAxios.post('/api/auth/login', data),

  /**
   * POST /api/auth/refresh
   * @param {{ refreshToken: string }} data
   */
  refreshToken: (data) => authAxios.post('/api/auth/refresh', data),

  /**
   * POST /api/auth/logout
   */
  logout: () => authAxios.post('/api/auth/logout'),

  /**
   * GET /api/users/me — Get current user profile
   */
  getProfile: () => authAxios.get('/api/users/me'),

  /**
   * PUT /api/users/me — Update profile (name, telegram chat ID)
   * @param {{ fullName?: string, telegramChatId?: string }} data
   */
  updateProfile: (data) => authAxios.put('/api/users/me', data),

  /**
   * PUT /api/users/me/password — Change password
   * @param {{ currentPassword: string, newPassword: string }} data
   */
  changePassword: (data) => authAxios.put('/api/users/me/password', data),

  /**
   * DELETE /api/users/me — Permanently delete own account (password required)
   * @param {{ password: string }} data
   */
  deleteAccount: (data) => authAxios.delete('/api/users/me', { data }),

  /**
   * POST /api/auth/forgot-password — Step 1: Send OTP to registered email.
   * Also used for "Resend OTP" on the verify-otp page.
   * @param {{ email: string }} data
   */
  forgotPassword: (data) => authAxios.post('/api/auth/forgot-password', data),

  /**
   * POST /api/auth/verify-otp — Step 2: Verify the 6-digit OTP.
   * Returns { data: resetToken } — a short-lived UUID used in Step 3.
   * @param {{ email: string, otp: string }} data
   */
  verifyOtp: (data) => authAxios.post('/api/auth/verify-otp', data),

  /**
   * POST /api/auth/reset-password — Step 3: Set a new password using the reset token.
   * @param {{ resetToken: string, newPassword: string }} data
   */
  resetPassword: (data) => authAxios.post('/api/auth/reset-password', data),
};

export default authAPI;
