import { ProductItem, ProductDetail, FilterCriteria } from '@/types/product';
import {
  FEATURED_PRODUCTS,
  LATEST_PRODUCTS,
  SEARCH_PAGE_POSTS,
  DETAIL_PRODUCT_AKKO,
  SIMILAR_PRODUCTS,
} from '@/constants/mockProducts';

export function stripVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

import { useProductStore } from '@/stores/productStore';

// Tổng hợp toàn bộ sản phẩm trong kho dữ liệu mock làm fallback
const ALL_PRODUCTS: ProductItem[] = [
  ...SEARCH_PAGE_POSTS,
  ...FEATURED_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...LATEST_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...SIMILAR_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
];

function getLiveProducts(): ProductItem[] {
  try {
    const storeProducts = useProductStore.getState().products;
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts;
    }
  } catch {
    // SSR or store hydration fallback
  }
  return ALL_PRODUCTS;
}

/**
 * Service trừu tượng hóa các tác vụ gọi dữ liệu sản phẩm.
 * Hoạt động linh hoạt ở chế độ Client Mock / LocalStorage và sẵn sàng cắm Backend API.
 */
export const ProductService = {
  // Lấy toàn bộ danh sách sản phẩm
  async getAllProducts(): Promise<ProductItem[]> {
    return Promise.resolve(getLiveProducts());
  },

  // Lấy danh sách sản phẩm nổi bật
  async getFeaturedProducts(): Promise<ProductItem[]> {
    const live = getLiveProducts();
    const featured = live.filter((p) => p.badges.some((b) => b.includes('Pass gấp') || b.includes('Like New') || b.includes('Hot')));
    return Promise.resolve(featured.length > 0 ? featured.slice(0, 4) : live.slice(0, 4));
  },

  // Lấy danh sách tin đăng mới nhất
  async getLatestProducts(): Promise<ProductItem[]> {
    const live = getLiveProducts();
    return Promise.resolve(live.slice(0, 8));
  },

  // Tìm kiếm & Lọc sản phẩm theo tiêu chí
  async searchPosts(criteria?: {
    keyword?: string;
    campus?: string;
    categories?: string[];
    pricePreset?: string;
    minPrice?: number;
    maxPrice?: number;
    conditions?: string[];
    sort?: string;
  }): Promise<{
    items: ProductItem[];
    total: number;
  }> {
    let results = [...getLiveProducts()];

    if (!criteria) {
      return { items: results, total: results.length };
    }

    // 1. Lọc theo từ khóa (Keyword)
    if (criteria.keyword && criteria.keyword.trim()) {
      const rawQ = criteria.keyword.toLowerCase().trim();
      const strippedQ = stripVietnamese(rawQ);
      const compactQ = strippedQ.replace(/[^a-z0-9]/g, '');

      results = results.filter((item) => {
        const rawTarget = `${item.title} ${item.location} ${item.seller.name} ${item.badges.join(' ')} ${item.campusTag || ''}`.toLowerCase();
        const strippedTarget = stripVietnamese(rawTarget);
        const compactTarget = strippedTarget.replace(/[^a-z0-9]/g, '');

        const directMatch = rawTarget.includes(rawQ);
        const strippedMatch = strippedTarget.includes(strippedQ);
        const compactMatch = compactQ.length >= 3 && compactTarget.includes(compactQ);

        return directMatch || strippedMatch || compactMatch;
      });
    }

    // 2. Lọc theo Campus
    if (criteria.campus && criteria.campus !== 'all') {
      const campMap: Record<string, string[]> = {
        hola: ['hòa lạc', 'hola', 'dom', 'tân xã', 'thư viện'],
        dn: ['đà nẵng', 'fpt đn', 'tòa f'],
        hcm: ['hồ chí minh', 'hcm', 'quận 9', 'tòa alpha'],
        ct: ['cần thơ', 'fpt ct'],
        qn: ['quy nhơn', 'fpt qn'],
      };
      const allowedKeywords = campMap[criteria.campus] || [criteria.campus];
      results = results.filter((item) => {
        const combined = `${item.location} ${item.campusTag || ''}`.toLowerCase();
        return allowedKeywords.some((kw) => combined.includes(kw));
      });
    }

    // 3. Lọc theo Danh mục (Categories)
    if (criteria.categories && criteria.categories.length > 0) {
      const catMap: Record<string, string[]> = {
        books: ['giáo trình', 'sách', 'prf192', 'mas291', 'csd201', 'note', 'bài tập'],
        electronics: ['chuột', 'phím', 'bàn phím', 'màn hình', 'dell', 'tai nghe', 'sony', 'logitech', 'switch', 'hub'],
        fashion: ['vovinam', 'võ phục', 'áo', 'polo', 'hoodie'],
        dorm: ['tủ lạnh', 'bàn học', 'bàn gấp', 'quạt', 'đèn', 'decor'],
        hobbies: ['nintendo', 'switch', 'game', 'đàn', 'gym', 'tạ'],
        services: ['thẻ gym', 'gym', 'vé bus', 'bus'],
      };
      results = results.filter((item) => {
        const text = `${item.title} ${item.badges.join(' ')}`.toLowerCase();
        return criteria.categories!.some((catId) => {
          const kws = catMap[catId] || [catId];
          return kws.some((kw) => text.includes(kw));
        });
      });
    }

    // 3. Lọc theo Khoảng giá
    if (criteria.minPrice !== undefined && criteria.minPrice > 0) {
      results = results.filter((item) => item.price >= criteria.minPrice!);
    }
    if (criteria.maxPrice !== undefined && criteria.maxPrice > 0) {
      results = results.filter((item) => item.price <= criteria.maxPrice!);
    }

    // 4. Sắp xếp kết quả (Sort)
    if (criteria.sort === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (criteria.sort === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    }

    return Promise.resolve({
      items: results,
      total: results.length,
    });
  },

  // Lấy chi tiết bài đăng theo ID
  async getPostById(id: string): Promise<ProductDetail | null> {
    // Nếu là ID của Akko keyboard gốc
    if (id === 'akko-3087-v2') {
      return Promise.resolve(DETAIL_PRODUCT_AKKO);
    }

    try {
      const storeDetail = useProductStore.getState().getProductById(id);
      if (storeDetail) {
        return Promise.resolve(storeDetail);
      }
    } catch {
      // fallback
    }

    // Tìm trong danh sách toàn bộ sản phẩm
    const found = getLiveProducts().find((p) => p.id === id);
    if (!found) {
      // Fallback nếu không tìm thấy
      return Promise.resolve(DETAIL_PRODUCT_AKKO);
    }

    // Tạo chi tiết tương ứng cho sản phẩm
    const detail: ProductDetail = {
      ...found,
      condition: found.badges.find((b) => b.includes('%') || b.toLowerCase().includes('mới')) || 'Đã qua sử dụng (Tốt)',
      galleryImages: [
        {
          src: found.imageUrl,
          alt: `${found.title} - Toàn cảnh`,
        },
        {
          src: '/products/keyboard-detail.jpg',
          alt: `${found.title} - Chi tiết góc nghiêng`,
        },
        {
          src: found.imageUrl,
          alt: `${found.title} - Phụ kiện kèm theo`,
        },
        {
          src: '/products/monitor-dell-24.jpg',
          alt: `${found.title} - Trong không gian học tập KTX`,
        },
      ],
      description: `Mình cần pass lại "${found.title}". Hàng chính chủ dùng giữ gìn cẩn thận, phục vụ học tập tại campus rất tốt. Sinh viên cùng trường có thể hẹn gặp trực tiếp tại sảnh KTX hoặc Căng-tin để kiểm tra thoải mái trước khi chuyển khoản.`,
      bulletPoints: [
        {
          title: 'Tình trạng thực tế',
          content: `Ngoại hình đẹp, ${found.badges.join(', ')}, mọi chức năng hoạt động hoàn hảo 100%.`,
        },
        {
          title: 'Lý do nhượng lại',
          content: 'Đã hoàn thành xong môn học kỳ này / Nâng cấp thiết bị mới nên pass lại giá sinh viên.',
        },
        {
          title: 'Phụ kiện & Quà tặng kèm',
          content: 'Đầy đủ phụ kiện theo máy, tặng kèm tip học tập và hỗ trợ tư vấn nhiệt tình.',
        },
        {
          title: 'Địa điểm giao dịch',
          content: `${found.location} - Ưu tiên hẹn trực tiếp trong campus để test đồ.`,
        },
      ],
      meetingNote: `Giao dịch trực tiếp tại ${found.location}. Sinh viên FPT được kiểm tra kỹ trước khi thanh toán.`,
    };

    return Promise.resolve(detail);
  },

  // Lấy danh sách sản phẩm tương tự cùng Campus
  async getSimilarPosts(campus?: string): Promise<ProductItem[]> {
    return Promise.resolve(SIMILAR_PRODUCTS);
  },
};

