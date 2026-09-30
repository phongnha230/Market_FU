import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NotificationType = 'CHAT' | 'ORDER' | 'KYC' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  targetUrl?: string;
  actionText?: string;
  actionUrl?: string;
  adminFeedback?: string;
  senderName?: string;
  senderAvatar?: string;
  isRead: boolean;
  createdAt: string;
}

import { notificationService, BackendNotification } from '@/services/notificationService';
import { socketClient } from '@/services/socketClient';
import { showDesktopNotification } from '@/utils/webPush';

interface NotificationState {
  notifications: NotificationItem[];

  // Actions
  fetchNotifications: () => Promise<void>;
  initSocketListeners: () => () => void;
  addNotification: (params: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => NotificationItem;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  getByType: (type?: NotificationType) => NotificationItem[];
  resetNotifications: () => void;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'demo-notif-1',
    userId: 'current-user',
    title: 'Khách mua nhắn tin: Trần Văn Đạt',
    body: 'Em chào anh, giáo trình CSD201 anh đăng pass ở Dom E còn không ạ? Tối nay em qua sảnh Alpha lấy được không?',
    type: 'CHAT',
    targetUrl: '/chat',
    actionText: 'Mở cuộc trò chuyện',
    senderName: 'Trần Văn Đạt',
    isRead: false,
    createdAt: '10 phút trước',
  },
  {
    id: 'demo-notif-2',
    userId: 'current-user',
    title: 'Hồ sơ xác thực Sinh viên / Seller bị từ chối',
    body: 'Admin phản hồi: Ảnh chụp thẻ sinh viên bị chói sáng ở mã số SV (MSSV). Vui lòng chụp lại rõ nét cả 2 mặt và nộp lại.',
    type: 'KYC',
    targetUrl: '/profile?openKyc=true&role=student',
    actionText: 'Chỉnh đơn & Nộp lại',
    adminFeedback: 'Ảnh chụp mặt trước bị lóa đèn flash, không thấy rõ MSSV và niên khóa. Vui lòng chụp lại rõ ràng trên mặt phẳng đủ ánh sáng.',
    isRead: false,
    createdAt: '45 phút trước',
  },
  {
    id: 'demo-notif-3',
    userId: 'current-user',
    title: 'Mua hàng thành công: Giáo trình PRF192',
    body: 'Đơn hàng #ORD-8921 đã thanh toán thành công qua Safe-Handoff. Điểm hẹn bàn giao đồ: Sảnh tòa Alpha Hola.',
    type: 'ORDER',
    targetUrl: '/orders',
    actionText: 'Xem chi tiết đơn',
    isRead: false,
    createdAt: '2 giờ trước',
  },
  {
    id: 'demo-notif-4',
    userId: 'current-user',
    title: 'Chào mừng bạn đến với FPT 5Campus Marketplace',
    body: 'Khám phá cộng đồng trao đổi đồ dùng sinh viên FPT an toàn, tiện lợi. Điểm danh mỗi ngày để nhận ngay FPT Coin!',
    type: 'SYSTEM',
    targetUrl: '/profile',
    actionText: 'Xem hồ sơ',
    isRead: true,
    createdAt: '1 ngày trước',
  },
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,

      fetchNotifications: async () => {
        try {
          const res = await notificationService.getUserNotifications();
          if (res.notifications && res.notifications.length > 0) {
            const mapped: NotificationItem[] = res.notifications.map((n) => ({
              id: n.id,
              userId: n.userId,
              title: n.title,
              body: n.body,
              type: n.type,
              targetUrl: n.type === 'CHAT' ? '/chat' : n.type === 'ORDER' ? '/orders' : '/profile',
              isRead: n.isRead,
              createdAt: new Date(n.createdAt).toLocaleDateString('vi-VN'),
            }));
            set({ notifications: mapped });
          }
        } catch {
          // fallback to current local state
        }
      },

      initSocketListeners: () => {
        const cleanup = socketClient.onNewNotification((notif) => {
          if (!notif) return;
          const newNotif: NotificationItem = {
            id: notif.id || `notif-${Date.now()}`,
            userId: notif.userId || '',
            title: notif.title || 'Thông báo mới',
            body: notif.body || '',
            type: notif.type || 'SYSTEM',
            targetUrl: notif.targetUrl || '/profile',
            isRead: false,
            createdAt: 'Vừa xong',
          };
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
          }));

          // Tự động làm mới số dư Xu & quyền tài khoản khi có thông báo KYC hoặc thưởng Xu
          if (newNotif.type === 'KYC' || newNotif.title?.includes('Xu') || newNotif.body?.includes('Xu')) {
            import('@/services/profileService').then(({ profileService }) => {
              profileService.getProfile().catch(() => {});
            }).catch(() => {});
          }

          showDesktopNotification({
            title: newNotif.title,
            body: newNotif.body,
            targetUrl: newNotif.targetUrl,
          });
        });
        return cleanup;
      },

      addNotification: (params) => {
        const newNotif: NotificationItem = {
          ...params,
          id: `notif-${Date.now()}`,
          isRead: false,
          createdAt: 'Vừa xong',
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));

        showDesktopNotification({
          title: newNotif.title,
          body: newNotif.body,
          targetUrl: newNotif.targetUrl,
        });

        return newNotif;
      },

      markAsRead: (id) => {
        notificationService.markAsRead(id).catch(() => {});
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        notificationService.markAllAsRead().catch(() => {});
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      getByType: (type) => {
        const all = get().notifications;
        if (!type) return all;
        return all.filter((n) => n.type === type);
      },

      resetNotifications: () => set({ notifications: INITIAL_NOTIFICATIONS }),
    }),
    {
      name: 'fu_market_notifications_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.notifications || state.notifications.length === 0)) {
          state.notifications = INITIAL_NOTIFICATIONS;
        }
      },
    }
  )
);
