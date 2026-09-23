import { apiClient, ApiResponse } from './apiClient';
import { ProductItem, ProductDetail } from '@/types/product';
import { adaptBackendProduct, adaptBackendProductDetail } from '@/lib/adapters';
import {
  FEATURED_PRODUCTS,
  LATEST_PRODUCTS,
  SEARCH_PAGE_POSTS,
  DETAIL_PRODUCT_AKKO,
  SIMILAR_PRODUCTS,
} from '@/constants/mockProducts';
import { useProductStore } from '@/stores/productStore';

export function stripVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

// Fallback products in case backend is offline
const ALL_MOCK_PRODUCTS: ProductItem[] = [
  ...SEARCH_PAGE_POSTS,
  ...FEATURED_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...LATEST_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...SIMILAR_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
];

function getLiveLocalProducts(): ProductItem[] {
  try {
    const storeProducts = useProductStore.getState().products;
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts;
    }
  } catch {
    // SSR or store hydration fallback
  }
  return ALL_MOCK_PRODUCTS;
}

export const ProductService = {
  // 1. Lấy toàn bộ danh sách sản phẩm
  async getAllProducts(): Promise<ProductItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/products', {
        params: { limit: 50 },
      });
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data.map(adaptBackendProduct);
      }
    } catch {
      // Fallback khi offline
    }
    return getLiveLocalProducts();
  },

  // 2. Lấy danh sách sản phẩm nổi bật
  async getFeaturedProducts(): Promise<ProductItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/products', {
        params: { limit: 8, sortBy: 'newest' },
      });
      if (response.data.data && response.data.data.length > 0) {
        const live = response.data.data.map(adaptBackendProduct);
        const featured = live.filter((p) => p.badges.some((b) => b.includes('Nổi bật') || b.includes('100%') || b.includes('99%')));
        return featured.length > 0 ? featured.slice(0, 4) : live.slice(0, 4);
      }
    } catch {
      // Fallback
    }
    const live = getLiveLocalProducts();
    const featured = live.filter((p) => p.badges.some((b) => b.includes('Pass gấp') || b.includes('Like New') || b.includes('Hot')));
    return featured.length > 0 ? featured.slice(0, 4) : live.slice(0, 4);
  },

  // 3. Lấy danh sách tin đăng mới nhất
  async getLatestProducts(): Promise<ProductItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/products', {
        params: { limit: 12, sortBy: 'newest' },
      });
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data.map(adaptBackendProduct);
      }
    } catch {
      // Fallback
    }
    const live = getLiveLocalProducts();
    return live.slice(0, 8);
  },

  // 4. Tìm kiếm & Lọc sản phẩm theo tiêu chí đa chiều (Backend Meilisearch & MongoDB Index)
  async searchPosts(criteria?: {
    keyword?: string;
    campus?: string;
    categories?: string[];
    pricePreset?: string;
    minPrice?: number;
    maxPrice?: number;
    conditions?: string[];
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: ProductItem[];
    total: number;
    meta?: any;
  }> {
    try {
      const campusMap: Record<string, string> = {
        hola: 'HOL',
        hcm: 'HCM',
        dn: 'DAD',
        qn: 'QN',
        ct: 'CT',
      };

      const params: Record<string, any> = {
        page: criteria?.page || 1,
        limit: criteria?.limit || 20,
      };

      if (criteria?.keyword) params.search = criteria.keyword;
      if (criteria?.campus && criteria.campus !== 'all') {
        params.campus = campusMap[criteria.campus] || criteria.campus.toUpperCase();
      }
      if (criteria?.categories && criteria.categories.length > 0) {
        params.categoryId = criteria.categories[0];
      }
      if (criteria?.minPrice) params.minPrice = criteria.minPrice;
      if (criteria?.maxPrice) params.maxPrice = criteria.maxPrice;
      if (criteria?.sort === 'price-asc') params.sortBy = 'price_asc';
      if (criteria?.sort === 'price-desc') params.sortBy = 'price_desc';

      const response = await apiClient.get<ApiResponse<any[]>>('/products', { params });
      if (response.data.data) {
        const items = response.data.data.map(adaptBackendProduct);
        return {
          items,
          total: response.data.meta?.total || items.length,
          meta: response.data.meta,
        };
      }
    } catch {
      // Fallback sang local filter khi server offline
    }

    let results = [...getLiveLocalProducts()];
    if (!criteria) {
      return { items: results, total: results.length };
    }

    if (criteria.keyword && criteria.keyword.trim()) {
      const rawQ = criteria.keyword.toLowerCase().trim();
      const strippedQ = stripVietnamese(rawQ);
      results = results.filter((item) => {
        const rawTarget = `${item.title} ${item.location} ${item.seller.name}`.toLowerCase();
        return rawTarget.includes(rawQ) || stripVietnamese(rawTarget).includes(strippedQ);
      });
    }

    if (criteria.minPrice !== undefined && criteria.minPrice > 0) {
      results = results.filter((item) => item.price >= criteria.minPrice!);
    }
    if (criteria.maxPrice !== undefined && criteria.maxPrice > 0) {
      results = results.filter((item) => item.price <= criteria.maxPrice!);
    }

    if (criteria.sort === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (criteria.sort === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    }

    return { items: results, total: results.length };
  },

  // 5. Lấy chi tiết bài đăng theo ID
  async getPostById(id: string): Promise<ProductDetail | null> {
    if (id === 'akko-3087-v2') {
      return DETAIL_PRODUCT_AKKO;
    }

    try {
      const response = await apiClient.get<ApiResponse<any>>(`/products/${id}`);
      if (response.data.data) {
        return adaptBackendProductDetail(response.data.data);
      }
    } catch {
      // Fallback
    }

    try {
      const storeDetail = useProductStore.getState().getProductById(id);
      if (storeDetail) return storeDetail;
    } catch {
      // fallback
    }

    const found = getLiveLocalProducts().find((p) => p.id === id);
    if (found) {
      return adaptBackendProductDetail(found);
    }
    return DETAIL_PRODUCT_AKKO;
  },

  // 6. Đăng bài mới (Bắt buộc xác thực KYC sinh viên theo quy tắc hệ thống)
  async createProduct(formData: FormData): Promise<ProductItem> {
    const response = await apiClient.post<ApiResponse<any>>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return adaptBackendProduct(response.data.data);
  },

  // 7. Chỉnh sửa thông tin bài viết
  async updateProduct(id: string, payload: any): Promise<ProductItem> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}`, payload);
    return adaptBackendProduct(response.data.data);
  },

  // 8. Đổi trạng thái bài đăng (AVAILABLE, RESERVED, SOLD, HIDDEN)
  async updateProductStatus(id: string, status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN'): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}/status`, { status });
    return response.data.data;
  },

  // 9. Gia hạn tin đăng thêm 30 ngày
  async renewProduct(id: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/products/${id}/renew`);
    return response.data.data;
  },

  // 10. Đẩy tin nổi bật (Boost bằng Xu: BUMP -100 Xu, PIN_24H -300 Xu)
  async boostProduct(id: string, type: 'BUMP' | 'PIN_24H' = 'BUMP'): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/products/${id}/boost`, { type });
    return response.data.data;
  },

  // 11. Lưu / Bỏ lưu tin yêu thích (Wishlist)
  async toggleFavorite(id: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/products/${id}/favorite`);
    return response.data.data;
  },

  // 12. Lấy danh sách sản phẩm tương tự cùng Campus
  async getSimilarPosts(campus?: string): Promise<ProductItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/products', {
        params: { limit: 4, campus },
      });
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data.map(adaptBackendProduct);
      }
    } catch {
      // Fallback
    }
    return SIMILAR_PRODUCTS;
  },
};
