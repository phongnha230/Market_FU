import './global.css';
import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KhoProvider } from './src/context/KhoContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TopNotificationBanner } from './src/components/common/TopNotificationBanner';
import { NotificationConsentModal } from './src/components/common/NotificationConsentModal';

LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <KhoProvider>
        <StatusBar style="dark" />
        <RootNavigator />
        <TopNotificationBanner />
        <NotificationConsentModal />
      </KhoProvider>
    </SafeAreaProvider>
  );
}
