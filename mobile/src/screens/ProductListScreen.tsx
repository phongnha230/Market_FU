import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import HomeSearchBar from '../features/home/components/HomeSearchBar';
import ProductCard from '../components/common/ProductCard';
import useHomeFeed from '../features/home/hooks/useHomeFeed';
import { isProductInCategory } from '../lib/backendMappers';

const PRICE_FILTERS = [
  { id: 'ALL', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'UNDER_50K', label: 'Dưới 50.000đ', min: 0, max: 50000 },
  { id: '50K_150K', label: '50.000đ - 150.000đ', min: 50000, max: 150000 },
  { id: '150K_500K', label: '150.000đ - 500.000đ', min: 150000, max: 500000 },
  { id: 'OVER_500K', label: 'Trên 500.000đ', min: 500000, max: Infinity },
];

export const ProductListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { mode = 'CAMPUS_ALL', campusName = 'Hòa Lạc', category: initialCategory, title } =
    route.params || {};

  const {
    products: allProducts,
    categories,
    selectedFilter,
    setSelectedFilter,
    searchText,
    setSearchText,
  } = useHomeFeed();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('ALL');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Pagination / Infinite scroll state
  const [displayedCount, setDisplayedCount] = useState<number>(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Helper parse price
  const parsePrice = (priceStr: string | number) => {
    if (typeof priceStr === 'number') return priceStr;
    const clean = String(priceStr).replace(/[^\d]/g, '');
    return parseInt(clean, 10) || 0;
  };

  // Filter products
  const activePriceObj = PRICE_FILTERS.find((p) => p.id === selectedPriceFilter) || PRICE_FILTERS[0];

  const filteredProducts = allProducts.filter((item) => {
    // 1. Text search
    if (searchText.trim().length > 0) {
      const q = searchText.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchTags = (item.hashtags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchLoc && !matchDesc && !matchTags) return false;
    }

    // 2. Category Filter
    if (selectedCategory && selectedCategory !== 'ALL') {
      if (!isProductInCategory(item, selectedCategory)) {
        return false;
      }
    }

    // 3. Price filter
    const priceNum = parsePrice(item.price);
    if (priceNum < activePriceObj.min || priceNum > activePriceObj.max) {
      return false;
    }

    return true;
  });

  const visibleProducts = filteredProducts.slice(0, displayedCount);

  const handleLoadMore = () => {
    if (displayedCount >= filteredProducts.length || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount((prev) => prev + 8);
      setIsLoadingMore(false);
    }, 400);
  };

  const screenTitle =
    title ||
    (mode === 'TRENDING'
      ? 'Tin xu hướng & Nổi bật'
      : `Toàn bộ tin tại FU ${campusName}`);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {screenTitle}
        </Text>
        <TouchableOpacity
          style={styles.cartButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SavedItems')}
        >
          <Ionicons name="heart-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Internal Search Bar */}
      <HomeSearchBar
        value={searchText}
        onChangeText={setSearchText}
        onScanPress={() => navigation.navigate('AiAssistant')}
      />

      {/* Filter Dropdown Bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.dropdownBtn, isCategoryDropdownOpen && styles.dropdownBtnActive]}
          activeOpacity={0.8}
          onPress={() => {
            setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
            setIsPriceDropdownOpen(false);
          }}
        >
          <Ionicons name="grid-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.dropdownBtnText} numberOfLines={1}>
            {selectedCategory === 'ALL'
              ? 'Tất cả danh mục'
              : (categories.find((c) => c.id === selectedCategory)?.name || selectedCategory).replace(/\n/g, ' ')}
          </Text>
          <Ionicons
            name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#64748B"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dropdownBtn, isPriceDropdownOpen && styles.dropdownBtnActive]}
          activeOpacity={0.8}
          onPress={() => {
            setIsPriceDropdownOpen(!isPriceDropdownOpen);
            setIsCategoryDropdownOpen(false);
          }}
        >
          <Ionicons name="pricetag-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.dropdownBtnText} numberOfLines={1}>
            {activePriceObj.label}
          </Text>
          <Ionicons
            name={isPriceDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#64748B"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* Collapsible Dropdown Menus */}
      {isCategoryDropdownOpen && (
        <View style={styles.dropdownMenu}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.chip, selectedCategory === 'ALL' && styles.chipActive]}
              onPress={() => {
                setSelectedCategory('ALL');
                setIsCategoryDropdownOpen(false);
              }}
            >
              <Text style={[styles.chipText, selectedCategory === 'ALL' && styles.chipTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setIsCategoryDropdownOpen(false);
                }}
              >
                <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                  {cat.name.replace(/\n/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isPriceDropdownOpen && (
        <View style={styles.dropdownMenu}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {PRICE_FILTERS.map((pf) => (
              <TouchableOpacity
                key={pf.id}
                style={[styles.chip, selectedPriceFilter === pf.id && styles.chipActive]}
                onPress={() => {
                  setSelectedPriceFilter(pf.id);
                  setIsPriceDropdownOpen(false);
                }}
              >
                <Text style={[styles.chipText, selectedPriceFilter === pf.id && styles.chipTextActive]}>
                  {pf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Header Info */}
      <View style={styles.resultInfoRow}>
        <Text style={styles.resultCountText}>
          Hiển thị <Text style={{ fontWeight: '700', color: '#EA580C' }}>{filteredProducts.length}</Text> sản phẩm
        </Text>
        {(selectedCategory !== 'ALL' || selectedPriceFilter !== 'ALL' || searchText) && (
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory('ALL');
              setSelectedPriceFilter('ALL');
              setSearchText('');
            }}
          >
            <Text style={styles.clearFilterText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product List Grid */}
      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            {isLoadingMore && (
              <View style={styles.loadingMoreBox}>
                <ActivityIndicator size="small" color="#EA580C" />
                <Text style={styles.loadingMoreText}>Đang tải thêm sản phẩm...</Text>
              </View>
            )}
            {!isLoadingMore && visibleProducts.length >= filteredProducts.length && filteredProducts.length > 0 && (
              <Text style={styles.endOfListText}>🎉 Bạn đã xem hết sản phẩm trong danh mục này</Text>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm phù hợp</Text>
            <Text style={styles.emptySub}>Hãy thử tìm với từ khóa khác hoặc điều chỉnh lại mức giá lọc nhé!</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dropdownBtnActive: {
    borderColor: '#F27024',
    backgroundColor: '#FFF7ED',
  },
  dropdownBtnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownMenu: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  chipScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultCountText: {
    fontSize: 12,
    color: '#64748B',
  },
  clearFilterText: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  endOfListText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default ProductListScreen;
