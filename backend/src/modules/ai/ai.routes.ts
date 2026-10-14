import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate, authenticateOptional } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { aiRateLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();

// 1. Quét ảnh tự động điền form bài đăng trong 3 giây (Yêu cầu đăng nhập & rate limiter)
router.post('/vision-post', authenticate, aiRateLimiter, uploadImage.single('image'), aiController.visionPost);

// 2. Chatbot tư vấn tìm đồ phòng trọ (Hỗ trợ cả khách vãng lai hỏi thử qua authenticateOptional & rate limiter)
router.post('/assistant-chat', authenticateOptional, aiRateLimiter, aiController.assistantChat);

// 3. Danh sách các phiên chat AI (Yêu cầu đăng nhập)
router.get('/sessions', authenticate, aiController.getUserSessions);

// 4. Lịch sử tin nhắn một phiên chat AI (Yêu cầu đăng nhập)
router.get('/sessions/:id', authenticate, aiController.getSessionDetail);

export default router;
