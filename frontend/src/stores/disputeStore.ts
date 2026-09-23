import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useOrderStore } from './orderStore';
import { useWalletStore } from './walletStore';
import { reportService, BackendDispute } from '@/services/reportService';

export type DisputeStatus = 'PENDING' | 'INVESTIGATING' | 'REFUNDED' | 'REJECTED' | 'CANCELLED';

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
  isLoading: boolean;

  // Actions
  fetchDisputes: () => Promise<void>;
  createDispute: (params: {
    orderId: string;
    orderCode: string;
    reason: string;
    details?: string;
    proofVideoUrl: string;
    refundAmount?: number;
  }) => Promise<{ success: boolean; message: string; dispute?: DisputeItem }>;
  resolveDisputeByAdmin: (
    disputeId: string,
    action: 'REFUND' | 'REJECT',
    adminNote: string
  ) => Promise<{ success: boolean; message: string }>;
  getDisputeByOrder: (orderId: string) => DisputeItem | undefined;
  getDisputesByStatus: (status?: DisputeStatus) => DisputeItem[];
  resetDisputes: () => void;
}

const mapBackendDispute = (bd: BackendDispute): DisputeItem => ({
  id: bd.id,
  orderId: bd.orderId,
  orderCode: bd.order?.orderCode || `#ORD-${bd.orderId.slice(-6)}`,
  claimantId: bd.claimantId,
  claimantName: bd.order?.buyer?.profile?.fullName || 'Người mua',
  claimantRole: 'BUYER',
  reason: bd.reason,
  proofVideoUrl: bd.proofVideoUrl,
  status: bd.status === 'RESOLVED' ? 'REFUNDED' : (bd.status as DisputeStatus),
  adminNote: bd.adminNote || undefined,
  refundAmount: bd.order?.payment?.totalAmount || undefined,
  createdAt: new Date(bd.createdAt).toLocaleString('vi-VN'),
  resolvedAt: bd.resolvedAt ? new Date(bd.resolvedAt).toLocaleString('vi-VN') : undefined,
});

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
      isLoading: false,

      // 1. Tải danh sách khiếu nại từ Backend
      fetchDisputes: async () => {
        try {
          set({ isLoading: true });
          const res = await reportService.getDisputes({ limit: 50 });
          if (res.disputes && res.disputes.length > 0) {
            set({ disputes: res.disputes.map(mapBackendDispute) });
          }
        } catch (error) {
          console.warn('⚠️ [DisputeStore] Không thể tải khiếu nại từ server, dùng cache offline');
        } finally {
          set({ isLoading: false });
        }
      },

      // 2. Tạo khiếu nại đơn hàng qua Backend API
      createDispute: async ({ orderId, orderCode, reason, details, proofVideoUrl, refundAmount }) => {
        const existing = get().disputes.find((d) => d.orderId === orderId);
        if (existing) {
          return { success: false, message: 'Đơn hàng này đang có khiếu nại đang được xử lý!' };
        }

        try {
          const res = await reportService.createDispute({
            orderId,
            reason: details ? `${reason}. Chi tiết: ${details}` : reason,
            proofVideoUrl,
          });

          const newDispute = mapBackendDispute(res);

          set((state) => ({
            disputes: [newDispute, ...state.disputes],
          }));

          // Cập nhật trạng thái đơn hàng trên orderStore
          useOrderStore.getState().updateOrderStatus(orderId, 'disputed', 'Đang tranh chấp Escrow');

          return {
            success: true,
            message: 'Đã nộp đơn khiếu nại thành công! Tiền cọc Escrow được bảo hộ an toàn và Admin sẽ xử lý trong 24h.',
            dispute: newDispute,
          };
        } catch (error: any) {
          const errMsg = error.response?.data?.message || error.message || 'Lỗi khi gửi khiếu nại';
          return { success: false, message: errMsg };
        }
      },

      // 3. Admin phân xử khiếu nại qua Backend API
      resolveDisputeByAdmin: async (disputeId, action, adminNote) => {
        const target = get().disputes.find((d) => d.id === disputeId);
        if (!target) return { success: false, message: 'Không tìm thấy đơn khiếu nại' };

        try {
          const decision = action === 'REFUND' ? 'REFUND_BUYER' : 'PAY_SELLER';
          await reportService.resolveDispute(disputeId, {
            decision,
            adminNote,
          });

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
          } else {
            useOrderStore.getState().updateOrderStatus(target.orderId, 'completed', 'Khiếu nại bị bác bỏ');
          }

          return { success: true, message: `Đã xử lý khiếu nại thành công: ${newStatus}` };
        } catch (error: any) {
          const errMsg = error.response?.data?.message || error.message || 'Lỗi khi xử lý khiếu nại';
          return { success: false, message: errMsg };
        }
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
