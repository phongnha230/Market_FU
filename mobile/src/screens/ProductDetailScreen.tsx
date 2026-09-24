import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCT_IMAGES = [
  require('../../assets/products/keyboard-akko.jpg'),
  require('../../assets/products/keyboard-detail.jpg'),
  require('../../assets/products/monitor-dell-24.jpg'),
  require('../../assets/products/headphones-sony.jpg'),
];

const SPEC_GRID = [
  { label: 'LOẠI SWITCH', value: 'Akko Orange v2\n(Tactile)' },
  { label: 'CHẤT LIỆU KEYCAP', value: 'PBT Doubleshot\n(OEM)' },
  { label: 'TÌNH TRẠNG MÓD', value: 'Lube Kr4tox 205g0\n+ Lót foam' },
  { label: 'PHỤ KIỆN KÈM THEO', value: 'Fullbox, cáp\ntype-C, puller' },
];

const RELATED_PRODUCTS = [
  {
    id: 'r1',
    title: 'Chuột Logitech G304',
    price: '320.000đ',
    image: require('../../assets/products/mouse-g102.jpg'),
    location: 'Hola KTX',
  },
  {
    id: 'r2',
    title: 'Pad chuột đa 80x40',
    price: '70.000đ',
    image: require('../../assets/products/books-mas291.jpg'),
    location: 'Toa Gamma',
  },
  {
    id: 'r3',
    title: 'Màn Nit Ari 24"...',
    price: '850.000đ',
    image: require('../../assets/products/monitor-dell-24.jpg'),
    location: 'Toa Alpha',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface ProductDetailScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  onGoBack,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const imageListRef = useRef<FlatList>(null);

  const handlePrevImage = () => {
    const next = Math.max(0, currentImageIndex - 1);
    setCurrentImageIndex(next);
    imageListRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const handleNextImage = () => {
    const next = Math.min(PRODUCT_IMAGES.length - 1, currentImageIndex + 1);
    setCurrentImageIndex(next);
    imageListRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const handleBuyNow = () => {
    Alert.alert(
      '🛒 Đặt mua ngay',
      'Xác nhận thanh toán Escrow 650.000đ cho Bàn phím cơ Akko 3087 v2 Orange Switch?\n\nTiền sẽ được giữ an toàn đến khi bạn nhận hàng tại Safe-Point.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận thanh toán',
          onPress: () =>
            Alert.alert('✅ Đặt hàng thành công!', 'Người bán đã được thông báo. Hẹn gặp tại Sảnh Toa Alpha!'),
        },
      ]
    );
  };

  const handleChat = () => {
    Alert.alert('💬 Hẹn Safe-Handoff', 'Mở cuộc hội thoại với Vũ Hải để thỏa thuận thời gian gặp tại Safe-Point');
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* ═══════════════════════════════════════════════════════════
          1. HEADER
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={onGoBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* FPT Logo mini */}
        <View style={styles.headerCenter}>
          <View style={styles.headerLogoBox}>
            <Text style={styles.headerLogoText}>FPT</Text>
          </View>
          <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ sản phẩm này')}
          >
            <Ionicons name="share-social-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setIsSaved(!isSaved)}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? '#EA580C' : '#0F172A'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Chip */}
      <View style={styles.locationChipBar}>
        <View style={styles.locationChip}>
          <Ionicons name="location-sharp" size={12} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.locationChipText}>Hòa Lạc Campus</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══════════════════════════════════════════════════════════
            2. IMAGE CAROUSEL
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.imageCarouselContainer}>
          <FlatList
            ref={imageListRef}
            data={PRODUCT_IMAGES}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `img-${i}`}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setCurrentImageIndex(index);
            }}
            renderItem={({ item }) => (
              <Image
                source={item}
                style={styles.carouselImage}
                contentFit="cover"
              />
            )}
          />

          {/* Condition Badge top-left */}
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionBadgeText}>MỚI 97% • CÒN SẴN 2T</Text>
          </View>

          {/* Prev / Next arrows */}
          {currentImageIndex > 0 && (
            <TouchableOpacity style={[styles.carouselArrow, styles.carouselArrowLeft]} onPress={handlePrevImage}>
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {currentImageIndex < PRODUCT_IMAGES.length - 1 && (
            <TouchableOpacity style={[styles.carouselArrow, styles.carouselArrowRight]} onPress={handleNextImage}>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Image counter */}
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{PRODUCT_IMAGES.length}
            </Text>
          </View>

          {/* Dot indicators */}
          <View style={styles.dotsRow}>
            {PRODUCT_IMAGES.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentImageIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. PRICE & TITLE
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.mainPrice}>650.000đ</Text>
            <Text style={styles.oldPrice}>1.100.000đ</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-41%</Text>
            </View>
          </View>
          <Text style={styles.productTitle}>
            Bàn phím cơ Akko 3087 v2 Orange Switch (Đã lube mượt)
          </Text>
          <View style={styles.postedRow}>
            <Ionicons name="time-outline" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text style={styles.postedText}>Đăng 25 phút trước</Text>
            <Text style={styles.postedDot}> • </Text>
            <Ionicons name="location-outline" size={12} color="#94A3B8" style={{ marginRight: 3 }} />
            <Text style={styles.postedText}>Tại Sảnh Toa Alpha (Hola)</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. SELLER CARD
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.sellerCard}>
          {/* Avatar + Info */}
          <View style={styles.sellerTopRow}>
            <View style={styles.sellerAvatarBox}>
              <View style={styles.sellerAvatar}>
                <Ionicons name="person" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.sellerOnlineDot} />
            </View>

            <View style={styles.sellerInfoBox}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>Vũ Hải...</Text>
                <View style={styles.svVerifiedBadge}>
                  <Ionicons name="shield-checkmark" size={10} color="#059669" style={{ marginRight: 3 }} />
                  <Text style={styles.svVerifiedText}>Thẻ SV Verified</Text>
                </View>
              </View>
              <Text style={styles.sellerMssv}>MSSV: HE180291 • K18 Ai...</Text>
            </View>

            <TouchableOpacity
              style={styles.viewProfileBtn}
              activeOpacity={0.8}
              onPress={() => onTabChange && onTabChange('profile')}
            >
              <Text style={styles.viewProfileText}>Xem hồ sơ</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Metrics */}
          <View style={styles.sellerMetricsRow}>
            <View style={styles.sellerMetric}>
              <View style={styles.metricTopRow}>
                <MaterialCommunityIcons name="diamond" size={13} color="#7C3AED" style={{ marginRight: 3 }} />
                <Text style={styles.metricValue}>96/100</Text>
              </View>
              <Text style={styles.metricLabel}>Hạng Kim{'\n'}Cương</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.sellerMetric}>
              <Text style={styles.metricValue}>48 hoàn tất</Text>
              <Text style={styles.metricLabel}>deals</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.sellerMetric}>
              <View style={styles.metricTopRow}>
                <Ionicons name="chatbubble-outline" size={12} color="#1D4ED8" style={{ marginRight: 3 }} />
                <Text style={styles.metricValue}>~3 phút</Text>
              </View>
              <Text style={styles.metricLabel}>Phản hồi{'\n'}chat</Text>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            5. SAFE-HANDOFF POINT
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.safeHandoffCard}>
          {/* Header */}
          <View style={styles.safeHandoffHeader}>
            <View style={styles.shieldIconBox}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.safeHandoffLabel}>Safe-Handoff Point</Text>
              <Text style={styles.safeHandoffGuarantee}>ĐƯỢC BẢO CHỨNG BỞI FPT 5CAMPUS</Text>
            </View>
          </View>

          {/* Location Name */}
          <View style={styles.safeHandoffLocation}>
            <Ionicons name="location-sharp" size={16} color="#EA580C" style={{ marginRight: 8, marginTop: 2 }} />
            <View>
              <Text style={styles.safeHandoffName}>
                Sảnh Toa Alpha - Bàn test đồ điện số 04
              </Text>
              <Text style={styles.safeHandoffAddr}>
                Cách phòng tư học tầng trệt 15m, cạnh cây ATM
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.safeHandoffFeatures}>
            {[
              'Có camera an ninh 24/7 tại điểm bàn giao dịch',
              'Trang bị ổ cắm & cáp test liều liệu bàn phím',
              'Bảo vệ sẵn hỗ trợ giám sát giao dịch an toàn',
            ].map((feat, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 8, marginTop: 1 }} />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>

          {/* Map Thumbnail */}
          <View style={styles.mapThumbnail}>
            {/* Simulated map background */}
            <View style={styles.mapBg}>
              <MaterialCommunityIcons name="map-marker-radius" size={36} color="#EA580C" />
              <Text style={styles.mapBgText}>Sảnh Alpha • FPT Hòa Lạc</Text>
            </View>
            <View style={styles.mapActions}>
              <TouchableOpacity
                style={styles.mapViewBtn}
                activeOpacity={0.85}
                onPress={() => Alert.alert('Bản đồ', 'Mở bản đồ Safe-Point tại Hola Campus')}
              >
                <Ionicons name="map-outline" size={13} color="#1D4ED8" style={{ marginRight: 4 }} />
                <Text style={styles.mapViewBtnText}>Xem sơ đồ điểm hẹn tại Hola</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.directionsBtn}
                activeOpacity={0.85}
                onPress={() => Alert.alert('Chỉ đường', 'Mở Google Maps...')}
              >
                <Ionicons name="navigate" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.directionsBtnText}>Chỉ đường</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            6. THÔNG TIN CHI TIẾT & MÔ TẢ
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.detailCard}>
          <Text style={styles.detailCardTitle}>Thông tin chi tiết & Mô tả</Text>

          {/* Spec Grid 2x2 */}
          <View style={styles.specGrid}>
            {SPEC_GRID.map((spec, i) => (
              <View key={i} style={[styles.specCell, i % 2 === 0 && styles.specCellLeft]}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descText}>
              {`• Phím mềm chỉ đăng gõ code môt PRF192 và làm bài thi lab, không chơi game nặng. Keycap nhám mình không hề bóng mỡ, switch gõ này và đảm tay vi đã lube kỹ.\n\n• Lý do pass: Kỳ đổi sang dùng bàn phím layout 75% không dây để việt với viết bala mừng lên giáng đường tại Beta cho gọn.`}
            </Text>
          </View>

          {/* Guarantee Box */}
          <View style={styles.guaranteeBox}>
            <Ionicons name="checkmark-circle" size={15} color="#059669" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.guaranteeText}>
              <Text style={{ fontWeight: '800', color: '#059692' }}>Cam kết: </Text>
              Bảo toast 7 ngày tại phòng kỹ túc xá hoặc khoản tiền. Hoàn tiền 100% nếu phát hiện lỗi switch hoặc lõi mạch!
            </Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            7. ĐỒ CÔNG NGHỆ CÙNG CAMPUS (Related Products)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.relatedSection}>
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Đồ công nghệ cùng campus</Text>
            <TouchableOpacity onPress={() => onTabChange && onTabChange('explore')}>
              <Text style={styles.relatedSeeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
            {RELATED_PRODUCTS.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.relatedCard}
                activeOpacity={0.85}
                onPress={() => Alert.alert(product.title)}
              >
                <Image
                  source={product.image}
                  style={styles.relatedImage}
                  contentFit="cover"
                />
                <View style={styles.relatedLocationChip}>
                  <Text style={styles.relatedLocationText}>{product.location}</Text>
                </View>
                <View style={styles.relatedInfo}>
                  <Text style={styles.relatedProductTitle} numberOfLines={2}>{product.title}</Text>
                  <Text style={styles.relatedProductPrice}>{product.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Safety Note */}
        <View style={styles.safetyNote}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" style={{ marginRight: 6, marginTop: 1 }} />
          <Text style={styles.safetyNoteText}>
            Luôn kiểm tra bàn phím tại điểm Safe-Handoff do camera giám sát trước khi chuyển khoản tiền toàn
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          8. BOTTOM ACTION BAR
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Chat / Hẹn Safe-Handoff */}
        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.8}
          onPress={handleChat}
        >
          <View style={styles.chatBtnInner}>
            <View style={styles.chatMsgBadge}>
              <Text style={styles.chatMsgBadgeText}>1</Text>
            </View>
            <Ionicons name="chatbubble-ellipses" size={20} color="#1D4ED8" />
          </View>
          <Text style={styles.chatBtnText}>Hẹn Safe-Ha...</Text>
        </TouchableOpacity>

        {/* Buy Now */}
        <TouchableOpacity
          style={styles.buyNowBtn}
          activeOpacity={0.88}
          onPress={handleBuyNow}
        >
          <MaterialCommunityIcons name="credit-card-fast-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.buyNowText}>Mua ngay 💳</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  headerLogoBox: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  headerLogoText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },

  // Location Chip
  locationChipBar: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  locationChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    gap: 10,
    paddingBottom: 20,
  },

  // Image Carousel
  imageCarouselContainer: {
    position: 'relative',
    height: 260,
    backgroundColor: '#E2E8F0',
  },
  carouselImage: {
    width: SCREEN_W,
    height: 260,
  },
  conditionBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  conditionBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  carouselArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselArrowLeft: {
    left: 10,
  },
  carouselArrowRight: {
    right: 10,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 36,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 18,
  },

  // Price Section
  priceSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mainPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#EA580C',
  },
  oldPrice: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  postedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  postedText: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  postedDot: {
    fontSize: 11.5,
    color: '#CBD5E1',
  },

  // Seller Card
  sellerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  sellerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sellerAvatarBox: {
    position: 'relative',
  },
  sellerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  sellerInfoBox: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 3,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  svVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  svVerifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  sellerMssv: {
    fontSize: 11,
    color: '#64748B',
  },
  viewProfileBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewProfileText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  sellerMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sellerMetric: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },

  // Safe-Handoff Card
  safeHandoffCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#059669', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  safeHandoffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeHandoffLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 1,
  },
  safeHandoffGuarantee: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.4,
  },
  safeHandoffLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  safeHandoffName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 3,
  },
  safeHandoffAddr: {
    fontSize: 11,
    color: '#059669',
  },
  safeHandoffFeatures: {
    gap: 7,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 17,
  },
  mapThumbnail: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapBg: {
    height: 80,
    backgroundColor: '#E2EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mapBgText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  mapActions: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  mapViewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  mapViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EA580C',
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Detail Card
  detailCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  specCell: {
    width: '50%',
    padding: 11,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  specCellLeft: {
    backgroundColor: '#FFFFFF',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
    marginBottom: 5,
  },
  specValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  descSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  guaranteeText: {
    fontSize: 12,
    color: '#065F46',
    lineHeight: 17,
    flex: 1,
  },

  // Related
  relatedSection: {
    gap: 10,
    paddingHorizontal: 10,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  relatedSeeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  relatedScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  relatedCard: {
    width: 130,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  relatedImage: {
    width: '100%',
    height: 90,
  },
  relatedLocationChip: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(30,41,59,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  relatedLocationText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  relatedInfo: {
    padding: 9,
  },
  relatedProductTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 15,
  },
  relatedProductPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Safety Note
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  safetyNoteText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 16,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 8 },
    }),
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chatBtnInner: {
    position: 'relative',
  },
  chatMsgBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  chatMsgBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 13,
    backgroundColor: '#EA580C',
    ...Platform.select({
      ios: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 5 },
    }),
  },
  buyNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
