import apiClient, { ApiResponse } from './apiClient';
import type { ProductItem } from '../stores/productStore';
import {
  toBackendCampus,
  fromBackendCampus,
  toBackendCondition,
  fromBackendCondition,
  toBackendCategory,
} from '../lib/backendMappers';

export interface CreateProductPayload {
  title: string;
  price: number;
  condition: string;
  category: string;
  images: any[];
  campus: string;
  safePoint?: string;
  allowNegotiate?: boolean;
  campusShipEnabled?: boolean;
  hashtags?: string[];
  description?: string;
}

export function adaptBackendProductToMobile(item: any): ProductItem {
  const sellerId = item.sellerId || item.seller?.id || item.seller?.userId || '';
  const sellerName =
    item.seller?.profile?.fullName || item.seller?.fullName || item.sellerName || 'Sinh viên FPT';
  const sellerCohort =
    item.seller?.profile?.cohort || item.sellerCohort || '';
  const sellerRating = item.seller?.profile?.reputationScore
    ? Math.min(5.0, Number((item.seller.profile.reputationScore / 20).toFixed(1)))
    : item.sellerRating || 5.0;

  let rawImages: any[] = [];
  if (Array.isArray(item.images) && item.images.length > 0) {
    rawImages = item.images
      .map((img: any) =>
        typeof img === 'string' ? img : img?.url || img?.imageUrl || img?.src || ''
      )
      .filter((img: any) => (typeof img === 'string' ? img.trim().length > 0 : Boolean(img)));
  } else if (item.imageUrl) {
    rawImages = [item.imageUrl];
  } else if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    rawImages = item.imageUrls;
  }
  if (rawImages.length === 0) {
    rawImages = ['/products/monitor-dell-24.jpg'];
  }

  // Chuẩn hóa category đồng bộ với Backend categoryType và Frontend
  let mappedCategory = 'electronics';
  const rawCat = String(
    item.category?.slug ||
    item.category?.name ||
    (typeof item.category === 'string' ? item.category : '') ||
    item.categoryType ||
    ''
  ).toLowerCase();

  if (rawCat.includes('book') || rawCat.includes('sách') || rawCat.includes('giao-trinh') || rawCat.includes('giáo trình')) {
    mappedCategory = 'books';
  } else if (rawCat.includes('vovinam') || rawCat.includes('cloth') || rawCat.includes('áo') || rawCat.includes('thời trang')) {
    mappedCategory = 'vovinam';
  } else if (rawCat.includes('dorm') || rawCat.includes('ktx') || rawCat.includes('phòng trọ') || rawCat.includes('gia dụng') || rawCat.includes('do-dung') || rawCat.includes('dom')) {
    mappedCategory = 'dom';
  } else if (rawCat.includes('elec') || rawCat.includes('it') || rawCat.includes('chuột') || rawCat.includes('phím') || rawCat.includes('máy tính') || rawCat.includes('laptop')) {
    mappedCategory = 'it';
  } else if (rawCat.includes('xe') || rawCat.includes('vehicle')) {
    mappedCategory = 'vehicle';
  } else {
    mappedCategory = rawCat || 'other';
  }

  return {
    id: item.id || item._id,
    title: item.title || 'Món đồ FPT',
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    condition: fromBackendCondition(item.condition),
    category: mappedCategory,
    categoryType: item.categoryType,
    images: rawImages,
    campus: fromBackendCampus(item.campus),
    sellerId,
    sellerName,
    sellerAvatar: item.seller?.avatar || item.seller?.avatarUrl || item.seller?.profile?.avatarUrl || '',
    sellerCohort,
    sellerRating,
    sellerIsVerified: item.seller?.profile?.kyc?.status === 'APPROVED' || item.seller?.role === 'SELLER',
    status: item.status || 'AVAILABLE',
    safePoint: item.safePoint || item.meetupLocation || 'Trạm Safe-Point Sảnh Alpha',
    allowNegotiate: item.allowNegotiate ?? true,
    campusShipEnabled: item.campusShipEnabled ?? true,
    hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
    createdAt: item.createdAt || new Date().toISOString(),
    viewsCount: item.viewCount || item.viewsCount || 1,
    likesCount: item.favoriteCount || item.likesCount || 0,
  };
}

