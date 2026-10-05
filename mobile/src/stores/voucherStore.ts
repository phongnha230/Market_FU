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

export const INITIAL_AVAILABLE_VOUCHERS: Voucher[] = [];

const INITIAL_USER_VOUCHERS_BY_USER: Record<string, UserVoucher[]> = {};

interface VoucherState {
  availableVouchers: Voucher[];
  myVouchersByUser: Record<string, UserVoucher[]>;
  myVouchers: UserVoucher[];
  activeUserId: string | null;
  isLoading: boolean;

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchVouchers: () => Promise<void>;
  redeemVoucher: (voucherId: string) => Promise<{ success: boolean; message: string; voucher?: UserVoucher }>;
  useVoucherCode: (userVoucherIdOrCode: string) => Promise<{ success: boolean; message: string }>;
  getUserVouchersByStatus: (status?: UserVoucherStatus) => UserVoucher[];
  getAvailableByPartner: (partner?: VoucherPartner) => Voucher[];
  resetVouchers: () => void;
}

export const useVoucherStore = create<VoucherState>()(
  persist(
    (set, get) => ({
      availableVouchers: [],
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

      fetchVouchers: async () => {
        try {
          set({ isLoading: true });
          const { voucherMobileService } = await import('../services/voucherMobileService');
          const [pub, my] = await Promise.all([
            voucherMobileService.getVouchers(),
            voucherMobileService.getMyVouchers(),
          ]);
          if (my && my.length > 0) {
            set({ myVouchers: my });
          }
        } catch (e: any) {
          console.log('⚠️ [Backend vouchers offline]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
      },

      redeemVoucher: async (voucherId: string) => {
        const { availableVouchers, myVouchersByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const item = availableVouchers.find((v) => v.id === voucherId);

        if (!item) return { success: false, message: 'Voucher không tồn tại' };
        if (item.quantity <= 0) return { success: false, message: 'Voucher đã hết số lượng' };

        const randomCode = `FUV-${item.partner.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newUV: UserVoucher = {
          id: `uv-${Date.now()}`,
          userId: currentId,
          voucherId: item.id,
          voucher: item,
          voucherCode: randomCode,
          status: 'UNUSED',
          expiredAt: '30/11/2026',
          createdAt: 'Vừa xong',
        };

        const currentList = myVouchersByUser[currentId] || [];
        const updatedList = [newUV, ...currentList];

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

        import('../services/voucherMobileService').then(({ voucherMobileService }) => {
          voucherMobileService.redeemVoucher(voucherId).catch(() => {});
        });

        return {
          success: true,
          message: `Đổi voucher ${item.title} thành công! Mã: ${randomCode}`,
          voucher: newUV,
        };
      },

      useVoucherCode: async (userVoucherIdOrCode: string) => {
        const { myVouchersByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const list = myVouchersByUser[currentId] || [];

        const target = list.find(
          (uv) => uv.id === userVoucherIdOrCode || uv.voucherCode === userVoucherIdOrCode
        );

        if (!target) return { success: false, message: 'Không tìm thấy voucher' };
        if (target.status === 'USED') return { success: false, message: 'Voucher này đã được sử dụng trước đó' };
        if (target.status === 'EXPIRED') return { success: false, message: 'Voucher này đã hết hạn sử dụng' };

        const updatedList = list.map((uv) =>
          uv.id === target.id
            ? {
                ...uv,
                status: 'USED' as UserVoucherStatus,
                usedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
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

        // Bắn ngầm lên backend vô hiệu hóa voucher code trên server
        import('../services/voucherMobileService').then(({ voucherMobileService }) => {
          voucherMobileService.useVoucher(target.voucherCode).catch(() => {});
        });

        return { success: true, message: 'Áp dụng mã voucher thành công!' };
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
          availableVouchers: [],
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
