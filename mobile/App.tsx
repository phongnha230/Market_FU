import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from './src/services/notificationMobileService';
import { KhoProvider } from './src/context/KhoContext';

export default function App() {
  useEffect(() => {
    // 1. Khởi tạo Kênh thông báo Android (Heads-up banner) & xin quyền Push
    registerForPushNotificationsAsync();

    // 2. Lắng nghe sự kiện người dùng bấm vào banner trên đỉnh màn hình để deep link
    const cleanupListeners = setupNotificationListeners();

    return () => {
      cleanupListeners?.();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <KhoProvider>
        <RootNavigator />
      </KhoProvider>
    </SafeAreaProvider>
  );
}
