import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductDetailHeader from '../components/ProductDetailHeader';
import ProductGallery from '../components/ProductGallery';
import ProductInfoCard from '../components/ProductInfoCard';
import ProductSpecSection from '../components/ProductSpecSection';
import ProductSellerSafePoint from '../components/ProductSellerSafePoint';
import ProductDeliveryRouteCard from '../components/ProductDeliveryRouteCard';
import ProductRelatedSection from '../components/ProductRelatedSection';
import ProductBottomBar from '../components/ProductBottomBar';
import MakeOfferModal from '../components/MakeOfferModal';
import { ReportModal } from '../../report/components/ReportModal';
import useProductDetail from '../hooks/useProductDetail';
import { useProductDetailActions } from '../hooks/useProductDetailActions';
import { ProductDetailScreenProps } from '../types/product-detail.types';
import { useUserStore } from '../../../stores/userStore';
import { fromBackendCampus } from '../../../lib/backendMappers';

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  onGoBack,
  productId,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const activeProductId = productId || route.params?.productId;
  const { user } = useUserStore();

  const {
    product,
    currentImageIndex,
    setCurrentImageIndex,
    isSaved,
    handleToggleFavorite,
  } = useProductDetail(activeProductId);

  const actions = useProductDetailActions(product, onGoBack);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <ProductDetailHeader
        onGoBack={actions.handleBack}
        onGoHome={actions.handleGoHome}
        isSaved={isSaved}
        onToggleSaved={handleToggleFavorite}
        onOpenReport={actions.handleOpenReport}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProductGallery
          images={product.images}
          currentIndex={currentImageIndex}
          onIndexChange={setCurrentImageIndex}
        />
        <ProductInfoCard
          product={product}
          onPressHashtag={(tag) => {
            navigation.navigate('MainTabs', {
              screen: 'Home',
              params: { searchKeyword: `#${tag}` },
            });
          }}
        />
        <ProductSpecSection specs={product.specs} description={product.description} />
        <ProductDeliveryRouteCard
          isSameCampus={actions.isSameCampus}
          sellerCampus={product.campus ? fromBackendCampus(product.campus) : 'Hòa Lạc'}
          userCampus={user?.campus ? fromBackendCampus(user.campus) : 'Hòa Lạc'}
          safePointName={product.safePointInfo?.name}
        />
        <ProductSellerSafePoint
          seller={product.seller}
          safePointInfo={product.safePointInfo}
        />
        <ProductRelatedSection
          currentProductId={product.id}
          sellerId={product.sellerId}
          sellerName={product.seller.name}
          category={product.category || product.categoryType}
        />
      </ScrollView>

      <ProductBottomBar
        isSameCampus={actions.isSameCampus}
        onChat={actions.handleOpenChat}
        onMakeOffer={actions.handleOpenOfferModal}
        onBuyNow={actions.handleOpenBuyNow}
        isOwnProduct={actions.isOwnProduct}
        isSoldOrReserved={product.isSoldOrReserved}
        status={product.status}
        onManageOwnProduct={() =>
          navigation.navigate('EditListing', {
            productId: product.id,
            product,
          })
        }
      />

      <MakeOfferModal
        visible={actions.isOfferModalVisible}
        onClose={actions.handleCloseOfferModal}
        originalPrice={
          typeof product.price === 'number'
            ? product.price
            : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 1450000
        }
        productTitle={product.title}
        sellerName={product.seller.name}
        onSubmitOffer={actions.handleSubmitOffer}
      />

      <ReportModal
        visible={actions.isReportModalVisible}
        onClose={actions.handleCloseReport}
        targetType="PRODUCT"
        targetId={product.id}
        targetTitle={product.title}
      />
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 140 },
});
