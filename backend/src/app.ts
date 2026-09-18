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
import { errorHandler } from './middlewares/error.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';

const app: Application = express();

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

// Centralized Error Handling (Strict GEMINI.md error format)
app.use(errorHandler);

export default app;
