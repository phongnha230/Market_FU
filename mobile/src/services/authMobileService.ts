import apiClient, { ApiResponse } from './apiClient';
import type { UserProfile } from './accountStorage';
import { fromBackendCampus } from '../lib/backendMappers';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  studentId?: string;
  campus?: string;
}

export interface AuthBackendResponse {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Chuyển đổi User từ Backend sang UserProfile của Mobile
 */
export const adaptBackendUserToMobile = (user: any): UserProfile => {
  if (!user) throw new Error('Không có dữ liệu người dùng');

  const profile = user.profile || user;
  const kyc = user.studentVerification || user.kyc || profile.kyc || {};
  const emailLower = String(user.email || profile.email || '').toLowerCase().trim();
  const isEdu = emailLower.endsWith('@fpt.edu.vn') || emailLower.endsWith('@fe.edu.vn');

  let kycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'NONE';
  const statusUpper = String(kyc.status || '').toUpperCase();

  if (statusUpper === 'PENDING') {
    kycStatus = 'PENDING';
  } else if (statusUpper === 'REJECTED') {
    kycStatus = 'REJECTED';
  } else if (statusUpper === 'APPROVED' || isEdu) {
    kycStatus = 'APPROVED';
  }

  const role: 'BUYER' | 'SELLER' | 'ADMIN' = user.role === 'SELLER' ? 'SELLER' : 'BUYER';
  const isKycVerified = (kycStatus === 'APPROVED' || role === 'SELLER') && kycStatus !== 'PENDING';

  const rawBank = profile.bankAccount || user.bankAccount;
  const bankAccount = rawBank?.accountNo
    ? {
        bankName: rawBank.bankName || 'MB',
        accountNo: rawBank.accountNo || '',
        accountName: rawBank.accountName || profile.fullName || user.fullName || '',
      }
    : undefined;

  const isDummyAvatar = (url?: string | null) =>
    !url ||
    url.includes('photo-1535713875002-d1d0cf377fde') ||
    url.includes('photo-1534528741775-53994a69daeb') ||
    url.includes('photo-1570295999919-56ceb5ecca61');

  const rawAvatar =
    profile.avatarUrl ||
    user.avatarUrl ||
    profile.avatar ||
    user.avatar;

  const avatarUrl = rawAvatar && !isDummyAvatar(rawAvatar) ? rawAvatar : undefined;

  return {
    id: user.userId || user.id || profile.userId || profile.id,
    name: profile.fullName || user.fullName || user.email?.split('@')[0] || 'Sinh viên FPT',
    studentId: kyc.studentId || profile.studentId || user.studentId || '',
    email: user.email || profile.email || '',
    campus: fromBackendCampus(profile.campus || user.campus || 'HOL'),
    role,
    isKycVerified,
    kycStatus,
    cohort: profile.cohort || 'K17',
    major: profile.major || 'Kỹ thuật phần mềm (SE)',
    phone: profile.phoneNumber || profile.phone || '',
    roomNumber: profile.roomNumber || profile.dormRoom || '',
    bio: profile.bio || '',
    rating: profile.rating || 5.0,
    reputationPoints: user.reputationScore ?? profile.reputationScore ?? 100,
    coins: user.campusCoins ?? profile.campusCoins ?? 0,
    avatarUrl,
    avatarBadge: role === 'SELLER' ? 'TOP_SELLER' : undefined,
    bankAccount,
  };
};

const getAuthStore = () => {
  try {
    const { useAuthStore } = require('../stores/useAuthStore');
    return useAuthStore;
  } catch {
    return null;
  }
};

export const authMobileService = {
  /**
   * Đăng nhập qua API Backend
   */
  async login(creds: LoginCredentials): Promise<{ user: UserProfile; token: string }> {
    const res = await apiClient.post<ApiResponse<AuthBackendResponse>>('/auth/login', creds);
    const data = res.data.data;
    const token = data.tokens?.accessToken || '';
    const refreshToken = data.tokens?.refreshToken || '';
    const mobileUser = adaptBackendUserToMobile(data.user);

    if (token) {
      getAuthStore()?.getState()?.setAuth(mobileUser, token, refreshToken);
    }

    return { user: mobileUser, token };
  },

  /**
   * Bước 1: Gửi mã OTP đăng ký về Email sinh viên (Lưu tạm Redis, chưa lưu DB)
   */
  async sendRegisterOtp(data: {
    fullName: string;
    email: string;
    password: string;
    studentId?: string;
    campus?: string;
    phoneNumber?: string;
  }): Promise<{ email: string; requireOtp: boolean; message: string }> {
    const campusCode = mapCampusToCode(data.campus);
    const res = await apiClient.post<ApiResponse<any>>('/auth/send-register-otp', {
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      studentId: data.studentId?.trim().toUpperCase(),
      campus: campusCode,
      phoneNumber: data.phoneNumber?.trim() || undefined,
    });
    return res.data.data;
  },

  /**
   * Bước 2: Xác thực mã OTP 6 số và tạo tài khoản chính thức trong DB
   */
  async verifyRegisterOtp(data: {
    email: string;
    otp: string;
  }): Promise<{ user: UserProfile; token: string }> {
    const res = await apiClient.post<ApiResponse<AuthBackendResponse>>('/auth/verify-register-otp', {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
    });
    const resData = res.data.data;
    const token = resData.tokens?.accessToken || '';
    const refreshToken = resData.tokens?.refreshToken || '';
    const mobileUser = adaptBackendUserToMobile(resData.user);

    if (token) {
      getAuthStore()?.getState()?.setAuth(mobileUser, token, refreshToken);
    }

    return { user: mobileUser, token };
  },

  /**
   * Gửi lại mã OTP mới (sau khi hết cooldown 60s)
   */
  async resendRegisterOtp(email: string): Promise<{ email: string; message: string }> {
    const res = await apiClient.post<ApiResponse<any>>('/auth/resend-register-otp', {
      email: email.trim().toLowerCase(),
    });
    return res.data.data;
  },

  /**
   * Đăng nhập nhanh Google OAuth (@fpt.edu.vn)
   */
  async loginWithGoogle(
    idToken: string,
    campus?: string
  ): Promise<{ user: UserProfile; token: string }> {
    const campusCode = mapCampusToCode(campus);
    const res = await apiClient.post<ApiResponse<AuthBackendResponse>>('/auth/google', {
      idToken,
      campus: campusCode,
    });
    const resData = res.data.data;
    const token = resData.tokens?.accessToken || '';
    const refreshToken = resData.tokens?.refreshToken || '';
    const mobileUser = adaptBackendUserToMobile(resData.user);

    if (token) {
      getAuthStore()?.getState()?.setAuth(mobileUser, token, refreshToken);
    }

    return { user: mobileUser, token };
  },

  /**
   * Đăng ký tài khoản mới qua API Backend (Direct fallback)
   */
  async register(creds: RegisterCredentials): Promise<{ user: UserProfile; token: string }> {
    const res = await apiClient.post<ApiResponse<AuthBackendResponse>>('/auth/register', creds);
    const data = res.data.data;
    const token = data.tokens?.accessToken || '';
    const mobileUser = adaptBackendUserToMobile(data.user);

    if (token) {
      getAuthStore()?.getState()?.setAuth(mobileUser, token);
    }

    return { user: mobileUser, token };
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignored
    }
    const store = getAuthStore();
    if (store && store.setState) {
      store.setState({ user: null, token: null, isAuthenticated: false });
    }
  },

