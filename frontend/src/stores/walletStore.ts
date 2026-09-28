import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useUserStore } from './userStore';

export type CoinTransactionType =
  | 'REVIEW_REWARD'
  | 'KYC_BONUS'
  | 'BOOST_POST'
  | 'ORDER_DISCOUNT'
  | 'BUY_BADGE'
  | 'WITHDRAWAL'
  | 'REDEEM_VOUCHER'
  | 'ADMIN_ADJUSTMENT'
  | 'BONUS';

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BankAccount {
  bankName: string;
  accountNo: string;
  accountName: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number; // Ví dụ: +50 hoặc -100
  balanceAfter: number;
  type: CoinTransactionType;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number; // VNĐ quy đổi hoặc số coin
  bankAccount: BankAccount;
  status: WithdrawalStatus;
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

interface WalletState {
  campusCoins: number;
  frozenCoins: number; // Xu đang tạm giữ cho đơn Escrow đang chờ
  bankAccount: BankAccount | null;
  transactions: CoinTransaction[];
  withdrawalRequests: WithdrawalRequest[];

  // Actions
  topUpCoins: (amount: number, paymentMethod?: string) => void;
  addCoins: (amount: number, type: CoinTransactionType, description: string, referenceId?: string) => void;
  deductCoins: (amount: number, type: CoinTransactionType, description: string, referenceId?: string) => boolean;
  freezeCoins: (amount: number) => boolean;
  unfreezeCoins: (amount: number, shouldDeduct?: boolean) => void;
  setBankAccount: (bank: BankAccount) => void;
  requestWithdrawal: (amount: number) => { success: boolean; message: string };
  cancelWithdrawal: (requestId: string) => boolean;
  processWithdrawalByAdmin: (requestId: string, approve: boolean, adminNote?: string) => void;
  getTransactionsByType: (type?: CoinTransactionType) => CoinTransaction[];
  resetWallet: () => void;
}

const INITIAL_TRANSACTIONS: CoinTransaction[] = [];
const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      campusCoins: 0,
      frozenCoins: 0,
      bankAccount: null,
      transactions: [],
      withdrawalRequests: [],

      topUpCoins: (amount, paymentMethod = 'VietQR') => {
        set((state) => {
          const newBalance = state.campusCoins + amount;
          const newTx: CoinTransaction = {
            id: `tx-${Date.now()}`,
            userId: useUserStore.getState().user.id || 'user-current',
            amount,
            balanceAfter: newBalance,
            type: 'BONUS',
            description: `Nạp ${amount} FPT Coin qua ${paymentMethod}`,
            createdAt: 'Vừa xong',
          };
          return {
            campusCoins: newBalance,
            transactions: [newTx, ...state.transactions],
          };
        });
      },

      addCoins: (amount, type, description, referenceId) => {
        set((state) => {
          const newBalance = state.campusCoins + amount;
          const newTx: CoinTransaction = {
            id: `tx-${Date.now()}`,
            userId: useUserStore.getState().user.id || 'user-current',
            amount,
            balanceAfter: newBalance,
            type,
            description,
            referenceId,
            createdAt: 'Vừa xong',
          };
          return {
            campusCoins: newBalance,
            transactions: [newTx, ...state.transactions],
          };
        });
      },

      deductCoins: (amount, type, description, referenceId) => {
        const state = get();
        if (state.campusCoins < amount) {
          return false;
        }

        set((s) => {
          const newBalance = s.campusCoins - amount;
          const newTx: CoinTransaction = {
            id: `tx-${Date.now()}`,
            userId: useUserStore.getState().user.id || 'user-current',
            amount: -amount,
            balanceAfter: newBalance,
            type,
            description,
            referenceId,
            createdAt: 'Vừa xong',
          };
          return {
            campusCoins: newBalance,
            transactions: [newTx, ...s.transactions],
          };
        });

        return true;
      },

      freezeCoins: (amount) => {
        const state = get();
        if (state.campusCoins < amount) return false;
        set((s) => ({
          campusCoins: s.campusCoins - amount,
          frozenCoins: s.frozenCoins + amount,
        }));
        return true;
      },

      unfreezeCoins: (amount, shouldDeduct = false) => {
        set((s) => {
          const actualAmount = Math.min(s.frozenCoins, amount);
          return {
            frozenCoins: s.frozenCoins - actualAmount,
            campusCoins: shouldDeduct ? s.campusCoins : s.campusCoins + actualAmount,
          };
        });
      },

      setBankAccount: (bank) => set({ bankAccount: bank }),

      requestWithdrawal: (amount) => {
        const state = get();
        if (!state.bankAccount) {
          return { success: false, message: 'Vui lòng liên kết tài khoản ngân hàng trước khi rút tiền!' };
        }
        // 1 FPT Coin = 1.000 VNĐ
        const coinsRequired = Math.ceil(amount / 1000);
        if (state.campusCoins < coinsRequired) {
          return { success: false, message: `Số dư ví không đủ! Cần tối thiểu ${coinsRequired} FPT Coin.` };
        }

        const newReq: WithdrawalRequest = {
          id: `wdr-${Date.now()}`,
          userId: 'user-default',
          amount,
          bankAccount: state.bankAccount,
          status: 'PENDING',
          createdAt: 'Vừa xong',
        };

        set((s) => {
          const newBalance = s.campusCoins - coinsRequired;
          const newTx: CoinTransaction = {
            id: `tx-${Date.now()}`,
            userId: useUserStore.getState().user.id || 'user-current',
            amount: -coinsRequired,
            balanceAfter: newBalance,
            type: 'WITHDRAWAL',
            description: `Yêu cầu rút ${amount.toLocaleString('vi-VN')}đ về ${state.bankAccount?.bankName}`,
            referenceId: newReq.id,
            createdAt: 'Vừa xong',
          };
          return {
            campusCoins: newBalance,
            withdrawalRequests: [newReq, ...s.withdrawalRequests],
            transactions: [newTx, ...s.transactions],
          };
        });

        return { success: true, message: 'Đã gửi yêu cầu rút tiền thành công! Admin sẽ duyệt trong 24h.' };
      },

      cancelWithdrawal: (requestId) => {
        const state = get();
        const req = state.withdrawalRequests.find((r) => r.id === requestId && r.status === 'PENDING');
        if (!req) return false;

        const coinsToRefund = Math.ceil(req.amount / 1000);
        set((s) => ({
          campusCoins: s.campusCoins + coinsToRefund,
          withdrawalRequests: s.withdrawalRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'REJECTED', adminNote: 'Người dùng tự hủy yêu cầu' } : r
          ),
          transactions: [
            {
              id: `tx-${Date.now()}`,
              userId: useUserStore.getState().user.id || 'user-current',
              amount: coinsToRefund,
              balanceAfter: s.campusCoins + coinsToRefund,
              type: 'ADMIN_ADJUSTMENT',
              description: `Hoàn ${coinsToRefund} Coin do hủy lệnh rút tiền`,
              referenceId: requestId,
              createdAt: 'Vừa xong',
            },
            ...s.transactions,
          ],
        }));

        return true;
      },

      processWithdrawalByAdmin: (requestId, approve, adminNote) => {
        set((s) => ({
          withdrawalRequests: s.withdrawalRequests.map((r) => {
            if (r.id === requestId) {
              return {
                ...r,
                status: approve ? 'APPROVED' : 'REJECTED',
                adminNote: adminNote || (approve ? 'Admin đã duyệt chuyển khoản' : 'Yêu cầu bị từ chối'),
                processedAt: 'Vừa xong',
              };
            }
            return r;
          }),
        }));
      },

      getTransactionsByType: (type) => {
        const all = get().transactions;
        if (!type) return all;
        return all.filter((t) => t.type === type);
      },

      resetWallet: () =>
        set({
          campusCoins: 0,
          frozenCoins: 0,
          bankAccount: null,
          transactions: [],
          withdrawalRequests: [],
        }),
    }),
    {
      name: 'fu_market_wallet_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state?.transactions?.some((t) => t.id === 'tx-1' || t.id === 'tx-2')) {
          state.transactions = [];
          state.withdrawalRequests = [];
          if (state.bankAccount?.accountName === 'LE MINH QUAN') {
            state.bankAccount = null;
          }
        }
      },
    }
  )
);
