import { ProductDetailData, RelatedProductItem } from '../types/product-detail.types';

/**
 * Placeholder dự phòng cho màn hình Chi tiết sản phẩm trong lúc tải dữ liệu
 * Toàn bộ thông số, mô tả và hình ảnh thật được lấy 100% từ Backend Database
 */
export const DEFAULT_PRODUCT_DETAIL: ProductDetailData = {
  id: '',
  title: 'Đang tải thông tin sản phẩm...',
  price: '0',
  conditionBadge: 'Like New',
  location: 'Cơ sở FPT',
  images: [],
  specs: [],
  description: '',
  seller: {
    id: '',
    name: 'Sinh viên FPT',
    avatarUrl: undefined,
    major: 'Sinh viên FPT',
    rating: null,
    reviewCount: 0,
    soldCount: 0,
    activeListingsCount: 0,
    isVerified: true,
  },
  safePointInfo: {
    name: 'Trạm Safe-Point Campus',
    desc: 'Hỗ trợ bàn test cắm máy tính & đo nguồn điện trực tiếp có bảo vệ quan sát.',
  },
  hashtags: [],
};

export const RELATED_PRODUCTS: RelatedProductItem[] = [];
