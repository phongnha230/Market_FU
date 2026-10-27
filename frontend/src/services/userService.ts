import { apiClient, ApiResponse } from './apiClient';

export interface BackendUserItem {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string | null;
  avatarBadge?: string | null;
  phoneNumber?: string;
  role: string;
  campus?: string;
  campusCoins?: number;
  reputationScore?: number;
  isActive: boolean;
  createdAt: string;
  postsCount?: number;
  studentId?: string;
  major?: string;
  kycStatus?: string;
}

export interface UserListResponse {
  users: BackendUserItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userService = {
  /**
   * Lấy danh sách người dùng hệ thống từ Backend
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    campus?: string;
  }): Promise<UserListResponse> {
    const res = await apiClient.get<ApiResponse<BackendUserItem[]>>('/users', {
      params,
    });
    const rawUsers: any[] = res.data.data || [];
    const users: BackendUserItem[] = rawUsers.map((u: any) => ({
      ...u,
      fullName: u.fullName || u.profile?.fullName || '',
      campus: u.campus || u.profile?.campus || '',
      phoneNumber: u.phoneNumber || u.profile?.phoneNumber || '',
      avatarUrl: u.avatarUrl || u.profile?.avatarUrl || null,
      avatarBadge: u.avatarBadge || u.profile?.avatarBadge || null,
      campusCoins: u.campusCoins ?? u.profile?.campusCoins ?? 0,
      reputationScore: u.reputationScore ?? u.profile?.reputationScore ?? 100,
      postsCount: u.postsCount ?? u._count?.products ?? 0,
      studentId: u.studentId || u.profile?.studentId || '',
      major: u.major || '',
      kycStatus: u.kycStatus || '',
    }));
    return {
      users,
      pagination: res.data.meta as any,
    };
  },

  /**
   * Khóa hoặc mở khóa tài khoản
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<any> {
    const res = await apiClient.patch<ApiResponse<any>>(`/users/${userId}/status`, {
      isActive,
    });
    return res.data.data;
  },

  /**
   * Lấy chi tiết người dùng
   */
  async getUserById(userId: string): Promise<BackendUserItem> {
    const res = await apiClient.get<ApiResponse<BackendUserItem>>(`/users/${userId}`);
    return res.data.data;
  },
};
