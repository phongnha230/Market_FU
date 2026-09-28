import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductDetailHeader from '../components/ProductDetailHeader';
import ProductGallery from '../components/ProductGallery';
import ProductInfoCard from '../components/ProductInfoCard';
import ProductSpecSection from '../components/ProductSpecSection';
import ProductSellerSafePoint from '../components/ProductSellerSafePoint';
import ProductBottomBar from '../components/ProductBottomBar';
import ContextualAuthModal from '../components/ContextualAuthModal';
import ContextualChatAuthModal from '../components/ContextualChatAuthModal';
import useProductDetail from '../hooks/useProductDetail';
import { ProductDetailScreenProps } from '../types/product-detail.types';

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  onGoBack,
  productId,
}) => {
  const insets = useSafeAreaInsets();
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isChatAuthModalVisible, setIsChatAuthModalVisible] = useState(false);
  const {
    product,
    currentImageIndex,
    setCurrentImageIndex,
    isSaved,
    handleToggleFavorite,
  } = useProductDetail(productId);

  const handleOpenBuyNow = () => {
    setIsAuthModalVisible(true);
  };

  const handleOpenChat = () => {
    setIsChatAuthModalVisible(true);
  };

  const handleChatLoginSuccess = (method: 'google' | 'fap') => {
    setIsChatAuthModalVisible(false);
    const methodText = method === 'google' ? 'Google (@fpt.edu.vn)' : 'FAP / MSSV';
    Alert.alert(
      '💬 Kết nối trò chuyện thành công',
      `Đã xác thực qua ${methodText}!\n\nĐã mở luồng trò chuyện bảo mật với ${product.seller.name}. Vị trí trạm Safe-Handoff ${product.safePointInfo.name} đã được ghim sẵn trong khung chat.`,
      [
        {
          text: 'Vào khung chat',
          onPress: () => {
            // Sẵn sàng vào khung chat
          },
        },
      ]
    );
  };

  const handleLoginSuccess = (method: 'google' | 'fap') => {
    setIsAuthModalVisible(false);
    const methodText = method === 'google' ? 'Google (@fpt.edu.vn)' : 'FAP / MSSV';
    Alert.alert(
      '🛡️ Xác thực Escrow thành công',
      `Đã đăng nhập thành công qua ${methodText}!\n\nTiến hành đặt cọc giữ tiền Escrow cho "${product.title}" (${product.price}đ). Tiền chỉ được chuyển cho người bán sau khi bạn đồng kiểm hàng tại Safe-Point.`,
      [
        {
          text: 'Xác nhận cọc Escrow',
          onPress: () => {
            Alert.alert(
              '✅ Đặt hàng thành công!',
              'Mã hẹn giao dịch Safe-Point và mã QR bảo hộ đã được tạo trong mục Tin nhắn & Đơn hàng.'
            );
          },
        },
        { text: 'Để sau', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <ProductDetailHeader
        onGoBack={onGoBack}
        isSaved={isSaved}
        onToggleSaved={handleToggleFavorite}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProductGallery
          images={product.images}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
        />
        <ProductInfoCard product={product} />
        <ProductSpecSection specs={product.specs} description={product.description} />
        <ProductSellerSafePoint
          seller={product.seller}
          safePointInfo={product.safePointInfo}
        />
      </ScrollView>

      <ProductBottomBar onChat={handleOpenChat} onBuyNow={handleOpenBuyNow} />

      {/* Contextual Auth Modal khi bấm Mua ngay */}
      <ContextualAuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
        onLoginSuccess={handleLoginSuccess}
        product={{
          title: product.title,
          price: product.price + 'đ',
          sellerName: product.seller.name,
          sellerLocation: product.seller.major,
          image: product.images[0],
        }}
      />

      {/* Contextual Chat Auth Modal khi bấm Nhắn tin */}
      <ContextualChatAuthModal
        visible={isChatAuthModalVisible}
        onClose={() => setIsChatAuthModalVisible(false)}
        onLoginSuccess={handleChatLoginSuccess}
        sellerName={product.seller.name}
        sellerCohort="K16"
        product={{
          title: product.title,
          price: product.price + 'đ',
          location: product.location,
          image: product.images[0],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
});

export default ProductDetailScreen;
