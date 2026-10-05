import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useKho } from '../../../context/KhoContext';
import { SavedProductCard } from '../components/SavedProductCard';
import { SavedItemsEmptyState } from '../components/SavedItemsEmptyState';
import { SavedItemsTopNav } from '../components/SavedItemsTopNav';
import { SavedItemsPriceDropBanner } from '../components/SavedItemsPriceDropBanner';

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

const INITIAL_SAVED_PRODUCTS: SavedProductItem[] = [];

const CATEGORY_CHIPS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'books', label: 'Giáo trình & Sách' },
  { id: 'tech', label: 'Đồ công nghệ' },
];

export interface SavedItemsScreenProps {
  onGoBack?: () => void;
}

export const SavedItemsScreen: React.FC<SavedItemsScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { favoriteIds, toggleFavorite, allProducts: storeProducts, currentCampus } = useKho();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPriceAlert, setShowPriceAlert] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'price'>('newest');

  const products = React.useMemo(() => {
    const list: SavedProductItem[] = [];

    favoriteIds.forEach((favId) => {
      const sp = storeProducts.find((p) => p.id === favId);
      if (sp) {
        list.push({
          id: sp.id,
          title: sp.title,
          price: sp.price.toLocaleString('vi-VN') + 'đ',
          locationTag: `${sp.campus} - ${sp.safePoint || 'Safe-Point'}`,
          statusText: sp.status === 'AVAILABLE' ? 'Còn hàng' : 'Đã bán/hẹn',
          statusBadge: sp.condition,
          actionType: 'chat',
          image: sp.images?.[0] || require('../../../../assets/products/monitor-dell-24.jpg'),
          category: sp.category === 'books' ? 'books' : 'tech',
        });
      }
    });

    return list;
  }, [favoriteIds, storeProducts]);

  const handleToggleLove = useCallback((id: string, title: string) => {
    Alert.alert(
      'Bỏ lưu món đồ',
      `Bạn có muốn bỏ lưu "${title}" khỏi danh sách yêu thích?`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Bỏ lưu',
          style: 'destructive',
          onPress: () => {
            toggleFavorite(id);
          },
        },
      ]
    );
  }, [toggleFavorite]);

  const handleProductPress = useCallback((p: SavedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProductDetail', { productId: p.id });
    }
  }, [navigation]);

  const handleActionPress = useCallback((p: SavedProductItem) => {
    handleProductPress(p);
  }, [handleProductPress]);

  const handleSafePointPress = () => {
    Alert.alert(
      '🛡️ Safe-Handoff Point',
      'Hệ thống trạm hẹn an toàn FPT Campus:\n• Sảnh Tòa Alpha: Bàn test có nguồn 220V và bảo vệ trực 24/7.\n• Sảnh Thư viện Beta: Bàn giao giáo trình & thiết bị học tập.\n• Sân KTX Dom B: Điểm hẹn giao dịch nội khu thuận tiện.'
    );
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => {
      const next = prev === 'newest' ? 'price' : 'newest';
      Alert.alert(
        'Sắp xếp',
        next === 'price' ? 'Đã sắp xếp theo: Giá thấp đến cao' : 'Đã sắp xếp theo: Mới lưu gần nhất'
      );
      return next;
    });
  };

  const filteredProducts = React.useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory === 'all') return true;
      return p.category === selectedCategory;
    });

    if (sortOrder === 'price') {
      result = [...result].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, ''), 10) || 0;
        const priceB = parseInt(b.price.replace(/\D/g, ''), 10) || 0;
        return priceA - priceB;
      });
    }

    return result;
  }, [products, selectedCategory, sortOrder]);

  return (
    <View style={styles.screen}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP BAR: Campus + Bell + Avatar
      ═══════════════════════════════════════════════════════════ */}
      <SavedItemsTopNav
        currentCampus={currentCampus || 'Hòa Lạc'}
        topInset={insets.top}
        onBack={() => {
          if (navigation && navigation.canGoBack()) {
            navigation.goBack();
          } else if (navigation) {
            navigation.navigate('MainTabs', { screen: 'Home' });
          }
        }}
        onHome={() => {
          if (navigation) navigation.navigate('MainTabs', { screen: 'Home' });
        }}
        onNotification={() => {
          if (navigation && navigation.navigate) navigation.navigate('Notification');
        }}
        onProfile={() => {
          if (navigation && navigation.navigate) navigation.navigate('MainTabs', { screen: 'Profile' });
        }}
      />

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
            <Text style={styles.sortBtnText}>{sortOrder === 'newest' ? 'Mới lưu' : 'Giá tăng dần'}</Text>
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
          <SavedItemsPriceDropBanner onClose={() => setShowPriceAlert(false)} />
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
        {filteredProducts.length === 0 ? (
          <SavedItemsEmptyState
            onExplore={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          />
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((p) => (
              <SavedProductCard
                key={p.id}
                product={p}
                onPress={handleProductPress}
                onToggleLove={handleToggleLove}
                onActionPress={handleActionPress}
              />
            ))}
          </View>
        )}

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
