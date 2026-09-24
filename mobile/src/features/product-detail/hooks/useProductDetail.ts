import { useState } from 'react';
import { Alert } from 'react-native';
import { DEFAULT_PRODUCT_DETAIL, RELATED_PRODUCTS } from '../constants/product-detail.constants';
import { useFavoriteStore } from '../../../stores/useFavoriteStore';

export const useProductDetail = (productId?: string) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const product = DEFAULT_PRODUCT_DETAIL;
  const isSaved = isFavorite(product.id);

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
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
