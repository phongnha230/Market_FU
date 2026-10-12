import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productMobileService } from '../services/productMobileService';

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  condition: string;
  category: string;
  categoryType?: string;
  images: any[];
  campus: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
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

const INITIAL_PRODUCTS: ProductItem[] = [];

export interface FetchProductsFilter {
  campus?: string;
  category?: string;
  search?: string;
  hashtag?: string;
  limit?: number;
  page?: number;
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
          let params: FetchProductsFilter = {};
          if (typeof filter === 'string') {
            const cleanFilter = filter.trim().toUpperCase();
            if (cleanFilter && cleanFilter !== 'TẤT CẢ' && cleanFilter !== 'ALL') {
              params = { campus: filter };
            }
          } else if (filter && typeof filter === 'object') {
            params = { ...filter };
            if (params.campus && (params.campus.toUpperCase() === 'TẤT CẢ' || params.campus.toUpperCase() === 'ALL')) {
              delete params.campus;
            }
            if (params.category && (params.category.toUpperCase() === 'TẤT CẢ' || params.category.toUpperCase() === 'ALL')) {
              delete params.category;
            }
          }
          const liveProducts = await productMobileService.getProducts(params);
          if (Array.isArray(liveProducts)) {
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
            description: newProdData.description,
            hashtags: newProdData.hashtags,
          })
          .then((live) => {
            if (live?.id) {
              set((state) => ({
                products: state.products.map((p) =>
                  p.id === newProduct.id ? { ...p, id: live.id } : p
                ),
              }));
            }
          })
          .catch(() => {});

        return newProduct;
      },

      updateProduct: (id, partial) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...partial } : p)),
        }));

        productMobileService.updateProduct(id, partial as any).catch(() => {});
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));

        productMobileService.deleteProduct(id).catch(() => {});
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
