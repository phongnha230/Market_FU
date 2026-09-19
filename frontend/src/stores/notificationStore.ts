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
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];

  // Actions
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
    id: 'notif-1',
    userId: 'user-default',
    title: 'Đơn hàng đang trên đường giao',
    body: 'Đơn hàng #ORD-88392-HCM-HL đã rời Hub Đà Nẵng và đang trung chuyển về Dom B Hòa Lạc.',
    type: 'ORDER',
    targetUrl: '/orders',
    isRead: false,
    createdAt: '15 phút trước',
  },
  {
    id: 'notif-2',
    userId: 'user-default',
    title: 'Tin nhắn mới từ Người bán',
    body: 'Trần Văn Minh đã gửi đề xuất điểm hẹn: "Bàn chờ Thư viện Beta - Hola Campus".',
    type: 'CHAT',
    targetUrl: '/chat',
    isRead: false,
    createdAt: '45 phút trước',
  },
  {
    id: 'notif-3',
    userId: 'user-default',
    title: 'Hồ sơ thẻ sinh viên đã được phê duyệt',
    body: 'Chúc mừng! Thẻ sinh viên HE172819 của bạn đã được Admin BQT phê duyệt thành công. Bạn nhận được +100 FPT Coin!',
    type: 'KYC',
    targetUrl: '/profile',
    isRead: true,
    createdAt: 'Hôm qua, 14:30',
  },
  {
    id: 'notif-4',
    userId: 'user-default',
    title: 'Thông báo quy chế giao dịch an toàn',
    body: 'BQT nhắc nhở: Hãy luôn chọn giao dịch tại các điểm Safe Handoff trong campus để tránh bị lừa đảo đặt cọc.',
    type: 'SYSTEM',
    targetUrl: '/safety',
    isRead: true,
    createdAt: '2 ngày trước',
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

        return newNotif;
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
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
    }
  )
);
