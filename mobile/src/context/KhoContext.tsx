import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile } from '../stores/userStore';
import { CampusType } from '../stores/useCampusStore';
import { ProductItem } from '../stores/productStore';
import { OrderItem } from '../stores/orderStore';
import { WalletTransaction, UserWallet } from '../stores/walletStore';
import { NotificationItem } from '../stores/notificationStore';
import { useKhoValue } from './useKhoValue';

/**
 * Thống kê chi tiết "Kho hàng" của sinh viên / người bán
 */
export interface InventoryStats {
  total: number;
  active: number;
  pending: number;
  rejected: number;
  reserved: number;
  sold: number;
  hidden: number;
  totalViews: number;
  totalLikes: number;
  estimatedRevenue: number;
}

/**
 * Interface tổng hợp cho "Kho" dữ liệu toàn cục (Central Hub / Store / Repository Context)
 */
export interface KhoContextType {
  // === 1. TÀI KHOẢN & PHIÊN ĐĂNG NHẬP (Session Hub) ===
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  isKycVerified: boolean;
  currentCampus: CampusType | string;
  setCampus: (campus: CampusType) => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  logout: () => void;

  // === 2. KHO HÀNG CỦA TÔI (Seller Inventory / My Listings) ===
  myListings: ProductItem[];
  inventoryStats: InventoryStats;
  addProductToKho: (product: Omit<ProductItem, 'id' | 'createdAt' | 'status' | 'viewsCount' | 'likesCount'>) => ProductItem;
  updateProductInKho: (id: string, updates: Partial<ProductItem>) => void;
  removeProductFromKho: (id: string) => void;
  toggleProductStatus: (id: string, status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN') => void;
  refreshKhoHang: () => Promise<void>;

  // === 3. KHO HÀNG TOÀN SÀN & THEO CAMPUS (Marketplace Repository) ===
  allProducts: ProductItem[];
  campusProducts: ProductItem[];
  getProductById: (id: string) => ProductItem | undefined;
  searchInKho: (keyword: string, category?: string) => ProductItem[];

  // === 4. KHO ĐƠN HÀNG & GIAO DỊCH ESCROW (Orders Repository) ===
  myBuyOrders: OrderItem[];
  mySellOrders: OrderItem[];
  pendingOrdersCount: number;
  createOrderInKho: (order: Omit<OrderItem, 'id' | 'createdAt' | 'isReviewed'>) => OrderItem;
  verifySafePointOtp: (orderId: string, otp: string) => { success: boolean; message: string };
  refreshOrders: () => Promise<void>;

  // === 5. KHO VÍ TIỀN & BẢO CHỨNG ESCROW (Wallet Repository) ===
  wallet: UserWallet;
  availableBalance: number;
  escrowBalance: number;
  coins: number;
  walletTransactions: WalletTransaction[];
  depositToWallet: (amount: number) => Promise<{ success: boolean; message: string }>;
  withdrawFromWallet: (amount: number, bankInfo: { bankName: string; accountNo: string; accountName: string }) => Promise<{ success: boolean; message: string }>;
  refreshWallet: () => Promise<void>;

  // === 6. KHO MỤC YÊU THÍCH (Favorites Stash) ===
  favoriteIds: string[];
  favoriteProducts: ProductItem[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;

  // === 7. KHO THÔNG BÁO & TIN NHẮN (Realtime Signals) ===
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  notifications: NotificationItem[];
  markNotificationsAsRead: () => void;

  // === 8. ĐỒNG BỘ TOÀN BỘ KHO (Master Hub Refresh) ===
  isLoading: boolean;
  isRefreshing: boolean;
  refreshAllKho: () => Promise<void>;
}

// Khởi tạo Context
const KhoContext = createContext<KhoContextType | null>(null);

export interface KhoProviderProps {
  children: ReactNode;
}

/**
 * KhoProvider - Provider đóng vai trò là "Cái Kho" trung tâm cho toàn bộ Mobile App
 */
export const KhoProvider: React.FC<KhoProviderProps> = ({ children }) => {
  const contextValue = useKhoValue();
  return <KhoContext.Provider value={contextValue}>{children}</KhoContext.Provider>;
};

// ==========================================
// CÁC CUSTOM HOOKS SỬ DỤNG CONTEXT API ("KHO")
// ==========================================

/**
 * useKho - Hook chính tận dụng Context API làm "Cái Kho" trung tâm
 */
export const useKho = (): KhoContextType => {
  const context = useContext(KhoContext);
  if (!context) {
    throw new Error('useKho phải được sử dụng bên trong <KhoProvider />');
  }
  return context;
};

/**
 * Alias: useAppContext
 */
export const useAppContext = useKho;
export const AppProvider = KhoProvider;

/**
 * useKhoHang - Hook chuyên dụng cho Kho hàng sinh viên đăng bán
 */
export const useKhoHang = () => {
  const {
    myListings,
    inventoryStats,
    addProductToKho,
    updateProductInKho,
    removeProductFromKho,
    toggleProductStatus,
    refreshKhoHang,
    isLoading,
  } = useKho();

  return {
    myListings,
    stats: inventoryStats,
    addProduct: addProductToKho,
    updateProduct: updateProductInKho,
    removeProduct: removeProductFromKho,
    toggleStatus: toggleProductStatus,
    refresh: refreshKhoHang,
    isLoading,
  };
};

/**
 * useKhoDonHang - Hook chuyên dụng cho Kho đơn hàng và giao dịch Safe-point Escrow
 */
export const useKhoDonHang = () => {
  const {
    myBuyOrders,
    mySellOrders,
    pendingOrdersCount,
    createOrderInKho,
    verifySafePointOtp,
    refreshOrders,
    isLoading,
  } = useKho();

  return {
    buyOrders: myBuyOrders,
    sellOrders: mySellOrders,
    pendingCount: pendingOrdersCount,
    createOrder: createOrderInKho,
    verifyOtp: verifySafePointOtp,
    refreshOrders,
    isLoading,
  };
};

/**
 * useKhoVi - Hook chuyên dụng cho Kho ví tiền, số dư khả dụng và cọc Escrow
 */
export const useKhoVi = () => {
  const {
    wallet,
    availableBalance,
    escrowBalance,
    coins,
    walletTransactions,
    depositToWallet,
    withdrawFromWallet,
    refreshWallet,
  } = useKho();

  return {
    wallet,
    availableBalance,
    escrowBalance,
    coins,
    transactions: walletTransactions,
    deposit: depositToWallet,
    withdraw: withdrawFromWallet,
    refresh: refreshWallet,
  };
};

/**
 * useKhoYeuThich - Hook chuyên dụng cho Kho hàng yêu thích
 */
export const useKhoYeuThich = () => {
  const {
    favoriteIds,
    favoriteProducts,
    isFavorite,
    toggleFavorite,
  } = useKho();

  return {
    favoriteIds,
    favoriteProducts,
    isFavorite,
    toggleFavorite,
  };
};
