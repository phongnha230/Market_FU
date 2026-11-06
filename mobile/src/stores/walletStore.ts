import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeStorage';
import { profileMobileService } from '../services/profileMobileService';

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

const INITIAL_WALLETS: Record<string, UserWallet> = {};

interface WalletState {
  walletsByUser: Record<string, UserWallet>;
  activeUserId: string | null;

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchWalletBalances: () => Promise<void>;
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
      activeUserId: null,

      setActiveUser: (userId) => {
        set({ activeUserId: userId });
        if (userId) {
          get().fetchWalletBalances().catch(() => {});
          try {
            const { useUserStore } = require('./userStore');
            const currentUser = useUserStore.getState().user;
            if (currentUser && typeof currentUser.coins === 'number') {
              const { walletsByUser } = get();
              const wallet = walletsByUser[userId] || {
                availableBalance: 0,
                escrowBalance: 0,
                coins: 0,
                transactions: [],
              };
              if (currentUser.coins > wallet.coins) {
                set({
                  walletsByUser: {
                    ...walletsByUser,
                    [userId]: {
                      ...wallet,
                      coins: currentUser.coins,
                    },
                  },
                });
              }
            }
          } catch {}
        }
      },

      fetchWalletBalances: async () => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        try {
          const { orderMobileService } = await import('../services/orderMobileService');
          const data = await orderMobileService.getSellerAnalytics();
          if (data && typeof data.availableBalance === 'number') {
            const currentWallet = walletsByUser[currentId] || {
              availableBalance: 0,
              escrowBalance: 0,
              coins: 0,
              transactions: [],
            };
            set({
              walletsByUser: {
                ...walletsByUser,
                [currentId]: {
                  ...currentWallet,
                  availableBalance: data.availableBalance,
                  escrowBalance: data.pendingEscrow || 0,
                },
              },
            });
          }
        } catch {
          // offline
        }
      },

      getWallet: () => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const wallet =
          walletsByUser[currentId] || {
            availableBalance: 0,
            escrowBalance: 0,
            coins: 0,
            transactions: [],
          };
        try {
          const { useUserStore } = require('./userStore');
          const currentUser = useUserStore.getState().user;
          if (currentUser && typeof currentUser.coins === 'number' && currentUser.coins > wallet.coins) {
            wallet.coins = currentUser.coins;
          }
        } catch {}
        return wallet;
      },

      withdraw: async (amount, bankInfo) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
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

        try {
          const res = await profileMobileService.submitWithdrawal({
            amount,
            bankName: bankInfo.bankName,
            accountNumber: bankInfo.accountNo,
            accountHolderName: bankInfo.accountName,
            note: `Rút tiền từ Mobile App - ATM ${bankInfo.bankName}`,
          });

          const newTx: WalletTransaction = {
            id: res?.id || `wtx_${Date.now()}`,
            type: 'WITHDRAW',
            title: `Rút tiền về ATM ${bankInfo.bankName} (${bankInfo.accountNo})`,
            amount: amount,
            date: 'Vừa xong',
            status: 'PENDING',
            bankName: bankInfo.bankName,
            accountNo: bankInfo.accountNo,
            referenceCode: res?.id || `WD-${Math.floor(100000 + Math.random() * 900000)}`,
          };

          const updatedWallet: UserWallet = {
            ...wallet,
            availableBalance: Math.max(0, wallet.availableBalance - amount),
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
            message: `Lệnh rút ${amount.toLocaleString('vi-VN')}đ về ngân hàng ${bankInfo.bankName} đã gửi thành công! Admin sẽ xử lý trong 5-15 phút.`,
          };
        } catch (apiErr: any) {
          const errMsg = apiErr?.response?.data?.message || apiErr?.message || 'Không thể tạo yêu cầu rút tiền. Vui lòng thử lại sau.';
          return {
            success: false,
            message: errMsg,
          };
        }
      },

      deposit: async (amount) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
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
          status: 'PENDING',
          referenceCode: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
        };

        const updatedWallet: UserWallet = {
          ...wallet,
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
          message: `Đã ghi nhận yêu cầu nạp ${amount.toLocaleString('vi-VN')}đ, đang chờ ngân hàng đối soát.`,
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
        const currentId = activeUserId || 'anonymous';
        const wallet = get().getWallet();
        const newCoins = Math.max(0, wallet.coins + amount);
        const updated = {
          ...wallet,
          coins: newCoins,
        };
        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [currentId]: updated,
          },
        }));
        try {
          const { useUserStore } = require('./userStore');
          useUserStore.getState().updateUser({ coins: newCoins });
        } catch {}
      },

      deductCoins: (amount) => {
        const { walletsByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const wallet = get().getWallet();
        if (wallet.coins < amount) return false;
        const newCoins = wallet.coins - amount;
        const updated = {
          ...wallet,
          coins: newCoins,
        };
        set((state) => ({
          walletsByUser: {
            ...state.walletsByUser,
            [currentId]: updated,
          },
        }));
        try {
          const { useUserStore } = require('./userStore');
          useUserStore.getState().updateUser({ coins: newCoins });
        } catch {}
        return true;
      },
    }),
    {
      name: 'fu_mobile_wallet_storage',
      storage: createJSONStorage(() => safeAsyncStorage),
    }
  )
);

export default useWalletStore;
