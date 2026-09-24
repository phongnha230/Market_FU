import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductDetailHeader from '../components/ProductDetailHeader';
import ProductGallery from '../components/ProductGallery';
import ProductInfoCard from '../components/ProductInfoCard';
import ProductSpecSection from '../components/ProductSpecSection';
import ProductSellerSafePoint from '../components/ProductSellerSafePoint';
import ProductBottomBar from '../components/ProductBottomBar';
import useProductDetail from '../hooks/useProductDetail';
import { ProductDetailScreenProps } from '../types/product-detail.types';

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  onGoBack,
  productId,
}) => {
  const insets = useSafeAreaInsets();
  const {
    product,
    currentImageIndex,
    setCurrentImageIndex,
    isSaved,
    handleToggleFavorite,
    handleBuyNow,
    handleChat,
  } = useProductDetail(productId);

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

      <ProductBottomBar onChat={handleChat} onBuyNow={handleBuyNow} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
});

export default ProductDetailScreen;
