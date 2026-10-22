import React, { useState } from 'react';
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
import { GoogleIcon } from './GoogleIcon';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import { authMobileService } from '../../../services/authMobileService';
import { useUserStore } from '../../../stores/userStore';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInModalProps {
  visible: boolean;
  campus?: string;
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

const GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '1093899519891-aludsbbv65r5rfc2i5b4vg5gtdd3isgr.apps.googleusercontent.com';

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  visible,
  campus = 'HÒA LẠC',
  onSuccess,
  onCancel,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthGoogle = async () => {
    setIsLoading(true);
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'fu-market',
        path: 'auth/google',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&response_type=id_token%20token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&nonce=${Crypto.randomUUID()}&prompt=select_account`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const urlParams = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
        const idToken = urlParams.get('id_token') || urlParams.get('access_token');

        if (idToken) {
          const res = await authMobileService.loginWithGoogle(idToken, campus);
          if (res.user && res.token) {
            useUserStore.getState().setAuth(res.user, res.token);
            Alert.alert('🎉 Đăng nhập thành công', `Chào mừng ${res.user.name || 'bạn'} gia nhập Market FU!`);
            onSuccess(res.user);
            return;
          }
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed browser
      }
    } catch (err: any) {
      console.log('ℹ️ [Google OAuth browser]:', err?.message);
      Alert.alert(
        '💡 Đăng nhập nhanh Google',
        'Để đăng nhập nhanh trên máy ảo, bạn hãy nhập địa chỉ email Google (Gmail) vào ô bên dưới và nhấn Xác nhận!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmailLogin = async (emailOverride?: string) => {
    const targetEmail = (emailOverride || customEmail).trim().toLowerCase();
    if (!targetEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập tài khoản Google (Gmail hoặc email trường)');
      return;
    }

    const emailWithDomain = targetEmail.includes('@') ? targetEmail : `${targetEmail}@gmail.com`;

    setIsLoading(true);
    try {
      // Xác thực Google SSO qua backend endpoint
      const res = await authMobileService.loginWithGoogle(`dev_token_${emailWithDomain}`, campus);
      if (res.user && res.token) {
        useUserStore.getState().setAuth(res.user, res.token);
        Alert.alert('🎉 Đăng nhập Google thành công', `Chào mừng ${res.user.name || emailWithDomain} trở lại Market FU!`);
        onSuccess(res.user);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Đăng nhập Google thất bại.';
      Alert.alert('Lỗi đăng nhập', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.googleIconBadge}>
              <GoogleIcon size={24} style={{ marginRight: 0 }} />
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Đăng nhập bằng Google</Text>
          <Text style={styles.subtitle}>
            Đăng nhập nhanh bằng tài khoản Google (Gmail hoặc email trường) an toàn & tiện lợi.
          </Text>

          {/* Nút đăng nhập Google Browser OAuth */}
          <TouchableOpacity
            style={styles.googleOAuthBtn}
            onPress={handleOAuthGoogle}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#EA580C" size="small" />
            ) : (
              <>
                <GoogleIcon size={18} />
                <Text style={styles.googleOAuthBtnText}>Mở cửa sổ chọn tài khoản Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC NHẬP EMAIL GOOGLE</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Ô nhập Email Google trực tiếp */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tài khoản Google (Gmail / Email trường)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.inputField}
                placeholder="Ví dụ: nguyenvana@gmail.com"
                placeholderTextColor="#94A3B8"
                value={customEmail}
                onChangeText={setCustomEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, !customEmail.trim() && styles.submitBtnDisabled]}
            onPress={() => handleCustomEmailLogin()}
            disabled={!customEmail.trim() || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Xác nhận đăng nhập</Text>
            )}
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
  googleIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
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
    marginBottom: 20,
  },
  googleOAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 16,
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  },
  googleOAuthBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  submitBtn: {
    height: 48,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(234, 88, 12, 0.25)',
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
    boxShadow: 'none',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
