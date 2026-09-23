import { z } from 'zod';

export const queryNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(['CHAT', 'ORDER', 'KYC', 'SYSTEM']).optional(),
});
export type QueryNotificationsInput = z.infer<typeof queryNotificationsSchema>;

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token không được để trống'),
  deviceType: z.enum(['WEB', 'ANDROID', 'IOS']).optional(),
});
export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;

export const removeDeviceTokenSchema = z.object({
  token: z.string().min(1, 'Device token không được để trống'),
});
export type RemoveDeviceTokenInput = z.infer<typeof removeDeviceTokenSchema>;
