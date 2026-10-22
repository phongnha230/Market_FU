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
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { GoogleIcon } from './GoogleIcon';

interface RegisterFormProps {
  regFullName: string;
  onRegFullNameChange: (val: string) => void;
  regStudentId: string;
  onRegStudentIdChange: (val: string) => void;
  regEmail: string;
  onRegEmailChange: (val: string) => void;
  regPhone: string;
  onRegPhoneChange: (val: string) => void;
  regPassword: string;
  onRegPasswordChange: (val: string) => void;
  regConfirmPassword: string;
  onRegConfirmPasswordChange: (val: string) => void;
  showRegPassword: boolean;
  onToggleShowRegPassword: () => void;
  showRegConfirmPassword: boolean;
  onToggleShowRegConfirmPassword: () => void;
  captchaCode: string;
  captchaInput: string;
  onCaptchaInputChange: (val: string) => void;
  captchaError: boolean;
  onRefreshCaptcha: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSendingOtp: boolean;
  onGoogleLogin: () => void;
  isGoogleLoading: boolean;
}

const RegisterGoogleAction: React.FC<{
  onGoogleLogin: () => void;
  isGoogleLoading: boolean;
}> = React.memo(({ onGoogleLogin, isGoogleLoading }) => (
  <>
    <TouchableOpacity
      style={[styles.googleBtn, { marginBottom: 14 }]}
      activeOpacity={0.85}
      onPress={onGoogleLogin}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <ActivityIndicator size="small" color="#EA580C" />
      ) : (
        <>
          <GoogleIcon size={18} />
          <Text style={styles.googleBtnText}>Đăng ký bằng Google</Text>
        </>
      )}
    </TouchableOpacity>

    <View style={[styles.dividerRow, { marginTop: 0, marginBottom: 14 }]}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>HOẶC ĐIỀN THÔNG TIN ĐĂNG KÝ</Text>
      <View style={styles.dividerLine} />
    </View>
  </>
));

const RegisterStudentFields: React.FC<{
  fullName: string;
  onFullNameChange: (val: string) => void;
  studentId: string;
  onStudentIdChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
}> = React.memo(({
  fullName,
  onFullNameChange,
  studentId,
  onStudentIdChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
}) => (
  <>
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Họ và tên sinh viên *</Text>
      <View style={styles.inputBox}>
        <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.inputField}
          placeholder="Ví dụ: Hoàng Tuấn Anh"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={onFullNameChange}
        />
      </View>
    </View>

    <View style={[styles.inputGroup, { marginTop: 12 }]}>
      <View style={styles.inputLabelRow}>
        <Text style={styles.inputLabel}>Mã số sinh viên (MSSV) *</Text>
        <Text style={styles.helperTipTag}>SE, HE, QE, CE, DE...</Text>
      </View>
      <View style={styles.inputBox}>
        <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.inputField}
          placeholder="Ví dụ: SE180123"
          placeholderTextColor="#94A3B8"
          value={studentId}
          onChangeText={onStudentIdChange}
          autoCapitalize="characters"
        />
      </View>
    </View>

    <View style={[styles.inputGroup, { marginTop: 12 }]}>
      <View style={styles.inputLabelRow}>
        <Text style={styles.inputLabel}>Email FPT Education (@fpt.edu.vn) *</Text>
        <Text style={styles.helperTipTag}>Tự động duyệt KYC</Text>
      </View>
      <View style={styles.inputBox}>
        <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.inputField}
          placeholder="anhhtse180123@fpt.edu.vn"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={onEmailChange}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
    </View>

    <View style={[styles.inputGroup, { marginTop: 12 }]}>
      <Text style={styles.inputLabel}>Số điện thoại liên hệ (Tùy chọn)</Text>
      <View style={styles.inputBox}>
        <Ionicons name="call-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.inputField}
          placeholder="0987654321"
          placeholderTextColor="#94A3B8"
          value={phone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  </>
));

