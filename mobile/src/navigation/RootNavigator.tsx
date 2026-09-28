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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
