import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export function useCheckoutController() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Params passed from ProductDetail
  const product = useMemo(() => {
    return route.params?.product || {
      id: 'prod-escrow-1',
      title: 'Màn hình Dell 24" UltraSharp U2419H',
      price: 1450000,
      priceStr: '1.450.000đ',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
      sellerName: 'Nguyễn Văn Nam',
      sellerMajor: 'K16 - Kỹ thuật phần mềm',
      sellerCampus: 'TP. Hồ Chí Minh',
      isDifferentCampus: true,
    };
  }, [route.params?.product]);

  const isDifferentCampus = route.params?.isDifferentCampus ?? true;

  const [selectedSafePoint, setSelectedSafePoint] = useState(
    isDifferentCampus
      ? 'Sảnh KTX Dom A (Cơ sở Hòa Lạc - Nhận từ FPT Bus)'
      : 'Sảnh Tòa Alpha (Trạm Safe-Point có camera)'
  );
  const [selectedPayment, setSelectedPayment] = useState<'vietqr' | 'fptpay' | 'cash'>('fptpay');
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
    title?: string;
  } | null>({
    code: 'FPTK20WELCOME',
    discount: 30000,
    title: 'Chào đón tân sinh viên',
  });

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

  const handleConfirmPayment = useCallback(() => {
    Alert.alert(
      '🎉 Đặt cọc Escrow thành công!',
      `Đã thanh toán an toàn ${formatCurrency(totalAmount)}.\nSố tiền được giữ bảo lãnh tại hệ thống. Mã hẹn Safe-Point đã được tạo.`,
      [
        {
          text: 'Xem đơn hàng ngay',
          onPress: () => {
            navigation.replace('OrderDetail', {
              orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
              product: {
                ...product,
                price: basePrice,
                priceStr: formatCurrency(basePrice),
              },
              status: 'escrow_holding',
              totalAmount,
            });
          },
        },
      ]
    );
  }, [totalAmount, formatCurrency, navigation, product, basePrice]);

  const handleRemoveVoucher = useCallback(() => {
    setAppliedVoucher(null);
  }, []);

  const handleOpenVoucherModal = useCallback(() => {
    Alert.alert('Mã giảm giá', 'Bạn đang áp dụng mã FPTK20WELCOME giảm 30.000đ.');
  }, []);

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
    formatCurrency,
    handleBack,
    handleGoHome,
    handleConfirmPayment,
    handleRemoveVoucher,
    handleOpenVoucherModal,
  };
}
