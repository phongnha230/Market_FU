import { z } from 'zod';

const normalizeCampus = (val: unknown) => {
  if (typeof val !== 'string') return val;
  const clean = val.trim();
  const campusMap: Record<string, string> = {
    'Hòa Lạc': 'HOL',
    'HÒA LẠC': 'HOL',
    'Hoa Lac': 'HOL',
    'HOA LAC': 'HOL',
    'HOL': 'HOL',
    'TP.HCM': 'HCM',
    'TP. Hồ Chí Minh': 'HCM',
    'Hồ Chí Minh': 'HCM',
    'HỒ CHÍ MINH': 'HCM',
    'HCM': 'HCM',
    'Đà Nẵng': 'DAD',
    'ĐÀ NẴNG': 'DAD',
    'Da Nang': 'DAD',
    'DA NANG': 'DAD',
    'DAD': 'DAD',
    'Quy Nhơn': 'QN',
    'QUY NHƠN': 'QN',
    'Quy Nhon': 'QN',
    'QUY NHON': 'QN',
    'QN': 'QN',
    'Cần Thơ': 'CT',
    'CẦN THƠ': 'CT',
    'Can Tho': 'CT',
    'CAN THO': 'CT',
    'CT': 'CT',
  };
  return campusMap[clean] || clean.toUpperCase();
};

export const assistantChatSchema = z.object({
  message: z.string().min(1, 'Nội dung tin nhắn không được để trống').max(2000),
  campus: z.preprocess(normalizeCampus, z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional()),
  maxPrice: z.coerce.number().positive().optional(),
  sessionId: z
    .string()
    .trim()
    .refine(
      (val) => val === '' || /^[0-9a-fA-F]{24}$/.test(val),
      'Mã phiên trò chuyện (sessionId) phải là MongoDB ObjectId 24 ký tự hợp lệ'
    )
    .optional(),
});

export const querySessionsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type AssistantChatInput = z.infer<typeof assistantChatSchema>;
export type QuerySessionsInput = z.infer<typeof querySessionsSchema>;

