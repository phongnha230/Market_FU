import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/useAuthStore';

export const AccountSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.name || 'Trần Minh Quân');
  const [mssv, setMssv] = useState('HE163452');
  const [phoneNumber, setPhoneNumber] = useState('0987 654 321');
  const [campusCohort, setCampusCohort] = useState('K16 - Kỹ thuật phần mềm (SE)');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleSaveInfo = () => {
    Alert.alert('Thành công', 'Thông tin tài khoản sinh viên đã được cập nhật thành công!');
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
        <Text style={styles.headerTitle}>Tài khoản & Bảo mật</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Verification Status */}
        <View style={styles.verifiedBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#059669" />
          <View style={styles.verifiedContent}>
            <Text style={styles.verifiedTitle}>Tài khoản đã xác thực KYC Campus</Text>
            <Text style={styles.verifiedSub}>Liên kết với email FPT: {user?.email || 'quan.tm@fpt.edu.vn'}</Text>
          </View>
        </View>

        {/* Section 1: Thông tin cá nhân */}
        <Text style={styles.sectionTitle}>THÔNG TIN CÁ NHÂN SINH VIÊN</Text>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mã số sinh viên (MSSV)</Text>
            <View style={styles.disabledInputRow}>
              <Text style={styles.disabledInputText}>{mssv}</Text>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={12} color="#64748B" />
                <Text style={styles.lockedText}>Đã khóa theo FAP</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại / Zalo liên hệ</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="09xx xxx xxx"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Khóa & Chuyên ngành</Text>
            <TextInput
              style={styles.textInput}
              value={campusCohort}
              onChangeText={setCampusCohort}
              placeholder="Khóa / Chuyên ngành"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSaveInfo}>
          <Text style={styles.saveBtnText}>Lưu thay đổi thông tin</Text>
        </TouchableOpacity>

        {/* Section 2: Đổi mật khẩu */}
        <Text style={styles.sectionTitle}>ĐỔI MẬT KHẨU</Text>
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
                />
              </View>

              <View style={[styles.inputGroup, { marginTop: 12 }]}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Tối thiểu 8 ký tự (chữ & số)"
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
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
  verifiedContent: { marginLeft: 12, flex: 1 },
  verifiedTitle: { fontSize: 13.5, fontWeight: '700', color: '#065F46' },
  verifiedSub: { fontSize: 11.5, color: '#047857', marginTop: 2 },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 22,
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
    fontSize: 14,
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
  disabledInputText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
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
