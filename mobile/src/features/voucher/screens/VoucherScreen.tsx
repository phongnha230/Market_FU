import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import VoucherHeader from '../components/VoucherHeader';
import CoinBanner from '../components/CoinBanner';
import VoucherTabs from '../components/VoucherTabs';
import VoucherCategoryFilter from '../components/VoucherCategoryFilter';
import VoucherSearchBar from '../components/VoucherSearchBar';
import VoucherCard from '../components/VoucherCard';
import UserVoucherCard from '../components/UserVoucherCard';
import VoucherQrModal from '../components/VoucherQrModal';

import useVoucher from '../hooks/useVoucher';
import {
  VoucherScreenProps,
  VoucherPageView,
  Voucher,
  UserVoucher,
  MyVoucherFilterKey,
} from '../types/voucher.types';

export const VoucherScreen: React.FC<VoucherScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    isAuthenticated,
    pageView,
    setPageView,
    activeCategory,
    setActiveCategory,
    categoryCounts,
    myVoucherFilter,
    setMyVoucherFilter,
    availableVouchers,
    totalAvailableCount,
    myVouchers,
    totalMyVouchersCount,
    unusedCount,
    selectedUserVoucher,
    setSelectedUserVoucher,
    coins,
    checkedInToday,
    streak,
    isCheckingIn,
    quests,
    refreshing,
    onRefresh,
    handleCheckIn,
    handleRedeemVoucher,
    handleConfirmUseVoucher,
    handleApplyCode,
    handleClaimQuest,
  } = useVoucher();

  const handleBack = useCallback(() => {
    if (onGoBack) onGoBack();
    else if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  }, [onGoBack, navigation]);

  const handleOpenHistory = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để xem Ví Xu Campus và săn thưởng nhiệm vụ!',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    try {
      navigation.navigate('CoinHistory');
    } catch {
      // Fallback
    }
  }, [isAuthenticated, navigation]);

  const handleViewChange = useCallback(
    (view: VoucherPageView) => {
      if (view === 'my_vouchers' && !isAuthenticated) {
        Alert.alert(
          'Yêu cầu đăng nhập',
          'Vui lòng đăng nhập để xem danh sách voucher đã đổi trong ví của bạn!',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
          ]
        );
        return;
      }
      setPageView(view);
    },
    [isAuthenticated, setPageView, navigation]
  );

  // Render Available Voucher in Store
  const renderStoreItem = useCallback(
    ({ item }: ListRenderItemInfo<Voucher>) => (
      <VoucherCard
        voucher={item}
        userCoins={coins}
        isAuthenticated={isAuthenticated}
        onRedeem={handleRedeemVoucher}
      />
    ),
    [coins, isAuthenticated, handleRedeemVoucher]
  );

  // Render User Voucher in My Vouchers
  const renderUserVoucherItem = useCallback(
    ({ item }: ListRenderItemInfo<UserVoucher>) => (
      <UserVoucherCard
        userVoucher={item}
        onOpenQr={(uv) => setSelectedUserVoucher(uv)}
      />
    ),
    [setSelectedUserVoucher]
  );

  // My Voucher filter pills definition
  const myVoucherFilters: { key: MyVoucherFilterKey; label: string }[] = useMemo(
    () => [
      { key: 'ALL', label: `Tất cả (${totalMyVouchersCount})` },
      { key: 'UNUSED', label: `🟢 Sẵn sàng dùng (${unusedCount})` },
      { key: 'USED', label: '✅ Đã dùng' },
      { key: 'EXPIRED', label: '⏳ Hết hạn' },
    ],
    [totalMyVouchersCount, unusedCount]
  );



  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <VoucherHeader onGoBack={handleBack} onOpenHistory={handleOpenHistory} />

      {pageView === 'store' ? (
        /* ================= VIEW 1: KHO ĐỔI VOUCHER ================= */
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          data={availableVouchers}
          keyExtractor={(item) => item.id}
          renderItem={renderStoreItem}
          ListHeaderComponent={
            <>
              {/* Coin balance & check-in */}
              <CoinBanner
                coins={coins}
                checkedInToday={checkedInToday}
                streak={streak}
                isLoadingCheckIn={isCheckingIn}
                onCheckIn={handleCheckIn}
                onOpenHistory={handleOpenHistory}
              />

              {/* Primary tab switcher */}
              <VoucherTabs
                pageView={pageView}
                onViewChange={handleViewChange}
                availableCount={totalAvailableCount}
                unusedCount={unusedCount}
              />

              {/* Search & apply code */}
              <VoucherSearchBar onApplyCode={handleApplyCode} />

              {/* Category filter */}
              <VoucherCategoryFilter
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                counts={categoryCounts}
              />

              {/* Section Header */}
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleBox}>
                  <Text style={styles.sectionTitle}>
                    Ưu đãi đang khả dụng ({availableVouchers.length})
                  </Text>
                  <View style={styles.syncBadge}>
                    <Ionicons name="shield-checkmark" size={11} color="#059669" />
                    <Text style={styles.syncBadgeText}>Đồng bộ Live Admin</Text>
                  </View>
                </View>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Không tìm thấy voucher phù hợp</Text>
              <Text style={styles.emptySubtitle}>
                Hãy chọn lại danh mục khác hoặc kéo xuống để làm mới dữ liệu.
              </Text>
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => setActiveCategory('all')}
              >
                <Text style={styles.emptyResetText}>Xem tất cả voucher</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <View style={{ marginTop: 20, marginBottom: 32, marginHorizontal: 16 }}>
              <TouchableOpacity
                style={styles.goToQuestsBanner}
                activeOpacity={0.85}
                onPress={handleOpenHistory}
              >
                <View style={styles.goToQuestsLeft}>
                  <Ionicons name="trophy" size={24} color="#EA580C" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goToQuestsTitle}>Săn thêm Campus Coins</Text>
                    <Text style={styles.goToQuestsSub}>
                      Hoàn thành nhiệm vụ tuần & điểm danh hàng ngày tại Ví Xu để nhận thêm coin đổi quà!
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#EA580C" />
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        /* ================= VIEW 2: VÍ VOUCHER CỦA TÔI ================= */
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
          }
          data={myVouchers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserVoucherItem}
          ListHeaderComponent={
            <>
              {/* Coin balance banner */}
              <CoinBanner
                coins={coins}
                checkedInToday={checkedInToday}
                streak={streak}
                isLoadingCheckIn={isCheckingIn}
                onCheckIn={handleCheckIn}
                onOpenHistory={handleOpenHistory}
              />

              {/* Primary tab switcher */}
              <VoucherTabs
                pageView={pageView}
                onViewChange={handleViewChange}
                availableCount={totalAvailableCount}
                unusedCount={unusedCount}
              />

              {/* Status Filter Pills */}
              <View style={styles.filterPillsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterPillsScroll}
                >
                  {myVoucherFilters.map((tab) => {
                    const isActive = myVoucherFilter === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        style={[styles.statusPill, isActive && styles.statusPillActive]}
                        activeOpacity={0.8}
                        onPress={() => setMyVoucherFilter(tab.key)}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            isActive && styles.statusPillTextActive,
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="ticket-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>
                {myVoucherFilter === 'UNUSED'
                  ? 'Bạn không có mã voucher nào chưa sử dụng'
                  : 'Bạn chưa có mã voucher nào trong mục này'}
              </Text>
              <Text style={styles.emptySubtitle}>
                Hãy dùng Campus Coins để đổi suất cơm Căn tin 10k, Passio Coffee 15k hoặc mã freeship tại Kho đổi nhé!
              </Text>
              <TouchableOpacity
                style={styles.emptyGoStoreBtn}
                onPress={() => setPageView('store')}
              >
                <Ionicons name="storefront-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyGoStoreText}>Đến Kho Đổi Voucher Ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* QR Code and Voucher Detail Modal */}
      <VoucherQrModal
        voucher={selectedUserVoucher}
        onClose={() => setSelectedUserVoucher(null)}
        onConfirmUse={handleConfirmUseVoucher}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  filterPillsContainer: {
    marginBottom: 12,
  },
  filterPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  statusPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 16,
  },
  emptyResetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  emptyResetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  emptyGoStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyGoStoreText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fallbackCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
  },
  fallbackCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fallbackIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  fallbackBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackBackBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  fallbackBackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  goToQuestsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 14,
  },
  goToQuestsLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  goToQuestsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 2,
  },
  goToQuestsSub: {
    fontSize: 11,
    color: '#C2410C',
    lineHeight: 15,
  },
});

export default VoucherScreen;
