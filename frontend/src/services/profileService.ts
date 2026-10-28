import { apiClient, ApiResponse } from './apiClient';
import { useUserStore, UserProfile } from '@/stores/userStore';
import { adaptBackendUser, adaptBackendProduct } from '@/lib/adapters';
import { ProductItem } from '@/types/product';

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  dorm?: string;
  major?: string;
  cohort?: string;
  campus?: string;
}

export interface BankAccountPayload {
  bankName: string;
  accountNo?: string;
  accountNumber?: string;
  accountName?: string;
  accountHolder?: string;
}

export interface ProfileQuest {
  id: string;
  title: string;
  description: string;
  coins: number;
  conditionType?: string;
  cadence?: string;
  managedBy?: string;
  iconType: string;
  isCompleted: boolean;
  isClaimed: boolean;
  canClaim: boolean;
  resetAt?: string;
}

export const profileService = {
  // 1. Lấy thông tin tài khoản hiện tại & đồng bộ vào Zustand
  async getProfile(): Promise<UserProfile> {
    const token = useUserStore.getState().accessToken;
    if (!token) {
      return useUserStore.getState().user;
    }
    const response = await apiClient.get<ApiResponse<any>>('/profile/me');
    const userData = response.data.data;
    const profile = adaptBackendUser(userData);
    useUserStore.getState().setUser(profile);
    import('@/stores/walletStore').then(({ useWalletStore }) => {
      useWalletStore.setState({
        campusCoins: profile.coins,
        ...(profile.bankAccount?.accountNo ? { bankAccount: profile.bankAccount as any } : {}),
      });
    }).catch(() => {});
    return profile;
  },

  // 2. Cập nhật thông tin cá nhân
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const campusCodeMap: Record<string, string> = {
      'Hòa Lạc': 'HOL',
      'Hồ Chí Minh': 'HCM',
      'Đà Nẵng': 'DAD',
      'Quy Nhơn': 'QN',
      'Cần Thơ': 'CT',
      hola: 'HOL',
      hcm: 'HCM',
      dn: 'DAD',
      qn: 'QN',
      ct: 'CT',
    };
    const body = {
      ...payload,
      phoneNumber: payload.phone || (payload as any).phoneNumber,
      ...(payload.campus ? { campus: campusCodeMap[payload.campus] || payload.campus } : {}),
    };
    const response = await apiClient.patch<ApiResponse<any>>('/profile/me', body);
    const userData = response.data.data;
    const profile = adaptBackendUser(userData);
    useUserStore.getState().setUser(profile);
    return profile;
  },

  // 3. Cập nhật tài khoản ngân hàng nhận tiền
  async updateBankAccount(payload: BankAccountPayload): Promise<any> {
    const body = {
      bankName: payload.bankName,
      accountNo: payload.accountNo || payload.accountNumber,
      accountName: payload.accountName || payload.accountHolder,
    };
    const response = await apiClient.patch<ApiResponse<any>>('/profile/bank-account', body);
    return response.data.data;
  },

  // 4. Upload thẻ sinh viên xác thực KYC (Hỗ trợ cả JSON payload hoặc FormData)
  async submitStudentKyc(payload: {
    studentId: string;
    cardImageUrl?: string;
    cardBackUrl?: string;
    selfieCardUrl?: string;
    fullName?: string;
    campus?: string;
    cohort?: string;
    major?: string;
    phoneNumber?: string;
  } | FormData): Promise<any> {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const response = await apiClient.post<ApiResponse<any>>(
      '/profile/kyc/student-card',
      payload,
      isFormData ? undefined : { headers: { 'Content-Type': 'application/json' } }
    );
    const result = response.data.data;
    useUserStore.getState().setKycStatus('pending', 'student');
    return result;
  },

  // 4b. Nộp hồ sơ Onboarding Người Bán (Seller)
  async submitSellerOnboarding(payload: any): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/seller-onboarding', payload);
    const result = response.data.data;
    useUserStore.getState().setKycStatus('pending', 'seller');
    return result;
  },

  // 5. Lấy danh sách tin đăng của bản thân
  async getMyPosts(params?: { page?: number; limit?: number; status?: string }): Promise<{
    items: ProductItem[];
    meta?: any;
  }> {
    const response = await apiClient.get<ApiResponse<any[]>>('/products/me', {
      params,
    });
    const items = (response.data.data || []).map(adaptBackendProduct);
    return {
      items,
      meta: response.data.meta,
    };
  },

  // 6. Kiểm tra trạng thái điểm danh hôm nay
  async getCheckInStatus(): Promise<{
    dailyCheckedIn: boolean;
    todayDate: string;
    coinsPerCheckIn: number;
    totalCheckIns: number;
    streakDays: number;
    lastCheckInAt?: string | null;
  }> {
    const response = await apiClient.get<ApiResponse<any>>('/profile/check-in-status');
    const data = response.data.data;
    if (data?.dailyCheckedIn) {
      useUserStore.getState().updateProfile({ dailyCheckedIn: true });
    }
    return data;
  },

  // 7. Điểm danh nhận Xu hàng ngày (+20 Xu)
  async checkInDaily(): Promise<{
    success: boolean;
    coinsAdded: number;
    newBalance: number;
    dateStr: string;
  }> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/check-in');
    const result = response.data.data;
    if (result?.success) {
      useUserStore.getState().updateProfile({
        dailyCheckedIn: true,
        coins: result.newBalance,
      });
    }
    return result;
  },

  // 8. Nhận thưởng nhiệm vụ tuần
  async getPublicQuests(): Promise<ProfileQuest[]> {
    const response = await apiClient.get<ApiResponse<ProfileQuest[]>>('/profile/quests/public');
    return response.data.data || [];
  },

  async getQuests(): Promise<ProfileQuest[]> {
    const response = await apiClient.get<ApiResponse<ProfileQuest[]>>('/profile/quests');
    return response.data.data || [];
  },

  async claimQuest(questId: string): Promise<{
    success: boolean;
    coinsAdded: number;
    newBalance: number;
    questId: string;
  }> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/claim-quest', { questId });
    const result = response.data.data;
    if (result?.success) {
      useUserStore.getState().updateProfile({ coins: result.newBalance });
    }
    return result;
  },

  // 9. Tạo yêu cầu rút tiền về tài khoản ngân hàng
  async createWithdrawal(amount: number): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/withdrawals', { amount });
    return response.data.data;
  },

  // 10. Danh sách các lệnh rút tiền của người dùng
  async getWithdrawals(page: number = 1, limit: number = 20): Promise<{ requests: any[]; pagination: any }> {
    const response = await apiClient.get<ApiResponse<any>>(`/profile/withdrawals?page=${page}&limit=${limit}`);
    return {
      requests: response.data.data || [],
      pagination: (response.data as any).pagination || { total: 0, page: 1, limit: 20 },
    };
  },

  // 11. Lịch sử biến động Xu từ Backend
  async getCoinHistory(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/profile/coins/history');
    return response.data?.data || [];
  },

  // 12. Mua huy hiệu avatar bằng Xu
  async buyAvatarBadge(badgeId: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/badges/buy', { badgeId });
    return response.data?.data;
  },
};

