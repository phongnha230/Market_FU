import webpush from 'web-push';
import { ENV } from './env';

const DEFAULT_PUBLIC_KEY = 'BBMT_EyZo0xXRvCosn5ko4LeBf_LVYDHANtkzrFV8I7WqWgfVadHRnYonjSuhAx2y1C72IeKfGXtTYq3mxaDw60';
const DEFAULT_PRIVATE_KEY = 'ZB1XWC2q9Rm5VREh2R7jIHnElItfNHIqNUeU5YRU27s';
const DEFAULT_SUBJECT = 'mailto:admin@marketfu.com';

export const vapidPublicKey = ENV.VAPID_PUBLIC_KEY || DEFAULT_PUBLIC_KEY;
export const vapidPrivateKey = ENV.VAPID_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;
export const vapidSubject = ENV.VAPID_SUBJECT || DEFAULT_SUBJECT;

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  console.log('✅ [WEB-PUSH] Cấu hình VAPID Web Push thành công');
} catch (err: any) {
  console.warn('⚠️ [WEB-PUSH] Không thể khởi tạo VAPID details:', err.message);
}

export { webpush };
