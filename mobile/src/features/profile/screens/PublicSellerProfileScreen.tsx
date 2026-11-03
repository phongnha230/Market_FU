import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Share,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { profileMobileService } from '../../../services/profileMobileService';
import { productMobileService } from '../../../services/productMobileService';
import { reviewMobileService } from '../../../services/reviewMobileService';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore, OrderItem } from '../../../stores/orderStore';
import { useFavoriteStore } from '../../../stores/useFavoriteStore';
import { SellerHeroCard } from '../components/SellerHeroCard';
import { SellerTabBar } from '../components/SellerTabBar';
import { SellerProductsGrid } from '../components/SellerProductsGrid';
import { SellerReviewsList } from '../components/SellerReviewsList';
import { SellerBottomBar } from '../components/SellerBottomBar';
import { withRefreshTimeout } from '../../../utils/safeRefresh';
import { ReportModal } from '../../report/components/ReportModal';
import { ReviewDetailModal } from '../../review/components/ReviewDetailModal';

export const PublicSellerProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: currentUser, isAuthenticated } = useUserStore();
  const isVerified = Boolean(
    isAuthenticated &&
      (currentUser?.isKycVerified || currentUser?.kycStatus === 'APPROVED' || currentUser?.role === 'SELLER') &&
      currentUser?.kycStatus !== 'PENDING' &&
      currentUser?.kycStatus !== 'REJECTED'
  );

  const paramUserId = route.params?.userId;
  const paramSellerName = route.params?.sellerName || '';
  const targetIdOrName = paramUserId || paramSellerName || currentUser?.id || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'guarantee'>('listings');
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isSellerFollowed = useFavoriteStore((s) => s.isSellerFollowed);
  const toggleFollowSeller = useFavoriteStore((s) => s.toggleFollowSeller);
  const [products, setProducts] = useState<any[]>([]);

  // Reviews filtering state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    totalReceived: number;
    averageRating: number | null;
    ratingDistribution: Record<number, number>;
  }>({
    totalReceived: 0,
    averageRating: null,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewDirection, setReviewDirection] = useState<'received' | 'given'>('received');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [onlyHasImages, setOnlyHasImages] = useState(false);

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const fetchProfileData = useCallback(
    async (isMounted: () => boolean) => {
      try {
        const [profData, prodsData, reviewResult] = await Promise.all([
          profileMobileService.getPublicProfile(targetIdOrName),
          productMobileService.getProducts(),
          reviewMobileService.getUserReviews(targetIdOrName, {
            type: reviewDirection,
            rating: selectedRating ?? undefined,
            hasImages: onlyHasImages ? true : undefined,
          }),
        ]);

        if (!isMounted()) return;

        if (profData) {
          setProfile(profData);
        } else {
          setProfile({
            id: targetIdOrName,
            fullName: paramSellerName || 'Sinh viên FPT',
            campus: 'HÒA LẠC',
            role: 'SELLER',
            reputationScore: 100,
            dealCount: 0,
            rating: null,
            reviewCount: 0,
            createdAt: new Date().toISOString(),
          });
        }

        // Filter seller's products
        const sellerProducts = (prodsData || []).filter(
          (p: any) =>
            p.sellerId === targetIdOrName ||
            (profData?.userId && p.sellerId === profData.userId) ||
            (paramSellerName && p.sellerName === paramSellerName) ||
            (p.seller?.name && p.seller.name.toLowerCase() === paramSellerName.toLowerCase())
        );
        setProducts(sellerProducts);

        // Set reviews & stats
        if (reviewResult && reviewResult.reviews) {
          setReviews(reviewResult.reviews);
        } else {
          setReviews([]);
        }

        if (reviewResult && reviewResult.stats) {
          setReviewStats(reviewResult.stats);
        }
      } catch (err: any) {
        console.log('Error loading public profile:', err?.message);
      } finally {
        if (isMounted()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [targetIdOrName, paramSellerName, reviewDirection, selectedRating, onlyHasImages]
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProfileData(() => mounted);
    return () => {
      mounted = false;
    };
  }, [fetchProfileData]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    await withRefreshTimeout(async () => {
      await fetchProfileData(() => true);
    }, setRefreshing, 2000);
  }, [refreshing, fetchProfileData]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Xem gian hàng thanh lý của ${profile?.fullName || paramSellerName} trên FU Market: https://marketfu.fpt.edu.vn/seller/${targetIdOrName}`,
      });
    } catch {}
  }, [profile?.fullName, paramSellerName, targetIdOrName]);

  const handleOpenReport = useCallback(() => {
    setIsReportModalVisible(true);
  }, []);

  const handleCloseReport = useCallback(() => {
    setIsReportModalVisible(false);
  }, []);

  const sellerIdForFollow = useMemo(() => {
    return profile?.userId || profile?.id || targetIdOrName;
  }, [profile, targetIdOrName]);

  const isFollowing = useMemo(() => {
    return isSellerFollowed(sellerIdForFollow);
  }, [isSellerFollowed, sellerIdForFollow]);

  const handleToggleFollow = useCallback(() => {
    const nextState = toggleFollowSeller(sellerIdForFollow);
    const sName = profile?.fullName || paramSellerName || 'người bán này';
    if (nextState) {
      Alert.alert(
        '🔔 Đã theo dõi Shop!',
        `Bạn sẽ nhận được thông báo ngay khi shop ${sName} đăng bán món đồ mới.`
      );
    } else {
      Alert.alert('Đã hủy theo dõi', `Đã bỏ theo dõi shop ${sName}.`);
    }
  }, [toggleFollowSeller, sellerIdForFollow, profile?.fullName, paramSellerName]);

  const handlePressListings = useCallback(() => {
    setActiveTab('listings');
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 220, animated: true });
    }, 50);
  }, []);

  const handlePressReviews = useCallback(() => {
    setActiveTab('reviews');
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 220, animated: true });
    }, 50);
  }, []);

  const isOtherUser = useMemo(() => {
    const myId = currentUser?.id;
    const sellerId = profile?.userId || profile?.id || targetIdOrName;
    const isSameName =
      currentUser?.name &&
      profile?.fullName &&
      currentUser.name.trim().toLowerCase() === profile.fullName.trim().toLowerCase();
    return myId !== sellerId && !isSameName;
  }, [currentUser?.id, currentUser?.name, profile?.userId, profile?.id, profile?.fullName, targetIdOrName]);

  const handleOpenChat = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập bằng tài khoản FPT để nhắn tin với người bán.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (!isVerified) {
      Alert.alert(
        'Yêu cầu Xác thực Thẻ Sinh Viên',
        'Theo quy chế an toàn Market FU, chỉ sinh viên FPT đã xác thực thẻ SV mới được nhắn tin và giao dịch trên sàn.\n\nBạn có muốn nộp ảnh thẻ SV để xác thực ngay không?',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Xác thực ngay',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }),
          },
        ]
      );
      return;
    }

    if (!isOtherUser) {
      Alert.alert('Thông báo', 'Bạn không thể tự nhắn tin cho chính mình!');
      return;
    }
    navigation.navigate('ChatDetail', {
      partner: {
        id: profile?.userId || profile?.id || targetIdOrName,
        name: profile?.fullName || paramSellerName,
        cohort: profile?.campus || 'Sinh viên FPT',
        isOnline: true,
      },
      product: products[0] || undefined,
    });
  }, [navigation, isAuthenticated, isVerified, isOtherUser, profile?.userId, profile?.id, profile?.fullName, profile?.campus, paramSellerName, targetIdOrName, products]);

  const { orders, toggleReviewPublic } = useOrderStore();
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<OrderItem | null>(null);

  // Tìm xem người mua hiện tại đã có đơn hàng nào được đánh giá với Người Bán này chưa
  const myReviewedOrderWithSeller = useMemo(() => {
    return orders.find(
      (o) =>
        (o.sellerId === targetIdOrName ||
          (paramSellerName && o.sellerName?.toLowerCase() === paramSellerName.toLowerCase())) &&
        o.isReviewed
    );
  }, [orders, targetIdOrName, paramSellerName]);

  // Đánh giá từ người mua được hiển thị công khai ngay lập tức trên Profile người bán
  const displayedReviews = useMemo(() => {
    let list = [...reviews];
    if (myReviewedOrderWithSeller?.reviewData) {
      const alreadyInList = list.some(
        (r) => r.id === `my-rev-${myReviewedOrderWithSeller.id}` || r.orderId === myReviewedOrderWithSeller.id || r.id === myReviewedOrderWithSeller.id
      );
      if (!alreadyInList) {
        list.unshift({
          id: `my-rev-${myReviewedOrderWithSeller.id}`,
          rating: myReviewedOrderWithSeller.reviewData.rating,
          comment: myReviewedOrderWithSeller.reviewData.comment,
          images: myReviewedOrderWithSeller.reviewData.images,
          reviewerName: myReviewedOrderWithSeller.reviewData.isAnonymous
            ? 'Sinh viên FPT (Ẩn danh)'
            : (currentUser?.name || 'Tôi'),
          reviewerCampus: currentUser?.campus || 'Hòa Lạc',
          createdAt: myReviewedOrderWithSeller.reviewData.reviewedAt || 'Vừa xong',
          productTitle: myReviewedOrderWithSeller.productTitle,
        });
      }
    }
    return list;
  }, [reviews, myReviewedOrderWithSeller, currentUser]);

  const displayedStats = useMemo(() => {
    if (displayedReviews.length > 0) {
      const total = displayedReviews.length;
      const sum = displayedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = Number((sum / total).toFixed(1));
      const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      displayedReviews.forEach((r) => {
        const star = Math.round(Number(r.rating) || 5);
        if (dist[star] !== undefined) dist[star]++;
      });
      return {
        totalReceived: total,
        averageRating: avg,
        ratingDistribution: dist,
      };
    }
    return (
      reviewStats || {
        totalReceived: 0,
        averageRating: null,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }
    );
  }, [displayedReviews, reviewStats]);

  const handleOpenMyReviewDetail = useCallback((order: OrderItem) => {
    setSelectedReviewOrder(order);
  }, []);

  const handleToggleReviewPublic = useCallback(
    async (orderId: string) => {
      try {
        await reviewMobileService.toggleReviewPublic(orderId);
      } catch (err: any) {
        console.log('toggleReviewPublic error:', err?.message);
      }
      toggleReviewPublic(orderId);
      Alert.alert('⚡ Cập nhật hiển thị', 'Đã thay đổi trạng thái công khai của đánh giá!');
    },
    [toggleReviewPublic]
  );

  const handleEditReviewFromModal = useCallback(
    (order: OrderItem) => {
      navigation.navigate('Review', {
        orderId: order.orderNumber || order.id,
        productTitle: order.productTitle,
        sellerName: order.sellerName,
        productImage: order.productImage,
        sellerCampus: order.sellerCampus,
        sellerCohort: order.sellerCohort,
        isEditing: true,
        initialReviewData: order.reviewData,
      });
    },
    [navigation]
  );

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'Home' });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Hồ sơ Người Bán
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={19} color="#0F172A" />
          </TouchableOpacity>
          {isOtherUser && isAuthenticated && isVerified && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleOpenReport} activeOpacity={0.7}>
              <Ionicons name="flag-outline" size={19} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isAuthenticated || !isVerified ? (
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconCircle}>
            <Ionicons name="shield-checkmark" size={44} color="#EA580C" />
          </View>
          <Text style={styles.lockedTitle}>Hồ Sơ Được Bảo Vệ Bởi Market FU</Text>
          <Text style={styles.lockedDesc}>
            {!isAuthenticated
              ? 'Theo quy chế an toàn, bạn cần đăng nhập bằng tài khoản sinh viên FPT để xem hồ sơ và kết nối với Người bán này.'
              : 'Theo quy chế an toàn Market FU, chỉ sinh viên FPT đã hoàn tất xác thực Thẻ Sinh Viên (KYC) mới có quyền xem thông tin cá nhân và nhắn tin với Người bán.'}
          </Text>

          <TouchableOpacity
            style={styles.lockedActionBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (!isAuthenticated) {
                navigation.navigate('Login');
              } else {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            }}
          >
            <Ionicons
              name={!isAuthenticated ? 'log-in-outline' : 'card-outline'}
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.lockedActionBtnText}>
              {!isAuthenticated ? 'Đăng Nhập Tài Khoản FPT' : 'Xác Thực Thẻ Sinh Viên Ngay'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lockedBackBtn}
            activeOpacity={0.75}
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('MainTabs', { screen: 'Home' });
            }}
          >
            <Text style={styles.lockedBackBtnText}>Quay lại trang trước</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Đang tải thông tin người bán...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
        >
          <View style={styles.mainWrapper}>
            {/* 1. Hero Profile Card (Real Metrics) */}
            <SellerHeroCard
              profile={profile}
              paramSellerName={paramSellerName}
              productsCount={products.length}
              reviewsCount={displayedStats.totalReceived}
              averageRating={displayedStats.averageRating}
              onPressListings={handlePressListings}
              onPressReviews={handlePressReviews}
              isFollowing={isFollowing}
              onToggleFollow={handleToggleFollow}
              canFollow={isOtherUser}
            />

            {/* 2. Tab Bar: Đang bán / Đánh giá / FPT Care */}
            <SellerTabBar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              productsCount={products.length}
              reviewsCount={displayedStats.totalReceived}
            />

            {/* 3. Tab Contents */}
            <View style={styles.tabContent}>
              {/* TAB 1: SẢN PHẨM ĐANG BÁN */}
              {activeTab === 'listings' && (
                <SellerProductsGrid
                  products={products}
                  onSelectProduct={(id) => navigation.navigate('ProductDetail', { productId: id })}
                  isFollowing={isFollowing}
                  onToggleFollow={handleToggleFollow}
                  canFollow={isOtherUser}
                />
              )}

              {/* TAB 2: ĐÁNH GIÁ 2 CHIỀU & BỘ LỌC */}
              {activeTab === 'reviews' && (
                <SellerReviewsList
                  reviews={displayedReviews}
                  stats={displayedStats}
                  reviewDirection={reviewDirection}
                  onChangeDirection={setReviewDirection}
                  selectedRating={selectedRating}
                  onSelectRating={setSelectedRating}
                  onlyHasImages={onlyHasImages}
                  onToggleOnlyHasImages={() => setOnlyHasImages(!onlyHasImages)}
                  myBlindReview={undefined}
                  onOpenMyReviewDetail={handleOpenMyReviewDetail}
                  onToggleReviewPublic={handleToggleReviewPublic}
                />
              )}

              {/* TAB 3: CAM KẾT AN TÂM FPT CARE */}
              {activeTab === 'guarantee' && (
                <View style={styles.guaranteeWrapper}>
                  <View style={styles.guaranteeCard}>
                    <View style={[styles.guaranteeIcon, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#059669" />
                    </View>
                    <View style={styles.guaranteeTextCol}>
                      <Text style={styles.guaranteeTitle}>Giao dịch Safe-Point 24/7</Text>
                      <Text style={styles.guaranteeDesc}>
                        Hẹn gặp trực tiếp tại bàn test đồ sảnh Alpha/Beta campus, có camera giám sát và ổ cắm điện kiểm tra máy móc.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.guaranteeCard}>
                    <View style={[styles.guaranteeIcon, { backgroundColor: '#FFF7ED' }]}>
                      <Ionicons name="lock-closed" size={20} color="#EA580C" />
                    </View>
                    <View style={styles.guaranteeTextCol}>
                      <Text style={styles.guaranteeTitle}>Bảo chứng Escrow 48h</Text>
                      <Text style={styles.guaranteeDesc}>
                        Tiền thanh toán được giữ an toàn trên ví ký quỹ ĐH FPT. Người mua yên tâm kiểm tra 48h trước khi tiền giải ngân cho người bán.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.guaranteeCard}>
                    <View style={[styles.guaranteeIcon, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="bus" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.guaranteeTextCol}>
                      <Text style={styles.guaranteeTitle}>Xe FPT Bus Handoff</Text>
                      <Text style={styles.guaranteeDesc}>
                        Hỗ trợ vận chuyển đồ liên cơ sở qua các chuyến xe buýt nội bộ trường (Hola, Đà Nẵng, Quy Nhơn, HCM, Cần Thơ).
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Sticky Action Bar */}
      {isOtherUser && isAuthenticated && isVerified && (
        <SellerBottomBar onOpenChat={handleOpenChat} insetsBottom={insets.bottom} />
      )}

      <ReportModal
        visible={isReportModalVisible}
        onClose={handleCloseReport}
        targetType="USER"
        targetId={profile?.userId || profile?.id || targetIdOrName}
        targetTitle={profile?.fullName || paramSellerName}
      />

      <ReviewDetailModal
        visible={!!selectedReviewOrder}
        order={selectedReviewOrder}
        isSeller={false}
        onClose={() => setSelectedReviewOrder(null)}
        onEditReview={handleEditReviewFromModal}
      />
    </View>
  );
};

export default PublicSellerProfileScreen;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  centerLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 13, color: '#64748B', fontWeight: '600' },
  scrollContent: { paddingBottom: 100 },
  mainWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  tabContent: { marginTop: 6 },
  guaranteeWrapper: { gap: 10 },
  guaranteeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    alignItems: 'flex-start',
  },
  guaranteeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeTextCol: { flex: 1 },
  guaranteeTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  guaranteeDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  lockedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  lockedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
  },
  lockedActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  lockedBackBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  lockedBackBtnText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
});
