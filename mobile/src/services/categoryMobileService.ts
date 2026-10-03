import apiClient, { ApiResponse } from './apiClient';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  productCount?: number;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'Tất cả', slug: 'all', icon: 'grid-outline' },
  { id: 'it', name: 'Đồ Công nghệ & IT', slug: 'it', icon: 'laptop-outline' },
  { id: 'books', name: 'Giáo trình & Sách PE/FE', slug: 'books', icon: 'book-outline' },
  { id: 'dom', name: 'Đồ KTX & Phòng trọ', slug: 'dom', icon: 'bed-outline' },
  { id: 'vovinam', name: 'Đồng phục Vovinam', slug: 'vovinam', icon: 'shirt-outline' },
  { id: 'other', name: 'Khác', slug: 'other', icon: 'ellipsis-horizontal-circle-outline' },
];

export const categoryMobileService = {
  async getCategories(): Promise<CategoryItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/categories');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return [
          { id: 'all', name: 'Tất cả', slug: 'all', icon: 'grid-outline' },
          ...res.data.data.map((c) => ({
            id: c.id || c._id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || 'pricetag-outline',
            description: c.description,
            productCount: c.productCount || 0,
          })),
        ];
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CATEGORIES;
  },
};

export default categoryMobileService;
