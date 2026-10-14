import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { profileMobileService } from '../../../services/profileMobileService';
import { useUserStore } from '../../../stores/userStore';
import { useKho } from '../../../context/KhoContext';

function getTimeUntilWeeklyReset(): string {
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dayOfWeek = nowVN.getUTCDay(); // 0=CN, 1=T2, ..., 6=T7
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  const nextMondayVN = new Date(nowVN);
  nextMondayVN.setUTCHours(0, 0, 0, 0);
  nextMondayVN.setUTCDate(nextMondayVN.getUTCDate() + daysUntilNextMonday);

  const diffMs = nextMondayVN.getTime() - nowVN.getTime();
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days <= 0) {
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  }
  return `${days} ngày ${hours} giờ`;
}

function getStartOfWeekUTC(): Date {
  const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const dayOfWeek = nowVN.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeekVN = new Date(nowVN);
  startOfWeekVN.setUTCHours(0, 0, 0, 0);
  startOfWeekVN.setUTCDate(startOfWeekVN.getUTCDate() - daysFromMonday);
  return new Date(startOfWeekVN.getTime() - 7 * 60 * 60 * 1000);
}

export type CoinFilterType = 'all' | 'in' | 'out' | 'quests';

interface QuestItem {
  id: string;
  title: string;
  coins: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  isEligible: boolean;
  statusText: string;
  actionLabel: string;
  targetScreen?: string;
}

