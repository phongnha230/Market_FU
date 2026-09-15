import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

const isTestEnv = (): boolean =>
  process.env.NODE_ENV === 'test' ||
  Boolean(process.env.npm_lifecycle_event?.startsWith('test')) ||
  process.argv.some((arg) => arg.includes('test'));

// Rate limiter cho endpoint nhạy cảm (Đăng nhập, đăng ký) - Tối đa 5 lần/phút/IP theo GEMINI.md
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 5,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Bạn đã thử quá nhiều lần. Vui lòng đợi 1 phút trước khi thử lại.',
      429,
      'TOO_MANY_REQUESTS'
    );
  },
});

// Rate limiter chung cho toàn bộ API (100 req/phút/IP)
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Yêu cầu quá tải, vui lòng thử lại sau giây lát.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});

// Rate limiter cho AI endpoints (Gemini Vision, Chatbot) - Tối đa 20 req/phút/IP
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  skip: isTestEnv,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Bạn đang gọi AI quá nhanh. Vui lòng đợi 1 phút trước khi tiếp tục sử dụng.',
      429,
      'AI_RATE_LIMIT_EXCEEDED'
    );
  },
});
