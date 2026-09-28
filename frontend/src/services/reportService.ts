import { apiClient, ApiResponse } from './apiClient';

export type ReportTargetType = 'PRODUCT' | 'USER';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type DisputeStatus = 'PENDING' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BackendReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string | null;
  status: ReportStatus;
  adminNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  reporter?: {
    id: string;
    email: string;
    profile?: { fullName: string; campus?: string };
  };
  targetDetail?: any;
}

export interface BackendDispute {
  id: string;
  orderId: string;
  claimantId: string;
  reason: string;
  proofVideoUrl: string;
  status: DisputeStatus;
  adminNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderCode: string;
    buyerId: string;
    sellerId: string;
    status: string;
    payment?: any;
    product?: any;
    buyer?: any;
    seller?: any;
  };
}

export interface BackendKycVerification {
  id: string;
  userId: string;
  type?: string;
  studentId: string;
  cardImageUrl: string;
  ocrData?: any;
  aiMatchScore?: number;
  status: KycStatus;
  rejectedReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
    profile?: {
      fullName: string;
      campus?: string;
      phoneNumber?: string;
      bankAccount?: any;
    };
  };
}

export const reportService = {
  // ==========================================
  // 1. TỐ CÁO VI PHẠM (REPORTS)
  // ==========================================
  async createReport(data: {
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
    details?: string;
  }): Promise<BackendReport> {
    const response = await apiClient.post<ApiResponse<BackendReport>>('/reports', data);
    return response.data.data;
  },

  async getMyReports(page = 1, limit = 20): Promise<{
    reports: BackendReport[];
    pagination?: any;
  }> {
    const response = await apiClient.get<ApiResponse<BackendReport[]>>('/reports/me', {
      params: { page, limit },
    });
    return {
      reports: response.data.data || [],
      pagination: response.data.meta,
    };
  },

  async getReports(params?: {
    status?: ReportStatus;
    targetType?: ReportTargetType;
    page?: number;
    limit?: number;
  }): Promise<{ reports: BackendReport[]; pagination?: any }> {
    const response = await apiClient.get<ApiResponse<BackendReport[]>>('/reports', {
      params,
    });
    return {
      reports: response.data.data || [],
      pagination: response.data.meta,
    };
  },

  async getReportById(id: string): Promise<BackendReport> {
    const response = await apiClient.get<ApiResponse<BackendReport>>(`/reports/${id}`);
    return response.data.data;
  },

  async resolveReport(
    id: string,
    data: { action: 'BAN_USER' | 'HIDE_PRODUCT' | 'DISMISS'; adminNote?: string }
  ): Promise<{ message: string; report: BackendReport }> {
    const response = await apiClient.patch<ApiResponse<any>>(`/reports/${id}/resolve`, data);
    return response.data.data;
  },

  // ==========================================
  // 2. KHIẾU NẠI ĐỔI TRẢ (DISPUTES)
  // ==========================================
  async createDispute(data: {
    orderId: string;
    reason: string;
    proofVideoUrl: string;
  }): Promise<BackendDispute> {
    const response = await apiClient.post<ApiResponse<BackendDispute>>('/reports/disputes', data);
    return response.data.data;
  },

  async getDisputes(params?: {
    status?: DisputeStatus;
    page?: number;
    limit?: number;
  }): Promise<{ disputes: BackendDispute[]; pagination?: any }> {
    const response = await apiClient.get<ApiResponse<BackendDispute[]>>('/reports/disputes', {
      params,
    });
    return {
      disputes: response.data.data || [],
      pagination: response.data.meta,
    };
  },

  async getDisputeById(id: string): Promise<BackendDispute> {
    const response = await apiClient.get<ApiResponse<BackendDispute>>(`/reports/disputes/${id}`);
    return response.data.data;
  },

  async cancelDispute(id: string, reason?: string): Promise<{ message: string; status: string }> {
    const response = await apiClient.patch<ApiResponse<any>>(`/reports/disputes/${id}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  async resolveDispute(
    id: string,
    data: { decision: 'REFUND_BUYER' | 'PAY_SELLER'; adminNote?: string }
  ): Promise<{ message: string; decision: string }> {
    const response = await apiClient.patch<ApiResponse<any>>(`/reports/disputes/${id}/resolve`, data);
    return response.data.data;
  },

  // ==========================================
  // 3. DUYỆT THẺ SINH VIÊN KYC (MODERATION)
  // ==========================================
  async getKycVerifications(params?: {
    status?: KycStatus;
    page?: number;
    limit?: number;
  }): Promise<{ verifications: BackendKycVerification[]; pagination?: any }> {
    const response = await apiClient.get<ApiResponse<BackendKycVerification[]>>(
      '/reports/kyc/verifications',
      { params }
    );
    return {
      verifications: response.data.data || [],
      pagination: response.data.meta,
    };
  },

  async approveKyc(
    id: string,
    bonusCoins = 200
  ): Promise<{ message: string; bonusCoinsAwarded: number }> {
    const response = await apiClient.patch<ApiResponse<any>>(`/reports/kyc/${id}/approve`, {
      bonusCoins,
    });
    return response.data.data;
  },

  async rejectKyc(id: string, reason: string): Promise<{ message: string; reason: string }> {
    const response = await apiClient.patch<ApiResponse<any>>(`/reports/kyc/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },

  async scanKycWithAi(id: string): Promise<{ kycId: string; ocrData: any; aiMatchScore: number }> {
    const response = await apiClient.post<ApiResponse<any>>(`/reports/kyc/${id}/ai-scan`);
    return response.data.data;
  },

  // ==========================================
  // 4. THỐNG KÊ DOANH SỐ HỌC KỲ (SEMESTER ANALYTICS)
  // ==========================================
  async getSemesterAnalytics(params?: {
    semester?: string;
    campus?: string;
  }): Promise<SemesterAnalyticsData> {
    const response = await apiClient.get<ApiResponse<SemesterAnalyticsData>>(
      '/reports/analytics/semesters',
      { params }
    );
    return response.data.data;
  },
};

export interface CampusMetricBreakdown {
  campus: string;
  name: string;
  totalOrders: number;
  completedOrders: number;
  gmv: number;
}

export interface SemesterAnalyticsData {
  semester: string;
  semesterLabel: string;
  campus: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    escrowHoldingAmount: number;
    completedCount: number;
    kycVerifiedCount: number;
    totalGMV: number;
    completedGMV: number;
    totalOrders: number;
    disputedCount: number;
    cancelledCount: number;
    holdingCount: number;
    safetyRate: number;
    operatingHubsCount: number;
  };
  campusBreakdown: CampusMetricBreakdown[];
}

