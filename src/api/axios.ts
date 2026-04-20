import { AUTH_ROUTES, ROUTES } from '@/lib/routes';
import { getAccessToken, getRefreshToken, removeAuthStorage } from '@/utils/auth';
import { API_URL } from '@/utils/const';
import { clearPortalGameHandoff, patchPortalGameHandoffAccessToken } from '@/utils/game-handoff';
import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import qs from 'qs';

// Constants
const REFRESH_TOKEN_ENDPOINT = '/auth/refresh-token';
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const RETRY_FLAG = '_retry';

const NO_REFRESH_URL_PARTS = ['/auth/login', '/auth/register', '/auth/forgot-password', REFRESH_TOKEN_ENDPOINT];

function isAuthActionRequest(config?: AxiosRequestConfig): boolean {
  if (!config?.url) return false;
  const url = config.url.toLowerCase();
  return NO_REFRESH_URL_PARTS.some((part) => url.includes(part.toLowerCase()));
}

// Types
interface QueuedRequest {
  resolve: (value?: string | null) => void;
  reject: (error?: any) => void;
}

interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Axios instance configured with base URL and query parameter serialization
 */
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  },
});

// Token refresh state management
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Processes queued requests after token refresh attempt
 * @param error - Error from refresh attempt, if any
 * @param token - New access token, if refresh was successful
 */
const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Handles authentication failure by clearing storage and redirecting
 */
const handleAuthFailure = (): void => {
  removeAuthStorage();
  clearPortalGameHandoff();

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;

    // Don't redirect if already on not-found page
    if (pathname === '/not-found') {
      return;
    }

    // Only redirect if not already on an auth page
    if (!AUTH_ROUTES.includes(pathname as any)) {
      // Redirect to sign-in with companySymbol if available
      window.location.href = `${ROUTES.LOGIN}`;
    }
  }
};

/**
 * Attempts to refresh the access token using the refresh token
 * @param refreshToken - The refresh token to use
 * @returns Promise resolving to the new tokens
 */
const refreshAccessToken = async (): Promise<RefreshTokenResponse> => {
  const refreshAxios = axios.create({ baseURL: API_URL, withCredentials: true });

  const { data } = await refreshAxios.post<RefreshTokenResponse>(REFRESH_TOKEN_ENDPOINT);

  return data;
};

/**
 * Checks if the request should be retried based on error status and retry flag
 */
const shouldRetryRequest = (
  error: AxiosError,
  originalRequest?: AxiosRequestConfig & { [RETRY_FLAG]?: boolean }
): boolean => {
  if (!originalRequest) return false;
  if (originalRequest[RETRY_FLAG]) return false;
  if (error.response?.status !== UNAUTHORIZED_STATUS) return false;

  // Wrong password on login, register validation, etc. — never call refresh.
  if (isAuthActionRequest(originalRequest)) return false;

  // No access token in storage means this 401 is not "session expired" for our app.
  if (!getAccessToken()) return false;

  return true;
};

/**
 * Request interceptor to add authorization token to headers
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle token refresh and authentication errors
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { [RETRY_FLAG]?: boolean }) | undefined;

    if (!originalRequest || !shouldRetryRequest(error, originalRequest)) {
      return Promise.reject(error);
    }

    // If refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest[RETRY_FLAG] = true;
    isRefreshing = true;

    try {
      const tokenData = await refreshAccessToken();

      // If 403 and not a permission change, reject the request
      if (error.response?.status === FORBIDDEN_STATUS) {
        return Promise.reject(error);
      }

      // Update tokens in store
      const { useAuthStore } = await import('@/stores/auth-store');
      const { setToken } = useAuthStore.getState();
      setToken(tokenData.accessToken, getRefreshToken() || tokenData.accessToken);
      patchPortalGameHandoffAccessToken(tokenData.accessToken);

      // Process queued requests with new token
      processQueue(null, tokenData.accessToken);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed, clear auth and redirect
      processQueue(refreshError, null);
      handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
