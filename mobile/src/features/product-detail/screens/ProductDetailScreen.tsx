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
import ProductBottomBar from '../components/ProductBottomBar';
import MakeOfferModal from '../components/MakeOfferModal';
import { ReportModal } from '../../report/components/ReportModal';
import useProductDetail from '../hooks/useProductDetail';
import { useProductDetailActions } from '../hooks/useProductDetailActions';
import { ProductDetailScreenProps } from '../types/product-detail.types';

const DemoCampusSwitcherBar: React.FC<{
  isSameCampus: boolean;
  onToggle: () => void;
}> = React.memo(({ isSameCampus, onToggle }) => (
  <View style={styles.campusModeBar}>
    <View style={styles.campusModeLeft}>
      <Ionicons
        name={isSameCampus ? 'business' : 'airplane'}
        size={16}
        color={isSameCampus ? '#059669' : '#7C3AED'}
      />
      <Text style={styles.campusModeLabel}>
        Ngữ cảnh: {isSameCampus ? 'CÙNG CAMPUS (Hòa Lạc)' : 'KHÁC CAMPUS (Đà Nẵng)'}
      </Text>
    </View>
    <TouchableOpacity
      style={[styles.switchToggleBtn, !isSameCampus && styles.switchToggleBtnActive]}
      activeOpacity={0.8}
      onPress={onToggle}
    >
      <Text style={styles.switchToggleText}>
        {isSameCampus ? 'Đổi sang Khác cơ sở ›' : 'Đổi sang Cùng cơ sở ›'}
      </Text>
    </TouchableOpacity>
  </View>
));

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  onGoBack,
  productId,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const activeProductId = productId || route.params?.productId;

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

      <DemoCampusSwitcherBar
        isSameCampus={actions.isSameCampus}
        onToggle={actions.handleToggleSameCampus}
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
        <ProductSellerSafePoint
          seller={product.seller}
          safePointInfo={product.safePointInfo}
        />
      </ScrollView>

      <ProductBottomBar
        isSameCampus={actions.isSameCampus}
        onChat={actions.handleOpenChat}
        onMakeOffer={actions.handleOpenOfferModal}
        onBuyNow={actions.handleOpenBuyNow}
        isOwnProduct={actions.isOwnProduct}
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
        originalPrice={parseInt(product.price.replace(/\./g, ''), 10) || 1450000}
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
  scrollContent: { paddingBottom: 20 },
  campusModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  campusModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  campusModeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  switchToggleBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  switchToggleBtnActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  switchToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
  },
});
