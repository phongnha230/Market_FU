import { z } from 'zod';

export const createConversationSchema = z.object({
  productId: z.string({ required_error: 'ID sản phẩm không được để trống' }).min(1, 'ID sản phẩm không hợp lệ'),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z.object({
  text: z.string().max(2000, 'Tin nhắn tối đa 2000 ký tự').optional(),
  mediaUrl: z.string().url('URL hình ảnh không hợp lệ').optional(),
  messageType: z.enum(['TEXT', 'IMAGE', 'OFFER_PRICE', 'MEETUP_LOCATION']).default('TEXT'),
  offerPrice: z.coerce.number().int().positive('Giá đề xuất phải là số nguyên dương').optional(),
  meetupLocation: z.string().max(200, 'Địa điểm tối đa 200 ký tự').optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const queryMessagesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
export type QueryMessagesInput = z.infer<typeof queryMessagesSchema>;

export const queryConversationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type QueryConversationsInput = z.infer<typeof queryConversationsSchema>;
