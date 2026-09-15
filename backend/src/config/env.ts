import dotenv from 'dotenv';
import { z } from 'zod';

// Load biến môi trường từ file .env
dotenv.config();

/**
 * Zod Schema kiểm tra và chuẩn hoá 100% biến môi trường của hệ thống
 * Tuân thủ quy chuẩn bảo mật GEMINI.md (Secrets Management & Fail-Fast Startup)
 */
const envSchema = z.object({
  // 1. Server & Môi trường
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173,http://localhost:8081,http://localhost:19006'),

  // 2. Database (Prisma ORM kết nối MongoDB Atlas)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL không được để trống'),

  // 3. JWT Authentication (Access Token 15m & Refresh Token xoay vòng 30d)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET không được để trống và phải tối thiểu 32 ký tự'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET không được để trống và phải tối thiểu 32 ký tự'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // 4. Google OAuth (Đăng nhập sinh viên @fpt.edu.vn)
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),

  // 5. Google reCAPTCHA v2 / v3 (Chống bot spam đăng ký)
  RECAPTCHA_SECRET_KEY: z.string().default(''),

  // 6. Media Storage (Cloudflare R2 Object Storage + Sharp WebP, fallback Local)
  MEDIA_DOMAIN: z.string().default('http://localhost:5000/uploads'),
  UPLOAD_DIR: z.string().default('uploads'),
  R2_ACCOUNT_ID: z.string().default(''),
  R2_ENDPOINT: z.string().default(''),
  R2_ACCESS_KEY_ID: z.string().default(''),
  R2_ACCESS_KEY: z.string().default(''),
  R2_SECRET_ACCESS_KEY: z.string().default(''),
  R2_SECRET_KEY: z.string().default(''),
  R2_BUCKET_NAME: z.string().default('my-uploads'),
  R2_PUBLIC_DOMAIN: z.string().default(''),
  R2_PUBLIC_URL: z.string().default(''),

  // 7. Gemini AI (Gemini 1.5 Flash Vision nhận diện sản phẩm & Trợ lý Chatbot)
  GEMINI_API_KEY: z.string().default(''),

  // 8. Firebase Admin SDK (FCM Push Notifications & Phone Auth verifyIdToken)
  FIREBASE_PROJECT_ID: z.string().default('marketfu-1cdf7'),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().default('./firebase-service-account.json'),

  // 9. Email SMTP (Nodemailer gửi mã OTP qua Gmail App Password)
  EMAIL_USER: z.string().default(''),
  EMAIL_APP_PASSWORD: z.string().default(''),
  EMAIL_FROM: z.string().default('"Campus Marketplace FU" <no-reply@marketfu.com>'),

  // 10. PayOS Payment Gateway (VietQR Napas Checkout & Webhook)
  PAYOS_CLIENT_ID: z.string().default(''),
  PAYOS_API_KEY: z.string().default(''),
  PAYOS_CHECKSUM_KEY: z.string().default(''),

  // 11. Webhooks & Anti-tampering Secrets
  SHIPPING_WEBHOOK_SECRET: z.string().min(16, 'SHIPPING_WEBHOOK_SECRET không được để trống và phải tối thiểu 16 ký tự'),
  HANDSHAKE_QR_SECRET: z.string().min(16, 'HANDSHAKE_QR_SECRET không được để trống và phải tối thiểu 16 ký tự'),

  // 12. VietQR Napas Direct Template Config (img.vietqr.io)
  VIETQR_BANK_ID: z.string().default('MB'),
  VIETQR_ACCOUNT_NO: z.string().default(''),
  VIETQR_ACCOUNT_NAME: z.string().default(''),
  VIETQR_TEMPLATE: z.string().default('compact2'),

  // 13. Redis Caching & Distributed Store
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().default(''),

  // 14. Meilisearch Full-text & Instant Search Engine
  MEILISEARCH_HOST: z.string().default('http://localhost:7700'),
  MEILISEARCH_KEY: z.string().default('masterKeyFU2026Secure'),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ [CONFIG ERROR] Phát hiện biến môi trường không hợp lệ trong .env:');
    parsed.error.issues.forEach((issue) => {
      console.error(`   👉 [${issue.path.join('.')}] - ${issue.message}`);
    });

    if (process.env.NODE_ENV === 'production') {
      console.error('💥 Không thể khởi động ứng dụng trên Production do thiếu biến môi trường bắt buộc!');
      process.exit(1);
    }

    // Trong môi trường dev, fallback an toàn để tránh crash khi chưa cấu hình đủ file .env
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/campus_market_dev',
      JWT_SECRET: process.env.JWT_SECRET || 'fu_campus_market_secret_access_jwt_2026_dev_min32chars',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fu_campus_market_secret_refresh_jwt_2026_dev_min32chars',
      SHIPPING_WEBHOOK_SECRET: process.env.SHIPPING_WEBHOOK_SECRET || 'shipping_secret_default_min16chars',
      HANDSHAKE_QR_SECRET: process.env.HANDSHAKE_QR_SECRET || 'handshake_qr_secret_default_min16chars',
    });
  }

  return parsed.data;
};

export const ENV = parseEnv();
export type EnvConfig = z.infer<typeof envSchema>;
