import './global.css';
import React, { useEffect } from 'react';
import { LogBox, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KhoProvider } from './src/context/KhoContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TopNotificationBanner } from './src/components/common/TopNotificationBanner';
import { NotificationConsentModal } from './src/components/common/NotificationConsentModal';
import { GlobalAlertModal } from './src/components/common/GlobalAlertModal';
import { BiometricLockGuard } from './src/components/common/BiometricLockGuard';
import { installCustomAlert } from './src/services/customAlertService';
import { setupNotificationListeners, registerForPushNotificationsAsync } from './src/services/notificationMobileService';

// Cài đặt custom alert giao diện đẹp thay thế toàn bộ Alert.alert native
installCustomAlert();

LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
]);

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      errorMessage: error?.message || String(error),
    };
  }

  componentDidCatch(error: any, info: any) {
    console.warn('⚠️ [AppErrorBoundary caught error]:', error?.message, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Đã xảy ra sự cố hiển thị</Text>
          <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => this.setState({ hasError: false, errorMessage: '' })}
          >
            <Text style={styles.retryText}>Tải lại màn hình</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    const cleanup = setupNotificationListeners();
    registerForPushNotificationsAsync().catch(() => {});
    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <KhoProvider>
          <StatusBar style="dark" />
          <RootNavigator />
          <BiometricLockGuard />
          <TopNotificationBanner />
          <NotificationConsentModal />
          <GlobalAlertModal />
        </KhoProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
