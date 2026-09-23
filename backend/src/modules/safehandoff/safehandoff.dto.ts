import { z } from 'zod';

export const CampusLocationEnum = z
  .enum(['HOL', 'HCM', 'DAD', 'DN', 'QN', 'CT'], {
    errorMap: () => ({ message: 'Campus phải là HOL, HCM, DAD (hoặc DN), QN hoặc CT' }),
  })
  .transform((val) => (val === 'DN' ? ('DAD' as const) : val));

export const HubStatusEnum = z.enum(['Hoạt động', 'Bảo trì', 'Tạm ngưng'], {
  errorMap: () => ({ message: 'Trạng thái trạm phải là Hoạt động, Bảo trì hoặc Tạm ngưng' }),
});

export const CreateSafeHandoffHubSchema = z.object({
  name: z
    .string({ required_error: 'Tên trạm Safe-Handoff là bắt buộc' })
    .min(3, 'Tên trạm tối thiểu 3 ký tự')
    .max(120, 'Tên trạm tối đa 120 ký tự'),
  code: z
    .string({ required_error: 'Mã định danh trạm là bắt buộc (VD: HL-01)' })
    .min(2, 'Mã định danh tối thiểu 2 ký tự')
    .max(20, 'Mã định danh tối đa 20 ký tự')
    .transform((val) => val.trim().toUpperCase()),
  campus: CampusLocationEnum,
  storageCapacity: z.string().default('50 GB'),
  cameras: z.string().default('2 Cam HD'),
  staffCount: z.string().default('4 cán bộ'),
  status: HubStatusEnum.default('Hoạt động'),
  isOperating: z.boolean().default(true),
  operatingHours: z.string().default('07:30 - 21:00'),
  locationDetails: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateSafeHandoffHubSchema = CreateSafeHandoffHubSchema.partial();

export const QuerySafeHandoffHubsSchema = z.object({
  campus: CampusLocationEnum.optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export type CreateSafeHandoffHubInput = z.infer<typeof CreateSafeHandoffHubSchema>;
export type UpdateSafeHandoffHubInput = z.infer<typeof UpdateSafeHandoffHubSchema>;
export type QuerySafeHandoffHubsInput = z.infer<typeof QuerySafeHandoffHubsSchema>;
