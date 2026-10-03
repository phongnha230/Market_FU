import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useCampusStore, CampusType } from '../../../stores/useCampusStore';
import { CampusChipItem } from '../components/LoginCampusSelector';

export const CAMPUS_LIST: CampusChipItem[] = [
  { id: 'hl', name: 'Hòa Lạc', shortLabel: 'Hòa Lạc (HL)', storeValue: 'HÒA LẠC' },
  { id: 'hcm', name: 'Hồ Chí Minh', shortLabel: 'Hồ Chí Minh (HCM)', storeValue: 'TP.HCM' },
  { id: 'dn', name: 'Đà Nẵng', shortLabel: 'Đà Nẵng (ĐN)', storeValue: 'ĐÀ NẴNG' },
  { id: 'ct', name: 'Cần Thơ', shortLabel: 'Cần Thơ (CT)', storeValue: 'CẦN THƠ' },
  { id: 'qn', name: 'Quy Nhơn', shortLabel: 'Quy Nhơn (QN)', storeValue: 'HÒA LẠC' },
];

function generateRandomCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useLoginController(
  onLoginSuccess?: () => void,
  onGoBack?: () => void
) {
  const navigation = useNavigation<any>();
  const { login, register, loginAsRole, isLoading } = useUserStore();
  const { setCampus } = useCampusStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [selectedCampusId, setSelectedCampusId] = useState<string>('hl');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('quanlmse172819@fpt.edu.vn');
  const [loginPassword, setLoginPassword] = useState<string>('fpt123456');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Register form state
  const [regFullName, setRegFullName] = useState<string>('');
  const [regStudentId, setRegStudentId] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);

  // Captcha & OTP & Google state
  const [captchaCode, setCaptchaCode] = useState<string>(() => generateRandomCaptcha());
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<boolean>(false);
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const currentCampus = useMemo(() => {
    return CAMPUS_LIST.find((c) => c.id === selectedCampusId) || CAMPUS_LIST[0];
  }, [selectedCampusId]);

  const handleSelectCampus = useCallback((item: CampusChipItem) => {
    setSelectedCampusId(item.id);
    setCampus(item.storeValue);
  }, [setCampus]);

  const navigateAfterAuth = useCallback(() => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (navigation && navigation.replace) {
      navigation.replace('MainTabs');
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [onLoginSuccess, navigation]);

  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [onGoBack, navigation]);

  const handleGoHome = useCallback(() => {
    if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [navigation]);

  const handleToggleShowLoginPassword = useCallback(() => {
    setShowLoginPassword((prev) => !prev);
  }, []);

  const handleToggleRememberMe = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const handleToggleShowRegPassword = useCallback(() => {
    setShowRegPassword((prev) => !prev);
  }, []);

  const handleToggleShowRegConfirmPassword = useCallback(() => {
    setShowRegConfirmPassword((prev) => !prev);
  }, []);

  const handleRefreshCaptcha = useCallback(() => {
    setCaptchaCode(generateRandomCaptcha());
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  const handleForgotPass = useCallback(() => {
    Alert.alert(
      '🔑 Quên mật khẩu',
      'Vui lòng truy cập cổng FAP (fap.fpt.edu.vn) hoặc liên hệ IT Helpdesk FPT để lấy lại mật khẩu email / tài khoản MSSV.'
    );
  }, []);

  const handleLoginSubmit = useCallback(async () => {
    if (!loginIdentifier.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập MSSV hoặc Email FPT');
      return;
    }
    if (!loginPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    const res = await login(loginIdentifier.trim(), loginPassword.trim());
    if (res.success) {
      navigateAfterAuth();
    } else {
      Alert.alert('Đăng nhập thất bại', res.message);
    }
  }, [loginIdentifier, loginPassword, login, navigateAfterAuth]);

  const handleRegisterSubmit = useCallback(async () => {
    if (!regFullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }
    if (!regStudentId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mã số sinh viên (MSSV)');
      return;
    }
    if (!regEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email FPT (@fpt.edu.vn)');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError(true);
      Alert.alert('Lỗi Captcha', 'Mã xác thực không chính xác. Vui lòng nhập lại.');
      return;
    }

    // Mở OTP Verification Modal
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setShowOtpModal(true);
    }, 400);
  }, [
    regFullName,
    regStudentId,
    regEmail,
    regPassword,
    regConfirmPassword,
    captchaInput,
    captchaCode,
  ]);

  const handleOtpVerifySuccess = useCallback(async (verifiedUser: any) => {
    setShowOtpModal(false);
    // Lưu tài khoản sau khi OTP xác thực thành công
    const res = await register({
      fullName: regFullName.trim(),
      studentId: regStudentId.trim().toUpperCase(),
      email: regEmail.trim(),
      phone: regPhone.trim() || undefined,
      password: regPassword.trim(),
      campus: currentCampus.storeValue,
    });

    if (res.success) {
      Alert.alert(
        '🎉 Đăng ký thành công',
        `Chào mừng ${regFullName} gia nhập Market FU!`,
        [{ text: 'Bắt đầu ngay', onPress: navigateAfterAuth }]
      );
    } else {
      Alert.alert('Lỗi hoàn tất đăng ký', res.message);
    }
  }, [regFullName, regStudentId, regEmail, regPhone, regPassword, currentCampus.storeValue, register, navigateAfterAuth]);

  const handleOtpCancel = useCallback(() => {
    setShowOtpModal(false);
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      // Mock Google SSO dành cho sinh viên FPT
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 600));
      const res = await loginAsRole('VERIFIED_STUDENT');
      if (res.success) {
        navigateAfterAuth();
      } else {
        Alert.alert('Đăng nhập Google thất bại', res.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [loginAsRole, navigateAfterAuth]);

  const handleQuickSwitchRole = useCallback(async (roleType: 'UNVERIFIED_STUDENT' | 'VERIFIED_STUDENT' | 'TOP_SELLER') => {
    const res = await loginAsRole(roleType);
    if (res.success) {
      navigateAfterAuth();
    } else {
      Alert.alert('Lỗi', res.message);
    }
  }, [loginAsRole, navigateAfterAuth]);

  return {
    authMode,
    setAuthMode,
    selectedCampusId,
    currentCampus,
    handleSelectCampus,
    loginIdentifier,
    setLoginIdentifier,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    handleToggleShowLoginPassword,
    rememberMe,
    handleToggleRememberMe,
    regFullName,
    setRegFullName,
    regStudentId,
    setRegStudentId,
    regEmail,
    setRegEmail,
    regPhone,
    setRegPhone,
    regPassword,
    setRegPassword,
    regConfirmPassword,
    setRegConfirmPassword,
    showRegPassword,
    handleToggleShowRegPassword,
    showRegConfirmPassword,
    handleToggleShowRegConfirmPassword,
    captchaCode,
    captchaInput,
    setCaptchaInput,
    captchaError,
    handleRefreshCaptcha,
    showOtpModal,
    isSendingOtp,
    isGoogleLoading,
    isLoading,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleOtpVerifySuccess,
    handleOtpCancel,
    handleGoogleLogin,
    handleQuickSwitchRole,
    handleForgotPass,
    handleGoBack,
    handleGoHome,
  };
}
