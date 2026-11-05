import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { InterCampusRouteBanner } from '../components/InterCampusRouteBanner';
import { InterCampusProductCard } from '../components/InterCampusProductCard';
import { InterCampusTimelineCard, InterCampusStep } from '../components/InterCampusTimelineCard';
import { InterCampusNoticeCard } from '../components/InterCampusNoticeCard';
import { PackageHandoverProofModal } from '../components/PackageHandoverProofModal';
import { OrderShipModal } from '../components/OrderShipModal';
import orderMobileService from '../../../services/orderMobileService';
import { useOrderStore } from '../../../stores/orderStore';
import { useUserStore } from '../../../stores/userStore';
import { withRefreshTimeout } from '../../../utils/safeRefresh';

const createInterCampusSteps = (
  currentStep: number,
  fromSafePoint: string,
  toSafePoint: string,
  shippingPartner: string = 'GHN Express',
  trackingCode?: string
): InterCampusStep[] => {
  const isGhn = !shippingPartner || shippingPartner.toUpperCase().includes('GHN');
  return [
    {
      step: 1,
      title: 'Tiếp nhận đơn & Ký quỹ Escrow',
      desc: 'Người mua đã thanh toán cọc bảo hộ 100% trong ví ký quỹ an toàn FPT Pay.',
      time: 'Đã hoàn tất',
      completed: currentStep > 1,
      active: currentStep === 1,
      badge: 'ĐÃ BẢO LÃNH',
      badgeColor: '#059669',
      badgeBg: '#ECFDF5',
    },
    {
      step: 2,
      title: 'Đóng gói & Bàn giao bưu tá / Trạm gửi',
      desc: trackingCode
        ? `Người bán đã bàn giao kiện hàng cho ${shippingPartner}. Mã vận đơn: ${trackingCode}.`
        : isGhn
        ? `Người bán đóng gói kiện hàng và bàn giao cho bưu tá GHN hoặc điểm gửi ${fromSafePoint}.`
        : `Người bán đóng gói kiện hàng và bàn giao tại trạm ${fromSafePoint}.`,
      time: currentStep > 2 ? 'Đã hoàn tất' : currentStep === 2 ? 'Đang tiến hành' : 'Chờ xử lý',
      completed: currentStep > 2,
      active: currentStep === 2,
      badge: trackingCode ? `MÃ: ${trackingCode}` : 'CHỜ BÀN GIAO',
      badgeColor: trackingCode ? '#2563EB' : '#D97706',
      badgeBg: trackingCode ? '#EFF6FF' : '#FFFBEB',
    },
    {
      step: 3,
      title: 'Vận chuyển liên Campus',
      desc: isGhn
        ? `Hàng đang được luân chuyển chuyên tuyến qua bưu tá ${shippingPartner}. Tra cứu lộ trình realtime an toàn.`
        : `Hàng đang được luân chuyển chuyên tuyến qua ${shippingPartner}. Lộ trình vận chuyển liên cơ sở được giám sát an toàn.`,
      time: currentStep > 3 ? 'Đã hoàn tất' : currentStep === 3 ? 'Đang di chuyển' : 'Chờ xử lý',
      completed: currentStep > 3,
      active: currentStep === 3,
      badge: currentStep > 3 ? 'ĐÃ ĐẾN NƠI' : currentStep === 3 ? (isGhn ? 'ĐANG VẬN CHUYỂN 🚚' : 'ĐANG VẬN CHUYỂN 🚌') : 'CHỜ KHỞI HÀNH',
      badgeColor: currentStep === 3 ? '#7C3AED' : '#64748B',
      badgeBg: currentStep === 3 ? '#F3E8FF' : '#F1F5F9',
    },
    {
      step: 4,
      title: 'Giao hàng tới KTX / Safe-Point điểm đến',
      desc: isGhn
        ? `Bưu tá ${shippingPartner} phát hàng tới sảnh KTX hoặc lưu tủ thông minh tại ${toSafePoint}.`
        : `Xe buýt cập bến, kiện hàng được lưu vào tủ an ninh thông minh tại ${toSafePoint} và phát tới sảnh KTX.`,
      time: currentStep > 4 ? 'Đã hoàn tất' : currentStep === 4 ? 'Chờ kiểm tra' : 'Dự kiến 2-3 ngày',
      completed: currentStep > 4,
      active: currentStep === 4,
      badge: currentStep > 4 ? 'ĐÃ NHẬN' : currentStep === 4 ? 'ĐÃ TỚI KTX' : 'CHỜ PHÁT HÀNG',
      badgeColor: currentStep === 4 ? '#2563EB' : '#64748B',
      badgeBg: currentStep === 4 ? '#EFF6FF' : '#F1F5F9',
    },
    {
      step: 5,
      title: 'Người mua nhận hàng & Giải ngân Escrow',
      desc: 'Người mua kiểm tra kiện hàng, đối chiếu mã tem niêm phong và giải ngân tiền cho người bán.',
      time: currentStep === 5 ? 'Đã hoàn tất' : 'Chờ nhận hàng',
      completed: currentStep >= 5,
      active: currentStep === 5,
      badge: currentStep >= 5 ? 'HOÀN TẤT' : 'BẢO VỆ 48H',
      badgeColor: currentStep >= 5 ? '#059669' : '#64748B',
      badgeBg: currentStep >= 5 ? '#ECFDF5' : '#F1F5F9',
    },
  ];
};

