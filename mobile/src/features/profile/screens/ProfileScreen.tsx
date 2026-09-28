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
    if (id === 's4' && onNavigateToDispute) {
      onNavigateToDispute();
    } else if (id === 's2' && onNavigateToVoucher) {
      onNavigateToVoucher();
    } else if (id === 's3' && navigation && navigation.navigate) {
      navigation.navigate('SavedItems');
    } else {
      Alert.alert('Chức năng', 'Đang cập nhật thêm tính năng');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ProfileHeaderCard user={user} currentCampus={currentCampus} />
        <CampusWalletCard />
        <OrdersOverviewSection stats={orderStats} />

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
  scrollContent: { paddingBottom: 85 },
  settingsSection: { backgroundColor: '#FFFFFF', marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', paddingHorizontal: 16, marginBottom: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;
