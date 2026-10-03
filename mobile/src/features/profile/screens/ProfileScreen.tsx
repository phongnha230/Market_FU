import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import CampusWalletCard from '../components/CampusWalletCard';
import OrdersOverviewSection from '../components/OrdersOverviewSection';
import SettingRow from '../components/SettingRow';
import { KycRegistrationModal } from '../components/KycRegistrationModal';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { DepositCoinModal } from '../components/DepositCoinModal';
import { MyReportsModal } from '../../report/components/MyReportsModal';
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

  const [showKycModal, setShowKycModal] = useState(false);
  const [kycRole, setKycRole] = useState<'STUDENT' | 'SELLER'>('STUDENT');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMyReportsModal, setShowMyReportsModal] = useState(false);

  const handleSettingPress = (id: string) => {
    if (id === 's1') {
      setShowEditModal(true);
    } else if (id === 's2') {
      if (onNavigateToVoucher) onNavigateToVoucher();
      else navigation.navigate('Voucher');
    } else if (id === 's3') {
      navigation.navigate('SavedItems');
    } else if (id === 's4') {
      if (onNavigateToDispute) onNavigateToDispute();
      else navigation.navigate('Dispute');
    } else if (id === 's5') {
      navigation.navigate('NotificationSettings');
    } else if (id === 's6') {
      navigation.navigate('AccountSettings');
    } else if (id === 's7') {
      navigation.navigate('About');
    } else {
      navigation.navigate('Settings');
    }
  };

  const handleOpenOrderList = () => {
    navigation.navigate('OrderList');
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
            onRefresh={onRefresh}
            colors={['#EA580C']}
            tintColor="#EA580C"
          />
        }
      >
        <ProfileHeaderCard
          user={user}
          currentCampus={currentCampus}
          onKycPress={(role) => {
            if (role) setKycRole(role);
            setShowKycModal(true);
          }}
          onEditPress={() => setShowEditModal(true)}
          onManageListings={() => navigation.navigate('ManageListings')}
          onSellerDashboard={() => navigation.navigate('SellerDashboard')}
        />

        {/* Kênh Quản lý Người Bán (Seller Hub) - Chỉ hiển thị cho Seller */}
        {user?.role === 'SELLER' && (
          <TouchableOpacity
            style={styles.sellerHubBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SellerDashboard')}
          >
            <View style={styles.sellerHubLeft}>
              <View style={styles.sellerHubIconBox}>
                <Ionicons name="speedometer" size={20} color="#EA580C" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.sellerHubTitle}>Kênh Quản Lý Người Bán</Text>
                  <View style={styles.sellerHubBadge}>
                    <Text style={styles.sellerHubBadgeText}>HUB</Text>
                  </View>
                </View>
                <Text style={styles.sellerHubSub}>Quản lý doanh thu, kho tin rao, vận đơn FPT Bus</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EA580C" />
          </TouchableOpacity>
        )}

        <CampusWalletCard
          onWithdrawPress={() => setShowWithdrawModal(true)}
          onDepositPress={() => setShowDepositModal(true)}
        />

        {/* Thanh Cài đặt nhanh (Settings Bar) */}
        <TouchableOpacity
          style={styles.settingsBarCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.settingsBarLeft}>
            <View style={styles.settingsBarIconBox}>
              <Ionicons name="cog" size={20} color="#EA580C" />
            </View>
            <View>
              <Text style={styles.settingsBarTitle}>Cài đặt hệ thống ứng dụng</Text>
              <Text style={styles.settingsBarSub}>Tài khoản, thông báo, bảo mật & trợ giúp</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EA580C" />
        </TouchableOpacity>

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

        <OrdersOverviewSection stats={orderStats} onPressStatus={handleOpenOrderList} />

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
      </ScrollView>

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
  sellerHubBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  sellerHubLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sellerHubIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerHubTitle: { fontSize: 13.5, fontWeight: '800', color: '#9A3412' },
  sellerHubBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sellerHubBadgeText: { fontSize: 9, fontWeight: '900', color: '#FFFFFF' },
  sellerHubSub: { fontSize: 11, color: '#C2410C', marginTop: 2 },
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
