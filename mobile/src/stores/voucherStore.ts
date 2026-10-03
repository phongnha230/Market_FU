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
    title: 'Giảm 15.000đ Cà Phê Passio Hola',
    description: 'Áp dụng cho mọi loại đồ uống từ 35.000đ tại quầy Passio sảnh Alpha Hola.',
    partner: 'PASSIO',
    partnerLabel: 'Passio Coffee',
    coinCost: 15,
    discountValue: 15000,
    quantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    validDays: 30,
    isActive: true,
  },
  {
    id: 'vch-7eleven-20k',
    title: 'Phiếu Mua Hàng 7-Eleven 20K',
    description: 'Áp dụng cho hóa đơn từ 50.000đ tại cửa hàng tiện lợi 7-Eleven cơ sở HCM.',
    partner: 'SEVEN_ELEVEN',
    partnerLabel: '7-Eleven Campus',
    coinCost: 20,
    discountValue: 20000,
    quantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    validDays: 20,
    isActive: true,
  },
  {
    id: 'vch-ship-free',
    title: 'Miễn Phí Vận Chuyển Liên Campus FPT',
    description: 'Freeship tối đa 25K cho các đơn gửi đồ qua hệ thống xe bus trung chuyển nội bộ giữa các cơ sở.',
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

const INITIAL_USER_VOUCHERS_BY_USER: Record<string, UserVoucher[]> = {
  acc_verified: [
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
  ],
  acc_seller: [
    {
      id: 'uv-s1',
      userId: 'acc_seller',
      voucherId: 'vch-ship-free',
      voucher: INITIAL_AVAILABLE_VOUCHERS[3],
      voucherCode: 'FUV-SHIP-1284S',
      status: 'UNUSED',
      expiredAt: '15/11/2026',
      createdAt: '2 ngày trước',
    },
  ],
  acc_unverified: [],
};

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
      availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
      myVouchersByUser: INITIAL_USER_VOUCHERS_BY_USER,
      activeUserId: 'acc_verified',
      myVouchers: INITIAL_USER_VOUCHERS_BY_USER.acc_verified || [],
      isLoading: false,

      setActiveUser: (userId) => {
        const { myVouchersByUser } = get();
        const currentId = userId || 'acc_unverified';
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
        const currentId = activeUserId || 'acc_unverified';
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
        const currentId = activeUserId || 'acc_unverified';
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
          availableVouchers: INITIAL_AVAILABLE_VOUCHERS,
          myVouchersByUser: INITIAL_USER_VOUCHERS_BY_USER,
          myVouchers: INITIAL_USER_VOUCHERS_BY_USER.acc_verified || [],
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
