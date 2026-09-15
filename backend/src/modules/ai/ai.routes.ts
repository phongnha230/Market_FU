import { Router } from 'express';
import multer from 'multer';
import { AiController } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { aiRateLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();
const aiController = new AiController();

// Multer lưu ảnh vào bộ nhớ tạm để gửi sang Gemini Vision API
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(authenticate);
router.use(aiRateLimiter); // Áp dụng rate limit bảo vệ chi phí API Gemini

// 1. Gemini Multimodal Vision API
router.post('/vision-post', upload.single('image'), aiController.analyzeProductImage.bind(aiController));

// 2. Chatbot tư vấn tìm đồ
router.post('/assistant-chat', aiController.assistantChat.bind(aiController));
router.get('/sessions', aiController.getUserSessions.bind(aiController));
router.get('/sessions/:id', aiController.getSessionMessages.bind(aiController));

export default router;
