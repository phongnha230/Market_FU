import { AsyncLocalStorage } from 'node:async_hooks';
import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export interface RequestStore {
  requestId: string;
  userId?: string;
  clientIp?: string;
  method?: string;
  path?: string;
  startTime: number;
}

export const requestContextStore = new AsyncLocalStorage<RequestStore>();

/**
 * Lấy Request ID hiện tại từ AsyncLocalStorage (Hoạt động xuyên suốt mọi tầng Service/Repo mà không cần truyền req)
 */
export const getRequestId = (): string => {
  const store = requestContextStore.getStore();
  if (store?.requestId) {
    return store.requestId;
  }
  return `req_sys_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
};

/**
 * Lấy toàn bộ context của request hiện tại
 */
export const getRequestContext = (): RequestStore | undefined => {
  return requestContextStore.getStore();
};

/**
 * Middleware gắn x-request-id và khởi tạo AsyncLocalStorage context cho toàn bộ vòng đời request
 */
export const requestTracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = req.headers['x-request-id'];
  // Bảo mật F-07: Chỉ chấp nhận ID chứa chữ cái, số, gạch ngang/dưới (1-64 ký tự) chống CRLF Injection & Log Poisoning
  const isValidRequestId =
    typeof incomingId === 'string' &&
    /^[a-zA-Z0-9_-]{1,64}$/.test(incomingId.trim());

  const requestId = isValidRequestId
    ? incomingId.trim()
    : `req_${Date.now().toString(36)}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;

  // Gắn vào Response Header để Frontend / Client có thể lấy mã tra cứu khi gặp sự cố
  res.setHeader('x-request-id', requestId);

  // Gắn vào Express Request Object
  (req as any).id = requestId;
  (req as any).requestId = requestId;

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  const store: RequestStore = {
    requestId,
    clientIp,
    method: req.method,
    path: req.originalUrl || req.url,
    startTime: Date.now(),
  };

  requestContextStore.run(store, () => {
    next();
  });
};
