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
import * as WebBrowser from 'expo-web-browser';
import { Image } from 'expo-image';
import { getSafeAvatar } from '../../../lib/imageResolver';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { orderMobileService } from '../../../services/orderMobileService';
import paymentMobileService from '../../../services/paymentMobileService';
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
  const [fetchedOrder, setFetchedOrder] = useState<OrderItem | null>(null);
  const activeOrder = fetchedOrder || matchedOrder;
  const [payosCheckoutUrl, setPayosCheckoutUrl] = useState(matchedOrder?.paymentCheckoutUrl);
  const [sellerId, setSellerId] = useState(matchedOrder?.sellerId);

  const product = useMemo(() => {
    const rawProd = route.params?.product;
    const fallbackTitle = activeOrder?.productTitle || rawProd?.title || 'Sản phẩm giao dịch';
    const fallbackPrice = activeOrder?.price ?? (typeof rawProd?.price === 'number' ? rawProd.price : (rawProd?.price ? Number(String(rawProd.price).replace(/\D/g, '')) : 0));
    const fallbackPriceStr = activeOrder?.price 
      ? activeOrder.price.toLocaleString('vi-VN') + 'đ' 
      : (rawProd?.priceStr || (rawProd?.price ? (typeof rawProd.price === 'string' ? rawProd.price : rawProd.price.toLocaleString('vi-VN') + 'đ') : '0đ'));
    const fallbackImage = activeOrder?.productImage || rawProd?.image;
    const fallbackSellerName = activeOrder?.sellerName || rawProd?.sellerName || 'Người bán FPT';
    const fallbackSellerCampus = activeOrder?.sellerCampus || rawProd?.sellerCampus || 'Campus FPT';

    return {
      id: activeOrder?.productId || rawProd?.id || '',
      title: fallbackTitle,
      price: fallbackPrice,
      priceStr: fallbackPriceStr,
      image: fallbackImage,
      sellerName: fallbackSellerName,
      sellerCohort: activeOrder?.sellerCohort || rawProd?.sellerCohort || '',
      sellerCampus: fallbackSellerCampus,
    };
  }, [route.params?.product, activeOrder]);

  const initialStatus =
    activeOrder?.status === 'COMPLETED'
      ? 'completed'
      : matchedOrder?.status === 'DELIVERED'
      ? 'delivered'
      : matchedOrder?.status === 'CANCELLED'
      ? 'cancelled'
      : matchedOrder?.status === 'DISPUTED'
      ? 'disputed'
      : matchedOrder?.status === 'PENDING_SAFEPOINT'
      ? 'pending'
      : route.params?.status === 'escrow_holding' ? 'escrow_holding' : 'pending';

  const [orderStatus, setOrderStatus] = useState<string>(initialStatus);
  const [isReviewed, setIsReviewed] = useState<boolean>(matchedOrder?.isReviewed ?? (route.params?.isReviewed || false));

  useEffect(() => {
    let isMounted = true;
    if (orderId) {
      orderMobileService
        .getOrderDetail(orderId)
        .then((order) => {
          if (!isMounted || !order) return;
          setFetchedOrder(order);
          if (order.status === 'COMPLETED') setOrderStatus('completed');
          else if (order.status === 'DELIVERED') setOrderStatus('delivered');
          else if (order.status === 'CANCELLED') setOrderStatus('cancelled');
          else if (order.status === 'DISPUTED') setOrderStatus('disputed');
          else if (order.status === 'PENDING_SAFEPOINT') setOrderStatus('pending');
          else setOrderStatus('escrow_holding');
          setPayosCheckoutUrl(order.paymentCheckoutUrl);
          setSellerId(order.sellerId);
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

    const unsubConfirmed = socketMobileService.onOrderConfirmed((d) => {
      if (d.orderId === orderId || d.orderCode === orderId) {
        setOrderStatus('escrow_holding');
        updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Chờ bàn giao', '#059669', '#ECFDF5');
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
      unsubConfirmed();
      unsubComp();
      unsubCancel();
    };
  }, [orderId, updateOrderStatus]);

  const safePoint = activeOrder?.safePoint || route.params?.safePoint || 'Sảnh Tòa Alpha (Trạm Camera 24/7)';
  const timeSlot = activeOrder?.timeSlot || route.params?.timeSlot || '16:30 - 17:15 (Chiều ca 4) • Hôm nay';
  const deliveryNote = activeOrder?.deliveryNote || route.params?.note || '';
  const isSeller = Boolean(user?.id && (sellerId === user.id || activeOrder?.sellerId === user.id));

  const handleResumePayOs = async () => {
    if (!payosCheckoutUrl) return;
    try {
      await WebBrowser.openBrowserAsync(payosCheckoutUrl);
      const paymentStatus = await paymentMobileService.checkPaymentStatus(matchedOrder?.orderNumber || orderId);
      if (paymentStatus.isPaid) {
        setOrderStatus('escrow_holding');
        updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Đã thanh toán Escrow', '#EA580C', '#FFF7ED');
      }
    } catch (error) {
      console.error('Could not reopen PayOS from order detail', error);
      Alert.alert('Không mở được PayOS', 'Vui lòng thử lại hoặc hủy đơn để tạo đơn mới.');
    }
  };
  const isInterCampus = Boolean(
    activeOrder?.orderType === 'SHIP_COD' ||
    (activeOrder?.sellerCampus && user?.campus && activeOrder.sellerCampus !== user.campus) ||
    (activeOrder?.buyerCampus && activeOrder?.sellerCampus && activeOrder.buyerCampus !== activeOrder.sellerCampus) ||
    (matchedOrder?.sellerCampus && user?.campus && matchedOrder.sellerCampus !== user.campus) ||
    matchedOrder?.orderType === 'SHIP_COD'
  );

  const handleConfirmReceived = useCallback(() => {
    Alert.alert(
      'Xác nhận đã nhận hàng',
      isInterCampus
        ? 'Bạn xác nhận đã nhận được kiện hàng nguyên vẹn và đồng ý giải ngân tiền cọc cho người bán?'
        : 'Bạn đã kiểm tra hàng tại Safe-Point và đồng ý giải ngân tiền cho người bán?',
      [
        { text: 'Kiểm tra thêm', style: 'cancel' },
        {
          text: 'Xác nhận & Giải ngân',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await orderMobileService.confirmDelivery(orderId);
              updateOrderStatus(orderId, 'COMPLETED', '✅ Hoàn tất', '#059669', '#DCFCE7');
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
              Alert.alert('Không thể xác nhận', err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi xác nhận nhận hàng.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  }, [orderId, updateOrderStatus, navigation, product, isInterCampus]);

  const handleConfirmOrder = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await orderMobileService.confirmOrder(orderId);
      if (isInterCampus) {
        setOrderStatus('shipping');
        updateOrderStatus(orderId, 'HANDOVER_CONFIRMED', '🚚 Đang vận chuyển', '#2563EB', '#EFF6FF');
        Alert.alert(
          '🎉 Đã tiếp nhận đơn hàng!',
          'Bạn đã đồng ý đơn liên campus. Vui lòng đóng gói sản phẩm cẩn thận và mang tới bưu cục GHN hoặc trạm xe buýt FPT Bus để gửi.'
        );
      } else {
        setOrderStatus('escrow_holding');
        updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Đã chốt hẹn - Chờ bàn giao tại Safe-Point', '#059669', '#ECFDF5');
        Alert.alert(
          '🎉 Đã chốt lịch hẹn!',
          'Bạn đã đồng ý đơn hàng và xác nhận lịch hẹn gặp người mua tại bàn Safe-Point. Vui lòng có mặt đúng giờ để hoàn tất bàn giao.'
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Lỗi xác nhận',
        err?.response?.data?.message || err?.message || 'Không thể xác nhận đơn hàng lúc này. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, updateOrderStatus, isInterCampus]);

  const handleCancelSuccess = useCallback((reason: string) => {
    updateOrderStatus(orderId, 'CANCELLED', '❌ Đã hủy', '#64748B', '#F1F5F9');
    setOrderStatus('cancelled');
    Alert.alert(
      isSeller ? '🎉 Đã từ chối đơn hàng' : '🎉 Đã hủy đơn hàng an toàn',
      isSeller
        ? `Lý do: ${reason}\nBạn đã từ chối đơn hàng thành công. Toàn bộ tiền cọc Escrow và FPT Xu (nếu người mua đã thanh toán) đã được hoàn lại 100% cho người mua.`
        : `Lý do: ${reason}\nTiền cọc Escrow và FPT Xu (nếu có) đã được hoàn lại đầy đủ về ví của bạn.`
    );
  }, [orderId, updateOrderStatus, isSeller]);

  const handleWithdrawDisputeSuccess = useCallback(() => {
    updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Chờ bàn giao', '#2563EB', '#EFF6FF');
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

  const currentOrderForReviewModal = useMemo(() => {
    if (activeOrder) return activeOrder;
    return {
      id: orderId,
      orderNumber: orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      sellerCampus: product.sellerCampus,
      buyerName: user?.name || 'Người mua',
      buyerCampus: user?.campus || 'Campus FPT',
      productImage: product.image,
      safePoint: safePoint,
      isReviewed: isReviewed,
      status: 'COMPLETED',
    } as unknown as OrderItem;
  }, [activeOrder, orderId, product, isSeller, user, safePoint, isReviewed]);

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
        <OrderStatusTimeline orderStatus={orderStatus} isInterCampus={isInterCampus} />
        <OrderProductSummaryCard product={product} />

        {/* THÔNG TIN ĐỐI TÁC GIAO DỊCH */}
        <Text style={styles.sectionHeader}>
          {isSeller ? 'THÔNG TIN NGƯỜI MUA' : 'THÔNG TIN NGƯỜI BÁN'}
        </Text>
        <View style={styles.partnerCard}>
          <Image
            source={{
              uri: getSafeAvatar(
                isSeller ? activeOrder?.buyerAvatar : activeOrder?.sellerAvatar,
                isSeller
                  ? (activeOrder?.buyerName || 'Người mua FPT')
                  : (activeOrder?.sellerName || product.sellerName || 'Người bán FPT')
              ),
            }}
            style={styles.partnerAvatar}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.partnerInfo}>
            <View style={styles.partnerNameRow}>
              <Text style={styles.partnerName} numberOfLines={1}>
                {isSeller
                  ? (activeOrder?.buyerName || 'Người mua FPT')
                  : (activeOrder?.sellerName || product.sellerName || 'Người bán FPT')}
              </Text>
              <View style={[styles.partnerBadge, { backgroundColor: isSeller ? '#EFF6FF' : '#FFF7ED' }]}>
                <Text style={[styles.partnerBadgeText, { color: isSeller ? '#2563EB' : '#EA580C' }]}>
                  {isSeller ? 'Người mua' : 'Người bán'}
                </Text>
              </View>
            </View>
            <Text style={styles.partnerCampus}>
              Cơ sở: {isSeller ? (activeOrder?.buyerCampus || 'Campus FPT') : (activeOrder?.sellerCampus || product.sellerCampus || 'Campus FPT')}
              {isSeller
                ? (activeOrder?.buyerCohort ? ` • ${activeOrder.buyerCohort}` : '')
                : (activeOrder?.sellerCohort || product.sellerCohort ? ` • ${activeOrder?.sellerCohort || product.sellerCohort}` : '')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.partnerChatBtn}
            onPress={handleOpenChat}
            activeOpacity={0.8}
            hitSlop={HIT_SLOP_8}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#EA580C" />
          </TouchableOpacity>
        </View>

        {!isSeller && orderStatus === 'pending' && !!payosCheckoutUrl && (
          <TouchableOpacity style={styles.payosRetryButton} onPress={handleResumePayOs}>
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
            <Text style={styles.payosRetryText}>Tiếp tục thanh toán PayOS</Text>
          </TouchableOpacity>
        )}

        {/* Chỉ hiện banner liên campus khi là đơn luân chuyển liên campus */}
        {isInterCampus && (
          <OrderInterCampusBanner onPress={handleNavigateInterCampus} />
        )}

        {/* Chỉ hiện mã QR đồng kiểm khi đơn MEETUP (cùng campus hẹn gặp) đang trong quá trình bàn giao/chờ nhận */}
        {orderStatus !== 'completed' && orderStatus !== 'cancelled' && !isInterCampus && (
          <>
            <Text style={styles.sectionHeader}>ĐIỂM HẸN & MÃ QR ĐỒNG KIỂM</Text>
            <OrderSafePointQrCard
              safePoint={safePoint}
              orderId={orderId}
              timeSlot={timeSlot}
              note={deliveryNote}
              isConfirmed={orderStatus !== 'pending' && orderStatus !== 'PENDING_SAFEPOINT'}
              isSeller={Boolean(isSeller)}
            />
          </>
        )}

        <OrderActionButtons
          orderStatus={orderStatus}
          isSeller={Boolean(isSeller)}
          isInterCampus={isInterCampus}
          isReviewed={isReviewed}
          isSubmitting={isSubmitting}
          onConfirmOrder={handleConfirmOrder}
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
        orderId={activeOrder?.id || orderId}
        matchedOrder={activeOrder}
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
        order={currentOrderForReviewModal}
        isSeller={Boolean(isSeller)}
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
  payosRetryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payosRetryText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partnerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  partnerBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  partnerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  partnerCampus: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
  partnerChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
});

export default OrderDetailScreen;
