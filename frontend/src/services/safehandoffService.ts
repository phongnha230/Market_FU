import { apiClient, ApiResponse } from './apiClient';

export type CampusCode = 'HOL' | 'HCM' | 'DAD' | 'DN' | 'QN' | 'CT';

export interface SafeHandoffHubItem {
  id: string;
  code: string;
  name: string;
  campus: 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT';
  storageCapacity: string;
  cameras: string;
  staffCount: string;
  status: string;
  isOperating: boolean;
  operatingHours: string;
  locationDetails?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HubStats {
  total: number;
  operating: number;
  maintenance: number;
}

export interface HubListResponse {
  hubs: SafeHandoffHubItem[];
  stats: HubStats;
}

export interface CreateHubPayload {
  name: string;
  code: string;
  campus: 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT';
  storageCapacity?: string;
  cameras?: string;
  staffCount?: string;
  status?: string;
  operatingHours?: string;
  locationDetails?: string;
  notes?: string;
}

export const safehandoffService = {
  /**
   * Lấy danh sách trạm Safe-Handoff từ backend
   */
  async getHubs(params?: { campus?: string; status?: string; search?: string }): Promise<HubListResponse> {
    const res = await apiClient.get<ApiResponse<SafeHandoffHubItem[]>>('/safe-handoff', {
      params,
    });
    return {
      hubs: res.data?.data || [],
      stats: (res.data?.meta as unknown as HubStats) || { total: 0, operating: 0, maintenance: 0 },
    };
  },

  /**
   * Lấy chi tiết 1 trạm
   */
  async getHubById(id: string): Promise<SafeHandoffHubItem> {
    const res = await apiClient.get<ApiResponse<SafeHandoffHubItem>>(`/safe-handoff/${id}`);
    return res.data?.data;
  },

  /**
   * Tạo trạm mới (Admin)
   */
  async createHub(payload: CreateHubPayload): Promise<SafeHandoffHubItem> {
    const res = await apiClient.post<ApiResponse<SafeHandoffHubItem>>('/safe-handoff', payload);
    return res.data.data;
  },

  /**
   * Cập nhật trạm (Admin)
   */
  async updateHub(id: string, payload: Partial<CreateHubPayload>): Promise<SafeHandoffHubItem> {
    const res = await apiClient.patch<ApiResponse<SafeHandoffHubItem>>(`/safe-handoff/${id}`, payload);
    return res.data.data;
  },

  /**
   * Bật/Tắt trạng thái hoạt động (Admin)
   */
  async toggleHubStatus(id: string): Promise<SafeHandoffHubItem> {
    const res = await apiClient.patch<ApiResponse<SafeHandoffHubItem>>(`/safe-handoff/${id}/toggle`);
    return res.data.data;
  },

  /**
   * Xóa trạm (Admin)
   */
  async deleteHub(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(`/safe-handoff/${id}`);
    return res.data.data;
  },
};
