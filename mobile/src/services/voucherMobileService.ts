import apiClient, { ApiResponse } from './apiClient';
import { UserVoucher } from '../stores/voucherStore';

export interface BackendVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount?: number;
  coinPrice?: number;
  expiresAt: string;
  isUsed?: boolean;
}

export function adaptBackendVoucher(v: any): UserVoucher {
  const voucherId = v.voucherId || v.id || v._id;
  const rawVoucher = v.voucher || v;

  return {
    id: v.id || v._id,
    userId: v.userId || 'acc_verified',
    voucherId,
    voucherCode: v.code || v.voucherCode || `FUV-${Math.floor(1000 + Math.random() * 9000)}`,
    status: v.status === 'USED' || v.isUsed ? 'USED' : 'UNUSED',
    voucher: {
      id: voucherId,
      title: rawVoucher.title || 'Voucher FPT Campus',
      description: rawVoucher.description || 'Áp dụng cho mọi giao dịch tại Campus',
      partner: rawVoucher.partner || 'CANTEEN',
      partnerLabel: rawVoucher.partnerLabel || 'FPT Campus',
      coinCost: rawVoucher.coinCost || 10,
      discountValue: rawVoucher.discountAmount || rawVoucher.discountValue || 10000,
      quantity: rawVoucher.quantity || 50,
      imageUrl: rawVoucher.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      validDays: rawVoucher.validDays || 30,
      isActive: true,
    },
    usedAt: v.usedAt,
    expiredAt: v.expiresAt || v.expiredAt || '30/11/2026',
    createdAt: v.createdAt || 'Vừa xong',
  };
}

export const voucherMobileService = {
  /**
   * Lấy danh sách Voucher công khai có thể đổi
   */
  async getVouchers(): Promise<UserVoucher[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/vouchers');
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map(adaptBackendVoucher);
      }
    } catch (e: any) {
      console.log('⚠️ [Backend Vouchers offline]:', e?.message);
    }
    return [];
  },

  /**
   * Lấy danh sách Voucher cá nhân của tôi
   */
  async getMyVouchers(): Promise<UserVoucher[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/vouchers/me');
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map(adaptBackendVoucher);
      }
    } catch (e: any) {
      console.log('⚠️ [Backend My Vouchers offline]:', e?.message);
    }
    return [];
  },

  /**
   * Đổi Voucher bằng Xu
   */
  async redeemVoucher(voucherId: string): Promise<UserVoucher> {
    const res = await apiClient.post<ApiResponse<any>>(`/vouchers/${voucherId}/redeem`);
    return adaptBackendVoucher(res.data.data);
  },
};

export default voucherMobileService;
