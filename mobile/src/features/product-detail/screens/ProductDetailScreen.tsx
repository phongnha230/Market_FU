import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
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
import ContextualAuthModal from '../components/ContextualAuthModal';
import ContextualChatAuthModal from '../components/ContextualChatAuthModal';
import useProductDetail from '../hooks/useProductDetail';
import { ProductDetailScreenProps } from '../types/product-detail.types';

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  onGoBack,
  productId,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const activeProductId = productId || route.params?.productId;

  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isChatAuthModalVisible, setIsChatAuthModalVisible] = useState(false);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);

  // Mặc định là cùng campus (Hòa Lạc), có switcher để trải nghiệm cả 2 ngữ cảnh theo yêu cầu
  const [isSameCampus, setIsSameCampus] = useState(true);

  const {
    product,
    currentImageIndex,
    setCurrentImageIndex,
    isSaved,
    handleToggleFavorite,
  } = useProductDetail(activeProductId);

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  // Mua ngay -> Chuyển vào trang Checkout
  const handleOpenBuyNow = () => {
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
      },
      isDifferentCampus: !isSameCampus,
    });
  };

  // Nhắn tin -> Chuyển vào ChatDetail
  const handleOpenChat = () => {
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
  };

  // Submit Trả giá -> Chuyển vào ChatDetail kèm tin nhắn đề xuất giá
  const handleSubmitOffer = (offeredPrice: number, message: string) => {
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
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <ProductDetailHeader
        onGoBack={handleBack}
        onGoHome={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        isSaved={isSaved}
        onToggleSaved={handleToggleFavorite}
      />

      {/* Switcher Demo Cùng Campus / Khác Campus */}
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
          onPress={() => setIsSameCampus(!isSameCampus)}
        >
          <Text style={styles.switchToggleText}>
            {isSameCampus ? 'Đổi sang Khác cơ sở ›' : 'Đổi sang Cùng cơ sở ›'}
          </Text>
        </TouchableOpacity>
      </View>

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

      {/* Product Bottom Bar theo ngữ cảnh Campus */}
      <ProductBottomBar
        isSameCampus={isSameCampus}
        onChat={handleOpenChat}
        onMakeOffer={() => setIsOfferModalVisible(true)}
        onBuyNow={handleOpenBuyNow}
      />

      {/* Modal Trả giá */}
      <MakeOfferModal
        visible={isOfferModalVisible}
        onClose={() => setIsOfferModalVisible(false)}
        originalPrice={parseInt(product.price.replace(/\./g, ''), 10) || 1450000}
        productTitle={product.title}
        sellerName={product.seller.name}
        onSubmitOffer={handleSubmitOffer}
      />
    </View>
  );
};

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

export default ProductDetailScreen;
