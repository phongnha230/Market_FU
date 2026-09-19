import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ReportTargetType = 'PRODUCT' | 'USER';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string; // Tên sản phẩm hoặc tên tài khoản bị tố cáo
  reason: string;
  details?: string;
  proofImageUrl?: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface ReportState {
  reports: ReportItem[];

  // Actions
  submitReport: (params: {
    targetType: ReportTargetType;
    targetId: string;
    targetTitle: string;
    reason: string;
    details?: string;
    proofImageUrl?: string;
  }) => { success: boolean; message: string; report?: ReportItem };
  updateReportStatusByAdmin: (
    reportId: string,
    status: ReportStatus,
    adminNote?: string
  ) => void;
  getReportsByStatus: (status?: ReportStatus) => ReportItem[];
  getReportsByTarget: (targetId: string) => ReportItem[];
  resetReports: () => void;
}

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    reporterId: 'user-default',
    reporterName: 'Lê Minh Quân',
    targetType: 'PRODUCT',
    targetId: 'prod-fake-123',
    targetTitle: 'Tai nghe AirPods Pro 2 Rep 1:1 nhưng rao là chính hãng FPT Synnex',
    reason: 'Hàng giả / Đăng sai thông tin sản phẩm',
    details: 'Người bán khẳng định là hàng chính hãng FPT Synnex nhưng khi hỏi số seri trên vỏ hộp thì là mã nhái.',
    status: 'PENDING',
    createdAt: '2 giờ trước',
  },
  {
    id: 'rep-2',
    reporterId: 'user-reporter-2',
    reporterName: 'Trần Thảo Ly',
    targetType: 'USER',
    targetId: 'user-scammer-88',
    targetTitle: 'Tài khoản: NguyenVanBao_SE15',
    reason: 'Yêu cầu chuyển cọc trước qua Zalo cá nhân rồi chặn liên lạc',
    details: 'Tài khoản này liên tục nhắn tin cho các sinh viên tìm mua laptop yêu cầu chuyển khoản cọc 200k qua số điện thoại lạ.',
    status: 'INVESTIGATING',
    adminNote: 'Admin đang rà soát IP đăng nhập và tạm khóa quyền đăng bài của tài khoản này.',
    createdAt: 'Hôm qua',
  },
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: INITIAL_REPORTS,

      submitReport: ({ targetType, targetId, targetTitle, reason, details, proofImageUrl }) => {
        const newReport: ReportItem = {
          id: `rep-${Date.now()}`,
          reporterId: 'user-default',
          reporterName: 'Lê Minh Quân',
          targetType,
          targetId,
          targetTitle,
          reason,
          details,
          proofImageUrl,
          status: 'PENDING',
          createdAt: 'Vừa xong',
        };

        set((state) => ({
          reports: [newReport, ...state.reports],
        }));

        return {
          success: true,
          message: 'Báo cáo vi phạm đã được gửi tới Ban Quản Trị FPT Market để kiểm duyệt!',
          report: newReport,
        };
      },

      updateReportStatusByAdmin: (reportId, status, adminNote) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status,
                  adminNote: adminNote || r.adminNote,
                  resolvedAt: status === 'RESOLVED' || status === 'DISMISSED' ? 'Vừa xong' : undefined,
                }
              : r
          ),
        }));
      },

      getReportsByStatus: (status) => {
        const all = get().reports;
        if (!status) return all;
        return all.filter((r) => r.status === status);
      },

      getReportsByTarget: (targetId) => {
        return get().reports.filter((r) => r.targetId === targetId);
      },

      resetReports: () => set({ reports: INITIAL_REPORTS }),
    }),
    {
      name: 'fu_market_reports_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
