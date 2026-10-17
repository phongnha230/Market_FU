import { webPushService, playNotificationChime } from '@/services/webPushService';

// Âm thanh thông báo nhẹ nhàng (Web Audio API không cần tải file mp3)
export function playNotificationSound() {
  playNotificationChime();
}

// 1. Đăng ký Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('⚠️ [WebPush] Đăng ký Service Worker thất bại:', err);
    return null;
  }
}

// 2. Yêu cầu quyền gửi thông báo từ người dùng & Đăng ký Push Subscription thật
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Đăng ký PushSubscription thật với VAPID key qua webPushService
      await webPushService.subscribeUser(true).catch((err) => {
        console.warn('⚠️ [WebPush] Lỗi đăng ký PushSubscription:', err?.message);
      });
    }
    return permission;
  } catch (err) {
    console.warn('⚠️ [WebPush] Lỗi khi xin quyền Notification:', err);
    return 'denied';
  }
}

// 3. Hiển thị thông báo ngoài màn hình Desktop (Native Windows/macOS notification banner)
export async function showDesktopNotification(options: {
  title: string;
  body: string;
  targetUrl?: string;
  icon?: string;
}) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  // Phát âm thanh báo hiệu
  playNotificationChime();

  // Kiểm tra quyền
  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return;
  }

  const { title, body, targetUrl = '/', icon = '/fpt-5campus-logo.png' } = options;

  // Thử hiển thị qua Service Worker (chuẩn Web Push)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          data: { url: targetUrl },
        } as NotificationOptions);
        return;
      }
    } catch {
      // Fallback xuống standard Notification constructor
    }
  }

  // Fallback: Standard HTML5 Notification
  try {
    const notif = new Notification(title, {
      body,
      icon,
      data: { url: targetUrl },
    });

    notif.onclick = () => {
      window.focus();
      if (targetUrl) {
        window.location.href = targetUrl;
      }
      notif.close();
    };
  } catch (e) {
    console.warn('⚠️ [WebPush] Không thể tạo Desktop Notification:', e);
  }
}

// 4. Khởi tạo toàn diện Web Push khi ứng dụng khởi chạy
export async function initWebPush() {
  if (typeof window === 'undefined' || !webPushService.isSupported()) return;
  await registerServiceWorker();

  // Nếu người dùng đã cấp quyền từ trước, đồng bộ Push Subscription thật lên Backend
  if (Notification.permission === 'granted') {
    await webPushService.subscribeUser(false).catch(() => {});
  }
}
