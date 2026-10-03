import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { authMobileService } from '../../../services/authMobileService';
import { AccountVerificationBanner } from '../components/AccountVerificationBanner';
import { AccountStudentInfoForm } from '../components/AccountStudentInfoForm';
import { AccountPasswordSection } from '../components/AccountPasswordSection';

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

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleChangePassword = useCallback(async () => {
    if (!newPassword || newPassword.trim().length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await authMobileService.changePassword({
        currentPassword: oldPassword ? oldPassword.trim() : undefined,
        newPassword: newPassword.trim(),
        confirmPassword: newPassword.trim(),
      });
      Alert.alert('🎉 Thành công', res.message || 'Mật khẩu tài khoản đã được thay đổi!');
      setOldPassword('');
      setNewPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      Alert.alert(
        'Lỗi đổi mật khẩu',
        err?.response?.data?.message || err?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  }, [newPassword, oldPassword]);

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
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

        {/* Section 2: Đổi mật khẩu */}
        <AccountPasswordSection
          showPasswordSection={showPasswordSection}
          setShowPasswordSection={setShowPasswordSection}
          oldPassword={oldPassword}
          setOldPassword={setOldPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          onChangePassword={handleChangePassword}
          isChangingPassword={isChangingPassword}
        />
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
});

export default AccountSettingsScreen;
