import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import CampusWalletCard from '../components/CampusWalletCard';
import OrdersOverviewSection from '../components/OrdersOverviewSection';
import SettingRow from '../components/SettingRow';
import { KycRegistrationModal } from '../components/KycRegistrationModal';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { DepositCoinModal } from '../components/DepositCoinModal';
import { MyReportsModal } from '../../report/components/MyReportsModal';
import { TrustScoreModal } from '../components/TrustScoreModal';
import { useKho } from '../../../context/KhoContext';
import { useWalletStore } from '../../../stores/walletStore';
import useProfile from '../hooks/useProfile';
import { ProfileScreenProps } from '../types/profile.types';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToDispute,
  onNavigateToVoucher,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    user,
    currentCampus,
    settingItems,
    orderStats,
    isRefreshing,
    onRefresh,
    handleLogout,
  } = useProfile();
  const { inventoryStats, refreshKhoHang } = useKho();

  const handleRefreshAll = async () => {
    await Promise.all([
      onRefresh(),
      refreshKhoHang().catch(() => {}),
      useWalletStore.getState().fetchWalletBalances().catch(() => {}),
    ]);
  };

  useEffect(() => {
    useWalletStore.getState().fetchWalletBalances().catch(() => {});
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      onRefresh().catch(() => {});
      useWalletStore.getState().fetchWalletBalances().catch(() => {});
    }, [onRefresh])
  );

  const [showKycModal, setShowKycModal] = useState(false);
  const [kycRole, setKycRole] = useState<'STUDENT' | 'SELLER'>('STUDENT');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMyReportsModal, setShowMyReportsModal] = useState(false);
  const [showTrustScoreModal, setShowTrustScoreModal] = useState(false);

  const handleSettingPress = (id: string) => {
    if (id === 's0') {
      setShowEditModal(true);
    } else if (id === 's1') {
      const isVerified = Boolean(
        user?.isKycVerified ||
        user?.kycStatus === 'APPROVED' ||
        ((user?.role as string) !== 'UNVERIFIED' && Boolean(user?.studentId))
      );
      setKycRole(isVerified ? 'SELLER' : 'STUDENT');
      setShowKycModal(true);
    } else if (id === 's2') {
      if (onNavigateToVoucher) onNavigateToVoucher();
      else navigation.navigate('Voucher');
    } else if (id === 's5') {
      navigation.navigate('NotificationSettings');
    } else if (id === 's6') {
      navigation.navigate('ChangePassword');
    } else if (id === 's7') {
      navigation.navigate('About');
    } else {
      navigation.navigate('Settings');
    }
  };

  const isSeller = user?.role === 'SELLER';
  const orderSectionTitle = isSeller ? 'Đơn hàng & Giao dịch của tôi' : 'Đơn mua của tôi';

  const handleOpenOrderList = (statusId?: string) => {
    let initialTab = 'all';
    if (statusId === 'o1' || statusId === 'o2') {
      initialTab = 'escrow';
    } else if (statusId === 'o4') {
      initialTab = 'completed';
    }
    navigation.navigate('OrderList', { initialTab });
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ padding: 4, marginRight: 8 }}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Tài khoản Campus</Text>
        </View>
        <TouchableOpacity
          style={styles.settingIconBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Settings')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshAll}
            colors={['#EA580C']}
            tintColor="#EA580C"
          />
        }
      >
        {user ? (
          <>
            <ProfileHeaderCard
              user={user}
              currentCampus={currentCampus}
              onKycPress={(role) => {
                const isVerified = Boolean(
                  user?.isKycVerified ||
                  user?.kycStatus === 'APPROVED' ||
                  ((user?.role as string) !== 'UNVERIFIED' && Boolean(user?.studentId))
                );
                setKycRole(isVerified && role ? role : 'STUDENT');
                setShowKycModal(true);
              }}
              onEditPress={() => setShowEditModal(true)}
              onManageListings={() => navigation.navigate('ManageListings')}
              onSellerDashboard={() => navigation.navigate('SellerDashboard')}
              onTrustScorePress={() => setShowTrustScoreModal(true)}
            />

            {/* Kho hàng & Tin đăng của tôi - CHỈ DÀNH CHO SELLER */}
            {isSeller && (
              <TouchableOpacity
                style={styles.khoCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ManageListings')}
              >
                <View style={styles.khoCardHeader}>
                  <View style={styles.khoCardLeft}>
                    <View style={styles.khoIconBox}>
                      <Ionicons name="file-tray-full" size={22} color="#EA580C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.khoCardTitle}>Kho hàng & Tin đăng của tôi</Text>
                        {inventoryStats.rejected > 0 && (
                          <View style={styles.khoAlertBadge}>
                            <Text style={styles.khoAlertBadgeText}>{inventoryStats.rejected} cần sửa</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.khoCardSub} numberOfLines={1}>
                        {inventoryStats.total > 0
                          ? `Tổng ${inventoryStats.total} món đồ • ${inventoryStats.active} đang hiển thị`
                          : 'Quản lý tin đăng bán, đơn chờ duyệt & kho đồ'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.khoCardRight}>
                    <Text style={styles.khoCardActionText}>Vào kho</Text>
                    <Ionicons name="chevron-forward" size={16} color="#EA580C" />
                  </View>
                </View>

                {/* Status Chips Row */}
                <View style={styles.khoStatusRow}>
                  <View style={[styles.khoStatusChip, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.khoStatusChipNum, { color: '#16A34A' }]}>{inventoryStats.active}</Text>
                    <Text style={styles.khoStatusChipLabel}>Đang bán</Text>
                  </View>
                  <View style={[styles.khoStatusChip, { backgroundColor: '#FFFBEB' }]}>
                    <Text style={[styles.khoStatusChipNum, { color: '#D97706' }]}>{inventoryStats.pending}</Text>
                    <Text style={styles.khoStatusChipLabel}>Chờ duyệt</Text>
                  </View>
                  <View style={[styles.khoStatusChip, { backgroundColor: inventoryStats.rejected > 0 ? '#FEF2F2' : '#F8FAFC' }]}>
                    <Text style={[styles.khoStatusChipNum, { color: inventoryStats.rejected > 0 ? '#DC2626' : '#64748B' }]}>{inventoryStats.rejected}</Text>
                    <Text style={[styles.khoStatusChipLabel, inventoryStats.rejected > 0 && { color: '#DC2626', fontWeight: '700' }]}>Bị từ chối</Text>
                  </View>
                  <View style={[styles.khoStatusChip, { backgroundColor: '#F8FAFC' }]}>
                    <Text style={[styles.khoStatusChipNum, { color: '#475569' }]}>{inventoryStats.sold}</Text>
                    <Text style={styles.khoStatusChipLabel}>Đã bán</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <CampusWalletCard
              onWithdrawPress={() => setShowWithdrawModal(true)}
              onDepositPress={() => setShowDepositModal(true)}
              onKycPress={() => {
                const isVerified = Boolean(
                  user?.isKycVerified ||
                  user?.kycStatus === 'APPROVED' ||
                  ((user?.role as string) !== 'UNVERIFIED' && Boolean(user?.studentId))
                );
                setKycRole(isVerified ? 'SELLER' : 'STUDENT');
                setShowKycModal(true);
              }}
            />

            {/* Lịch sử tố cáo vi phạm */}
            <TouchableOpacity
              style={styles.settingsBarCard}
              activeOpacity={0.8}
              onPress={() => setShowMyReportsModal(true)}
            >
              <View style={styles.settingsBarLeft}>
                <View style={[styles.settingsBarIconBox, { backgroundColor: '#FFE4E6' }]}>
                  <Ionicons name="shield-half" size={20} color="#E11D48" />
                </View>
                <View>
                  <Text style={styles.settingsBarTitle}>Lịch sử tố cáo vi phạm</Text>
                  <Text style={styles.settingsBarSub}>Theo dõi tiến trình xử lý & phản hồi BQT Campus</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#E11D48" />
            </TouchableOpacity>

            <OrdersOverviewSection
              title={orderSectionTitle}
              stats={orderStats}
              onPressStatus={handleOpenOrderList}
            />

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Tùy chọn & Hỗ trợ sinh viên</Text>
              {settingItems.map((item) => (
                <SettingRow key={item.id} item={item} onPress={() => handleSettingPress(item.id)} />
              ))}
            </View>

            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.guestSection}>
            <View style={styles.guestPromoCard}>
              <View style={styles.guestPromoIcon}>
                <Ionicons name="school" size={28} color="#EA580C" />
              </View>
              <Text style={styles.guestPromoTitle}>Chào mừng đến với Chợ Sinh Viên FU</Text>
              <Text style={styles.guestPromoDesc}>
                Đăng nhập tài khoản FPT (@fpt.edu.vn) để tham gia mua bán thanh lý đồ KTX, trả giá trong chat, tích lũy FPT Coins và đổi voucher Căn tin/Passio!
              </Text>
              <TouchableOpacity
                style={styles.loginCtaBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.loginCtaText}>Đăng nhập bằng FPT SSO</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Thông tin & Quy chế Campus</Text>
              {settingItems
                .filter((item) => item.id === 's7')
                .map((item) => (
                  <SettingRow key={item.id} item={item} onPress={() => handleSettingPress(item.id)} />
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* TrustScore Reputation Detail Modal */}
      <TrustScoreModal
        visible={showTrustScoreModal}
        onClose={() => setShowTrustScoreModal(false)}
        user={user}
      />

      {/* Quick Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />

      {/* KYC Registration Modal (Student KYC & Seller KYC 2-in-1) */}
      <KycRegistrationModal
        visible={showKycModal}
        initialRole={kycRole}
        onClose={() => setShowKycModal(false)}
      />

      {/* Seller Withdrawal Modal */}
      <WithdrawalModal
        visible={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />

      {/* Deposit Coin / Wallet VietQR Modal */}
      <DepositCoinModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        userId={user?.id || 'acc_me'}
      />

      {/* My Reports History Modal */}
      <MyReportsModal
        visible={showMyReportsModal}
        onClose={() => setShowMyReportsModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBarTitle: { fontSize: 16.5, fontWeight: '800', color: '#0F172A' },
  settingIconBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  guestSection: {
    marginTop: 14,
  },
  guestPromoCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  guestPromoIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  guestPromoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
    textAlign: 'center',
    marginBottom: 6,
  },
  guestPromoDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#7C2D12',
    textAlign: 'center',
  },
  khoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  khoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  khoCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  khoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  khoCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  khoCardSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  khoAlertBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  khoAlertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  khoCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  khoCardActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  khoStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  khoStatusChip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  khoStatusChipNum: {
    fontSize: 14,
    fontWeight: '800',
  },
  khoStatusChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  settingsBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  settingsBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBarTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  settingsBarSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  settingsSection: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  loginCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    boxShadow: '0 4px 8px rgba(234, 88, 12, 0.25)',
    width: '100%',
  },
  loginCtaText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 13.5, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;