  /**
   * Lấy thông tin profile hiện tại từ /profile/me
   */
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<any>>('/profile/me');
    return adaptBackendUserToMobile(res.data.data);
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(payload: {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    const res = await apiClient.patch<ApiResponse<any>>('/auth/change-password', payload);
    return res.data?.data || { message: 'Đổi mật khẩu thành công!' };
  },

  /**
   * Quên mật khẩu - gửi OTP về email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<ApiResponse<any>>('/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });
    return res.data?.data || { message: 'Đã gửi mã OTP khôi phục về email của bạn.' };
  },

  /**
   * Đặt lại mật khẩu với mã OTP
   */
  async resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    const res = await apiClient.post<ApiResponse<any>>('/auth/reset-password', {
      email: payload.email.trim().toLowerCase(),
      otp: payload.otp.trim(),
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    });
    return res.data?.data || { message: 'Đặt lại mật khẩu thành công!' };
  },
};

/**
 * Map campus sang mã enum của Backend (HOL, HCM, DAD, QN, CT)
 */
export const mapCampusToCode = (campusName?: string): 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT' => {
  if (!campusName) return 'HOL';
  const c = campusName.toUpperCase();
  if (c.includes('HCM') || c.includes('HỒ CHÍ MINH') || c.includes('TP.HCM')) return 'HCM';
  if (c.includes('ĐÀ NẴNG') || c.includes('DANANG') || c.includes('DAD')) return 'DAD';
  if (c.includes('QUY NHƠN') || c.includes('QN')) return 'QN';
  if (c.includes('CẦN THƠ') || c.includes('CT')) return 'CT';
  return 'HOL';
};

export default authMobileService;
