import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';
import { ENV } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. AppError (Lỗi chủ động)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code);
    return;
  }

  // 2. Lỗi Zod Validation
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Dữ liệu đầu vào không hợp lệ', 422, 'VALIDATION_ERROR', details);
    return;
  }

  // 3. Lỗi JWT Authentication
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token xác thực không hợp lệ', 401, 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Phiên đăng nhập đã hết hạn', 401, 'TOKEN_EXPIRED');
    return;
  }

  // 4. Lỗi Prisma Database
  if (err.code === 'P2002') {
    sendError(res, 'Dữ liệu đã tồn tại trong hệ thống (Trùng lặp Unique key)', 409, 'DUPLICATE_ENTRY');
    return;
  }

  // 5. Lỗi Unhandled / 500 (Không lộ stack trace ở production theo GEMINI.md)
  console.error('💥 Unhandled Server Error:', err);
  sendError(
    res,
    ENV.NODE_ENV === 'production'
      ? 'Đã xảy ra lỗi máy chủ nội bộ'
      : err.message || 'Internal Server Error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
};