const RegisterPasswordSection: React.FC<{
  password: string;
  onPasswordChange: (val: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (val: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  showConfirmPassword: boolean;
  onToggleShowConfirmPassword: () => void;
}> = React.memo(({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  showPassword,
  onToggleShowPassword,
  showConfirmPassword,
  onToggleShowConfirmPassword,
}) => {
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <>
      <View style={[styles.inputGroup, { marginTop: 12 }]}>
        <Text style={styles.inputLabel}>Mật khẩu đăng nhập *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.inputField}
            placeholder="Tối thiểu 8 ký tự"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={onPasswordChange}
          />
          <TouchableOpacity
            onPress={onToggleShowPassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      </View>

      <PasswordStrengthIndicator password={password} />

      <View style={[styles.inputGroup, { marginTop: 12 }]}>
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
          {confirmPassword.length > 0 && (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: passwordsMatch ? '#10B981' : '#EF4444',
              }}
            >
              {passwordsMatch ? '✓ Khớp mật khẩu' : '✕ Chưa khớp'}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.inputBox,
            confirmPassword.length > 0
              ? passwordsMatch
                ? styles.inputBoxSuccess
                : styles.inputBoxError
              : null,
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={
              confirmPassword.length > 0
                ? passwordsMatch
                  ? '#10B981'
                  : '#EF4444'
                : '#64748B'
            }
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.inputField}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
          />
          <TouchableOpacity
            onPress={onToggleShowConfirmPassword}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
});

const RegisterCaptchaAndSubmit: React.FC<{
  captchaCode: string;
  captchaInput: string;
  onCaptchaInputChange: (val: string) => void;
  captchaError: boolean;
  onRefreshCaptcha: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSendingOtp: boolean;
}> = React.memo(({
  captchaCode,
  captchaInput,
  onCaptchaInputChange,
  captchaError,
  onRefreshCaptcha,
  onSubmit,
  isLoading,
  isSendingOtp,
}) => (
  <>
    <View style={[styles.inputGroup, { marginTop: 14 }]}>
      <Text style={styles.inputLabel}>Mã xác thực chống Bot (Captcha) *</Text>
      <View style={styles.captchaRow}>
        <View style={styles.captchaBadge}>
          <Text style={styles.captchaCodeText}>{captchaCode}</Text>
          <View style={styles.captchaNoiseLine} />
        </View>

        <TouchableOpacity
          style={styles.refreshCaptchaBtn}
          onPress={onRefreshCaptcha}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="refresh" size={18} color="#EA580C" />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.captchaInput,
            captchaError && styles.captchaInputError,
          ]}
          placeholder="Nhập 5 ký tự"
          placeholderTextColor="#94A3B8"
          value={captchaInput}
          onChangeText={onCaptchaInputChange}
          autoCapitalize="characters"
          maxLength={5}
        />
      </View>
    </View>

    <TouchableOpacity
      style={[styles.submitBtn, { marginTop: 18 }]}
      activeOpacity={0.88}
      onPress={onSubmit}
      disabled={isLoading || isSendingOtp}
    >
      {isLoading || isSendingOtp ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Text style={styles.submitBtnText}>Tiếp tục: Nhận mã OTP Email</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </>
      )}
    </TouchableOpacity>

    <View style={styles.stepInfoRow}>
      <Ionicons name="lock-closed" size={13} color="#059669" style={{ marginRight: 4 }} />
      <Text style={styles.stepInfoText}>
        Hệ thống sẽ gửi mã xác thực OTP 6 số về hòm thư FPT của bạn.
      </Text>
    </View>
  </>
));

export const RegisterForm: React.FC<RegisterFormProps> = ({
  regFullName,
  onRegFullNameChange,
  regStudentId,
  onRegStudentIdChange,
  regEmail,
  onRegEmailChange,
  regPhone,
  onRegPhoneChange,
  regPassword,
  onRegPasswordChange,
  regConfirmPassword,
  onRegConfirmPasswordChange,
  showRegPassword,
  onToggleShowRegPassword,
  showRegConfirmPassword,
  onToggleShowRegConfirmPassword,
  captchaCode,
  captchaInput,
  onCaptchaInputChange,
  captchaError,
  onRefreshCaptcha,
  onSubmit,
  isLoading,
  isSendingOtp,
  onGoogleLogin,
  isGoogleLoading,
}) => {
  return (
    <View style={styles.formSection}>
      <RegisterGoogleAction
        onGoogleLogin={onGoogleLogin}
        isGoogleLoading={isGoogleLoading}
      />
      <RegisterStudentFields
        fullName={regFullName}
        onFullNameChange={onRegFullNameChange}
        studentId={regStudentId}
        onStudentIdChange={onRegStudentIdChange}
        email={regEmail}
        onEmailChange={onRegEmailChange}
        phone={regPhone}
        onPhoneChange={onRegPhoneChange}
      />
      <RegisterPasswordSection
        password={regPassword}
        onPasswordChange={onRegPasswordChange}
        confirmPassword={regConfirmPassword}
        onConfirmPasswordChange={onRegConfirmPasswordChange}
        showPassword={showRegPassword}
        onToggleShowPassword={onToggleShowRegPassword}
        showConfirmPassword={showRegConfirmPassword}
        onToggleShowConfirmPassword={onToggleShowRegConfirmPassword}
      />
      <RegisterCaptchaAndSubmit
        captchaCode={captchaCode}
        captchaInput={captchaInput}
        onCaptchaInputChange={onCaptchaInputChange}
        captchaError={captchaError}
        onRefreshCaptcha={onRefreshCaptcha}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isSendingOtp={isSendingOtp}
      />
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 6,
  },
  helperTipTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
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
  inputBoxSuccess: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  inputBoxError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captchaBadge: {
    width: 90,
    height: 40,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  captchaCodeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 4,
  },
  captchaNoiseLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#FDBA74',
    transform: [{ rotate: '-12deg' }],
  },
  refreshCaptchaBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captchaInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 2,
  },
  captchaInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
  stepInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  stepInfoText: {
    fontSize: 11,
    color: '#059669',
  },
});
