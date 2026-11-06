import { Platform } from 'react-native';
import { navigate } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotificationStore } from '../stores/notificationStore';
import apiClient, { ApiResponse } from './apiClient';

// Helper để load expo-notifications an toàn, tránh crash trên Expo Go Android SDK 53+
function getNotificationsModule(): any | null {
  try {
    // Tránh top-level throw trên Expo Go SDK 53+
    const mod = require('expo-notifications');
    return mod;
  } catch (err: any) {
    return null;
  }
}

const Notifications = getNotificationsModule();

// Cấu hình thông báo Foreground: Cho phép hiển thị Banner Native và chuông thông báo chuẩn xác
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,  // Hiển thị banner native của hệ điều hành
        shouldPlaySound: true,  // Phát chuông âm thanh êm dịu
        shouldSetBadge: true,   // Cập nhật số badge trên icon
        shouldShowBanner: true, // Cho phép hiển thị heads-up banner
        shouldShowList: true,   // Lưu trữ vào danh sách kéo xuống của Android/iOS
      }),
    });
  } catch {}
}

export const NOTIFICATION_CHANNELS = {
  ORDERS: 'orders_channel',
  CHAT: 'chat_channel',
  SYSTEM: 'system_channel',
} as const;

/**
 * 0. Phát thông báo Heads-up trực tiếp lên thanh trạng thái / Header điện thoại
 */
const recentPushTimestamps = new Map<string, number>();

export async function displayLocalPushNotification(params: {
  title: string;
  body: string;
  data?: any;
  channelId?: string;
}) {
  const dedupKey = `${(params.title || '').trim()}_${(params.body || '').trim()}`;
  const now = Date.now();
  const lastTime = recentPushTimestamps.get(dedupKey);
  if (lastTime && now - lastTime < 4000) {
    return;
  }
  recentPushTimestamps.set(dedupKey, now);
  if (recentPushTimestamps.size > 20) {
    recentPushTimestamps.clear();
    recentPushTimestamps.set(dedupKey, now);
  }

  if (Notifications && typeof Notifications.scheduleNotificationAsync === 'function') {
    try {
      const channelId = params.channelId || NOTIFICATION_CHANNELS.SYSTEM;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          data: params.data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority?.MAX ?? 'max',
          vibrate: [0, 250, 250, 250],
          ...(Platform.OS === 'android' ? { channelId } : {}),
        },
        trigger: null,
      });
    } catch (e: any) {
      console.log('ℹ️ [Local Notification skipped]:', e?.message);
    }
  }
}

/**
 * 1. Khởi tạo Kênh thông báo Android (Notification Channels)
 * Bắt buộc từ Android 8.0 (Oreo) trở lên để thông báo hiện trên thanh Header/Status Bar
 */
