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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ───────────────────────────────────────────────────────────────────────────────
// Mock Data cho trang Khám phá / Tìm kiếm nâng cao
// ───────────────────────────────────────────────────────────────────────────────

const CAMPUS_FILTERS = [
  { id: 'hol', label: 'Hòa Lạc', isActive: true },
  { id: 'near', label: '< 500m', icon: 'navigate-outline' },
  { id: 'ktx', label: 'KTX Dom A - F' },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả', count: 248 },
  { id: 'cntt', label: 'Giáo trình CNTT', count: 84 },
  { id: 'dien', label: 'Đồ điện KT...' },
];

const PRICE_RANGES = [
  { id: 'under100', label: '< 100k' },
  { id: '100to500', label: '100k - 500k' },
  { id: '500to2m', label: '500k - 2tr' },
  { id: 'free', label: '0đ Tặng', icon: 'gift-outline' },
];

interface ExploreProduct {
  id: string;
  title: string;
  price: string;
  badge: string;
  badgeColor: string;
  seller: string;
  sellerBadge?: string;
  rating?: string;
  location: string;
  locationDetail?: string;
  image: any;
  greenTag?: string;
  hotTag?: boolean;
}

const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: '1',
    title: 'Combo Tài liệu PE Java Spring Boot + CSL201 đề...',
    price: '95.000',
    badge: 'Tài liệu PE',
    badgeColor: '#2563EB',
    seller: 'Minh Trí (K16 SE)',
    sellerBadge: 'SV FPT',
    rating: '4.9',
    location: '📍 Cách 150m • Thư viện Gamma',
    image: require('../../assets/products/books-mas291.jpg'),
  },
  {
    id: '2',
    title: 'Tai nghe chụp tai Sony WH-CH520 chống ồn nh...',
    price: '680.000',
    badge: 'Like new 99%',
    badgeColor: '#059669',
    seller: 'Hải Nam (K17...)',
    location: '🔧 Hẹn test trực tiếp tại Sảnh Alpha',
    image: require('../../assets/products/headphones-sony.jpg'),
    greenTag: 'Giao dịch an toàn',
  },
  {
    id: '3',
    title: 'Bếp từ mini phòng KTX kèm nồi lẩu chống dính...',
    price: '210.000',
    badge: 'Pass đồ KTX',
    badgeColor: '#7C3AED',
    seller: 'Thu Trang (K18 IB)',
    sellerBadge: 'Đã bán 6 món',
    location: '🏠 Dom E Hola • Có thể đổi lấy giá...',
    image: require('../../assets/products/mini-pot-locklock.jpg'),
  },
  {
    id: '4',
    title: 'Quạt tích điện mini gấp gọn để bàn học, 3 cấp độ gió',
    price: '85.000',
    badge: 'Pin 8 tiếng',
    badgeColor: '#EA580C',
    seller: 'Quốc Bảo (K17 AI)',
    location: '🏠 Dom C tầng 3 • Ghế lấy liên tiế...',
    image: require('../../assets/products/mini-fridge-aqua.jpg'),
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// Component: ExploreScreen
// ───────────────────────────────────────────────────────────────────────────────

interface ExploreScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: 'home' | 'explore' | 'post' | 'chat' | 'profile') => void;
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ onGoBack, onTabChange }) => {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('CSL201');
  const [selectedCampus, setSelectedCampus] = useState('hol');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterSafeHandoff, setFilterSafeHandoff] = useState(false);
  const [filterTestable, setFilterTestable] = useState(false);

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* ═══════════════════════════════════════════════════════════════════════
          1. TOP: Search Bar with Back & Cancel
      ═══════════════════════════════════════════════════════════════════════ */}
      <View style={styles.topSearchRow}>
        <TouchableOpacity
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onGoBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            autoFocus={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <View style={styles.clearBtn}>
                <Ionicons name="close" size={14} color="#64748B" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={onGoBack}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        stickyHeaderIndices={[]}
      >
        {/* ═════════════════════════════════════════════════════════════════════
            2. "ĐIỂM GIAO NHẬN GẦN BẠN" + Bản đồ Safe-Zone link
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryLeft}>
            <Ionicons name="location-sharp" size={14} color="#F27024" />
            <Text style={styles.deliveryLabel}>ĐIỂM GIAO NHẬN GẦN BẠN</Text>
          </View>
          <TouchableOpacity style={styles.safeZoneLink}>
            <Text style={styles.safeZoneLinkText}>Bản đồ Safe-Zone</Text>
            <Ionicons name="chevron-forward" size={14} color="#F27024" />
          </TouchableOpacity>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            3. Campus Filter Chips
        ═════════════════════════════════════════════════════════════════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRowContainer}
        >
          {CAMPUS_FILTERS.map((campus) => {
            const isActive = selectedCampus === campus.id;
            return (
              <TouchableOpacity
                key={campus.id}
                style={[styles.campusChip, isActive && styles.activeCampusChip]}
                activeOpacity={0.8}
                onPress={() => setSelectedCampus(campus.id)}
              >
                {campus.icon && (
                  <Ionicons
                    name={campus.icon as any}
                    size={13}
                    color={isActive ? '#FFFFFF' : '#475569'}
                    style={{ marginRight: 4 }}
                  />
                )}
                {isActive && !campus.icon && (
                  <Ionicons name="location-sharp" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.campusChipText, isActive && styles.activeCampusChipText]}>
                  {campus.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ═════════════════════════════════════════════════════════════════════
            4. Category Tabs
        ═════════════════════════════════════════════════════════════════════ */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsRow}
        >
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryTabChip, isActive && styles.activeCategoryTabChip]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(tab.id)}
              >
                <Text style={[styles.categoryTabText, isActive && styles.activeCategoryTabText]}>
                  {tab.label}
                </Text>
                {tab.count && (
                  <View style={[styles.countBadge, isActive && styles.activeCountBadge]}>
                    <Text style={[styles.countBadgeText, isActive && styles.activeCountBadgeText]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ═════════════════════════════════════════════════════════════════════
            5. Khoảng giá sinh viên
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.priceSectionHeader}>
          <Text style={styles.priceSectionTitle}>Khoảng giá sinh viên</Text>
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>Tiết kiệm tới 70%</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priceChipsRow}
        >
          {PRICE_RANGES.map((range) => {
            const isActive = selectedPrice === range.id;
            return (
              <TouchableOpacity
                key={range.id}
                style={[styles.priceChip, isActive && styles.activePriceChip]}
                activeOpacity={0.8}
                onPress={() => setSelectedPrice(isActive ? null : range.id)}
              >
                {range.icon && (
                  <Ionicons
                    name={range.icon as any}
                    size={14}
                    color={isActive ? '#FFFFFF' : '#F27024'}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[styles.priceChipText, isActive && styles.activePriceChipText]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ═════════════════════════════════════════════════════════════════════
            6. Verification Filters (Checkboxes)
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.filterChecksContainer}>
          {/* Filter 1: SV Verified */}
          <TouchableOpacity
            style={styles.checkRow}
            activeOpacity={0.7}
            onPress={() => setFilterVerified(!filterVerified)}
          >
            <View style={[styles.checkbox, filterVerified && styles.checkboxActive]}>
              {filterVerified && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkLabel}>Chỉ xem người bán có thẻ SV Verified</Text>
          </TouchableOpacity>

          {/* Filter 2: Safe-Handoff */}
          <TouchableOpacity
            style={styles.checkRow}
            activeOpacity={0.7}
            onPress={() => setFilterSafeHandoff(!filterSafeHandoff)}
          >
            <View style={[styles.checkbox, filterSafeHandoff && styles.checkboxActive]}>
              {filterSafeHandoff && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkLabel}>Có sẵn tại điểm Safe-Handoff hôm nay</Text>
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>HOT</Text>
            </View>
          </TouchableOpacity>

          {/* Filter 3: Testable */}
          <TouchableOpacity
            style={styles.checkRow}
            activeOpacity={0.7}
            onPress={() => setFilterTestable(!filterTestable)}
          >
            <View style={[styles.checkbox, filterTestable && styles.checkboxActive]}>
              {filterTestable && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkLabel}>Được kiểm tra & dùng thử tại sảnh</Text>
          </TouchableOpacity>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            7. Results Header: "Tìm thấy 42 món đồ tại Hòa Lạc"
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Tìm thấy <Text style={{ color: '#F27024', fontWeight: '900' }}>42 món đồ</Text>{' '}
            <Text style={{ color: '#64748B', fontWeight: '500' }}>tại Hòa Lạc</Text>
          </Text>
          <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
            <Text style={styles.sortBtnText}>Mới nhất</Text>
            <Ionicons name="chevron-down" size={14} color="#F27024" />
          </TouchableOpacity>
        </View>

        {/* ═════════════════════════════════════════════════════════════════════
            8. Product Result Cards (Vertical List)
        ═════════════════════════════════════════════════════════════════════ */}
        {EXPLORE_PRODUCTS.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.92}>
            {/* Left: Image */}
            <View style={styles.productImageWrapper}>
              <Image
                source={product.image}
                style={styles.productImage}
                contentFit="cover"
                transition={200}
              />
              <View style={[styles.productBadge, { backgroundColor: product.badgeColor }]}>
                <Text style={styles.productBadgeText}>{product.badge}</Text>
              </View>
            </View>

            {/* Right: Info */}
            <View style={styles.productInfo}>
              {/* Price */}
              <View style={styles.productPriceRow}>
                <Text style={styles.productPrice}>{product.price}đ</Text>
                {/* Bookmark */}
                <TouchableOpacity hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="bookmark-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>

              {/* Seller Row */}
              <View style={styles.sellerInfoRow}>
                <Text style={styles.sellerName}>{product.seller}</Text>
                {product.rating && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color="#FBBF24" />
                    <Text style={styles.ratingText}>{product.rating}</Text>
                  </View>
                )}
                {product.sellerBadge && (
                  <View style={styles.svBadge}>
                    <Ionicons name="shield-checkmark" size={10} color="#10B981" />
                    <Text style={styles.svBadgeText}>{product.sellerBadge}</Text>
                  </View>
                )}
              </View>

              {/* Green Safety Tag */}
              {product.greenTag && (
                <View style={styles.greenTagContainer}>
                  <Text style={styles.greenTagText}>{product.greenTag}</Text>
                </View>
              )}

              {/* Location */}
              <Text style={styles.productLocation} numberOfLines={1}>
                {product.location}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* ═════════════════════════════════════════════════════════════════════
            9. Map Widget: "Chế độ xem Bản Đồ KTX"
        ═════════════════════════════════════════════════════════════════════ */}
        <View style={styles.mapWidget}>
          <View style={styles.mapWidgetLeft}>
            <View style={styles.mapIconBox}>
              <MaterialCommunityIcons name="map-marker-radius" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.mapTextBox}>
              <Text style={styles.mapTitle}>Chế độ xem Bản Đồ KTX</Text>
              <Text style={styles.mapDesc}>Ghim vị trí món đồ quanh các toà Dom</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapOpenBtn} activeOpacity={0.85}>
            <Text style={styles.mapOpenBtnText}>Mở{'\n'}Map</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════════
          10. Floating "Lọc nâng cao" Button
      ═══════════════════════════════════════════════════════════════════════ */}
      <View style={styles.floatingFilterWrapper}>
        <TouchableOpacity style={styles.floatingFilterBtn} activeOpacity={0.9}>
          <Ionicons name="filter" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.floatingFilterText}>Lọc nâng cao</Text>
          <View style={styles.floatingFilterCount}>
            <Text style={styles.floatingFilterCountText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Styles
// ───────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollBody: {
    paddingBottom: 40,
  },

  // 1. Top Search Bar
  topSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F27024',
  },

  // 2. Delivery Row
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FEFCE8',
    borderBottomWidth: 1,
    borderBottomColor: '#FEF9C3',
  },
  deliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  safeZoneLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safeZoneLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F27024',
  },

  // 3. Campus Chips
  chipRowContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  activeCampusChip: {
    backgroundColor: '#F27024',
    borderColor: '#F27024',
  },
  campusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activeCampusChipText: {
    color: '#FFFFFF',
  },

  // 4. Category Tabs
  categoryTabsRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryTabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCategoryTabChip: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  countBadge: {
    marginLeft: 5,
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  activeCountBadgeText: {
    color: '#FFFFFF',
  },

  // 5. Price Range
  priceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  priceSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  priceChipsRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  priceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  activePriceChip: {
    backgroundColor: '#F27024',
    borderColor: '#F27024',
  },
  priceChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  activePriceChipText: {
    color: '#FFFFFF',
  },

  // 6. Verification Filters
  filterChecksContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBFC',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  hotBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 6,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
  },

  // 7. Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F27024',
    marginRight: 2,
  },

  // 8. Product Cards (Horizontal Layout)
  productCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageWrapper: {
    width: 105,
    height: 105,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  productBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#DC2626',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 17,
    marginTop: 2,
  },
  sellerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    marginRight: 5,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 2,
  },
  svBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  svBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
    marginLeft: 2,
  },
  greenTagContainer: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  greenTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  productLocation: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 3,
  },

  // 9. Map Widget
  mapWidget: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  mapWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTextBox: {
    marginLeft: 10,
    flex: 1,
  },
  mapTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  mapDesc: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  mapOpenBtn: {
    backgroundColor: '#F27024',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  mapOpenBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },

  // 10. Floating Filter Button
  floatingFilterWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#475569',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingFilterCount: {
    marginLeft: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingFilterCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});

export default ExploreScreen;
