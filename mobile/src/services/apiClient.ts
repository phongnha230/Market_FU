import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';

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

import Constants from 'expo-constants';

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  // Nếu người dùng set URL production hoặc IP cố định (không phải localhost)
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Khi chạy trên Web browser của máy tính
  if (Platform.OS === 'web') {
    return envUrl || 'http://localhost:5001/api';
  }

  // Tự động nhận diện IP máy tính khi chạy Expo Go trên máy thật hoặc máy ảo
  const hostUri = Constants.expoConfig?.hostUri;
  const hostIp = hostUri ? hostUri.split(':')[0] : null;
  if (hostIp) {
    return `http://${hostIp}:5001/api`;
  }

  // Fallback cho Android Emulator (10.0.2.2) hoặc iOS Simulator (localhost)
  return Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000, // 8 giây timeout để kịp fallback offline nếu backend chưa bật
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

// 1. Request Interceptor: Tự động gán JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const token = useAuthStore.getState().token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Bỏ qua lỗi nếu store chưa hydrate
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Tự động xử lý Refresh Token khi gặp mã 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ success?: boolean; error?: ApiError }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    const currentToken = useAuthStore.getState().token;

    if (status === 401 && !originalRequest?._retry && !isAuthEndpoint && currentToken) {
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
        const refreshRes = await axios.post(
          `${getApiBaseUrl()}/auth/refresh-token`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        const newAccessToken = refreshRes.data?.data?.accessToken;
        if (newAccessToken) {
          const user = useAuthStore.getState().user;
          if (user) {
            useAuthStore.getState().setAuth(user, newAccessToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Kiểm tra nhanh kết nối Backend
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await axios.get(`${getApiBaseUrl().replace('/api', '')}/api/health`, { timeout: 3000 });
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
};

export default apiClient;
