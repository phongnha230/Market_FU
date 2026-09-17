import { z } from 'zod';

// Helper: chuẩn hóa hashtag (bỏ dấu #, lowercase, loại khoảng trắng)
const normalizeHashtag = (tag: string) => tag.replace(/^#/, '').toLowerCase().trim();

export const createProductSchema = z.object({
  title: z.string().min(5, 'Tiêu đề sản phẩm phải có ít nhất 5 ký tự'),
  description: z.string().min(10, 'Mô tả chi tiết sản phẩm ít nhất 10 ký tự'),
  price: z.coerce.number().min(0, 'Giá bán không được nhỏ hơn 0'),
  originalPrice: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  categoryType: z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER']).default('OTHER'),
  condition: z.enum(['NEW_100', 'LIKE_NEW_99', 'USED_GOOD', 'USED_FAIR']),
  quantity: z.coerce.number().min(1).default(1),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']),
  meetupLocation: z.string().optional(),
  allowShipping: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(true)),
  // Hashtags: nhận dạng cả string "quạt,điện tử" hoặc mảng ["#quạt", "#điện tử"]
  hashtags: z
    .preprocess(
      (val) => {
        if (typeof val === 'string') return val.split(',').map(normalizeHashtag).filter(Boolean);
        if (Array.isArray(val)) return val.map((t: any) => normalizeHashtag(String(t))).filter(Boolean);
        return [];
      },
      z.array(z.string().min(1).max(30)).max(10, 'Tối đa 10 hashtag cho mỗi sản phẩm')
    )
    .optional()
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  categoryId: z.string().optional(),
  categoryType: z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER']).optional(),
  condition: z.enum(['NEW_100', 'LIKE_NEW_99', 'USED_GOOD', 'USED_FAIR']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  hashtag: z.string().optional(), // Lọc theo 1 hashtag cụ thể: ?hashtag=quạt
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'views']).default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const boostProductSchema = z.object({
  type: z.enum(['BUMP', 'PIN_24H']).default('BUMP'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
export type BoostProductInput = z.infer<typeof boostProductSchema>;

