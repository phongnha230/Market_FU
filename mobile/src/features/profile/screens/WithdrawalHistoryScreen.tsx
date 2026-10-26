import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { profileMobileService } from '../../../services/profileMobileService';
import { withRefreshTimeout } from '../../../utils/safeRefresh';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { useUserStore } from '../../../stores/userStore';

export const WithdrawalHistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const loadWithdrawals = useCallback(async () => {
    try {
      const data = await profileMobileService.getWithdrawals();
      setRequests(data?.requests || []);
    } catch {
      // ignored
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.name]);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const onRefresh = async () => {
    if (refreshing) return;
    await withRefreshTimeout(async () => {
      await loadWithdrawals();
    }, setRefreshing, 2000);
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const totalWithdrawn = requests
    .filter((r) => r.status === 'APPROVED')
    .reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  const totalPending = requests
    .filter((r) => r.status === 'PENDING')
    .reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'ĐÃ CHUYỂN KHOẢN',
          bg: '#ECFDF5',
          color: '#059669',
          icon: 'checkmark-circle',
        };
      case 'REJECTED':
        return {
          label: 'BỊ TỪ CHỐI',
          bg: '#FEF2F2',
          color: '#DC2626',
          icon: 'close-circle',
        };
      default:
        return {
          label: 'CHỜ DUYỆT BQT',
          bg: '#FFFBEB',
          color: '#D97706',
          icon: 'time',
        };
    }
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

        <Text style={styles.headerTitle}>Lịch Sử Rút Tiền Về ATM</Text>

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setShowWithdrawModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Rút tiền</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>ĐÃ GIẢI NGÂN</Text>
            <Text style={styles.summaryValApproved}>
              {totalWithdrawn.toLocaleString('vi-VN')} đ
            </Text>
            <Text style={styles.summarySub}>Vào tài khoản ngân hàng</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>ĐANG XỬ LÝ</Text>
            <Text style={styles.summaryValPending}>
              {totalPending.toLocaleString('vi-VN')} đ
            </Text>
            <Text style={styles.summarySub}>Dự kiến duyệt trong 24h</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterBtnText, filter === 'all' && styles.filterBtnTextActive]}>
              Tất cả ({requests.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]}
            onPress={() => setFilter('PENDING')}
          >
            <Text style={[styles.filterBtnText, filter === 'PENDING' && styles.filterBtnTextActive]}>
              Đang duyệt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, filter === 'APPROVED' && styles.filterBtnActive]}
            onPress={() => setFilter('APPROVED')}
          >
            <Text style={[styles.filterBtnText, filter === 'APPROVED' && styles.filterBtnTextActive]}>
              Thành công
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <Text style={styles.sectionTitle}>CÁC LỆNH RÚT TIỀN GẦN ĐÂY</Text>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={styles.loadingText}>Đang tải lịch sử rút tiền...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="bank-transfer-out" size={44} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Chưa có lệnh rút tiền nào</Text>
            <Text style={styles.emptySub}>
              Khi bạn bán được đồ và có số dư ví khả dụng, hãy tạo lệnh rút tiền về tài khoản ngân hàng.
            </Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const badge = getStatusBadge(req.status);
            const dateStr = req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay';
            const timeStr = req.createdAt ? new Date(req.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <View key={req.id} style={styles.reqCard}>
                <View style={styles.reqTopRow}>
                  <View style={styles.bankInfoRow}>
                    <View style={styles.bankIconBg}>
                      <MaterialCommunityIcons name="bank" size={18} color="#2563EB" />
                    </View>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.bankName}>
                        {req.bankAccount?.bankName || 'Ngân hàng thụ hưởng'}
                      </Text>
                      <Text style={styles.bankAccountNo}>
                        STK: {req.bankAccount?.accountNo || 'Chưa cập nhật'} • {req.bankAccount?.accountName || ''}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={11} color={badge.color} style={{ marginRight: 3 }} />
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.amountDivider} />

                <View style={styles.reqBottomRow}>
                  <View>
                    <Text style={styles.reqAmountLabel}>Số tiền rút:</Text>
                    <Text style={styles.reqAmount}>
                      {Number(req.amount).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.reqTimeLabel}>Thời gian gửi lệnh:</Text>
                    <Text style={styles.reqTime}>
                      {dateStr} {timeStr}
                    </Text>
                  </View>
                </View>

                {req.adminNote && (
                  <View style={styles.noteBox}>
                    <Ionicons name="information-circle-outline" size={13} color="#64748B" />
                    <Text style={styles.noteText} numberOfLines={2}>
                      {req.adminNote}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal rút tiền nhanh */}
      <WithdrawalModal
        visible={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          loadWithdrawals();
        }}
      />
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
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  newBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  scrollContent: { paddingBottom: 40 },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  summaryValApproved: { fontSize: 18, fontWeight: '900', color: '#059669', marginTop: 4 },
  summaryValPending: { fontSize: 18, fontWeight: '900', color: '#D97706', marginTop: 4 },
  summarySub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
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
  emptySub: { fontSize: 11.5, color: '#64748B', marginTop: 3, textAlign: 'center', lineHeight: 16 },
  reqCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
  },
  reqTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bankInfoRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  bankIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  bankAccountNo: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 6 },
  badgeText: { fontSize: 9.5, fontWeight: '800' },
  amountDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  reqBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reqAmountLabel: { fontSize: 10, color: '#64748B' },
  reqAmount: { fontSize: 15, fontWeight: '900', color: '#EA580C', marginTop: 1 },
  reqTimeLabel: { fontSize: 10, color: '#64748B' },
  reqTime: { fontSize: 11, fontWeight: '600', color: '#0F172A', marginTop: 1 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  noteText: { fontSize: 10.5, color: '#475569', flex: 1 },
});

export default WithdrawalHistoryScreen;
