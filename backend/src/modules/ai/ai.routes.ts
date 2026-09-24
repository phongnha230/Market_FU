import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { aiRateLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();

// Yêu cầu xác thực JWT cho các tác vụ AI
router.use(authenticate);

// 1. Quét ảnh tự động điền form bài đăng trong 3 giây (Bảo vệ bằng aiRateLimiter chống DoS chi phí/token)
router.post('/vision-post', aiRateLimiter, uploadImage.single('image'), aiController.visionPost);

// 2. Chatbot tư vấn tìm đồ phòng trọ (Bảo vệ bằng aiRateLimiter)
router.post('/assistant-chat', aiRateLimiter, aiController.assistantChat);

// 3. Danh sách các phiên chat AI
router.get('/sessions', aiController.getUserSessions);

// 4. Lịch sử tin nhắn một phiên chat AI
router.get('/sessions/:id', aiController.getSessionDetail);

export default router;
