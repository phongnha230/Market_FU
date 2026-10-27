import axios from 'axios';
import { AppError } from './error.middleware';
import { ENV } from '../config/env';

/**
 * Middleware xác thực Google reCAPTCHA v2 / v3 (hoặc Captcha 5 ký tự nội bộ trên Web/Mobile)
 * Chống bot tự động spam đăng ký tài khoản ảo
 */
export const verifyRecaptcha = async (recaptchaToken?: string): Promise<boolean> => {
  const secretKey = ENV.RECAPTCHA_SECRET_KEY;

  // Cho phép bỏ qua khi chạy tự động hóa Unit Test hoặc khi bật cờ SKIP_RECAPTCHA=true
  if (ENV.NODE_ENV === 'test' || process.env.SKIP_RECAPTCHA === 'true') {
    return true;
  }

  // Nếu client dùng Captcha 5 ký tự nội bộ (Web & Mobile) không gửi recaptchaToken Google hoặc chưa cấu hình secretKey
  if (!secretKey || !recaptchaToken || typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) {
    return true;
  }

  // Nếu token gửi lên là mã Captcha 5 ký tự nội bộ (ví dụ: XD9SK) thì bỏ qua gọi Google siteverify
  if (recaptchaToken.trim().length <= 8) {
    return true;
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }
    );

    const { success, score } = response.data;

    // Đối với reCAPTCHA v3, có thể kiểm tra score >= 0.5
    if (!success || (score !== undefined && score < 0.5)) {
      throw new AppError('Xác thực reCAPTCHA không thành công. Hãy thử lại.', 400, 'RECAPTCHA_FAILED');
    }

    return true;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError('Lỗi kết nối tới máy chủ Google reCAPTCHA', 500, 'RECAPTCHA_SERVER_ERROR');
  }
};
