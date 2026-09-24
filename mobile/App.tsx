import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import PostItemScreen from './src/screens/PostItemScreen';
import DisputeScreen from './src/screens/DisputeScreen';
import VoucherScreen from './src/screens/VoucherScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import Onboarding1Screen from './src/screens/Onboarding1Screen';
import Onboarding2Screen from './src/screens/Onboarding2Screen';

export type ActiveTab =
  | 'home'
  | 'explore'
  | 'post'
  | 'chat'
  | 'profile'
  | 'dispute'
  | 'voucher'
  | 'orders'
  | 'product_detail';

export default function App() {
  // Onboarding state: 1 = Onboarding 1, 2 = Onboarding 2, null = đã vào app
  const [onboardingStep, setOnboardingStep] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ActiveTab);
  };

  // Show Onboarding on first launch
  if (onboardingStep === 1) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Onboarding1Screen
          onNext={() => setOnboardingStep(2)}
          onSkip={() => setOnboardingStep(null)}
        />
      </SafeAreaProvider>
    );
  }

  if (onboardingStep === 2) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <Onboarding2Screen
          onNext={() => setOnboardingStep(null)}
          onBack={() => setOnboardingStep(1)}
          onSkip={() => setOnboardingStep(null)}
        />
      </SafeAreaProvider>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <ExploreScreen
            onGoBack={() => setActiveTab('home')}
            onTabChange={handleTabChange}
          />
        );
      case 'post':
        return (
          <PostItemScreen
            onGoBack={() => setActiveTab('home')}
            onSubmitSuccess={() => setActiveTab('home')}
          />
        );
      case 'dispute':
        return <DisputeScreen onGoBack={() => setActiveTab('home')} />;
      case 'voucher':
        return (
          <VoucherScreen
            onGoBack={() => setActiveTab('home')}
            onTabChange={handleTabChange}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onGoBack={() => setActiveTab('home')}
            onTabChange={handleTabChange}
          />
        );
      case 'product_detail':
        return (
          <ProductDetailScreen
            onGoBack={() => setActiveTab('home')}
            onTabChange={handleTabChange}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            onGoBack={() => setActiveTab('home')}
            onTabChange={handleTabChange}
          />
        );
      case 'home':
      default:
        return <HomeScreen onTabChange={handleTabChange} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}
