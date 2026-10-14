import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore } from '../../../stores/orderStore';
import { orderMobileService } from '../../../services/orderMobileService';
import { socketMobileService } from '../../../services/socketMobileService';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { OrderSafePointQrCard } from '../components/OrderSafePointQrCard';
import { OrderActionButtons } from '../components/OrderActionButtons';
import { OrderProductSummaryCard } from '../components/OrderProductSummaryCard';
import { OrderInterCampusBanner } from '../components/OrderInterCampusBanner';
import { PackageProofRow } from '../components/PackageProofRow';
import { OrderDetailModals } from '../components/OrderDetailModals';
import { ReviewDetailModal } from '../../review/components/ReviewDetailModal';

const HIT_SLOP_8 = { top: 8, bottom: 8, left: 8, right: 8 } as const;
const HIT_SLOP_10 = { top: 10, bottom: 10, left: 10, right: 10 } as const;

export const OrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUserStore();
  const { orders, updateOrderStatus } = useOrderStore();

  const [showProofModal, setShowProofModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWithdrawDisputeModal, setShowWithdrawDisputeModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showReviewDetailModal, setShowReviewDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const orderId = route.params?.orderId || '';
  const matchedOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  const product = useMemo(() => {
    return (
      route.params?.product || {
        id: matchedOrder?.productId || '',
        title: matchedOrder?.productTitle || 'Sản phẩm giao dịch',
        price: matchedOrder?.price || 0,
        priceStr: matchedOrder?.price ? matchedOrder.price.toLocaleString('vi-VN') + 'đ' : '0đ',
        image: matchedOrder?.productImage,
        sellerName: matchedOrder?.sellerName || 'Người bán FPT',
        sellerCohort: matchedOrder?.sellerCohort || '',
        sellerCampus: matchedOrder?.sellerCampus || 'Campus FPT',
      }
    );
  }, [route.params?.product, matchedOrder]);

  const initialStatus =
    matchedOrder?.status === 'COMPLETED'
      ? 'completed'
      : matchedOrder?.status === 'DELIVERED'
      ? 'delivered'
      : matchedOrder?.status === 'CANCELLED'
      ? 'cancelled'
      : matchedOrder?.status === 'DISPUTED'
      ? 'disputed'
      : route.params?.status || 'escrow_holding';

  const [orderStatus, setOrderStatus] = useState<string>(initialStatus);
  const [isReviewed, setIsReviewed] = useState<boolean>(matchedOrder?.isReviewed ?? (route.params?.isReviewed || false));

  useEffect(() => {
    let isMounted = true;
    if (orderId) {
      orderMobileService
        .getOrderDetail(orderId)
        .then((order) => {
          if (!isMounted || !order) return;
          if (order.status === 'COMPLETED') setOrderStatus('completed');
          else if (order.status === 'DELIVERED') setOrderStatus('delivered');
          else if (order.status === 'CANCELLED') setOrderStatus('cancelled');
          else if (order.status === 'DISPUTED') setOrderStatus('disputed');
          else setOrderStatus('escrow_holding');
          if (order.isReviewed) setIsReviewed(true);
        })
        .catch(() => {});
    }

    const unsubPaid = socketMobileService.onOrderPaid((d) => {
      if (d.orderId === orderId || d.orderCode === orderId) {
        setOrderStatus('escrow_holding');
        updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Đã thanh toán Escrow', '#EA580C', '#FFF7ED');
      }
    });

    const unsubComp = socketMobileService.onOrderCompleted((d) => {
      if (d.orderId === orderId || d.orderCode === orderId) {
        setOrderStatus('completed');
        updateOrderStatus(orderId, 'COMPLETED', '✅ Giao dịch hoàn tất', '#059669', '#DCFCE7');
      }
    });

    const unsubCancel = socketMobileService.onOrderCancelled((d) => {
      if (d.orderId === orderId || d.orderCode === orderId) {
        setOrderStatus('cancelled');
        updateOrderStatus(orderId, 'CANCELLED', '❌ Đơn hàng đã bị hủy', '#DC2626', '#FEF2F2');
      }
    });

    return () => {
      isMounted = false;
      unsubPaid();
      unsubComp();
      unsubCancel();
    };
  }, [orderId, updateOrderStatus]);

  const safePoint = matchedOrder?.safePoint || route.params?.safePoint || 'Sảnh Tòa Alpha (Trạm Camera 24/7)';
  const isSeller = user?.role === 'SELLER' || (matchedOrder && user?.id === matchedOrder?.sellerId);
  const isInterCampus = Boolean(
    (matchedOrder?.sellerCampus && user?.campus && matchedOrder.sellerCampus !== user.campus) ||
    matchedOrder?.orderType === 'SHIP_COD'
  );

  const handleConfirmReceived = useCallback(() => {
    Alert.alert(
      'Xác nhận đã nhận hàng',
      'Bạn đã kiểm tra hàng tại Safe-Point và đồng ý giải ngân tiền cho người bán?',
      [
        { text: 'Kiểm tra thêm', style: 'cancel' },
        {
          text: 'Xác nhận & Giải ngân',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await orderMobileService.confirmDelivery(orderId);
              updateOrderStatus(orderId, 'COMPLETED', '✅ Giao dịch hoàn tất & Giải ngân Escrow', '#059669', '#DCFCE7');
              setOrderStatus('completed');
              Alert.alert(
                '🎉 Giao dịch hoàn tất!',
                'Hệ thống đã giải ngân tiền cọc Escrow cho người bán. Bạn có muốn đánh giá trải nghiệm để cộng điểm uy tín Campus không?',
                [
                  { text: 'Để sau', style: 'cancel' },
                  {
                    text: 'Đánh giá ngay',
                    onPress: () =>
                      navigation.navigate('Review', {
                        orderId,
                        productTitle: product.title,
                        sellerName: product.sellerName,
                        productImage: product.image,
                        sellerCampus: product.sellerCampus,
                        sellerCohort: product.sellerCohort,
                      }),
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert('Thông báo', err?.response?.data?.message || err?.message || 'Đã ghi nhận nhận hàng.');
              updateOrderStatus(orderId, 'COMPLETED', '✅ Giao dịch hoàn tất & Giải ngân Escrow', '#059669', '#DCFCE7');
              setOrderStatus('completed');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [orderId, updateOrderStatus, navigation, product]);

  const handleCancelSuccess = useCallback((reason: string) => {
    updateOrderStatus(orderId, 'CANCELLED', '❌ Đơn hàng đã hủy', '#64748B', '#F1F5F9');
    setOrderStatus('cancelled');
    Alert.alert(
      '🎉 Đã hủy đơn hàng an toàn',
      `Lý do: ${reason}\nTiền cọc Escrow và FPT Xu (nếu có) đã được hoàn lại đầy đủ về ví của bạn.`
    );
  }, [orderId, updateOrderStatus]);

  const handleWithdrawDisputeSuccess = useCallback(() => {
    updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Đang giữ tiền Escrow - Tiếp tục giao dịch', '#2563EB', '#EFF6FF');
    setOrderStatus('escrow_holding');
  }, [orderId, updateOrderStatus]);

  const handleOpenChat = useCallback(() => {
    const activeProductId = matchedOrder?.productId || product.id;
    navigation.navigate('ChatDetail', {
      partner: {
        id: matchedOrder?.sellerId || 'u-partner',
        name: product.sellerName || 'Người bán',
        cohort: product.sellerCohort || 'Sinh viên FPT',
        isOnline: true,
      },
      product: {
        id: activeProductId,
        title: product.title,
        price: product.priceStr || '1.450.000đ',
        image: product.image,
      },
    });
  }, [navigation, product, matchedOrder]);

  const handleOpenDispute = useCallback(() => {
    navigation.navigate('Dispute', {
      orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      price: product.priceStr || '1.450.000đ',
      isCod: false,
    });
  }, [navigation, orderId, product]);

  const handleOpenReview = useCallback(() => {
    navigation.navigate('Review', {
      orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      productImage: product.image,
      sellerCampus: product.sellerCampus,
      sellerCohort: product.sellerCohort,
    });
  }, [navigation, orderId, product]);

  const handleNavigateInterCampus = useCallback(() => {
    navigation.navigate('InterCampusTransaction', {
      orderId,
      product,
      fromCampus: product.sellerCampus || 'Hòa Lạc',
      toCampus: user?.campus || 'TP. Hồ Chí Minh',
    });
  }, [navigation, orderId, product, user?.campus]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const handleEditReviewFromModal = useCallback(
    (targetOrder: any) => {
      navigation.navigate('Review', {
        orderId: targetOrder.orderNumber || targetOrder.id || orderId,
        productTitle: targetOrder.productTitle || product.title,
        sellerName: targetOrder.sellerName || product.sellerName,
        productImage: targetOrder.productImage || product.image,
        sellerCampus: targetOrder.sellerCampus || product.sellerCampus,
        sellerCohort: targetOrder.sellerCohort || product.sellerCohort,
        isEditing: true,
        initialReviewData: targetOrder.reviewData,
      });
    },
    [navigation, orderId, product]
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={HIT_SLOP_10}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.headerOrderId}>{orderId}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleGoHome} hitSlop={HIT_SLOP_8}>
            <Ionicons name="home-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenChat} hitSlop={HIT_SLOP_8}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#EA580C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        <OrderStatusTimeline orderStatus={orderStatus} />
        <OrderProductSummaryCard product={product} />

        {/* Chỉ hiện banner liên campus khi 2 campus khác nhau */}
        {matchedOrder?.sellerCampus && user?.campus && matchedOrder.sellerCampus !== user.campus && (
          <OrderInterCampusBanner onPress={handleNavigateInterCampus} />
        )}

        {/* Chỉ hiện mã QR đồng kiểm khi đơn MEETUP (cùng campus hẹn gặp) đang trong quá trình bàn giao/chờ nhận */}
        {orderStatus !== 'completed' && orderStatus !== 'cancelled' && !isInterCampus && (
          <>
            <Text style={styles.sectionHeader}>ĐIỂM HẸN & MÃ QR ĐỒNG KIỂM</Text>
            <OrderSafePointQrCard safePoint={safePoint} orderId={orderId} />
          </>
        )}

        <OrderActionButtons
          orderStatus={orderStatus}
          isSeller={Boolean(isSeller)}
          isInterCampus={isInterCampus}
          isReviewed={isReviewed}
          isSubmitting={isSubmitting}
          onConfirmReceived={handleConfirmReceived}
          onOpenScanner={() => setShowScannerModal(true)}
          onOpenReview={handleOpenReview}
          onOpenReviewDetail={() => setShowReviewDetailModal(true)}
          onOpenChat={handleOpenChat}
          onOpenDispute={handleOpenDispute}
          onCancelOrder={() => setShowCancelModal(true)}
          onWithdrawDispute={() => setShowWithdrawDisputeModal(true)}
        />
      </ScrollView>

      <OrderDetailModals
        orderId={orderId}
        matchedOrder={matchedOrder}
        product={product}
        safePoint={safePoint}
        isSeller={Boolean(isSeller)}
        showScannerModal={showScannerModal}
        showProofModal={showProofModal}
        showCancelModal={showCancelModal}
        showWithdrawDisputeModal={showWithdrawDisputeModal}
        onCloseScanner={() => setShowScannerModal(false)}
        onCloseProof={() => setShowProofModal(false)}
        onCloseCancel={() => setShowCancelModal(false)}
        onCloseWithdrawDispute={() => setShowWithdrawDisputeModal(false)}
        onScannerSuccess={() => setOrderStatus('completed')}
        onCancelSuccess={handleCancelSuccess}
        onWithdrawDisputeSuccess={handleWithdrawDisputeSuccess}
        onReportDispute={handleOpenDispute}
      />

      <ReviewDetailModal
        visible={showReviewDetailModal}
        order={matchedOrder || ({
          id: orderId,
          orderNumber: orderId,
          productTitle: product.title,
          sellerName: product.sellerName,
          sellerCampus: product.sellerCampus,
          productImage: product.image,
          safePoint: safePoint,
          isReviewed: true,
          status: 'COMPLETED',
        } as any)}
        onClose={() => setShowReviewDetailModal(false)}
        onEditReview={handleEditReviewFromModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerOrderId: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});

export default OrderDetailScreen;
