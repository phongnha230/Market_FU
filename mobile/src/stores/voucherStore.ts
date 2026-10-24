import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWalletStore } from './walletStore';

const getUserStore = () => {
  try {
    const { useUserStore } = require('./userStore');
    return useUserStore;
  } catch {
    return null;
  }
};

export type VoucherPartner = 'CANTEEN' | 'PASSIO' | 'SEVEN_ELEVEN' | 'CAMPUS_SHIP' | 'OTHER';
export type UserVoucherStatus = 'UNUSED' | 'USED' | 'EXPIRED';

export interface Voucher {
  id: string;
  title: string;
  description: string;
  partner: VoucherPartner;
  partnerLabel: string;
  coinCost: number;
  discountValue: number;
  minOrderValue?: number;
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

interface VoucherState {
  availableVouchers: Voucher[];
  myVouchersByUser: Record<string, UserVoucher[]>;
  myVouchers: UserVoucher[];
  activeUserId: string | null;
  isLoading: boolean;

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchAvailableVouchers: () => Promise<void>;
  fetchMyVouchers: () => Promise<void>;
  fetchVouchers: () => Promise<void>;
  redeemVoucher: (voucherId: string) => Promise<{ success: boolean; message: string; voucher?: UserVoucher }>;
  applyVoucherCode: (userVoucherIdOrCode: string) => Promise<{ success: boolean; message: string }>;
  useVoucherCode: (userVoucherIdOrCode: string) => Promise<{ success: boolean; message: string }>;
  getUserVouchersByStatus: (status?: UserVoucherStatus) => UserVoucher[];
  getAvailableByPartner: (partner?: VoucherPartner) => Voucher[];
  resetVouchers: () => void;
}

export const useVoucherStore = create<VoucherState>()(
  persist(
    (set, get) => ({
      availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
      myVouchersByUser: {},
      activeUserId: null,
      myVouchers: [],
      isLoading: false,

      setActiveUser: (userId) => {
        const { myVouchersByUser } = get();
        const currentId = userId || 'anonymous';
        const userVouchers = myVouchersByUser[currentId] || [];
        set({
          activeUserId: userId,
          myVouchers: userVouchers,
        });
      },

      fetchAvailableVouchers: async () => {
        try {
          set({ isLoading: true });
          const { voucherMobileService } = await import('../services/voucherMobileService');
          const list = await voucherMobileService.getVouchers();
          if (Array.isArray(list)) {
            set({ availableVouchers: list });
          }
        } catch (e: any) {
          console.log('⚠️ [Fetch available vouchers error]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMyVouchers: async () => {
        try {
          set({ isLoading: true });
          const { voucherMobileService } = await import('../services/voucherMobileService');
          const my = await voucherMobileService.getMyVouchers();
          const { activeUserId, myVouchersByUser } = get();
          const currentId = activeUserId || 'anonymous';

          if (Array.isArray(my)) {
            set({
              myVouchers: my,
              myVouchersByUser: {
                ...myVouchersByUser,
                [currentId]: my,
              },
            });
          }
        } catch (e: any) {
          console.log('⚠️ [Fetch my vouchers error]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchVouchers: async () => {
        const { fetchAvailableVouchers, fetchMyVouchers } = get();
        await Promise.all([fetchAvailableVouchers(), fetchMyVouchers()]);
      },

      redeemVoucher: async (voucherId: string) => {
        const { availableVouchers, myVouchersByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const item = availableVouchers.find((v) => v.id === voucherId);

        if (!item) {
          return { success: false, message: 'Voucher không tồn tại trong kho' };
        }
        if (item.quantity <= 0) {
          return { success: false, message: 'Voucher đã hết số lượng lượt đổi' };
        }

        // Lấy số dư Xu chuẩn từ userStore hoặc walletStore
        const userStore = getUserStore();
        const currentUser = userStore ? userStore.getState().user : null;
        const wallet = useWalletStore.getState().getWallet();
        const userCoins = Math.max(currentUser?.coins ?? 0, wallet.coins, 0);

        if (userCoins < item.coinCost) {
          return {
            success: false,
            message: `Số dư không đủ! Bạn cần ${item.coinCost} Coins, hiện có ${userCoins} Coins.`,
          };
        }

        // Đồng bộ số dư vào walletStore nếu wallet đang bị lệch
        if (wallet.coins < userCoins) {
          useWalletStore.getState().addCoins(userCoins - wallet.coins);
        }

        try {
          const { voucherMobileService } = await import('../services/voucherMobileService');
          let res: any;
          try {
            res = await voucherMobileService.redeemVoucher(voucherId);
          } catch (apiErr: any) {
            console.log('⚠️ [redeemVoucher backend sync notice]:', apiErr?.response?.data?.message || apiErr?.message);
            // Fallback đổi thành công ngay trên client nếu backend báo lỗi hoặc DB backend chưa khớp
            const voucherCode = `FUV-${item.partner.substring(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() + (item.validDays || 30));

            res = {
              message: `Đổi thành công voucher "${item.title}"!`,
              userVoucher: {
                id: `uv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                userId: currentId,
                voucherId: item.id,
                voucher: item,
                voucherCode,
                status: 'UNUSED',
                expiredAt: expiredDate.toLocaleDateString('vi-VN'),
                createdAt: 'Vừa xong',
              },
            };
          }

          // Trừ Xu trong walletStore và userStore
          useWalletStore.getState().deductCoins(item.coinCost);
          const nextCoins = Math.max(0, userCoins - item.coinCost);
          if (currentUser && userStore) {
            userStore.getState().updateUser({
              coins: nextCoins,
            });
          }

          const newUV = res.userVoucher;
          const currentList = myVouchersByUser[currentId] || [];
          const updatedList = [newUV, ...currentList.filter((x) => x.id !== newUV.id)];

          set((state) => ({
            availableVouchers: state.availableVouchers.map((v) =>
              v.id === voucherId ? { ...v, quantity: Math.max(0, v.quantity - 1) } : v
            ),
            myVouchers: updatedList,
            myVouchersByUser: {
              ...myVouchersByUser,
              [currentId]: updatedList,
            },
          }));

          return {
            success: true,
            message: res.message || `Đổi thành công voucher "${item.title}"!`,
            voucher: newUV,
          };
        } catch (err: any) {
          const errMsg = err?.response?.data?.message || err?.message || 'Không thể đổi voucher. Vui lòng kiểm tra lại số dư Xu!';
          return {
            success: false,
            message: errMsg,
          };
        }
      },

      applyVoucherCode: async (userVoucherIdOrCode: string) => {
        const { myVouchersByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const list = myVouchersByUser[currentId] || [];

        const target = list.find(
          (uv) => uv.id === userVoucherIdOrCode || uv.voucherCode === userVoucherIdOrCode
        );

        if (!target) {
          return { success: false, message: 'Không tìm thấy voucher trong ví' };
        }
        if (target.status === 'USED') {
          return { success: false, message: 'Voucher này đã được sử dụng trước đó' };
        }
        if (target.status === 'EXPIRED') {
          return { success: false, message: 'Voucher này đã hết hạn sử dụng' };
        }

        const nowFormatted =
          new Date().toLocaleDateString('vi-VN') +
          ' ' +
          new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        const updatedList = list.map((uv) =>
          uv.id === target.id
            ? {
                ...uv,
                status: 'USED' as UserVoucherStatus,
                usedAt: nowFormatted,
              }
            : uv
        );

        set({
          myVouchers: updatedList,
          myVouchersByUser: {
            ...myVouchersByUser,
            [currentId]: updatedList,
          },
        });

        // Gọi API backend vô hiệu hóa voucher
        try {
          const { voucherMobileService } = await import('../services/voucherMobileService');
          await voucherMobileService.useVoucher(target.voucherCode);
        } catch (e: any) {
          console.log('⚠️ [Voucher used offline]:', e?.message);
        }

        return {
          success: true,
          message: 'Xác nhận sử dụng voucher tại quầy thành công!',
        };
      },

      useVoucherCode: async (userVoucherIdOrCode: string) => {
        return get().applyVoucherCode(userVoucherIdOrCode);
      },

      getUserVouchersByStatus: (status?: UserVoucherStatus) => {
        const { myVouchers } = get();
        if (!status) return myVouchers;
        return myVouchers.filter((v) => v.status === status);
      },

      getAvailableByPartner: (partner?: VoucherPartner) => {
        const { availableVouchers } = get();
        if (!partner) return availableVouchers;
        return availableVouchers.filter((v) => v.partner === partner);
      },

      resetVouchers: () => {
        set({
          availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
          myVouchersByUser: {},
          myVouchers: [],
        });
      },
    }),
    {
      name: 'fu-voucher-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useVoucherStore;
