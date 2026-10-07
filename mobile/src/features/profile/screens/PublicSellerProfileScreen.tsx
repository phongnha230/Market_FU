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
import { SellerHeroCard } from '../components/SellerHeroCard';
import { SellerTabBar } from '../components/SellerTabBar';
import { SellerProductsGrid } from '../components/SellerProductsGrid';
import { SellerReviewsList } from '../components/SellerReviewsList';
import { SellerBottomBar } from '../components/SellerBottomBar';
import { ReportModal } from '../../report/components/ReportModal';

export const PublicSellerProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: currentUser } = useUserStore();

  const paramUserId = route.params?.userId;
  const paramSellerName = route.params?.sellerName || '';
  const targetIdOrName = paramUserId || paramSellerName || currentUser?.id || '';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'guarantee'>('listings');
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData(() => true);
  }, [fetchProfileData]);

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
  }, [navigation, isOtherUser, profile?.userId, profile?.id, profile?.fullName, profile?.campus, paramSellerName, targetIdOrName, products]);

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
          {isOtherUser && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleOpenReport} activeOpacity={0.7}>
              <Ionicons name="flag-outline" size={19} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Đang tải thông tin người bán...</Text>
        </View>
      ) : (
        <ScrollView
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
              reviewsCount={reviewStats.totalReceived}
            />

            {/* 2. Tab Bar: Đang bán / Đánh giá / FPT Care */}
            <SellerTabBar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              productsCount={products.length}
              reviewsCount={reviewStats.totalReceived}
            />

            {/* 3. Tab Contents */}
            <View style={styles.tabContent}>
              {/* TAB 1: SẢN PHẨM ĐANG BÁN */}
              {activeTab === 'listings' && (
                <SellerProductsGrid
                  products={products}
                  onSelectProduct={(id) => navigation.navigate('ProductDetail', { productId: id })}
                />
              )}

              {/* TAB 2: ĐÁNH GIÁ 2 CHIỀU & BỘ LỌC */}
              {activeTab === 'reviews' && (
                <SellerReviewsList
                  reviews={reviews}
                  stats={reviewStats}
                  reviewDirection={reviewDirection}
                  onChangeDirection={setReviewDirection}
                  selectedRating={selectedRating}
                  onSelectRating={setSelectedRating}
                  onlyHasImages={onlyHasImages}
                  onToggleOnlyHasImages={() => setOnlyHasImages(!onlyHasImages)}
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
      {isOtherUser && (
        <SellerBottomBar onOpenChat={handleOpenChat} insetsBottom={insets.bottom} />
      )}

      <ReportModal
        visible={isReportModalVisible}
        onClose={handleCloseReport}
        targetType="USER"
        targetId={profile?.userId || profile?.id || targetIdOrName}
        targetTitle={profile?.fullName || paramSellerName}
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
});
