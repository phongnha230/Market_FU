import { apiClient, ApiResponse } from './apiClient';
import { ProductItem, ProductDetail } from '@/types/product';
import { adaptBackendProduct, adaptBackendProductDetail } from '@/lib/adapters';
import { useProductStore } from '@/stores/productStore';

export function stripVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function getLiveLocalProducts(): ProductItem[] {
  try {
    const storeProducts = useProductStore.getState().products;
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts;
    }
  } catch {
    // SSR or store hydration fallback
  }
  return [];
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
        params.categoryType = criteria.categories[0];
        params.category = criteria.categories[0];
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
    return null;
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

  // 7. Chỉnh sửa thông tin bài viết (JSON - cho các trường không cần upload ảnh mới)
  async updateProduct(id: string, payload: any): Promise<ProductItem> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}`, payload);
    return adaptBackendProduct(response.data.data);
  },

  // 7b. Chỉnh sửa bài viết với ảnh mới (multipart/form-data)
  async updateProductWithForm(id: string, formData: FormData): Promise<ProductItem> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return adaptBackendProduct(response.data.data);
  },

  // 7c. Lấy danh sách sản phẩm của người dùng hiện tại (authenticated)
  async getMyProducts(): Promise<ProductItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/products/me');
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data.map(adaptBackendProduct);
      }
      return [];
    } catch {
      // Fallback sang local store nếu chưa đăng nhập hoặc backend offline
      return getLiveLocalProducts();
    }
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

  // 11b. Lấy danh sách sản phẩm yêu thích của người dùng hiện tại từ Database
  async getMyFavorites(): Promise<ProductItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/products/favorites/me');
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(adaptBackendProduct);
      }
      return [];
    } catch {
      return [];
    }
  },

  // 12. Lấy danh sách sản phẩm tương tự cùng Campus và Danh mục
  async getSimilarPosts(campus?: string, category?: string, excludeId?: string): Promise<ProductItem[]> {
    try {
      const campusMap: Record<string, string> = {
        hola: 'HOL',
        hcm: 'HCM',
        dn: 'DAD',
        qn: 'QN',
        ct: 'CT',
      };
      const params: Record<string, any> = { limit: 8 };
      if (campus && campus !== 'all') {
        params.campus = campusMap[campus.toLowerCase()] || campus.toUpperCase();
      }
      if (category && category !== 'all') {
        params.category = category;
      }

      const response = await apiClient.get<ApiResponse<any[]>>('/products', { params });
      if (response.data.data && response.data.data.length > 0) {
        let items = response.data.data.map(adaptBackendProduct);
        if (excludeId) items = items.filter((p) => p.id !== excludeId);
        return items.slice(0, 4);
      }
    } catch {
      // Fallback
    }
    const live = getLiveLocalProducts();
    return (excludeId ? live.filter((p) => p.id !== excludeId) : live).slice(0, 4);
  },

  // 13. [Admin] Lấy danh sách tin kiểm duyệt kèm bộ lọc và thống kê số lượng
  async getAdminProducts(params?: {
    status?: string;
    campus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    products: any[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    counts: { all: number; pending: number; live: number; rejected: number; appeals?: number };
  }> {
    const response = await apiClient.get<ApiResponse<any[]>>('/products/admin/moderation', {
      params,
    });
    const meta: any = response.data.meta || {};
    const rawProducts = response.data.data || [];
    return {
      products: rawProducts,
      pagination: {
        total: meta.total ?? rawProducts.length,
        page: meta.page ?? 1,
        limit: meta.limit ?? 20,
        totalPages: meta.totalPages ?? 1,
      },
      counts: meta.counts || {
        all: rawProducts.length,
        pending: rawProducts.filter((p: any) => p.status === 'PENDING_APPROVAL').length,
        live: rawProducts.filter((p: any) => p.status === 'AVAILABLE').length,
        rejected: rawProducts.filter((p: any) => p.status === 'REJECTED').length,
      },
    };
  },

  // 14. [Admin] Phê duyệt tin đăng
  async approveProduct(id: string, expectedUpdatedAt: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/admin/${id}/approve`, { expectedUpdatedAt });
    return response.data.data;
  },

    // 15. [Admin] Từ chối tin đăng kèm lý do
  async rejectProduct(id: string, reason: string, expectedUpdatedAt?: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/admin/${id}/reject`, { reason, expectedUpdatedAt });
    return response.data.data;
  },

  // 15b. [Admin] Khóa tin đăng vi phạm quy chế sàn
  async lockProduct(id: string, reason: string, expectedUpdatedAt?: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/admin/${id}/lock`, { reason, expectedUpdatedAt });
    return response.data.data;
  },

  // 16. [Seller] Gửi kháng nghị tin đăng bị từ chối / gỡ bỏ
  async appealProduct(id: string, reason: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/products/${id}/appeal`, { reason });
    return response.data.data;
  },

  // 17. [Admin] Bác bỏ kháng nghị của người bán
  async rejectAppeal(id: string, reason: string, expectedUpdatedAt: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(`/products/admin/${id}/reject-appeal`, {
      reason,
      expectedUpdatedAt,
    });
    return response.data.data;
  },

  // 18. [Admin/Seller] Xóa tin đăng sản phẩm
  async deleteProduct(id: string): Promise<any> {
    const response = await apiClient.delete<ApiResponse<any>>(`/products/${id}`);
    return response.data.data;
  },
};

export const productService = ProductService;
