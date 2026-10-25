import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useWalletStore } from './walletStore';
import { voucherService, BackendVoucher, BackendUserVoucher } from '@/services/voucherService';

export type VoucherPartner = 'CANTEEN' | 'PASSIO' | 'SEVEN_ELEVEN' | 'CAMPUS_SHIP' | 'OTHER';
export type UserVoucherStatus = 'UNUSED' | 'USED' | 'EXPIRED';

export interface Voucher {
  id: string;
  title: string;
  description: string;
  partner: VoucherPartner;
  partnerLabel: string;
  coinCost: number; // Số xu cần đổi (VD: 50 Xu)
  discountValue: number; // Giá trị giảm VNĐ (VD: 15.000đ)
  minOrderValue?: number; // Đơn tối thiểu áp dụng (VD: 100.000đ, 0 là mọi đơn)
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
  voucherCode: string; // VD: FUV-PASSIO-8A3F2C
  status: UserVoucherStatus;
  usedAt?: string;
  expiredAt: string;
  createdAt: string;
}

interface VoucherState {
  availableVouchers: Voucher[];
  myVouchersByUser: Record<string, UserVoucher[]>;
  activeUserId: string | null;
  myVouchers: UserVoucher[];
  isLoading: boolean;

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchAvailableVouchers: () => Promise<void>;
  fetchMyVouchers: () => Promise<void>;
  redeemVoucher: (voucherId: string) => Promise<{ success: boolean; message: string; voucher?: UserVoucher }>;
  useVoucherCode: (userVoucherIdOrCode: string) => Promise<{ success: boolean; message: string }>;
  restoreVoucherCode: (userVoucherIdOrCode: string) => Promise<{ success: boolean; message: string }>;
  getUserVouchersByStatus: (status?: UserVoucherStatus) => UserVoucher[];
  getAvailableByPartner: (partner?: VoucherPartner) => Voucher[];
  resetVouchers: () => void;
}

const mapPartnerLabel = (partner: VoucherPartner): string => {
  switch (partner) {
    case 'CANTEEN':
      return 'Căn Tin FPT';
    case 'PASSIO':
      return 'Passio Coffee';
    case 'SEVEN_ELEVEN':
      return '7-Eleven FPT';
    case 'CAMPUS_SHIP':
      return 'FPT CampusShip';
    case 'OTHER':
    default:
      return 'Đối Tác Campus';
  }
};

const mapBackendVoucher = (bv: BackendVoucher): Voucher => ({
  id: bv.id,
  title: bv.title,
  description: bv.description || '',
  partner: bv.partner,
  partnerLabel: mapPartnerLabel(bv.partner),
  coinCost: bv.coinCost,
  discountValue: bv.discountValue,
  minOrderValue: bv.minOrderValue ?? 0,
  quantity: bv.quantity,
  imageUrl: bv.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  validDays: bv.validDays,
  isActive: bv.isActive,
});

const mapBackendUserVoucher = (buv: BackendUserVoucher): UserVoucher => ({
  id: buv.id,
  userId: buv.userId,
  voucherId: buv.voucherId,
  voucher: mapBackendVoucher(buv.voucher),
  voucherCode: buv.voucherCode,
  status: buv.status,
  usedAt: buv.usedAt ? new Date(buv.usedAt).toLocaleString('vi-VN') : undefined,
  expiredAt: new Date(buv.expiredAt).toLocaleDateString('vi-VN'),
  createdAt: buv.createdAt ? new Date(buv.createdAt).toLocaleDateString('vi-VN') : 'Gần đây',
});

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
    partner: 'CAMPUS_SHIP',
    partnerLabel: 'FPT CampusShip',
    coinCost: 25,
    discountValue: 25000,
    quantity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    validDays: 45,
    isActive: true,
  },
];

