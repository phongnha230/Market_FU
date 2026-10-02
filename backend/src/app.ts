import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { ENV } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import userRoutes from './modules/users/user.routes';
import productRoutes from './modules/products/product.routes';
import categoryRoutes from './modules/categories/category.routes';
import chatRoutes from './modules/chats/chat.routes';
import aiRoutes from './modules/ai/ai.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import voucherRoutes from './modules/vouchers/voucher.routes';
import reportRoutes from './modules/reports/report.routes';
import orderRoutes from './modules/orders/order.routes';
import paymentRoutes, { paymentWebhookRouter } from './modules/payments/payment.routes';
import shippingWebhookRoutes from './modules/orders/webhook.routes';
import reviewRoutes from './modules/reviews/review.routes';
import safeHandoffRoutes from './modules/safehandoff/safehandoff.routes';
import presenceRoutes from './modules/presence/presence.routes';
import { errorHandler } from './middlewares/error.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import { requestTracingMiddleware } from './middlewares/tracing.middleware';
import { httpLoggingMiddleware } from './middlewares/logging.middleware';

const app: Application = express();

// Bảo mật F-11: Cấu hình trust proxy đúng chuẩn cho Reverse Proxy (Nginx, Cloudflare)
app.set('trust proxy', 1);

// 0. Request Correlation & Observability (Gắn x-request-id & theo dõi độ trễ API cho VPS)
app.use(requestTracingMiddleware);
app.use(httpLoggingMiddleware);

// 1. Security Headers (Helmet) - cho phép client tải media tĩnh cross-origin
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Rate Limiting per GEMINI.md
app.use(globalRateLimiter);

// 3. CORS Whitelist per GEMINI.md
const allowedOrigins = [
  ENV.CLIENT_URL,
  ...ENV.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (ví dụ: Mobile apps, Postman, Server-to-server)
      if (!origin) return callback(null, true);
      if (ENV.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS policy: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      // Lưu raw body Buffer cho các route webhook để phục vụ xác thực HMAC chính xác 100%
      if (req.originalUrl && req.originalUrl.startsWith('/api/webhooks')) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Phục vụ tĩnh thư mục Media Uploads (Ảnh nén WebP & Video review)
// B1-2 Fix: Chặn tuyệt đối việc truy cập trực tiếp tài liệu nhạy cảm kyc_cards qua static route
app.use('/uploads/kyc_cards', (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Không được phép truy cập trực tiếp tài liệu KYC qua đường dẫn tĩnh công khai.',
    },
  });
});

const uploadsStaticPath = path.resolve(process.cwd(), ENV.UPLOAD_DIR || 'uploads');
app.use(
  '/uploads',
  express.static(uploadsStaticPath, {
    maxAge: '30d',
    immutable: true,
  })
);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'FU Second-hand Market API is running smoothly 🚀',
    timestamp: new Date().toISOString(),
  });
});

// API Routes (BE-DEV 1 Scope)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// API Routes (BE-DEV 2 Scope)
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// API Routes (BE-DEV 3 Scope)
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Webhooks (BE-DEV 3): Mount tại /api/webhooks để có rawBody cho xác thực HMAC (B3-2/B3-3)
app.use('/api/webhooks', paymentWebhookRouter);
app.use('/api/webhooks', shippingWebhookRoutes);

// API Routes (BE-DEV 4 Scope)
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/safe-handoff', safeHandoffRoutes);
app.use('/api/safehandoff', safeHandoffRoutes);
app.use('/api/presence', presenceRoutes);

// Centralized Error Handling (Strict GEMINI.md error format)
app.use(errorHandler);

export default app;
