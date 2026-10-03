import { apiClient, ApiResponse } from './apiClient';

export type ReportTargetType = 'PRODUCT' | 'USER';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type DisputeStatus = 'PENDING' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OcrDataResult {
  studentId?: string;
  fullName?: string;
  campus?: string;
  cohort?: string;
  major?: string;
  validUntil?: string;
  confidence?: number;
  ocrStudentId?: string;
  ocrCohort?: string;
  ocrCampus?: string;
  ocrFullName?: string;
  ocrCccdNumber?: string;
  aiMatchScore?: number;
  [key: string]: unknown;
}

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
  targetDetail?: Record<string, unknown>;
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
    payment?: {
      totalAmount?: number;
      price?: number;
      shippingFee?: number;
      [key: string]: unknown;
    };
    product?: Record<string, unknown>;
    buyer?: {
      id?: string;
      email?: string;
      profile?: {
        fullName?: string;
        avatarUrl?: string;
        campus?: string;
      };
    };
    seller?: {
      id?: string;
      email?: string;
      profile?: {
        fullName?: string;
        avatarUrl?: string;
        campus?: string;
      };
    };
  };
}

export interface BackendKycVerification {
  id: string;
  userId: string;
  type?: string;
  studentId: string;
  cardImageUrl: string;
  cardBackUrl?: string | null;
  selfieCardUrl?: string | null;
  fullName?: string | null;
  campus?: string | null;
  cohort?: string | null;
  major?: string | null;
  phoneNumber?: string | null;
  ocrData?: OcrDataResult;
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
      fullName?: string;
      avatarUrl?: string | null;
      campus?: string;
      phoneNumber?: string;
      storeName?: string;
      bankAccount?: {
        bankName?: string;
        accountNo?: string;
        accountName?: string;
        [key: string]: unknown;
      };
      kyc?: {
        cccdNumber?: string;
        cccdFrontUrl?: string;
        cccdBackUrl?: string;
        [key: string]: unknown;
      };
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
    pagination?: Record<string, unknown>;
  }> {
    const response = await apiClient.get<ApiResponse<BackendReport[]>>('/reports/me', {
      params: { page, limit },
    });
    return {
      reports: response.data.data || [],
      pagination: response.data.meta as Record<string, unknown>,
    };
  },

  async getReports(params?: {
    status?: ReportStatus;
    targetType?: ReportTargetType;
    page?: number;
    limit?: number;
  }): Promise<{ reports: BackendReport[]; pagination?: Record<string, unknown> }> {
    const response = await apiClient.get<ApiResponse<BackendReport[]>>('/reports', {
      params,
    });
    return {
      reports: response.data.data || [],
      pagination: response.data.meta as Record<string, unknown>,
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
    const response = await apiClient.patch<ApiResponse<{ message: string; report: BackendReport }>>(`/reports/${id}/resolve`, data);
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
  }): Promise<{ disputes: BackendDispute[]; pagination?: Record<string, unknown> }> {
    const response = await apiClient.get<ApiResponse<BackendDispute[]>>('/reports/disputes', {
      params,
    });
    return {
      disputes: response.data.data || [],
      pagination: response.data.meta as Record<string, unknown>,
    };
  },

  async getDisputeById(id: string): Promise<BackendDispute> {
    const response = await apiClient.get<ApiResponse<BackendDispute>>(`/reports/disputes/${id}`);
    return response.data.data;
  },

  async cancelDispute(id: string, reason?: string): Promise<{ message: string; status: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string; status: string }>>(`/reports/disputes/${id}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  async resolveDispute(
    id: string,
    data: { decision: 'REFUND_BUYER' | 'PAY_SELLER'; adminNote?: string }
  ): Promise<{ message: string; decision: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string; decision: string }>>(`/reports/disputes/${id}/resolve`, data);
    return response.data.data;
  },

  // ==========================================
  // 3. DUYỆT THẺ SINH VIÊN KYC (MODERATION)
  // ==========================================
  async getKycVerifications(params?: {
    status?: KycStatus;
    page?: number;
    limit?: number;
  }): Promise<{ verifications: BackendKycVerification[]; pagination?: Record<string, unknown> }> {
    const response = await apiClient.get<ApiResponse<BackendKycVerification[]>>(
      '/reports/kyc/verifications',
      { params }
    );
    return {
      verifications: response.data.data || [],
      pagination: response.data.meta as Record<string, unknown>,
    };
  },

  async approveKyc(
    id: string,
    bonusCoins = 200
  ): Promise<{ message: string; bonusCoinsAwarded: number }> {
    const response = await apiClient.patch<ApiResponse<{ message: string; bonusCoinsAwarded: number }>>(`/reports/kyc/${id}/approve`, {
      bonusCoins,
    });
    return response.data.data;
  },

  async rejectKyc(id: string, reason: string): Promise<{ message: string; reason: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string; reason: string }>>(`/reports/kyc/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },

  async scanKycWithAi(id: string): Promise<{ kycId: string; ocrData: OcrDataResult; aiMatchScore: number }> {
    const response = await apiClient.post<ApiResponse<{ kycId: string; ocrData: OcrDataResult; aiMatchScore: number }>>(`/reports/kyc/${id}/ai-scan`);
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

