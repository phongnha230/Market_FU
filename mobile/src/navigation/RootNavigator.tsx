import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import DisputeScreen from '../screens/DisputeScreen';
import VoucherScreen from '../screens/VoucherScreen';
import Onboarding1Screen from '../screens/Onboarding1Screen';
import Onboarding2Screen from '../screens/Onboarding2Screen';
import Onboarding3Screen from '../screens/Onboarding3Screen';
import ContextualAuthScreen from '../screens/ContextualAuthScreen';
import ContextualChatAuthScreen from '../screens/ContextualChatAuthScreen';
import LoginScreen from '../screens/LoginScreen';
import ManageListingsScreen from '../screens/ManageListingsScreen';
import AiAssistantScreen from '../screens/AiAssistantScreen';
import SavedItemsScreen from '../screens/SavedItemsScreen';

// New Screens
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import ReviewScreen from '../screens/ReviewScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationScreen from '../screens/NotificationScreen';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding1"
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
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
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
        <Stack.Screen name="OrderList" component={OrderListScreen as any} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen as any} />
        <Stack.Screen name="Review" component={ReviewScreen as any} />
        <Stack.Screen name="ChatList" component={ChatListScreen as any} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen as any} />
        <Stack.Screen name="Settings" component={SettingsScreen as any} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen as any} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen as any} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen as any} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen as any} />
        <Stack.Screen name="About" component={AboutScreen as any} />
        <Stack.Screen name="Notification" component={NotificationScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
