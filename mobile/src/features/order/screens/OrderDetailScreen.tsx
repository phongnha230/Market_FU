import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { getSafeAvatar } from '../../../lib/imageResolver';
import { toBackendCampus } from '../../../lib/backendMappers';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { useProductStore } from '../../../stores/productStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { orderMobileService } from '../../../services/orderMobileService';
import { extractOrderIdFromNotification } from '../../../services/notificationMobileService';
import paymentMobileService from '../../../services/paymentMobileService';
import { socketMobileService } from '../../../services/socketMobileService';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { OrderSafePointQrCard } from '../components/OrderSafePointQrCard';
import { OrderActionButtons } from '../components/OrderActionButtons';
import { OrderProductSummaryCard } from '../components/OrderProductSummaryCard';
import { OrderInterCampusBanner } from '../components/OrderInterCampusBanner';
import { PackageProofRow } from '../components/PackageProofRow';
import { OrderDetailModals } from '../components/OrderDetailModals';
import { OrderShipModal } from '../components/OrderShipModal';
import { OrderDisputeDetailModal } from '../components/OrderDisputeDetailModal';
import { ReviewDetailModal } from '../../review/components/ReviewDetailModal';

const HIT_SLOP_8 = { top: 8, bottom: 8, left: 8, right: 8 } as const;
const HIT_SLOP_10 = { top: 10, bottom: 10, left: 10, right: 10 } as const;