export const INITIAL_USER_VOUCHERS: UserVoucher[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useVoucherStore = create<VoucherState>()(
  persist(
    (set, get) => ({
      availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
      myVouchersByUser: {},
      activeUserId: null,
      myVouchers: [],
      isLoading: false,

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim() : null;
        const state = get();
        const userVouchers = uId && state.myVouchersByUser[uId] ? state.myVouchersByUser[uId] : [];
        set({
          activeUserId: uId,
          myVouchers: userVouchers,
        });
      },

      // 1. Tải danh sách Voucher từ Backend
      fetchAvailableVouchers: async () => {
        try {
          set({ isLoading: true });
          const res = await voucherService.getVouchers({ isActive: true, limit: 50 });
          if (res.vouchers) {
            set({ availableVouchers: res.vouchers.map(mapBackendVoucher) });
          }
        } catch (error) {
          console.warn('⚠️ [VoucherStore] Không thể tải voucher từ server, dùng cache offline');
        } finally {
          set({ isLoading: false });
        }
      },

      // 2. Tải danh sách Voucher đã đổi của tôi từ Backend
      fetchMyVouchers: async () => {
        try {
          const res = await voucherService.getMyVouchers({ limit: 50 });
          if (res.userVouchers) {
            const mapped = res.userVouchers.map(mapBackendUserVoucher);
            const activeUid = get().activeUserId;
            set((state) => ({
              myVouchers: mapped,
              myVouchersByUser: activeUid
                ? { ...state.myVouchersByUser, [activeUid]: mapped }
                : state.myVouchersByUser,
            }));
          }
        } catch (error) {
          console.warn('⚠️ [VoucherStore] Không thể tải ví voucher cá nhân từ server, dùng cache offline');
        }
      },

      // 3. Đổi voucher bằng Campus Coins qua API Backend
      redeemVoucher: async (voucherId) => {
        try {
          const res = await voucherService.redeemVoucher(voucherId);
          const mappedVoucher = mapBackendUserVoucher(res.userVoucher);

          // Cập nhật số dư Xu trong walletStore và userStore
          const { useUserStore } = await import('./userStore');
          const remainingCoins = res.remainingCoins ?? Math.max(0, (useUserStore.getState().user.coins || 0) - mappedVoucher.voucher.coinCost);
          useWalletStore.setState({ campusCoins: remainingCoins });
          useUserStore.getState().updateProfile({ coins: remainingCoins });

          const activeUid = get().activeUserId || 'guest';
          const updatedMyVouchers = [mappedVoucher, ...get().myVouchers];

          // Thêm voucher mới đổi vào danh sách myVouchers
          set((state) => ({
            availableVouchers: state.availableVouchers.map((v) =>
              v.id === voucherId ? { ...v, quantity: Math.max(0, v.quantity - 1) } : v
            ),
            myVouchers: updatedMyVouchers,
            myVouchersByUser: {
              ...state.myVouchersByUser,
              [activeUid]: updatedMyVouchers,
            },
          }));

          return {
            success: true,
            message: res.message || `Đổi thành công "${mappedVoucher.voucher.title}"!`,
            voucher: mappedVoucher,
          };
        } catch (error: any) {
          const errMsg = error.response?.data?.message || error.message || 'Lỗi khi đổi voucher';
          return { success: false, message: errMsg };
        }
      },

      // 4. Quét mã sử dụng Voucher tại quầy đối tác qua API Backend
      useVoucherCode: async (userVoucherIdOrCode) => {
        const target = get().myVouchers.find(
          (uv) => uv.id === userVoucherIdOrCode || uv.voucherCode === userVoucherIdOrCode
        );
        const code = target ? target.voucherCode : userVoucherIdOrCode;

        try {
          const res = await voucherService.useVoucher(code);
          const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const activeUid = get().activeUserId || 'guest';

          const updatedList = get().myVouchers.map((uv) =>
            uv.voucherCode === code || uv.id === userVoucherIdOrCode
              ? {
                  ...uv,
                  status: 'USED' as UserVoucherStatus,
                  usedAt: `${nowStr} - Hôm nay`,
                }
              : uv
          );

          set((state) => ({
            myVouchers: updatedList,
            myVouchersByUser: {
              ...state.myVouchersByUser,
              [activeUid]: updatedList,
            },
          }));

          return {
            success: true,
            message: res.message || `Sử dụng thành công mã ưu đãi!`,
          };
        } catch (error: any) {
          const errMsg = error.response?.data?.message || error.message || 'Lỗi khi kích hoạt voucher';
          return { success: false, message: errMsg };
        }
      },

      // 4b. Hoàn lại Voucher về ví (Dành cho trường hợp lỡ bấm nhầm)
      restoreVoucherCode: async (userVoucherIdOrCode) => {
        const target = get().myVouchers.find(
          (uv) => uv.id === userVoucherIdOrCode || uv.voucherCode === userVoucherIdOrCode
        );
        const code = target ? target.voucherCode : userVoucherIdOrCode;

        try {
          await voucherService.restoreVoucher(code).catch(() => {});
        } catch {
          // Fallback local
        }

        const activeUid = get().activeUserId || 'guest';
        const updatedList = get().myVouchers.map((uv) =>
          uv.voucherCode === code || uv.id === userVoucherIdOrCode
            ? {
                ...uv,
                status: 'UNUSED' as UserVoucherStatus,
                usedAt: undefined,
              }
            : uv
        );

        set((state) => ({
          myVouchers: updatedList,
          myVouchersByUser: {
            ...state.myVouchersByUser,
            [activeUid]: updatedList,
          },
        }));

        return {
          success: true,
          message: 'Đã hoàn lại voucher về ví thành công! Bạn có thể sử dụng khi thanh toán đơn hàng.',
        };
      },

      getUserVouchersByStatus: (status) => {
        const all = get().myVouchers;
        if (!status) return all;
        return all.filter((uv) => uv.status === status);
      },

      getAvailableByPartner: (partner) => {
        const all = get().availableVouchers;
        if (!partner) return all;
        return all.filter((v) => v.partner === partner);
      },

      resetVouchers: () =>
        set({
          availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
          myVouchers: [],
          activeUserId: null,
        }),
    }),
    {
      name: 'fu_market_vouchers_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.activeUserId) {
            state.myVouchers = [];
          } else {
            state.myVouchers = state.myVouchersByUser?.[state.activeUserId] || [];
          }
          state.myVouchers = (state.myVouchers || []).filter(
            (uv) => uv.id !== 'uv-1' && uv.id !== 'uv-2' && uv.userId !== 'user-default'
          );
        }
      },
    }
  )
);
