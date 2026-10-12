import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
import { useCampusStore, CampusType } from '../../../stores/useCampusStore';
import { CampusChipItem } from '../components/LoginCampusSelector';
import { authMobileService } from '../../../services/authMobileService';
import { signInWithGoogle } from '../../../services/googleSignIn';

export const CAMPUS_LIST: CampusChipItem[] = [
  { id: 'hl', name: 'Hòa Lạc', shortLabel: 'Hòa Lạc (HL)', storeValue: 'HÒA LẠC' },
  { id: 'hcm', name: 'Hồ Chí Minh', shortLabel: 'Hồ Chí Minh (HCM)', storeValue: 'TP.HCM' },
  { id: 'dn', name: 'Đà Nẵng', shortLabel: 'Đà Nẵng (ĐN)', storeValue: 'ĐÀ NẴNG' },
  { id: 'ct', name: 'Cần Thơ', shortLabel: 'Cần Thơ (CT)', storeValue: 'CẦN THƠ' },
  { id: 'qn', name: 'Quy Nhơn', shortLabel: 'Quy Nhơn (QN)', storeValue: 'QUY NHƠN' },
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
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
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
    const hasMinLen = regPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(regPassword);
    const hasNumber = /[0-9]/.test(regPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(regPassword);
    const isStrongPassword = hasMinLen && hasUpper && hasNumber && hasSpecial;

    if (!isStrongPassword) {
      Alert.alert(
        'Mật khẩu chưa đạt chuẩn',
        'Mật khẩu an toàn phải có tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa (A-Z), 1 chữ số (0-9) và 1 ký tự đặc biệt (!@#$%...).'
      );
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

    // Gửi OTP qua Backend và mở OTP Verification Modal
    setIsSendingOtp(true);
    try {
      await authMobileService.sendRegisterOtp({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        studentId: regStudentId.trim().toUpperCase(),
        campus: currentCampus.storeValue,
        phoneNumber: regPhone.trim() || undefined,
      });
      setShowOtpModal(true);
    } catch (err: any) {
      console.log('ℹ️ [Backend sendRegisterOtp error]:', err?.message);
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi mã OTP xác thực. Vui lòng kiểm tra lại thông tin.';
      Alert.alert('Không thể tiếp tục đăng ký', errMsg);
    } finally {
      setIsSendingOtp(false);
    }
  }, [
    regFullName,
    regStudentId,
    regEmail,
    regPhone,
    regPassword,
    regConfirmPassword,
    captchaInput,
    captchaCode,
    currentCampus.storeValue,
  ]);

  const handleOtpVerifySuccess = useCallback((verifiedUser: any) => {
    setShowOtpModal(false);
    // Tài khoản đã được xác thực và kích hoạt chính thức từ OTP Backend
    Alert.alert(
      '🎉 Đăng ký thành công!',
      `Chào mừng ${verifiedUser?.name || regFullName || 'bạn'} gia nhập chợ sinh viên FPT 5Campus!`,
      [{ text: 'Bắt đầu ngay', onPress: navigateAfterAuth }]
    );
  }, [regFullName, navigateAfterAuth]);

  const handleOtpCancel = useCallback(() => {
    setShowOtpModal(false);
  }, []);

  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);

  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const campus = currentCampus.storeValue;
      const result = await signInWithGoogle(campus);

      if (!result.success) {
        if (!result.cancelled) {
          Alert.alert('Đăng nhập Google thất bại', result.error);
        }
        return;
      }

      // Nếu đã xác thực thành công (từ flow chọn tài khoản)
      if (result.user && result.token) {
        useUserStore.getState().setAuth(result.user, result.token);
        navigateAfterAuth();
        return;
      }

      // Nếu có idToken từ native Google Play Services
      if (result.idToken) {
        const res = await authMobileService.loginWithGoogle(result.idToken, campus);
        if (res.user && res.token) {
          useUserStore.getState().setAuth(res.user, res.token);
          navigateAfterAuth();
        } else {
          Alert.alert('Lỗi', 'Không thể xác thực tài khoản Google. Vui lòng thử lại.');
        }
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Đăng nhập Google thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi đăng nhập Google', msg);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [currentCampus.storeValue, navigateAfterAuth]);

  const handleGoogleSuccess = useCallback((user: any) => {
    setShowGoogleModal(false);
    navigateAfterAuth();
  }, [navigateAfterAuth]);

  const handleCloseGoogleModal = useCallback(() => {
    setShowGoogleModal(false);
  }, []);

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
    showGoogleModal,
    isGoogleLoading,
    isLoading,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleOtpVerifySuccess,
    handleOtpCancel,
    handleGoogleLogin,
    handleGoogleSuccess,
    handleCloseGoogleModal,
    handleQuickSwitchRole,
    handleForgotPass,
    handleGoBack,
    handleGoHome,
  };
}
