import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { authService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  phoneAuthSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.dto';
import { sendSuccess } from '../../utils/response';
import { ENV } from '../../config/env';
import { prisma } from '../../config/prisma';
import { verifyRefreshToken } from '../../utils/token';
import { verifyRecaptcha } from '../../middlewares/recaptcha.middleware';

export class AuthController {
  // Đăng ký (Có xác thực Google reCAPTCHA)
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Xác thực reCAPTCHA chống Bot spam tạo nick ảo
      await verifyRecaptcha(validatedData.recaptchaToken);

      const result = await authService.register(validatedData);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // Đăng nhập
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = googleAuthSchema.parse(req.body);
      const result = await authService.googleAuth(validatedData);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // Đăng nhập Số điện thoại + OTP Firebase (Dùng cho cả Web & Mobile)
  async phoneAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = phoneAuthSchema.parse(req.body);
      const result = await authService.phoneAuth(validatedData);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, result, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // Cấp lại token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      const tokens = await authService.refreshToken(token);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { tokens }, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // Đăng xuất (Thu hồi toàn bộ Refresh Token của phiên làm việc)
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user;
      if (authUser?.userId) {
        await prisma.user.update({
          where: { id: authUser.userId },
          data: { tokenVersion: { increment: 1 } },
        });
      } else {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (token) {
          try {
            const payload = verifyRefreshToken(token);
            if (payload?.userId) {
              await prisma.user.update({
                where: { id: payload.userId },
                data: { tokenVersion: { increment: 1 } },
              });
            }
          } catch {
            // Token đã hết hạn hoặc không hợp lệ, không cần thu hồi
          }
        }
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      sendSuccess(res, { message: 'Đăng xuất thành công, toàn bộ phiên đã được thu hồi' }, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // Thay đổi mật khẩu (User đã đăng nhập)
  // --------------------------------------------------------------------------
  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(req.user!.userId, validatedData);
      sendSuccess(res, result, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // Quên mật khẩu: Gửi mã OTP xác nhận về Email (Chưa đăng nhập)
  // --------------------------------------------------------------------------
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await authService.forgotPassword(validatedData);
      sendSuccess(res, result, undefined, 200);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // Quên mật khẩu: Xác thực OTP và đặt lại mật khẩu mới
  // --------------------------------------------------------------------------
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validatedData);
      sendSuccess(res, result, undefined, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
