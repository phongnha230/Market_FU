import { apiClient } from './apiClient';

/**
 * Chuyển đổi VAPID public key từ base64 URL safe sang Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Phát âm thanh chuông "Ting ting" thông báo tinh tế bằng Web Audio API
 * (Không cần phụ thuộc file MP3 tĩnh bên ngoài, hoạt động 100% offline & tức thì)
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Nốt thứ nhất (880Hz - A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Nốt thứ hai ngân vang (1320Hz - E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    // Trình duyệt chưa cho phép autoplay audio trước tương tác đầu tiên
  }
}

export const webPushService = {
  /**
   * Kiểm tra xem trình duyệt hiện tại có hỗ trợ Web Push Notification & Service Worker không
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  /**
   * Lấy trạng thái cấp quyền hiện tại
   */
  getPermissionState(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  /**
   * Lấy VAPID Public Key từ Backend API
   */
  async getVapidPublicKey(): Promise<string> {
    try {
      const res = await apiClient.get('/notifications/vapid-public-key');
      return res.data?.data?.publicKey || res.data?.publicKey || '';
    } catch (err: any) {
      console.warn('⚠️ Không thể tải VAPID Public Key từ Backend:', err.message);
      // Fallback VAPID public key mặc định của hệ thống MarketFU
      return 'BBMT_EyZo0xXRvCosn5ko4LeBf_LVYDHANtkzrFV8I7WqWgfVadHRnYonjSuhAx2y1C72IeKfGXtTYq3mxaDw60';
    }
  },

  /**
   * Đăng ký Service Worker và nhận Push Subscription từ trình duyệt
   */
  async subscribeUser(forcePrompt = false): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;

    let permission = Notification.permission;
    if (permission !== 'granted') {
      if (!forcePrompt && permission === 'denied') return null;
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') return null;

    try {
      // 1. Đăng ký Service Worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      await navigator.serviceWorker.ready;

      // 2. Lấy VAPID public key
      const vapidKey = await this.getVapidPublicKey();
      if (!vapidKey) return null;

      // 3. Lấy hoặc tạo mới Push Subscription
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
        });
      }

      // 4. Gửi Device Token lên Backend để lưu vào MongoDB
      if (subscription) {
        const tokenString = JSON.stringify(subscription);
        await apiClient.post('/notifications/device-token', {
          token: tokenString,
          deviceType: 'WEB',
        }).catch(() => {});

        localStorage.setItem('marketfu_web_push_enabled', 'true');
      }

      return subscription;
    } catch (err: any) {
      console.warn('⚠️ Lỗi đăng ký Web Push:', err.message);
      return null;
    }
  },

  /**
   * Hủy đăng ký nhận thông báo Web Push
   */
  async unsubscribeUser(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const tokenString = JSON.stringify(subscription);
        await apiClient.delete('/notifications/device-token', {
          data: { token: tokenString },
        }).catch(() => {});
        await subscription.unsubscribe();
      }
      localStorage.removeItem('marketfu_web_push_enabled');
      return true;
    } catch {
      return false;
    }
  },
};
