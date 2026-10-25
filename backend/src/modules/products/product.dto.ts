import { z } from 'zod';

// Helper: chuẩn hóa hashtag (bỏ dấu #, lowercase, loại khoảng trắng)
const normalizeHashtag = (tag: string) => tag.replace(/^#/, '').toLowerCase().trim();

// Helper: chuẩn hóa loại danh mục từ frontend sang ENUM database
export const normalizeCategoryType = (val: any) => {
  if (!val) return undefined;
  const s = String(val).toLowerCase().trim();
  if (s === 'books' || s.includes('sách') || s.includes('giáo trình') || s === 'book') return 'BOOKS';
  if (s === 'electronics' || s.includes('điện tử') || s.includes('it') || s.includes('phụ kiện')) return 'ELECTRONICS';
  if (s === 'dorm' || s.includes('ktx') || s.includes('đồ dùng') || s.includes('gia dụng')) return 'DORM_ITEM';
  if (s === 'fashion' || s.includes('thời trang') || s.includes('vovinam') || s.includes('quần áo')) return 'CLOTHING';
  if (s === 'vehicle' || s.includes('xe')) return 'VEHICLE';
  if (s === 'hobbies' || s.includes('game') || s.includes('giải trí')) return 'ELECTRONICS';
  if (['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER'].includes(String(val).toUpperCase())) {
    return String(val).toUpperCase();
  }
  return 'OTHER';
};

export const createProductSchema = z.object({
  title: z.string().min(5, 'Tiêu đề sản phẩm phải có ít nhất 5 ký tự').max(150, 'Tiêu đề tối đa 150 ký tự'),
  description: z.string().min(10, 'Mô tả chi tiết sản phẩm ít nhất 10 ký tự').max(5000, 'Mô tả tối đa 5000 ký tự'),
  price: z.coerce.number().min(0, 'Giá bán không được nhỏ hơn 0'),
  originalPrice: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  category: z.preprocess(normalizeCategoryType, z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER'])).optional(),
  categoryType: z.preprocess(normalizeCategoryType, z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER'])).default('OTHER'),
  condition: z.enum(['NEW_100', 'LIKE_NEW_99', 'USED_GOOD', 'USED_FAIR']),
  quantity: z.coerce.number().min(1).default(1),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']),
  meetupLocation: z.string().max(200, 'Địa điểm hẹn tối đa 200 ký tự').optional(),
  location: z.string().max(200, 'Địa điểm hẹn tối đa 200 ký tự').optional(),
  allowShipping: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(true)),
  imageUrls: z
    .preprocess(
      (val) => {
        if (typeof val === 'string') return [val];
        if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
        return [];
      },
      z.array(z.string().min(1)).max(10, 'Tối đa 10 URL ảnh')
    )
    .optional()
    .default([]),
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
  category: z.string().optional(),
  categoryType: z.preprocess(normalizeCategoryType, z.enum(['DORM_ITEM', 'BOOKS', 'ELECTRONICS', 'VEHICLE', 'CLOTHING', 'OTHER'])).optional(),
  condition: z.enum(['NEW_100', 'LIKE_NEW_99', 'USED_GOOD', 'USED_FAIR']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().max(100, 'Từ khóa tìm kiếm tối đa 100 ký tự').optional(),
  hashtag: z.string().max(50, 'Hashtag tối đa 50 ký tự').optional(), // Lọc theo 1 hashtag cụ thể: ?hashtag=quạt
  sellerId: z.string().optional(), // Lọc theo người bán cụ thể
  status: z.enum(['PENDING_APPROVAL', 'AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN', 'EXPIRED', 'REJECTED']).optional(),
  allStatuses: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)), // Hiển thị tất cả trạng thái (dùng cho profile của chính mình)
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'views']).default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const boostProductSchema = z.object({
  type: z.enum(['BUMP', 'PIN_24H']).default('BUMP'),
});

export const updateProductStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN']),
});

export const rejectProductSchema = z.object({
  reason: z.string().min(2, 'Lý do từ chối ít nhất 2 ký tự').max(500, 'Lý do từ chối tối đa 500 ký tự'),
  expectedUpdatedAt: z.string().datetime(),
});

export const approveProductSchema = z.object({
  expectedUpdatedAt: z.string().datetime(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductStatusInput = z.infer<typeof updateProductStatusSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
export type BoostProductInput = z.infer<typeof boostProductSchema>;
export type RejectProductInput = z.infer<typeof rejectProductSchema>;

export const appealProductSchema = z.object({
  reason: z.string().trim().min(5, 'Lý do kháng nghị phải có ít nhất 5 ký tự').max(1000, 'Lý do kháng nghị tối đa 1000 ký tự'),
});

export const rejectAppealSchema = z.object({
  reason: z.string().trim().min(5, 'Lý do bác bỏ kháng nghị phải có ít nhất 5 ký tự').max(1000, 'Lý do tối đa 1000 ký tự'),
  expectedUpdatedAt: z.string().datetime(),
});

export type AppealProductInput = z.infer<typeof appealProductSchema>;
export type RejectAppealInput = z.infer<typeof rejectAppealSchema>;
