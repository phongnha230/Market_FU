import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLoginController } from '../hooks/useLoginController';
import { AuthTopBar } from '../components/AuthTopBar';
import { AuthHeader } from '../components/AuthHeader';
import { AuthWaveBackground } from '../components/AuthWaveBackground';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { AuthFptGuaranteeCard } from '../components/AuthFptGuaranteeCard';
import { OtpVerificationModal } from '../components/OtpVerificationModal';

export interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onGoBack?: () => void;
}

const LoginFooter: React.FC = React.memo(() => (
  <View style={styles.footerSection}>
    <TouchableOpacity
      style={styles.helpdeskRow}
      activeOpacity={0.7}
      onPress={() => {
        Alert.alert(
          '🎧 IT Helpdesk FPT',
          'Hotline hỗ trợ sinh viên:\n• Hòa Lạc: (024) 7300 1866\n• TP.HCM: (028) 7300 5588\n• Email: it.support@fpt.edu.vn'
        );
      }}
    >
      <Ionicons name="headset-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
      <Text style={styles.helpdeskText}>
        Cần hỗ trợ? <Text style={styles.helpdeskUnderline}>Liên hệ IT Helpdesk FPT</Text>
      </Text>
    </TouchableOpacity>
  </View>
));

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoBack,
}) => {
  const insets = useSafeAreaInsets();
  const ctrl = useLoginController(onLoginSuccess, onGoBack);

  return (
    <View style={styles.screen}>
      {/* 2 dải viền sóng lượn (Top & Bottom Curves) theo bản vẽ tay */}
      <AuthWaveBackground />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 16) + 8,
              paddingBottom: Math.max(insets.bottom, 20) + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <AuthTopBar onGoBack={ctrl.handleGoBack} onGoHome={ctrl.handleGoHome} />

        <AuthHeader
          authMode={ctrl.authMode}
          onSelectMode={ctrl.setAuthMode}
        />

        {ctrl.authMode === 'login' ? (
          <LoginForm
            loginIdentifier={ctrl.loginIdentifier}
            onLoginIdentifierChange={ctrl.setLoginIdentifier}
            loginPassword={ctrl.loginPassword}
            onLoginPasswordChange={ctrl.setLoginPassword}
            showLoginPassword={ctrl.showLoginPassword}
            onToggleShowPassword={ctrl.handleToggleShowLoginPassword}
            rememberMe={ctrl.rememberMe}
            onToggleRememberMe={ctrl.handleToggleRememberMe}
            onForgotPass={ctrl.handleForgotPass}
            onSubmit={ctrl.handleLoginSubmit}
            isLoading={ctrl.isLoading}
            onGoogleLogin={ctrl.handleGoogleLogin}
            isGoogleLoading={ctrl.isGoogleLoading}
          />
        ) : (
          <RegisterForm
            regFullName={ctrl.regFullName}
            onRegFullNameChange={ctrl.setRegFullName}
            regStudentId={ctrl.regStudentId}
            onRegStudentIdChange={ctrl.setRegStudentId}
            regEmail={ctrl.regEmail}
            onRegEmailChange={ctrl.setRegEmail}
            regPhone={ctrl.regPhone}
            onRegPhoneChange={ctrl.setRegPhone}
            regPassword={ctrl.regPassword}
            onRegPasswordChange={ctrl.setRegPassword}
            regConfirmPassword={ctrl.regConfirmPassword}
            onRegConfirmPasswordChange={ctrl.setRegConfirmPassword}
            showRegPassword={ctrl.showRegPassword}
            onToggleShowRegPassword={ctrl.handleToggleShowRegPassword}
            showRegConfirmPassword={ctrl.showRegConfirmPassword}
            onToggleShowRegConfirmPassword={ctrl.handleToggleShowRegConfirmPassword}
            captchaCode={ctrl.captchaCode}
            captchaInput={ctrl.captchaInput}
            onCaptchaInputChange={ctrl.setCaptchaInput}
            captchaError={ctrl.captchaError}
            onRefreshCaptcha={ctrl.handleRefreshCaptcha}
            onSubmit={ctrl.handleRegisterSubmit}
            isLoading={ctrl.isLoading}
            isSendingOtp={ctrl.isSendingOtp}
            onGoogleLogin={ctrl.handleGoogleLogin}
            isGoogleLoading={ctrl.isGoogleLoading}
          />
        )}

        <LoginFooter />
      </ScrollView>
      </KeyboardAvoidingView>

      <OtpVerificationModal
        visible={ctrl.showOtpModal}
        email={ctrl.regEmail}
        fullName={ctrl.regFullName}
        studentId={ctrl.regStudentId}
        campus={ctrl.currentCampus.storeValue}
        onSuccess={ctrl.handleOtpVerifySuccess}
        onCancel={ctrl.handleOtpCancel}
      />

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  helpdeskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpdeskText: {
    fontSize: 12,
    color: '#64748B',
  },
  helpdeskUnderline: {
    fontWeight: '700',
    color: '#EA580C',
    textDecorationLine: 'underline',
  },
});
