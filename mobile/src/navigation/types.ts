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
  Dispute:
    | {
        orderId?: string;
        productTitle?: string;
        sellerName?: string;
        price?: string;
      }
    | undefined;
  Voucher: undefined;

  // New Routes
  Checkout: { product?: any; isDifferentCampus?: boolean } | undefined;
  OrderList: undefined;
  OrderDetail:
    | {
        orderId?: string;
        product?: any;
        status?: string;
        safePoint?: string;
        isReviewed?: boolean;
        totalAmount?: number;
      }
    | undefined;
  Review:
    | {
        orderId?: string;
        productTitle?: string;
        sellerName?: string;
        productImage?: any;
      }
    | undefined;
  ChatList: undefined;
  ChatDetail:
    | {
        partner?: any;
        product?: any;
        initialOffer?: any;
      }
    | undefined;
  Settings: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  HelpCenter: undefined;
  About: undefined;
  Notification: undefined;
};
