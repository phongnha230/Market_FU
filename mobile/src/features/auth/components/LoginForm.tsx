import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AuthInputFieldProps {
  label: string;
  badge?: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: object;
}

const AuthInputField: React.FC<AuthInputFieldProps> = ({
  label,
  badge,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  rightElement,
  autoCapitalize,
  style,
}) => (
  <View style={[styles.inputGroup, style]}>
    <View style={styles.inputLabelRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      {badge ? <Text style={styles.syncedTag}>{badge}</Text> : null}
    </View>
    <View style={styles.inputBox}>
      {icon}
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
      />
      {rightElement}
    </View>
  </View>
);

interface LoginFormProps {
  loginIdentifier: string;
  onLoginIdentifierChange: (val: string) => void;
  loginPassword: string;
  onLoginPasswordChange: (val: string) => void;
  showLoginPassword: boolean;
  onToggleShowPassword: () => void;
  rememberMe: boolean;
  onToggleRememberMe: () => void;
  onForgotPass: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  onGoogleLogin: () => void;
  isGoogleLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  loginIdentifier,
  onLoginIdentifierChange,
  loginPassword,
  onLoginPasswordChange,
  showLoginPassword,
  onToggleShowPassword,
  rememberMe,
  onToggleRememberMe,
  onForgotPass,
  onSubmit,
  isLoading,
  onGoogleLogin,
  isGoogleLoading,
}) => {
  return (
    <View style={styles.formSection}>
      {/* Field MSSV / Email */}
      <AuthInputField
        label="MSSV hoặc Email FPT"
        badge="Đã đồng bộ Storage"
        icon={
          <MaterialCommunityIcons
            name="card-account-details-outline"
            size={18}
            color="#64748B"
            style={{ marginRight: 8 }}
          />
        }
        placeholder="Ví dụ: SE172819 hoặc quanlmse172819@fpt.edu.vn"
        value={loginIdentifier}
        onChangeText={onLoginIdentifierChange}
        autoCapitalize="none"
      />

      {/* Field Mật khẩu */}
      <AuthInputField
        style={{ marginTop: 12 }}
        label="Mật khẩu (Mặc định: fpt123456)"
        icon={
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color="#64748B"
            style={{ marginRight: 8 }}
          />
        }
        placeholder="•••••••••••••"
        secureTextEntry={!showLoginPassword}
        value={loginPassword}
        onChangeText={onLoginPasswordChange}
        rightElement={
          <TouchableOpacity
            onPress={onToggleShowPassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>
        }
      />

      {/* Ghi nhớ & Quên mật khẩu */}
      <View style={styles.rememberRow}>
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.8}
          onPress={onToggleRememberMe}
        >
          <View style={[styles.checkboxBox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
          </View>
          <Text style={styles.rememberText}>Ghi nhớ phiên đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={onForgotPass}>
          <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      {/* Nút Đăng nhập */}
      <TouchableOpacity
        style={styles.submitBtn}
        activeOpacity={0.88}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Đăng nhập ngay</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Divider Hoặc */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>HOẶC ĐĂNG NHẬP NHANH</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Nút Đăng nhập bằng Google */}
      <TouchableOpacity
        style={styles.googleBtn}
        activeOpacity={0.85}
        onPress={onGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <ActivityIndicator size="small" color="#EA580C" />
        ) : (
          <>
            <View style={styles.googleIconBadge}>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
            </View>
            <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {},
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  syncedTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  rememberText: {
    fontSize: 12,
    color: '#64748B',
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 44,
  },
  googleIconBadge: {
    marginRight: 8,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
});

export default LoginForm;
