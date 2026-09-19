import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useOrderStore } from './orderStore';
import { useWalletStore } from './walletStore';

export type DisputeStatus = 'PENDING' | 'INVESTIGATING' | 'REFUNDED' | 'REJECTED';

export interface DisputeItem {
  id: string;
  orderId: string;
  orderCode: string;
  claimantId: string;
  claimantName: string;
  claimantRole: 'BUYER' | 'SELLER';
  reason: string;
  details?: string;
  proofVideoUrl: string;
  status: DisputeStatus;
  adminNote?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

interface DisputeState {
  disputes: DisputeItem[];

  // Actions
  createDispute: (params: {
    orderId: string;
    orderCode: string;
    reason: string;
    details?: string;
    proofVideoUrl: string;
    refundAmount?: number;
  }) => { success: boolean; message: string; dispute?: DisputeItem };
  resolveDisputeByAdmin: (
    disputeId: string,
    action: 'REFUND' | 'REJECT',
    adminNote: string
  ) => { success: boolean; message: string };
  getDisputeByOrder: (orderId: string) => DisputeItem | undefined;
  getDisputesByStatus: (status?: DisputeStatus) => DisputeItem[];
  resetDisputes: () => void;
}

export const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'dsp-1',
    orderId: 'ord-dispute-test',
    orderCode: '#ORD-99120-HL-HL',
    claimantId: 'user-default',
    claimantName: 'Lê Minh Quân',
    claimantRole: 'BUYER',
    reason: 'Sản phẩm nhận được không đúng như thỏa thuận (Màn hình bị sọc kẻ ngang)',
    details: 'Màn hình lúc đăng bài người bán bảo không lỗi, nhưng lúc cắm nguồn lên thì có 2 vạch sọc đỏ giữa màn. Đã quay video unbox lúc nhận hàng.',
    proofVideoUrl: 'https://youtube.com/watch?v=sample-unbox-proof',
    status: 'INVESTIGATING',
    adminNote: 'Admin đang yêu cầu Người bán phản hồi bằng chứng trước khi đóng băng/hoàn cọc Escrow',
    refundAmount: 1225000,
    createdAt: 'Hôm qua, 16:30',
  },
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useDisputeStore = create<DisputeState>()(
  persist(
    (set, get) => ({
      disputes: INITIAL_DISPUTES,

      createDispute: ({ orderId, orderCode, reason, details, proofVideoUrl, refundAmount }) => {
        const existing = get().disputes.find((d) => d.orderId === orderId);
        if (existing) {
          return { success: false, message: 'Đơn hàng này đang có khiếu nại đang được xử lý!' };
        }

        const newDispute: DisputeItem = {
          id: `dsp-${Date.now()}`,
          orderId,
          orderCode,
          claimantId: 'user-default',
          claimantName: 'Lê Minh Quân',
          claimantRole: 'BUYER',
          reason,
          details,
          proofVideoUrl,
          status: 'PENDING',
          refundAmount,
          createdAt: 'Vừa xong',
        };

        set((state) => ({
          disputes: [newDispute, ...state.disputes],
        }));

        // Chuyển trạng thái đơn hàng sang 'disputed'
        useOrderStore.getState().updateOrderStatus(orderId, 'disputed', 'Đang tranh chấp Escrow');

        return {
          success: true,
          message: 'Đã nộp đơn khiếu nại thành công! Tiền cọc Escrow được bảo hộ an toàn và Admin sẽ xử lý trong 24h.',
          dispute: newDispute,
        };
      },

      resolveDisputeByAdmin: (disputeId, action, adminNote) => {
        const target = get().disputes.find((d) => d.id === disputeId);
        if (!target) return { success: false, message: 'Không tìm thấy đơn khiếu nại' };

        const newStatus: DisputeStatus = action === 'REFUND' ? 'REFUNDED' : 'REJECTED';

        set((state) => ({
          disputes: state.disputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status: newStatus,
                  adminNote,
                  resolvedAt: 'Vừa xong',
                }
              : d
          ),
        }));

        // Cập nhật trạng thái đơn hàng
        if (action === 'REFUND') {
          useOrderStore.getState().updateOrderStatus(target.orderId, 'completed', 'Đã phán quyết hoàn tiền cọc');
          if (target.refundAmount) {
            // Hoàn coin lại ví
            const coins = Math.ceil(target.refundAmount / 1000);
            useWalletStore.getState().addCoins(
              coins,
              'ADMIN_ADJUSTMENT',
              `Hoàn tiền bảo hộ Escrow đơn hàng ${target.orderCode}`,
              target.id
            );
          }
        } else {
          useOrderStore.getState().updateOrderStatus(target.orderId, 'completed', 'Khiếu nại bị bác bỏ');
        }

        return { success: true, message: `Đã xử lý khiếu nại thành công: ${newStatus}` };
      },

      getDisputeByOrder: (orderId) => {
        return get().disputes.find((d) => d.orderId === orderId);
      },

      getDisputesByStatus: (status) => {
        const all = get().disputes;
        if (!status) return all;
        return all.filter((d) => d.status === status);
      },

      resetDisputes: () => set({ disputes: INITIAL_DISPUTES }),
    }),
    {
      name: 'fu_market_disputes_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
