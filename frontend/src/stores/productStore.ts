import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductItem, ProductDetail } from '@/types/product';

const INITIAL_PRODUCTS: ProductItem[] = [];

interface ProductState {
  products: ProductItem[];
  setProducts: (products: ProductItem[]) => void;
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

      setProducts: (products) => set({ products }),

      addProduct: (productData) => {
        const newId = productData.id || `fpt-post-${Date.now()}`;
        const rawImages = productData.images && productData.images.length > 0
          ? productData.images
          : (productData.imageUrl ? [productData.imageUrl] : []);
        const primaryImage = rawImages[0] || productData.imageUrl || '/products/book-prf192.jpg';

        const newProduct: ProductItem = {
          ...productData,
          id: newId,
          imageUrl: primaryImage,
          images: rawImages,
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
        const found = all.find((p) => p.id === id);
        if (!found) {
          return null;
        }

        const rawImages = found.images && found.images.length > 0
          ? found.images
          : (found.imageUrl ? [found.imageUrl] : []);

        const galleryImages = rawImages.map((src, idx) => ({
          src,
          alt: `${found.title} - Ảnh ${idx + 1}${idx === 0 ? ' (Bìa)' : ''}`,
        }));

        const detail: ProductDetail = {
          ...found,
          condition: found.badges.find((b) => b.includes('%') || b.toLowerCase().includes('mới')) || 'Đã qua sử dụng (Tốt)',
          galleryImages,
          description: found.description || `Pass lại "${found.title}". Hàng chính chủ dùng giữ gìn cẩn thận, phục vụ học tập tại campus rất tốt. Sinh viên cùng trường có thể hẹn gặp trực tiếp tại sảnh KTX hoặc Căng-tin để kiểm tra thoải mái trước khi chuyển khoản.`,
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
          meetingNote: found.meetupLocation
            ? `Giao dịch trực tiếp tại ${found.meetupLocation}. Sinh viên FPT được kiểm tra kỹ trước khi thanh toán.`
            : `Giao dịch trực tiếp tại ${found.location}. Sinh viên FPT được kiểm tra kỹ trước khi thanh toán.`,
        };

        return detail;
      },

      resetProducts: () => set({ products: INITIAL_PRODUCTS }),
    }),
    {
      name: 'fu_market_products_storage_v2',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
