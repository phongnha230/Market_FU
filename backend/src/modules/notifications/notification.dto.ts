import { z } from 'zod';

export const queryNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(['CHAT', 'ORDER', 'KYC', 'SYSTEM']).optional(),
});
export type QueryNotificationsInput = z.infer<typeof queryNotificationsSchema>;
