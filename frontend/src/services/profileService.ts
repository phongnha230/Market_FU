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
}

export interface BankAccountPayload {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export const profileService = {
  // 1. Lấy thông tin tài khoản hiện tại & đồng bộ vào Zustand
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<ApiResponse<any>>('/profile/me');
    const userData = response.data.data;
    const profile = adaptBackendUser(userData);
    useUserStore.getState().setUser(profile);
    return profile;
  },

  // 2. Cập nhật thông tin cá nhân
  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.patch<ApiResponse<any>>('/profile/me', payload);
    const userData = response.data.data;
    const profile = adaptBackendUser(userData);
    useUserStore.getState().setUser(profile);
    return profile;
  },

  // 3. Cập nhật tài khoản ngân hàng nhận tiền
  async updateBankAccount(payload: BankAccountPayload): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>('/users/me/bank-account', payload);
    return response.data.data;
  },

  // 4. Upload thẻ sinh viên xác thực KYC (Multipart/form-data)
  async submitStudentKyc(formData: FormData): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/kyc/student-card', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const result = response.data.data;
    useUserStore.getState().setKycStatus('pending');
    return result;
  },

  // 5. Lấy danh sách tin đăng của bản thân
  async getMyPosts(params?: { page?: number; limit?: number; status?: string }): Promise<{
    items: ProductItem[];
    meta?: any;
  }> {
    const response = await apiClient.get<ApiResponse<any[]>>('/profile/my-posts', {
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
  async claimQuest(questId: string, amount: number = 20): Promise<{
    success: boolean;
    coinsAdded: number;
    newBalance: number;
    questId: string;
  }> {
    const response = await apiClient.post<ApiResponse<any>>('/profile/claim-quest', {
      questId,
      amount,
    });
    const result = response.data.data;
    if (result?.success) {
      const currentClaimed = useUserStore.getState().user.claimedQuestIds || [];
      useUserStore.getState().updateProfile({
        coins: result.newBalance,
        claimedQuestIds: [...currentClaimed, questId],
      });
    }
    return result;
  },
};