export const CoinHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUser } = useUserStore();
  const { myListings, myBuyOrders, mySellOrders } = useKho();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<CoinFilterType>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [claimedLocalIds, setClaimedLocalIds] = useState<string[]>([]);

  // Tải dữ liệu lịch sử thật từ Backend API
  const loadHistory = useCallback(async () => {
    try {
      const data = await profileMobileService.getCoinHistory();
      if (data && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const { authMobileService } = await import('../../../services/authMobileService');
      const me = await authMobileService.getMe();
      if (me) updateUser(me);
    } catch {}
    await loadHistory();
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await profileMobileService.checkInDaily();
      Alert.alert(
        '🎉 Điểm danh thành công!',
        `Bạn nhận được +${res?.coinsEarned || 20} Xu. Chuỗi điểm danh: ${res?.streak || 1} ngày liên tiếp!`
      );
      const { authMobileService } = await import('../../../services/authMobileService');
      const me = await authMobileService.getMe();
      if (me) updateUser(me);
      await loadHistory();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message;
      Alert.alert('Thông báo', msg || 'Hôm nay bạn đã điểm danh rồi, hãy quay lại vào ngày mai nhé!');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Kiểm tra quest đã nhận thưởng trong tuần hiện tại chưa
  const isQuestClaimedThisWeek = useCallback(
    (questId: string) => {
      if (claimedLocalIds.includes(questId)) return true;
      const startOfWeek = getStartOfWeekUTC();
      return transactions.some(
        (t) =>
          t.type === 'QUEST_REWARD' &&
          (t.referenceId === questId || (t.description && t.description.includes(questId))) &&
          new Date(t.createdAt) >= startOfWeek
      );
    },
    [transactions, claimedLocalIds]
  );

  // Nhận thưởng nhiệm vụ tuần
  const handleClaimQuest = async (quest: QuestItem) => {
    setClaimingQuestId(quest.id);
    try {
      await profileMobileService.claimQuest(quest.id, quest.coins);
      setClaimedLocalIds((prev) => [...prev, quest.id]);
      Alert.alert(
        '🎉 Nhận thưởng thành công!',
        `Bạn đã nhận được +${quest.coins} Xu từ nhiệm vụ "${quest.title}". Xu đã được cộng trực tiếp vào ví!`
      );

      // Cập nhật lại số dư người dùng & sổ cái
      const { authMobileService } = await import('../../../services/authMobileService');
      const me = await authMobileService.getMe();
      if (me) updateUser(me);
      await loadHistory();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message;
      Alert.alert('Thông báo', msg || 'Nhiệm vụ này bạn đã nhận thưởng trong tuần hiện tại rồi!');
      setClaimedLocalIds((prev) => [...prev, quest.id]);
    } finally {
      setClaimingQuestId(null);
    }
  };

  // Điều kiện thực tế của từng nhiệm vụ
  const isKycOrSeller = Boolean(
    user?.role === 'SELLER' ||
    user?.isKycVerified ||
    user?.kycStatus === 'APPROVED'
  );

  const hasPostedItems = Boolean(
    (myListings && myListings.length > 0) || user?.role === 'SELLER'
  );

  const hasSafePointTransactions = Boolean(
    (myBuyOrders && myBuyOrders.some((o) => o.status === 'COMPLETED' || o.orderType === 'MEETUP')) ||
    (mySellOrders && mySellOrders.some((o) => o.status === 'COMPLETED' || o.orderType === 'MEETUP'))
  );

  const hasReviewedOrders = Boolean(
    myBuyOrders && myBuyOrders.some((o) => o.isReviewed)
  );

  // Danh sách 4 nhiệm vụ chuẩn khớp với Backend Whitelist & Admin
  const quests: QuestItem[] = useMemo(() => [
    {
      id: 'quest-kyc',
      title: 'Xác thực KYC Thẻ SV & Mail FPT',
      coins: 100,
      description: 'Liên kết bảo mật tài khoản SSO @fpt.edu.vn kích hoạt huy hiệu sinh viên chuẩn 5Campus.',
      icon: 'shield-checkmark',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      isEligible: isKycOrSeller,
      statusText: isKycOrSeller ? '✅ Đã xác minh Thẻ SV FPT chính chủ' : 'Chưa xác thực thẻ SV',
      actionLabel: 'Xác thực ngay',
      targetScreen: 'AccountSettings',
    },
    {
      id: 'quest-post',
      title: 'Đăng bán 01 món đồ học tập cũ không dùng',
      coins: 30,
      description: 'Pass lại máy tính Casio, giáo trình kỳ trước hoặc phụ kiện KTX cho các em khóa dưới.',
      icon: 'add-circle',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      isEligible: hasPostedItems,
      statusText: hasPostedItems
        ? `Tiến độ: ${Math.max(1, myListings?.length || 1)} / 1 món (Đã đạt)`
        : 'Tiến độ: 0 / 1 món',
      actionLabel: 'Đăng bán ngay',
      targetScreen: 'PostItem',
    },
    {
      id: 'quest-safepoint',
      title: 'Giao dịch an toàn tại Safe-Handoff Point',
      coins: 40,
      description: 'Giao nhận tại Sảnh Tòa Alpha, Beta hoặc Bàn Tiếp nhận Thư viện trường.',
      icon: 'location',
      iconBg: '#FAF5FF',
      iconColor: '#9333EA',
      isEligible: hasSafePointTransactions,
      statusText: hasSafePointTransactions
        ? '✅ Đã hoàn tất giao dịch tại Safe-Point'
        : 'Chưa có giao dịch tại Safe-Point tuần này',
      actionLabel: 'Xem điểm hẹn',
      targetScreen: 'SafePointHubs',
    },
    {
      id: 'quest-review',
      title: 'Đánh giá kèm ảnh sau khi nhận đồ',
      coins: 50,
      description: 'Giúp cộng đồng sinh viên minh bạch chất lượng đồ cũ đã qua sử dụng và tăng điểm uy tín.',
      icon: 'star',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      isEligible: hasReviewedOrders,
      statusText: hasReviewedOrders
        ? '✅ Đã đánh giá đơn hàng'
        : 'Đánh giá 5 sao kèm hình ảnh sau khi nhận hàng',
      actionLabel: 'Đánh giá ngay',
      targetScreen: 'Orders',
    },
  ], [isKycOrSeller, hasPostedItems, myListings?.length, hasSafePointTransactions, hasReviewedOrders]);

  // Đếm số quest sẵn sàng nhận thưởng
  const claimableQuestsCount = useMemo(() => {
    return quests.filter((q) => q.isEligible && !isQuestClaimedThisWeek(q.id)).length;
  }, [quests, isQuestClaimedThisWeek]);

  // Lọc lịch sử sổ cái theo tab
  const filteredTransactions = useMemo(() => {
    if (filter === 'in') return transactions.filter((t) => t.amount > 0);
    if (filter === 'out') return transactions.filter((t) => t.amount < 0);
    return transactions;
  }, [transactions, filter]);

  const getTxMeta = (type: string, amount: number) => {
    if (amount > 0) {
      return {
        icon: 'sparkles',
        iconBg: '#ECFDF5',
        iconColor: '#059669',
        label: 'Cộng Xu thưởng',
      };
    }
    if (type.includes('VOUCHER')) {
      return {
        icon: 'ticket',
        iconBg: '#FFF7ED',
        iconColor: '#EA580C',
        label: 'Đổi Voucher',
      };
    }
    if (type.includes('BOOST')) {
      return {
        icon: 'rocket',
        iconBg: '#EFF6FF',
        iconColor: '#2563EB',
        label: 'Đẩy tin Top',
      };
    }
    return {
      icon: 'cart',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
      label: 'Sử dụng Xu',
    };
  };

  const timeUntilReset = useMemo(() => getTimeUntilWeeklyReset(), []);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      {/* 1. Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'Profile' });
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ví Xu Campus (Coins)</Text>

        <TouchableOpacity
          style={styles.voucherNavBtn}
          onPress={() => navigation.navigate('Voucher')}
          activeOpacity={0.7}
        >
          <Ionicons name="gift-outline" size={18} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.voucherNavText}>Kho Voucher</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
      >
        {/* 2. Banner Số dư Xu khả dụng */}
        <View style={styles.coinBanner}>
          <View style={styles.coinTopRow}>
            <View>
              <Text style={styles.coinLabel}>SỐ DƯ XU KHẢ DỤNG</Text>
              <View style={styles.amountRow}>
                <Ionicons name="sparkles" size={24} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.coinAmount}>{(user?.coins ?? 0).toLocaleString('vi-VN')}</Text>
                <Text style={styles.coinUnit}>Xu</Text>
              </View>
              <Text style={styles.coinEquiv}>
                ≈ {((user?.coins ?? 0) * 100).toLocaleString('vi-VN')} đ dùng đổi Voucher & Đẩy tin
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkInBtn}
              activeOpacity={0.85}
              onPress={handleCheckIn}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="calendar" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.checkInBtnText}>Điểm danh</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Dải thông số nhanh */}
          <View style={styles.coinFooterBar}>
            <View style={styles.footerItem}>
              <Text style={styles.footerItemVal}>+20 Xu / ngày</Text>
              <Text style={styles.footerItemLabel}>Điểm danh</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerItemVal}>+100 Xu</Text>
              <Text style={styles.footerItemLabel}>Xác thực Thẻ SV</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerItemVal}>+30 Xu / bài</Text>
              <Text style={styles.footerItemLabel}>Đăng bán đồ cũ</Text>
            </View>
          </View>
        </View>

        {/* 3. Thanh Tab lọc ngang hàng (Gồm cả tab Nhiệm vụ săn Xu) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>
              Tất cả ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'in' && styles.filterBtnActive]}
            onPress={() => setFilter('in')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, filter === 'in' && styles.filterBtnTextActive]}>
              Nhận Xu (+)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'out' && styles.filterBtnActive]}
            onPress={() => setFilter('out')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, filter === 'out' && styles.filterBtnTextActive]}>
              Dùng Xu (-)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'quests' && styles.filterBtnActiveQuests]}
            onPress={() => setFilter('quests')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trophy"
              size={13}
              color={filter === 'quests' ? '#EA580C' : '#64748B'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.filterBtnText, filter === 'quests' && styles.filterBtnTextActiveQuests]}>
              Nhiệm vụ {claimableQuestsCount > 0 ? `(+${claimableQuestsCount})` : ''}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ================= PHẦN NỘI DUNG THEO TAB ================= */}
        {filter === 'quests' ? (
          /* TAB 4: NHIỆM VỤ SĂN XU */
          <View style={styles.questsSection}>
            {/* Countdown Timeline Banner */}
            <View style={styles.timelineBanner}>
              <View style={styles.timelineHeader}>
                <Ionicons name="time" size={16} color="#EA580C" style={{ marginRight: 6 }} />
                <Text style={styles.timelineTitle}>LÀM MỚI NHIỆM VỤ SAU:</Text>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownText}>{timeUntilReset}</Text>
                </View>
              </View>
              <Text style={styles.timelineSub}>
                Hệ thống tự động làm mới hạn ngạch nhận thưởng vào 00:00 Thứ Hai hàng tuần (UTC+7).
              </Text>
            </View>

            <Text style={styles.sectionTitle}>DANH SÁCH NHIỆM VỤ TUẦN NÀY</Text>

            {quests.map((q) => {
              const isClaimed = isQuestClaimedThisWeek(q.id);
              const isClaiming = claimingQuestId === q.id;

              return (
                <View key={q.id} style={styles.questCard}>
                  <View style={[styles.questIconBox, { backgroundColor: q.iconBg }]}>
                    <Ionicons name={q.icon} size={22} color={q.iconColor} />
                  </View>

                  <View style={styles.questInfo}>
                    <View style={styles.questTitleRow}>
                      <Text style={styles.questTitle}>{q.title}</Text>
                      <View style={styles.questRewardBadge}>
                        <Text style={styles.questRewardText}>+{q.coins} Xu</Text>
                      </View>
                    </View>

                    <Text style={styles.questDesc} numberOfLines={2}>
                      {q.description}
                    </Text>

                    <Text
                      style={[
                        styles.questStatusText,
                        isClaimed
                          ? styles.statusClaimed
                          : q.isEligible
                          ? styles.statusEligible
                          : styles.statusPending,
                      ]}
                    >
                      {isClaimed ? '✅ Đã nhận thưởng tuần này' : q.statusText}
                    </Text>
                  </View>

                  <View style={styles.questActionCol}>
                    {isClaimed ? (
                      <View style={styles.claimedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                        <Text style={styles.claimedText}>Đã nhận</Text>
                      </View>
                    ) : q.isEligible ? (
                      <TouchableOpacity
                        style={styles.claimBtn}
                        activeOpacity={0.85}
                        disabled={isClaiming}
                        onPress={() => handleClaimQuest(q)}
                      >
                        {isClaiming ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.claimBtnText}>Nhận thưởng</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.linkActionBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (q.targetScreen) navigation.navigate(q.targetScreen);
                        }}
                      >
                        <Text style={styles.linkActionText}>{q.actionLabel}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* TABS 1, 2, 3: LỊCH SỬ BIẾN ĐỘNG SỔ CÁI */
          <View>
            <Text style={styles.sectionTitle}>LỊCH SỬ BIẾN ĐỘNG SỔ CÁI</Text>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#EA580C" />
                <Text style={styles.loadingText}>Đang tải lịch sử giao dịch Xu...</Text>
              </View>
            ) : filteredTransactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={42} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Chưa có biến động Xu</Text>
                <Text style={styles.emptySub}>
                  Hãy tham gia điểm danh hàng ngày hoặc hoàn thành nhiệm vụ để tích lũy Campus Coins!
                </Text>
              </View>
            ) : (
              filteredTransactions.map((tx) => {
                const meta = getTxMeta(tx.type, tx.amount);
                const isPlus = tx.amount > 0;
                const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay';
                const timeStr = tx.createdAt
                  ? new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <View key={tx.id} style={styles.txCard}>
                    <View style={[styles.txIconBg, { backgroundColor: meta.iconBg }]}>
                      <Ionicons name={meta.icon as any} size={18} color={meta.iconColor} />
                    </View>

                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={2}>
                        {tx.description || meta.label}
                      </Text>
                      <Text style={styles.txTime}>
                        {dateStr} {timeStr} • Số dư sau: {(tx.balanceAfter ?? user?.coins ?? 0).toLocaleString('vi-VN')} Xu
                      </Text>
                    </View>

                    <View style={styles.txAmountCol}>
                      <Text style={[styles.txAmount, isPlus ? styles.txAmountPlus : styles.txAmountMinus]}>
                        {isPlus ? `+${tx.amount}` : tx.amount} Xu
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

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
  backBtn: { padding: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  voucherNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  voucherNavText: { fontSize: 12, fontWeight: '700', color: '#EA580C' },
  scrollContent: { paddingBottom: 40 },
  coinBanner: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  coinTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinLabel: { fontSize: 10, fontWeight: '800', color: '#A5B4FC', letterSpacing: 0.5 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  coinAmount: { fontSize: 28, fontWeight: '900', color: '#FFFFFF' },
  coinUnit: { fontSize: 14, fontWeight: '800', color: '#FCD34D', marginLeft: 4 },
  coinEquiv: { fontSize: 11, color: '#C7D2FE', marginTop: 4 },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  checkInBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  coinFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  footerItem: { flex: 1, alignItems: 'center' },
  footerItemVal: { fontSize: 11, fontWeight: '800', color: '#6EE7B7' },
  footerItemLabel: { fontSize: 9.5, color: '#CBD5E1', marginTop: 1 },
  footerDivider: { width: 1, height: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  filterContainer: {
    marginTop: 14,
    marginHorizontal: 16,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  filterBtnActiveQuests: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  filterBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterBtnTextActive: { color: '#EA580C', fontWeight: '800' },
  filterBtnTextActiveQuests: { color: '#EA580C', fontWeight: '800' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 18,
    letterSpacing: 0.5,
  },
  loadingBox: { padding: 30, alignItems: 'center' },
  loadingText: { fontSize: 12, color: '#64748B', marginTop: 8 },
  emptyBox: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 8 },
  emptySub: { fontSize: 11.5, color: '#64748B', marginTop: 4, textAlign: 'center', lineHeight: 18 },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: { flex: 1, marginLeft: 10, marginRight: 8 },
  txDesc: { fontSize: 12.5, fontWeight: '700', color: '#0F172A', lineHeight: 17 },
  txTime: { fontSize: 10.5, color: '#64748B', marginTop: 2 },
  txAmountCol: { alignItems: 'flex-end' },
  txAmount: { fontSize: 13.5, fontWeight: '900' },
  txAmountPlus: { color: '#059669' },
  txAmountMinus: { color: '#EA580C' },

  // Quests styles
  questsSection: { marginTop: 4 },
  timelineBanner: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  timelineTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#9A3412',
  },
  countdownBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  timelineSub: {
    fontSize: 10.5,
    color: '#C2410C',
    marginTop: 4,
    lineHeight: 15,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  questIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  questTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  questRewardBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  questRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  questDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  questStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 4,
  },
  statusClaimed: { color: '#059669' },
  statusEligible: { color: '#EA580C' },
  statusPending: { color: '#94A3B8' },
  questActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  claimBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  claimedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  linkActionBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  linkActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});

export default CoinHistoryScreen;
