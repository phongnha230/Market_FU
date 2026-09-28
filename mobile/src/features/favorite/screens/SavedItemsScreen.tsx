import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useFavoriteStore } from '../../../stores/useFavoriteStore';

export interface SavedProductItem {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  locationTag: string;
  discountBadge?: string;
  statusText?: string;
  statusBadge?: string;
  actionType: 'chat_now' | 'chat' | 'detail';
  image: any;
  category: 'all' | 'books' | 'tech';
  negotiatingBanner?: boolean;
  interestedCount?: number;
}

const INITIAL_SAVED_PRODUCTS: SavedProductItem[] = [
  {
    id: 'fav_1',
    title: 'Laptop Lenovo ThinkPad T480 (Cor...',
    price: '5.800.000đ',
    originalPrice: '6.000.000đ',
    discountBadge: '-200K',
    locationTag: 'Hola - Dom C',
    statusText: 'Còn hàng',
    actionType: 'chat_now',
    image: require('../../../../assets/products/keyboard-akko.jpg'),
    category: 'tech',
  },
  {
    id: 'fav_2',
    title: 'Giáo trình N3 Tiếng Nhật JPD123 kèm...',
    price: '85.000đ',
    locationTag: 'Hola - Thư viện',
    statusBadge: 'Like new 95%',
    actionType: 'chat',
    image: require('../../../../assets/products/books-mas291.jpg'),
    category: 'books',
  },
  {
    id: 'fav_3',
    title: 'Màn hình phụ di động 15.6 inch Type-C',
    price: '1.200.000đ',
    locationTag: 'TP.HCM - Tòa E',
    statusBadge: 'Đầy đủ dây cáp',
    actionType: 'chat',
    image: require('../../../../assets/products/monitor-dell-24.jpg'),
    category: 'tech',
  },
  {
    id: 'fav_4',
    title: 'Xe đạp địa phương đi lại KTX Hola',
    price: '450.000đ',
    locationTag: 'Hola KTX',
    actionType: 'detail',
    negotiatingBanner: true,
    interestedCount: 2,
    image: require('../../../../assets/products/folding-desk.jpg'),
    category: 'all',
  },
];

const CATEGORY_CHIPS = [
  { id: 'all', label: 'Tất cả (8)' },
  { id: 'books', label: 'Giáo trình PE/FE (3)' },
  { id: 'tech', label: 'Đồ công nghệ...' },
];

export interface SavedItemsScreenProps {
  onGoBack?: () => void;
}

