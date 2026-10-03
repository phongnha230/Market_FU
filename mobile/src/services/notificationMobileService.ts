import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { navigate } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/useAuthStore';
import apiClient, { ApiResponse } from './apiClient';

// Cấu hình hiển thị notification banner (Heads-up) ngay cả khi app đang mở (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NOTIFICATION_CHANNELS = {
  ORDERS: 'orders_channel',
  CHAT: 'chat_channel',
  SYSTEM: 'system_channel',
} as const;

/**
 * 1. Khởi tạo Kênh thông báo Android (Notification Channels)
 * Bắt buộc từ Android 8.0 (Oreo) trở lên để thông báo hiện trên thanh Header/Status Bar
 */
export async function setupAndroidNotificationChannels() {
  if (Platform.OS === 'android') {
    // Kênh 1: Đơn hàng, giao dịch Escrow, Safe-Point, GHN (Ưu tiên Cao nhất - MAX: Thò banner trên đỉnh màn hình)
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.ORDERS, {
      name: 'Đơn hàng & Giao dịch Safe-Point',
      description: 'Thông báo đơn mua mới, tiền Escrow, hẹn gặp bàn giao tại Safe-Point',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F27024',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Kênh 2: Tin nhắn Chat chợ sinh viên (Ưu tiên HIGH: Bật popup và chuông)
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.CHAT, {
      name: 'Tin nhắn Chợ sinh viên',
      description: 'Tin nhắn trao đổi, trả giá giáo trình và đồ dùng phòng trọ',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#3B82F6',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Kênh 3: Hệ thống, FPT Coin & KYC (Ưu tiên DEFAULT)
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.SYSTEM, {
      name: 'Hệ thống, Điểm danh & KYC',
      description: 'Thông báo duyệt hồ sơ sinh viên, thưởng FPT Coin và bảo trì hệ thống',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#10B981',
      sound: 'default',
    });
  }
}

/**
 * Yêu cầu cấp quyền thông báo từ Hệ điều hành (Hiển thị Hộp thoại Popup của Android / iOS)
 * Hoạt động trên cả MÁY THỰC lẫn MÁY ẢO (Android Emulator 13+ / iOS Simulator)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const perm = (await Notifications.getPermissionsAsync()) as any;
    let finalStatus = perm.status || (perm.granted ? 'granted' : 'denied');

    if (finalStatus !== 'granted') {
      // Kích hoạt hiển thị hộp thoại hệ thống: "Cho phép FU SecondHand gửi thông báo cho bạn?"
      const req = (await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      })) as any;
      finalStatus = req.status || (req.granted ? 'granted' : 'denied');
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ [Quyền Thông Báo]: Người dùng đã từ chối cấp quyền thông báo');
      return false;
    }

    return true;
  } catch (error: any) {
    console.warn('⚠️ [Lỗi xin quyền thông báo]:', error?.message);
    return false;
  }
}

/**
 * 2. Đăng ký nhận Push Notifications và lấy Device Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  await setupAndroidNotificationChannels();

  // 1. Kích hoạt Popup xin quyền thông báo hệ thống
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  let token: string | null = null;

  try {
    // 2. Ưu tiên lấy Device Push Token Native (FCM Token từ google-services.json)
    const pushTokenData = await Notifications.getDevicePushTokenAsync();
    token = pushTokenData.data;
  } catch (e: any) {
    try {
      // Fallback sang Expo Push Token nếu đang chạy trong môi trường Expo Go / Máy ảo
      const expoTokenData = await Notifications.getExpoPushTokenAsync();
      token = expoTokenData.data;
    } catch (err: any) {
      console.log('ℹ️ [Máy ảo / Môi trường Dev]: Bật thông báo local thành công');
    }
  }

  // 3. Gửi token lên backend lưu vào DeviceToken (nếu lấy được token)
  if (token) {
    await syncTokenWithBackend(token);
  }

  return token;
}

/**
 * 3. Đồng bộ Device Token lên Backend API
 */
export async function syncTokenWithBackend(token: string) {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    const authState = useAuthStore.getState();
    const jwtToken = authState.token;

    if (!jwtToken) return;

    await fetch(`${apiUrl}/api/notifications/device-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        token,
        deviceType: Platform.OS.toUpperCase(), // 'ANDROID' | 'IOS'
      }),
    });
  } catch (error: any) {
    console.warn('⚠️ [Device Token Sync Error]:', error?.message);
  }
}

/**
 * 4. Xóa Device Token khi đăng xuất
 */
export async function unregisterDeviceToken(token: string) {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    const authState = useAuthStore.getState();
    const jwtToken = authState.token;

    if (!jwtToken) return;

    await fetch(`${apiUrl}/api/notifications/device-token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch (error: any) {
    console.warn('⚠️ [Device Token Unregister Error]:', error?.message);
  }
}

/**
 * 5. Lắng nghe sự kiện người dùng bấm vào banner thông báo trên đỉnh màn hình
 * và điều hướng chuẩn xác (Deep Linking)
 */
export function setupNotificationListeners() {
  // Lắng nghe khi thông báo nhận được lúc app đang mở
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log('🔔 [Heads-up Notification Received]:', notification.request.content.title);
  });

  // Lắng nghe khi người dùng BẤM vào banner thông báo thả xuống trên màn hình
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    handleNotificationNavigation(data);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
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
    navigate('ChatDetail', { partner: { id: conversationId } });
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
