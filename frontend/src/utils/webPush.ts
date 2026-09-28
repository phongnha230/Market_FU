import { notificationService } from '@/services/notificationService';

// Âm thanh thông báo nhẹ nhàng (Web Audio API không cần tải file mp3)
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Trình duyệt chưa tương tác âm thanh
  }
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

// 2. Yêu cầu quyền gửi thông báo từ người dùng
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Đăng ký token giả định hoặc token thiết bị lên backend
      const deviceToken = `web-token-${navigator.userAgent.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
      try {
        await notificationService.registerDeviceToken(deviceToken, 'WEB');
      } catch {
        // Lưu offline
      }
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
  playNotificationSound();

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
  if (typeof window === 'undefined') return;
  await registerServiceWorker();

  // Nếu người dùng đã Allow từ trước thì tự động đăng ký token
  if ('Notification' in window && Notification.permission === 'granted') {
    const existingToken = `web-token-${navigator.userAgent.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '')}`;
    notificationService.registerDeviceToken(existingToken, 'WEB').catch(() => {});
  }
}
