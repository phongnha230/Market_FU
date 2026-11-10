import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../../../components/common/HomeHeader';
import ProductCard from '../../../components/common/ProductCard';
import ProductCardSkeleton from '../../../components/common/ProductCardSkeleton';
import CategoryGrid from '../components/CategoryGrid';
import { HeroBannerCarousel } from '../components/HeroBannerCarousel';
import useHomeFeed from '../hooks/useHomeFeed';
import { useUserStore } from '../../../stores/userStore';
import { useProductStore } from '../../../stores/productStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useWalletStore } from '../../../stores/walletStore';
import { RequireAuthModal } from '../../../components/common/RequireAuthModal';
import { useSafeRefresh } from '../../../utils/safeRefresh';
import { HomeScreenProps } from '../types/home.types';
import { theme } from '../../../config/theme';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onProductPress,
}) => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useUserStore();
  const { isLoading, fetchProducts } = useProductStore();
  const walletCoins = useWalletStore((s) => s.getWallet().coins) ?? 0;
  const displayCoins = Math.max(user?.coins ?? 0, walletCoins, 0);
  const unreadNotificationCount = useNotificationStore((state) =>
    state.notifications.filter((n) => n.unread).length
  );

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState<string | undefined>(undefined);
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(undefined);

  const {
    selectedCampus,
    setSelectedCampus,
    selectedFilter,
    setSelectedFilter,
    campuses,
    categories,
    feedFilters,
    products,
  } = useHomeFeed();

  const { refreshing: homeRefreshing, onRefresh: onHomeRefresh } = useSafeRefresh(async () => {
    await fetchProducts(campuses[selectedCampus] || 'ALL');
  }, 2000);

  const currentCampusName = campuses[selectedCampus] || 'HÒA LẠC';

  const handleProductPress = useCallback(
    (productId: string) => {
      if (onProductPress) {
        onProductPress(productId);
      } else {
        navigation.navigate('ProductDetail', { productId });
      }
    },
    [onProductPress, navigation]
  );

  const handleCategoryPress = useCallback(
    (category: any) => {
      navigation.navigate('ProductList', {
        category: category.id,
        categoryType: category.id,
        title: (category.name || '').replace('\n', ' '),
      });
    },
    [navigation]
  );

  const handleOpenSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const handleOpenNotification = useCallback(() => {
    if (!isAuthenticated) {
      setAuthModalTitle('Yêu cầu đăng nhập');
      setAuthModalMessage(
        'Bạn cần đăng nhập tài khoản Sinh viên FPT để xem danh sách thông báo tin nhắn và cập nhật giao dịch.'
      );
      setAuthModalVisible(true);
      return;
    }
    navigation.navigate('Notification');
  }, [isAuthenticated, navigation]);

  const handleAvatarPress = useCallback(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Profile' });
  }, [isAuthenticated, navigation]);

  const handleNextCampus = useCallback(() => {
    const nextIdx = (selectedCampus + 1) % campuses.length;
    setSelectedCampus(nextIdx);
  }, [selectedCampus, campuses.length, setSelectedCampus]);

  const handleOpenCoins = useCallback(() => {
    if (!isAuthenticated) {
      setAuthModalTitle('Yêu cầu đăng nhập');
      setAuthModalMessage('Vui lòng đăng nhập tài khoản Sinh viên FPT để xem Ví Xu và Nhiệm vụ nhận thưởng.');
      setAuthModalVisible(true);
      return;
    }
    navigation.navigate('CoinHistory');
  }, [isAuthenticated, navigation]);

  const campusProducts = useMemo(() => {
    return products
      .filter((p: any) => !p.status || p.status === 'AVAILABLE')
      .slice(0, 16);
  }, [products]);

  const renderProductItem = useCallback(
    ({ item }: { item: any }) => (
      <ProductCard
        key={`campus-${item.id}`}
        {...item}
        onPress={handleProductPress}
      />
    ),
    [handleProductPress]
  );

  const renderListHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        {/* Hero Banner tối giản (1 slide Safe-Point chuẩn 3 màu) */}
        <HeroBannerCarousel
          onSlidePress={() => navigation.navigate('SafePointHubs')}
        />

        {/* Danh mục ngành hàng 1 chạm đồng bộ màu trung tính */}
        <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />

        {/* Bộ lọc nhanh tích hợp ngay trên Feed sản phẩm */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
          style={styles.filterChipsBar}
        >
          {feedFilters.map((label, idx) => {
            const isActive = selectedFilter === idx;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(idx)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tiêu đề Feed sản phẩm chính */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionMainTitle} numberOfLines={1}>
              {currentCampusName === 'TẤT CẢ'
                ? 'TIN MỚI TOÀN HỆ THỐNG'
                : `TIN MỚI TẠI FU ${currentCampusName.toUpperCase()}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('ProductList', {
                mode: selectedFilter === 4 ? 'TRENDING' : 'CAMPUS_ALL',
                campusName: currentCampusName,
                title:
                  selectedFilter === 4
                    ? 'Tin xu hướng & Nổi bật'
                    : `Toàn bộ tin tại FU ${currentCampusName}`,
              })
            }
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {isLoading && campusProducts.length === 0 ? (
          <View style={styles.productGrid}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : campusProducts.length === 0 ? (
          <View style={styles.emptyFeedContainer}>
            <Ionicons name="cube-outline" size={48} color={theme.colors.border} />
            <Text style={styles.emptyFeedTitle}>Chưa có món đồ nào phù hợp</Text>
            <Text style={styles.emptyFeedSub}>
              Hãy thử bộ lọc khác hoặc chọn "TẤT CẢ" để khám phá thêm đồ sinh viên pass lại nhé!
            </Text>
            <TouchableOpacity
              style={styles.emptyFeedButton}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedFilter(0);
                setSelectedCampus(0);
              }}
            >
              <Ionicons name="compass-outline" size={16} color={theme.colors.text.inverse} style={{ marginRight: 6 }} />
              <Text style={styles.emptyFeedButtonText}>Xem tất cả tin đăng</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    ),
    [
      categories,
      feedFilters,
      selectedFilter,
      setSelectedFilter,
      currentCampusName,
      isLoading,
      campusProducts.length,
      handleCategoryPress,
      navigation,
      setSelectedCampus,
    ]
  );

  const renderListFooter = useMemo(
    () => <View style={styles.bottomSpacer} />,
    []
  );

  return (
    <View style={styles.screen}>
      <HomeHeader
        userName={isAuthenticated && user?.name ? user.name : 'Bạn'}
        campusName={currentCampusName}
        selectedCampusIndex={selectedCampus}
        avatarUrl={isAuthenticated ? user?.avatar || user?.avatarUrl : undefined}
        isAuthenticated={isAuthenticated}
        coins={displayCoins}
        unreadNotificationCount={unreadNotificationCount}
        onSearchPress={handleOpenSearch}
        onNotificationPress={handleOpenNotification}
        onCoinsPress={handleOpenCoins}
        onAvatarPress={handleAvatarPress}
        onCampusChangePress={handleNextCampus}
        onCampusSelect={(idx) => setSelectedCampus(idx)}
      />

      <FlatList
        data={isLoading && campusProducts.length === 0 ? [] : campusProducts}
        numColumns={2}
        keyExtractor={(item) => `campus-${item.id}`}
        renderItem={renderProductItem}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={homeRefreshing}
            onRefresh={onHomeRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      <RequireAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        mode="auth"
        title={authModalTitle}
        message={authModalMessage}
        onNavigateLogin={() => navigation.navigate('Login')}
        onNavigateKyc={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  listHeader: { paddingTop: 10 },
  content: { paddingBottom: 84 },
  filterChipsBar: { marginBottom: 6 },
  filterChipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.text.inverse,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  sectionMainTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    flexShrink: 0,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyFeedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  emptyFeedSub: {
    fontSize: 13,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  emptyFeedButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSpacer: { height: 24 },
});

export default HomeScreen;
