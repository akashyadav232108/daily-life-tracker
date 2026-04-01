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
};

export default authAPI;
