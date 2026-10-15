import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { AppError } from './error.middleware';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if ((req as any).cookies?.accessToken || (req as any).cookies?.auth_token) {
    token = (req as any).cookies?.accessToken || (req as any).cookies?.auth_token;
  }

  if (!token) {
    throw new AppError('Yêu cầu xác thực tài khoản (Token missing)', 401, 'UNAUTHORIZED');
  }

  let decoded: TokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401, 'INVALID_TOKEN');
  }
  if (decoded.tokenVersion === undefined) {
    throw new AppError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 401, 'TOKEN_REVOKED');
  }
  void prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, email: true, isActive: true, tokenVersion: true },
  }).then((user) => {
    if (!user || !user.isActive) {
      next(new AppError('Tài khoản không tồn tại hoặc đã bị khóa', 401, 'ACCOUNT_INACTIVE'));
      return;
    }
    if (decoded.tokenVersion !== user.tokenVersion) {
      next(new AppError('Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại', 401, 'TOKEN_REVOKED'));
      return;
    }
    req.user = { userId: user.id, role: user.role, email: user.email, tokenVersion: user.tokenVersion };
    next();
  }).catch(next);
};

/**
 * Middleware xác thực tùy chọn:
 * Nếu có token hợp lệ -> gán req.user
 * Nếu không có hoặc token lỗi -> tiếp tục bình thường (req.user = undefined) cho khách vãng lai
 */
export const authenticateOptional = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if ((req as any).cookies?.accessToken || (req as any).cookies?.auth_token) {
    token = (req as any).cookies?.accessToken || (req as any).cookies?.auth_token;
  }

  if (!token) {
    next();
    return;
  }
  let decoded: TokenPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    next();
    return;
  }
  if (decoded.tokenVersion === undefined) {
    next();
    return;
  }
  void prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, email: true, isActive: true, tokenVersion: true },
  }).then((user) => {
    if (user?.isActive && decoded.tokenVersion === user.tokenVersion) {
      req.user = { userId: user.id, role: user.role, email: user.email, tokenVersion: user.tokenVersion };
    }
    next();
  }).catch(next);
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Yêu cầu đăng nhập trước khi thực hiện', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Bạn không có quyền truy cập tài nguyên này', 403, 'FORBIDDEN');
    }

    next();
  };
};
