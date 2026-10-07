import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { authMobileService } from '../../../services/authMobileService';

export const ChangePasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  }, [navigation]);

  const handleSubmit = useCallback(async () => {
    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanCurrent) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu hiện tại của bạn.');
      return;
    }

    if (!cleanNew) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (cleanNew.length < 6) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (cleanNew === cleanCurrent) {
      Alert.alert('Thông báo', 'Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    if (!cleanConfirm) {
      Alert.alert('Thiếu thông tin', 'Vui lòng xác nhận lại mật khẩu mới.');
      return;
    }

    if (cleanNew !== cleanConfirm) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu xác nhận không trùng khớp với mật khẩu mới.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authMobileService.changePassword({
        currentPassword: cleanCurrent,
        newPassword: cleanNew,
        confirmPassword: cleanConfirm,
      });

      Alert.alert(
        '🎉 Thành công',
        res.message || 'Mật khẩu tài khoản đã được thay đổi thành công!',
        [
          {
            text: 'Đồng ý',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.';
      Alert.alert('Lỗi đổi mật khẩu', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, navigation]);

  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 6 &&
    confirmPassword.trim() === newPassword.trim();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu tài khoản</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 },
        ]}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <Ionicons name="shield-checkmark" size={22} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Bảo mật tài khoản Campus</Text>
            <Text style={styles.infoDesc}>
              Mật khẩu mới bảo vệ ví ký quỹ Escrow và các giao dịch mua bán đồ cũ của bạn.
            </Text>
          </View>
        </View>

        {/* Password Form Card */}
        <View style={styles.formCard}>
          {/* Field 1: Mật khẩu hiện tại */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mật khẩu hiện tại *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={18} color="#64748B" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Field 2: Mật khẩu mới */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mật khẩu mới *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowNewPassword(!showNewPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldHint}>
              Mật khẩu phải chứa ít nhất 6 ký tự. Nên kết hợp chữ và số.
            </Text>
          </View>

          {/* Field 3: Xác nhận mật khẩu mới */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Xác nhận mật khẩu mới *</Text>
            <View
              style={[
                styles.inputWrapper,
                confirmPassword.length > 0 &&
                  confirmPassword !== newPassword &&
                  styles.inputWrapperError,
              ]}
            >
              <Ionicons name="checkmark-done-outline" size={18} color="#64748B" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <Text style={styles.errorText}>Mật khẩu xác nhận không trùng khớp.</Text>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Cập nhật mật khẩu</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  infoDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#C2410C',
    marginTop: 2,
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 2,
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F37021',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default ChangePasswordScreen;
