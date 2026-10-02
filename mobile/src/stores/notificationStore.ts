import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n_1',
    category: 'order',
    title: '🛡️ Bảo lãnh Escrow đã kích hoạt',
    body: 'Người mua đã nạp 1.850.000đ vào tài khoản bảo chứng Escrow cho đơn hàng #ORD-882194 (Màn hình Dell 24"). Tiền được giữ an toàn, vui lòng hẹn gặp giao hàng tại Safe-Point!',
    time: '5 phút trước',
    unread: true,
    icon: 'shield-checkmark',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    targetScreen: 'OrderDetail',
    targetParams: { orderId: 'ORD-882194' },
  },
  {
    id: 'n_2',
    category: 'chat',
    title: '💬 Đề xuất giá mới (-50.000đ)',
    body: 'Trần Minh Quân vừa gửi đề nghị giá 430.000đ cho sản phẩm Bàn phím cơ Akko 3087 của bạn. Hãy bấm để phản hồi ngay!',
    time: '25 phút trước',
    unread: true,
    icon: 'pricetag',
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    targetScreen: 'ChatDetail',
  },
  {
    id: 'n_3',
    category: 'order',
    title: '📍 Nhắc hẹn tại Safe-Point Sảnh Alpha',
    body: 'Bạn có lịch hẹn giao nhận hàng lúc 16:30 chiều nay tại Bàn test Sảnh Tòa Alpha (Khu vực có Camera 24/7 và nguồn điện 220V).',
    time: '2 giờ trước',
    unread: true,
    icon: 'location',
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    targetScreen: 'OrderDetail',
    targetParams: { orderId: 'ORD-882194' },
  },
  {
    id: 'n_4',
    category: 'promo',
    title: '⭐ Cộng +20 Điểm Uy tín Campus',
    body: 'Người mua đã xác nhận nhận hàng thành công và đánh giá 5 sao! Điểm uy tín của bạn tăng lên 98/100, mở khóa huy hiệu "Người bán tin cậy".',
    time: 'Hôm qua',
    unread: false,
    icon: 'star',
    iconColor: '#EAB308',
    iconBg: '#FEFCE8',
    targetScreen: 'Review',
  },
];

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: () => number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'time' | 'unread'>) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,

      unreadCount: () => {
        return get().notifications.filter((n) => n.unread).length;
      },

      markAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, unread: false } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, unread: false })),
        }));
      },

      addNotification: (item) => {
        const newNotif: NotificationItem = {
          ...item,
          id: `notif_${Date.now()}`,
          time: 'Vừa xong',
          unread: true,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },
    }),
    {
      name: 'fu_notifications_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;