export async function setupAndroidNotificationChannels() {
  if (Platform.OS === 'android' && Notifications && typeof Notifications.setNotificationChannelAsync === 'function') {
    try {
      // Kênh 1: Đơn hàng, giao dịch Escrow, Safe-Point, GHN
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.ORDERS, {
        name: 'Đơn hàng & Giao dịch Safe-Point',
        description: 'Thông báo đơn mua mới, tiền Escrow, hẹn gặp bàn giao tại Safe-Point',
        importance: Notifications.AndroidImportance?.MAX ?? 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F27024',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      // Kênh 2: Tin nhắn Chat chợ sinh viên
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.CHAT, {
        name: 'Tin nhắn Chợ sinh viên',
        description: 'Tin nhắn trao đổi, trả giá giáo trình và đồ dùng phòng trọ',
        importance: Notifications.AndroidImportance?.HIGH ?? 4,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#3B82F6',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      // Kênh 3: Hệ thống, FPT Coin & KYC
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SYSTEM, {
        name: 'Hệ thống, Điểm danh & KYC',
        description: 'Thông báo duyệt hồ sơ sinh viên, thưởng FPT Coin và bảo trì hệ thống',
        importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
        lightColor: '#10B981',
        sound: 'default',
      });
    } catch (e: any) {
      // Bỏ qua lỗi cấu hình channel trên môi trường Expo Go / Emulators
    }
  }
}

/**
 * Yêu cầu cấp quyền thông báo từ Hệ điều hành (Hiển thị Hộp thoại Popup của Android / iOS)
 * Hoạt động trên cả MÁY THỰC lẫn MÁY ẢO (Android Emulator 13+ / iOS Simulator)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications || typeof Notifications.getPermissionsAsync !== 'function') {
    return true;
  }
  try {
    const perm = (await Notifications.getPermissionsAsync()) as any;
    let finalStatus = perm?.status || (perm?.granted ? 'granted' : 'denied');

    if (finalStatus !== 'granted' && typeof Notifications.requestPermissionsAsync === 'function') {
      const req = (await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      })) as any;
      finalStatus = req?.status || (req?.granted ? 'granted' : 'denied');
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ [Quyền Thông Báo]: Người dùng đã từ chối cấp quyền thông báo');
      return false;
    }

    return true;
  } catch (error: any) {
    console.warn('⚠️ [Lỗi xin quyền thông báo]:', error?.message);
    return true;
  }
}

let activeDeviceToken: string | null = null;

/**
 * 2. Đăng ký nhận Push Notifications và lấy Device Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    await setupAndroidNotificationChannels();

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    try {
      useNotificationStore.getState().setPushPermissionGranted(true);
    } catch {}

    let token: string | null = null;

    if (Notifications && typeof Notifications.getDevicePushTokenAsync === 'function') {
      try {
        const pushTokenData = await Notifications.getDevicePushTokenAsync();
        token = pushTokenData?.data || null;
      } catch (e: any) {
        if (typeof Notifications.getExpoPushTokenAsync === 'function') {
          try {
            const expoTokenData = await Notifications.getExpoPushTokenAsync({
              projectId: '64579c58-c93c-4eed-bb47-db519499c10c',
            });
            token = expoTokenData?.data || null;
          } catch (err: any) {
            console.log('ℹ️ [Expo Push Token Error]:', err?.message);
          }
        }
      }
    }

    if (!token && Notifications && typeof Notifications.getExpoPushTokenAsync === 'function') {
      try {
        const expoTokenData = await Notifications.getExpoPushTokenAsync({
          projectId: '64579c58-c93c-4eed-bb47-db519499c10c',
        });
        token = expoTokenData?.data || null;
      } catch (err: any) {}
    }

    if (token) {
      activeDeviceToken = token;
      await syncTokenWithBackend(token);
    }

    return token;
  } catch (e: any) {
    return null;
  }
}

/**
 * 3. Đồng bộ Device Token lên Backend API
 */
export async function syncTokenWithBackend(token: string) {
  try {
    const authState = useAuthStore.getState();
    const jwtToken = authState.token;

    if (!jwtToken) return;

    await apiClient.post('/notifications/device-token', {
      token,
      deviceType: Platform.OS.toUpperCase(), // 'ANDROID' | 'IOS'
    });
    console.log('✅ [Push Notification] Đã đồng bộ Device Token lên Backend:', token.slice(0, 25) + '...');
  } catch (error: any) {
    console.warn('⚠️ [Device Token Sync Error]:', error?.message);
  }
}

/**
 * 4. Xóa Device Token khi đăng xuất
 */
export async function unregisterDeviceToken(token?: string) {
  try {
    const authState = useAuthStore.getState();
    const jwtToken = authState.token;

    const targetToken = token || activeDeviceToken;
    if (!jwtToken || !targetToken) return;

    await apiClient.delete('/notifications/device-token', {
      data: { token: targetToken },
    });
    activeDeviceToken = null;
    console.log('✅ [Push Notification] Đã hủy đăng ký Device Token');
  } catch (error: any) {
    console.warn('⚠️ [Device Token Unregister Error]:', error?.message);
  }
}

/**
 * 5. Lắng nghe sự kiện người dùng bấm vào banner thông báo trên đỉnh màn hình
 * và điều hướng chuẩn xác (Deep Linking)
 */
export function setupNotificationListeners() {
  if (!Notifications) {
    return () => {};
  }

  let notificationListener: any = null;
  let responseListener: any = null;

  try {
    if (typeof Notifications.addNotificationReceivedListener === 'function') {
      notificationListener = Notifications.addNotificationReceivedListener((notification: any) => {
        const content = notification?.request?.content;
        const data = content?.data || {};
        try {
          const { useChatStore } = require('../stores/chatStore');
          const activeConvId = useChatStore.getState?.()?.activeConversationId;
          // Nếu đang ở trực tiếp trong cuộc hội thoại này -> Không bật banner che màn hình
          if (data?.conversationId && activeConvId && activeConvId === data.conversationId) {
            return;
          }
          const { useNotificationStore } = require('../stores/notificationStore');
          useNotificationStore.getState?.().addNotification({
            title: content?.title || 'Thông báo mới',
            body: content?.body || '',
            category: data?.type === 'CHAT' ? 'chat' : data?.type === 'ORDER' ? 'order' : 'system',
            icon: data?.type === 'CHAT' ? 'chatbubbles' : data?.type === 'ORDER' ? 'shield-checkmark' : 'notifications',
            iconColor: data?.type === 'CHAT' ? '#EA580C' : '#059669',
            iconBg: data?.type === 'CHAT' ? '#FFF7ED' : '#ECFDF5',
            avatarUrl: data?.senderAvatar || data?.avatarUrl || undefined,
            targetScreen: data?.type === 'CHAT' ? 'ChatDetail' : data?.type === 'ORDER' ? 'OrderDetail' : undefined,
            targetParams: data?.conversationId ? {
              conversationId: data.conversationId,
              partner: {
                id: data.senderId || data.conversationId,
                name: data.senderName || content?.title,
                avatar: data.senderAvatar || data.avatarUrl,
              },
            } : undefined,
          });
        } catch {}
      });
    }

    if (typeof Notifications.addNotificationResponseReceivedListener === 'function') {
      responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
        const content = response?.notification?.request?.content;
        const data = content?.data || {};
        const title = content?.title;
        handleNotificationNavigation({
          ...data,
          senderName: data?.senderName || (title && title !== 'Tin nhắn mới' ? title : undefined),
          title: data?.senderName || title,
        });
      });
    }
  } catch (e: any) {
    console.log('ℹ️ [setupNotificationListeners skipped on Expo Go]:', e?.message);
  }

  return () => {
    try {
      notificationListener?.remove?.();
      responseListener?.remove?.();
    } catch {}
  };
}

