import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeHeader from '../components/HomeHeader';
import ProductCard, { ProductCardProps } from '../components/ProductCard';

const CAMPUSES = ['HÒA LẠC', 'TP.HCM', 'ĐÀ NẴNG', 'CẦN THƠ'];

const CATEGORIES = [
  {
    id: '1',
    name: 'Sách &\nGiáo trình',
    icon: 'book-outline',
    color: '#EFF6FF',
    iconColor: '#BE185D',
    badge: 'PE/FE',
    badgeColor: '#10B981',
  },
  {
    id: '2',
    name: 'Laptop &\nPhụ kiện',
    icon: 'laptop-outline',
    color: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: '3',
    name: 'Đồ dùng\nKTX',
    icon: 'business-outline',
    color: '#EFF6FF',
    iconColor: '#7C3AED',
  },
  {
    id: '4',
    name: 'Võ phục\nVovinam',
    icon: 'body-outline',
    color: '#EFF6FF',
    iconColor: '#0284C7',
  },
  {
    id: '5',
    name: 'Pass đồ\ngấp',
    icon: 'flash',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    badge: 'GẤP',
    badgeColor: '#EF4444',
  },
];

const FEED_FILTERS = ['TẤT CẢ', '🧭 GẦN BẠN (<500M)', '🏠 ĐỒ KTX', '💰 PASS RẺ'];

const GRID_PRODUCTS: ProductCardProps[] = [
  {
    id: '1',
    title: 'Màn hình Dell 24" UltraSharp',
    price: '1.450.000',
    location: '📍 Dom A Hola',
    seller: 'Hoàng Tú',
    sellerYear: 'K18 AI',
    image: require('../../assets/products/monitor-dell-24.jpg'),
    badge: '99% Fullbox',
    badgeVariant: 'white',
    isVerified: true,
  },
  {
    id: '2',
    title: 'Combo CSL201 + MAS291 kèm đề PE',
    price: '120.000',
    location: '📚 Thư viện Gamma',
    seller: 'Phương Linh',
    image: require('../../assets/products/books-mas291.jpg'),
    badge: 'Tặng note tóm tắt',
    badgeVariant: 'green',
    isVerified: true,
  },
  {
    id: '3',
    title: 'Bàn phím cơ FL Esport custom',
    price: '750.000',
    location: '📍 Sảnh Tòa Alpha',
    seller: 'Hải Nam',
    sellerYear: 'K17',
    image: require('../../assets/products/keyboard-akko.jpg'),
    badge: 'Switch êm',
    badgeVariant: 'white',
    isVerified: true,
  },
  {
    id: '4',
    title: 'Nồi nấu lẩu mini KTX 1.5L',
    price: '220.000',
    location: '🏠 Dom B KTX',
    seller: 'Quốc Bảo',
    image: require('../../assets/products/mini-pot-locklock.jpg'),
    badge: 'An toàn Dom',
    badgeVariant: 'white',
    isVerified: true,
  },
];

