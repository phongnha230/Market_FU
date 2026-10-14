import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import HomeHeader from '../../../components/common/HomeHeader';
import ProductCard from '../../../components/common/ProductCard';
import HomeSearchBar from '../components/HomeSearchBar';
import SearchSuggestionsDropdown from '../components/SearchSuggestionsDropdown';
import CampusSelector from '../components/CampusSelector';
import CategoryGrid from '../components/CategoryGrid';
import { HeroBannerCarousel } from '../components/HeroBannerCarousel';
import FeedHeader from '../components/FeedHeader';
import FeedFilterChips from '../components/FeedFilterChips';
import SafePointWidget from '../components/SafePointWidget';
import { TrendingSearchesBanner } from '../components/TrendingSearchesBanner';
import useHomeFeed from '../hooks/useHomeFeed';
import { QuickShortcutsBar, QuickShortcutItem } from '../components/QuickShortcutsBar';
import { useUserStore } from '../../../stores/userStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { RequireAuthModal } from '../../../components/common/RequireAuthModal';
import { HomeScreenProps } from '../types/home.types';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTabChange,
  onProductPress,
  onPostPress,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, isAuthenticated } = useUserStore();
  const unreadNotificationCount = useNotificationStore((state) =>
    state.notifications.filter((n) => n.unread).length
  );

  // Modal chặn truy cập
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'auth' | 'seller' | 'kyc'>('auth');
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

  const currentCampusName = campuses[selectedCampus] || 'HÒA LẠC';

  // Điều hướng sang Search Screen trắng riêng biệt khi bấm kính lúp
  const handleOpenSearch = () => {
    navigation.navigate('Search');
  };

  // Chặn mở Thông báo nếu chưa đăng nhập
  const handleOpenNotification = () => {
    if (!isAuthenticated) {
      setAuthModalTitle('Yêu cầu đăng nhập');
      setAuthModalMessage(
        'Bạn cần đăng nhập tài khoản Sinh viên FPT để xem danh sách thông báo tin nhắn và cập nhật giao dịch.'
      );
      setAuthModalVisible(true);
      return;
    }
    navigation.navigate('Notification');
  };

  // Avatar press
  const handleAvatarPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  const handleNextCampus = () => {
    const nextIdx = (selectedCampus + 1) % campuses.length;
    setSelectedCampus(nextIdx);
  };

  // Danh sách Tiện ích nhanh chuẩn TikTok Style
  const quickShortcuts: QuickShortcutItem[] = [
    {
      id: 'orders',
      title: 'Đơn hàng',
      icon: 'cube-outline',
      color: '#0284C7',
      bgColor: '#E0F2FE',
      onPress: () => {
        if (!isAuthenticated) {
          setAuthModalTitle('Yêu cầu đăng nhập');
          setAuthModalMessage('Vui lòng đăng nhập để xem danh sách đơn hàng của bạn.');
          setAuthModalVisible(true);
          return;
        }
        navigation.navigate('OrderList');
      },
    },
    {
      id: 'chat',
      title: 'Tin nhắn',
      icon: 'chatbubbles-outline',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      onPress: () => {
        if (!isAuthenticated) {
          setAuthModalTitle('Yêu cầu đăng nhập');
          setAuthModalMessage('Vui lòng đăng nhập để kiểm tra hòm thư trao đổi.');
          setAuthModalVisible(true);
          return;
        }
        navigation.navigate('MainTabs', { screen: 'Chat' });
      },
    },
    {
      id: 'vouchers',
      title: 'Voucher',
      icon: 'ticket-outline',
      color: '#EA580C',
      bgColor: '#FFEDD5',
      badge: 'HOT',
      onPress: () => {
        navigation.navigate('Voucher');
      },
    },
    {
      id: 'wallet',
      title: 'Ví Coins',
      icon: 'wallet-outline',
      color: '#D97706',
      bgColor: '#FEF3C7',
      onPress: () => {
        if (!isAuthenticated) {
          setAuthModalTitle('Yêu cầu đăng nhập');
          setAuthModalMessage('Vui lòng đăng nhập để quản lý ví và số dư tích lũy.');
          setAuthModalVisible(true);
          return;
        }
        navigation.navigate('CoinHistory');
      },
    },
    {
      id: 'saved',
      title: 'Đã lưu',
      icon: 'heart-outline',
      color: '#E11D48',
      bgColor: '#FFE4E6',
      onPress: () => {
        if (!isAuthenticated) {
          setAuthModalTitle('Yêu cầu đăng nhập');
          setAuthModalMessage('Vui lòng đăng nhập để xem các món đồ bạn đã lưu.');
          setAuthModalVisible(true);
          return;
        }
        navigation.navigate('SavedItems');
      },
    },
  ];

  // Thuật toán xác định TIN XU HƯỚNG / NỔI BẬT:
  // Dựa vào độ tương tác (viewsCount + likesCount * 3) hoặc sản phẩm có lượt xem cao
  const trendingProducts = useMemo(() => {
    return [...products]
      .sort((a: any, b: any) => {
        const scoreA = (a.viewsCount || 0) + (a.likesCount || 0) * 3;
        const scoreB = (b.viewsCount || 0) + (b.likesCount || 0) * 3;
        return scoreB - scoreA;
      })
      .slice(0, 6)
      .map((item: any) => ({
        ...item,
        badge: '🔥 HOT DEAL',
        badgeVariant: 'orange' as const,
        isTrending: true,
      }));
  }, [products]);

  // Danh sách tin mới tại campus đang chọn
  const campusProducts = products.slice(0, 8);

  return (
    <View style={styles.screen}>
      {/* Top Header kèm Dropdown 5 Campus và Search Icon */}
      <HomeHeader
        userName={isAuthenticated && user?.name ? user.name : 'Bạn'}
        campusName={currentCampusName}
        avatarUrl={isAuthenticated ? user?.avatar || user?.avatarUrl : undefined}
        isAuthenticated={isAuthenticated}
        unreadNotificationCount={unreadNotificationCount}
        onSearchPress={handleOpenSearch}
        onNotificationPress={handleOpenNotification}
        onAvatarPress={handleAvatarPress}
        onCampusChangePress={handleNextCampus}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Thanh chọn nhanh Campus */}
        <CampusSelector campuses={campuses} selectedIndex={selectedCampus} onSelect={setSelectedCampus} />

        {/* Cụm Tiện ích TikTok-style */}
        <QuickShortcutsBar items={quickShortcuts} />

        {/* Hero Carousel: 3 Slide banner tự chuyển động mượt mà trong 1 khung */}
        <HeroBannerCarousel
          onSlidePress={(slideId) => {
            if (slideId === 'slide-kyc') {
              if (!isAuthenticated) {
                setAuthModalMode('auth');
                setAuthModalTitle('Yêu cầu xác thực KYC');
                setAuthModalMessage('Vui lòng đăng nhập tài khoản FPT để hoàn tất định danh sinh viên (KYC).');
                setAuthModalVisible(true);
              } else {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            } else if (slideId === 'slide-safepoint') {
              navigation.navigate('SafePointHubs');
            } else if (slideId === 'slide-voucher') {
              navigation.navigate('Voucher');
            }
          }}
        />

        {/* SECTION 1: TIN XU HƯỚNG / NỔI BẬT (Vuốt ngang preview + Xem tất cả) */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="flame" size={20} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.sectionMainTitle}>TIN XU HƯỚNG / NỔI BẬT</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('ProductList', {
                mode: 'TRENDING',
                title: 'Tin xu hướng & Nổi bật',
              })
            }
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={14} color="#EA580C" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {trendingProducts.map((item) => (
            <View key={`trending-${item.id}`} style={styles.horizontalCardWrapper}>
              <ProductCard
                {...item}
                cardStyle={{ width: '100%', marginBottom: 0 }}
                onPress={() => {
                  if (onProductPress) onProductPress(item.id);
                  else navigation.navigate('ProductDetail', { productId: item.id });
                }}
              />
            </View>
          ))}
        </ScrollView>

        {/* SECTION 2: TIN MỚI TẠI CAMPUS ĐÃ CHỌN (Grid 2 cột + Xem tất cả) */}
        <View style={[styles.sectionHeaderRow, { marginTop: 16 }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location" size={18} color="#F27024" style={{ marginRight: 6 }} />
            <Text style={styles.sectionMainTitle}>TIN MỚI TẠI FU {currentCampusName.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('ProductList', {
                mode: 'CAMPUS_ALL',
                campusName: currentCampusName,
                title: `Toàn bộ tin tại FU ${currentCampusName}`,
              })
            }
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={14} color="#EA580C" />
          </TouchableOpacity>
        </View>

        {campusProducts.length === 0 ? (
          <View style={styles.emptyFeedContainer}>
            <Ionicons name="cube-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyFeedTitle}>Chưa có món đồ nào ở cơ sở này</Text>
            <Text style={styles.emptyFeedSub}>
              Hãy chọn cơ sở "TẤT CẢ" hoặc chuyển sang cơ sở khác để khám phá thêm đồ sinh viên pass lại nhé!
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {campusProducts.map((item) => (
              <ProductCard
                key={`campus-${item.id}`}
                {...item}
                onPress={() => {
                  if (onProductPress) onProductPress(item.id);
                  else navigation.navigate('ProductDetail', { productId: item.id });
                }}
              />
            ))}
          </View>
        )}

        <SafePointWidget onMapPress={() => navigation.navigate('SafePointHubs')} />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal Chặn truy cập cho Khách */}
      <RequireAuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        mode={authModalMode}
        title={authModalTitle}
        message={authModalMessage}
        onNavigateLogin={() => navigation.navigate('Login')}
        onNavigateKyc={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 80 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginRight: 2,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  horizontalCardWrapper: {
    width: 175,
    marginRight: 12,
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
    color: '#475569',
    marginTop: 12,
  },
  emptyFeedSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  bottomSpacer: { height: 30 },
});

export default HomeScreen;
