import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useKho } from '../../../context/KhoContext';
import { useFavoriteStore } from '../../../stores/useFavoriteStore';
import { SavedProductCard } from '../components/SavedProductCard';
import { SavedItemsEmptyState } from '../components/SavedItemsEmptyState';
import { SavedItemsTopNav } from '../components/SavedItemsTopNav';
import { isProductInCategory } from '../../../lib/backendMappers';
import { resolveProductImage } from '../../../lib/imageResolver';

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
  category: string;
  negotiatingBanner?: boolean;
  interestedCount?: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN';
  isSoldOrReserved: boolean;
  sellerId?: string;
  sellerName?: string;
  sellerAvatar?: string;
}

const INITIAL_SAVED_PRODUCTS: SavedProductItem[] = [];

const CATEGORY_CHIPS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'books', label: 'Giáo trình & Sách' },
  { id: 'tech', label: 'Đồ công nghệ' },
  { id: 'fashion', label: 'Thời trang & Đồng phục' },
  { id: 'living', label: 'Đồ gia dụng KTX' },
];

export interface SavedItemsScreenProps {
  onGoBack?: () => void;
}

export const SavedItemsScreen: React.FC<SavedItemsScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { favoriteIds, toggleFavorite, allProducts: storeProducts, currentCampus } = useKho();
  const savedProductsMap = useFavoriteStore((s) => s.savedProductsMap || {});

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price'>('newest');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tự động kéo mới danh sách tin yêu thích từ Backend khi mở màn hình
  React.useEffect(() => {
    useFavoriteStore.getState().fetchFavorites().catch(() => {});
  }, []);

  const products = React.useMemo(() => {
    const list: SavedProductItem[] = [];

    favoriteIds.forEach((favId) => {
      const sp = storeProducts.find((p) => p.id === favId) || savedProductsMap[favId];
      if (sp) {
        const isSold = sp.status === 'SOLD';
        const isReserved = sp.status === 'RESERVED';
        const isClosed = isSold || isReserved || sp.status === 'HIDDEN';

        let statusText = 'Còn hàng';
        if (isSold) {
          statusText = 'Đã bán';
        } else if (isReserved) {
          statusText = 'Đang hẹn cọc';
        } else if (sp.status === 'HIDDEN') {
          statusText = 'Đã ẩn';
        }

        const priceNum =
          typeof sp.price === 'number'
            ? sp.price
            : parseInt(String(sp.price).replace(/\D/g, ''), 10) || 0;

        list.push({
          id: sp.id,
          title: sp.title,
          price: priceNum.toLocaleString('vi-VN') + 'đ',
          originalPrice: sp.originalPrice
            ? typeof sp.originalPrice === 'number'
              ? sp.originalPrice.toLocaleString('vi-VN') + 'đ'
              : String(sp.originalPrice).endsWith('đ')
              ? String(sp.originalPrice)
              : String(sp.originalPrice) + 'đ'
            : undefined,
          locationTag: `${sp.campus || currentCampus || 'FU'} - ${sp.safePoint || 'Safe-Point'}`,
          statusText,
          statusBadge: isSold ? 'Đã giao dịch' : sp.condition || '99%',
          actionType: isClosed ? 'detail' : 'chat',
          image: resolveProductImage(sp.images?.[0] || sp.image),
          category: sp.category || 'tech',
          status: sp.status || 'AVAILABLE',
          isSoldOrReserved: isClosed,
          sellerId: sp.sellerId,
          sellerName: sp.sellerName,
          sellerAvatar: sp.sellerAvatar,
        });
      }
    });

    return list;
  }, [favoriteIds, storeProducts, savedProductsMap, currentCampus]);

  const soldItemsCount = React.useMemo(() => {
    return products.filter((p) => p.isSoldOrReserved).length;
  }, [products]);

  const handleCleanSold = useCallback(() => {
    const soldIds = products.filter((p) => p.isSoldOrReserved).map((p) => p.id);
    if (soldIds.length === 0) {
      Alert.alert('✨ Thông báo', 'Tất cả sản phẩm trong danh sách yêu thích hiện đều còn hàng!');
      return;
    }

    Alert.alert(
      '🧹 Dọn tin đã bán',
      `Bạn có muốn xóa ${soldIds.length} món đồ đã bán hoặc đã hẹn cọc khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Dọn sạch',
          style: 'destructive',
          onPress: () => {
            const removed = useFavoriteStore.getState().clearSoldFavorites(soldIds);
            Alert.alert('✅ Thành công', `Đã dọn ${removed} món đã bán khỏi danh sách tin đã lưu.`);
          },
        },
      ]
    );
  }, [products]);

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
    // Nếu sản phẩm đã bán/đã hẹn cọc thì chỉ xem chi tiết, không mở chat
    if (p.isSoldOrReserved) {
      handleProductPress(p);
      return;
    }

    if (navigation && navigation.navigate && p.sellerId) {
      const numericPrice = parseInt(p.price.replace(/\D/g, ''), 10) || 0;
      navigation.navigate('ChatDetail', {
        partner: {
          id: p.sellerId,
          name: p.sellerName || 'Người bán FPT',
          avatar: p.sellerAvatar || '',
          cohort: 'K17 FPT',
          isOnline: true,
        },
        product: {
          id: p.id,
          title: p.title,
          price: p.price,
          image: p.image,
        },
      });
      return;
    }

    handleProductPress(p);
  }, [handleProductPress, navigation]);


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
      return isProductInCategory(p, selectedCategory);
    });

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.locationTag && p.locationTag.toLowerCase().includes(q))
      );
    }

    if (sortOrder === 'price') {
      result = [...result].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\D/g, ''), 10) || 0;
        const priceB = parseInt(b.price.replace(/\D/g, ''), 10) || 0;
        return priceA - priceB;
      });
    }

    return result;
  }, [products, selectedCategory, sortOrder, searchQuery]);

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
            style={[styles.searchIconBtn, isSearchOpen && styles.searchIconBtnActive]}
            activeOpacity={0.7}
            onPress={() => setIsSearchOpen((prev) => !prev)}
          >
            <Ionicons name={isSearchOpen ? 'close' : 'search-outline'} size={18} color={isSearchOpen ? '#EA580C' : '#475569'} />
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

      {isSearchOpen && (
        <View style={styles.searchBarBox}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm nhanh trong tin đã lưu..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════
            3. SUMMARY STRIP: Chỉ hiện khi có sản phẩm đã lưu
        ═══════════════════════════════════════════════════════════ */}
        {products.length > 0 && (
          <View style={styles.summaryStrip}>
            <View style={styles.summaryLeft}>
              <View style={styles.bookmarkBox}>
                <Ionicons name="bookmark" size={14} color="#EA580C" />
              </View>
              <Text style={styles.summaryText}>
                Đã lưu <Text style={styles.boldOrange}>{products.length}</Text> món đồ •{' '}
                {soldItemsCount > 0 ? (
                  <Text style={styles.boldRedText}>{soldItemsCount} món đã bán</Text>
                ) : (
                  <Text style={styles.boldGreenText}>Tất cả còn hàng</Text>
                )}
              </Text>
            </View>
            {soldItemsCount > 0 && (
              <TouchableOpacity
                style={styles.cleanSoldBtn}
                activeOpacity={0.8}
                onPress={handleCleanSold}
              >
                <Ionicons name="sparkles" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.cleanSoldBtnText}>Dọn tin ({soldItemsCount})</Text>
              </TouchableOpacity>
            )}
          </View>
        )}


        {/* ═══════════════════════════════════════════════════════════
            4. CATEGORY FILTER CHIPS: Chỉ hiện khi có sản phẩm đã lưu
        ═══════════════════════════════════════════════════════════ */}
        {products.length > 0 && (
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
        )}


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
  searchIconBtnActive: {
    backgroundColor: '#FFEDD5',
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
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
  boldRedText: {
    color: '#DC2626',
    fontWeight: '800',
  },
  boldGreenText: {
    color: '#059669',
    fontWeight: '800',
  },
  cleanSoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cleanSoldBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
