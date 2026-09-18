import { z } from 'zod';

export const createConversationSchema = z.object({
  productId: z.string().min(1, 'productId không được để trống'),
});

export const queryConversationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const queryMessagesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export const sendMessageSchema = z.object({
  text: z.string().max(2000).optional(),
  messageType: z.enum(['TEXT', 'IMAGE', 'OFFER_PRICE', 'MEETUP_LOCATION']).default('TEXT'),
  offerPrice: z.coerce.number().positive('Giá mặc cả phải lớn hơn 0').optional(),
  meetupLocation: z.string().max(255).optional(),
  mediaUrl: z.string().url().optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type QueryConversationsInput = z.infer<typeof queryConversationsSchema>;
export type QueryMessagesInput = z.infer<typeof queryMessagesSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
