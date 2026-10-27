import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

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

const getAuthStore = () => {
  try {
    const { useAuthStore } = require('../stores/useAuthStore');
    return useAuthStore;
  } catch {
    return null;
  }
};

export const getApiBaseUrl = (): string => {
  let envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // Nếu người dùng set URL production hoặc IP cố định (không phải localhost)
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    // Xóa dấu slash ở cuối nếu có
    envUrl = envUrl.replace(/\/+$/, '');
    // Tự động thêm /api nếu người dùng nhập URL gốc của domain/VPS
    if (!envUrl.endsWith('/api') && !envUrl.includes('/api/')) {
      envUrl = `${envUrl}/api`;
    }
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
    console.log('[API Request]', config.method?.toUpperCase(), `${config.baseURL || ''}${config.url || ''}`);
    try {
      const authStore = getAuthStore();
      const token = authStore?.getState()?.token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Bỏ qua lỗi nếu store chưa hydrate
    }
    return config;
  },
  (error) => {
    console.log('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Tự động xử lý Refresh Token khi gặp mã 401
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response Success]', response.config.url, response.status);
    return response;
  },
  async (error: AxiosError<{ success?: boolean; error?: ApiError }>) => {
    console.log('[API Response Error]', error.message, error.code, `${error.config?.baseURL || ''}${error.config?.url || ''}`, error.response?.data);
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/logout') ||
      originalRequest?.url?.includes('/auth/send-register-otp') ||
      originalRequest?.url?.includes('/auth/verify-register-otp') ||
      originalRequest?.url?.includes('/auth/resend-register-otp') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    const authStore = getAuthStore();
    const currentToken = authStore?.getState()?.token;

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
        const storedRefreshToken = (authStore?.getState() as any)?.refreshToken || currentToken;
        const refreshRes = await axios.post(
          `${getApiBaseUrl()}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        const newAccessToken =
          refreshRes.data?.data?.tokens?.accessToken ||
          refreshRes.data?.data?.accessToken ||
          refreshRes.data?.tokens?.accessToken;

        if (newAccessToken) {
          const user = authStore?.getState()?.user;
          if (user && authStore) {
            authStore.getState().setAuth(user, newAccessToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr);
        // Clear auth state cleanly without re-calling logout API endpoint
        if (authStore?.setState) {
          authStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
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
