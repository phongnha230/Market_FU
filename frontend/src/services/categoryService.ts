import { apiClient, ApiResponse } from './apiClient';
import { CategoryOption } from '@/types/product';

export const categoryService = {
  // Lấy danh sách danh mục phân loại bài đăng
  async getCategories(): Promise<CategoryOption[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/categories');
      const items = response.data.data || [];
      return items.map((cat: any) => ({
        id: cat.id || cat._id,
        name: cat.name,
        description: cat.description,
        count: cat._count?.posts ?? cat.activePostCount ?? 0,
        color: cat.color || '#F97316',
        bgColor: cat.bgColor || '#FFF7ED',
      }));
    } catch {
      // Trả về danh sách mặc định nếu server gặp sự cố mạng
      return [
        { id: 'cat-books', name: 'Giáo trình & Sách', count: 120, color: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'cat-electronics', name: 'Đồ điện tử & Phụ kiện', count: 85, color: '#7C3AED', bgColor: '#F5F3FF' },
        { id: 'cat-dorm', name: 'Đồ phòng trọ & Gia dụng', count: 140, color: '#EA580C', bgColor: '#FFF7ED' },
        { id: 'cat-vehicles', name: 'Xe cộ & Đi lại', count: 42, color: '#16A34A', bgColor: '#F0FDF4' },
        { id: 'cat-clothing', name: 'Thời trang sinh viên', count: 68, color: '#DB2777', bgColor: '#FDF2F8' },
        { id: 'cat-others', name: 'Khác', count: 30, color: '#4B5563', bgColor: '#F3F4F6' },
      ];
    }
  },
};
