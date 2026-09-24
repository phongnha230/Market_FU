import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import DisputeScreen from '../screens/DisputeScreen';
import VoucherScreen from '../screens/VoucherScreen';
import Onboarding1Screen from '../screens/Onboarding1Screen';
import Onboarding2Screen from '../screens/Onboarding2Screen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen as any} />
        <Stack.Screen name="Dispute" component={DisputeScreen as any} />
        <Stack.Screen name="Voucher" component={VoucherScreen as any} />
        <Stack.Screen name="Onboarding1" component={Onboarding1Screen as any} />
        <Stack.Screen name="Onboarding2" component={Onboarding2Screen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
