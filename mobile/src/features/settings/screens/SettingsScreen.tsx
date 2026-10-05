import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/useAuthStore';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          logout();
          if (navigation?.navigate) {
            navigation.navigate('Login');
          }
        },
      },
    ]);
  };

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderRow = (
    icon: any,
    iconColor: string,
    iconBg: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.rowItem} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color="#94A3B8" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Profile' });
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt hệ thống</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Profile Summary Mini */}
        <View style={styles.userCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Sinh viên FPT'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'mssv@fpt.edu.vn'}</Text>
            <View style={styles.kycTag}>
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text style={styles.kycText}>Đã xác minh KYC Campus</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Tài khoản & Bảo mật */}
        {renderSectionHeader('TÀI KHOẢN & BẢO MẬT')}
        <View style={styles.cardGroup}>
          {renderRow(
            'person-outline',
            '#2563EB',
            '#EFF6FF',
            'Thông tin cá nhân & MSSV',
            'Họ tên, SĐT Zalo, Mã sinh viên',
            () => navigation.navigate('AccountSettings')
          )}
          <View style={styles.divider} />
          {renderRow(
            'key-outline',
            '#D97706',
            '#FEF3C7',
            'Đổi mật khẩu tài khoản',
            'Cập nhật mật khẩu đăng nhập',
            () => navigation.navigate('AccountSettings')
          )}
          <View style={styles.divider} />
          {renderRow(
            'finger-print-outline',
            '#059669',
            '#D1FAE5',
            'Khóa vân tay / FaceID',
            'Xác thực nhanh khi mở app',
            () => setBiometricsEnabled(!biometricsEnabled),
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              thumbColor={biometricsEnabled ? '#F27024' : '#F1F5F9'}
              trackColor={{ false: '#E2E8F0', true: '#FED7AA' }}
            />
          )}
        </View>

        {/* Section 2: Thông báo & Trải nghiệm */}
        {renderSectionHeader('THÔNG BÁO & GIAO DIỆN')}
        <View style={styles.cardGroup}>
          {renderRow(
            'notifications-outline',
            '#7C3AED',
            '#F5F3FF',
            'Cài đặt thông báo',
            'Tin nhắn, đơn hàng Escrow, chuông',
            () => navigation.navigate('NotificationSettings')
          )}
          <View style={styles.divider} />
          {renderRow(
            'lock-closed-outline',
            '#DC2626',
            '#FEE2E2',
            'Quyền riêng tư & Safe-Point',
            'Ẩn số phòng KTX, chặn người dùng',
            () => navigation.navigate('PrivacySettings')
          )}
        </View>

        {/* Section 3: Hỗ trợ & Về ứng dụng */}
        {renderSectionHeader('HỖ TRỢ & THÔNG TIN')}
        <View style={styles.cardGroup}>
          {renderRow(
            'help-circle-outline',
            '#0284C7',
            '#E0F2FE',
            'Trung tâm trợ giúp & FAQ',
            'Hỏi đáp Escrow, Safe-Point, Hotline',
            () => navigation.navigate('HelpCenter')
          )}
          <View style={styles.divider} />
          {renderRow(
            'information-circle-outline',
            '#475569',
            '#F1F5F9',
            'Về Market FU & Điều khoản',
            'Phiên bản 2.4.0, Quy chế 5Campus',
            () => navigation.navigate('About')
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Đăng xuất khỏi thiết bị này</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Market FU - FPT 5Campus Marketplace • v2.4.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F27024',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  userEmail: { fontSize: 12.5, color: '#64748B', marginTop: 1 },
  kycTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  kycText: { fontSize: 10.5, fontWeight: '700', color: '#059669', marginLeft: 4 },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  rowSubtitle: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 24,
  },
  logoutText: { fontSize: 14, fontWeight: '800', color: '#DC2626', marginLeft: 8 },
  versionText: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default SettingsScreen;
