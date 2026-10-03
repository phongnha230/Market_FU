import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: string;
  category: string;
  images: any[];
  campus: string;
  sellerId: string;
  sellerName: string;
  sellerCohort?: string;
  sellerRating?: number;
  sellerIsVerified?: boolean;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN';
  safePoint?: string;
  allowNegotiate?: boolean;
  campusShipEnabled?: boolean;
  hashtags?: string[];
  description?: string;
  createdAt: string;
  viewsCount?: number;
  likesCount?: number;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_dell_24',
    title: 'Màn hình Dell 24" UltraSharp U2419H',
    price: 1850000,
    originalPrice: 2200000,
    condition: 'Đẹp 98% nguyên zin',
    category: 'electronics',
    images: [require('../../assets/products/monitor-dell-24.jpg')],
    campus: 'HÒA LẠC',
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    sellerRating: 5.0,
    sellerIsVerified: true,
    status: 'AVAILABLE',
    safePoint: 'Trạm Safe-Point Sảnh Tòa Alpha',
    allowNegotiate: true,
    campusShipEnabled: true,
    hashtags: ['dell', 'manhinh', 'u2419h', 'gear', 'fpt'],
    createdAt: 'Hôm nay',
    viewsCount: 142,
    likesCount: 18,
  },
  {
    id: 'prod_akko_3087',
    title: 'Bàn phím cơ Akko 3087 v2 Orange Switch',
    price: 480000,
    originalPrice: 650000,
    condition: 'Like new 99% fullbox',
    category: 'electronics',
    images: [require('../../assets/products/keyboard-akko.jpg')],
    campus: 'HÒA LẠC',
    sellerId: 'acc_verified',
    sellerName: 'Trần Minh Quân',
    sellerCohort: 'K17 - FPT Hola',
    sellerRating: 4.9,
    sellerIsVerified: true,
    status: 'AVAILABLE',
    safePoint: 'Trạm Safe-Point Sảnh Tòa Alpha',
    allowNegotiate: true,
    campusShipEnabled: false,
    hashtags: ['akko', 'banphimco', 'gaming', 'switch'],
    createdAt: 'Hôm qua',
    viewsCount: 88,
    likesCount: 12,
  },
  {
    id: 'prod_g102',
    title: 'Chuột Logitech G102 Lightsync RGB Gen 2',
    price: 210000,
    originalPrice: 350000,
    condition: 'Hoạt động tốt 95%',
    category: 'electronics',
    images: [require('../../assets/products/mouse-g102.jpg')],
    campus: 'HÒA LẠC',
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    sellerRating: 5.0,
    sellerIsVerified: true,
    status: 'AVAILABLE',
    safePoint: 'Trạm Safe-Point Sảnh Tòa Alpha',
    allowNegotiate: false,
    campusShipEnabled: true,
    hashtags: ['logitech', 'g102', 'chuot', 'rgb'],
    createdAt: '3 ngày trước',
    viewsCount: 65,
    likesCount: 7,
  },
];

export interface FetchProductsFilter {
  campus?: string;
  category?: string;
  search?: string;
  hashtag?: string;
}

interface ProductState {
  products: ProductItem[];
  isLoading: boolean;
  fetchProducts: (filter?: string | FetchProductsFilter) => Promise<ProductItem[]>;
  addProduct: (product: Omit<ProductItem, 'id' | 'createdAt' | 'status' | 'viewsCount' | 'likesCount'>) => ProductItem;
  updateProduct: (id: string, partial: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  getUserProducts: (sellerId: string) => ProductItem[];
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      isLoading: false,

      fetchProducts: async (filter?: string | FetchProductsFilter) => {
        try {
          set({ isLoading: true });
          const { productMobileService } = await import('../services/productMobileService');
          const params =
            typeof filter === 'string'
              ? { campus: filter }
              : filter || {};
          const liveProducts = await productMobileService.getProducts(params);
          if (liveProducts && liveProducts.length > 0) {
            set({ products: liveProducts });
            return liveProducts;
          }
        } catch (e: any) {
          console.log('⚠️ [Backend products offline, using local store]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
        return get().products;
      },

      addProduct: (newProdData) => {
        const newProduct: ProductItem = {
          ...newProdData,
          id: `prod_${Date.now()}`,
          status: 'AVAILABLE',
          createdAt: 'Vừa xong',
          viewsCount: 1,
          likesCount: 0,
        };

        set((state) => ({
          products: [newProduct, ...state.products],
        }));

        // Gửi ngầm lên backend nếu có kết nối
        import('../services/productMobileService').then(({ productMobileService }) => {
          productMobileService
            .createProduct({
              title: newProdData.title,
              price: newProdData.price,
              condition: newProdData.condition,
              category: newProdData.category,
              images: newProdData.images,
              campus: newProdData.campus,
              safePoint: newProdData.safePoint,
              allowNegotiate: newProdData.allowNegotiate,
              campusShipEnabled: newProdData.campusShipEnabled,
            })
            .catch(() => {});
        });

        return newProduct;
      },

      updateProduct: (id, partial) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...partial } : p)),
        }));

        import('../services/productMobileService').then(({ productMobileService }) => {
          productMobileService.updateProduct(id, partial as any).catch(() => {});
        });
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getUserProducts: (sellerId: string) => {
        return get().products.filter((p) => p.sellerId === sellerId);
      },
    }),
    {
      name: 'fu_products_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useProductStore;
