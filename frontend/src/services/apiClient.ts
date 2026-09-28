import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/stores/userStore';
import { useAuthAlertStore } from '@/stores/authAlertStore';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = useUserStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // In case Zustand hydration hasn't run yet
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Auto Refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    // Unwraps response if standard backend structure
    return response;
  },
  async (error: AxiosError<{ success?: boolean; error?: ApiError }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const status = error.response?.status;
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    const currentToken = useUserStore.getState().accessToken;
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint && currentToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<{ tokens: { accessToken: string; refreshToken?: string } }>>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.tokens?.accessToken;
        if (newAccessToken) {
          useUserStore.getState().setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token returned from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        useUserStore.getState().logout();
        useAuthAlertStore
          .getState()
          .triggerSessionExpired(
            'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.'
          );
        return Promise.reject(extractApiError(error));
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && !isAuthEndpoint && originalRequest?._retry && currentToken) {
      useUserStore.getState().logout();
      useAuthAlertStore
        .getState()
        .triggerSessionExpired(
          'Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.'
        );
    }

    return Promise.reject(extractApiError(error));
  }
);

export function extractApiError(error: any): ApiError {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return {
      code: 'NETWORK_OR_UNKNOWN_ERROR',
      message: error.message,
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.',
  };
}
