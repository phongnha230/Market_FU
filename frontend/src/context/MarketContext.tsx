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
  addCoins: (amount: number) => void;
  saveVoucher: (id: string, voucherData?: { id: string; title: string; code: string; discount: number; expiry: string }) => void;

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
  // Stores
  const userStore = useUserStore();
  const productStore = useProductStore();
  const orderStore = useOrderStore();
  const favoriteStore = useFavoriteStore();

  // Toast
  const { toastMessage, toastType, showToast, hideToast } = useToast();

  // Active Campus
  const [currentCampus, setCampus] = useState<string>('hola');

  const value: MarketContextType = {
    // User
    user: userStore.user,
    isLoggedIn: userStore.isLoggedIn,
    login: userStore.login,
    logout: userStore.logout,
    updateProfile: userStore.updateProfile,
    addCoins: userStore.addCoins,
    saveVoucher: userStore.saveVoucher,

    // Products
    products: productStore.products,
    addProduct: productStore.addProduct,
    getProductById: productStore.getProductById,

    // Orders
    orders: orderStore.orders,
    createOrder: orderStore.createOrder,
    updateOrderStatus: orderStore.updateOrderStatus,
    markOrderReviewed: orderStore.markOrderReviewed,
    getOrder: orderStore.getOrder,

    // Favorites
    favorites: favoriteStore.favorites,
    toggleFavorite: favoriteStore.toggleFavorite,
    isFavorite: favoriteStore.isFavorite,

    // Campus
    currentCampus,
    setCampus,

    // Toast
    showToast,
    hideToast,
    toastMessage,
    toastType,
  };

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
