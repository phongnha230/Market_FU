import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Saved?: undefined;
  Chat: undefined;
  PostItem?: undefined;
  MyListings?: undefined;
  Orders?: undefined;
  Voucher?: undefined;
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
  Search: { autoFocus?: boolean; initialKeyword?: string } | undefined;
  ProductList: {
    mode?: 'TRENDING' | 'CAMPUS_ALL' | 'CATEGORY';
    campusName?: string;
    category?: string;
    title?: string;
  } | undefined;
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
  Checkout:
    | {
        product?: any;
        isDifferentCampus?: boolean;
        type?: 'meetup' | 'shipping';
        safePoint?: string;
        agreedPrice?: number;
        offerPrice?: number;
      }
    | undefined;
  CheckoutSuccess:
    | {
        orderCode: string;
        totalAmount: number;
        product?: any;
        safePoint?: string;
        buyerName?: string;
        handshakeOtp?: string;
        timeSlot?: string;
        isDifferentCampus?: boolean;
        fromCampus?: string;
        toCampus?: string;
      }
    | undefined;
  EditListing:
    | {
        productId?: string;
        product?: any;
      }
    | undefined;
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
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  HelpCenter: undefined;
  About: undefined;
  Notification: undefined;
  SellerDashboard: undefined;
  InterCampusTransaction:
    | {
        orderId?: string;
        order?: any;
        product?: any;
        fromCampus?: string;
        toCampus?: string;
      }
    | undefined;
  PublicSellerProfile:
    | {
        userId?: string;
        sellerName?: string;
      }
    | undefined;
  SafePointHubs:
    | {
        selectedCampus?: string;
      }
    | undefined;
  CoinHistory: undefined;
  WithdrawalHistory: undefined;
  Explore:
    | {
        searchKeyword?: string;
        category?: string;
      }
    | undefined;
};
