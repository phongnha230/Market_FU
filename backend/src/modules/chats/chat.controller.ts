import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ChatService } from './chat.service';
import { createConversationSchema, sendMessageSchema, queryMessagesSchema, queryConversationsSchema } from './chat.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

const chatService = new ChatService();

export class ChatController {
  // POST /api/chats/conversations
  async getOrCreateConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createConversationSchema.parse(req.body);
      const conversation = await chatService.getOrCreateConversation(req.user!.userId, validated.productId);
      return sendSuccess(res, conversation, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/chats/conversations
  async getUserConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryConversationsSchema.parse(req.query);
      const result = await chatService.getUserConversations(req.user!.userId, query);
      return sendPaginated(res, result.conversations, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/chats/conversations/:id/messages
  async getConversationMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id as string;
      const query = queryMessagesSchema.parse(req.query);
      const result = await chatService.getConversationMessages(req.user!.userId, conversationId, query);
      return sendPaginated(res, result.messages, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/chats/conversations/:id/messages
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id as string;
      const validated = sendMessageSchema.parse(req.body);
      const mediaFile = req.file;
      const message = await chatService.sendMessage(req.user!.userId, conversationId, validated, mediaFile);
      return sendSuccess(res, message, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/chats/conversations/:id/read
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversationId = req.params.id as string;
      const result = await chatService.markConversationAsRead(req.user!.userId, conversationId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