export const OrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useUserStore();
  const { orders, updateOrderStatus, updateOrderShipping } = useOrderStore();

  const [showProofModal, setShowProofModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showDisputeDetailModal, setShowDisputeDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWithdrawDisputeModal, setShowWithdrawDisputeModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showReviewDetailModal, setShowReviewDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawParamOrderId = useMemo(() => {
    const directExtracted = extractOrderIdFromNotification({
      orderId: route.params?.orderId,
      orderCode: route.params?.orderCode,
      body: route.params?.notificationBody,
      title: route.params?.notificationTitle,
    });
    if (directExtracted) {
      return directExtracted.replace(/^#/, '').trim();
    }

    // Dự phòng nếu thông báo FCM cũ trên thanh trạng thái không truyền orderId trong data
    const notifs = useNotificationStore.getState().notifications || [];
    for (const item of notifs) {
      if (
        item.category === 'order' ||
        item.targetScreen === 'OrderDetail' ||
        (item.body && item.body.includes('ORD-'))
      ) {
        const fromNotif = extractOrderIdFromNotification({
          orderId: item.targetParams?.orderId,
          body: item.body,
          title: item.title,
        });
        if (fromNotif) {
          return fromNotif.replace(/^#/, '').trim();
        }
      }
    }
    return '';
  }, [
    route.params?.orderId,
    route.params?.orderCode,
    route.params?.notificationBody,
    route.params?.notificationTitle,
  ]);

  const matchedOrder = useMemo(() => {
    if (!rawParamOrderId) {
      return orders[0];
    }
    const normTarget = rawParamOrderId.replace(/^#/, '').trim().toUpperCase();
    return orders.find((o) => {
      const normId = String(o.id || '').replace(/^#/, '').trim().toUpperCase();
      const normNum = String(o.orderNumber || '').replace(/^#/, '').trim().toUpperCase();
      return normId === normTarget || normNum === normTarget;
    });
  }, [orders, rawParamOrderId]);

  const [fetchedOrder, setFetchedOrder] = useState<OrderItem | null>(null);
  const activeOrder = fetchedOrder || matchedOrder;
  const orderId =
    activeOrder?.id ||
    rawParamOrderId ||
    activeOrder?.orderNumber ||
    '';
  const displayOrderCode =
    activeOrder?.orderNumber ||
    (rawParamOrderId
      ? rawParamOrderId.toUpperCase().startsWith('ORD-')
        ? `#${rawParamOrderId.replace(/^#/, '')}`
        : rawParamOrderId
      : 'Đang tải...');
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
      : activeOrder?.status === 'DELIVERED'
      ? 'delivered'
      : activeOrder?.status === 'HANDOVER_CONFIRMED'
      ? 'shipping'
      : activeOrder?.status === 'CANCELLED'
      ? 'cancelled'
      : activeOrder?.status === 'DISPUTED'
      ? 'disputed'
      : activeOrder?.status === 'PENDING_SAFEPOINT'
      ? 'pending'
      : activeOrder?.status === 'ESCROW_PAID' || route.params?.status === 'escrow_holding'
      ? 'escrow_holding'
      : 'pending';

  const [orderStatus, setOrderStatus] = useState<string>(initialStatus);
  const [isReviewed, setIsReviewed] = useState<boolean>(matchedOrder?.isReviewed ?? (route.params?.isReviewed || false));

  // Đồng bộ trạng thái hiển thị ngay khi activeOrder (từ store hoặc API) thay đổi
  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.status === 'COMPLETED') setOrderStatus('completed');
    else if (activeOrder.status === 'DELIVERED') setOrderStatus('delivered');
    else if (activeOrder.status === 'HANDOVER_CONFIRMED') setOrderStatus('shipping');
    else if (activeOrder.status === 'CANCELLED') setOrderStatus('cancelled');
    else if (activeOrder.status === 'DISPUTED') setOrderStatus('disputed');
    else if (activeOrder.status === 'PENDING_SAFEPOINT') setOrderStatus('pending');
    else if (activeOrder.status === 'ESCROW_PAID') setOrderStatus('escrow_holding');
    if (activeOrder.paymentCheckoutUrl) setPayosCheckoutUrl(activeOrder.paymentCheckoutUrl);
    if (activeOrder.sellerId) setSellerId(activeOrder.sellerId);
    if (activeOrder.isReviewed) setIsReviewed(true);
  }, [activeOrder]);

  useEffect(() => {
    let isMounted = true;
    setFetchedOrder(null);

    const targetLookupId = rawParamOrderId || matchedOrder?.id || matchedOrder?.orderNumber || '';
    if (targetLookupId) {
      orderMobileService
        .getOrderDetail(targetLookupId)
        .then((order) => {
          if (!isMounted || !order) return;
          setFetchedOrder(order);
        })
        .catch(() => {});
    } else {
      // Nếu mở từ thông báo cũ không chứa mã đơn, tải danh sách đơn mới nhất từ Backend
      orderMobileService
        .getOrders({ page: 1, limit: 10 })
        .then((latestList) => {
          if (!isMounted || !Array.isArray(latestList) || latestList.length === 0) return;
          setFetchedOrder(latestList[0]);
        })
        .catch(() => {});
    }

    const matchesCurrentOrder = (d: any) => {
      const evId = String(d?.orderId || '').replace(/^#/, '').trim().toUpperCase();
      const evCode = String(d?.orderCode || '').replace(/^#/, '').trim().toUpperCase();
      const curId = String(orderId || '').replace(/^#/, '').trim().toUpperCase();
      const curCode = String(activeOrder?.orderNumber || rawParamOrderId || '').replace(/^#/, '').trim().toUpperCase();
      return (
        (evId && (evId === curId || evId === curCode)) ||
        (evCode && (evCode === curId || evCode === curCode))
      );
    };

    const unsubPaid = socketMobileService.onOrderPaid((d) => {
      if (matchesCurrentOrder(d)) {
        setOrderStatus('pending');
        updateOrderStatus(orderId, 'PENDING_SAFEPOINT', '🛡️ Đã cọc Escrow • Chờ người bán xác nhận', '#D97706', '#FFFBEB');
        orderMobileService
          .getOrderDetail(d?.orderId || d?.orderCode || orderId)
          .then((updated) => {
            if (isMounted && updated) setFetchedOrder(updated);
          })
          .catch(() => {});
      }
    });

    const unsubConfirmed = socketMobileService.onOrderConfirmed((d) => {
      if (matchesCurrentOrder(d)) {
        const isCurrentInterCampus =
          activeOrder?.orderType === 'SHIP_COD' ||
          matchedOrder?.orderType === 'SHIP_COD' ||
          Boolean(route.params?.isDifferentCampus);
        if (isCurrentInterCampus) {
          setOrderStatus('shipping');
          updateOrderStatus(orderId, 'HANDOVER_CONFIRMED', '📦 Người bán đang đóng gói', '#EA580C', '#FFF7ED');
        } else {
          setOrderStatus('escrow_holding');
          updateOrderStatus(orderId, 'ESCROW_PAID', '🛡️ Chờ gặp bàn giao', '#059669', '#ECFDF5');
        }
        orderMobileService
          .getOrderDetail(d?.orderId || d?.orderCode || orderId)
          .then((updated) => {
            if (isMounted && updated) setFetchedOrder(updated);
          })
          .catch(() => {});
      }
    });

    const unsubComp = socketMobileService.onOrderCompleted((d) => {
      if (matchesCurrentOrder(d)) {
        setOrderStatus('completed');
        updateOrderStatus(orderId, 'COMPLETED', '✅ Giao dịch hoàn tất', '#059669', '#DCFCE7');
      }
    });

    const unsubCancel = socketMobileService.onOrderCancelled((d) => {
      if (matchesCurrentOrder(d)) {
        setOrderStatus('cancelled');
        updateOrderStatus(orderId, 'CANCELLED', '❌ Đơn hàng đã bị hủy', '#DC2626', '#FEF2F2');
      }
    });

    const unsubShipping = socketMobileService.onOrderShippingUpdated((d) => {
      if (matchesCurrentOrder(d)) {
        if (d.status === 'DELIVERED') {
          setOrderStatus('delivered');
          updateOrderStatus(orderId, 'DELIVERED', '🛵 Đã tới KTX', '#10B981', '#ECFDF5');
        } else if (d.status === 'SHIPPING') {
          setOrderStatus('shipping');
          updateOrderStatus(orderId, 'HANDOVER_CONFIRMED', '🚚 Đang vận chuyển', '#2563EB', '#EFF6FF');
        }
        orderMobileService
          .getOrderDetail(d?.orderId || d?.orderCode || orderId)
          .then((updated) => {
            if (isMounted && updated) setFetchedOrder(updated);
          })
          .catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      unsubPaid();
      unsubConfirmed();
      unsubComp();
      unsubCancel();
      unsubShipping();
    };
  }, [rawParamOrderId, orderId, updateOrderStatus]);

  const safePoint = activeOrder?.safePoint || route.params?.safePoint || 'Sảnh Tòa Alpha (Trạm Camera 24/7)';
  const timeSlot = activeOrder?.timeSlot || route.params?.timeSlot || '16:30 - 17:15 (Chiều ca 4) • Hôm nay';
  const deliveryNote = activeOrder?.deliveryNote || route.params?.note || '';
  const currentUserId = String(user?.id || (user as any)?._id || '').trim();
  const isSeller = Boolean(
    typeof route.params?.isSeller === 'boolean'
      ? route.params.isSeller
      : (
          (currentUserId && (activeOrder?.buyerId === currentUserId || matchedOrder?.buyerId === currentUserId || (activeOrder as any)?.buyer?.id === currentUserId || (activeOrder as any)?.buyer?._id === currentUserId))
            ? false
            : (
                (currentUserId && (sellerId === currentUserId || activeOrder?.sellerId === currentUserId || (activeOrder as any)?.seller?.id === currentUserId || (activeOrder as any)?.seller?._id === currentUserId)) ||
                (user?.email && ((activeOrder as any)?.sellerEmail === user.email || (activeOrder as any)?.seller?.email === user.email)) ||
                (user?.studentId && ((activeOrder as any)?.sellerStudentId === user.studentId || (activeOrder as any)?.seller?.studentId === user.studentId)) ||
                (user?.name && (product.sellerName === user.name || activeOrder?.sellerName === user.name || (activeOrder as any)?.seller?.profile?.fullName === user.name))
              )
        )
  );

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
  const isInterCampus = useMemo(() => {
    if (activeOrder?.orderType) {
      return activeOrder.orderType === 'SHIP_COD';
    }
    if (matchedOrder?.orderType) {
      return matchedOrder.orderType === 'SHIP_COD';
    }
    if (typeof route.params?.isDifferentCampus === 'boolean') {
      return route.params.isDifferentCampus;
    }
    const sellerCode = toBackendCampus(activeOrder?.sellerCampus || product.sellerCampus);
    const buyerCode = toBackendCampus(activeOrder?.buyerCampus || user?.campus);
    return Boolean(sellerCode && buyerCode && sellerCode !== buyerCode);
  }, [
    activeOrder?.orderType,
    activeOrder?.sellerCampus,
    activeOrder?.buyerCampus,
    matchedOrder?.orderType,
    route.params?.isDifferentCampus,
    product.sellerCampus,
    user?.campus,
  ]);

  const handleShipSuccess = useCallback((orderIdParam: string, trackingCode: string, partner: string) => {
    setOrderStatus('shipping');
    if (updateOrderShipping) {
      updateOrderShipping(orderIdParam, trackingCode, partner);
    }
    setFetchedOrder((prev) => (prev ? {
      ...prev,
      status: 'HANDOVER_CONFIRMED',
      statusLabel: '🚚 Đang vận chuyển',
      trackingCode,
      shippingPartner: partner,
      shipping: {
        ...(prev.shipping || {}),
        trackingCode,
        shippingPartner: partner,
      },
    } : null));
    Alert.alert(
      '🎉 Bàn giao bưu cục thành công!',
      `Đơn hàng #${activeOrder?.orderNumber || orderId} đã được chuyển sang trạng thái Đang vận chuyển.\nĐơn vị: ${partner}\nMã vận đơn: ${trackingCode}`
    );
  }, [orderId, activeOrder, updateOrderShipping]);

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
              useProductStore.getState().fetchProducts().catch(() => {});
              setTimeout(() => {
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
              }, 150);
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
        setShowShipModal(true);
        updateOrderStatus(orderId, 'HANDOVER_CONFIRMED', '🚚 Chờ gửi hàng', '#EA580C', '#FFF7ED');
        Alert.alert(
          '🎉 Đã tiếp nhận đơn hàng!',
          'Bạn đã đồng ý đơn liên campus. Vui lòng chọn hãng vận chuyển và tạo mã vận đơn để bàn giao bưu tá.'
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
    useProductStore.getState().fetchProducts().catch(() => {});
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
    const activeProductId = activeOrder?.productId || matchedOrder?.productId || product.id;
    const partnerId = isSeller
      ? (activeOrder?.buyerId || matchedOrder?.buyerId || (activeOrder as any)?.buyer?.id || 'u-buyer')
      : (activeOrder?.sellerId || matchedOrder?.sellerId || (activeOrder as any)?.seller?.id || sellerId || 'u-seller');
    const partnerName = isSeller
      ? (activeOrder?.buyerName || matchedOrder?.buyerName || (activeOrder as any)?.buyer?.profile?.fullName || 'Người mua FPT')
      : (activeOrder?.sellerName || matchedOrder?.sellerName || product.sellerName || 'Người bán FPT');
    const partnerCohort = isSeller
      ? (activeOrder?.buyerCohort || matchedOrder?.buyerCohort || 'Sinh viên FPT')
      : (activeOrder?.sellerCohort || matchedOrder?.sellerCohort || product.sellerCohort || 'Sinh viên FPT');
    const partnerAvatar = isSeller
      ? (activeOrder?.buyerAvatar || matchedOrder?.buyerAvatar)
      : (activeOrder?.sellerAvatar || matchedOrder?.sellerAvatar);

    navigation.navigate('ChatDetail', {
      partner: {
        id: partnerId,
        name: partnerName,
        cohort: partnerCohort,
        avatar: partnerAvatar,
        isOnline: true,
      },
      product: {
        id: activeProductId,
        title: product.title,
        price: product.priceStr || '1.450.000đ',
        image: product.image,
      },
    });
  }, [navigation, product, matchedOrder, activeOrder, isSeller, sellerId]);

  const handleOpenDispute = useCallback(() => {
    navigation.navigate('Dispute', {
      orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      price: product.priceStr || '1.450.000đ',
      isCod: false,
      isSeller: Boolean(isSeller),
      order: activeOrder || matchedOrder,
      dispute: activeOrder?.dispute || matchedOrder?.dispute,
    });
  }, [navigation, orderId, product, isSeller, activeOrder, matchedOrder]);

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
      order: activeOrder,
      fromCampus: product.sellerCampus || 'Hòa Lạc',
      toCampus: user?.campus || 'TP. Hồ Chí Minh',
      isSeller: Boolean(isSeller),
      orderStatus,
      trackingCode: activeOrder?.trackingCode || activeOrder?.shipping?.trackingCode,
      shippingPartner: activeOrder?.shippingPartner || activeOrder?.shipping?.shippingPartner,
      isReviewed: Boolean(activeOrder?.isReviewed || isReviewed),
    });
  }, [navigation, orderId, product, user?.campus, isSeller, orderStatus, activeOrder, isReviewed]);

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

  const hasTrackingCode = Boolean(
    activeOrder?.trackingCode ||
    activeOrder?.shipping?.trackingCode ||
    fetchedOrder?.trackingCode ||
    fetchedOrder?.shipping?.trackingCode
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
          <Text style={styles.headerOrderId}>{displayOrderCode}</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scrollBody, { paddingBottom: Math.max(insets.bottom, 16) + 40 }]}>
        <OrderStatusTimeline
          orderStatus={orderStatus}
          isInterCampus={isInterCampus}
          hasTrackingCode={hasTrackingCode}
        />
        <OrderProductSummaryCard
          product={product}
          isSeller={Boolean(isSeller)}
          platformFee={activeOrder?.payment?.platformFeeAmount}
          sellerNetEarning={activeOrder?.payment?.sellerNetEarning}
        />

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
          <OrderInterCampusBanner
            shippingPartner={activeOrder?.shippingPartner || activeOrder?.shipping?.shippingPartner}
            onPress={handleNavigateInterCampus}
          />
        )}

        {/* Thông tin vận đơn / Hành trình liên campus */}
        {isInterCampus && (orderStatus === 'shipping' || orderStatus === 'delivered' || !!activeOrder?.trackingCode) && (
          <View style={styles.trackingCard}>
            <View style={styles.trackingCardHeader}>
              <View style={styles.trackingCardIconBox}>
                <Ionicons name="bus" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackingCardTitle}>
                  Vận đơn • {activeOrder?.shippingPartner || activeOrder?.shipping?.shippingPartner || 'GHN Express'}
                </Text>
                <Text style={styles.trackingCodeValue}>
                  Mã: {activeOrder?.trackingCode || activeOrder?.shipping?.trackingCode || 'Đang cập nhật'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.trackingCopyBtn}
                onPress={async () => {
                  const code = activeOrder?.trackingCode || activeOrder?.shipping?.trackingCode;
                  if (code && code !== 'Đang cập nhật') {
                    await Clipboard.setStringAsync(code);
                    Alert.alert('Đã sao chép', `Đã lưu mã vận đơn [${code}] vào bộ nhớ tạm.`);
                  }
                }}
                hitSlop={HIT_SLOP_8}
                activeOpacity={0.7}
              >
                <Ionicons name="copy-outline" size={14} color="#2563EB" />
                <Text style={styles.trackingCopyText}>Sao chép</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.trackingCardFooter}>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" />
              <Text style={styles.trackingFooterText}>
                {orderStatus === 'delivered'
                  ? 'Kiện hàng đã phát tới KTX. Người mua đang có 48h kiểm tra hàng.'
                  : 'Kiện hàng đang được bưu cục chuyển phát tới KTX điểm đến.'}
              </Text>
            </View>
          </View>
        )}

        {/* Chỉ hiện mã QR đồng kiểm khi đơn MEETUP (cùng campus hẹn gặp) đang trong quá trình bàn giao/chờ nhận */}
        {orderStatus !== 'completed' && orderStatus !== 'cancelled' && !isInterCampus && (
          <>
            <Text style={styles.sectionHeader}>ĐIỂM HẸN & MÃ QR ĐỒNG KIỂM</Text>
            <OrderSafePointQrCard
              safePoint={safePoint}
              orderId={orderId}
              orderCode={activeOrder?.orderNumber || orderId}
              timeSlot={timeSlot}
              note={deliveryNote}
              isConfirmed={orderStatus === 'escrow_holding'}
              isSeller={Boolean(isSeller)}
              handshakeOtp={activeOrder?.handshakeOtp || (activeOrder as any)?.handshake?.handshakeOtp}
              handshakeToken={(activeOrder as any)?.handshake?.handshakeToken}
            />
          </>
        )}

        <OrderActionButtons
          orderStatus={orderStatus}
          isSeller={Boolean(isSeller)}
          onOpenShipModal={() => setShowShipModal(true)}
          onOpenDisputeDetail={() => setShowDisputeDetailModal(true)}
          isInterCampus={isInterCampus}
          shippingPartner={activeOrder?.shippingPartner || activeOrder?.shipping?.shippingPartner}
          hasTrackingCode={Boolean(activeOrder?.trackingCode || activeOrder?.shipping?.trackingCode || fetchedOrder?.trackingCode || fetchedOrder?.shipping?.trackingCode)}
          isReviewed={isReviewed}
          isSubmitting={isSubmitting}
          cancelledBy={activeOrder?.cancelledBy}
          cancelReason={activeOrder?.cancelReason}
          isPaid={activeOrder?.isPaid}
          hasDisputeRefund={
            activeOrder?.dispute?.status === 'RESOLVED' ||
            activeOrder?.dispute?.status === 'REFUNDED'
          }
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

      <OrderShipModal
        visible={showShipModal}
        orderId={activeOrder?.id || orderId}
        orderCode={activeOrder?.orderNumber || orderId}
        productTitle={product.title}
        sellerName={product.sellerName}
        campus={product.sellerCampus}
        initialPartner={activeOrder?.shippingPartner || activeOrder?.shipping?.shippingPartner || 'GHN'}
        initialTrackingCode={activeOrder?.trackingCode || activeOrder?.shipping?.trackingCode || ''}
        isAlreadyShipping={orderStatus === 'shipping'}
        onClose={() => setShowShipModal(false)}
        onSuccess={handleShipSuccess}
      />

      <OrderDisputeDetailModal
        visible={showDisputeDetailModal}
        orderCode={activeOrder?.orderNumber || orderId}
        productTitle={product.title}
        isSeller={Boolean(isSeller)}
        buyerName={activeOrder?.buyerName}
        sellerName={activeOrder?.sellerName || product.sellerName}
        dispute={activeOrder?.dispute}
        onClose={() => setShowDisputeDetailModal(false)}
        onOpenChat={handleOpenChat}
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
  trackingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trackingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trackingCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  trackingCodeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  trackingCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  trackingCopyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  trackingCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trackingFooterText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
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
