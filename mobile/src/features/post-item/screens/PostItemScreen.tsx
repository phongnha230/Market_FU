import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
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
    description,
    setDescription,
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
    hashtags,
    hashtagInput,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    images,
    handleAddImage,
    handleRemoveImage,
    handleApplySuggestion,
    handleSubmit,
    currentCampus,
  } = usePostItem(onSubmitSuccess, onGoBack);

  const hashtagSet = React.useMemo(() => new Set(hashtags), [hashtags]);

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
    if (data.description) setDescription(data.description);
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
          <PostImageSection
            images={images}
            onRemoveImage={handleRemoveImage}
            onAddImage={handleAddImage}
          />
          
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

          {/* Mô tả chi tiết món đồ */}
          <View style={styles.descSection}>
            <Text style={styles.sectionLabel}>Mô tả chi tiết món đồ *</Text>
            <View style={styles.descInputWrap}>
              <TextInput
                style={styles.descTextInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Tình trạng phụ kiện, thời gian mua, lý do pass lại..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Thẻ Hashtags từ khóa tìm kiếm (Đồng bộ Meilisearch) */}
          <View style={styles.hashtagSection}>
            <View style={styles.hashtagTitleRow}>
              <Text style={styles.sectionLabel}>Thẻ Hashtag tìm kiếm ({hashtags.length}/8)</Text>
              <Text style={styles.hashtagSubHint}>Tối ưu Meilisearch</Text>
            </View>

            {/* Input thêm hashtag */}
            <View style={styles.hashtagInputRow}>
              <View style={styles.hashtagInputWrap}>
                <Text style={styles.hashPrefix}>#</Text>
                <TextInput
                  style={styles.hashtagTextInput}
                  value={hashtagInput}
                  onChangeText={setHashtagInput}
                  placeholder="Nhập hashtag (vd: banphim, k18, giare)..."
                  placeholderTextColor="#94A3B8"
                  onSubmitEditing={() => handleAddHashtag()}
                  returnKeyType="done"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.addHashBtn,
                  !hashtagInput.trim() && styles.addHashBtnDisabled,
                ]}
                onPress={() => handleAddHashtag()}
                disabled={!hashtagInput.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addHashBtnText}>Thêm</Text>
              </TouchableOpacity>
            </View>

            {/* Danh sách hashtag đã thêm */}
            {hashtags.length > 0 && (
              <View style={styles.hashtagTagsWrap}>
                {hashtags.map((tag) => (
                  <View key={tag} style={styles.hashtagChip}>
                    <Text style={styles.hashtagChipText}>#{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveHashtag(tag)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      style={styles.hashtagRemoveBtn}
                    >
                      <Ionicons name="close-circle" size={15} color="#EA580C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Gợi ý nhanh */}
            <View style={styles.quickSuggestRow}>
              <Text style={styles.quickSuggestLabel}>Gợi ý nhanh:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickSuggestScroll}>
                {['giare', 'moi99', 'k18', 'k19', 'passnhanh', 'fixnhe', 'vovinam', 'ktx', 'freeship']
                  .filter((s) => !hashtagSet.has(s))
                  .map((sug) => (
                    <TouchableOpacity
                      key={sug}
                      style={styles.quickSuggestChip}
                      onPress={() => handleAddHashtag(sug)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickSuggestChipText}>+#{sug}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>

          {/* Cơ sở đăng bán (Khóa cứng gắn liền với hồ sơ Người Bán, không cho phép đổi tùy tiện) */}
          <View style={styles.lockedCampusSection}>
            <Text style={styles.sectionLabel}>Cơ sở đăng bán</Text>
            <View style={styles.lockedCampusCard}>
              <View style={styles.lockedCampusIconWrap}>
                <Ionicons name="business" size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.lockedCampusTitleRow}>
                  <Text style={styles.lockedCampusTitle}>{currentCampus}</Text>
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={11} color="#64748B" />
                    <Text style={styles.lockedBadgeText}>Cố định theo hồ sơ</Text>
                  </View>
                </View>
                <Text style={styles.lockedCampusSub}>
                  Món đồ tự động gắn liền cơ sở đăng ký của bạn ({currentCampus}) để bảo đảm an toàn và không gây nhầm lẫn khi người mua hẹn gặp tại Safe-Point.
                </Text>
              </View>
            </View>
          </View>

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
  lockedCampusSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  lockedCampusCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  lockedCampusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  lockedCampusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lockedCampusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  lockedCampusSub: {
    fontSize: 11,
    color: '#7C2D12',
    lineHeight: 16,
  },
  descSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  descInputWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    minHeight: 80,
  },
  descTextInput: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    lineHeight: 18,
  },
  hashtagSection: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  hashtagTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hashtagSubHint: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
  },
  hashtagInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  hashtagInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  hashPrefix: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
    marginRight: 4,
  },
  hashtagTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  addHashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  addHashBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addHashBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hashtagTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  hashtagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  hashtagRemoveBtn: {
    padding: 1,
  },
  quickSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickSuggestLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quickSuggestScroll: {
    gap: 6,
  },
  quickSuggestChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickSuggestChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
});

export default PostItemScreen;
