import axios from 'axios';
import { AppError } from './error.middleware';
import { ENV } from '../config/env';

/**
 * Middleware xác thực Google reCAPTCHA v2 / v3
 * Chống bot tự động spam đăng ký tài khoản ảo
 */
export const verifyRecaptcha = async (recaptchaToken?: string): Promise<boolean> => {
  const secretKey = ENV.RECAPTCHA_SECRET_KEY;

  // Cho phép bỏ qua khi chạy tự động hóa Unit Test hoặc khi bật cờ SKIP_RECAPTCHA=true
  if (ENV.NODE_ENV === 'test' || process.env.SKIP_RECAPTCHA === 'true') {
    return true;
  }

  if (!secretKey) {
    if (ENV.NODE_ENV === 'production') {
      throw new AppError('Máy chủ Production bắt buộc phải cấu hình RECAPTCHA_SECRET_KEY', 500, 'RECAPTCHA_CONFIG_ERROR');
    }
    return true;
  }

  if (!recaptchaToken || typeof recaptchaToken !== 'string' || !recaptchaToken.trim()) {
    throw new AppError('Vui lòng xác thực reCAPTCHA (Xác minh bạn không phải robot)', 400, 'RECAPTCHA_MISSING');
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
