import axios from 'axios';

// Service base URLs from environment
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL;
const TASK_BASE_URL = import.meta.env.VITE_TASK_SERVICE_URL;
const HEALTH_BASE_URL = import.meta.env.VITE_HEALTH_SERVICE_URL;
const EXPENSE_BASE_URL = import.meta.env.VITE_EXPENSE_SERVICE_URL;
const NOTIFICATION_BASE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Creates an Axios instance for a specific backend service with shared interceptors.
 * - Request interceptor: attaches JWT access token
 * - Response interceptor: handles 401 by refreshing token, redirects to /login on failure
 */
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  // ── Request Interceptor: Attach JWT ──
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response Interceptor: Handle 401 (Token Refresh) ──
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Skip token refresh for auth endpoints (login/refresh/register return 401 legitimately)
      const isAuthEndpoint =
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/register');

      // If 401 and we haven't retried yet and NOT an auth endpoint
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // Queue request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call auth-service to refresh token
          const response = await axios.post(`${AUTH_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Store new tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);

          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Clear auth data and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// ── Export one Axios instance per backend service ──
export const authAxios = createAxiosInstance(AUTH_BASE_URL);
export const taskAxios = createAxiosInstance(TASK_BASE_URL);
export const healthAxios = createAxiosInstance(HEALTH_BASE_URL);
export const expenseAxios = createAxiosInstance(EXPENSE_BASE_URL);
export const notificationAxios = createAxiosInstance(NOTIFICATION_BASE_URL);
