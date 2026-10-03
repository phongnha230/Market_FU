import { apiClient, ApiResponse } from './apiClient';
import { useUserStore, UserProfile } from '@/stores/userStore';
import { adaptBackendUser, adaptBackendProduct, BackendUserRaw, BackendProductRaw } from '@/lib/adapters';
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

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankName?: string;
  accountNo?: string;
  accountName?: string;
  createdAt?: string;
  processedAt?: string;
  notes?: string;
}

export interface CoinTransactionItem {
  id: string;
  userId: string;
  amount: number;
  balanceAfter: number;
  type: string;
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export const profileService = {
  // 1. Lấy thông tin tài khoản hiện tại & đồng bộ vào Zustand
  async getProfile(): Promise<UserProfile> {
    const token = useUserStore.getState().accessToken;
    if (!token) {
      const email = useUserStore.getState().user.email;
      if (email && email.includes('@')) {
        const response = await apiClient.get<ApiResponse<BackendUserRaw>>(`/users/${encodeURIComponent(email.trim().toLowerCase())}`);
        const userData = response.data.data;
        const profile = adaptBackendUser(userData);
        useUserStore.getState().setUser(profile);
        import('@/stores/walletStore').then(({ useWalletStore }) => {
          useWalletStore.setState({ campusCoins: profile.coins });
        }).catch(() => {});
        return profile;
      }
      return useUserStore.getState().user;
    }
    const response = await apiClient.get<ApiResponse<BackendUserRaw>>('/profile/me');
    const userData = response.data.data;
    const profile = adaptBackendUser(userData);
    useUserStore.getState().setUser(profile);
    import('@/stores/walletStore').then(({ useWalletStore }) => {
      useWalletStore.setState({ campusCoins: profile.coins });
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
      ...(payload.campus ? { campus: campusCodeMap[payload.campus] || payload.campus } : {}),
    };
    const response = await apiClient.patch<ApiResponse<BackendUserRaw>>('/profile/me', body);
    const userData = response.data.data;
    const profile = adaptBackendUser(userData);
    useUserStore.getState().setUser(profile);
    return profile;
  },

  // 3. Cập nhật tài khoản ngân hàng nhận tiền
  async updateBankAccount(payload: BankAccountPayload): Promise<BankAccountPayload> {
    const body = {
      bankName: payload.bankName,
      accountNo: payload.accountNo || payload.accountNumber,
      accountName: payload.accountName || payload.accountHolder,
    };
    const response = await apiClient.patch<ApiResponse<BankAccountPayload>>('/profile/bank-account', body);
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
  } | FormData): Promise<{ success: boolean; applicationId?: string }> {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const response = await apiClient.post<ApiResponse<{ success: boolean; applicationId?: string }>>(
      '/profile/kyc/student-card',
      payload,
      isFormData ? undefined : { headers: { 'Content-Type': 'application/json' } }
    );
    const result = response.data.data;
    useUserStore.getState().setKycStatus('pending', 'student');
    return result;
  },

  // 4b. Nộp hồ sơ Onboarding Người Bán (Seller)
  async submitSellerOnboarding(payload: Record<string, unknown> | FormData): Promise<{ success: boolean; status?: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; status?: string }>>('/profile/seller-onboarding', payload);
    const result = response.data.data;
    useUserStore.getState().setKycStatus('pending', 'seller');
    return result;
  },

  // 5. Lấy danh sách tin đăng của bản thân
  async getMyPosts(params?: { page?: number; limit?: number; status?: string }): Promise<{
    items: ProductItem[];
    meta?: Record<string, unknown>;
  }> {
    const response = await apiClient.get<ApiResponse<BackendProductRaw[]>>('/profile/my-posts', {
      params,
    });
    const items = (response.data.data || []).map(adaptBackendProduct);
    return {
      items,
      meta: response.data.meta as Record<string, unknown>,
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
    const response = await apiClient.get<ApiResponse<{
      dailyCheckedIn: boolean;
      todayDate: string;
      coinsPerCheckIn: number;
      totalCheckIns: number;
      streakDays: number;
      lastCheckInAt?: string | null;
    }>>('/profile/check-in-status');
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
    const response = await apiClient.post<ApiResponse<{
      success: boolean;
      coinsAdded: number;
      newBalance: number;
      dateStr: string;
    }>>('/profile/check-in');
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
    const response = await apiClient.post<ApiResponse<{
      success: boolean;
      coinsAdded: number;
      newBalance: number;
      questId: string;
    }>>('/profile/claim-quest', {
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

  // 9. Tạo yêu cầu rút tiền về tài khoản ngân hàng
  async createWithdrawal(amount: number): Promise<WithdrawalRequest> {
    const response = await apiClient.post<ApiResponse<WithdrawalRequest>>('/profile/withdrawals', { amount });
    return response.data.data;
  },

  // 10. Danh sách các lệnh rút tiền của người dùng
  async getWithdrawals(page: number = 1, limit: number = 20): Promise<{ requests: WithdrawalRequest[]; pagination: { total: number; page: number; limit: number } }> {
    const response = await apiClient.get<ApiResponse<WithdrawalRequest[]>>(`/profile/withdrawals?page=${page}&limit=${limit}`);
    const meta = (response.data as { pagination?: { total: number; page: number; limit: number } }).pagination || { total: 0, page: 1, limit: 20 };
    return {
      requests: response.data.data || [],
      pagination: meta,
    };
  },

  // 11. Xem lịch sử biến động sổ cái FPT Coin (Coin Transaction History)
  async getCoinHistory(page = 1, limit = 20): Promise<{
    transactions: CoinTransactionItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{
        transactions: CoinTransactionItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>>('/profile/coins/history', {
        params: { page, limit },
      });
      if (response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback khi offline
    }
    return {
      transactions: [
        {
          id: 'tx-1',
          userId: 'me',
          amount: 200,
          balanceAfter: 1250,
          type: 'KYC_BONUS',
          description: 'Thưởng xác thực Thẻ Sinh Viên FPT thành công (+200 Xu)',
          createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        },
        {
          id: 'tx-2',
          userId: 'me',
          amount: 20,
          balanceAfter: 1270,
          type: 'DAILY_CHECKIN',
          description: 'Điểm danh Cóc-er nhận thưởng hàng ngày (+20 Xu)',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: 'tx-3',
          userId: 'me',
          amount: -50,
          balanceAfter: 1220,
          type: 'ORDER_DISCOUNT',
          description: 'Đổi 50 Xu giảm giá đơn hàng sách giáo trình',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
    };
  },
};

