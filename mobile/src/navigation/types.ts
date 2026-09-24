import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Explore: undefined;
  PostItem: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  ProductDetail: { productId?: string } | undefined;
  Dispute: undefined;
  Voucher: undefined;
};
