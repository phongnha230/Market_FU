import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VoucherPartner = 'CANTEEN' | 'PASSIO' | 'SEVEN_ELEVEN' | 'OTHER';
export type UserVoucherStatus = 'UNUSED' | 'USED' | 'EXPIRED';

export interface Voucher {
  id: string;
  title: string;
  description: string;
  partner: VoucherPartner;
  partnerLabel: string;
  coinCost: number;
  discountValue: number;
  quantity: number;
  imageUrl: string;
  validDays: number;
  isActive: boolean;
}

export interface UserVoucher {
  id: string;
  userId: string;
  voucherId: string;
  voucher: Voucher;
  voucherCode: string;
  status: UserVoucherStatus;
  usedAt?: string;
  expiredAt: string;
  createdAt: string;
}

interface VoucherState {
  availableVouchers: Voucher[];
  myVouchers: UserVoucher[];
  isLoading: boolean;
  redeemVoucher: (voucherId: string) => Promise<{ success: boolean; message: string; voucher?: UserVoucher }>;
  useVoucherCode: (userVoucherIdOrCode: string) => Promise<{ success: boolean; message: string }>;
  getUserVouchersByStatus: (status?: UserVoucherStatus) => UserVoucher[];
  getAvailableByPartner: (partner?: VoucherPartner) => Voucher[];
  resetVouchers: () => void;
}

export const INITIAL_AVAILABLE_VOUCHERS: Voucher[] = [
  {
    id: 'vch-canteen-10k',
    title: 'Voucher Cơm Căn Tin 10.000đ',
    description: 'Áp dụng cho mọi suất cơm trưa/tối tại Căng-tin Tòa Gamma (Hola) và Canteen Q.9 (HCM).',
    partner: 'CANTEEN',
    partnerLabel: 'Căn Tin FPT',
    coinCost: 10,
    discountValue: 10000,
    quantity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    validDays: 14,
    isActive: true,
  },
  {
    id: 'vch-passio-15k',
    title: 'Giảm 15.000đ Passio Coffee Campus',
    description: 'Áp dụng cho mọi món nước Cà phê sữa, Trà đào hạt sen size L tại quầy Passio trong trường.',
    partner: 'PASSIO',
    partnerLabel: 'Passio Coffee',
    coinCost: 15,
    discountValue: 15000,
    quantity: 120,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    validDays: 30,
    isActive: true,
  },
  {
    id: 'vch-7eleven-20k',
    title: 'Phiếu Mua Hàng 20.000đ 7-Eleven KTX',
    description: 'Giảm trực tiếp khi mua bánh mì, xúc xích nướng, đồ uống giải khát tại 7-Eleven sảnh KTX.',
    partner: 'SEVEN_ELEVEN',
    partnerLabel: '7-Eleven FPT',
    coinCost: 20,
    discountValue: 20000,
    quantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    validDays: 20,
    isActive: true,
  },
  {
    id: 'vch-ship-free',
    title: 'Miễn Phí Vận Chuyển CampusShip',
    description: 'Trợ giá 100% cước giao hàng nội bộ giữa các KTX và liên Campus FPT toàn quốc.',
    partner: 'OTHER',
    partnerLabel: 'CampusShip Express',
    coinCost: 25,
    discountValue: 25000,
    quantity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    validDays: 45,
    isActive: true,
  },
];

export const INITIAL_USER_VOUCHERS: UserVoucher[] = [
  {
    id: 'uv-1',
    userId: 'acc_verified',
    voucherId: 'vch-canteen-10k',
    voucher: INITIAL_AVAILABLE_VOUCHERS[0],
    voucherCode: 'FUV-CANT-8921A',
    status: 'UNUSED',
    expiredAt: '30/10/2026',
    createdAt: 'Hôm qua',
  },
  {
    id: 'uv-2',
    userId: 'acc_verified',
    voucherId: 'vch-passio-15k',
    voucher: INITIAL_AVAILABLE_VOUCHERS[1],
    voucherCode: 'FUV-PASS-9938B',
    status: 'USED',
    usedAt: '15:20 - 18/09/2026',
    expiredAt: '30/10/2026',
    createdAt: '3 ngày trước',
  },
];

export const useVoucherStore = create<VoucherState>()(
  persist(
    (set, get) => ({
      availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
      myVouchers: INITIAL_USER_VOUCHERS,
      isLoading: false,

      redeemVoucher: async (voucherId: string) => {
        const item = get().availableVouchers.find((v) => v.id === voucherId);
        if (!item) return { success: false, message: 'Voucher không tồn tại' };
        if (item.quantity <= 0) return { success: false, message: 'Voucher đã hết số lượng' };

        const randomCode = `FUV-${item.partner.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUV: UserVoucher = {
          id: `uv-${Date.now()}`,
          userId: 'me',
          voucherId: item.id,
          voucher: item,
          voucherCode: randomCode,
          status: 'UNUSED',
          expiredAt: '30/11/2026',
          createdAt: 'Vừa xong',
        };

        set((state) => ({
          availableVouchers: state.availableVouchers.map((v) =>
            v.id === voucherId ? { ...v, quantity: Math.max(0, v.quantity - 1) } : v
          ),
          myVouchers: [newUV, ...state.myVouchers],
        }));

        return {
          success: true,
          message: `Đổi voucher ${item.title} thành công!`,
          voucher: newUV,
        };
      },

      useVoucherCode: async (userVoucherIdOrCode: string) => {
        const target = get().myVouchers.find(
          (uv) => uv.id === userVoucherIdOrCode || uv.voucherCode === userVoucherIdOrCode
        );
        if (!target) return { success: false, message: 'Mã voucher không hợp lệ' };
        if (target.status === 'USED') return { success: false, message: 'Voucher này đã được sử dụng' };

        set((state) => ({
          myVouchers: state.myVouchers.map((uv) =>
            uv.id === target.id
              ? { ...uv, status: 'USED', usedAt: 'Vừa xong' }
              : uv
          ),
        }));

        return { success: true, message: 'Áp dụng voucher thành công!' };
      },

      getUserVouchersByStatus: (status) => {
        const list = get().myVouchers;
        if (!status) return list;
        return list.filter((v) => v.status === status);
      },

      getAvailableByPartner: (partner) => {
        const list = get().availableVouchers;
        if (!partner) return list;
        return list.filter((v) => v.partner === partner);
      },

      resetVouchers: () => {
        set({
          availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
          myVouchers: INITIAL_USER_VOUCHERS,
        });
      },
    }),
    {
      name: 'fu_mobile_voucher_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
