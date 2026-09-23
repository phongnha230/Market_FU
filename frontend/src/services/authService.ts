import { apiClient, ApiResponse } from './apiClient';
import { useUserStore } from '@/stores/userStore';
import { adaptBackendUser } from '@/lib/adapters';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  studentId?: string;
  campus: 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT' | string;
  recaptchaToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  // 1. Đăng ký tài khoản
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/register', payload);
    const data = response.data.data;

    if (data.tokens?.accessToken) {
      useUserStore.getState().setAccessToken(data.tokens.accessToken);
      if (data.user) {
        useUserStore.getState().setUser(adaptBackendUser(data.user));
      }
    }
    return data;
  },

  // 2. Đăng nhập Email / Mật khẩu
  async login(payload: LoginPayload): Promise<AuthResult> {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', payload);
    const data = response.data.data;

    if (data.tokens?.accessToken) {
      useUserStore.getState().setAccessToken(data.tokens.accessToken);
      if (data.user) {
        useUserStore.getState().setUser(adaptBackendUser(data.user));
      }
    }
    return data;
  },

  // 3. Đăng nhập qua Google OAuth
  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/google', { idToken });
    const data = response.data.data;

    if (data.tokens?.accessToken) {
      useUserStore.getState().setAccessToken(data.tokens.accessToken);
      if (data.user) {
        useUserStore.getState().setUser(adaptBackendUser(data.user));
      }
    }
    return data;
  },

  // 4. Đăng xuất
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      useUserStore.getState().logout();
      if (typeof window !== 'undefined') {
        document.cookie = 'admin_logged_in=; Max-Age=0; path=/; SameSite=strict';
      }
    }
  },

  // 5. Yêu cầu mã OTP Quên mật khẩu
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
      email,
    });
    return response.data.data;
  },

  // 6. Xác nhận OTP & Đặt lại mật khẩu mới
  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data.data;
  },

  // 7. Đổi mật khẩu (khi đã đăng nhập)
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data.data;
  },
};
