import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z
    .string()
    .min(2, 'Slug phải có ít nhất 2 ký tự')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  iconUrl: z.string().url('Icon URL không hợp lệ').optional().or(z.literal('')),
  description: z.string().optional(),
  category: z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER']).default('OTHER'),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
