import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from '@/utils/safeStorage';

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
  notificationsByUser: Record<string, NotificationItem[]>;
  activeUserId: string | null;
  notifications: NotificationItem[];

  // Actions
  setActiveUser: (userId: string | null) => void;
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
      notificationsByUser: {},
      activeUserId: null,
      notifications: [],

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim().toLowerCase() : null;
        const state = get();
        const userNotifs = uId && state.notificationsByUser[uId] ? state.notificationsByUser[uId] : [];
        set({
          activeUserId: uId,
          notifications: userNotifs,
        });
      },

      fetchNotifications: async () => {
        const state = get();
        const uId = state.activeUserId;
        if (!uId) {
          set({ notifications: [] });
          return;
        }

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
            set((st) => ({
              notifications: mapped,
              notificationsByUser: {
                ...st.notificationsByUser,
                [uId]: mapped,
              },
            }));
          }
        } catch {
          // fallback to current local state
        }
      },

      initSocketListeners: () => {
        const cleanup = socketClient.onNewNotification((notif) => {
          if (!notif) return;
          const uId = get().activeUserId;
          if (!uId) return;

          // Nếu thông báo hướng đến tài khoản cụ thể, chỉ hiển thị nếu khớp với user đang đăng nhập
          if (notif.userId && String(notif.userId).trim().toLowerCase() !== uId) {
            return;
          }

          const newNotif: NotificationItem = {
            id: notif.id || `notif-${Date.now()}`,
            userId: notif.userId || uId,
            title: notif.title || 'Thông báo mới',
            body: notif.body || '',
            type: notif.type || 'SYSTEM',
            targetUrl: notif.targetUrl || '/profile',
            isRead: false,
            createdAt: 'Vừa xong',
          };

          set((state) => {
            const currentList = state.notificationsByUser[uId] || [];
            const updated = [newNotif, ...currentList];
            return {
              notifications: updated,
              notificationsByUser: {
                ...state.notificationsByUser,
                [uId]: updated,
              },
            };
          });

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
        const uId = get().activeUserId;
        const newNotif: NotificationItem = {
          ...params,
          id: `notif-${Date.now()}`,
          isRead: false,
          createdAt: 'Vừa xong',
        };

        if (uId) {
          set((state) => {
            const currentList = state.notificationsByUser[uId] || [];
            const updated = [newNotif, ...currentList];
            return {
              notifications: updated,
              notificationsByUser: {
                ...state.notificationsByUser,
                [uId]: updated,
              },
            };
          });
        }

        showDesktopNotification({
          title: newNotif.title,
          body: newNotif.body,
          targetUrl: newNotif.targetUrl,
        });

        return newNotif;
      },

      markAsRead: (id) => {
        notificationService.markAsRead(id).catch(() => {});
        const uId = get().activeUserId;
        if (!uId) return;

        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updated,
            notificationsByUser: {
              ...state.notificationsByUser,
              [uId]: updated,
            },
          };
        });
      },

      markAllAsRead: () => {
        notificationService.markAllAsRead().catch(() => {});
        const uId = get().activeUserId;
        if (!uId) return;

        set((state) => {
          const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
          return {
            notifications: updated,
            notificationsByUser: {
              ...state.notificationsByUser,
              [uId]: updated,
            },
          };
        });
      },

      deleteNotification: (id) => {
        notificationService.deleteNotification(id).catch(() => {});
        const uId = get().activeUserId;
        if (!uId) return;

        set((state) => {
          const updated = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updated,
            notificationsByUser: {
              ...state.notificationsByUser,
              [uId]: updated,
            },
          };
        });
      },

      clearAll: () => {
        notificationService.clearAllNotifications().catch(() => {});
        const uId = get().activeUserId;
        if (!uId) return;

        set((state) => ({
          notifications: [],
          notificationsByUser: {
            ...state.notificationsByUser,
            [uId]: [],
          },
        }));
      },

      getUnreadCount: () => {
        const state = get();
        if (!state.activeUserId) return 0;
        return state.notifications.filter((n) => !n.isRead).length;
      },

      getByType: (type) => {
        const all = get().notifications;
        if (!type) return all;
        return all.filter((n) => n.type === type);
      },

      resetNotifications: () =>
        set({
          notifications: [],
          activeUserId: null,
        }),
    }),
    {
      name: 'fu_market_notifications_storage',
      storage: createJSONStorage(() => safeLocalStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.notificationsByUser || typeof state.notificationsByUser !== 'object') {
            state.notificationsByUser = {};
          }
          // Khi chưa đăng nhập hoặc không có activeUserId, làm sạch hoàn toàn notifications để khách không xem được
          if (!state.activeUserId) {
            state.notifications = [];
          } else {
            state.notifications = state.notificationsByUser[state.activeUserId] || [];
          }
        }
      },
    }
  )
);
