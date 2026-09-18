import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductItem, ProductDetail } from '@/types/product';
import {
  FEATURED_PRODUCTS,
  LATEST_PRODUCTS,
  SEARCH_PAGE_POSTS,
  SIMILAR_PRODUCTS,
  DETAIL_PRODUCT_AKKO,
} from '@/constants/mockProducts';

// Hợp nhất toàn bộ mock products làm dữ liệu ban đầu
const INITIAL_PRODUCTS: ProductItem[] = [
  ...SEARCH_PAGE_POSTS,
  ...FEATURED_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...LATEST_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
  ...SIMILAR_PRODUCTS.filter((p) => !SEARCH_PAGE_POSTS.some((s) => s.id === p.id)),
];

interface ProductState {
  products: ProductItem[];
  addProduct: (productData: Omit<ProductItem, 'id'> & { id?: string }) => ProductItem;
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => ProductDetail | null;
  resetProducts: () => void;
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,

      addProduct: (productData) => {
        const newId = productData.id || `fpt-post-${Date.now()}`;
        const newProduct: ProductItem = {
          ...productData,
          id: newId,
        };

        set((state) => ({
          products: [newProduct, ...state.products],
        }));

        return newProduct;
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getProductById: (id) => {
        const all = get().products;
        if (id === 'akko-3087-v2') {
          return DETAIL_PRODUCT_AKKO;
        }

        const found = all.find((p) => p.id === id);
        if (!found) {
          return DETAIL_PRODUCT_AKKO;
        }

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

        return detail;
      },

      resetProducts: () => set({ products: INITIAL_PRODUCTS }),
    }),
    {
      name: 'fu_market_products_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
