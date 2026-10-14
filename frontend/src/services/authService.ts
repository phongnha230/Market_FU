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
  // 1a. Gửi mã OTP đăng ký tài khoản (Chưa lưu DB)
  async sendRegisterOtp(payload: RegisterPayload): Promise<{ message: string; email: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string; email: string }>>('/auth/send-register-otp', payload);
    return response.data.data;
  },

  // 1b. Xác thực OTP đăng ký (Lúc này DB mới chính thức lưu tài khoản)
  async verifyRegisterOtp(payload: { email: string; otp: string }): Promise<AuthResult> {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/verify-register-otp', payload);
    const data = response.data.data;

    if (data.tokens?.accessToken) {
      useUserStore.getState().setAccessToken(data.tokens.accessToken);
      if (data.user) {
        useUserStore.getState().setUser(adaptBackendUser(data.user));
      }
    }
    return data;
  },

  // 1c. Gửi lại mã OTP đăng ký
  async resendRegisterOtp(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-register-otp', { email });
    return response.data.data;
  },

  // 1d. Đăng ký tài khoản (hỗ trợ cả gửi kèm otp)
  async register(payload: RegisterPayload & { otp?: string }): Promise<AuthResult> {
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
  async loginWithGoogle(idToken: string, campus: string = 'HOL'): Promise<AuthResult> {
    const response = await apiClient.post<ApiResponse<AuthResult>>('/auth/google', { idToken, campus });
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
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword: confirmPassword || newPassword,
    });
    return response.data.data;
  },

  // 7. Đổi mật khẩu (khi đã đăng nhập - Chuẩn RESTful PATCH)
  async changePassword(currentPassword: string, newPassword: string, confirmPassword?: string): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: confirmPassword || newPassword,
    });
    return response.data.data;
  },
};
