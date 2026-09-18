import { z } from 'zod';

export const assistantChatSchema = z.object({
  message: z.string().min(1, 'Nội dung tin nhắn không được để trống').max(2000),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sessionId: z.string().optional(),
});

export const querySessionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type AssistantChatInput = z.infer<typeof assistantChatSchema>;
export type QuerySessionsInput = z.infer<typeof querySessionsSchema>;
