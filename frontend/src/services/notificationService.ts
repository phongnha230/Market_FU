import { apiClient, ApiResponse } from './apiClient';

export interface BackendNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'CHAT' | 'ORDER' | 'KYC' | 'SYSTEM';
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

export const notificationService = {
  // 1. Lấy danh sách thông báo
  async getUserNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<{
    notifications: BackendNotification[];
    meta?: any;
  }> {
    const response = await apiClient.get<any>('/notifications', {
      params,
    });
    const rawData = response.data?.data;
    const list: BackendNotification[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.notifications)
      ? rawData.notifications
      : [];
    return {
      notifications: list,
      meta: response.data?.meta || rawData?.pagination,
    };
  },

  // 2. Lấy số lượng thông báo chưa đọc
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data || { unreadCount: 0 };
  },

  // 3. Đánh dấu đã đọc một thông báo
  async markAsRead(notificationId: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  },

  // 4. Đánh dấu đã đọc toàn bộ thông báo
  async markAllAsRead(): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>('/notifications/read-all');
    return response.data.data;
  },

  // 5. Đăng ký FCM Device Token
  async registerDeviceToken(
    token: string,
    deviceType: 'WEB' | 'ANDROID' | 'IOS' = 'WEB'
  ): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/notifications/device-token', {
      token,
      deviceType,
    });
    return response.data.data;
  },

  // 6. Xóa một thông báo
  async deleteNotification(notificationId: string): Promise<any> {
    const response = await apiClient.delete<ApiResponse<any>>(`/notifications/${notificationId}`);
    return response.data.data;
  },

  // 7. Xóa toàn bộ thông báo của người dùng
  async clearAllNotifications(): Promise<any> {
    const response = await apiClient.delete<ApiResponse<any>>('/notifications');
    return response.data.data;
  },
};
