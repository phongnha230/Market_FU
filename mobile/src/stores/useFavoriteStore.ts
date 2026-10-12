import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favoritesByUser: Record<string, string[]>;
  activeUserId: string | null;
  favoriteIds: string[];

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchFavorites: () => Promise<string[]>;
  toggleFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  clearSoldFavorites: (soldIds: string[]) => number;
  isFavorite: (productId: string) => boolean;
  getFavorites: () => string[];
}

const INITIAL_FAVORITES: Record<string, string[]> = {};

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoritesByUser: INITIAL_FAVORITES,
      activeUserId: null,
      favoriteIds: [],

      setActiveUser: (userId) => {
        const { favoritesByUser } = get();
        const currentId = userId || 'anonymous';
        const userFavs = favoritesByUser[currentId] || [];
        set({
          activeUserId: userId,
          favoriteIds: userFavs,
        });

        if (userId) {
          get().fetchFavorites().catch(() => {});
        }
      },

      fetchFavorites: async () => {
        try {
          const { productMobileService } = await import('../services/productMobileService');
          const serverFavs = await productMobileService.getMyFavorites();
          if (Array.isArray(serverFavs)) {
            const serverIds = serverFavs.map((p) => p.id);
            const { favoritesByUser, activeUserId } = get();
            const currentId = activeUserId || 'anonymous';

            // Đồng bộ dữ liệu chi tiết của các sản phẩm yêu thích này vào productStore
            if (serverFavs.length > 0) {
              import('./productStore').then(({ useProductStore }) => {
                const store = useProductStore.getState();
                const existingMap = new Map(store.products.map((p) => [p.id, p]));
                serverFavs.forEach((favProd) => {
                  existingMap.set(favProd.id, {
                    ...(existingMap.get(favProd.id) || {}),
                    ...favProd,
                  });
                });
                useProductStore.setState({ products: Array.from(existingMap.values()) });
              }).catch(() => {});
            }

            set({
              favoriteIds: serverIds,
              favoritesByUser: {
                ...favoritesByUser,
                [currentId]: serverIds,
              },
            });
            return serverIds;
          }
        } catch (e: any) {
          console.log('⚠️ [fetchFavorites offline]:', e?.message);
        }
        return get().favoriteIds;
      },

      toggleFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const currentList = favoritesByUser[currentId] || [];
        const exists = currentList.includes(id);

        const updatedList = exists
          ? currentList.filter((item) => item !== id)
          : [...currentList, id];

        set({
          favoriteIds: updatedList,
          favoritesByUser: {
            ...favoritesByUser,
            [currentId]: updatedList,
          },
        });

        // Bắn ngầm đồng bộ lên Backend API
        import('../services/productMobileService').then(({ productMobileService }) => {
          productMobileService.toggleFavorite(id).catch(() => {});
        });
      },

      removeFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const currentList = favoritesByUser[currentId] || [];
        if (!currentList.includes(id)) return;

        const updatedList = currentList.filter((item) => item !== id);
        set({
          favoriteIds: updatedList,
          favoritesByUser: {
            ...favoritesByUser,
            [currentId]: updatedList,
          },
        });

        import('../services/productMobileService').then(({ productMobileService }) => {
          productMobileService.toggleFavorite(id).catch(() => {});
        });
      },

      clearSoldFavorites: (soldIds: string[]) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const currentList = favoritesByUser[currentId] || [];
        const soldSet = new Set(soldIds);

        const updatedList = currentList.filter((id) => !soldSet.has(id));
        const removedCount = currentList.length - updatedList.length;

        if (removedCount > 0) {
          set({
            favoriteIds: updatedList,
            favoritesByUser: {
              ...favoritesByUser,
              [currentId]: updatedList,
            },
          });

          // Đồng bộ xóa trên Backend cho từng id đã bán
          import('../services/productMobileService').then(({ productMobileService }) => {
            soldIds.forEach((id) => {
              productMobileService.toggleFavorite(id).catch(() => {});
            });
          });
        }

        return removedCount;
      },

      isFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const list = favoritesByUser[currentId] || [];
        return list.includes(id);
      },

      getFavorites: () => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        return favoritesByUser[currentId] || [];
      },
    }),
    {
      name: 'fu-favorite-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFavoriteStore;