/**
 * Bộ điều hướng thông minh theo loại thông báo
 */
export function handleNotificationNavigation(data: any) {
  if (!data) return;

  const { type, orderId, conversationId, targetUrl, productId } = data;

  if (type === 'ORDER' || orderId) {
    navigate('OrderDetail', { orderId: orderId || extractIdFromUrl(targetUrl) });
  } else if (type === 'CHAT' || conversationId) {
    const pName = data?.senderName || (data?.title && data?.title !== 'Tin nhắn mới' ? data?.title : undefined);
    const pAvatar = data?.senderAvatar || data?.avatarUrl;
    navigate('ChatDetail', {
      conversationId,
      partner: {
        id: data?.senderId || conversationId,
        name: pName,
        avatar: pAvatar,
      },
    });
  } else if (type === 'KYC') {
    navigate('AccountSettings');
  } else if (productId) {
    navigate('ProductDetail', { productId });
  } else {
    navigate('Notification');
  }
}

function extractIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&]id=([^&]+)/) || url.match(/\/([^\/?]+)$/);
  return match ? match[1] : undefined;
}

/**
 * 6. Các phương thức giao tiếp RESTful API Thông báo Backend
 */
export async function getNotifications(params?: { page?: number; limit?: number }): Promise<any[]> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/notifications', { params });
    const data = res.data?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.notifications)) return data.notifications;
    return [];
  } catch (e: any) {
    console.log('⚠️ [Backend getNotifications offline]:', e?.message);
    return [];
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/notifications/unread-count');
    return res.data?.data?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationAsRead(id: string): Promise<any> {
  try {
    const res = await apiClient.patch<ApiResponse<any>>(`/notifications/${id}/read`);
    return res.data?.data;
  } catch (e: any) {
    console.log('⚠️ [markNotificationAsRead]:', e?.message);
  }
}

export async function markAllNotificationsAsRead(): Promise<any> {
  try {
    const res = await apiClient.patch<ApiResponse<any>>('/notifications/read-all');
    return res.data?.data;
  } catch (e: any) {
    console.log('⚠️ [markAllNotificationsAsRead]:', e?.message);
  }
}

export const notificationMobileService = {
  displayLocalPushNotification,
  setupAndroidNotificationChannels,
  requestNotificationPermission,
  registerForPushNotificationsAsync,
  syncTokenWithBackend,
  unregisterDeviceToken,
  setupNotificationListeners,
  handleNotificationNavigation,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationMobileService;
