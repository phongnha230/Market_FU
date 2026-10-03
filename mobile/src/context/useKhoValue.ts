import { useState, useCallback, useMemo } from 'react';
import { useUserStore } from '../stores/userStore';
import { useCampusStore } from '../stores/useCampusStore';
import { useProductStore, ProductItem } from '../stores/productStore';
import { useOrderStore, OrderItem } from '../stores/orderStore';
import { useWalletStore } from '../stores/walletStore';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { useChatStore } from '../stores/chatStore';
import { useNotificationStore } from '../stores/notificationStore';
import { KhoContextType, InventoryStats } from './KhoContext';

export const useKhoValue = (): KhoContextType => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. User & Auth Store
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const loginAction = useUserStore((s) => s.login);
  const logoutAction = useUserStore((s) => s.logout);

  // 2. Campus Store
  const currentCampus = useCampusStore((s) => s.currentCampus);
  const setCampusAction = useCampusStore((s) => s.setCampus);

  // 3. Product Store
  const products = useProductStore((s) => s.products);
  const isProductLoading = useProductStore((s) => s.isLoading);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const addProductAction = useProductStore((s) => s.addProduct);
  const updateProductAction = useProductStore((s) => s.updateProduct);
  const deleteProductAction = useProductStore((s) => s.deleteProduct);

  // 4. Order Store
  const orders = useOrderStore((s) => s.orders);
  const isOrderLoading = useOrderStore((s) => s.isLoading);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const createOrderAction = useOrderStore((s) => s.createOrder);
  const verifyHandshakeOtpAction = useOrderStore((s) => s.verifyHandshakeOtp);
  const getBuyerOrders = useOrderStore((s) => s.getBuyerOrders);
  const getSellerOrders = useOrderStore((s) => s.getSellerOrders);

  // 5. Wallet Store
  const getWallet = useWalletStore((s) => s.getWallet);
  const depositAction = useWalletStore((s) => s.deposit);
  const withdrawAction = useWalletStore((s) => s.withdraw);
  const wallet = getWallet();

  // 6. Favorites Store
  const favoriteIds = useFavoriteStore((s) => s.favoriteIds);
  const isFavoriteAction = useFavoriteStore((s) => s.isFavorite);
  const toggleFavoriteAction = useFavoriteStore((s) => s.toggleFavorite);

  // 7. Chat & Notification Stores
  const conversations = useChatStore((s) => s.conversations);
  const notifications = useNotificationStore((s) => s.notifications);
  const markNotificationsAsReadAction = useNotificationStore((s) => s.markAllAsRead);

  // Tính toán role & quyền
  const isSeller = Boolean(user && (user.role === 'SELLER' || user.id === 'acc_seller'));
  const isBuyer = Boolean(user && user.role !== 'SELLER');
  const isKycVerified = Boolean(user?.isKycVerified || user?.kycStatus === 'APPROVED');

  // Seller ID hiện hành
  const currentSellerId = user?.id || 'acc_seller';
  const currentBuyerId = user?.id || 'acc_verified';

  // === Kho Hàng Của Tôi (Seller Listings) ===
  const myListings = useMemo(() => {
    return products.filter((p) => p.sellerId === currentSellerId);
  }, [products, currentSellerId]);

  // Thống kê kho hàng
  const inventoryStats: InventoryStats = useMemo(() => {
    let active = 0;
    let reserved = 0;
    let sold = 0;
    let hidden = 0;
    let totalViews = 0;
    let totalLikes = 0;
    let estimatedRevenue = 0;

    myListings.forEach((item) => {
      totalViews += item.viewsCount || 0;
      totalLikes += item.likesCount || 0;
      if (item.status === 'AVAILABLE') {
        active += 1;
        estimatedRevenue += item.price;
      } else if (item.status === 'RESERVED') {
        reserved += 1;
        estimatedRevenue += item.price;
      } else if (item.status === 'SOLD') {
        sold += 1;
      } else if (item.status === 'HIDDEN') {
        hidden += 1;
      }
    });

    return {
      total: myListings.length,
      active,
      reserved,
      sold,
      hidden,
      totalViews,
      totalLikes,
      estimatedRevenue,
    };
  }, [myListings]);

  // === Kho Hàng Toàn Sàn Theo Campus ===
  const campusProducts = useMemo(() => {
    if (!currentCampus) return products;
    const normCampus = currentCampus.toUpperCase();
    return products.filter(
      (p) => !p.campus || p.campus.toUpperCase().includes(normCampus) || normCampus.includes(p.campus.toUpperCase())
    );
  }, [products, currentCampus]);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const searchInKho = useCallback(
    (keyword: string, category?: string) => {
      const q = keyword.trim().toLowerCase();
      return products.filter((p) => {
        const matchTitle = !q || p.title.toLowerCase().includes(q);
        const matchCat = !category || category === 'all' || p.category === category;
        return matchTitle && matchCat;
      });
    },
    [products]
  );

  // Thao tác với Kho hàng
  const addProductToKho = useCallback(
    (prodData: Omit<ProductItem, 'id' | 'createdAt' | 'status' | 'viewsCount' | 'likesCount'>) => {
      return addProductAction(prodData);
    },
    [addProductAction]
  );

  const updateProductInKho = useCallback(
    (id: string, updates: Partial<ProductItem>) => {
      updateProductAction(id, updates);
    },
    [updateProductAction]
  );

  const removeProductFromKho = useCallback(
    (id: string) => {
      deleteProductAction(id);
    },
    [deleteProductAction]
  );

  const toggleProductStatus = useCallback(
    (id: string, status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN') => {
      const target = products.find((p) => p.id === id);
      if (!target) return;
      const nextStatus =
        status || (target.status === 'AVAILABLE' ? 'HIDDEN' : 'AVAILABLE');
      updateProductAction(id, { status: nextStatus });
    },
    [products, updateProductAction]
  );

  const refreshKhoHang = useCallback(async () => {
    await fetchProducts(currentCampus);
  }, [fetchProducts, currentCampus]);

  // === Kho Đơn Hàng ===
  const myBuyOrders = useMemo(() => {
    return getBuyerOrders(currentBuyerId);
  }, [orders, currentBuyerId, getBuyerOrders]);

  const mySellOrders = useMemo(() => {
    return getSellerOrders(currentSellerId);
  }, [orders, currentSellerId, getSellerOrders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.sellerId === currentSellerId || o.buyerId === currentBuyerId) &&
        (o.status === 'PENDING_SAFEPOINT' || o.status === 'ESCROW_PAID')
    ).length;
  }, [orders, currentSellerId, currentBuyerId]);

  const createOrderInKho = useCallback(
    (order: Omit<OrderItem, 'id' | 'createdAt' | 'isReviewed'>) => {
      return createOrderAction(order);
    },
    [createOrderAction]
  );

  const verifySafePointOtp = useCallback(
    (orderId: string, otp: string) => {
      return verifyHandshakeOtpAction(orderId, otp);
    },
    [verifyHandshakeOtpAction]
  );

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
  }, [fetchOrders]);

  // === Kho Ví Tiền ===
  const depositToWallet = useCallback(
    async (amount: number) => {
      return depositAction(amount);
    },
    [depositAction]
  );

  const withdrawFromWallet = useCallback(
    async (amount: number, bankInfo: { bankName: string; accountNo: string; accountName: string }) => {
      return withdrawAction(amount, bankInfo);
    },
    [withdrawAction]
  );

  const refreshWallet = useCallback(async () => {
    // Wallet triggers reactivity via Zustand state
  }, []);

  // === Kho Mục Yêu Thích ===
  const favoriteProducts = useMemo(() => {
    const favSet = new Set(favoriteIds);
    return products.filter((p) => favSet.has(p.id));
  }, [products, favoriteIds]);

  const isFavorite = useCallback(
    (productId: string) => {
      return isFavoriteAction(productId);
    },
    [isFavoriteAction]
  );

  const toggleFavorite = useCallback(
    (product: string | ProductItem) => {
      const prodId = typeof product === 'string' ? product : product.id;
      toggleFavoriteAction(prodId);
    },
    [toggleFavoriteAction]
  );

  // === Kho Tin Nhắn & Thông Báo ===
  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const markNotificationsAsRead = useCallback(() => {
    markNotificationsAsReadAction();
  }, [markNotificationsAsReadAction]);

  // === Làm mới TOÀN BỘ KHO DỮ LIỆU ===
  const refreshAllKho = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.allSettled([
        fetchProducts(currentCampus),
        fetchOrders(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProducts, fetchOrders, currentCampus]);

  return useMemo(
    () => ({
      // 1. Session Hub
      user,
      isAuthenticated,
      isSeller,
      isBuyer,
      isKycVerified,
      currentCampus,
      setCampus: setCampusAction,
      login: loginAction,
      logout: logoutAction,

      // 2. Kho hàng của tôi
      myListings,
      inventoryStats,
      addProductToKho,
      updateProductInKho,
      removeProductFromKho,
      toggleProductStatus,
      refreshKhoHang,

      // 3. Kho hàng toàn sàn
      allProducts: products,
      campusProducts,
      getProductById,
      searchInKho,

      // 4. Kho đơn hàng & Escrow
      myBuyOrders,
      mySellOrders,
      pendingOrdersCount,
      createOrderInKho,
      verifySafePointOtp,
      refreshOrders,

      // 5. Kho ví tiền
      wallet,
      availableBalance: wallet.availableBalance,
      escrowBalance: wallet.escrowBalance,
      coins: wallet.coins,
      walletTransactions: wallet.transactions,
      depositToWallet,
      withdrawFromWallet,
      refreshWallet,

      // 6. Kho yêu thích
      favoriteIds,
      favoriteProducts,
      isFavorite,
      toggleFavorite,

      // 7. Kho tin nhắn & thông báo
      unreadMessagesCount,
      unreadNotificationsCount,
      notifications,
      markNotificationsAsRead,

      // 8. Trạng thái Master Hub
      isLoading: isProductLoading || isOrderLoading,
      isRefreshing,
      refreshAllKho,
    }),
    [
      user,
      isAuthenticated,
      isSeller,
      isBuyer,
      isKycVerified,
      currentCampus,
      setCampusAction,
      loginAction,
      logoutAction,
      myListings,
      inventoryStats,
      addProductToKho,
      updateProductInKho,
      removeProductFromKho,
      toggleProductStatus,
      refreshKhoHang,
      products,
      campusProducts,
      getProductById,
      searchInKho,
      myBuyOrders,
      mySellOrders,
      pendingOrdersCount,
      createOrderInKho,
      verifySafePointOtp,
      refreshOrders,
      wallet,
      depositToWallet,
      withdrawFromWallet,
      refreshWallet,
      favoriteIds,
      favoriteProducts,
      isFavorite,
      toggleFavorite,
      unreadMessagesCount,
      unreadNotificationsCount,
      notifications,
      markNotificationsAsRead,
      isProductLoading,
      isOrderLoading,
      isRefreshing,
      refreshAllKho,
    ]
  );
};
