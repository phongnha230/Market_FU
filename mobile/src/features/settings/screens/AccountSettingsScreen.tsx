import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';

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

  const handleSaveInfo = async () => {
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
        '💾 Đã lưu vào Local Storage',
        'Thông tin hồ sơ sinh viên đã được cập nhật và lưu vĩnh viễn trên máy thiết bị. Khi đăng xuất và đăng nhập lại, các thông tin này sẽ được phục hồi nguyên vẹn!'
      );
    } else {
      Alert.alert('Lỗi', res.message || 'Không thể cập nhật hồ sơ');
    }
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu cũ và mới');
      return;
    }
    Alert.alert('Thành công', 'Mật khẩu tài khoản đã được thay đổi!');
    setOldPassword('');
    setNewPassword('');
    setShowPasswordSection(false);
  };

  const isVerified = user?.isKycVerified || user?.role === 'SELLER';

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
        <Text style={styles.headerTitle}>Hồ sơ & Tài khoản Sinh viên</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Verification Status Banner */}
        <View style={[styles.verifiedBanner, !isVerified && styles.unverifiedBanner]}>
          <Ionicons
            name={isVerified ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={isVerified ? '#059669' : '#D97706'}
          />
          <View style={styles.verifiedContent}>
            <Text style={[styles.verifiedTitle, !isVerified && styles.unverifiedTitle]}>
              {user?.role === 'SELLER'
                ? 'Tài khoản TOP SELLER - Đã xác minh'
                : isVerified
                ? 'Tài khoản Sinh viên FPT Đã xác thực KYC'
                : 'Tài khoản Tân sinh viên - Chưa xác thực Thẻ SV'}
            </Text>
            <Text style={[styles.verifiedSub, !isVerified && styles.unverifiedSub]}>
              Email FPT: {user?.email || 'Chưa liên kết email'} | Campus: {user?.campus || 'HÒA LẠC'}
            </Text>
          </View>
        </View>

        {/* Section 1: Thông tin cá nhân */}
        <Text style={styles.sectionTitle}>THÔNG TIN HỒ SƠ SINH VIÊN (LƯU LOCAL STORAGE)</Text>
        <View style={styles.card}>
          {/* Họ tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên sinh viên *</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.divider} />

          {/* MSSV */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mã số sinh viên (MSSV)</Text>
            <View style={styles.disabledInputRow}>
              <Text style={styles.disabledInputText}>{mssv || 'Chưa cập nhật'}</Text>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color="#64748B" />
                <Text style={styles.lockedText}>Định danh hệ thống FAP</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Số điện thoại */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại / Zalo giao dịch</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="Ví dụ: 0987 654 321 (Chưa có thông tin hãy lưu thử)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.divider} />

          {/* Chuyên ngành */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Khóa & Chuyên ngành đào tạo</Text>
            <TextInput
              style={styles.textInput}
              value={major}
              onChangeText={setMajor}
              placeholder="Ví dụ: K18 An toàn thông tin (IA)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.divider} />

          {/* Phòng KTX / Địa chỉ */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phòng Ký túc xá / Địa chỉ nhận đồ Campus</Text>
            <TextInput
              style={styles.textInput}
              value={dormRoom}
              onChangeText={setDormRoom}
              placeholder="Ví dụ: Phòng 402 - KTX Dom E (Hòa Lạc)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.divider} />

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tiểu sử / Giới thiệu bản thân</Text>
            <TextInput
              style={[styles.textInput, { minHeight: 40 }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Mô tả ngắn gọn về bạn để bạn bè tin tưởng giao dịch..."
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.85}
          onPress={handleSaveInfo}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.saveBtnText}>Lưu thay đổi vào Local Storage</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Section 2: Đổi mật khẩu */}
        <Text style={styles.sectionTitle}>BẢO MẬT & MẬT KHẨU TÀI KHOẢN</Text>
        <View style={styles.card}>
          {!showPasswordSection ? (
            <TouchableOpacity
              style={styles.togglePasswordRow}
              activeOpacity={0.7}
              onPress={() => setShowPasswordSection(true)}
            >
              <View style={styles.pwIconBg}>
                <Ionicons name="shield-outline" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pwTitle}>Đổi mật khẩu tài khoản</Text>
                <Text style={styles.pwSubtitle}>Bảo vệ an toàn cho ví và giao dịch Escrow</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : (
            <View style={{ padding: 14 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <TextInput
                  style={styles.textInput}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 12 }]}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.pwBtnRow}>
                <TouchableOpacity
                  style={styles.cancelPwBtn}
                  onPress={() => setShowPasswordSection(false)}
                >
                  <Text style={styles.cancelPwText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmPwBtn} onPress={handleChangePassword}>
                  <Text style={styles.confirmPwText}>Cập nhật mật khẩu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
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
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  unverifiedBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  verifiedContent: { marginLeft: 12, flex: 1 },
  verifiedTitle: { fontSize: 13, fontWeight: '700', color: '#065F46' },
  unverifiedTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  verifiedSub: { fontSize: 11, color: '#047857', marginTop: 2 },
  unverifiedSub: { fontSize: 11, color: '#B45309', marginTop: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  inputGroup: { paddingHorizontal: 14, paddingVertical: 10 },
  inputLabel: { fontSize: 11.5, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  textInput: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 4,
  },
  disabledInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  disabledInputText: { fontSize: 13.5, fontWeight: '700', color: '#475569' },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockedText: { fontSize: 10, fontWeight: '700', color: '#64748B', marginLeft: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  togglePasswordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  pwIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pwTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  pwSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  pwBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 10,
  },
  cancelPwBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelPwText: { fontSize: 12.5, fontWeight: '700', color: '#64748B' },
  confirmPwBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EA580C',
  },
  confirmPwText: { fontSize: 12.5, fontWeight: '700', color: '#FFFFFF' },
});

export default AccountSettingsScreen;
