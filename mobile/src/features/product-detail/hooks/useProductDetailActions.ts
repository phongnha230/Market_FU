import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { toBackendCampus } from '../../../lib/backendMappers';

export function useProductDetailActions(
  product: any,
  onGoBack?: () => void
) {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useUserStore();

  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const isSeller = user?.role === 'SELLER';
  const isVerified = Boolean(
    isAuthenticated &&
      (user?.isKycVerified || user?.kycStatus === 'APPROVED' || isSeller) &&
      user?.kycStatus !== 'PENDING' &&
      user?.kycStatus !== 'REJECTED'
  );

  const isSameCampus = useMemo(() => {
    if (!user?.campus || !product?.campus) return true;
    const uCampus = toBackendCampus(user.campus);
    const pCampus = toBackendCampus(product.campus);
    if (!uCampus || !pCampus) {
      return user.campus.trim().toLowerCase() === product.campus.trim().toLowerCase();
    }
    return uCampus === pCampus;
  }, [user?.campus, product?.campus]);

  const isOwnProduct = useMemo(() => {
    if (!user) return false;
    const myId = String(user.id || (user as any)?._id || '');
    const myName = String(user.name || '').trim().toLowerCase();
    const sId = String(product?.sellerId || product?.seller?.id || (product?.seller as any)?._id || '');
    const sName = String(product?.sellerName || product?.seller?.name || '').trim().toLowerCase();
    return Boolean((myId && sId && myId === sId) || (myName && sName && myName === sName));
  }, [user, product?.sellerId, product?.sellerName, product?.seller]);

  const showKycRequiredAlert = useCallback((actionName: string) => {
    Alert.alert(
      'Yêu cầu Xác thực Thẻ Sinh Viên',
      `Theo quy chế an toàn cộng đồng Market FU, bạn cần xác thực Thẻ Sinh Viên FPT (KYC) để ${actionName}.\n\nBạn có muốn nộp ảnh thẻ SV để xác thực ngay không?`,
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

  const handleViewSellerProfile = useCallback(() => {
    if (!checkActionEligibility('xem hồ sơ và shop của người bán')) return;
    navigation.navigate('PublicSellerProfile', {
      userId: product.seller?.id || product.sellerId || '',
      sellerName: product.seller?.name || product.sellerName || '',
    });
  }, [checkActionEligibility, navigation, product]);

  const handleOpenBuyNow = useCallback((mode?: 'meetup' | 'shipping') => {
    if (isOwnProduct) {
      Alert.alert('Không thể đặt mua', 'Theo quy chế cộng đồng Market FU, bạn không thể tự đặt mua sản phẩm của chính mình.');
      return;
    }
    if (!checkActionEligibility('đặt cọc giao dịch ký quỹ Escrow')) return;

    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 1450000;

    const finalMode = mode || (isSameCampus ? 'meetup' : 'shipping');

    navigation.navigate('Checkout', {
      product: {
        id: product.id,
        title: product.title,
        price: numericPrice,
        priceStr: (product.priceStr || numericPrice.toLocaleString('vi-VN')) + 'đ',
        image: product.images?.[0] || product.image,
        sellerName: product.seller?.name || product.sellerName || 'Người bán FPT',
        sellerMajor: product.seller?.major || product.sellerCohort || 'K17 FPT',
        sellerCampus: product.campus || (isSameCampus ? 'Cơ sở Hòa Lạc' : 'Cơ sở khác'),
        sellerId: product.seller?.id || product.sellerId || '',
      },
      isDifferentCampus: finalMode === 'shipping' || !isSameCampus,
      type: finalMode,
      safePoint: product.safePointInfo?.name || product.safePoint,
    });
  }, [checkActionEligibility, navigation, product, isSameCampus]);

  const handleOpenChat = useCallback(() => {
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Đây là sản phẩm của chính bạn.');
      return;
    }
    if (!checkActionEligibility('nhắn tin trao đổi với người bán')) return;

    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 1450000;

    navigation.navigate('ChatDetail', {
      partner: {
        id: product.seller?.id || product.sellerId || 'partner',
        name: product.seller?.name || product.sellerName || 'Người bán FPT',
        avatar: product.seller?.avatarUrl || product.seller?.avatar || product.sellerAvatar || '',
        cohort: product.seller?.major || product.sellerCohort || 'K16 - SE',
        isOnline: true,
      },
      product: {
        id: product.id,
        title: product.title,
        price: (product.priceStr || numericPrice.toLocaleString('vi-VN')) + 'đ',
        originalPrice: numericPrice,
        campus: product.campus,
        sellerCampus: product.campus,
        isDifferentCampus: !isSameCampus,
        sellerName: product.seller?.name || product.sellerName || 'Người bán FPT',
        sellerCohort: product.seller?.major || product.sellerCohort || 'K16 - SE',
        sellerId: product.seller?.id || product.sellerId || '',
        image: product.images?.[0] || product.image,
      },
    });
  }, [checkActionEligibility, navigation, product, isSameCampus]);

  const handleOpenOfferModal = useCallback(() => {
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Bạn không thể tự trả giá sản phẩm của chính mình.');
      return;
    }
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
    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 1450000;

    navigation.navigate('ChatDetail', {
      partner: {
        id: product.seller?.id || product.sellerId || 'partner',
        name: product.seller?.name || product.sellerName || 'Người bán FPT',
        avatar: product.seller?.avatarUrl || product.seller?.avatar || product.sellerAvatar || '',
        cohort: product.seller?.major || product.sellerCohort || 'K16 - SE',
        isOnline: true,
      },
      product: {
        id: product.id,
        title: product.title,
        price: (product.priceStr || numericPrice.toLocaleString('vi-VN')) + 'đ',
        originalPrice: numericPrice,
        campus: product.campus,
        sellerCampus: product.campus,
        isDifferentCampus: !isSameCampus,
        sellerName: product.seller?.name || product.sellerName || 'Người bán FPT',
        sellerCohort: product.seller?.major || product.sellerCohort || 'K16 - SE',
        sellerId: product.seller?.id || product.sellerId || '',
        image: product.images?.[0] || product.image,
      },
      initialOffer: {
        offeredPrice,
        message,
        originalPrice: numericPrice,
      },
    });
  }, [navigation, product, isSameCampus]);

  return {
    isOfferModalVisible,
    isReportModalVisible,
    isSameCampus,
    isOwnProduct,
    handleBack,
    handleGoHome,
    handleViewSellerProfile,
    handleOpenBuyNow,
    handleOpenChat,
    handleOpenOfferModal,
    handleCloseOfferModal,
    handleOpenReport,
    handleCloseReport,
    handleSubmitOffer,
  };
}
