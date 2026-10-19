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
  status: 'PENDING_APPROVAL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'EXPIRED' | 'REJECTED';
  rejectionReason?: string;
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
  addProductFromRemote: (product: ProductItem) => void;
  updateProduct: (id: string, partial: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  getUserProducts: (sellerId: string) => ProductItem[];
}

let inFlightProductsPromise: Promise<ProductItem[]> | null = null;
let lastFilterHash = '';

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      isLoading: false,

      fetchProducts: async (filter?: string | FetchProductsFilter) => {
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

        const filterHash = JSON.stringify(params);
        if (inFlightProductsPromise && filterHash === lastFilterHash) {
          return inFlightProductsPromise;
        }

        lastFilterHash = filterHash;
        inFlightProductsPromise = (async () => {
          try {
            set({ isLoading: true });
            const liveProducts = await productMobileService.getProducts(params);
            if (Array.isArray(liveProducts)) {
              set({ products: liveProducts });
              return liveProducts;
            }
          } catch (e: any) {
            console.log('⚠️ [Backend products offline, using local store]:', e?.message);
          } finally {
            set({ isLoading: false });
            inFlightProductsPromise = null;
          }
          return get().products;
        })();

        return inFlightProductsPromise;
      },

      addProduct: (newProdData) => {
        const tempId = `prod_${Date.now()}`;
        const newProduct: ProductItem = {
          ...newProdData,
          id: tempId,
          status: 'AVAILABLE',
          createdAt: 'Vừa xong',
          viewsCount: 1,
          likesCount: 0,
        };

        set((state) => ({
          products: [newProduct, ...state.products],
        }));

        // Gửi trực tiếp lên backend API
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
                  p.id === tempId ? { ...live, ...p, id: live.id } : p
                ),
              }));
            }
          })
          .catch((err) => {
            console.log('⚠️ [Mobile createProduct error]:', err?.message);
          });

        return newProduct;
      },

      addProductFromRemote: (remoteProduct: ProductItem) => {
        set((state) => {
          const exists = state.products.some((p) => p.id === remoteProduct.id);
          if (exists) {
            return {
              products: state.products.map((p) => (p.id === remoteProduct.id ? remoteProduct : p)),
            };
          }
          return {
            products: [remoteProduct, ...state.products],
          };
        });
      },

      updateProduct: (id, partial) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...partial } : p)),
        }));

        productMobileService.updateProduct(id, partial as any).catch((err) => {
          console.log('⚠️ [Mobile updateProduct error]:', err?.message);
        });
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));

        productMobileService.deleteProduct(id).catch((err) => {
          console.log('⚠️ [Mobile deleteProduct error]:', err?.message);
        });
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
