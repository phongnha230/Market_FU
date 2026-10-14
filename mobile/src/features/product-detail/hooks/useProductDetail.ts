import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { DEFAULT_PRODUCT_DETAIL, RELATED_PRODUCTS } from '../constants/product-detail.constants';
import { useFavoriteStore } from '../../../stores/useFavoriteStore';
import { useProductStore } from '../../../stores/productStore';
import { useUserStore } from '../../../stores/userStore';
import { ProductDetailData } from '../types/product-detail.types';

export const useProductDetail = (productId?: string) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { products } = useProductStore();
  const { user } = useUserStore();

  const product: ProductDetailData = useMemo(() => {
    const found = products.find((p) => p.id === productId);
    if (!found) return DEFAULT_PRODUCT_DETAIL;

    return {
      id: found.id,
      title: found.title,
      price: found.price.toLocaleString('vi-VN'),
      originalPrice: found.originalPrice ? found.originalPrice.toLocaleString('vi-VN') : undefined,
      discountBadge: found.originalPrice
        ? `-${Math.round((1 - found.price / found.originalPrice) * 100)}%`
        : undefined,
      conditionBadge: found.condition || 'Like New',
      location: `${found.campus} • ${found.safePoint || 'Safe-Point'}`,
      images: found.images && found.images.length > 0 ? found.images : DEFAULT_PRODUCT_DETAIL.images,
      specs: DEFAULT_PRODUCT_DETAIL.specs,
      description: found.description || DEFAULT_PRODUCT_DETAIL.description,
      campus: found.campus,
      sellerId: found.sellerId,
      sellerCohort: found.sellerCohort,
      status: found.status,
      isSoldOrReserved: found.status === 'SOLD' || found.status === 'RESERVED' || found.status === 'HIDDEN',
      seller: {
        id: found.sellerId,
        name: found.sellerName,
        avatarUrl: found.sellerAvatar || '',
        major: found.sellerCohort || 'K17 Kỹ thuật phần mềm',
        rating: `${found.sellerRating || 5.0} ★`,
        soldCount: 8,
        isVerified: found.sellerIsVerified ?? true,
      },
      safePointInfo: {
        name: found.safePoint || 'Safe-Handoff Sảnh Tòa Alpha',
        desc: 'Hỗ trợ bàn test cắm máy tính & đo nguồn điện trực tiếp có bảo vệ quan sát.',
      },
      hashtags: found.hashtags && found.hashtags.length > 0 ? found.hashtags : DEFAULT_PRODUCT_DETAIL.hashtags,
    };
  }, [productId, products]);

  const isSaved = isFavorite(product.id);

  const isOwnProduct = Boolean(
    user && (
      (user.id && (product.sellerId === user.id || product.seller?.id === user.id)) ||
      (user.name && product.seller?.name && user.name.trim().toLowerCase() === product.seller.name.trim().toLowerCase())
    )
  );

  const handleToggleFavorite = () => {
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Bạn không thể tự lưu sản phẩm do chính bạn đăng bán!');
      return;
    }
    toggleFavorite(product.id, product);
  };

  const handleBuyNow = () => {
    Alert.alert(
      '🛒 Đặt mua ngay',
      `Xác nhận thanh toán Escrow ${product.price}đ cho ${product.title}?\n\nTiền sẽ được giữ an toàn đến khi bạn nhận hàng tại Safe-Point.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận thanh toán',
          onPress: () =>
            Alert.alert('✅ Đặt hàng thành công!', 'Người bán đã được thông báo. Hẹn gặp tại Sảnh Tòa Alpha!'),
        },
      ]
    );
  };

  const handleChat = () => {
    Alert.alert(
      '💬 Hẹn Safe-Handoff',
      `Mở cuộc hội thoại với ${product.seller.name} để thỏa thuận thời gian gặp tại Safe-Point.`
    );
  };

  return {
    product,
    relatedProducts: RELATED_PRODUCTS,
    currentImageIndex,
    setCurrentImageIndex,
    isSaved,
    handleToggleFavorite,
    handleBuyNow,
    handleChat,
  };
};

export default useProductDetail;