export const InterCampusTransactionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId || '';
  const fromCampus = route.params?.fromCampus || 'Cơ sở gửi';
  const toCampus = route.params?.toCampus || 'Cơ sở nhận';

  const { user } = useUserStore();
  const { orders, updateOrderShipping, updateOrderStatus } = useOrderStore();
  const matchedOrder = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  // Phân biệt chính xác Người bán vs Người mua
  const isSeller = useMemo(() => {
    if (typeof route.params?.isSeller === 'boolean') {
      return route.params.isSeller;
    }
    const currentUserId = user?.id;
    const currentEmail = user?.email;
    const currentStudentId = user?.studentId;
    const currentName = user?.name;

    const matchedSellerId = matchedOrder?.sellerId || (matchedOrder as any)?.seller?.id;
    const matchedSellerEmail = (matchedOrder as any)?.sellerEmail || (matchedOrder as any)?.seller?.email;
    const matchedSellerStudentId = (matchedOrder as any)?.sellerStudentId || (matchedOrder as any)?.seller?.studentId;
    const matchedSellerName = matchedOrder?.sellerName || (matchedOrder as any)?.seller?.profile?.fullName;

    const rawProdSellerName = route.params?.product?.sellerName;

    // Nếu người dùng hiện tại là người mua thì chắc chắn không phải người bán
    const matchedBuyerId = matchedOrder?.buyerId || (matchedOrder as any)?.buyer?.id;
    if (currentUserId && matchedBuyerId && currentUserId === matchedBuyerId) {
      return false;
    }

    return Boolean(
      (currentUserId && matchedSellerId && currentUserId === matchedSellerId) ||
      (currentEmail && matchedSellerEmail && currentEmail === matchedSellerEmail) ||
      (currentStudentId && matchedSellerStudentId && currentStudentId === matchedSellerStudentId) ||
      (currentName && matchedSellerName && currentName === matchedSellerName) ||
      (currentName && rawProdSellerName && currentName === rawProdSellerName)
    );
  }, [route.params?.isSeller, route.params?.product?.sellerName, user, matchedOrder]);

  const product = useMemo(() => {
    const rawProd = route.params?.product;
    return {
      title: rawProd?.title || matchedOrder?.productTitle || 'Giao dịch liên campus',
      price: rawProd?.price || matchedOrder?.price || 0,
      priceStr: rawProd?.priceStr || (matchedOrder?.price ? matchedOrder.price.toLocaleString('vi-VN') + ' đ' : '0 đ'),
      image: rawProd?.image || matchedOrder?.productImage,
      sellerName: rawProd?.sellerName || matchedOrder?.sellerName || 'Người bán FPT',
      buyerName: rawProd?.buyerName || matchedOrder?.buyerName || 'Người mua FPT',
      fromSafePoint: rawProd?.fromSafePoint || matchedOrder?.sellerCampus || fromCampus,
      toSafePoint: rawProd?.toSafePoint || matchedOrder?.buyerCampus || toCampus,
    };
  }, [route.params?.product, matchedOrder, fromCampus, toCampus]);

  const [trackingData, setTrackingData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isProofModalVisible, setIsProofModalVisible] = useState<boolean>(false);
  const [showShipModal, setShowShipModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Xác định mã vận đơn và hãng vận chuyển
  const trackingCode = useMemo(() => {
    return (
      trackingData?.trackingCode ||
      matchedOrder?.trackingCode ||
      matchedOrder?.shipping?.trackingCode ||
      route.params?.trackingCode ||
      undefined
    );
  }, [trackingData?.trackingCode, matchedOrder?.trackingCode, matchedOrder?.shipping?.trackingCode, route.params?.trackingCode]);

  const shippingPartner = useMemo(() => {
    return (
      trackingData?.shippingPartner ||
      matchedOrder?.shippingPartner ||
      matchedOrder?.shipping?.shippingPartner ||
      route.params?.shippingPartner ||
      'GHN Express'
    );
  }, [trackingData?.shippingPartner, matchedOrder?.shippingPartner, matchedOrder?.shipping?.shippingPartner, route.params?.shippingPartner]);

  // Trạng thái đơn hàng chuẩn hóa
  const normalizedStatus = useMemo(() => {
    const raw = String(trackingData?.status || matchedOrder?.status || route.params?.orderStatus || '').toUpperCase();
    return raw;
  }, [trackingData?.status, matchedOrder?.status, route.params?.orderStatus]);

  const isCompleted = normalizedStatus === 'COMPLETED';
  const isDelivered = normalizedStatus === 'DELIVERED';
  const hasTrackingCode = Boolean(trackingCode && trackingCode.trim().length > 0);
  const isShipped = hasTrackingCode && (normalizedStatus === 'SHIPPING' || normalizedStatus === 'HANDOVER_CONFIRMED' || isDelivered || isCompleted);

  // Tính toán step tiến trình hiện tại
  const currentStep = useMemo(() => {
    if (isCompleted) return 5;
    if (isDelivered) return 4;
    if (isShipped) {
      return 3;
    }
    return 2; // Đang đóng gói & chuẩn bị bàn giao bưu tá
  }, [isCompleted, isDelivered, isShipped]);

  const fetchTracking = useCallback(async () => {
    try {
      const data = await orderMobileService.getOrderTracking(orderId);
      if (data) {
        setTrackingData(data);
      }
    } catch (e: any) {
      console.log('⚠️ [InterCampusTransaction] Tracking fetch error/fallback:', e?.message);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    await withRefreshTimeout(fetchTracking, setIsRefreshing, 2000);
  }, [isRefreshing, fetchTracking]);

  const steps = useMemo(() => {
    if (
      trackingData?.steps &&
      Array.isArray(trackingData.steps) &&
      trackingData.steps.length > 0
    ) {
      return trackingData.steps.map((s: any, idx: number) => {
        const stepNum = idx + 1;
        const isStepCompleted = s.status === 'completed';
        const isActive = s.status === 'current';
        return {
          step: stepNum,
          title: s.title,
          desc: s.desc,
          time: s.time || (isStepCompleted ? 'Đã hoàn thành' : 'Đang xử lý'),
          completed: isStepCompleted,
          active: isActive,
          badge: isStepCompleted ? 'HOÀN TẤT' : isActive ? 'ĐANG TIẾN HÀNH' : 'CHỜ XỬ LÝ',
          badgeColor: isStepCompleted ? '#059669' : isActive ? '#7C3AED' : '#64748B',
          badgeBg: isStepCompleted ? '#ECFDF5' : isActive ? '#F3E8FF' : '#F1F5F9',
        };
      });
    }
    return createInterCampusSteps(currentStep, product.fromSafePoint, product.toSafePoint, shippingPartner, trackingCode);
  }, [trackingData, currentStep, product.fromSafePoint, product.toSafePoint, shippingPartner, trackingCode]);

  const activeSealCode = trackingData?.sealCode || (isShipped && trackingCode ? `SEAL-${trackingCode.slice(-5)}` : undefined);
  const ghnLogs = trackingData?.ghnLogs || [];

  // Seller cập nhật mã vận đơn thành công
  const handleShipSuccess = (orderIdParam: string, newTrackingCode: string, newPartner: string) => {
    setTrackingData((prev: any) => ({
      ...prev,
      status: 'SHIPPING',
      trackingCode: newTrackingCode,
      shippingPartner: newPartner,
    }));
    if (updateOrderShipping) {
      updateOrderShipping(orderIdParam, newTrackingCode, newPartner);
    }
    fetchTracking();
    Alert.alert(
      '🎉 Bàn giao bưu cục thành công!',
      `Đơn hàng #${matchedOrder?.orderNumber || orderId} đã được gắn mã vận đơn: ${newTrackingCode}\nĐơn vị vận chuyển: ${newPartner}`
    );
  };

  const handleCopyTrackingCode = async () => {
    if (trackingCode) {
      await Clipboard.setStringAsync(trackingCode);
      Alert.alert('Đã sao chép mã', `Mã vận đơn "${trackingCode}" đã được sao chép vào bộ nhớ tạm.`);
    }
  };

  // Buyer xác nhận đã nhận hàng
  const handleConfirmReceived = () => {
    Alert.alert(
      'Xác nhận đã nhận hàng liên campus',
      'Bạn xác nhận đã đến tủ nhận hàng/KTX, kiểm tra kiện hàng còn nguyên tem seal niêm phong và đồng ý giải ngân tiền cọc Escrow cho người bán?',
      [
        { text: 'Kiểm tra thêm', style: 'cancel' },
        {
          text: 'Xác nhận & Giải ngân',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await orderMobileService.confirmDelivery(orderId);
              if (updateOrderStatus) {
                updateOrderStatus(orderId, 'COMPLETED', '✅ Hoàn tất', '#059669', '#DCFCE7');
              }
              setTrackingData((prev: any) => ({ ...prev, status: 'COMPLETED' }));
              Alert.alert(
                '🎉 Giao dịch liên Campus thành công!',
                'Hệ thống đã giải ngân tiền cọc Escrow cho người bán. Cảm ơn bạn đã sử dụng dịch vụ Safe-Handoff liên cơ sở FPT!',
                [
                  {
                    text: 'Đánh giá người bán',
                    onPress: () =>
                      navigation.navigate('Review', {
                        orderId,
                        productTitle: product.title,
                        sellerName: product.sellerName,
                        productImage: product.image,
                      }),
                  },
                  { text: 'Về trang chủ', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) },
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
  };

  const handleOpenDispute = () => {
    navigation.navigate('Dispute', {
      orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      price: product.priceStr,
      isSeller: Boolean(isSeller),
      order: matchedOrder,
      dispute: matchedOrder?.dispute,
    });
  };

  const handleOpenChat = () => {
    navigation.navigate('ChatDetail', {
      partner: {
        id: isSeller ? (matchedOrder?.buyerId || 'u-buyer') : (matchedOrder?.sellerId || 'u-seller'),
        name: isSeller ? (product.buyerName || 'Người mua') : (product.sellerName || 'Người bán'),
        cohort: 'Sinh viên FPT',
        isOnline: true,
      },
      product: {
        id: matchedOrder?.productId || '',
        title: product.title,
        price: product.priceStr,
        image: product.image,
      },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'Home' });
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Hành Trình Vận Đơn Liên Campus
          </Text>
          <View style={styles.headerRoleRow}>
            <View style={[styles.roleBadge, { backgroundColor: isSeller ? '#FFF7ED' : '#EFF6FF' }]}>
              <Ionicons
                name={isSeller ? 'storefront-outline' : 'person-outline'}
                size={11}
                color={isSeller ? '#EA580C' : '#2563EB'}
                style={{ marginRight: 3 }}
              />
              <Text style={[styles.roleBadgeText, { color: isSeller ? '#C2410C' : '#1D4ED8' }]}>
                {isSeller ? 'Người bán (Gửi hàng)' : 'Người mua (Nhận hàng)'}
              </Text>
            </View>
            <Text style={styles.headerSub} numberOfLines={1}>
              Mã: {trackingCode ? trackingCode : 'Chờ tạo mã'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() =>
            Alert.alert(
              'Quy trình Vận chuyển & Escrow',
              'Đồ cũ mua khác cơ sở được vận chuyển an toàn qua Chuyên tuyến FPT Bus hoặc GHN giữa 5 Campus.\n\nTiền của bạn được ví Escrow bảo lãnh 100%, chỉ giải ngân khi người mua đã kiểm tra kiện hàng tại sảnh KTX / tủ an ninh Safe-Point!'
            )
          }
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="information-circle-outline" size={22} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#7C3AED', '#2563EB']}
            tintColor="#7C3AED"
          />
        }
      >
        <InterCampusRouteBanner
          fromCampus={fromCampus}
          toCampus={toCampus}
          fromSafePoint={product.fromSafePoint}
          toSafePoint={product.toSafePoint}
          isShipped={isShipped}
          shippingPartner={shippingPartner}
        />

        <InterCampusProductCard
          title={product.title}
          priceStr={product.priceStr}
          image={product.image}
          sealCode={activeSealCode}
          isShipped={isShipped}
          onViewSealPhoto={() => setIsProofModalVisible(true)}
        />

        <InterCampusTimelineCard
          steps={steps}
          ghnLogs={ghnLogs}
          shippingPartner={shippingPartner}
          trackingCode={trackingCode}
        />

        <InterCampusNoticeCard toSafePoint={product.toSafePoint} isSeller={isSeller} />

        {/* =========================================================================
            KHU VỰC ACTION BUTTONS - PHÂN BIỆT RÕ RÀNG GIỮA SELLER VÀ BUYER
            ========================================================================= */}
        <View style={styles.actionButtonsWrap}>
          {/* TRƯỜNG HỢP 1: NGƯỜI BÁN (SELLER) */}
          {isSeller ? (
            <View style={styles.sellerCardWrap}>
              {!hasTrackingCode ? (
                // Seller chưa có mã vận đơn: Nút to màu cam để tạo mã / bàn giao bưu cục
                <View style={styles.sellerPendingShipBox}>
                  <View style={styles.pendingShipHeader}>
                    <View style={styles.pendingShipIconBox}>
                      <Ionicons name="cube-outline" size={20} color="#EA580C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingShipTitle}>Chưa tạo mã vận đơn bưu cục</Text>
                      <Text style={styles.pendingShipDesc}>
                        Bạn đã đồng ý đơn liên campus. Vui lòng đóng gói kiện hàng và bấm nút bên dưới để chọn hãng xe / bưu cục và tạo mã vận đơn.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.sellerShipActionBtn}
                    activeOpacity={0.88}
                    onPress={() => setShowShipModal(true)}
                  >
                    <Ionicons name="bus" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.sellerShipActionText}>Bàn giao bưu cục & Nhập mã</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Seller đã có mã vận đơn: Hiển thị mã, nút sao chép và nút sửa mã
                <View style={styles.sellerTrackingInfoBox}>
                  <View style={styles.trackingHeaderRow}>
                    <View style={styles.trackingIconBadge}>
                      <Ionicons name="bus" size={18} color="#2563EB" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.trackingPartnerText}>
                        Đơn vị vận chuyển: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{shippingPartner}</Text>
                      </Text>
                      <Text style={styles.trackingCodeValue}>{trackingCode}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyCodeBtn}
                      activeOpacity={0.8}
                      onPress={handleCopyTrackingCode}
                    >
                      <Ionicons name="copy-outline" size={14} color="#2563EB" />
                      <Text style={styles.copyCodeText}>Sao chép</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.trackingActionsRow}>
                    <TouchableOpacity
                      style={styles.editTrackingBtn}
                      activeOpacity={0.85}
                      onPress={() => setShowShipModal(true)}
                    >
                      <Ionicons name="create-outline" size={16} color="#EA580C" style={{ marginRight: 4 }} />
                      <Text style={styles.editTrackingText}>Sửa mã vận đơn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sellerChatBtn}
                      activeOpacity={0.85}
                      onPress={handleOpenChat}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color="#334155" style={{ marginRight: 4 }} />
                      <Text style={styles.sellerChatText}>Nhắn người mua</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.sellerStatusNotice}>
                    <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.sellerStatusNoticeText}>
                      {isCompleted
                        ? 'Giao dịch hoàn tất! Tiền cọc Escrow đã quyết toán vào số dư ví của bạn.'
                        : isDelivered
                        ? 'Kiện hàng đã phát tới KTX. Người mua đang có 48h kiểm tra hàng.'
                        : 'Kiện hàng đang được luân chuyển. Tiền cọc Escrow sẽ tự động giải ngân khi người mua nhận hàng.'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* TRƯỜNG HỢP 2: NGƯỜI MUA (BUYER) */
            <View style={styles.buyerActionWrap}>
              {isCompleted ? (
                // Đơn đã hoàn tất
                <View style={styles.completedBuyerBox}>
                  <View style={styles.completedHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.completedTitle}>Đơn hàng đã hoàn tất & Đã giải ngân!</Text>
                  </View>
                  <Text style={styles.completedDesc}>
                    Cảm ơn bạn đã sử dụng dịch vụ Safe-Handoff liên cơ sở FPT. Bạn có thể đánh giá người bán để nâng cao uy tín cộng đồng.
                  </Text>
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    activeOpacity={0.88}
                    onPress={() =>
                      navigation.navigate('Review', {
                        orderId,
                        productTitle: product.title,
                        sellerName: product.sellerName,
                        productImage: product.image,
                      })
                    }
                  >
                    <Ionicons name="star" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.reviewBtnText}>Đánh giá người bán</Text>
                  </TouchableOpacity>
                </View>
              ) : isDelivered ? (
                // ĐÃ GIAO TỚI KTX: LÚC NÀY MỚI HIỂN THỊ NÚT XÁC NHẬN NHẬN HÀNG VÀ KHIẾU NẠI!
                <View style={{ gap: 10 }}>
                  <View style={styles.arrivedAlertBox}>
                    <Ionicons name="location" size={20} color="#059669" style={{ marginRight: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.arrivedAlertTitle}>Kiện hàng đã phát tới sảnh KTX / Tủ an ninh!</Text>
                      <Text style={styles.arrivedAlertDesc}>
                        Vui lòng đến trạm kiểm tra ngoại quan trước camera đối chứng 24/7. Nếu sản phẩm đúng cam kết, bấm Xác nhận để giải ngân.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.confirmReceivedBtn}
                    activeOpacity={0.88}
                    onPress={handleConfirmReceived}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.confirmReceivedText}>Xác nhận đã nhận hàng</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.disputeBtn}
                    activeOpacity={0.85}
                    onPress={handleOpenDispute}
                  >
                    <Ionicons name="alert-circle-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={styles.disputeBtnText}>Khiếu nại hàng lỗi / vỡ</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // HÀNG ĐANG VẬN CHUYỂN / CHƯA TỚI NƠI: TUYỆT ĐỐI KHÔNG HIỂN THỊ NÚT GIẢI NGÂN SỚM!
                <View style={styles.transitWaitingBox}>
                  <View style={styles.transitWaitingHeader}>
                    <View style={styles.transitIconCircle}>
                      <Ionicons name="bus" size={20} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.transitWaitingTitle}>Đang vận chuyển tuyến liên Campus</Text>
                      <Text style={styles.transitWaitingDesc}>
                        Kiện hàng đang được xe buýt FPT Bus / GHN vận chuyển an toàn tới campus của bạn.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.transitNoticeCard}>
                    <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.transitNoticeText}>
                      Tiền cọc của bạn được ví Escrow bảo hộ 100%. Nút <Text style={{ fontWeight: '800' }}>Xác nhận đã nhận hàng</Text> sẽ kích hoạt khi bưu tá phát hàng tới sảnh KTX để bạn kiểm tra hàng.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.contactSellerBtn}
                    activeOpacity={0.85}
                    onPress={handleOpenChat}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={17} color="#2563EB" style={{ marginRight: 6 }} />
                    <Text style={styles.contactSellerBtnText}>Nhắn tin cho người bán</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Package Handover Proof Modal */}
      <PackageHandoverProofModal
        visible={isProofModalVisible}
        onClose={() => setIsProofModalVisible(false)}
        sealCode={activeSealCode}
        productTitle={product.title}
        productImage={product.image}
        safePointName={product.fromSafePoint}
        handoffTime="10:15 - Hôm nay"
        onReportDispute={handleOpenDispute}
      />

      {/* Order Ship Modal dành cho Người Bán tạo hoặc cập nhật mã vận đơn */}
      <OrderShipModal
        visible={showShipModal}
        orderId={matchedOrder?.id || orderId}
        orderCode={matchedOrder?.orderNumber || orderId}
        productTitle={product.title}
        sellerName={product.sellerName}
        campus={product.fromSafePoint}
        initialPartner={shippingPartner}
        initialTrackingCode={trackingCode || ''}
        isAlreadyShipping={hasTrackingCode}
        onClose={() => setShowShipModal(false)}
        onSuccess={handleShipSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
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
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  helpBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  actionButtonsWrap: {
    marginHorizontal: 16,
    marginTop: 16,
  },

  // Seller Styles
  sellerCardWrap: {
    gap: 10,
  },
  sellerPendingShipBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  pendingShipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pendingShipIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingShipTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9A3412',
  },
  pendingShipDesc: {
    fontSize: 11.5,
    color: '#C2410C',
    marginTop: 2,
    lineHeight: 16,
  },
  sellerShipActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    height: 46,
    borderRadius: 12,
    boxShadow: '0 3px 5px rgba(234, 88, 12, 0.25)',
  },
  sellerShipActionText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  sellerTrackingInfoBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  trackingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trackingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingPartnerText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  trackingCodeValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  copyCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  trackingActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editTrackingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  editTrackingText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  sellerChatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sellerChatText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  sellerStatusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  sellerStatusNoticeText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 15,
  },

  // Buyer Styles
  buyerActionWrap: {
    gap: 10,
  },
  transitWaitingBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  transitWaitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  transitIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitWaitingTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#6B21A8',
  },
  transitWaitingDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
    lineHeight: 16,
  },
  transitNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
  },
  transitNoticeText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    lineHeight: 15,
  },
  contactSellerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  contactSellerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },

  arrivedAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
  },
  arrivedAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  arrivedAlertDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },

  confirmReceivedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    height: 48,
    borderRadius: 14,
    boxShadow: '0 3px 5px rgba(22, 163, 74, 0.25)',
  },
  confirmReceivedText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  disputeBtnText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '700',
  },

  completedBuyerBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
    flex: 1,
  },
  completedDesc: {
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 42,
    borderRadius: 10,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default InterCampusTransactionScreen;
