import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const httpLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    const userId = (req as any).user?.userId || (req as any).user?.id;

    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${durationMs}ms`;

    logger.http(message, {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs,
      clientIp,
      ...(userId && { userId }),
    });
  });

  next();
};
