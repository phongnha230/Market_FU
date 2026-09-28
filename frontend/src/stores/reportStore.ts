import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { useUserStore } from './userStore';

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

export const INITIAL_REPORTS: ReportItem[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],

      submitReport: ({ targetType, targetId, targetTitle, reason, details, proofImageUrl }) => {
        const user = useUserStore.getState().user;
        const newReport: ReportItem = {
          id: `rep-${Date.now()}`,
          reporterId: user.id || 'user-anonymous',
          reporterName: user.name || 'Sinh viên FPT',
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

      resetReports: () => set({ reports: [] }),
    }),
    {
      name: 'fu_market_reports_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.reports = (state.reports || []).filter(
            (r) => r.id !== 'rep-1' && r.id !== 'rep-2' && r.reporterName !== 'Lê Minh Quân'
          );
        }
      },
    }
  )
);
