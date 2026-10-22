import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { useUserStore } from '../../../stores/userStore';
import { socketMobileService } from '../../../services/socketMobileService';
import { ReviewDetailModal } from '../../review/components/ReviewDetailModal';
import { resolveProductImage, DEFAULT_PRODUCT_FALLBACK } from '../../../lib/imageResolver';

const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ';

interface TabOption {
  key: string;
  label: string;
}

const OrderTabChip: React.FC<{
  tab: TabOption;
  isActive: boolean;
  onPress: (key: string) => void;
}> = React.memo(({ tab, isActive, onPress }) => {
  const handlePress = React.useCallback(() => onPress(tab.key), [onPress, tab.key]);
  return (
    <TouchableOpacity
      style={[styles.tabItem, isActive && styles.tabItemActive]}
      onPress={handlePress}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
});

const OrderCardItem: React.FC<{
  item: OrderItem;
  currentUserId: string;
  onPress: (item: OrderItem) => void;
  onDispute: (item: OrderItem) => void;
  onReview: (item: OrderItem) => void;
  onViewReview: (item: OrderItem) => void;
}> = React.memo(({ item, currentUserId, onPress, onDispute, onReview, onViewReview }) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [item.id, item.productImage]);

  const imageSource = imgError ? DEFAULT_PRODUCT_FALLBACK : resolveProductImage(item.productImage);
  const isSaleForCurrent = item.sellerId === currentUserId;
  const isBuyer = !isSaleForCurrent;
  const isCompleted = item.status === 'COMPLETED';
  const canBuyerDispute =
    isBuyer && (item.status === 'COMPLETED' || item.status === 'DELIVERED');
  const canBuyerReview = isBuyer && isCompleted && !item.isReviewed;

  const handlePress = React.useCallback(() => onPress(item), [item, onPress]);
  const handleDispute = React.useCallback(() => onDispute(item), [item, onDispute]);
  const handleReview = React.useCallback(() => onReview(item), [item, onReview]);
  const handleViewReview = React.useCallback(() => onViewReview(item), [item, onViewReview]);

  return (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.cardHeader}>
        <View style={styles.orderCodeRow}>
          <Ionicons name="receipt-outline" size={15} color="#64748B" />
          <Text style={styles.orderCode}>#{item.orderNumber || item.id}</Text>
          {isSaleForCurrent ? (
            <View style={styles.roleTagSeller}>
              <Text style={styles.roleTagTextSeller}>Đơn Bán</Text>
            </View>
          ) : (
            <View style={styles.roleTagBuyer}>
              <Text style={styles.roleTagTextBuyer}>Đơn Mua</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusBg || '#FFF7ED' }]}>
          <Text style={[styles.statusBadgeText, { color: item.statusColor || '#EA580C' }]}>
            {item.statusLabel}
          </Text>
        </View>
      </View>

      {/* Product Row */}
      <TouchableOpacity
        style={styles.cardBody}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <Image
          source={imageSource}
          style={styles.productThumb}
          contentFit="cover"
          transition={150}
          onError={() => setImgError(true)}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.productTitle}
          </Text>
          <Text style={styles.partnerText}>
            {isSaleForCurrent
              ? `Người mua: ${item.buyerName || 'Sinh viên FPT'}`
              : `Người bán: ${item.sellerName} (${item.sellerCampus || 'Hòa Lạc'})`}
          </Text>
          <View style={styles.safePointRow}>
            <Ionicons name="location-outline" size={12} color="#059669" />
            <Text style={styles.safePointText} numberOfLines={1}>
              {item.safePoint}
            </Text>
          </View>
          {!!item.timeSlot && (
            <View style={styles.timeSlotRow}>
              <Ionicons name="calendar-outline" size={12} color="#D97706" />
              <Text style={styles.timeSlotText} numberOfLines={1}>
                {item.timeSlot}
              </Text>
            </View>
          )}
          <Text style={styles.priceText}>{formatPrice(item.totalAmount || item.price)}</Text>
        </View>
      </TouchableOpacity>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{item.createdAt}</Text>

          {/* OTP Handshake CHỈ hiện cho Người mua trên đơn hẹn gặp trực tiếp MEETUP (không hiện cho người bán hoặc đơn GHN liên campus) */}
          {isBuyer && item.orderType !== 'SHIP_COD' && item.handshakeOtp && !isCompleted && (
            <View style={styles.otpBadge}>
              <Ionicons name="key-outline" size={12} color="#64748B" />
              <Text style={styles.otpBadgeText}>OTP: {item.handshakeOtp}</Text>
            </View>
          )}

          {canBuyerDispute && (
            <TouchableOpacity
              style={styles.disputeBtn}
              activeOpacity={0.8}
              onPress={handleDispute}
            >
              <Text style={styles.disputeBtnText}>
                {item.status === 'DELIVERED' ? 'Trả hàng' : 'Khiếu nại'}
              </Text>
            </TouchableOpacity>
          )}

          {item.status === 'DISPUTED' && (
            <TouchableOpacity
              style={styles.disputeActiveBadge}
              activeOpacity={0.8}
              onPress={handlePress}
            >
              <Ionicons name="warning" size={11} color="#DC2626" style={{ marginRight: 2 }} />
              <Text style={styles.disputeActiveBadgeText}>Đang khiếu nại</Text>
            </TouchableOpacity>
          )}

          {canBuyerReview && (
            <TouchableOpacity
              style={styles.reviewBtn}
              activeOpacity={0.8}
              onPress={handleReview}
            >
              <Ionicons name="star" size={12} color="#FFFFFF" style={{ marginRight: 2 }} />
              <Text style={styles.reviewBtnText}>Đánh giá</Text>
            </TouchableOpacity>
          )}

          {isBuyer && item.isReviewed && (
            <TouchableOpacity
              style={styles.reviewedBadge}
              activeOpacity={0.8}
              onPress={handleViewReview}
            >
              <Ionicons name="star" size={11} color="#059669" style={{ marginRight: 2 }} />
              <Text style={styles.reviewedBadgeText}>Đã đánh giá</Text>
              <Ionicons name="chevron-forward" size={10} color="#059669" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailBtn}
            onPress={handlePress}
          >
            <Text style={styles.detailBtnText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const OrderListEmptyState: React.FC<{ activeTab: string; onExplore: () => void }> = React.memo(
  ({ activeTab, onExplore }) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="receipt-outline" size={44} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
      <Text style={styles.emptySub}>
        {activeTab === 'all'
          ? 'Bạn chưa phát sinh đơn giao dịch nào trong phiên đăng nhập này.'
          : 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.'}
      </Text>
      <TouchableOpacity style={styles.exploreBtn} onPress={onExplore}>
        <Text style={styles.exploreBtnText}>Khám phá Chợ Campus ngay</Text>
      </TouchableOpacity>
    </View>
  )
);

const filterOrders = (
  orders: OrderItem[],
  currentUserId: string,
  isSeller: boolean,
  activeTab: string
): OrderItem[] => {
  return orders.filter((o) => {
    const isMySale = o.sellerId === currentUserId;
    const isMyBuy = o.buyerId === currentUserId;
    const matchesUser = isSeller ? (isMySale || isMyBuy) : isMyBuy;
    if (!matchesUser) return false;

    switch (activeTab) {
      case 'my_sales':
        return isMySale;
      case 'my_buys':
        return isMyBuy;
      case 'escrow':
        return o.status === 'ESCROW_PAID' || o.status === 'PENDING_SAFEPOINT';
      case 'completed':
        return o.status === 'COMPLETED';
      case 'disputed':
        return o.status === 'DISPUTED';
      default:
        return true;
    }
  });
};

export const OrderListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUserStore();
  const { orders, fetchOrders } = useOrderStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders().catch(() => {});

    const unsubPaid = socketMobileService.onOrderPaid(() => fetchOrders().catch(() => {}));
    const unsubNew = socketMobileService.onNewOrderReceived(() => fetchOrders().catch(() => {}));
    const unsubComp = socketMobileService.onOrderCompleted(() => fetchOrders().catch(() => {}));
    const unsubShip = socketMobileService.onOrderShippingUpdated(() => fetchOrders().catch(() => {}));
    const unsubCancel = socketMobileService.onOrderCancelled(() => fetchOrders().catch(() => {}));

    return () => {
      unsubPaid();
      unsubNew();
      unsubComp();
      unsubShip();
      unsubCancel();
    };
  }, [fetchOrders]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrders().catch(() => {});
    setRefreshing(false);
  }, [fetchOrders]);

  const isSeller = user?.role === 'SELLER';
  const currentUserId = user?.id || '';
  const [activeTab, setActiveTab] = useState<string>(route.params?.initialTab || 'all');

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const tabs: TabOption[] = React.useMemo(() => {
    if (isSeller) {
      return [
        { key: 'all', label: 'Tất cả' },
        { key: 'my_sales', label: 'Đơn Bán Của Tôi' },
        { key: 'my_buys', label: 'Đơn Mua Của Tôi' },
        { key: 'escrow', label: 'Chờ Bàn Giao' },
        { key: 'completed', label: 'Đã Hoàn Tất' },
        { key: 'disputed', label: 'Khiếu Nại' },
      ];
    }
    return [
      { key: 'all', label: 'Tất cả' },
      { key: 'escrow', label: 'Chờ Bàn Giao' },
      { key: 'completed', label: 'Đã Hoàn Tất' },
      { key: 'disputed', label: 'Khiếu Nại' },
    ];
  }, [isSeller]);

  const filteredOrders = React.useMemo(
    () => filterOrders(orders, currentUserId, isSeller, activeTab),
    [orders, currentUserId, isSeller, activeTab]
  );

  const handleNavigateDetail = React.useCallback((item: OrderItem) => {
    navigation.navigate('OrderDetail', {
      orderId: item.orderNumber || item.id,
      product: {
        id: item.productId,
        title: item.productTitle,
        price: item.price,
        priceStr: formatPrice(item.price),
        image: item.productImage,
        sellerName: item.sellerName,
        sellerMajor: item.sellerCohort,
        sellerCampus: item.sellerCampus,
      },
      status: item.status === 'COMPLETED' ? 'completed' : 'escrow_holding',
      safePoint: item.safePoint,
      isReviewed: item.isReviewed,
      totalAmount: item.totalAmount,
    });
  }, [navigation]);

  const handleDispute = React.useCallback((item: OrderItem) => {
    navigation.navigate('Dispute', {
      orderId: item.orderNumber || item.id,
      productTitle: item.productTitle,
      sellerName: item.sellerName,
      price: formatPrice(item.totalAmount || item.price),
      isCod: false,
    });
  }, [navigation]);

  const handleReview = React.useCallback((item: OrderItem) => {
    navigation.navigate('Review', {
      orderId: item.orderNumber || item.id,
      productTitle: item.productTitle,
      sellerName: item.sellerName,
      productImage: item.productImage,
      sellerCampus: item.sellerCampus,
      sellerCohort: item.sellerCohort,
    });
  }, [navigation]);

  const handleGoHome = React.useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const [selectedReviewOrder, setSelectedReviewOrder] = useState<OrderItem | null>(null);

  const handleViewReview = React.useCallback((item: OrderItem) => {
    setSelectedReviewOrder(item);
  }, []);

  const handleEditReviewFromModal = React.useCallback(
    (order: OrderItem) => {
      navigation.navigate('Review', {
        orderId: order.orderNumber || order.id,
        productTitle: order.productTitle,
        sellerName: order.sellerName,
        productImage: order.productImage,
        sellerCampus: order.sellerCampus,
        sellerCohort: order.sellerCohort,
        isEditing: true,
        initialReviewData: order.reviewData,
      });
    },
    [navigation]
  );

  const renderOrderItem = React.useCallback(
    ({ item }: { item: OrderItem }) => (
      <OrderCardItem
        item={item}
        currentUserId={currentUserId}
        onPress={handleNavigateDetail}
        onDispute={handleDispute}
        onReview={handleReview}
        onViewReview={handleViewReview}
      />
    ),
    [currentUserId, handleNavigateDetail, handleDispute, handleReview, handleViewReview]
  );

  const keyExtractor = React.useCallback(
    (item: OrderItem) => item.id || item.orderNumber || '',
    []
  );

  const renderTabItem = React.useCallback(
    ({ item }: { item: TabOption }) => (
      <OrderTabChip
        tab={item}
        isActive={activeTab === item.key}
        onPress={setActiveTab}
      />
    ),
    [activeTab]
  );

  const tabKeyExtractor = React.useCallback((item: TabOption) => item.key, []);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation && navigation.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Home' });
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {isSeller ? 'Quản Lý Đơn Hàng (Bán & Mua)' : 'Đơn Hàng Của Tôi'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
          data={tabs}
          keyExtractor={tabKeyExtractor}
          renderItem={renderTabItem}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={keyExtractor}
        renderItem={renderOrderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
        ListEmptyComponent={
          <OrderListEmptyState activeTab={activeTab} onExplore={handleGoHome} />
        }
      />

      <ReviewDetailModal
        visible={!!selectedReviewOrder}
        order={selectedReviewOrder}
        isSeller={selectedReviewOrder ? selectedReviewOrder.sellerId === currentUserId : false}
        onClose={() => setSelectedReviewOrder(null)}
        onEditReview={handleEditReviewFromModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  topBarTitle: { fontSize: 16.5, fontWeight: '800', color: '#0F172A' },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabItemActive: {
    backgroundColor: '#FFEDD5',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orderCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderCode: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
  },
  roleTagSeller: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagTextSeller: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4338CA',
  },
  roleTagBuyer: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagTextBuyer: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  productThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  partnerText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  safePointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  safePointText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    flexShrink: 1,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  timeSlotText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
    flexShrink: 1,
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  otpBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  disputeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  disputeBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reviewBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  reviewedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  disputeActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  disputeActiveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  detailBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default OrderListScreen;