export const SavedItemsScreen: React.FC<SavedItemsScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentCampus } = useCampusStore();
  const { toggleFavorite } = useFavoriteStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPriceAlert, setShowPriceAlert] = useState<boolean>(true);
  const [products, setProducts] = useState<SavedProductItem[]>(INITIAL_SAVED_PRODUCTS);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price'>('newest');

  const handleToggleLove = (id: string, title: string) => {
    Alert.alert(
      'Bỏ lưu món đồ',
      `Bạn có muốn bỏ lưu "${title}" khỏi danh sách yêu thích?`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Bỏ lưu',
          style: 'destructive',
          onPress: () => {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            toggleFavorite(id);
          },
        },
      ]
    );
  };

  const handleProductPress = (p: SavedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProductDetail', { productId: p.id });
    }
  };

  const handleActionPress = (p: SavedProductItem) => {
    if (p.actionType === 'detail') {
      handleProductPress(p);
    } else {
      if (navigation && navigation.navigate) {
        navigation.navigate('ContextualChatAuth', {
          product: {
            title: p.title,
            price: p.price,
            location: p.locationTag,
            image: p.image,
          },
          sellerName: 'Nguyễn Văn An',
          sellerCohort: 'K16 SE',
        });
      }
    }
  };

  const handleSafePointPress = () => {
    Alert.alert(
      '🛡️ Safe-Handoff Point',
      'Hệ thống trạm hẹn an toàn FPT Campus:\n• Sảnh Tòa Alpha: Bàn test có nguồn 220V và bảo vệ trực 24/7.\n• Sảnh Thư viện Beta: Bàn giao giáo trình & thiết bị học tập.\n• Sân KTX Dom B: Điểm hẹn giao dịch nội khu thuận tiện.'
    );
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'newest' ? 'price' : 'newest'));
    Alert.alert(
      'Sắp xếp',
      sortOrder === 'newest' ? 'Đã sắp xếp theo: Giá thấp đến cao' : 'Đã sắp xếp theo: Mới lưu gần nhất'
    );
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <View style={styles.screen}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP BAR: Campus + Bell + Avatar
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.topNavBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.campusChip} activeOpacity={0.8}>
          <Ionicons name="location-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.campusChipText}>FPT {currentCampus || 'Hòa Lạc'}</Text>
          <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        <View style={styles.topRightIcons}>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            }}
          >
            <Ionicons name="person" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          2. TITLE ROW: Tin đã lưu + Search + Mới lưu
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Ionicons name="heart-outline" size={22} color="#EA580C" style={{ marginRight: 8 }} />
          <Text style={styles.screenTitle}>Tin đã lưu</Text>
        </View>

        <View style={styles.titleRight}>
          <TouchableOpacity
            style={styles.searchIconBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Tìm kiếm', 'Tìm nhanh trong danh sách các món đồ đã lưu')}
          >
            <Ionicons name="search-outline" size={18} color="#475569" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortBtn}
            activeOpacity={0.75}
            onPress={handleToggleSort}
          >
            <Ionicons name="swap-vertical" size={15} color="#0F172A" style={{ marginRight: 4 }} />
            <Text style={styles.sortBtnText}>Mới lưu</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════
            3. SUMMARY STRIP: 8 món đồ đã lưu
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.summaryStrip}>
          <View style={styles.summaryLeft}>
            <View style={styles.bookmarkBox}>
              <Ionicons name="bookmark" size={14} color="#EA580C" />
            </View>
            <Text style={styles.summaryText}>
              Bạn đã lưu <Text style={styles.boldOrange}>{products.length}</Text> món đồ tại Hòa Lạc & TP.HCM
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. PRICE DROP ALERT BANNER (GIÁ HỜI)
        ═══════════════════════════════════════════════════════════ */}
        {showPriceAlert && (
          <View style={styles.priceDropBanner}>
            <View style={styles.priceDropIconCircle}>
              <MaterialCommunityIcons name="trending-down" size={20} color="#FFFFFF" />
            </View>

            <View style={styles.priceDropContent}>
              <View style={styles.priceDropTagRow}>
                <View style={styles.hotDealTag}>
                  <Text style={styles.hotDealTagText}>GIÁ HỜI</Text>
                </View>
                <Text style={styles.priceDropTime}>Hôm nay</Text>
              </View>
              <Text style={styles.priceDropDesc}>
                <Text style={styles.boldText}>ThinkPad T480</Text> vừa giảm{' '}
                <Text style={styles.boldOrange}>200.000 đ</Text>{'\n'}(xuống 5.800.000 đ)!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeAlertBtn}
              activeOpacity={0.7}
              onPress={() => setShowPriceAlert(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={16} color="#9A3412" />
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            5. CATEGORY FILTER CHIPS
        ═══════════════════════════════════════════════════════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {CATEGORY_CHIPS.map((cat) => {
            const isSelected = cat.id === selectedCategory;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ═══════════════════════════════════════════════════════════
            6. SAFE-HANDOFF POINT BANNER
        ═══════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={styles.safePointBanner}
          activeOpacity={0.85}
          onPress={handleSafePointPress}
        >
          <View style={styles.safePointLeft}>
            <View style={styles.shieldIconBox}>
              <Ionicons name="shield-checkmark" size={17} color="#FFFFFF" />
            </View>
            <View style={styles.safePointTextCol}>
              <Text style={styles.safePointTitle}>Safe-Handoff Point</Text>
              <Text style={styles.safePointDesc}>Hẹn giao dịch an toàn tại sảnh Alpha & KTX</Text>
            </View>
          </View>
          <Text style={styles.seePointsLink}>Xem điểm ›</Text>
        </TouchableOpacity>

        {/* ═══════════════════════════════════════════════════════════
            7. SAVED PRODUCTS 2-COLUMN GRID
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.productCard}
              activeOpacity={0.92}
              onPress={() => handleProductPress(p)}
            >
              {/* Product Image Wrapper */}
              <View style={styles.imageBox}>
                <Image source={p.image} style={styles.productImg} contentFit="cover" />

                {/* Discount Badge */}
                {p.discountBadge && (
                  <View style={styles.discountBadgeTop}>
                    <Text style={styles.discountBadgeTopText}>{p.discountBadge}</Text>
                  </View>
                )}

                {/* Location Tag */}
                <View style={styles.locationTagBox}>
                  <Text style={styles.locationTagText}>{p.locationTag}</Text>
                </View>

                {/* Heart Button */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  activeOpacity={0.7}
                  onPress={() => handleToggleLove(p.id, p.title)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="heart" size={16} color="#DC2626" />
                </TouchableOpacity>

                {/* Negotiating Banner */}
                {p.negotiatingBanner && (
                  <View style={styles.negotiatingBanner}>
                    <Text style={styles.negotiatingBannerText}>Đang thương lượng</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.productInfoBox}>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>{p.price}</Text>
                  {p.originalPrice && (
                    <Text style={styles.originalPrice}>{p.originalPrice}</Text>
                  )}
                </View>

                <Text style={styles.productTitle} numberOfLines={2}>
                  {p.title}
                </Text>

                {/* Status indicator / Badge */}
                {p.statusText && (
                  <View style={styles.stockStatusRow}>
                    <View style={styles.greenStockDot} />
                    <Text style={styles.stockStatusText}>{p.statusText}</Text>
                  </View>
                )}

                {p.statusBadge && (
                  <View style={styles.specBadgeRow}>
                    <View style={styles.specBadge}>
                      <Text style={styles.specBadgeText}>{p.statusBadge}</Text>
                    </View>
                  </View>
                )}

                {p.interestedCount !== undefined && (
                  <View style={styles.interestedRow}>
                    <Ionicons name="chatbubble-outline" size={11} color="#64748B" style={{ marginRight: 3 }} />
                    <Text style={styles.interestedText}>Có {p.interestedCount} bạn quan tâm</Text>
                  </View>
                )}

                {/* Action Button */}
                {p.actionType === 'chat_now' && (
                  <TouchableOpacity
                    style={styles.actionChatNowBtn}
                    activeOpacity={0.88}
                    onPress={() => handleActionPress(p)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionChatNowBtnText}>Nhắn tin ngay</Text>
                  </TouchableOpacity>
                )}

                {p.actionType === 'chat' && (
                  <TouchableOpacity
                    style={styles.actionChatBtn}
                    activeOpacity={0.8}
                    onPress={() => handleActionPress(p)}
                  >
                    <Ionicons name="chatbubble-outline" size={13} color="#1E40AF" style={{ marginRight: 4 }} />
                    <Text style={styles.actionChatBtnText}>Nhắn tin</Text>
                  </TouchableOpacity>
                )}

                {p.actionType === 'detail' && (
                  <TouchableOpacity
                    style={styles.actionDetailBtn}
                    activeOpacity={0.8}
                    onPress={() => handleActionPress(p)}
                  >
                    <Ionicons name="eye-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
                    <Text style={styles.actionDetailBtnText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════════
            8. TIPS BANNER: Mẹo săn đồ KTX giá rẻ
        ═══════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          style={styles.tipsBanner}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              '💡 Mẹo săn đồ KTX giá rẻ',
              'Nhấn vào nút Chuông thông báo trong Chi tiết sản phẩm để hệ thống tự động bắn Notification ngay khi người bán hạ giá món đồ bạn đã lưu!'
            )
          }
        >
          <View style={styles.tipsIconCircle}>
            <Ionicons name="bulb-outline" size={19} color="#EA580C" />
          </View>
          <View style={styles.tipsTextCol}>
            <Text style={styles.tipsTitle}>Mẹo săn đồ KTX giá rẻ</Text>
            <Text style={styles.tipsSub}>
              Bật chuông thông báo khi người bán hạ giá đồ đã lưu.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SavedItemsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 1. Top Nav Bar
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  campusChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  avatarBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9A3412',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Title Row
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  titleRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Scroll Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // 3. Summary Strip
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  boldOrange: {
    color: '#EA580C',
    fontWeight: '900',
  },

  // 4. Price Drop Banner
  priceDropBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  priceDropIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  priceDropContent: {
    flex: 1,
  },
  priceDropTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  hotDealTag: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hotDealTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  priceDropTime: {
    fontSize: 11,
    color: '#C2410C',
    fontWeight: '600',
  },
  priceDropDesc: {
    fontSize: 12,
    color: '#431407',
    lineHeight: 16.5,
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
  closeAlertBtn: {
    padding: 4,
  },

  // 5. Category Chips Scroll
  categoryChipsScroll: {
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#0F172A',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },

  // 6. Safe Point Banner
  safePointBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  safePointLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safePointTextCol: {},
  safePointTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  safePointDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  seePointsLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#C2410C',
  },

  // 7. Products 2-Column Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  imageBox: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  discountBadgeTop: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeTopText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  locationTagBox: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  locationTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  negotiatingBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  negotiatingBannerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Product Info Box
  productInfoBox: {
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 3,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16.5,
    marginBottom: 6,
    minHeight: 33,
  },
  stockStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greenStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 4,
  },
  stockStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  specBadgeRow: {
    marginBottom: 8,
  },
  specBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  interestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interestedText: {
    fontSize: 10.5,
    color: '#64748B',
  },

  // Action Buttons
  actionChatNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 10,
    paddingVertical: 7,
  },
  actionChatNowBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 7,
  },
  actionChatBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  actionDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 7,
  },
  actionDetailBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },

  // 8. Tips Banner
  tipsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    marginBottom: 10,
  },
  tipsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tipsTextCol: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  tipsSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
