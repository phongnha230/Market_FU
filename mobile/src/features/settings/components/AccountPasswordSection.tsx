import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AccountPasswordSectionProps {
  showPasswordSection: boolean;
  setShowPasswordSection: (show: boolean) => void;
  oldPassword: string;
  setOldPassword: (pwd: string) => void;
  newPassword: string;
  setNewPassword: (pwd: string) => void;
  onChangePassword: () => void;
  isChangingPassword: boolean;
}

export const AccountPasswordSection: React.FC<AccountPasswordSectionProps> = React.memo(({
  showPasswordSection,
  setShowPasswordSection,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  onChangePassword,
  isChangingPassword,
}) => {
  return (
    <View>
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
              <TouchableOpacity
                style={styles.confirmPwBtn}
                onPress={onChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmPwText}>Cập nhật mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  togglePasswordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
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
  inputGroup: {
    marginBottom: 0,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pwBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelPwBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPwText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmPwBtn: {
    flex: 2,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPwText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
