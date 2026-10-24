import { apiClient, ApiResponse } from './apiClient';

export type VoucherPartner = 'CANTEEN' | 'PASSIO' | 'SEVEN_ELEVEN' | 'CAMPUS_SHIP' | 'OTHER';
export type UserVoucherStatus = 'UNUSED' | 'USED' | 'EXPIRED';

export interface BackendVoucher {
  id: string;
  title: string;
  description?: string | null;
  partner: VoucherPartner;
  coinCost: number;
  discountValue: number;
  minOrderValue?: number;
  quantity: number;
  imageUrl?: string | null;
  validDays: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendUserVoucher {
  id: string;
  userId: string;
  voucherId: string;
  voucherCode: string;
  status: UserVoucherStatus;
  usedAt?: string | null;
  expiredAt: string;
  voucher: BackendVoucher;
  createdAt?: string;
}

export interface BackendQuest {
  id: string;
  questCode: string;
  title: string;
  description: string;
  rewardCoins: number;
  conditionType: 'DAILY_CHECKIN' | 'APPROVED_KYC' | 'CREATED_LISTING' | 'COMPLETED_REVIEW' | 'COMPLETED_SAFE_HANDOFF';
  cadence: 'ONCE' | 'DAILY' | 'WEEKLY';
  isActive: boolean;
  iconType: string;
  managedBy: string;
  claimsThisCycle?: number;
}

export interface QueryVouchersParams {
  partner?: VoucherPartner;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface QueryUserVouchersParams {
  status?: UserVoucherStatus;
  page?: number;
  limit?: number;
}

export const voucherService = {
  // 1. Lấy danh sách Voucher công khai trong kho đổi thưởng
  async getVouchers(params?: QueryVouchersParams): Promise<{
    vouchers: BackendVoucher[];
    pagination?: any;
  }> {
    const response = await apiClient.get<ApiResponse<BackendVoucher[]>>('/vouchers', {
      params,
    });
    return {
      vouchers: response.data?.data || [],
      pagination: response.data?.meta,
    };
  },

  async getQuestsAdmin(): Promise<BackendQuest[]> {
    const response = await apiClient.get<ApiResponse<BackendQuest[]>>('/profile/admin/quests');
    return response.data.data || [];
  },

  async createQuest(payload: Omit<BackendQuest, 'id' | 'questCode'>): Promise<BackendQuest> {
    const response = await apiClient.post<ApiResponse<BackendQuest>>('/profile/admin/quests', payload);
    return response.data.data;
  },

  async updateQuest(questCode: string, payload: Partial<Omit<BackendQuest, 'id' | 'questCode'>>): Promise<BackendQuest> {
    const response = await apiClient.patch<ApiResponse<BackendQuest>>(`/profile/admin/quests/${encodeURIComponent(questCode)}`, payload);
    return response.data.data;
  },

  // 2. Chi tiết 1 voucher
  async getVoucherById(id: string): Promise<BackendVoucher> {
    const response = await apiClient.get<ApiResponse<BackendVoucher>>(`/vouchers/${id}`);
    return response.data?.data;
  },

  // 3. Đổi Xu lấy Voucher (Tạo bản ghi UserVoucher)
  async redeemVoucher(voucherId: string): Promise<{
    message: string;
    userVoucher: BackendUserVoucher;
    remainingCoins: number;
  }> {
    const response = await apiClient.post<ApiResponse<any>>(`/vouchers/${voucherId}/redeem`);
    return response.data.data;
  },

  // 4. Lấy danh sách Voucher cá nhân đã đổi
  async getMyVouchers(params?: QueryUserVouchersParams): Promise<{
    userVouchers: BackendUserVoucher[];
    pagination?: any;
  }> {
    const response = await apiClient.get<ApiResponse<BackendUserVoucher[]>>('/vouchers/me', {
      params,
    });
    return {
      userVouchers: response.data.data || [],
      pagination: response.data.meta,
    };
  },

  // 5. Xác nhận sử dụng Voucher tại quầy
  async useVoucher(voucherCode: string): Promise<{
    message: string;
    voucher: {
      voucherCode: string;
      title: string;
      partner: string;
      discountValue: number;
      usedAt: string;
    };
  }> {
    const response = await apiClient.post<ApiResponse<any>>('/vouchers/use', {
      voucherCode,
    });
    return response.data.data;
  },

  // 6. Admin tạo mới voucher
  async createVoucher(payload: {
    title: string;
    description?: string;
    partner: VoucherPartner;
    coinCost: number;
    discountValue: number;
    minOrderValue?: number;
    quantity?: number;
    imageUrl?: string;
    validDays?: number;
  }): Promise<BackendVoucher> {
    const response = await apiClient.post<ApiResponse<BackendVoucher>>('/vouchers', payload);
    return response.data.data;
  },

  // 7. Admin cập nhật voucher
  async updateVoucher(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      partner: VoucherPartner;
      coinCost: number;
      discountValue: number;
      minOrderValue?: number;
      quantity: number;
      isActive: boolean;
    }>
  ): Promise<BackendVoucher> {
    const response = await apiClient.patch<ApiResponse<BackendVoucher>>(`/vouchers/${id}`, payload);
    return response.data.data;
  },

  // 8. Admin xóa voucher
  async deleteVoucher(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ApiResponse<any>>(`/vouchers/${id}`);
    return response.data.data;
  },
};
