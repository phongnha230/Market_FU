import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Chat: undefined;
  PostItem: undefined;
  MyListings: undefined;
  Profile: undefined;
  Explore?: undefined;
  AiAssistant?: undefined;
};

export type RootStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  ProductDetail: { productId?: string } | undefined;
  ContextualAuth: { product?: any } | undefined;
  ContextualChatAuth: { product?: any; sellerName?: string; sellerCohort?: string } | undefined;
  Login: undefined;
  ManageListings: undefined;
  SavedItems: undefined;
  AiAssistant: undefined;
  Dispute: undefined;
  Voucher: undefined;
};
