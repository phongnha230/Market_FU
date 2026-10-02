import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PostItemHeader from '../components/PostItemHeader';
import PostImageSection from '../components/PostImageSection';
import AiPhotoAutoFillBanner from '../components/AiPhotoAutoFillBanner';
import PostTitleSection from '../components/PostTitleSection';
import PostCategoryConditionSection from '../components/PostCategoryConditionSection';
import PostPriceSafePointSection from '../components/PostPriceSafePointSection';
import PostSubmitBar from '../components/PostSubmitBar';
import usePostItem from '../hooks/usePostItem';
import { useUserStore } from '../../../stores/userStore';
import { PostItemScreenProps } from '../types/post-item.types';

export const PostItemScreen: React.FC<PostItemScreenProps> = ({
  onGoBack,
  onSubmitSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useUserStore();

  const {
    title,
    setTitle,
    price,
    setPrice,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    allowNegotiate,
    setAllowNegotiate,
    freeForK20,
    setFreeForK20,
    selectedSafePoint,
    campusShipEnabled,
    setCampusShipEnabled,
    images,
    handleRemoveImage,
    handleApplySuggestion,
    handleSubmit,
    currentCampus,
  } = usePostItem(onSubmitSuccess, onGoBack);

  const handleBack = () => {
    if (onGoBack) onGoBack();
    else if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleAiAutoFill = (data: any) => {
    if (data.title) setTitle(data.title);
    if (data.category) setSelectedCategory(data.category);
    if (data.condition) setSelectedCondition(data.condition);
    if (data.price) setPrice(data.price);
  };

  // Rule: CHỈ CÓ SELLER MỚI ĐƯỢC ĐĂNG BÁN
  const isSeller = user?.role === 'SELLER';

  // 1. Nếu chưa đăng nhập (Guest)
  if (!isAuthenticated) {
    return (
      <View style={[styles.screen, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={styles.fallbackIconCircle}>
            <Ionicons name="lock-closed" size={40} color="#EA580C" />
          </View>
          <Text style={styles.fallbackTitle}>Yêu cầu đăng nhập</Text>
          <Text style={styles.fallbackSubtitle}>
            Bạn đang ở chế độ xem hàng (Khách). Vui lòng đăng nhập tài khoản Người Bán (Seller) để đăng bán đồ cũ.
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fallbackBackBtn} onPress={handleBack}>
            <Text style={styles.fallbackBackText}>Quay lại trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. Nếu đã đăng nhập nhưng KHÔNG PHẢI SELLER
  if (!isSeller) {
    return (
      <View style={[styles.screen, styles.fallbackCenter, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.fallbackCard}>
          <View style={[styles.fallbackIconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="storefront" size={40} color="#4338CA" />
          </View>
          <Text style={styles.fallbackTitle}>Chỉ dành cho Người Bán (Seller)</Text>
          <Text style={styles.fallbackSubtitle}>
            Theo quy định Chợ Market FU, chỉ tài khoản Người Bán (Seller) mới có quyền đăng bán sản phẩm và quản lý gian hàng. Tài khoản Sinh viên (Buyer) hiện chỉ có quyền tìm kiếm, trả giá và đặt mua.
          </Text>
          <TouchableOpacity
            style={[styles.fallbackBtn, { backgroundColor: '#4338CA' }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
            activeOpacity={0.85}
          >
            <Text style={styles.fallbackBtnText}>Xem hồ sơ tài khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fallbackBackBtn} onPress={handleBack}>
            <Text style={styles.fallbackBackText}>Quay lại trang chủ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 10) }]}>
      <PostItemHeader onGoBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <PostImageSection images={images} onRemoveImage={handleRemoveImage} />
          
          {/* AI Vision Photo Auto-fill Banner */}
          <AiPhotoAutoFillBanner
            hasImages={images.length > 0}
            onAutoFill={handleAiAutoFill}
          />

          <PostTitleSection
            title={title}
            onChangeTitle={setTitle}
            onApplySuggestion={handleApplySuggestion}
          />
          <PostCategoryConditionSection
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedCondition={selectedCondition}
            onSelectCondition={setSelectedCondition}
          />
          <PostPriceSafePointSection
            price={price}
            onChangePrice={setPrice}
            allowNegotiate={allowNegotiate}
            onToggleNegotiate={setAllowNegotiate}
            freeForK20={freeForK20}
            onToggleFreeForK20={() => setFreeForK20(!freeForK20)}
            selectedSafePoint={selectedSafePoint}
            campusShipEnabled={campusShipEnabled}
            onToggleCampusShip={setCampusShipEnabled}
          />
        </ScrollView>

        <PostSubmitBar onSubmit={handleSubmit} campusName={currentCampus} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  fallbackCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
  },
  fallbackCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fallbackIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  fallbackBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackBackBtn: {
    paddingVertical: 8,
  },
  fallbackBackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PostItemScreen;
