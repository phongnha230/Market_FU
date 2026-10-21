import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import { useUserStore } from '../stores/userStore';
import {
  Onboarding1Screen,
  Onboarding2Screen,
  Onboarding3Screen,
  LoginScreen,
  ManageListingsScreen,
  SavedItemsScreen,
  AiAssistantScreen,
  ProductDetailScreen,
  ContextualAuthScreen,
  ContextualChatAuthScreen,
  DisputeScreen,
  VoucherScreen,
  CheckoutScreen,
  CheckoutSuccessScreen,
  EditListingScreen,
  OrderListScreen,
  OrderDetailScreen,
  ReviewScreen,
  ChatListScreen,
  ChatDetailScreen,
  SettingsScreen,
  AccountSettingsScreen,
  ChangePasswordScreen,
  NotificationSettingsScreen,
  PrivacySettingsScreen,
  HelpCenterScreen,
  AboutScreen,
  NotificationScreen,
  SellerDashboardScreen,
  InterCampusTransactionScreen,
  PublicSellerProfileScreen,
  SafePointHubsScreen,
  CoinHistoryScreen,
  WithdrawalHistoryScreen,
  ExploreScreen,
  SearchScreen,
  ProductListScreen,
} from '../screens';
import { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(
    useUserStore.persist?.hasHydrated ? useUserStore.persist.hasHydrated() : true
  );

  useEffect(() => {
    if (useUserStore.persist?.onFinishHydration) {
      const unsub = useUserStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      if (useUserStore.persist.hasHydrated()) {
        setIsHydrated(true);
      }
      return () => unsub();
    }
  }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  const initialRouteName =
    isAuthenticated || hasCompletedOnboarding ? 'MainTabs' : 'Onboarding1';

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding1" component={Onboarding1Screen as any} />
        <Stack.Screen name="Onboarding2" component={Onboarding2Screen as any} />
        <Stack.Screen name="Onboarding3" component={Onboarding3Screen as any} />
        <Stack.Screen name="Login" component={LoginScreen as any} />
        <Stack.Screen name="ManageListings" component={ManageListingsScreen as any} />
        <Stack.Screen name="SavedItems" component={SavedItemsScreen as any} />
        <Stack.Screen name="AiAssistant" component={AiAssistantScreen as any} />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ gestureEnabled: false, headerBackVisible: false }}
        />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen as any} />
        <Stack.Screen
          name="ContextualAuth"
          component={ContextualAuthScreen as any}
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="ContextualChatAuth"
          component={ContextualChatAuthScreen as any}
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen name="Dispute" component={DisputeScreen as any} />
        <Stack.Screen name="Voucher" component={VoucherScreen as any} />

        {/* New Connected Screens */}
        <Stack.Screen name="Checkout" component={CheckoutScreen as any} />
        <Stack.Screen name="CheckoutSuccess" component={CheckoutSuccessScreen as any} />
        <Stack.Screen name="EditListing" component={EditListingScreen as any} />
        <Stack.Screen name="OrderList" component={OrderListScreen as any} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen as any} />
        <Stack.Screen name="Review" component={ReviewScreen as any} />
        <Stack.Screen name="ChatList" component={ChatListScreen as any} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen as any} />
        <Stack.Screen name="Settings" component={SettingsScreen as any} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen as any} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen as any} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen as any} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen as any} />
        <Stack.Screen name="About" component={AboutScreen as any} />
        <Stack.Screen name="Notification" component={NotificationScreen as any} />
        <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen as any} />
        <Stack.Screen name="InterCampusTransaction" component={InterCampusTransactionScreen as any} />
        <Stack.Screen name="PublicSellerProfile" component={PublicSellerProfileScreen as any} />
        <Stack.Screen name="SafePointHubs" component={SafePointHubsScreen as any} />
        <Stack.Screen name="CoinHistory" component={CoinHistoryScreen as any} />
        <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen as any} />
        <Stack.Screen name="Explore" component={ExploreScreen as any} />
        <Stack.Screen name="Search" component={SearchScreen as any} />
        <Stack.Screen name="ProductList" component={ProductListScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
