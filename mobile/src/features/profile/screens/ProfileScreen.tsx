import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import CampusWalletCard from '../components/CampusWalletCard';
import OrdersOverviewSection from '../components/OrdersOverviewSection';
import SettingRow from '../components/SettingRow';
import useProfile from '../hooks/useProfile';
import { ProfileScreenProps } from '../types/profile.types';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToDispute,
  onNavigateToVoucher,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, currentCampus, settingItems, orderStats, handleLogout } = useProfile();

  const handleSettingPress = (id: string) => {
    if (id === 's1') {
      navigation.navigate('AccountSettings');
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileHeaderCard user={user} currentCampus={currentCampus} />
        <CampusWalletCard />

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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBarTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  settingIconBtn: { padding: 4 },
  scrollContent: { paddingBottom: 85 },
  settingsBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingsBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsBarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBarTitle: { fontSize: 13, fontWeight: '800', color: '#9A3412' },
  settingsBarSub: { fontSize: 11, color: '#C2410C', marginTop: 1 },
  settingsSection: { backgroundColor: '#FFFFFF', marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', paddingHorizontal: 16, marginBottom: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;
