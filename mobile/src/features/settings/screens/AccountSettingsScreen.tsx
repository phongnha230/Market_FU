import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { authMobileService } from '../../../services/authMobileService';
import { AccountVerificationBanner } from '../components/AccountVerificationBanner';
import { AccountStudentInfoForm } from '../components/AccountStudentInfoForm';

const HeaderNavButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  onPress: () => void;
}> = React.memo(({ icon, size = 24, onPress }) => (
  <TouchableOpacity
    style={styles.backBtn}
    onPress={onPress}
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  >
    <Ionicons name={icon} size={size} color="#0F172A" />
  </TouchableOpacity>
));

export const AccountSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUserProfile, isLoading } = useUserStore();

  const [fullName, setFullName] = useState(user?.name || '');
  const [mssv, setMssv] = useState(user?.studentId || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [major, setMajor] = useState(user?.major || '');
  const [dormRoom, setDormRoom] = useState(user?.dormRoom || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Đồng bộ lại khi user thay đổi
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setMssv(user.studentId || '');
      setPhoneNumber(user.phone || '');
      setMajor(user.major || '');
      setDormRoom(user.dormRoom || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSaveInfo = useCallback(async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống');
      return;
    }

    const res = await updateUserProfile({
      name: fullName.trim(),
      phone: phoneNumber.trim(),
      major: major.trim(),
      dormRoom: dormRoom.trim(),
      bio: bio.trim(),
    });

    if (res.success) {
      Alert.alert(
        '💾 Cập nhật thành công',
        'Thông tin hồ sơ sinh viên đã được cập nhật thành công!'
      );
    } else {
      Alert.alert('Lỗi', res.message || 'Không thể cập nhật hồ sơ');
    }
  }, [fullName, phoneNumber, major, dormRoom, bio, updateUserProfile]);

  const isVerified = user?.isKycVerified || user?.role === 'SELLER';

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <HeaderNavButton icon="arrow-back" size={24} onPress={handleBack} />
        <Text style={styles.headerTitle}>Hồ sơ & Tài khoản Sinh viên</Text>
        <HeaderNavButton icon="home-outline" size={22} onPress={handleGoHome} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollBody}
        >
        {/* Verification Status Banner */}
        <AccountVerificationBanner user={user} isVerified={Boolean(isVerified)} />

        {/* Section 1: Thông tin cá nhân */}
        <AccountStudentInfoForm
          fullName={fullName}
          setFullName={setFullName}
          mssv={mssv}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          major={major}
          setMajor={setMajor}
          dormRoom={dormRoom}
          setDormRoom={setDormRoom}
          bio={bio}
          setBio={setBio}
          onSave={handleSaveInfo}
          isLoading={isLoading}
        />

        {/* Section 2: Đổi mật khẩu tài khoản */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>BẢO MẬT & MẬT KHẨU TÀI KHOẢN</Text>
          <TouchableOpacity
            style={styles.changePasswordCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.pwIconBg}>
              <Ionicons name="key-outline" size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pwTitle}>Đổi mật khẩu tài khoản</Text>
              <Text style={styles.pwSubtitle}>Cập nhật mật khẩu đăng nhập & ví Escrow</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  changePasswordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pwIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pwTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  pwSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});

export default AccountSettingsScreen;
