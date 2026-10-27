import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';

const router = Router();

// Yêu cầu xác thực JWT cho toàn bộ các endpoint chat
router.use(authenticate);

// 1. Tạo hoặc mở cuộc trò chuyện
router.post('/conversations', chatController.createOrGetConversation);

// 2. Lấy danh sách cuộc trò chuyện của tôi
router.get('/conversations', chatController.getUserConversations);

// 3. Lấy lịch sử tin nhắn của cuộc trò chuyện
router.get('/conversations/:id/messages', chatController.getMessages);

// 4. Gửi tin nhắn mới (hỗ trợ đính kèm ảnh)
router.post(
  '/conversations/:id/messages',
  uploadImage.single('image'),
  chatController.sendMessage
);

// 5. Đánh dấu đã đọc tin nhắn
router.patch('/conversations/:id/read', chatController.markAsRead);

// 6. Chỉnh sửa tin nhắn thường (cấm sửa tin nhắn trả giá / hệ thống)
router.patch('/conversations/:id/messages/:messageId', chatController.updateMessage);

// 7. Xóa tin nhắn thường (cấm xóa tin nhắn trả giá / hệ thống)
router.delete('/conversations/:id/messages/:messageId', chatController.deleteMessage);

// 8. Xóa cuộc trò chuyện
router.delete('/conversations/:id', chatController.deleteConversation);

export default router;