export const productMobileService = {
  /**
   * Lấy danh sách sản phẩm từ backend với bộ lọc Meilisearch Search, Hashtag, Campus, Category
   */
  async getProducts(params?: {
    campus?: string;
    category?: string;
    search?: string;
    hashtag?: string;
    limit?: number;
    page?: number;
  }): Promise<ProductItem[]> {
    const backendCampus = params?.campus ? toBackendCampus(params.campus) : undefined;
    const backendCategory = params?.category ? toBackendCategory(params.category) : undefined;

    const res = await apiClient.get<ApiResponse<any[]>>('/products', {
      params: {
        limit: params?.limit || 50,
        page: params?.page || 1,
        campus: backendCampus,
        category: backendCategory,
        search: params?.search,
        hashtag: params?.hashtag,
      },
    });

    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data.map(adaptBackendProductToMobile);
    }
    return [];
  },

  /**
   * Gợi ý tìm kiếm nhanh qua Meilisearch engine backend
   */
  async suggestProducts(q: string, campus?: string, limit: number = 6): Promise<{
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    campus: string;
    hashtags: string[];
  }[]> {
    if (!q || !q.trim()) return [];
    try {
      const backendCampus = campus ? toBackendCampus(campus) : undefined;
      const res = await apiClient.get<ApiResponse<any[]>>('/products/suggest', {
        params: { q: q.trim(), campus: backendCampus, limit },
      });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Chi tiết sản phẩm
   */
  async getProductById(id: string): Promise<ProductItem | null> {
    const res = await apiClient.get<ApiResponse<any>>(`/products/${id}`);
    if (res.data?.data) {
      return adaptBackendProductToMobile(res.data.data);
    }
    return null;
  },

  /**
   * Đăng tin bán sản phẩm mới lên sàn (Chuẩn hóa Enum Campus, Condition, Category & Hashtags)
   */
  async createProduct(payload: CreateProductPayload): Promise<ProductItem> {
    const backendCampus = toBackendCampus(payload.campus) || 'HOL';
    const backendCondition = toBackendCondition(payload.condition);
    const backendCategory = toBackendCategory(payload.category);

    const desc =
      payload.description && payload.description.trim().length >= 10
        ? payload.description.trim()
        : `${payload.title} - Sản phẩm đồ dùng sinh viên FPT pass lại giá sinh viên. Hẹn xem tại Safe-point.`;

    const extractedUrls = Array.isArray(payload.images)
      ? payload.images.filter((img) => typeof img === 'string' && img.startsWith('http'))
      : [];

    const finalImageUrls =
      extractedUrls.length > 0
        ? extractedUrls
        : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600'];

    const body: any = {
      title: payload.title.trim(),
      description: desc,
      price: Math.max(0, Number(payload.price)),
      condition: backendCondition,
      categoryType: backendCategory,
      campus: backendCampus,
      meetupLocation: payload.safePoint || 'Trạm Safe-Point Sảnh Tòa Alpha',
      location: payload.safePoint || 'Trạm Safe-Point Sảnh Tòa Alpha',
      allowShipping: payload.campusShipEnabled ?? true,
      hashtags: payload.hashtags ?? [],
      imageUrls: finalImageUrls,
    };

    const res = await apiClient.post<ApiResponse<any>>('/products', body);
    return adaptBackendProductToMobile(res.data.data);
  },

  /**
   * Cập nhật tin đăng (Sửa tin)
   */
  async updateProduct(id: string, updates: Partial<CreateProductPayload>): Promise<ProductItem> {
    const body: any = {};
    if (updates.title) body.title = updates.title;
    if (updates.description) body.description = updates.description;
    if (updates.price !== undefined) body.price = Number(updates.price);
    if (updates.condition) body.condition = toBackendCondition(updates.condition);
    if (updates.campus) body.campus = toBackendCampus(updates.campus);
    if (updates.category) body.categoryType = toBackendCategory(updates.category);
    if (updates.safePoint) {
      body.meetupLocation = updates.safePoint;
      body.location = updates.safePoint;
    }
    if (updates.hashtags) {
      body.hashtags = updates.hashtags;
    }

    const res = await apiClient.patch<ApiResponse<any>>(`/products/${id}`, body);
    return adaptBackendProductToMobile(res.data.data);
  },

  /**
   * Toggle yêu thích sản phẩm
   */
  async toggleFavorite(productId: string): Promise<{ isFavorited: boolean }> {
    const res = await apiClient.post<ApiResponse<any>>(`/products/${productId}/favorite`);
    return res.data?.data || { isFavorited: true };
  },

  /**
   * Lấy danh sách sản phẩm yêu thích của tôi từ Backend
   */
  async getMyFavorites(): Promise<ProductItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/products/favorites/me');
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map(adaptBackendProductToMobile);
      }
    } catch (e: any) {
      console.log('⚠️ [Backend getMyFavorites offline]:', e?.message);
    }
    return [];
  },

  /**
   * Lấy danh sách tin đăng của chính tôi (Người bán)
   */
  async getMyProducts(): Promise<ProductItem[]> {
    const res = await apiClient.get<ApiResponse<any[]>>('/products/me');
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data.map(adaptBackendProductToMobile);
    }
    return [];
  },

  /**
   * Đẩy tin / Ghim nổi bật bài viết (Boost Post)
   */
  async boostProduct(id: string, type: 'BUMP' | 'PIN_24H' = 'BUMP'): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(`/products/${id}/boost`, { type });
    return res.data?.data;
  },

  /**
   * Gia hạn tin đăng 30 ngày (Renew)
   */
  async renewProduct(id: string): Promise<ProductItem> {
    const res = await apiClient.post<ApiResponse<any>>(`/products/${id}/renew`);
    return adaptBackendProductToMobile(res.data.data);
  },

  /**
   * Đổi trạng thái tin đăng (AVAILABLE, RESERVED, SOLD, HIDDEN)
   */
  async updateProductStatus(
    id: string,
    status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN'
  ): Promise<ProductItem> {
    const res = await apiClient.patch<ApiResponse<any>>(`/products/${id}/status`, { status });
    return adaptBackendProductToMobile(res.data.data);
  },

  /**
   * Xóa vĩnh viễn bài đăng
   */
  async deleteProduct(id: string): Promise<any> {
    const res = await apiClient.delete<ApiResponse<any>>(`/products/${id}`);
    return res.data?.data;
  },

  /**
   * Lấy Top từ khóa tìm kiếm hot nhất từ Redis ZSET (GET /api/products/trending/searches)
   */
  async getTrendingSearches(limit: number = 8): Promise<Array<{ keyword: string; searchCount: number }>> {
    try {
      const res = await apiClient.get<ApiResponse<Array<{ keyword: string; searchCount: number }>>>(
        '/products/trending/searches',
        { params: { limit } }
      );
      return res.data?.data || [];
    } catch {
      return [];
    }
  },
};

export default productMobileService;
