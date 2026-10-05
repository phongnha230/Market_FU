import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authMobileService } from '../../../services/authMobileService';
import { useUserStore } from '../../../stores/userStore';

export interface OtpVerificationModalProps {
  visible: boolean;
  email: string;
  fullName: string;
  studentId?: string;
  campus?: string;
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  visible,
  email,
  fullName,
  studentId,
  campus,
  onSuccess,
  onCancel,
}) => {
  const MAX_RESENDS = 5;
  const [otp, setOtp] = useState<string>('');
  const [cooldown, setCooldown] = useState<number>(60);
  const [resendCount, setResendCount] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  // Reset state khi mở Modal
  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    if (visible) {
      setOtp('');
      setErrorMessage(null);
      setCooldown(60);
      setResendCount(0);
      focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
    return () => {
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, cooldown]);

  // Xử lý xác thực OTP
  const handleVerifyOtp = async (inputOtp?: string) => {
    const code = (inputOtp || otp).trim();
    if (code.length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      // 1. Gọi Backend API xác thực OTP thực tế (Gửi email + check Redis)
      const result = await authMobileService.verifyRegisterOtp({
        email,
        otp: code,
      });

      if (result.user && result.token) {
        useUserStore.getState().setAuth(result.user, result.token);
        onSuccess(result.user);
        return;
      }
    } catch (apiErr: any) {
      console.log('⚠️ [Backend verify OTP error]:', apiErr?.message);
      const errMsg =
        apiErr?.response?.data?.error?.message ||
        apiErr?.response?.data?.message ||
        apiErr?.message ||
        'Mã OTP không chính xác hoặc đã hết hạn.';

      setErrorMessage(errMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Gửi lại mã OTP (chạy lại đồng hồ đếm ngược 60s như web)
  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending || resendCount >= MAX_RESENDS) return;

    setIsResending(true);
    setErrorMessage(null);
    try {
      await authMobileService.resendRegisterOtp(email);
      setResendCount((prev) => prev + 1);
      setCooldown(60);
      setOtp('');
      inputRef.current?.focus();
      Alert.alert(
        '📬 Đã gửi lại mã OTP',
        `Mã xác thực 6 số mới đã được gửi tới hòm thư ${email}. Đồng hồ đếm ngược 60s đã được thiết lập lại.`
      );
    } catch (err: any) {
      console.log('⚠️ [Backend resend OTP error]:', err?.message);
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
      setErrorMessage(errMsg);
      Alert.alert('Gửi lại mã thất bại', errMsg);
    } finally {
      setIsResending(false);
    }
  };

  // Tự động kiểm tra khi nhập đủ 6 số
  const handleOtpChange = (val: string) => {
    const numeric = val.replace(/[^\d]/g, '').slice(0, 6);
    setOtp(numeric);
    if (errorMessage) setErrorMessage(null);
    if (numeric.length === 6) {
      handleVerifyOtp(numeric);
    }
  };

  const digits = otp.split('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-open-outline" size={26} color="#EA580C" />
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Title & Email Info */}
          <Text style={styles.title}>Xác thực Email Sinh Viên</Text>
          <Text style={styles.subtitle}>
            Hệ thống đã gửi mã bảo mật 6 chữ số tới hòm thư:
          </Text>
          <View style={styles.emailBadge}>
            <Ionicons name="school" size={14} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.emailText} numberOfLines={1}>
              {email}
            </Text>
          </View>

          {/* 6 Digit Display Boxes */}
          <TouchableOpacity
            style={styles.digitContainer}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const digit = digits[index] || '';
              const isFocused = otp.length === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.digitBox,
                    digit ? styles.digitBoxFilled : null,
                    isFocused ? styles.digitBoxActive : null,
                    errorMessage ? styles.digitBoxError : null,
                  ]}
                >
                  <Text style={styles.digitText}>{digit}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Hidden Real Input */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
          />

          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Verification Button */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (otp.length !== 6 || isVerifying) && styles.verifyBtnDisabled,
            ]}
            onPress={() => handleVerifyOtp()}
            disabled={otp.length !== 6 || isVerifying}
            activeOpacity={0.8}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.verifyBtnText}>Xác nhận mã OTP</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Resend Cooldown & Actions */}
          <View style={styles.footerRow}>
            {resendCount >= MAX_RESENDS ? (
              <View style={styles.maxResendWarning}>
                <Ionicons name="warning-outline" size={15} color="#DC2626" style={{ marginRight: 4 }} />
                <Text style={styles.maxResendText}>
                  Đã hết lượt gửi lại ({MAX_RESENDS}/{MAX_RESENDS}). Vui lòng thử lại sau.
                </Text>
              </View>
            ) : cooldown > 0 ? (
              <View style={styles.cooldownContainer}>
                <View style={styles.cooldownBox}>
                  <Ionicons name="time-outline" size={15} color="#EA580C" style={{ marginRight: 4 }} />
                  <Text style={styles.cooldownText}>
                    Gửi lại mã mới sau <Text style={{ color: '#EA580C', fontWeight: '800' }}>{cooldown}s</Text>
                  </Text>
                </View>
                <Text style={styles.remainingCountText}>
                  (Còn {MAX_RESENDS - resendCount}/{MAX_RESENDS} lần gửi lại)
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={isResending}
                style={styles.resendBtn}
                activeOpacity={0.7}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#EA580C" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={16} color="#EA580C" style={{ marginRight: 6 }} />
                    <Text style={styles.resendText}>
                      Gửi lại mã OTP ({MAX_RESENDS - resendCount} lần còn lại)
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Notice & Back button */}
          <View style={styles.tipBox}>
            <Ionicons name="information-circle-outline" size={16} color="#059669" style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={styles.tipText}>
              Mã có hiệu lực trong 5 phút. Hãy kiểm tra cả hộp thư Spam/Thư rác nếu chưa thấy.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backLink}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.backLinkText}>← Quay lại sửa thông tin đăng ký</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  digitBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxFilled: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  digitBoxActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  digitBoxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },
  verifyBtn: {
    height: 50,
    backgroundColor: '#EA580C',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(234, 88, 12, 0.25)',
  },
  verifyBtnDisabled: {
    backgroundColor: '#CBD5E1',
    boxShadow: 'none',
  },
  verifyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  cooldownContainer: {
    alignItems: 'center',
  },
  cooldownBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 13,
    color: '#64748B',
  },
  remainingCountText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  maxResendWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  maxResendText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  tipText: {
    fontSize: 11.5,
    color: '#166534',
    lineHeight: 16,
    flex: 1,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
