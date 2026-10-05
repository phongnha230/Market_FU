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
