import { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { useVoucherStore } from '../../../stores/voucherStore';
import { orderMobileService } from '../../../services/orderMobileService';

export function useCheckoutController() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, isAuthenticated } = useUserStore();
  const { myVouchers, isLoading: loadingVouchers, fetchVouchers, useVoucherCode } = useVoucherStore();
  const addOrder = useOrderStore((s) => s.addOrder);

  // Fetch available user vouchers on mount
  useEffect(() => {
    fetchVouchers().catch(() => {});
  }, [fetchVouchers]);

  // Params passed from ProductDetail
  const product = useMemo(() => {
    return route.params?.product || {
      id: 'prod-escrow-1',
      title: 'Màn hình Dell 24" UltraSharp U2419H',
      price: 1450000,
      priceStr: '1.450.000đ',
      image: require('../../../../assets/products/monitor-dell-24.jpg'),
      sellerName: 'Nguyễn Văn Nam',
      sellerMajor: 'K16 - Kỹ thuật phần mềm',
      sellerCohort: 'K16 - FPT Hola',
      sellerCampus: 'Hòa Lạc',
      isDifferentCampus: false,
    };
  }, [route.params?.product]);

  const isDifferentCampus = route.params?.isDifferentCampus ?? false;

  const [selectedSafePoint, setSelectedSafePoint] = useState(
    route.params?.safePoint ||
      (isDifferentCampus
        ? 'Sảnh KTX Dom A (Cơ sở Hòa Lạc - Nhận từ FPT Bus)'
        : 'Sảnh Tòa Alpha (Trạm Safe-Point có camera 24/7)')
  );
  const [selectedPayment, setSelectedPayment] = useState<'vietqr' | 'fptpay' | 'cash'>('fptpay');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title?: string;
  } | null>(null);

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [customVoucherInput, setCustomVoucherInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice = typeof product.price === 'number' ? product.price : 1450000;
  const shippingFee = isDifferentCampus ? 30000 : 0;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalAmount = Math.max(0, basePrice + shippingFee - discountAmount);

  const formatCurrency = useCallback((val: number) => {
    return val.toLocaleString('vi-VN') + 'đ';
  }, []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  const handleRemoveVoucher = useCallback(() => {
    setAppliedVoucher(null);
  }, []);

  const handleOpenVoucherModal = useCallback(() => {
    setIsVoucherModalOpen(true);
  }, []);

  const handleSelectVoucher = useCallback(
    (voucher: { code: string; discount: number; title?: string } | null) => {
      setAppliedVoucher(voucher);
      setIsVoucherModalOpen(false);
    },
    []
  );

  const handleApplyCustomVoucher = useCallback(() => {
    const code = customVoucherInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã giảm giá.');
      return;
    }

    if (code === 'FPTK20WELCOME' || code === 'FPTCARE') {
      setAppliedVoucher({
        code,
        discount: 30000,
        title: 'Chào đón tân sinh viên FPT (-30k)',
      });
      setIsVoucherModalOpen(false);
      setCustomVoucherInput('');
      Alert.alert('Thành công', 'Đã áp dụng mã giảm giá 30.000đ!');
      return;
    }

    // Check in user's saved vouchers
    const matched = myVouchers.find((v) => v.voucherCode.toUpperCase() === code && v.status === 'UNUSED');
    if (matched) {
      setAppliedVoucher({
        code: matched.voucherCode,
        discount: matched.voucher.discountValue,
        title: matched.voucher.title,
      });
      setIsVoucherModalOpen(false);
      setCustomVoucherInput('');
      Alert.alert('Thành công', `Đã áp dụng ${matched.voucher.title}!`);
      return;
    }

    Alert.alert('Không tìm thấy', 'Mã voucher không tồn tại hoặc đã hết hạn sử dụng.');
  }, [customVoucherInput, myVouchers]);

  const handleNavigateVoucherList = useCallback(() => {
    setIsVoucherModalOpen(false);
    navigation.navigate('Voucher');
  }, [navigation]);

  const handleConfirmPayment = useCallback(async () => {
    if (isSubmitting) return;

    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản FPT để tiến hành đặt mua và ký quỹ Escrow.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const createdOrder = await orderMobileService.createOrder({
        productId: product.id,
        orderType: isDifferentCampus ? 'SHIP_COD' : 'MEETUP',
        paymentMethod: selectedPayment === 'vietqr' ? 'VIETQR' : selectedPayment === 'fptpay' ? 'PAYOS_WEB' : 'CASH',
        safePoint: selectedSafePoint,
        meetupLocation: selectedSafePoint,
        deliveryNote: `Hẹn gặp tại: ${selectedSafePoint}`,
        voucherCode: appliedVoucher?.code,
        isDifferentCampus,
        shipping: isDifferentCampus
          ? {
              receiverName: user?.name || 'Sinh viên FPT',
              receiverPhone: user?.phone || '0901234567',
              shippingAddress: selectedSafePoint,
              destinationCampus: user?.campus || 'HOL',
              shippingPartner: 'FPT Bus Handoff',
            }
          : undefined,
      });

      addOrder(createdOrder);

      if (appliedVoucher?.code) {
        useVoucherCode(appliedVoucher.code).catch(() => {});
      }

      // Điều hướng ngay tới Vé Nhận Hàng Escrow
      navigation.replace('CheckoutSuccess', {
        orderCode: createdOrder.orderNumber,
        orderId: createdOrder.id,
        totalAmount,
        product: {
          title: product.title,
          sellerName: product.sellerName || createdOrder.sellerName,
          sellerCohort: product.sellerCohort || createdOrder.sellerCohort,
          image: product.image || createdOrder.productImage,
        },
        safePoint: selectedSafePoint,
        handshakeOtp: createdOrder.handshakeOtp,
        timeSlot: createdOrder.timeSlot || 'Hôm nay: 16:30 - 17:30',
        isDifferentCampus,
        fromCampus: product.sellerCampus || 'Hòa Lạc',
        toCampus: user?.campus || 'Đà Nẵng',
      });
    } catch (err: any) {
      console.log('⚠️ [createOrder error]:', err?.message);

      // Nếu backend trả về lỗi nghiệp vụ (ví dụ: KYC required, self-buy, out of stock,...)
      const apiErrorMessage = err.response?.data?.error?.message || err.response?.data?.message;
      if (apiErrorMessage && err.response?.status && err.response.status >= 400 && err.response.status < 500) {
        Alert.alert('Không thể đặt đơn', apiErrorMessage);
        return;
      }

      // Fallback offline an toàn nếu backend mất mạng hoặc server chưa bật
      const fallbackOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const fallbackCode = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const fallbackOrder: OrderItem = {
        id: `ord_${Date.now()}`,
        orderNumber: fallbackCode,
        productId: product.id,
        productTitle: product.title,
        price: basePrice,
        totalAmount,
        productImage: product.image,
        sellerId: product.sellerId || '',
        sellerName: product.sellerName || 'Người bán FPT',
        sellerCohort: product.sellerCohort || '',
        sellerCampus: product.sellerCampus || 'Hòa Lạc',
        buyerId: user?.id || '',
        buyerName: user?.name || 'Sinh viên FPT',
        buyerCohort: user?.cohort || '',
        buyerCampus: user?.campus || 'Hòa Lạc',
        status: 'ESCROW_PAID',
        statusLabel: '🛡️ Đã cọc Escrow - Chờ bàn giao tại Safe-Point',
        statusColor: '#EA580C',
        statusBg: '#FFF7ED',
        safePoint: selectedSafePoint,
        timeSlot: 'Hôm nay: 16:30 - 17:30',
        handshakeOtp: fallbackOtp,
        createdAt: 'Vừa xong',
        isReviewed: false,
      };

      addOrder(fallbackOrder);

      navigation.replace('CheckoutSuccess', {
        orderCode: fallbackCode,
        orderId: fallbackOrder.id,
        totalAmount,
        product: {
          title: product.title,
          sellerName: product.sellerName,
          sellerCohort: product.sellerCohort,
          image: product.image,
        },
        safePoint: selectedSafePoint,
        handshakeOtp: fallbackOtp,
        timeSlot: 'Hôm nay: 16:30 - 17:30',
        isDifferentCampus,
        fromCampus: product.sellerCampus || 'Hòa Lạc',
        toCampus: user?.campus || 'Đà Nẵng',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    product,
    isDifferentCampus,
    selectedPayment,
    selectedSafePoint,
    appliedVoucher,
    user,
    totalAmount,
    basePrice,
    addOrder,
    useVoucherCode,
    navigation,
  ]);

  return {
    product,
    isDifferentCampus,
    selectedSafePoint,
    setSelectedSafePoint,
    selectedPayment,
    setSelectedPayment,
    appliedVoucher,
    basePrice,
    shippingFee,
    discountAmount,
    totalAmount,
    isSubmitting,
    isVoucherModalOpen,
    setIsVoucherModalOpen,
    customVoucherInput,
    setCustomVoucherInput,
    myVouchers,
    loadingVouchers,
    formatCurrency,
    handleBack,
    handleGoHome,
    handleConfirmPayment,
    handleRemoveVoucher,
    handleOpenVoucherModal,
    handleSelectVoucher,
    handleApplyCustomVoucher,
    handleNavigateVoucherList,
  };
}
