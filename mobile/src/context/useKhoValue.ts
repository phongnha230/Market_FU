import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import { useCampusStore } from '../stores/useCampusStore';
import { useProductStore, ProductItem } from '../stores/productStore';
import { useOrderStore, OrderItem } from '../stores/orderStore';
import { useWalletStore } from '../stores/walletStore';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { useChatStore } from '../stores/chatStore';
import { useNotificationStore } from '../stores/notificationStore';
import { socketMobileService } from '../services/socketMobileService';
import { notificationMobileService } from '../services/notificationMobileService';
import { productMobileService } from '../services/productMobileService';
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
  const walletsByUser = useWalletStore((s) => s.walletsByUser);
  const activeUserId = useWalletStore((s) => s.activeUserId);
  const depositAction = useWalletStore((s) => s.deposit);
  const withdrawAction = useWalletStore((s) => s.withdraw);
  const fetchWalletBalancesAction = useWalletStore((s) => s.fetchWalletBalances);

  const currentWalletId = user?.id || activeUserId || 'anonymous';
  const rawWallet = walletsByUser[currentWalletId] || {
    availableBalance: 0,
    escrowBalance: 0,
    coins: 0,
    transactions: [],
  };

  // ID hiện hành
  const currentSellerId = user?.id || '';
  const currentBuyerId = user?.id || '';

  // Doanh thu từ các đơn hàng bán đã COMPLETED (đồng bộ tức thì khi bán thành công)
  const completedSellRevenue = useMemo(() => {
    return orders
      .filter((o) => (o.sellerId === currentSellerId || (user?.id && o.sellerId === user.id)) && o.status === 'COMPLETED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders, currentSellerId, user?.id]);

  const effectiveAvailableBalance = Math.max(rawWallet.availableBalance, completedSellRevenue);
  const wallet = useMemo(() => ({
    ...rawWallet,
    availableBalance: effectiveAvailableBalance,
  }), [rawWallet, effectiveAvailableBalance]);

  // 6. Favorites Store
  const favoriteIds = useFavoriteStore((s) => s.favoriteIds);
  const isFavoriteAction = useFavoriteStore((s) => s.isFavorite);
  const toggleFavoriteAction = useFavoriteStore((s) => s.toggleFavorite);

  // 7. Chat & Notification Stores
  const conversations = useChatStore((s) => s.conversations);
  const notifications = useNotificationStore((s) => s.notifications);
  const markNotificationsAsReadAction = useNotificationStore((s) => s.markAllAsRead);

  // Tính toán role & quyền
  const isSeller = Boolean(user && user.role === 'SELLER');
  const isBuyer = Boolean(user && user.role !== 'SELLER');
  const isKycVerified = Boolean(user?.isKycVerified || user?.kycStatus === 'APPROVED');

  // === Kho Hàng Của Tôi (Seller Listings từ Backend API /products/me) ===
  const [sellerProducts, setSellerProducts] = useState<ProductItem[]>([]);

  const fetchMySellerProducts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const items = await productMobileService.getMyProducts();
      if (Array.isArray(items)) {
        setSellerProducts(items);
      }
    } catch (e: any) {
      console.log('⚠️ [Backend /products/me offline]:', e?.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSellerProducts([]);
      return;
    }

    // Tối ưu hóa bộ nhớ: Triệt tiêu việc tải dồn dập 5-6 API cùng lúc khi vừa mở app.
    // Các màn hình (Đơn hàng, Chat, Thông báo, Ví tiền) sẽ tự lazy-fetch theo nhu cầu (On-Demand)
    // khi người dùng thực sự điều hướng tới màn hình đó.

    // Kiểm tra và hiển thị Form Xin đồng ý nhận thông báo nếu người dùng mới vào app lần đầu
    let consentTimer: any = null;
    const { hasPromptedPermission, setPermissionModalVisible } = useNotificationStore.getState();
    if (!hasPromptedPermission) {
      consentTimer = setTimeout(() => {
        setPermissionModalVisible(true);
      }, 1500);
    }

    // Kết nối Socket và đăng ký sự kiện realtime toàn hệ thống (Push token & listener đã khởi tạo ở App/userStore)
    socketMobileService.getSocket();

    const unsubNotif = socketMobileService.onNotification((n) => {
      const dest = notificationMobileService.resolveNotificationDestination({
        type: n.type,
        orderId: (n as any).orderId,
        orderCode: (n as any).orderCode,
        productId: (n as any).productId,
        targetUrl: n.targetUrl,
        body: n.body,
        title: n.title,
      });

      if (dest.targetScreen === 'OrderDetail') {
        fetchOrders().catch(() => {});
        fetchMySellerProducts().catch(() => {});
      } else if (dest.targetScreen === 'ManageListings' || dest.targetScreen === 'ProductDetail') {
        fetchMySellerProducts().catch(() => {});
        fetchProducts(currentCampus).catch(() => {});
      }

      useNotificationStore.getState().addNotification({
        title: n.title,
        body: n.body,
        category: (n.type?.toLowerCase() as any) || (dest.targetScreen === 'OrderDetail' ? 'order' : 'system'),
        icon: 'notifications',
        iconColor: '#EA580C',
        iconBg: '#FFF7ED',
        targetScreen: dest.targetScreen,
        targetParams: dest.targetParams,
      });

      notificationMobileService.displayLocalPushNotification({
        title: n.title,
        body: n.body,
        data: {
          targetUrl: n.targetUrl,
          type: n.type,
          orderId: dest.targetParams?.orderId,
          productId: dest.targetParams?.productId,
          targetScreen: dest.targetScreen,
          targetParams: dest.targetParams,
          body: n.body,
          title: n.title,
        },
      });
    });

    const unsubOrderConfirmed = socketMobileService.onOrderConfirmed(() => {
      fetchOrders().catch(() => {});
    });

    const unsubOrderPaid = socketMobileService.onOrderPaid((d: any) => {
      fetchOrders().catch(() => {});
      const title = '🛡️ Escrow đã được cọc an toàn';
      const body = `Đơn hàng #${d?.orderCode || d?.orderId || ''} đã thanh toán ký quỹ Escrow thành công!`;
      useNotificationStore.getState().addNotification({
        title,
        body,
        category: 'order',
        icon: 'shield-checkmark',
        iconColor: '#059669',
        iconBg: '#ECFDF5',
        targetScreen: 'OrderDetail',
        targetParams: { orderId: d?.orderId || d?.orderCode },
      });
      notificationMobileService.displayLocalPushNotification({
        title,
        body,
        data: { orderId: d?.orderId || d?.orderCode, type: 'ORDER' },
      });
    });

    const unsubNewOrder = socketMobileService.onNewOrderReceived((d: any) => {
      fetchOrders().catch(() => {});
      fetchMySellerProducts().catch(() => {});
      fetchProducts(currentCampus).catch(() => {});
      const title = '📦 Bạn có đơn hàng mới!';
      const body = `Sinh viên vừa đặt mua sản phẩm của bạn (Đơn #${d?.orderCode || d?.orderId || ''}).`;
      useNotificationStore.getState().addNotification({
        title,
        body,
        category: 'order',
        icon: 'cube',
        iconColor: '#2563EB',
        iconBg: '#EFF6FF',
        targetScreen: 'OrderDetail',
        targetParams: { orderId: d?.orderId || d?.orderCode },
      });
      notificationMobileService.displayLocalPushNotification({
        title,
        body,
        data: { orderId: d?.orderId || d?.orderCode, type: 'ORDER' },
      });
    });

    const unsubOrderComp = socketMobileService.onOrderCompleted((d: any) => {
      fetchOrders().catch(() => {});
      fetchMySellerProducts().catch(() => {});
      fetchProducts(currentCampus).catch(() => {});
      const title = '🎉 Giao dịch hoàn tất thành công!';
      const body = `Đơn hàng #${d?.orderCode || d?.orderId || ''} đã hoàn tất. Tiền Escrow đã được giải ngân về ví!`;
      useNotificationStore.getState().addNotification({
        title,
        body,
        category: 'order',
        icon: 'checkmark-circle',
        iconColor: '#059669',
        iconBg: '#ECFDF5',
        targetScreen: 'OrderDetail',
        targetParams: { orderId: d?.orderId || d?.orderCode },
      });
      notificationMobileService.displayLocalPushNotification({
        title,
        body,
        data: { orderId: d?.orderId || d?.orderCode, type: 'ORDER' },
      });
    });

    const unsubOrderShip = socketMobileService.onOrderShippingUpdated((d: any) => {
      fetchOrders().catch(() => {});
      const title = '🚚 Cập nhật vận chuyển đơn hàng';
      const body = `Đơn hàng #${d?.orderCode || d?.orderId || ''} có trạng thái vận chuyển mới.`;
      useNotificationStore.getState().addNotification({
        title,
        body,
        category: 'order',
        icon: 'bicycle',
        iconColor: '#EA580C',
        iconBg: '#FFF7ED',
        targetScreen: 'OrderDetail',
        targetParams: { orderId: d?.orderId || d?.orderCode },
      });
      notificationMobileService.displayLocalPushNotification({
        title,
        body,
        data: { orderId: d?.orderId || d?.orderCode, type: 'ORDER' },
      });
    });

    const unsubOrderCancel = socketMobileService.onOrderCancelled((d: any) => {
      fetchOrders().catch(() => {});
      fetchMySellerProducts().catch(() => {});
      fetchProducts(currentCampus).catch(() => {});
      const title = '❌ Đơn hàng đã bị hủy';
      const body = `Đơn hàng #${d?.orderCode || d?.orderId || ''} đã bị hủy bỏ.`;
      useNotificationStore.getState().addNotification({
        title,
        body,
        category: 'order',
        icon: 'close-circle',
        iconColor: '#DC2626',
        iconBg: '#FEF2F2',
        targetScreen: 'OrderDetail',
        targetParams: { orderId: d?.orderId || d?.orderCode },
      });
      notificationMobileService.displayLocalPushNotification({
        title,
        body,
        data: { orderId: d?.orderId || d?.orderCode, type: 'ORDER' },
      });
    });

    const unsubNewMsg = socketMobileService.onNewMessageNotification((d: any) => {
      useChatStore.getState().fetchConversations().catch(() => {});
      const activeConvId = useChatStore.getState().activeConversationId;
      // Nếu người dùng đang mở đúng phòng chat này -> Không hiện banner đè lên màn hình
      if (d?.conversationId && activeConvId && activeConvId === d.conversationId) {
        return;
      }
      const senderName = (d?.senderName || '').replace(/^💬\s*/, '').trim();
      const title = senderName ? `💬 ${senderName}` : '💬 Tin nhắn mới';
      const body = d?.text || 'Bạn có tin nhắn mới từ người mua/bán.';
      const avatarUrl = d?.senderAvatar || d?.avatarUrl || undefined;
      useNotificationStore.getState().addNotification({
        title,
        body,
        category: 'chat',
        icon: 'chatbubbles',
        iconColor: '#EA580C',
        iconBg: '#FFF7ED',
        avatarUrl,
        targetScreen: 'ChatDetail',
        targetParams: {
          conversationId: d?.conversationId,
          productId: d?.productId,
          partner: {
            id: d?.senderId || d?.conversationId,
            name: senderName || 'Sinh viên FPT',
            avatar: avatarUrl,
          },
        },
      });
      notificationMobileService.displayLocalPushNotification({
        title,
        body,
        channelId: notificationMobileService.NOTIFICATION_CHANNELS.CHAT,
        data: {
          conversationId: d?.conversationId,
          productId: d?.productId,
          senderId: d?.senderId,
          type: 'CHAT',
          senderName: senderName || d?.senderName,
          senderAvatar: avatarUrl,
        },
      });
    });

    const unsubKyc = socketMobileService.onKycStatusUpdated((d) => {
      if (d.status) {
        useUserStore.getState().updateUser({
          kycStatus: d.status,
          isKycVerified: d.status === 'APPROVED',
          role: d.status === 'APPROVED' && d.type === 'SELLER' ? 'SELLER' : undefined,
        });
        const title = d.status === 'APPROVED' ? '⭐ Hồ sơ sinh viên đã được phê duyệt!' : '⚠️ Hồ sơ KYC bị từ chối';
        const body = d.status === 'APPROVED'
          ? 'Tài khoản của bạn đã được xác minh chính chủ sinh viên FPT và mở khóa toàn bộ tính năng.'
          : (d.reason || 'Vui lòng kiểm tra lại hình chụp thẻ sinh viên.');
        useNotificationStore.getState().addNotification({
          title,
          body,
          category: 'system',
          icon: 'school',
          iconColor: d.status === 'APPROVED' ? '#059669' : '#DC2626',
          iconBg: d.status === 'APPROVED' ? '#ECFDF5' : '#FEF2F2',
          targetScreen: 'AccountSettings',
        });
        notificationMobileService.displayLocalPushNotification({
          title,
          body,
          data: { type: 'KYC' },
        });
      }
    });

    const unsubCoins = socketMobileService.onCoinsUpdated((d) => {
      if (typeof d.coins === 'number') {
        useUserStore.getState().updateUser({ coins: d.coins });
        useWalletStore.getState().addCoins(0);
      }
    });

    const unsubWithdrawal = socketMobileService.onWithdrawalUpdated(() => {
      // Re-sync wallet / orders
      fetchOrders().catch(() => {});
    });

    return () => {
      if (consentTimer) clearTimeout(consentTimer);
      unsubNotif();
      unsubOrderConfirmed();
      unsubOrderPaid();
      unsubNewOrder();
      unsubOrderComp();
      unsubOrderShip();
      unsubOrderCancel();
      unsubNewMsg();
      unsubKyc();
      unsubCoins();
      unsubWithdrawal();
    };
  }, [isAuthenticated, user?.id, fetchMySellerProducts, fetchOrders]);

  const myListings = useMemo(() => {
    if (sellerProducts.length > 0) {
      return sellerProducts;
    }
    return products.filter((p) => p.sellerId === currentSellerId);
  }, [sellerProducts, products, currentSellerId]);

  // Thống kê kho hàng
  const inventoryStats: InventoryStats = useMemo(() => {
    let active = 0;
    let pending = 0;
    let rejected = 0;
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
      } else if (item.status === 'PENDING_APPROVAL') {
        pending += 1;
      } else if (item.status === 'REJECTED' || item.status === 'LOCKED') {
        rejected += 1;
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
      pending,
      rejected,
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
    await Promise.allSettled([
      fetchProducts(currentCampus),
      fetchMySellerProducts(),
    ]);
  }, [fetchProducts, fetchMySellerProducts, currentCampus]);

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
    await fetchWalletBalancesAction();
  }, [fetchWalletBalancesAction]);

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
      toggleFavoriteAction(prodId, typeof product === 'object' ? product : undefined);
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
        fetchMySellerProducts(),
        fetchOrders(),
        fetchWalletBalancesAction(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProducts, fetchMySellerProducts, fetchOrders, fetchWalletBalancesAction, currentCampus]);

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
      coins: Math.max(wallet.coins, user?.coins ?? 0),
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
