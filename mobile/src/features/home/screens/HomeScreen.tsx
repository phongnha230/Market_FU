import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../../../components/common/HomeHeader';
import ProductCard from '../../../components/common/ProductCard';
import HomeSearchBar from '../components/HomeSearchBar';
import SearchSuggestionsDropdown from '../components/SearchSuggestionsDropdown';
import CampusSelector from '../components/CampusSelector';
import CategoryGrid from '../components/CategoryGrid';
import KycBanner from '../components/KycBanner';
import FeedHeader from '../components/FeedHeader';
import FeedFilterChips from '../components/FeedFilterChips';
import VovinamBanner from '../components/VovinamBanner';
import SafePointWidget from '../components/SafePointWidget';
import useHomeFeed from '../hooks/useHomeFeed';
import { useUserStore } from '../../../stores/userStore';
import { RequireAuthModal } from '../../../components/common/RequireAuthModal';
import { HomeScreenProps } from '../types/home.types';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onTabChange,
  onProductPress,
  onPostPress,
}) => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useUserStore();
  const [showSuggestions, setShowSuggestions] = useState(true);

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
    searchText,
    setSearchText,
    campuses,
    categories,
    feedFilters,
    products,
  } = useHomeFeed();

  // Chặn mở AI Assistant nếu chưa đăng nhập
  const handleOpenAiAssistant = () => {
    if (!isAuthenticated) {
      setAuthModalTitle('Yêu cầu đăng nhập Chatbot AI');
      setAuthModalMessage('Trợ lý ảo Market FU sẵn sàng giải đáp thắc mắc và định giá đồ cũ. Vui lòng đăng nhập tài khoản Sinh viên FPT để tiếp tục.');
      setAuthModalVisible(true);
      return;
    }
    if (navigation && navigation.navigate) {
      navigation.navigate('AiAssistant');
    }
  };

  // Chặn mở Thông báo nếu chưa đăng nhập
  const handleOpenNotification = () => {
    if (!isAuthenticated) {
      setAuthModalTitle('Yêu cầu đăng nhập');
      setAuthModalMessage('Bạn cần đăng nhập tài khoản Sinh viên FPT để xem danh sách thông báo tin nhắn và cập nhật giao dịch.');
      setAuthModalVisible(true);
      return;
    }
    if (navigation && navigation.navigate) {
      navigation.navigate('Notification');
    }
  };

  // Avatar press
  const handleAvatarPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Profile' });
  };

  return (
    <View style={styles.screen}>
      <HomeHeader
        userName={isAuthenticated && user?.name ? user.name : 'Khách'}
        campusName={campuses[selectedCampus] || 'HÒA LẠC'}
        avatarUrl={user?.avatar || user?.avatarUrl}
        onNotificationPress={handleOpenNotification}
        onAvatarPress={handleAvatarPress}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeSearchBar
          value={searchText}
          onChangeText={(txt) => {
            setSearchText(txt);
            setShowSuggestions(true);
          }}
          onScanPress={handleOpenAiAssistant}
        />

        {searchText.trim().length > 0 && showSuggestions && (
          <SearchSuggestionsDropdown
            searchText={searchText}
            products={products}
            onSelectKeyword={(kw) => {
              setSearchText(kw);
              setShowSuggestions(false);
            }}
            onSelectProduct={(pid) => {
              setShowSuggestions(false);
              if (onProductPress) {
                onProductPress(pid);
              } else {
                navigation.navigate('ProductDetail', { productId: pid });
              }
            }}
            onClose={() => setShowSuggestions(false)}
          />
        )}

        <CampusSelector campuses={campuses} selectedIndex={selectedCampus} onSelect={setSelectedCampus} />
        
        <CategoryGrid
          categories={categories}
          onCategoryPress={(cat) => {
            if (cat.id === '5') {
              // Bấm "Đăng bán" trong category grid
              if (!isAuthenticated) {
                setAuthModalMode('auth');
                setAuthModalTitle('Yêu cầu đăng nhập');
                setAuthModalMessage('Bạn cần đăng nhập tài khoản Người Bán (Seller) để đăng bán đồ cũ.');
                setAuthModalVisible(true);
                return;
              }
              if (user?.role !== 'SELLER') {
                setAuthModalMode('seller');
                setAuthModalTitle('Chỉ dành cho Người Bán (Seller)');
                setAuthModalMessage('Theo quy định Chợ Market FU, chỉ tài khoản Người Bán (Seller) mới có quyền đăng bán đồ và mở gian hàng.');
                setAuthModalVisible(true);
                return;
              }
              if (onPostPress) onPostPress();
              else if (onTabChange) onTabChange('post');
              else navigation.navigate('MainTabs', { screen: 'PostItem' });
            }
          }}
        />

        <KycBanner />
        <FeedHeader />
        <FeedFilterChips filters={feedFilters} selectedIndex={selectedFilter} onSelect={setSelectedFilter} />

        <View style={styles.productGrid}>
          {products.map((item) => (
            <ProductCard
              key={item.id}
              {...item}
              onPress={() => {
                if (onProductPress) onProductPress(item.id);
                else navigation.navigate('ProductDetail', { productId: item.id });
              }}
            />
          ))}
        </View>

        <VovinamBanner
          onPress={() => {
            if (onProductPress) onProductPress('vovinam-uniform');
            else navigation.navigate('ProductDetail', { productId: 'vovinam-uniform' });
          }}
        />
        <SafePointWidget />
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
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bottomSpacer: { height: 30 },
});

export default HomeScreen;
