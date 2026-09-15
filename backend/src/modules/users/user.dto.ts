import { z } from 'zod';

// Re-export từ module Profile để tương thích ngược hoàn toàn
export {
  updateProfileSchema,
  updateBankAccountSchema,
  studentKycSchema,
  UpdateProfileInput,
  UpdateBankAccountInput,
  StudentKycInput,
} from '../profile/profile.dto';

export const queryUserSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']).optional(),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type QueryUserInput = z.infer<typeof queryUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
