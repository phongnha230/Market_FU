import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';

const router = Router();

// Yêu cầu xác thực JWT cho toàn bộ các endpoint chat
router.use(authenticate);

// 1. Tạo hoặc mở cuộc trò chuyện
router.post('/conversations', (req, res, next) =>
  chatController.createOrGetConversation(req, res, next)
);

// 2. Lấy danh sách cuộc trò chuyện của tôi
router.get('/conversations', (req, res, next) =>
  chatController.getUserConversations(req, res, next)
);

// 3. Lấy lịch sử tin nhắn của cuộc trò chuyện
router.get('/conversations/:id/messages', (req, res, next) =>
  chatController.getMessages(req, res, next)
);

// 4. Gửi tin nhắn mới (hỗ trợ đính kèm ảnh)
router.post(
  '/conversations/:id/messages',
  uploadImage.single('image'),
  (req, res, next) => chatController.sendMessage(req, res, next)
);

// 5. Đánh dấu đã đọc tin nhắn
router.patch('/conversations/:id/read', (req, res, next) =>
  chatController.markAsRead(req, res, next)
);

export default router;
