import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometricStore } from '../../stores/useBiometricStore';
import { useAuthStore } from '../../stores/userStore';

export const BiometricLockGuard: React.FC = () => {
  const {
    isLocked,
    isBiometricsEnabled,
    biometricLabel,
    isAuthenticating,
    initialize,
    unlockApp,
    lockApp,
  } = useBiometricStore();

  const { user, logout } = useAuthStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTimestamp = useRef<number>(0);

  // Khởi tạo trạng thái sinh trắc học lúc mở app
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Lắng nghe trạng thái chạy ngầm / foreground của ứng dụng
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Khi app chuyển sang nền (background hoặc inactive)
      if (
        appState.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        backgroundTimestamp.current = Date.now();
      }

      // Khi app quay lại màn hình chính (active)
      if (
        (appState.current === 'background' || appState.current === 'inactive') &&
        nextAppState === 'active'
      ) {
        const timeInBackground = Date.now() - backgroundTimestamp.current;

        // Nếu app chạy ngầm hơn 2 giây và tính năng bảo mật đang bật
        if (
          isBiometricsEnabled &&
          !!user &&
          !isAuthenticating &&
          timeInBackground > 2000
        ) {
          lockApp();
          // Tự động gọi mở khóa sau một nhịp ngắn để UI kịp render
          setTimeout(() => {
            unlockApp();
          }, 400);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricsEnabled, user, isAuthenticating, lockApp, unlockApp]);

  // Nếu không bị khóa hoặc chưa đăng nhập, không hiển thị màn hình khóa
  if (!isLocked || !user || !isBiometricsEnabled) {
    return null;
  }

  const handleLogout = () => {
    useBiometricStore.setState({ isLocked: false });
    logout();
  };

  const isFaceID = biometricLabel.toLowerCase().includes('face');

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Decorative background glows */}
      <View style={styles.glowCircle} />

      <View style={styles.contentContainer}>
        {/* Brand Shield & Lock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.pulseRing} />
          <View style={styles.iconCircle}>
            <Ionicons
              name={isFaceID ? 'scan-outline' : 'finger-print'}
              size={52}
              color="#F27024"
            />
          </View>
        </View>

        {/* Text information */}
        <Text style={styles.title}>FU SecondHand đã khóa</Text>
        <Text style={styles.subtitle}>
          Bảo vệ quyền riêng tư & ví sinh viên.{'\n'}Xác thực bằng{' '}
          <Text style={styles.highlightText}>{biometricLabel}</Text> để tiếp tục.
        </Text>

        {/* User preview badge */}
        <View style={styles.userBadge}>
          <Ionicons name="person-circle-outline" size={20} color="#94A3B8" />
          <Text style={styles.userText} numberOfLines={1}>
            {user.name || user.studentId || user.email || 'Sinh viên FPT'}
          </Text>
        </View>

        {/* Primary Unlock CTA */}
        <TouchableOpacity
          style={styles.unlockButton}
          activeOpacity={0.85}
          onPress={() => unlockApp()}
        >
          <Ionicons
            name={isFaceID ? 'scan' : 'finger-print-outline'}
            size={22}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.unlockButtonText}>Mở khóa bằng {biometricLabel}</Text>
        </TouchableOpacity>

        {/* Secondary Logout option */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark" size={14} color="#10B981" />
        <Text style={styles.footerText}>Bảo mật mã hóa đầu cuối thiết bị FPT</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#090D16',
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  glowCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(242, 112, 36, 0.08)',
    top: '25%',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pulseRing: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1.5,
    borderColor: 'rgba(242, 112, 36, 0.35)',
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  highlightText: {
    color: '#F97316',
    fontWeight: '700',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.7)',
    marginBottom: 32,
  },
  userText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginLeft: 6,
    maxWidth: 200,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    width: '100%',
    height: 52,
    borderRadius: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
});
