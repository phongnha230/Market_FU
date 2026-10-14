import apiClient, { ApiResponse } from './apiClient';
import type {
  Voucher,
  UserVoucher,
  VoucherPartner,
  UserVoucherStatus,
} from '../stores/voucherStore';

export interface BackendVoucher {
  id: string;
  title: string;
  description?: string | null;
  partner: VoucherPartner;
  coinCost: number;
  discountValue: number;
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

export function mapPartnerLabel(partner: VoucherPartner): string {
  switch (partner) {
    case 'CANTEEN':
      return 'Căn Tin FPT';
    case 'PASSIO':
      return 'Passio Coffee';
    case 'SEVEN_ELEVEN':
      return '7-Eleven FPT';
    case 'OTHER':
    default:
      return 'CampusShip Express';
  }
}

export function adaptBackendVoucher(bv: any): Voucher {
  const partner: VoucherPartner = bv.partner || 'CANTEEN';
  return {
    id: bv.id || bv._id,
    title: bv.title || 'Voucher FPT Campus',
    description: bv.description || 'Áp dụng tại điểm dịch vụ đối tác Campus FPT',
    partner,
    partnerLabel: bv.partnerLabel || mapPartnerLabel(partner),
    coinCost: Number(bv.coinCost ?? 10),
    discountValue: Number(bv.discountValue ?? 10000),
    quantity: Number(bv.quantity ?? 50),
    imageUrl:
      bv.imageUrl ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    validDays: Number(bv.validDays ?? 30),
    isActive: bv.isActive !== false,
  };
}

export function adaptBackendUserVoucher(buv: any): UserVoucher {
  const rawVoucher = buv.voucher || buv;
  const voucher = adaptBackendVoucher(rawVoucher);

  let formattedExpiredAt = '30/11/2026';
  if (buv.expiredAt) {
    try {
      const d = new Date(buv.expiredAt);
      formattedExpiredAt = isNaN(d.getTime()) ? buv.expiredAt : d.toLocaleDateString('vi-VN');
    } catch {
      formattedExpiredAt = buv.expiredAt;
    }
  }

  let formattedUsedAt: string | undefined = undefined;
  if (buv.usedAt) {
    try {
      const d = new Date(buv.usedAt);
      formattedUsedAt = isNaN(d.getTime()) ? buv.usedAt : d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      formattedUsedAt = buv.usedAt;
    }
  }

  return {
    id: buv.id || buv._id,
    userId: buv.userId || '',
    voucherId: buv.voucherId || voucher.id,
    voucher,
    voucherCode: buv.voucherCode || `FUV-${voucher.partner.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: (buv.status as UserVoucherStatus) || 'UNUSED',
    usedAt: formattedUsedAt,
    expiredAt: formattedExpiredAt,
    createdAt: buv.createdAt ? new Date(buv.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
  };
}

export const voucherMobileService = {
  /**
   * 1. Lấy danh sách Voucher công khai trong kho đổi thưởng (đồng bộ trực tiếp API backend)
   */
  async getVouchers(params?: { partner?: string; search?: string; isActive?: boolean }): Promise<Voucher[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/vouchers', {
        params: { isActive: true, limit: 50, ...params },
      });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data.map(adaptBackendVoucher);
      }
    } catch (e: any) {
      console.log('⚠️ [Backend Vouchers offline/fallback]:', e?.message);
    }
    return [];
  },

  /**
   * 2. Lấy danh sách Voucher cá nhân của tôi (đã đổi hoặc lưu)
   */
  async getMyVouchers(params?: { status?: UserVoucherStatus }): Promise<UserVoucher[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/vouchers/me', {
        params: { limit: 50, ...params },
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map(adaptBackendUserVoucher);
      }
    } catch (e: any) {
      console.log('⚠️ [Backend My Vouchers offline/fallback]:', e?.message);
    }
    return [];
  },

  /**
   * 3. Sinh viên đổi Campus Coins lấy Voucher (Atomic Transaction trên Server)
   */
  async redeemVoucher(voucherId: string): Promise<{
    message: string;
    userVoucher: UserVoucher;
    remainingCoins?: number;
  }> {
    const res = await apiClient.post<ApiResponse<any>>(`/vouchers/${voucherId}/redeem`);
    const rawData = res.data?.data;
    const userVoucher = adaptBackendUserVoucher(rawData?.userVoucher || rawData);
    return {
      message: rawData?.message || 'Đổi voucher thành công!',
      userVoucher,
      remainingCoins: rawData?.remainingCoins,
    };
  },

  /**
   * 4. Quét mã / Xác nhận sử dụng Voucher tại quầy
   */
  async useVoucher(voucherCode: string): Promise<{ message: string; voucher?: any }> {
    const res = await apiClient.post<ApiResponse<any>>('/vouchers/use', {
      voucherCode: voucherCode.trim().toUpperCase(),
    });
    return {
      message: res.data?.data?.message || 'Xác nhận sử dụng voucher thành công!',
      voucher: res.data?.data?.voucher,
    };
  },
};

export default voucherMobileService;
