import { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { useVoucherStore } from '../../../stores/voucherStore';
import { orderMobileService } from '../../../services/orderMobileService';
import { paymentMobileService } from '../../../services/paymentMobileService';
import { fromBackendCampus } from '../../../lib/backendMappers';
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

  // Product passed from ProductDetail or Chat
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

  const isDifferentCampus = route.params?.isDifferentCampus ?? (product.isDifferentCampus ?? false);
  const typeParam = route.params?.type; // 'meetup' | 'shipping'
  const isMeetup = typeParam === 'meetup' || (!typeParam && !isDifferentCampus);

  // Negotiated price agreed in Chat P2P
  const rawAgreed = route.params?.agreedPrice || route.params?.offerPrice;
  const agreedPrice = useMemo(() => {
    if (!rawAgreed) return null;
    const num = typeof rawAgreed === 'number' ? rawAgreed : parseInt(String(rawAgreed).replace(/\D/g, ''), 10);
    return isNaN(num) ? null : num;
  }, [rawAgreed]);

  const basePrice = typeof product.price === 'number' ? product.price : 1450000;
  const isAgreedPriceApplied = Boolean(agreedPrice && agreedPrice > 0 && agreedPrice < basePrice);
  const effectiveProductPrice = isAgreedPriceApplied ? (agreedPrice as number) : basePrice;

  // Safe-Point & Appointment States
  const [selectedSafePoint, setSelectedSafePoint] = useState(
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

  // Payment method & vouchers
  const [selectedPayment, setSelectedPayment] = useState<'vietqr' | 'fptpay' | 'cash'>('fptpay');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title?: string;
  } | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [customVoucherInput, setCustomVoucherInput] = useState('');

  // Tự động gợi ý voucher Freeship cho đơn liên campus nếu chưa chọn và trong ví có mã
  useEffect(() => {
    if (!isMeetup && !appliedVoucher && myVouchers.length > 0) {
      const shipVoucher = myVouchers.find(
        (v) =>
          v.status === 'UNUSED' &&
          (v.voucher.partner === 'CAMPUS_SHIP' ||
            v.voucher.partner === 'OTHER' ||
            v.voucher.title?.toLowerCase().includes('ship') ||
            v.voucher.title?.toLowerCase().includes('vận chuyển'))
      );
      if (shipVoucher) {
        setAppliedVoucher({
          code: shipVoucher.voucherCode,
          discount: shipVoucher.voucher.discountValue,
          title: shipVoucher.voucher.title,
        });
      }
    }
  }, [isMeetup, myVouchers, appliedVoucher]);

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
  const shippingFee = isMeetup ? 0 : 30000;
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

    // Kiểm tra trong danh sách Voucher khả dụng của người dùng
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

    Alert.alert('Không tìm thấy', 'Mã voucher không tồn tại trong ví của bạn hoặc đã hết hạn sử dụng.');
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
            // Người dùng chưa thanh toán hoặc bấm Hủy: tự động hủy đơn nháp để không sinh đơn rác và tin nhắn ảo
            try {
              await orderMobileService.cancelOrder(
                createdOrder.id,
                'Người mua đóng trình duyệt PayOS khi chưa hoàn tất thanh toán'
              );
            } catch (cancelErr) {
              console.log('Cancel pending draft error:', cancelErr);
            }

            Alert.alert(
              'Giao dịch chưa thanh toán',
              'Bạn vừa đóng cổng PayOS mà chưa hoàn tất chuyển khoản. Đơn hàng chưa được tạo để bảo vệ tài khoản của bạn. Bạn có thể chọn lại phương thức thanh toán hoặc thử lại.',
              [{ text: 'Đã hiểu' }]
            );
            return;
          }

          // Đã thanh toán thành công qua PayOS: Cập nhật đơn sang ESCROW_PAID
          finalizedOrder = {
            ...createdOrder,
            status: 'ESCROW_PAID',
            statusLabel: '🛡️ Quỹ Escrow FPT đang bảo lãnh',
          };
        } catch (browserError) {
          console.error('Could not open PayOS checkout URL', browserError);
          Alert.alert('Lỗi cổng thanh toán', 'Không thể mở cổng thanh toán PayOS. Vui lòng thử lại sau.');
          return;
        }
      }

      // Lưu đơn vào local store sau khi đã thanh toán (hoặc khi chọn tiền mặt)
      addOrder(finalizedOrder);

      if (appliedVoucher?.code) {
        applyVoucherCode(appliedVoucher.code).catch(() => {});
      }

      const formattedSlot = `${appointmentSlot} • ${appointmentDate === 'today' ? 'Hôm nay' : 'Ngày mai'}`;

      // Điều hướng tới CheckoutSuccess
      navigation.navigate('CheckoutSuccess', {
        orderCode: finalizedOrder.orderNumber,
        orderId: finalizedOrder.id,
        totalAmount,
        product: {
          title: product.title,
          sellerName: product.sellerName || finalizedOrder.sellerName,
          sellerCohort: product.sellerCohort || finalizedOrder.sellerCohort,
          image: product.image || finalizedOrder.productImage,
        },
        safePoint: selectedSafePoint,
        handshakeOtp: finalizedOrder.handshakeOtp,
        timeSlot: finalizedOrder.timeSlot || formattedSlot,
        isDifferentCampus,
        fromCampus: product.sellerCampus || 'Hòa Lạc',
        toCampus: buyerCampus,
        paymentPending: false,
        paymentCheckoutUrl: finalizedOrder.paymentCheckoutUrl,
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
