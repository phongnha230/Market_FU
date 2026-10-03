'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useUserStore, UserProfile } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';
import { ProductItem, ProductDetail } from '@/types/product';
import { useOrderStore, OrderItem } from '@/stores/orderStore';
import { useFavoriteStore, FavoriteItem } from '@/stores/favoriteStore';
import { useToast, ToastType } from '@/hooks/useToast';
import ToastNotification from '@/components/ui/ToastNotification';

export interface MarketContextType {
  // User & Auth
  user: UserProfile;
  isLoggedIn: boolean;
  login: (email?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  addCoins: (amount: number) => void;
  saveVoucher: (id: string, voucherData?: { id: string; title: string; code: string; discount: number; expiry: string }) => void;
  checkInDaily: () => { success: boolean; coinsAdded: number };
  claimQuestCoins: (questId: string, amount: number) => { success: boolean; amount: number };

  // Products
  products: ProductItem[];
  addProduct: (productData: Omit<ProductItem, 'id'> & { id?: string }) => ProductItem;
  getProductById: (id: string) => ProductDetail | null;

  // Orders
  orders: OrderItem[];
  createOrder: (params: {
    product: OrderItem['product'];
    type?: 'inter-campus' | 'safe-handoff';
    deliveryNote?: string;
    paymentMethod?: string;
  }) => OrderItem;
  updateOrderStatus: (idOrCode: string, status: OrderItem['status'], statusText?: string) => void;
  markOrderReviewed: (idOrCode: string) => void;
  getOrder: (idOrCode: string) => OrderItem | undefined;

  // Favorites
  favorites: FavoriteItem[];
  toggleFavorite: (product: ProductItem | FavoriteItem) => boolean;
  isFavorite: (id: string) => boolean;

  // Campus
  currentCampus: string;
  setCampus: (campusId: string) => void;

  // Toast
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  toastMessage: string | null;
  toastType: ToastType;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
  // Atomic Store Selectors (Chỉ subscribe đúng phần dữ liệu cần thiết)
  const user = useUserStore((s) => s.user);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const login = useUserStore((s) => s.login);
  const logout = useUserStore((s) => s.logout);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const changePassword = useUserStore((s) => s.changePassword);
  const addCoins = useUserStore((s) => s.addCoins);
  const saveVoucher = useUserStore((s) => s.saveVoucher);
  const checkInDaily = useUserStore((s) => s.checkInDaily);
  const claimQuestCoins = useUserStore((s) => s.claimQuestCoins);

  const products = useProductStore((s) => s.products);
  const addProduct = useProductStore((s) => s.addProduct);
  const getProductById = useProductStore((s) => s.getProductById);

  const orders = useOrderStore((s) => s.orders);
  const createOrder = useOrderStore((s) => s.createOrder);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const markOrderReviewed = useOrderStore((s) => s.markOrderReviewed);
  const getOrder = useOrderStore((s) => s.getOrder);

  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFavorite = useFavoriteStore((s) => s.toggleFavorite);
  const isFavorite = useFavoriteStore((s) => s.isFavorite);

  // Toast
  const { toastMessage, toastType, showToast, hideToast } = useToast();

  // Active Campus
  const [currentCampus, setCampus] = useState<string>('hola');

  // useMemo giữ ổn định context reference, chống re-render toàn app khi state không đổi
  const value = React.useMemo<MarketContextType>(
    () => ({
      // User
      user,
      isLoggedIn,
      login,
      logout,
      updateProfile,
      changePassword,
      addCoins,
      saveVoucher,
      checkInDaily,
      claimQuestCoins,

      // Products
      products,
      addProduct,
      getProductById,

      // Orders
      orders,
      createOrder,
      updateOrderStatus,
      markOrderReviewed,
      getOrder,

      // Favorites
      favorites,
      toggleFavorite,
      isFavorite,

      // Campus
      currentCampus,
      setCampus,

      // Toast
      showToast,
      hideToast,
      toastMessage,
      toastType,
    }),
    [
      user,
      isLoggedIn,
      login,
      logout,
      updateProfile,
      changePassword,
      addCoins,
      saveVoucher,
      checkInDaily,
      claimQuestCoins,
      products,
      addProduct,
      getProductById,
      orders,
      createOrder,
      updateOrderStatus,
      markOrderReviewed,
      getOrder,
      favorites,
      toggleFavorite,
      isFavorite,
      currentCampus,
      showToast,
      hideToast,
      toastMessage,
      toastType,
    ]
  );

  return (
    <MarketContext.Provider value={value}>
      {children}
      <ToastNotification message={toastMessage} type={toastType} onClose={hideToast} />
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}
