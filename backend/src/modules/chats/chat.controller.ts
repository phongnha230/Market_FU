import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { chatService } from './chat.service';
import {
  createConversationSchema,
  queryConversationsSchema,
  queryMessagesSchema,
  sendMessageSchema,
} from './chat.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class ChatController {
  /**
   * POST /api/chats/conversations
   * Mở hoặc tạo mới cuộc trò chuyện dựa trên productId
   */
  async createOrGetConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createConversationSchema.parse(req.body);
      const conversation = await chatService.createOrGetConversation(
        req.user!.userId,
        validatedData
      );
      return sendSuccess(res, conversation, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chats/conversations
   * Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
   */
  async getUserConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryConversationsSchema.parse(req.query);
      const { conversations, pagination } = await chatService.getUserConversations(
        req.user!.userId,
        query
      );
      return sendPaginated(res, conversations, pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chats/conversations/:id/messages
   * Lấy lịch sử tin nhắn trong cuộc trò chuyện (phân trang)
   */
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id as string;
      const query = queryMessagesSchema.parse(req.query);
      const { messages, pagination } = await chatService.getMessages(
        req.user!.userId,
        conversationId,
        query
      );
      return sendPaginated(res, messages, pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chats/conversations/:id/messages
   * Gửi tin nhắn qua REST API (hỗ trợ kèm ảnh Multer, mặc cả giá, địa điểm hẹn)
   */
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id as string;
      const validatedData = sendMessageSchema.parse(req.body);
      const imageFile = req.file;

      const message = await chatService.sendMessage(
        req.user!.userId,
        conversationId,
        validatedData,
        imageFile
      );
      return sendSuccess(res, message, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/chats/conversations/:id/read
   * Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id as string;
      const result = await chatService.markAsRead(req.user!.userId, conversationId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
