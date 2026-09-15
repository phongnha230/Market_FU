import { z } from 'zod';

export const assistantChatSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, 'Nội dung tin nhắn không được để trống').max(1000, 'Tin nhắn tối đa 1000 ký tự'),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  categoryType: z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER']).optional(),
});
export type AssistantChatInput = z.infer<typeof assistantChatSchema>;