interface HomeScreenProps {
  onTabChange?: (tab: 'home' | 'explore' | 'post' | 'chat' | 'profile') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onTabChange }) => {
  const [selectedCampus, setSelectedCampus] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'post' | 'chat' | 'profile'>('home');
  const [searchText, setSearchText] = useState('');

  const handleTabPress = (tab: 'home' | 'explore' | 'post' | 'chat' | 'profile') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* 1. Header (Logo, FPT 5Campus, Search/Notif/Avatar, Chào Quân 👋) */}
      <HomeHeader userName="Quân" campusName="HÒA LẠC" />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Search & Scan Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Tìm giáo trình, laptop, đồ KTX..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="scan-helper" size={20} color="#F27024" />
            </TouchableOpacity>
          </View>

          {/* Filter button */}
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* 3. Campus Selector Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.campusTabsContainer}
        >
          {CAMPUSES.map((campus, index) => {
            const isActive = selectedCampus === index;
            return (
              <TouchableOpacity
                key={campus}
                style={[styles.campusTab, isActive && styles.activeCampusTab]}
                activeOpacity={0.8}
                onPress={() => setSelectedCampus(index)}
              >
                {isActive && (
                  <Ionicons name="location-sharp" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.campusTabText, isActive && styles.activeCampusTabText]}>
                  {campus}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 4. Quick Category Icons Grid */}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              activeOpacity={0.8}
              onPress={() => {
                if (cat.id === '5') {
                  handleTabPress('post');
                }
              }}
            >
              <View style={[styles.categoryIconCircle, { backgroundColor: cat.color }]}>
                {cat.badge && (
                  <View style={[styles.categoryBadge, { backgroundColor: cat.badgeColor }]}>
                    <Text style={styles.categoryBadgeText}>{cat.badge}</Text>
                  </View>
                )}
                <Ionicons name={cat.icon as any} size={24} color={cat.iconColor} />
              </View>
              <Text style={styles.categoryTitle}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. FPT KYC PASS Banner */}
        <TouchableOpacity style={styles.kycBanner} activeOpacity={0.9}>
          <View style={styles.kycShieldBox}>
            <Ionicons name="shield-checkmark" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.kycTextBox}>
            <View style={styles.kycHeaderRow}>
              <View style={styles.kycPassPill}>
                <Text style={styles.kycPassPillText}>FPT KYC PASS</Text>
              </View>
              <Text style={styles.kycSubhead}>Bảo trợ sinh viên</Text>
            </View>
            <Text style={styles.kycDesc}>
              Xác thực sinh viên để nhận huy hiệu tin cậy & giao dịch <Text style={{ fontWeight: '800' }}>Safe-Handoff</Text> an toàn tại Sảnh Alpha & KTX.
            </Text>
          </View>
        </TouchableOpacity>

        {/* 6. Section "Tin mới tại Hola" */}
        <View style={styles.feedHeaderRow}>
          <View>
            <Text style={styles.feedTitle}>Tin mới tại Hola</Text>
            <Text style={styles.feedSubtitle}>Trao đổi tận tay trong campus 5 phút</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Xem hết ›</Text>
          </TouchableOpacity>
        </View>

        {/* 7. Feed Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContainer}
        >
          {FEED_FILTERS.map((chip, index) => {
            const isActive = selectedFilter === index;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.filterChip, isActive && styles.activeFilterChip]}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(index)}
              >
                <Text style={[styles.filterChipText, isActive && styles.activeFilterChipText]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 8. 2-Column Product Feed Grid */}
        <View style={styles.productGrid}>
          {GRID_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </View>

        {/* 9. Horizontal Wide Card (Võ phục Vovinam) */}
        <TouchableOpacity style={styles.horizontalCard} activeOpacity={0.9}>
          {/* Left Thumbnail */}
          <View style={styles.hCardImageWrapper}>
            <Image
              source={require('../../assets/products/vovinam-uniform.jpg')}
              style={styles.hCardImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.hCardTag}>
              <Text style={styles.hCardTagText}>Size L</Text>
            </View>
          </View>

          {/* Right Content */}
          <View style={styles.hCardContent}>
            <View style={styles.hCardPriceRow}>
              <Text style={styles.hCardPrice}>140.000đ</Text>
              <View style={styles.hCardConditionPill}>
                <Text style={styles.hCardConditionText}>Mới 95%</Text>
              </View>
            </View>

            <Text style={styles.hCardTitle} numberOfLines={2}>
              Bộ võ phục Vovinam FPT kèm đai xanh
            </Text>

            <View style={styles.hCardBottomRow}>
              <View style={styles.hCardLocation}>
                <Text style={styles.hCardLocationText}>🥋 Sân Vovinam Beta</Text>
              </View>
              <View style={styles.hCardSeller}>
                <Text style={styles.hCardSellerText}>Hoàng Long</Text>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginLeft: 2 }} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 10. SAFE-HANDOFF POINT Widget */}
        <View style={styles.safePointCard}>
          <View style={styles.safePointIconWrapper}>
            <Ionicons name="power" size={18} color="#FFFFFF" />
            <View style={styles.safePointStatusDot} />
          </View>

          <View style={styles.safePointDetails}>
            <View style={styles.safePointHeader}>
              <Text style={styles.safePointTitle}>SAFE-HANDOFF POINT</Text>
              <View style={styles.safePointBadge}>
                <Text style={styles.safePointBadgeText}>ĐANG MỞ</Text>
              </View>
            </View>
            <Text style={styles.safePointDesc}>
              Bàn test sạc & đo điện Sảnh Alpha có bảo vệ trực
            </Text>
          </View>

          <TouchableOpacity style={styles.safePointActionBtn} activeOpacity={0.8}>
            <Ionicons name="map-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Space for Bottom Bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* 11. Bottom Tab Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        {/* Tab 1: Trang chủ */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleTabPress('home')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? '#F27024' : '#64748B'}
          />
          <Text style={[styles.navTabLabel, activeTab === 'home' && styles.activeNavTabLabel]}>
            Trang chủ
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Khám phá */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleTabPress('explore')}
        >
          <Ionicons
            name={activeTab === 'explore' ? 'compass' : 'compass-outline'}
            size={22}
            color={activeTab === 'explore' ? '#F27024' : '#64748B'}
          />
          <Text style={[styles.navTabLabel, activeTab === 'explore' && styles.activeNavTabLabel]}>
            Khám phá
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Đăng bán (Nút cam ở giữa) */}
        <TouchableOpacity
          style={styles.floatingCenterBtnWrapper}
          activeOpacity={0.85}
          onPress={() => handleTabPress('post')}
        >
          <View style={styles.floatingCenterBtn}>
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </View>
          <Text style={[styles.navTabLabel, activeTab === 'post' && styles.activeNavTabLabel, { marginTop: 4 }]}>
            Đăng bán
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Tin nhắn */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleTabPress('chat')}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name={activeTab === 'chat' ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={22}
              color={activeTab === 'chat' ? '#F27024' : '#64748B'}
            />
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>2</Text>
            </View>
          </View>
          <Text style={[styles.navTabLabel, activeTab === 'chat' && styles.activeNavTabLabel]}>
            Tin nhắn
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Hồ sơ */}
        <TouchableOpacity
          style={styles.navTab}
          activeOpacity={0.7}
          onPress={() => handleTabPress('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#F27024' : '#64748B'}
          />
          <Text style={[styles.navTabLabel, activeTab === 'profile' && styles.activeNavTabLabel]}>
            Hồ sơ
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // 2. Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  // 3. Campus Tabs
  campusTabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  campusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  activeCampusTab: {
    backgroundColor: '#F27024',
  },
  campusTabText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.2,
  },
  activeCampusTabText: {
    color: '#FFFFFF',
  },

  // 4. Quick Category Icons Grid
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: '18%',
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  categoryBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
    zIndex: 2,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  categoryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 13,
  },

  // 5. KYC Banner
  kycBanner: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#F27024',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  kycShieldBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  kycTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  kycHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  kycPassPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  kycPassPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#F27024',
  },
  kycSubhead: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kycDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 15,
  },

  // 6. Section "Tin mới tại Hola"
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  feedTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  feedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F27024',
  },

  // 7. Filter Chips
  filterChipsContainer: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#475569',
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#475569',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },

  // 8. Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  // 9. Horizontal Wide Card
  horizontalCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    padding: 10,
  },
  hCardImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  hCardImage: {
    width: '100%',
    height: '100%',
  },
  hCardTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hCardTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  hCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  hCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hCardPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#DC2626',
    marginRight: 8,
  },
  hCardConditionPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hCardConditionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  hCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  hCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hCardLocationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  hCardSeller: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hCardSellerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },

  // 10. SAFE-HANDOFF POINT
  safePointCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  safePointIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  safePointStatusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  safePointDetails: {
    flex: 1,
    marginLeft: 10,
  },
  safePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  safePointTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.2,
  },
  safePointBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  safePointBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#047857',
  },
  safePointDesc: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 14,
  },
  safePointActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // 11. Bottom Tab Navigation Bar
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  activeNavTabLabel: {
    color: '#F27024',
    fontWeight: '800',
  },
  floatingCenterBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
    flex: 1,
  },
  floatingCenterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F27024',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  chatBadge: {
    position: 'absolute',
    top: -3,
    right: -7,
    backgroundColor: '#EA580C',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
});

export default HomeScreen;
