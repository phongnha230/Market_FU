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
  timeout: 6000, // 6 giây timeout để phản hồi nhanh chóng
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

// 1. Request Interceptor: Tự động gán JWT Bearer token & xử lý FormData
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const authStore = getAuthStore();
      const token = authStore?.getState()?.token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const isFormDataPayload =
        config.data &&
        ((typeof FormData !== 'undefined' && config.data instanceof FormData) ||
          typeof (config.data as any)?.getParts === 'function');
      if (isFormDataPayload) {
        if (config.headers && typeof config.headers.setContentType === 'function') {
          config.headers.setContentType('multipart/form-data');
        }
        if (!config.timeout || config.timeout <= 6000) {
          config.timeout = 60000;
        }
      }
    } catch {
      // Bỏ qua lỗi nếu store chưa hydrate
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Tự động xử lý Refresh Token khi gặp mã 401
apiClient.interceptors.response.use(
  (response) => {
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
 * Chuẩn hóa đối tượng file ảnh cho React Native FormData (`{ uri, name, type }`).
 * Đảm bảo mimeType luôn thuộc danh sách hợp lệ của Multer & Gemini Vision (`image/jpeg`, `image/png`, `image/webp`).
 */
export const buildImageFormDataPart = (uri: string, fallbackPrefix = 'photo') => {
  const cleanPath = uri.split('?')[0];
  const rawName = cleanPath.split('/').pop() || `${fallbackPrefix}_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(rawName);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  const safeExt = ext === 'png' || ext === 'webp' ? ext : 'jpg';
  const name = match ? rawName.replace(/\.\w+$/, `.${safeExt}`) : `${rawName}.${safeExt}`;
  const type =
    safeExt === 'png'
      ? 'image/png'
      : safeExt === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  return {
    uri,
    name,
    type,
  };
};

export interface MultipartUploadOptions {
  method?: 'POST' | 'PATCH' | 'PUT';
  timeoutMs?: number;
}

/**
 * Gửi `multipart/form-data` trực tiếp qua `XMLHttpRequest` native của React Native (`RCTNetworking`).
 * Giải quyết triệt để lỗi `Unsupported FormDataPart implementation` của `expo/fetch` trên Expo SDK 57
 * khi truyền `{ uri, name, type }`, đồng thời để native networking tự động đóng gói boundary chuẩn 100%.
 */
export const uploadMultipart = async <T = any>(
  endpoint: string,
  formData: FormData,
  options?: MultipartUploadOptions
): Promise<{ data: ApiResponse<T>; status: number }> => {
  const method = (options?.method || 'POST').toUpperCase();
  const timeoutMs = options?.timeoutMs ?? 60000;
  const baseUrl = getApiBaseUrl();
  const fullUrl = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const authStore = getAuthStore();
  const currentToken = authStore?.getState()?.token || null;

  const sendOnce = (tokenToUse: string | null): Promise<{ data: ApiResponse<T>; status: number }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, fullUrl, true);
      xhr.timeout = timeoutMs;

      xhr.setRequestHeader('Accept', 'application/json');
      if (tokenToUse) {
        xhr.setRequestHeader('Authorization', `Bearer ${tokenToUse}`);
      }
      // Không set cứng Content-Type để RCTNetworking (OkHttp/NSURLSession) tự sinh multipart/form-data; boundary=...

      xhr.onload = () => {
        let json: any = null;
        try {
          json = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          json = { message: xhr.responseText || `Lỗi phản hồi từ máy chủ (HTTP ${xhr.status})` };
        }

        if (xhr.status >= 200 && xhr.status < 300 && json?.success !== false) {
          resolve({ data: json, status: xhr.status });
        } else {
          const errorMsg =
            json?.error?.message ||
            (typeof json?.error === 'string' ? json.error : null) ||
            json?.message ||
            `Máy chủ từ chối yêu cầu (HTTP ${xhr.status})`;
          const err: any = new Error(errorMsg);
          err.status = xhr.status;
          err.response = { status: xhr.status, data: json };
          reject(err);
        }
      };

      xhr.onerror = () => {
        const err: any = new Error(
          'Không thể kết nối đến máy chủ khi tải tệp lên. Vui lòng kiểm tra kết nối mạng.'
        );
        err.code = 'ERR_NETWORK';
        reject(err);
      };

      xhr.ontimeout = () => {
        const seconds = Math.round(timeoutMs / 1000);
        const err: any = new Error(
          `Quá thời gian tải tệp lên (${seconds}s). Vui lòng thử lại với ảnh nhỏ hơn hoặc mạng ổn định hơn.`
        );
        err.code = 'ETIMEDOUT';
        reject(err);
      };

      xhr.onabort = () => {
        const err: any = new Error('Yêu cầu tải tệp lên đã bị hủy.');
        err.name = 'AbortError';
        reject(err);
      };

      xhr.send(formData as any);
    });

  try {
    return await sendOnce(currentToken);
  } catch (err: any) {
    // Tự động thử làm mới Access Token 1 lần nếu gặp lỗi 401
    if (err?.status === 401 && currentToken && authStore) {
      try {
        const storedRefreshToken = (authStore.getState() as any)?.refreshToken || currentToken;
        const refreshRes = await axios.post(
          `${baseUrl}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );
        const newAccessToken =
          refreshRes.data?.data?.tokens?.accessToken ||
          refreshRes.data?.data?.accessToken ||
          refreshRes.data?.tokens?.accessToken;

        if (newAccessToken) {
          const user = authStore.getState()?.user;
          if (user) {
            authStore.getState().setAuth(user, newAccessToken);
          }
          return await sendOnce(newAccessToken);
        }
      } catch {
        // Nếu refresh thất bại, ném lỗi 401 ban đầu
      }
    }
    throw err;
  }
};

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
