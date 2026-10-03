import apiClient, { ApiResponse } from './apiClient';

export interface CreateReportPayload {
  targetType: 'PRODUCT' | 'USER';
  targetId: string;
  reason: string;
  details?: string;
}

export interface ReportItem {
  id: string;
  targetType: 'PRODUCT' | 'USER';
  targetId: string;
  reason: string;
  details?: string;
  adminNote?: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export const reportMobileService = {
  /**
   * Gửi tố cáo vi phạm sản phẩm hoặc người dùng lên BQT Campus
   */
  async createReport(payload: CreateReportPayload): Promise<ReportItem> {
    const res = await apiClient.post<ApiResponse<ReportItem>>('/reports', {
      targetType: payload.targetType,
      targetId: payload.targetId,
      reason: payload.reason.trim(),
      details: payload.details?.trim() || undefined,
    });
    return res.data.data;
  },

  /**
   * Lấy lịch sử các báo cáo của người dùng hiện tại
   */
  async getMyReports(): Promise<ReportItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/reports/me');
      if (res.data?.data) {
        if (Array.isArray(res.data.data)) return res.data.data;
        if (Array.isArray((res.data.data as any).reports)) return (res.data.data as any).reports;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Người mua tự rút đơn khiếu nại tranh chấp (Cancel Dispute)
   */
  async cancelDispute(
    disputeIdOrOrderId: string,
    reason?: string
  ): Promise<{ message: string; status: string }> {
    const res = await apiClient.patch<ApiResponse<{ message: string; status: string }>>(
      `/reports/disputes/${disputeIdOrOrderId}/cancel`,
      { reason }
    );
    return res.data?.data || { message: 'Đã rút khiếu nại thành công', status: 'CANCELLED' };
  },
};

export default reportMobileService;
