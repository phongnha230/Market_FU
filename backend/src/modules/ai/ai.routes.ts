import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { aiRateLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();

// Yêu cầu xác thực JWT cho các tác vụ AI
router.use(authenticate);

// 1. Quét ảnh tự động điền form bài đăng trong 3 giây (Bảo vệ bằng aiRateLimiter chống DoS chi phí/token)
router.post('/vision-post', aiRateLimiter, uploadImage.single('image'), (req, res, next) =>
  aiController.visionPost(req, res, next)
);

// 2. Chatbot tư vấn tìm đồ phòng trọ (Bảo vệ bằng aiRateLimiter)
router.post('/assistant-chat', aiRateLimiter, (req, res, next) =>
  aiController.assistantChat(req, res, next)
);

// 3. Danh sách các phiên chat AI
router.get('/sessions', (req, res, next) =>
  aiController.getUserSessions(req, res, next)
);

// 4. Lịch sử tin nhắn một phiên chat AI
router.get('/sessions/:id', (req, res, next) =>
  aiController.getSessionDetail(req, res, next)
);

export default router;
