import { Router } from 'express';
import multer from 'multer';
import { ChatController } from './chat.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const chatController = new ChatController();

// Multer bộ nhớ tạm xử lý ảnh gửi trong tin nhắn
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Tất cả APIs chat bắt buộc phải đăng nhập
router.use(authenticate);

// 1. Quản lý cuộc hội thoại
router.post('/conversations', chatController.getOrCreateConversation.bind(chatController));
router.get('/conversations', chatController.getUserConversations.bind(chatController));

// 2. Quản lý tin nhắn
router.get('/conversations/:id/messages', chatController.getConversationMessages.bind(chatController));
router.post(
  '/conversations/:id/messages',
  upload.single('media'),
  chatController.sendMessage.bind(chatController)
);
router.patch('/conversations/:id/read', chatController.markAsRead.bind(chatController));

export default router;
