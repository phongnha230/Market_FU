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

const DEFAULT_REVIEWS: any[] = [];

export const PublicSellerProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: currentUser } = useUserStore();

  const paramUserId = route.params?.userId;
  const paramSellerName = route.params?.sellerName || '';
  const userId = paramUserId || (paramSellerName ? '' : currentUser?.id || '');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const fetchProfileData = useCallback(
    (isMounted: () => boolean) => {
      return Promise.all([
        profileMobileService.getPublicProfile(userId),
        productMobileService.getProducts(),
        reviewMobileService.getUserReviews(userId),
      ])
        .then(([profData, prodsData, reviewsData]) => {
          if (!isMounted()) return;
          if (profData) {
            setProfile(profData);
          } else {
            setProfile({
              id: userId,
              fullName: paramSellerName,
              campus: 'HÒA LẠC',
              role: 'SELLER',
              avatarBadge: '',
              reputationScore: 100,
              createdAt: new Date().toISOString(),
              _count: {
                products: 0,
                receivedReviews: 0,
              },
            });
          }

          const sellerProducts = (prodsData || []).filter(
            (p: any) => p.sellerId === userId || (paramSellerName && p.sellerName === paramSellerName)
          );
          setProducts(sellerProducts);

          if (reviewsData && reviewsData.length > 0) {
            setReviews(reviewsData);
          } else {
            setReviews([]);
          }
        })
        .catch((err: any) => {
          console.log('Error loading public profile:', err?.message);
        })
        .finally(() => {
          if (isMounted()) {
            setLoading(false);
            setRefreshing(false);
          }
        });
    },
    [userId, paramSellerName]
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
        message: `Xem gian hàng thanh lý của ${profile?.fullName || paramSellerName} trên FU Market: https://marketfu.fpt.edu.vn/seller/${userId}`,
      });
    } catch {}
  }, [profile?.fullName, paramSellerName, userId]);

  const handleOpenReport = useCallback(() => {
    setIsReportModalVisible(true);
  }, []);

  const handleCloseReport = useCallback(() => {
    setIsReportModalVisible(false);
  }, []);

  const handleOpenChat = useCallback(() => {
    navigation.navigate('ChatDetail', {
      partner: {
        id: userId,
        name: profile?.fullName || paramSellerName,
        cohort: profile?.campus || 'Sinh viên FPT',
        isOnline: true,
      },
      product: products[0] || undefined,
    });
  }, [navigation, userId, profile?.fullName, profile?.campus, paramSellerName, products]);

  const isOtherUser = useMemo(() => currentUser?.id !== userId, [currentUser?.id, userId]);

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
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Hồ sơ Người Bán
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleOpenReport} activeOpacity={0.7}>
            <Ionicons name="flag-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Đang tải thông tin gian hàng...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
        >
          <SellerHeroCard
            profile={profile}
            paramSellerName={paramSellerName}
            productsCount={products.length}
            reviewsCount={reviews.length}
          />

          <SellerTabBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            productsCount={products.length}
            reviewsCount={reviews.length}
          />

          <View style={styles.tabContent}>
            {activeTab === 'listings' ? (
              <SellerProductsGrid
                products={products}
                onSelectProduct={(id) => navigation.navigate('ProductDetail', { productId: id })}
              />
            ) : (
              <SellerReviewsList reviews={reviews} />
            )}
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
        targetId={userId}
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
  headerBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
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
  scrollContent: { paddingBottom: 90 },
  tabContent: { paddingHorizontal: 16, marginTop: 12 },
});
