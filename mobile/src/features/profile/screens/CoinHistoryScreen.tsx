import React, { useState, useEffect, useCallback } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { profileMobileService } from '../../../services/profileMobileService';
import { authMobileService } from '../../../services/authMobileService';
import { useUserStore } from '../../../stores/userStore';

export const CoinHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUser } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const data = await profileMobileService.getCoinHistory();
      if (data && data.transactions && data.transactions.length > 0) {
        setTransactions(data.transactions);
      } else {
        // Sample transactions if empty or backend freshly seeded
        setTransactions([
          {
            id: 'tx_1',
            type: 'DAILY_CHECKIN',
            amount: 10,
            balanceAfter: user?.coins || 320,
            description: 'Điểm danh hàng ngày Market FU (+10 Xu)',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tx_2',
            type: 'REVIEW_REWARD',
            amount: 20,
            balanceAfter: (user?.coins || 320) - 10,
            description: 'Thưởng đánh giá 5 sao cho người bán sau giao dịch',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'tx_3',
            type: 'VOUCHER_EXCHANGE',
            amount: -50,
            balanceAfter: (user?.coins || 320) - 30,
            description: 'Đổi mã giảm giá Canteen KTX 20K',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'tx_4',
            type: 'BOOST_PRODUCT',
            amount: -30,
            balanceAfter: (user?.coins || 320) + 20,
            description: 'Đẩy tin ưu tiên bài đăng "Bàn phím cơ Akko 3087"',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
          },
        ]);
      }
    } catch {
      // ignored
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.coins]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const me = await authMobileService.getMe();
      if (me) updateUser(me);
    } catch {}
    loadHistory();
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await profileMobileService.checkInDaily();
      Alert.alert(
        '🎉 Điểm danh thành công!',
        `Bạn nhận được +${res?.coinsEarned || 10} Xu. Chuỗi điểm danh: ${res?.streak || 1} ngày liên tiếp!`
      );
      const me = await authMobileService.getMe();
      if (me) updateUser(me);
      loadHistory();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error?.message;
      Alert.alert('Thông báo', msg || 'Hôm nay bạn đã điểm danh rồi, hãy quay lại vào ngày mai nhé!');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'in') return t.amount > 0;
    if (filter === 'out') return t.amount < 0;
    return true;
  });

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
        label: 'Đẩy tin rao bán',
      };
    }
    return {
      icon: 'wallet',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
      label: 'Sử dụng Xu',
    };
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      {/* Header */}
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

        <Text style={styles.headerTitle}>Sổ Cái Xu Campus (Coins)</Text>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Voucher')}
          activeOpacity={0.7}
        >
          <Ionicons name="gift-outline" size={20} color="#EA580C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
      >
        {/* Coin Balance Banner */}
        <View style={styles.coinBanner}>
          <View style={styles.coinTopRow}>
            <View>
              <Text style={styles.coinLabel}>SỐ DƯ XU KHẢ DỤNG</Text>
              <View style={styles.amountRow}>
                <Ionicons name="sparkles" size={24} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.coinAmount}>{user?.coins ?? 320}</Text>
                <Text style={styles.coinUnit}>Xu</Text>
              </View>
              <Text style={styles.coinEquiv}>
                ≈ {((user?.coins ?? 320) * 100).toLocaleString('vi-VN')} đ dùng đổi Voucher & Đẩy tin
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

          {/* Quick Info bar */}
          <View style={styles.coinFooterBar}>
            <View style={styles.footerItem}>
              <Text style={styles.footerItemVal}>+10 Xu / ngày</Text>
              <Text style={styles.footerItemLabel}>Điểm danh</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerItemVal}>+20 Xu / đơn</Text>
              <Text style={styles.footerItemLabel}>Đánh giá mua bán</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerItemVal}>-30 Xu / lần</Text>
              <Text style={styles.footerItemLabel}>Đẩy tin Top</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {[
            { key: 'all' as const, label: `Tất cả (${transactions.length})` },
            { key: 'in' as const, label: 'Nhận Xu (+)' },
            { key: 'out' as const, label: 'Dùng Xu (-)' },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                onPress={() => setFilter(tab.key)}
              >
                <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Transaction History List */}
        <Text style={styles.sectionTitle}>LỊCH SỬ BIẾN ĐỘNG SỔ CÁI</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={styles.loadingText}>Đang tải lịch sử giao dịch Xu...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Chưa có biến động Xu</Text>
            <Text style={styles.emptySub}>Hãy điểm danh hoặc mua bán để tích lũy Xu ngay.</Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => {
            const meta = getTxMeta(tx.type, tx.amount);
            const isPlus = tx.amount > 0;
            const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay';
            const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

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
                    {dateStr} {timeStr} • Số dư sau: {tx.balanceAfter ?? user?.coins ?? 0} Xu
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
  scrollContent: { paddingBottom: 40 },
  coinBanner: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 4px 8px rgba(30, 27, 75, 0.2)',
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
    boxShadow: '0 2px 4px rgba(234, 88, 12, 0.3)',
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
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterBtnActive: { backgroundColor: '#FFF7ED' },
  filterBtnText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  filterBtnTextActive: { color: '#EA580C', fontWeight: '800' },
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
  emptySub: { fontSize: 11.5, color: '#64748B', marginTop: 2, textAlign: 'center' },
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
});

export default CoinHistoryScreen;
