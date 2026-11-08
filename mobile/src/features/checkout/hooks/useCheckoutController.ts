import { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { useVoucherStore } from '../../../stores/voucherStore';
import { useProductStore } from '../../../stores/productStore';
import { orderMobileService } from '../../../services/orderMobileService';
import { paymentMobileService } from '../../../services/paymentMobileService';
import { productMobileService } from '../../../services/productMobileService';
import { fromBackendCampus, toBackendCampus } from '../../../lib/backendMappers';
import * as WebBrowser from 'expo-web-browser';

export function useCheckoutController() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, isAuthenticated } = useUserStore();
  const { myVouchers, isLoading: loadingVouchers, fetchVouchers, applyVoucherCode } = useVoucherStore();
  const addOrder = useOrderStore((s) => s.addOrder);

  const buyerCampus = useMemo(() => fromBackendCampus(user?.campus) || 'Hòa Lạc', [user?.campus]);

  // Fetch available user vouchers on mount
  useEffect(() => {
    fetchVouchers().catch(() => {});
  }, [fetchVouchers]);

  const [fetchedProductMeta, setFetchedProductMeta] = useState<any>(null);

  // Product passed from ProductDetail or Chat
  const rawRouteProduct = route.params?.product;
  useEffect(() => {
    const prodId = rawRouteProduct?.id;
    if (!prodId) return;
    if ((rawRouteProduct?.campus || rawRouteProduct?.sellerCampus) && typeof rawRouteProduct?.originalPrice === 'number') {
      return;
    }

    let active = true;
    productMobileService
      .getProductById(prodId)
      .then((item) => {
        if (active && item) {
          setFetchedProductMeta(item);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [rawRouteProduct?.id, rawRouteProduct?.campus, rawRouteProduct?.sellerCampus, rawRouteProduct?.originalPrice]);

  const product = useMemo(() => {
    const base = rawRouteProduct || {
      id: '',
      title: 'Sản phẩm giao dịch',
      price: 0,
      priceStr: '0đ',
      image: undefined,
      sellerName: 'Người bán FPT',
      sellerMajor: '',
      sellerCohort: '',
      sellerCampus: 'Hòa Lạc',
      isDifferentCampus: false,
    };
    const mergedSellerCampus =
      base.sellerCampus || base.campus || fetchedProductMeta?.campus || 'Hòa Lạc';
    return {
      ...base,
      campus: base.campus || mergedSellerCampus,
      sellerCampus: fromBackendCampus(mergedSellerCampus) || mergedSellerCampus,
      originalPrice:
        typeof base.originalPrice === 'number' && base.originalPrice > 0
          ? base.originalPrice
          : typeof fetchedProductMeta?.price === 'number' && fetchedProductMeta.price > 0
          ? fetchedProductMeta.price
          : undefined,
    };
  }, [rawRouteProduct, fetchedProductMeta]);

  const rawSellerCampus = rawRouteProduct?.sellerCampus || rawRouteProduct?.campus || fetchedProductMeta?.campus;
  const sellerCampusBackend = toBackendCampus(rawSellerCampus || product.sellerCampus || product.campus) || 'HOL';
  const buyerCampusBackend = toBackendCampus(user?.campus) || 'HOL';

  const isDifferentCampus = Boolean(
    route.params?.isDifferentCampus ??
      rawRouteProduct?.isDifferentCampus ??
      (route.params?.type === 'shipping' ||
        (rawSellerCampus && user?.campus && sellerCampusBackend !== buyerCampusBackend))
  );
  const typeParam = route.params?.type; // 'meetup' | 'shipping'
  const isMeetup = typeParam ? typeParam === 'meetup' && !isDifferentCampus : !isDifferentCampus;

  // Negotiated price agreed in Chat P2P
  const rawAgreed = route.params?.agreedPrice || route.params?.offerPrice;
  const agreedPrice = useMemo(() => {
    if (!rawAgreed) return null;
    const num = typeof rawAgreed === 'number' ? rawAgreed : parseInt(String(rawAgreed).replace(/\D/g, ''), 10);
    return isNaN(num) || num <= 0 ? null : num;
  }, [rawAgreed]);

  const parsedProductPrice = useMemo(() => {
    if (typeof product.price === 'number' && product.price > 0) return product.price;
    if (typeof product.price === 'string') {
      const parsed = parseInt(product.price.replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1450000;
  }, [product.price]);

  const basePrice =
    typeof product.originalPrice === 'number' && product.originalPrice > 0
      ? product.originalPrice
      : parsedProductPrice;

  const isAgreedPriceApplied = Boolean(
    agreedPrice &&
      agreedPrice > 0 &&
      (agreedPrice < basePrice || Boolean(route.params?.agreedPrice || route.params?.offerPrice))
  );
  const effectiveProductPrice = isAgreedPriceApplied ? (agreedPrice as number) : parsedProductPrice;

  // Safe-Point & Appointment States
  const [selectedSafePoint, setSelectedSafePoint] = useState<string>(
    route.params?.safePoint ||
      (isMeetup
        ? 'Sảnh Tòa Alpha (Khu vực có bàn test & Camera 24/7)'
        : 'Sảnh KTX Dom A (Cơ sở Hòa Lạc - Nhận từ FPT Bus)')
  );
  const [appointmentDate, setAppointmentDate] = useState<'today' | 'tomorrow'>('today');
  const [appointmentSlot, setAppointmentSlot] = useState<string>('16:30 - 17:15 (Chiều ca 4)');
  const [deliveryNote, setDeliveryNote] = useState<string>(
    isMeetup
      ? 'Hẹn gặp test máy trực tiếp tại bàn Safe-Point'
      : 'Phòng 402, Dom B, KTX FPT (Nhận buổi chiều)'
  );

  // Tự động đồng bộ địa chỉ mặc định nếu phát hiện đơn Liên Campus sau khi fetch chi tiết sản phẩm
  useEffect(() => {
    if (!isMeetup && !route.params?.safePoint) {
      setSelectedSafePoint((prev: string) =>
        prev.includes('Sảnh Tòa Alpha')
          ? `Sảnh KTX Dom A (Cơ sở ${buyerCampus} - Nhận từ FPT Bus)`
          : prev
      );
      setDeliveryNote((prev: string) =>
        prev === 'Hẹn gặp test máy trực tiếp tại bàn Safe-Point'
          ? 'Phòng 402, Dom B, KTX FPT (Nhận buổi chiều)'
          : prev
      );
    }
  }, [isMeetup, buyerCampus, route.params?.safePoint]);

  // Payment method & vouchers
  const [selectedPayment, setSelectedPayment] = useState<'vietqr' | 'fptpay' | 'cash'>('fptpay');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title?: string;
    minOrderValue?: number;
  } | null>(null);
  const [isVoucherManuallyRemoved, setIsVoucherManuallyRemoved] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [customVoucherInput, setCustomVoucherInput] = useState('');

  // Tự động gợi ý voucher Freeship cho đơn liên campus nếu chưa chọn và trong ví có mã
  useEffect(() => {
    if (!isMeetup && !appliedVoucher && !isVoucherManuallyRemoved && myVouchers.length > 0) {
      const shipVoucher = myVouchers.find(
        (v) =>
          v.status === 'UNUSED' &&
          (v.voucher.partner === 'CAMPUS_SHIP' ||
            v.voucher.partner === 'OTHER' ||
            v.voucher.title?.toLowerCase().includes('ship') ||
            v.voucher.title?.toLowerCase().includes('vận chuyển')) &&
          effectiveProductPrice >= (v.voucher.minOrderValue || 0)
      );
      if (shipVoucher) {
        setAppliedVoucher({
          code: shipVoucher.voucherCode,
          discount: shipVoucher.voucher.discountValue,
          title: shipVoucher.voucher.title,
          minOrderValue: shipVoucher.voucher.minOrderValue || 0,
        });
      }
    }
  }, [isMeetup, myVouchers, appliedVoucher, effectiveProductPrice, isVoucherManuallyRemoved]);

  // KYC verification check
  const isEduEmail = Boolean(
    user?.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    user?.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isKycVerified = Boolean(
    isEduEmail ||
    user?.kycStatus === 'APPROVED' ||
    (user?.kycStatus as string) === 'approved_student' ||
    (user?.kycStatus as string) === 'approved_seller' ||
    user?.isKycVerified
  );
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  // FPT Coins discount
  const userCoins = typeof user?.coins === 'number' ? user.coins : 50;
  const [useCoinDiscount, setUseCoinDiscount] = useState(false);
  const maxCoinsAllowed = Math.min(50, userCoins, Math.floor((effectiveProductPrice * 0.1) / 1000));
  const coinDiscountAmount = useCoinDiscount && maxCoinsAllowed > 0 ? maxCoinsAllowed * 1000 : 0;

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pricing calculations
  // Bảng cước vận chuyển chuẩn hóa 5 campus FPT (đồng bộ 100% với backend/src/modules/orders/shipping-matrix.ts)
  const CAMPUS_RATES: Record<string, Record<string, number>> = {
    HOL: { HOL: 10000, DAD: 30000, QN: 35000, HCM: 40000, CT: 45000 },
    DAD: { HOL: 30000, DAD: 10000, QN: 20000, HCM: 30000, CT: 35000 },
    QN:  { HOL: 35000, DAD: 20000, QN: 10000, HCM: 25000, CT: 30000 },
    HCM: { HOL: 40000, DAD: 30000, QN: 25000, HCM: 10000, CT: 20000 },
    CT:  { HOL: 45000, DAD: 35000, QN: 30000, HCM: 20000, CT: 10000 },
  };

  const shippingFee = isMeetup
    ? 0
    : (CAMPUS_RATES[sellerCampusBackend]?.[buyerCampusBackend] ?? (isDifferentCampus ? 35000 : 10000));
  const isShippingVoucher = Boolean(
    appliedVoucher &&
      (appliedVoucher.title?.toLowerCase().includes('vận chuyển') ||
        appliedVoucher.title?.toLowerCase().includes('ship') ||
        appliedVoucher.code?.toUpperCase().includes('SHIP'))
  );
  const voucherDiscount = appliedVoucher
    ? (isShippingVoucher ? Math.min(shippingFee, appliedVoucher.discount) : appliedVoucher.discount)
    : 0;
  const effectiveShippingFee = isMeetup ? 0 : Math.max(0, shippingFee - (isShippingVoucher ? voucherDiscount : 0));
  const productVoucherDiscount = !isShippingVoucher ? voucherDiscount : 0;
  const totalAmount = Math.max(0, effectiveProductPrice + effectiveShippingFee - productVoucherDiscount - coinDiscountAmount);

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
    setIsVoucherManuallyRemoved(true);
  }, []);

  const handleOpenVoucherModal = useCallback(() => {
    setIsVoucherModalOpen(true);
  }, []);

  const handleSelectVoucher = useCallback(
    (voucher: { code: string; discount: number; title?: string; minOrderValue?: number } | null) => {
      if (voucher && voucher.minOrderValue && effectiveProductPrice < voucher.minOrderValue) {
        Alert.alert(
          'Chưa đủ điều kiện',
          `Voucher này yêu cầu đơn hàng từ ${formatCurrency(voucher.minOrderValue)} trở lên (Đơn hiện tại: ${formatCurrency(effectiveProductPrice)}).`
        );
        return;
      }
      setAppliedVoucher(voucher);
      setIsVoucherManuallyRemoved(false);
      setIsVoucherModalOpen(false);
    },
    [effectiveProductPrice, formatCurrency]
  );

  const handleApplyCustomVoucher = useCallback(() => {
    const code = customVoucherInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã giảm giá.');
      return;
    }

    // Kiểm tra trong danh sách Voucher khả dụng của người dùng
    const matched = myVouchers.find((v) => v.voucherCode.toUpperCase() === code && v.status === 'UNUSED');
    if (matched) {
      const minOrder = matched.voucher.minOrderValue || 0;
      if (minOrder > 0 && effectiveProductPrice < minOrder) {
        Alert.alert(
          'Chưa đủ điều kiện',
          `Voucher "${matched.voucher.title}" chỉ áp dụng cho đơn hàng từ ${formatCurrency(minOrder)} trở lên (Đơn hiện tại: ${formatCurrency(effectiveProductPrice)}).`
        );
        return;
      }
      setAppliedVoucher({
        code: matched.voucherCode,
        discount: matched.voucher.discountValue,
        title: matched.voucher.title,
        minOrderValue: minOrder,
      });
      setIsVoucherManuallyRemoved(false);
      setIsVoucherModalOpen(false);
      setCustomVoucherInput('');
      Alert.alert('Thành công', `Đã áp dụng ${matched.voucher.title}!`);
      return;
    }

    Alert.alert('Không tìm thấy', 'Mã voucher không tồn tại trong ví của bạn hoặc đã hết hạn sử dụng.');
  }, [customVoucherInput, myVouchers, effectiveProductPrice, formatCurrency]);

  const handleNavigateVoucherList = useCallback(() => {
    setIsVoucherModalOpen(false);
    navigation.navigate('Voucher');
  }, [navigation]);

  const handleConfirmPayment = useCallback(async () => {
    if (isSubmitting) return;

    if (!product?.id) {
      Alert.alert('Không thể đặt đơn', 'Không tìm thấy thông tin sản phẩm cần thanh toán. Vui lòng quay lại.');
      return;
    }

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

    // Prevent Self-Buy
    const isOwner = Boolean(
      user && (
        (user.id && product.sellerId && user.id === product.sellerId) ||
        (user.email && product.sellerEmail && user.email.toLowerCase() === product.sellerEmail.toLowerCase()) ||
        (user.name && product.sellerName && user.name.trim().toLowerCase() === product.sellerName.trim().toLowerCase())
      )
    );
    if (isOwner) {
      Alert.alert('Không thể đặt đơn', 'Bạn không thể tự mua sản phẩm do chính bạn đăng bán!');
      return;
    }

    // KYC Gating
    if (!isKycVerified) {
      Alert.alert(
        'Yêu cầu Xác thực Thẻ SV',
        'Vui lòng xác thực thẻ sinh viên FPT để đặt đơn Safe-Handoff và kích hoạt bảo hiểm hoàn tiền 48h FPT Care!',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Xác thực ngay', onPress: () => setIsKycModalOpen(true) },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Construct appointment ISO string
      let appointmentIso: string | undefined = undefined;
      if (isMeetup) {
        const targetDate = new Date();
        if (appointmentDate === 'tomorrow') {
          targetDate.setDate(targetDate.getDate() + 1);
        }
        const hourMatch = appointmentSlot.match(/(\d{1,2}):(\d{2})/);
        if (hourMatch) {
          targetDate.setHours(parseInt(hourMatch[1], 10), parseInt(hourMatch[2], 10), 0, 0);
        } else {
          targetDate.setHours(16, 30, 0, 0);
        }
        appointmentIso = targetDate.toISOString();
      }

      const orderType = isMeetup ? 'MEETUP' : 'SHIP_COD';
      const createdOrder = await orderMobileService.createOrder({
        productId: product.id,
        orderType,
        paymentMethod: selectedPayment === 'vietqr' ? 'VIETQR' : selectedPayment === 'fptpay' ? 'PAYOS_WEB' : 'CASH',
        safePoint: selectedSafePoint,
        meetupLocation: isMeetup ? selectedSafePoint : undefined,
        appointmentTime: appointmentIso,
        deliveryNote,
        coinsUsed: useCoinDiscount ? maxCoinsAllowed : 0,
        agreedPrice: isAgreedPriceApplied ? effectiveProductPrice : undefined,
        voucherCode: appliedVoucher?.code,
        isDifferentCampus,
        shipping: !isMeetup
          ? {
              receiverName: user?.name || 'Sinh viên FPT',
              receiverPhone: user?.phone || '0901234567',
              shippingAddress: selectedSafePoint,
              destinationCampus: user?.campus || 'HOL',
              shippingPartner: 'FPT Bus Handoff',
            }
          : undefined,
      });

      let finalizedOrder = createdOrder;
      let isPayOsPending = false;

      if (selectedPayment === 'fptpay') {
        if (!createdOrder.paymentCheckoutUrl) {
          Alert.alert('PayOS chưa sẵn sàng', 'Backend không trả về liên kết thanh toán PayOS. Đơn chưa được tạo.');
          return;
        }

        try {
          // Mở cổng thanh toán PayOS trên trình duyệt an toàn
          await WebBrowser.openBrowserAsync(createdOrder.paymentCheckoutUrl);

          // Sau khi người dùng chuyển tiền hoặc đóng browser, kiểm tra trạng thái thực tế từ backend
          const payStatus = await paymentMobileService.checkPaymentStatus(createdOrder.orderNumber || createdOrder.id);

          if (!payStatus.isPaid && payStatus.status !== 'PAID') {
            // Không tự động hủy đơn nháp nữa!
            // Đơn hàng được giữ PENDING trong 15 phút để sinh viên có thể chuyển khoản/mở lại bất kỳ lúc nào.
            isPayOsPending = true;
            finalizedOrder = {
              ...createdOrder,
              status: 'PENDING_SAFEPOINT',
              statusLabel: '⏳ Chờ thanh toán PayOS (15 phút)',
            };
          } else {
            // Đã thanh toán thành công qua PayOS: Cập nhật đơn đã cọc Escrow, đang chờ người bán xác nhận
            finalizedOrder = {
              ...createdOrder,
              status: 'PENDING_SAFEPOINT',
              statusLabel: '🛡️ Đã cọc Escrow • Chờ người bán xác nhận',
              isPaid: true,
            };
          }
        } catch (browserError) {
          console.error('Could not open PayOS checkout URL', browserError);
          Alert.alert('Lỗi cổng thanh toán', 'Không thể mở cổng thanh toán PayOS. Vui lòng thử lại sau.');
          return;
        }
      }

      // Lưu đơn vào local store sau khi đã thanh toán (hoặc khi chọn tiền mặt)
      addOrder(finalizedOrder);
      useOrderStore.getState().fetchOrders().catch(() => {});
      if (product.id) {
        useProductStore.getState().updateProduct(product.id, { status: 'RESERVED' });
      }

      if (appliedVoucher?.code) {
        applyVoucherCode(appliedVoucher.code).catch(() => {});
      }

      const formattedSlot = `${appointmentSlot} • ${appointmentDate === 'today' ? 'Hôm nay' : 'Ngày mai'}`;

      const finalItemPrice = finalizedOrder.price || effectiveProductPrice;
      const finalTotalPayable = finalizedOrder.totalAmount || totalAmount;
      const resolvedSellerCampusName = fromBackendCampus(sellerCampusBackend) || product.sellerCampus || 'Hòa Lạc';

      // Điều hướng tới CheckoutSuccess
      navigation.navigate('CheckoutSuccess', {
        orderCode: finalizedOrder.orderNumber,
        orderId: finalizedOrder.id,
        totalAmount: finalTotalPayable,
        itemPrice: finalItemPrice,
        agreedPrice: isAgreedPriceApplied ? finalItemPrice : undefined,
        originalPrice: basePrice > finalItemPrice ? basePrice : undefined,
        shippingFee: effectiveShippingFee,
        voucherDiscount,
        coinDiscountAmount,
        paymentMethod: selectedPayment,
        product: {
          id: product.id,
          title: product.title,
          price: finalItemPrice,
          originalPrice: basePrice > finalItemPrice ? basePrice : undefined,
          priceStr: `${finalItemPrice.toLocaleString('vi-VN')}đ`,
          sellerName: product.sellerName || finalizedOrder.sellerName,
          sellerCohort: product.sellerCohort || finalizedOrder.sellerCohort,
          sellerCampus: resolvedSellerCampusName,
          image: product.image || finalizedOrder.productImage,
        },
        safePoint: selectedSafePoint,
        handshakeOtp: !isMeetup ? undefined : finalizedOrder.handshakeOtp,
        timeSlot: isMeetup
          ? (finalizedOrder.timeSlot || formattedSlot)
          : 'Dự kiến: 1 - 2 ngày (Đồng kiểm 48h tại KTX)',
        isDifferentCampus: !isMeetup || isDifferentCampus,
        fromCampus: resolvedSellerCampusName,
        toCampus: buyerCampus,
        paymentPending: isPayOsPending,
        paymentCheckoutUrl: finalizedOrder.paymentCheckoutUrl || createdOrder.paymentCheckoutUrl,
      });
    } catch (err: any) {
      console.log('⚠️ [createOrder error]:', err?.message);

      const apiErrorMessage = err.response?.data?.error?.message || err.response?.data?.message;
      if (selectedPayment === 'fptpay' || isAgreedPriceApplied) {
        Alert.alert(
          selectedPayment === 'fptpay' ? 'Không thể tạo thanh toán PayOS' : 'Không thể xác minh giá đã thương lượng',
          apiErrorMessage || 'Backend chưa xác nhận được đơn hàng. Vui lòng thử lại khi có kết nối.'
        );
        return;
      }
      
      Alert.alert(
        'Không thể đặt đơn',
        apiErrorMessage || err?.message || 'Có lỗi xảy ra khi tạo đơn hàng trên máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    isAuthenticated,
    user,
    product,
    isKycVerified,
    isMeetup,
    appointmentDate,
    appointmentSlot,
    selectedPayment,
    selectedSafePoint,
    deliveryNote,
    useCoinDiscount,
    maxCoinsAllowed,
    isAgreedPriceApplied,
    effectiveProductPrice,
    appliedVoucher,
    isDifferentCampus,
    addOrder,
    applyVoucherCode,
    navigation,
    totalAmount,
  ]);

  return {
    product,
    isDifferentCampus,
    isMeetup,
    agreedPrice,
    isAgreedPriceApplied,
    effectiveProductPrice,
    selectedSafePoint,
    setSelectedSafePoint,
    appointmentDate,
    setAppointmentDate,
    appointmentSlot,
    setAppointmentSlot,
    deliveryNote,
    setDeliveryNote,
    selectedPayment,
    setSelectedPayment,
    appliedVoucher,
    basePrice,
    shippingFee,
    discountAmount: voucherDiscount,
    userCoins,
    useCoinDiscount,
    setUseCoinDiscount,
    maxCoinsAllowed,
    coinDiscountAmount,
    totalAmount,
    isSubmitting,
    isVoucherModalOpen,
    setIsVoucherModalOpen,
    customVoucherInput,
    setCustomVoucherInput,
    myVouchers,
    loadingVouchers,
    isKycVerified,
    isKycModalOpen,
    setIsKycModalOpen,
    formatCurrency,
    handleBack,
    handleGoHome,
    handleConfirmPayment,
    handleRemoveVoucher,
    handleOpenVoucherModal,
    handleSelectVoucher,
    handleApplyCustomVoucher,
    handleNavigateVoucherList,
    buyerCampus,
  };
}
