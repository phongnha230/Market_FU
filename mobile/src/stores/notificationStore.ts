import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

export interface NotificationItem {
  id: string;
  category: 'all' | 'order' | 'chat' | 'promo' | 'system';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
  targetScreen?: string;
  targetParams?: any;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

interface NotificationState {
  notifications: NotificationItem[];
  isLoading: boolean;
  activeBanner: NotificationItem | null;
  hasPromptedPermission: boolean;
  pushPermissionGranted: boolean;
  isPermissionModalVisible: boolean;
  unreadCount: () => number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'time' | 'unread'>) => void;
  showBanner: (item: NotificationItem) => void;
  hideBanner: () => void;
  setPushPermissionGranted: (granted: boolean) => void;
  setPermissionModalVisible: (visible: boolean) => void;
  resetPermissionPrompt: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isLoading: false,
      activeBanner: null,
      hasPromptedPermission: false,
      pushPermissionGranted: false,
      isPermissionModalVisible: false,

      unreadCount: () => {
        return get().notifications.filter((n) => n.unread).length;
      },

      setPushPermissionGranted: (granted: boolean) => {
        set({
          pushPermissionGranted: granted,
          hasPromptedPermission: true,
          isPermissionModalVisible: false,
        });
      },

      setPermissionModalVisible: (visible: boolean) => {
        set({ isPermissionModalVisible: visible });
      },

      resetPermissionPrompt: () => {
        set({
          hasPromptedPermission: false,
          pushPermissionGranted: false,
          isPermissionModalVisible: true,
        });
      },

      showBanner: (item: NotificationItem) => {
        set({ activeBanner: item });
      },

      hideBanner: () => {
        set({ activeBanner: null });
      },

      fetchNotifications: async () => {
        try {
          set({ isLoading: true });
          const res = await apiClient.get('/notifications');
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            set({
              notifications: res.data.data.map((n: any) => ({
                id: n.id || n._id,
                category: n.category || 'system',
                title: n.title,
                body: n.body || n.content,
                time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
                unread: !n.isRead,
                icon: n.icon || 'notifications-outline',
                iconColor: '#EA580C',
                iconBg: '#FFF7ED',
                targetScreen: n.targetScreen,
                targetParams: n.targetParams,
              })),
            });
          }
        } catch (e: any) {
          console.log('⚠️ [Backend Notifications offline]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, unread: false } : n
          ),
        }));

        apiClient.patch(`/notifications/${id}/read`).catch(() => {});
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, unread: false })),
        }));

        apiClient.patch('/notifications/read-all').catch(() => {});
      },

      addNotification: (item) => {
        const newNotif: NotificationItem = {
          ...item,
          id: `notif_${Date.now()}`,
          time: 'Vừa xong',
          unread: true,
        };
        const canShowBanner = get().pushPermissionGranted;
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          activeBanner: canShowBanner ? newNotif : null,
        }));
      },
    }),
    {
      name: 'fu_notifications_storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        hasPromptedPermission: state.hasPromptedPermission,
        pushPermissionGranted: state.pushPermissionGranted,
      }),
    }
  )
);

export default useNotificationStore;
