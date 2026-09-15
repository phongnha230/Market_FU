import axios from 'axios';
import { AppError } from './error.middleware';
import { ENV } from '../config/env';

/**
 * Middleware xác thực Google reCAPTCHA v2 / v3
 * Chống bot tự động spam đăng ký tài khoản ảo
 */
export const verifyRecaptcha = async (recaptchaToken?: string): Promise<boolean> => {
  const secretKey = ENV.RECAPTCHA_SECRET_KEY;

  // Nếu trong môi trường phát triển (Dev) và chưa cấu hình key, cho phép bỏ qua để dễ test
  if (!secretKey) {
    if (ENV.NODE_ENV === 'development') {
      return true;
    }
    throw new AppError('Server chưa cấu hình RECAPTCHA_SECRET_KEY', 500, 'RECAPTCHA_CONFIG_ERROR');
  }

  if (!recaptchaToken) {
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
