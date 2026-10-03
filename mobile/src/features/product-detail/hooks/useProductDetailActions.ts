import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';

export function useProductDetailActions(
  product: any,
  onGoBack?: () => void
) {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useUserStore();

  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isSameCampus, setIsSameCampus] = useState(true);

  const isSeller = user?.role === 'SELLER';
  const isVerified = (user?.isKycVerified || isSeller) && user?.kycStatus !== 'PENDING';

  const isOwnProduct = useMemo(() => {
    if (!user || !product?.seller) return false;
    return Boolean(
      (product.seller.id && user.id === product.seller.id) ||
      (product.seller.name && user.name === product.seller.name) ||
      (isSeller && (product.seller.id === 'acc_seller' || product.seller.name === user.name))
    );
  }, [user, product?.seller, isSeller]);

  const showKycRequiredAlert = useCallback((actionName: string) => {
    Alert.alert(
      'Yêu cầu Xác thực Thẻ Sinh Viên',
      `Theo quy định an toàn chợ Market FU, bạn cần xác thực Thẻ Sinh Viên FPT (KYC) để ${actionName}.\n\nBạn có muốn đến trang Cá nhân để nộp ảnh thẻ SV ngay không?`,
      [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Xác thực ngay',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }),
        },
      ]
    );
  }, [navigation]);

  const checkActionEligibility = useCallback((actionName: string): boolean => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        `Vui lòng đăng nhập bằng tài khoản FPT để ${actionName}.`,
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return false;
    }
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Bạn không thể thao tác trên sản phẩm do chính mình đăng bán!');
      return false;
    }
    if (!isVerified) {
      showKycRequiredAlert(actionName);
      return false;
    }
    return true;
  }, [isAuthenticated, isOwnProduct, isVerified, navigation, showKycRequiredAlert]);

  const handleBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [onGoBack, navigation]);

  const handleGoHome = useCallback(() => {
    if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [navigation]);

  const handleOpenBuyNow = useCallback(() => {
    if (!checkActionEligibility('đặt cọc giao dịch ký quỹ Escrow')) return;

    navigation.navigate('Checkout', {
      product: {
        id: product.id,
        title: product.title,
        price: parseInt(product.price.replace(/\./g, ''), 10) || 1450000,
        priceStr: product.price + 'đ',
        image: product.images[0],
        sellerName: product.seller.name,
        sellerMajor: product.seller.major,
        sellerCampus: isSameCampus ? 'Cơ sở Hòa Lạc' : 'Cơ sở TP.HCM',
        sellerId: product.seller.id,
      },
      isDifferentCampus: !isSameCampus,
    });
  }, [checkActionEligibility, navigation, product, isSameCampus]);

  const handleOpenChat = useCallback(() => {
    if (!checkActionEligibility('nhắn tin trao đổi với người bán')) return;

    navigation.navigate('ChatDetail', {
      partner: {
        id: product.seller.id,
        name: product.seller.name,
        cohort: 'K16 - SE',
        isOnline: true,
      },
      product: {
        id: product.id,
        title: product.title,
        price: product.price + 'đ',
        image: product.images[0],
      },
    });
  }, [checkActionEligibility, navigation, product]);

  const handleOpenOfferModal = useCallback(() => {
    if (!checkActionEligibility('gửi đề xuất trả giá')) return;
    setIsOfferModalVisible(true);
  }, [checkActionEligibility]);

  const handleCloseOfferModal = useCallback(() => {
    setIsOfferModalVisible(false);
  }, []);

  const handleOpenReport = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để gửi báo cáo vi phạm.');
      return;
    }
    setIsReportModalVisible(true);
  }, [isAuthenticated]);

  const handleCloseReport = useCallback(() => {
    setIsReportModalVisible(false);
  }, []);

  const handleSubmitOffer = useCallback((offeredPrice: number, message: string) => {
    setIsOfferModalVisible(false);
    navigation.navigate('ChatDetail', {
      partner: {
        id: product.seller.id,
        name: product.seller.name,
        cohort: 'K16 - SE',
        isOnline: true,
      },
      product: {
        id: product.id,
        title: product.title,
        price: product.price + 'đ',
        image: product.images[0],
      },
      initialOffer: {
        offeredPrice,
        message,
        originalPrice: parseInt(product.price.replace(/\./g, ''), 10) || 1450000,
      },
    });
  }, [navigation, product]);

  const handleToggleSameCampus = useCallback(() => {
    setIsSameCampus((prev) => !prev);
  }, []);

  return {
    isOfferModalVisible,
    isReportModalVisible,
    isSameCampus,
    isOwnProduct,
    handleToggleSameCampus,
    handleBack,
    handleGoHome,
    handleOpenBuyNow,
    handleOpenChat,
    handleOpenOfferModal,
    handleCloseOfferModal,
    handleOpenReport,
    handleCloseReport,
    handleSubmitOffer,
  };
}
