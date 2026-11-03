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
        productId={product.id}
        productTitle={product.title}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Moderation Status Banner for Pending / Rejected */}
        {product.status === 'PENDING_APPROVAL' && (
          <View style={styles.pendingModerationBanner}>
            <Ionicons name="time-outline" size={16} color="#B45309" style={styles.bannerIcon} />
            <View style={styles.bannerTextCol}>
              <Text style={styles.pendingBannerTitle} numberOfLines={1}>Tin đăng đang chờ BQT phê duyệt</Text>
              <Text style={styles.pendingBannerSub} numberOfLines={2} ellipsizeMode="tail">
                Tin đăng chưa hiển thị ra ngoài Chợ Campus cho đến khi được kiểm duyệt an toàn.
              </Text>
            </View>
          </View>
        )}

        {product.status === 'REJECTED' && (
          <View style={styles.rejectedModerationBanner}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" style={styles.bannerIcon} />
            <View style={styles.bannerTextCol}>
              <Text style={styles.rejectedBannerTitle} numberOfLines={1}>Tin đăng đã bị BQT từ chối / gỡ bỏ</Text>
              <Text style={styles.rejectedBannerSub} numberOfLines={3} ellipsizeMode="tail">
                Lý do: {product.rejectionReason || 'Nội dung hoặc ảnh vi phạm quy chế đăng tin FPT Market.'}
              </Text>
              {product.appealStatus === 'PENDING' && (
                <Text style={styles.appealStatusNote} numberOfLines={1}>
                  ⏳ Đang chờ BQT xem xét đơn kháng nghị
                </Text>
              )}
            </View>
          </View>
        )}

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
          onViewShop={actions.handleViewSellerProfile}
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
        price={product.price}
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
  scrollContent: { paddingBottom: 85 },
  pendingModerationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    gap: 8,
  },
  rejectedModerationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    gap: 8,
  },
  bannerIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  bannerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  pendingBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  pendingBannerSub: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
  },
  rejectedBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  rejectedBannerSub: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 15,
  },
  appealStatusNote: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 4,
  },
});
