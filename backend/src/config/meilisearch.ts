import { Meilisearch } from 'meilisearch';
import { ENV } from './env';

let isAvailable = false;
let hasLoggedOfflineWarning = false;

export const meiliClient = new Meilisearch({
  host: ENV.MEILISEARCH_HOST,
  apiKey: ENV.MEILISEARCH_KEY || undefined,
});

export const isMeilisearchReady = (): boolean => isAvailable;

/**
 * Khởi tạo index và cấu hình chuẩn cho tìm kiếm tiếng Việt & bộ lọc đa chiều
 */
export const initMeilisearch = async (): Promise<boolean> => {
  try {
    await meiliClient.health();
    isAvailable = true;
    hasLoggedOfflineWarning = false;
    console.log('✅ [MEILISEARCH] Kết nối thành công tới Meilisearch engine');

    const index = meiliClient.index('products');

    // Cấu hình searchable, filterable và sortable attributes
    await index.updateSettings({
      searchableAttributes: [
        'title',
        'description',
        'hashtags',
        'categoryName',
        'meetupLocation',
      ],
      filterableAttributes: [
        'campus',
        'categoryId',
        'categoryType',
        'condition',
        'price',
        'status',
      ],
      sortableAttributes: [
        'price',
        'createdAt',
        'viewsCount',
        'likesCount',
      ],
      rankingRules: [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      },
    });

    return true;
  } catch (error: any) {
    isAvailable = false;
    if (!hasLoggedOfflineWarning && ENV.NODE_ENV !== 'test') {
      hasLoggedOfflineWarning = true;
      console.warn(
        '⚠️ [MEILISEARCH] Không thể kết nối tới Meilisearch, tự động chuyển sang Fallback (MongoDB Regex):',
        error.message
      );
    }
    return false;
  }
};

// Tự động kiểm tra kết nối khi khởi động (nếu không phải test)
if (ENV.NODE_ENV !== 'test') {
  initMeilisearch().catch(() => {});
}

export interface MeiliProductDocument {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  price: number;
  originalPrice?: number | null;
  condition: string;
  quantity: number;
  campus: string;
  categoryId?: string | null;
  categoryType: string;
  categoryName?: string;
  status: string;
  meetupLocation?: string | null;
  allowShipping: boolean;
  viewsCount: number;
  likesCount: number;
  imageUrl: string;
  createdAt: number;
}

/**
 * Đồng bộ 1 sản phẩm sang Meilisearch (Safe - không throw lỗi khi offline)
 */
export const syncProductToMeili = async (product: any): Promise<void> => {
  if (!isAvailable) return;
  try {
    const document: MeiliProductDocument = {
      id: product.id,
      title: product.title,
      description: product.description,
      hashtags: product.hashtags ?? [],
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      condition: product.condition,
      quantity: product.quantity,
      campus: product.campus,
      categoryId: product.categoryId ?? null,
      categoryType: product.categoryType,
      categoryName: product.category?.name || '',
      status: product.status,
      meetupLocation: product.meetupLocation ?? null,
      allowShipping: product.allowShipping ?? true,
      viewsCount: product.viewsCount ?? 0,
      likesCount: product.likesCount ?? 0,
      imageUrl: product.images?.[0]?.imageUrl || '',
      createdAt: product.createdAt ? new Date(product.createdAt).getTime() : Date.now(),
    };

    await meiliClient.index('products').addDocuments([document], { primaryKey: 'id' });
  } catch (error) {
    // Không ném lỗi ra ngoài để tránh làm ảnh hưởng tiến trình chính
  }
};

/**
 * Xóa 1 sản phẩm khỏi Meilisearch
 */
export const deleteProductFromMeili = async (productId: string): Promise<void> => {
  if (!isAvailable) return;
  try {
    await meiliClient.index('products').deleteDocument(productId);
  } catch (error) {
    // Silently ignore deletion error
  }
};

export interface SearchProductFilterOptions {
  campus?: string;
  categoryId?: string;
  categoryType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'views';
  page?: number;
  limit?: number;
}

export interface MeiliSearchResult {
  hits: MeiliProductDocument[];
  totalHits: number;
  productIds: string[];
}

/**
 * Tìm kiếm sản phẩm thông minh qua Meilisearch (Tiếng Việt không dấu + Chịu lỗi chính tả)
 * Trả về null nếu Meilisearch offline (để service tự động fallback sang MongoDB)
 */
export const searchProductsMeili = async (
  query: string,
  options: SearchProductFilterOptions = {}
): Promise<MeiliSearchResult | null> => {
  if (!isAvailable) return null;

  try {
    const { campus, categoryId, categoryType, condition, minPrice, maxPrice, sortBy = 'newest', page = 1, limit = 20 } = options;
    const filterParts: string[] = ['status = "AVAILABLE"'];

    if (campus) filterParts.push(`campus = "${campus}"`);
    if (categoryId) filterParts.push(`categoryId = "${categoryId}"`);
    if (categoryType) filterParts.push(`categoryType = "${categoryType}"`);
    if (condition) filterParts.push(`condition = "${condition}"`);
    if (minPrice !== undefined) filterParts.push(`price >= ${minPrice}`);
    if (maxPrice !== undefined) filterParts.push(`price <= ${maxPrice}`);

    let sortParam: string[] = ['createdAt:desc'];
    if (sortBy === 'price_asc') sortParam = ['price:asc'];
    if (sortBy === 'price_desc') sortParam = ['price:desc'];
    if (sortBy === 'views') sortParam = ['viewsCount:desc'];

    const offset = (page - 1) * limit;

    const response = await meiliClient.index<MeiliProductDocument>('products').search(query, {
      filter: filterParts.join(' AND '),
      sort: sortParam,
      limit,
      offset,
    });

    return {
      hits: response.hits as any,
      totalHits: response.estimatedTotalHits ?? response.hits.length,
      productIds: (response.hits as any[]).map((h: any) => h.id),
    };
  } catch (error) {
    return null; // Fallback sang MongoDB
  }
};
