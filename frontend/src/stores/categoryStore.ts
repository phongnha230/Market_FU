import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ProductCategory =
  | 'DORM_ITEM'
  | 'BOOKS'
  | 'ELECTRONICS'
  | 'VEHICLE'
  | 'CLOTHING'
  | 'OTHER';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  iconName: string;
  badgeText?: string;
  itemCount: number;
  isActive: boolean;
}

interface CategoryState {
  categories: CategoryItem[];
  selectedCategorySlug: string | null;

  // Actions
  setSelectedCategory: (slug: string | null) => void;
  getCategoryBySlug: (slug: string) => CategoryItem | undefined;
  getCategoryByType: (type: ProductCategory) => CategoryItem | undefined;
  resetCategories: () => void;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-books',
    name: 'Giáo Trình & Sách PE',
    slug: 'giao-trinh-sach',
    description: 'Giáo trình chuẩn FPT, tài liệu ôn thi PE/FE, slide in các kỳ MAS, CSL, PRF, PRO, WED',
    category: 'BOOKS',
    iconName: 'BookOpen',
    badgeText: 'Hot PE',
    itemCount: 420,
    isActive: true,
  },
  {
    id: 'cat-elec',
    name: 'Đồ Công Nghệ & Gear',
    slug: 'do-cong-nghe-gear',
    description: 'Laptop lập trình, màn hình di động, bàn phím cơ, chuột không dây phục vụ học tập',
    category: 'ELECTRONICS',
    iconName: 'Laptop',
    badgeText: 'Ưa chuộng',
    itemCount: 310,
    isActive: true,
  },
  {
    id: 'cat-dorm',
    name: 'Đồ Dùng KTX & Phòng Trọ',
    slug: 'do-dung-ktx',
    description: 'Tủ sấy quần áo, quạt tích điện, nồi cơm mini, ấm đun siêu tốc cho sinh viên nội trú',
    category: 'DORM_ITEM',
    iconName: 'Home',
    badgeText: 'Tiết kiệm',
    itemCount: 245,
    isActive: true,
  },
  {
    id: 'cat-vehicle',
    name: 'Xe Máy & Xe Đạp Campus',
    slug: 'xe-may-xe-dap',
    description: 'Xe máy số, xe tay ga, xe đạp đi học trong campus Hòa Lạc, Đà Nẵng, Cần Thơ, Quy Nhơn',
    category: 'VEHICLE',
    iconName: 'Bike',
    itemCount: 95,
    isActive: true,
  },
  {
    id: 'cat-cloth',
    name: 'Đồng Phục & Võ Phục Vovinam',
    slug: 'dong-phuc-vovinam',
    description: 'Áo cam FPT chính hãng, võ phục Vovinam nhập môn kèm đai, áo khoác gió sự kiện',
    category: 'CLOTHING',
    iconName: 'Shirt',
    badgeText: 'FPTer',
    itemCount: 180,
    isActive: true,
  },
  {
    id: 'cat-other',
    name: 'Nhượng Lại Phòng Trọ & Khác',
    slug: 'nhuong-phong-tro-khac',
    description: 'Sang nhượng phòng trọ quanh campus Hola/Q.9, dụng cụ thể thao, nhạc cụ guitar/cajon',
    category: 'OTHER',
    iconName: 'Sparkles',
    itemCount: 110,
    isActive: true,
  },
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: INITIAL_CATEGORIES,
      selectedCategorySlug: null,

      setSelectedCategory: (slug) => set({ selectedCategorySlug: slug }),

      getCategoryBySlug: (slug) => {
        return get().categories.find((c) => c.slug === slug);
      },

      getCategoryByType: (type) => {
        return get().categories.find((c) => c.category === type);
      },

      resetCategories: () =>
        set({
          categories: INITIAL_CATEGORIES,
          selectedCategorySlug: null,
        }),
    }),
    {
      name: 'fu_market_categories_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
