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

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      fetchNotifications: async () => {
        try {
          const res = await notificationService.getUserNotifications();
          if (res.notifications) {
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

      resetNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'fu_market_notifications_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state && !state.notifications) {
          state.notifications = [];
        }
      },
    }
  )
);
