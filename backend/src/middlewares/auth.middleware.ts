import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token';
import { AppError } from './error.middleware';

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

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    throw new AppError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn', 401, 'INVALID_TOKEN');
  }
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

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch {
      // Token không hợp lệ hoặc hết hạn -> coi như khách vãng lai
      req.user = undefined;
    }
  }

  next();
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
