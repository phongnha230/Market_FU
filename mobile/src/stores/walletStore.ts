import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletTransaction {
  id: string;
  type: 'WITHDRAW' | 'DEPOSIT' | 'SALE_ESCROW_RELEASE' | 'BUY_ESCROW_HOLD';
  title: string;
  amount: number;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'REJECTED';
  bankName?: string;
  accountNo?: string;
  referenceCode?: string;
}

export interface UserWallet {
  availableBalance: number;
  escrowBalance: number;
  coins: number;
  transactions: WalletTransaction[];
}

const INITIAL_WALLETS: Record<string, UserWallet> = {
  // acc_seller có sẵn doanh thu bán hàng đồ công nghệ
  acc_seller: {
    availableBalance: 2450000,
    escrowBalance: 1850000,
    coins: 520,
    transactions: [
      {
        id: 'tx_s1',
        type: 'SALE_ESCROW_RELEASE',
        title: 'Hoàn tất đơn hàng: Chuột Logitech G102',
        amount: 210000,
        date: 'Hôm qua, 18:30',
        status: 'SUCCESS',
        referenceCode: 'ORD-651239',
      },
      {
        id: 'tx_s2',
        type: 'BUY_ESCROW_HOLD',
        title: 'Cọc Escrow đơn: Màn hình Dell 24" (Chờ giao Safe-Point)',
        amount: 1850000,
        date: 'Hôm nay, 14:15',
        status: 'PENDING',
        referenceCode: 'ORD-882194',
      },
    ],
  },
  // acc_verified là sinh viên mua hàng có sẵn xu và số dư
  acc_verified: {
    availableBalance: 500000,
    escrowBalance: 1850000,
    coins: 350,
    transactions: [
      {
        id: 'tx_b1',
        type: 'DEPOSIT',
        title: 'Nạp ví qua VietQR Napas 24/7',
        amount: 500000,
        date: '25/09/2026',
        status: 'SUCCESS',
        referenceCode: 'DEP-883912',
      },
    ],
  },
  // acc_unverified tài khoản mới
  acc_unverified: {
    availableBalance: 0,
    escrowBalance: 0,
    coins: 50,
    transactions: [],
  },
};

interface WalletState {
  walletsByUser: Record<string, UserWallet>;
  activeUserId: string | null;

  // Actions
  setActiveUser: (userId: string | null) => void;
  getWallet: () => UserWallet;
  withdraw: (
    amount: number,
    bankInfo: { bankName: string; accountNo: string; accountName: string }
  ) => Promise<{ success: boolean; message: string }>;
  deposit: (amount: number) => Promise<{ success: boolean; message: string }>;
  releaseEscrowToSeller: (sellerId: string, amount: number, orderCode: string) => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      walletsByUser: INITIAL_WALLETS,
      activeUserId: 'acc_seller',

      setActiveUser: (userId) => {
        set({ activeUserId: userId });
      },

      getWallet: () => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        return (
          walletsByUser[currentId] || {
            availableBalance: 0,
            escrowBalance: 0,
            coins: 0,
            transactions: [],
          }
        );
      },

      withdraw: async (amount, bankInfo) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        const wallet = walletsByUser[currentId] || {
          availableBalance: 0,
          escrowBalance: 0,
          coins: 0,
          transactions: [],
        };

        if (amount <= 0) {
          return { success: false, message: 'Số tiền rút phải lớn hơn 0đ' };
        }

        if (wallet.availableBalance < amount) {
          return {
            success: false,
            message: `Số dư khả dụng (${wallet.availableBalance.toLocaleString('vi-VN')}đ) không đủ để rút ${amount.toLocaleString('vi-VN')}đ`,
          };
        }

        const newTx: WalletTransaction = {
          id: `wtx_${Date.now()}`,
          type: 'WITHDRAW',
          title: `Rút tiền về ATM ${bankInfo.bankName} (${bankInfo.accountNo})`,
          amount: amount,
          date: 'Vừa xong',
          status: 'PENDING',
          bankName: bankInfo.bankName,
          accountNo: bankInfo.accountNo,
          referenceCode: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
        };

        const updatedWallet: UserWallet = {
          ...wallet,
          availableBalance: wallet.availableBalance - amount,
          transactions: [newTx, ...wallet.transactions],
        };

        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [currentId]: updatedWallet,
          },
        }));

        // Bắn ngầm lên Backend /profile/withdrawals
        import('../services/profileMobileService').then(({ profileMobileService }) => {
          profileMobileService
            .submitWithdrawal({
              amount,
              bankName: bankInfo.bankName,
              accountNumber: bankInfo.accountNo,
              accountHolderName: bankInfo.accountName,
              note: `Rút tiền từ Mobile App - ${newTx.referenceCode}`,
            })
            .catch(() => {});
        });

        return {
          success: true,
          message: `Lệnh rút ${amount.toLocaleString('vi-VN')}đ về ngân hàng ${bankInfo.bankName} đã gửi thành công! Admin sẽ xử lý trong 5-15 phút.`,
        };
      },

      deposit: async (amount) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        const wallet = walletsByUser[currentId] || {
          availableBalance: 0,
          escrowBalance: 0,
          coins: 0,
          transactions: [],
        };

        const newTx: WalletTransaction = {
          id: `dtx_${Date.now()}`,
          type: 'DEPOSIT',
          title: 'Nạp tiền vào ví Escrow qua VietQR',
          amount,
          date: 'Vừa xong',
          status: 'SUCCESS',
          referenceCode: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        };

        const updatedWallet: UserWallet = {
          ...wallet,
          availableBalance: wallet.availableBalance + amount,
          transactions: [newTx, ...wallet.transactions],
        };

        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [currentId]: updatedWallet,
          },
        }));

        return {
          success: true,
          message: `Nạp ${amount.toLocaleString('vi-VN')}đ vào ví thành công!`,
        };
      },

      releaseEscrowToSeller: (sellerId, amount, orderCode) => {
        const { walletsByUser } = get();
        const sellerWallet = walletsByUser[sellerId] || {
          availableBalance: 0,
          escrowBalance: 0,
          coins: 0,
          transactions: [],
        };

        const newTx: WalletTransaction = {
          id: `esc_rel_${Date.now()}`,
          type: 'SALE_ESCROW_RELEASE',
          title: `Nhận thanh toán đơn hàng: ${orderCode}`,
          amount,
          date: 'Vừa xong',
          status: 'SUCCESS',
          referenceCode: orderCode,
        };

        const updatedSellerWallet: UserWallet = {
          ...sellerWallet,
          availableBalance: sellerWallet.availableBalance + amount,
          escrowBalance: Math.max(0, sellerWallet.escrowBalance - amount),
          transactions: [newTx, ...sellerWallet.transactions],
        };

        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [sellerId]: updatedSellerWallet,
          },
        }));
      },

      addCoins: (amount) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        const wallet = walletsByUser[currentId] || {
          availableBalance: 0,
          escrowBalance: 0,
          coins: 0,
          transactions: [],
        };
        const updated = {
          ...wallet,
          coins: Math.max(0, wallet.coins + amount),
        };
        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [currentId]: updated,
          },
        }));
      },

      deductCoins: (amount) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        const wallet = walletsByUser[currentId] || {
          availableBalance: 0,
          escrowBalance: 0,
          coins: 0,
          transactions: [],
        };
        if (wallet.coins < amount) return false;
        const updated = {
          ...wallet,
          coins: wallet.coins - amount,
        };
        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [currentId]: updated,
          },
        }));
        return true;
      },
    }),
    {
      name: 'fu_mobile_wallet_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useWalletStore;
