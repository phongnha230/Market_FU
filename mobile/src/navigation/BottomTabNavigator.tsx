import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HomeScreen,
  PostItemScreen,
  ChatListScreen,
  ProfileScreen,
  ManageListingsScreen,
  OrderListScreen,
  VoucherScreen,
  SavedItemsScreen,
} from '../screens';
import { MainTabsParamList } from './types';
import { useUserStore, useChatStore, useOrderStore } from '../stores';
import { useKho } from '../context/KhoContext';
import { RequireAuthModal } from '../components';

const Tab = createBottomTabNavigator<MainTabsParamList>();

interface TabConfig {
  iconFocused: any;
  iconUnfocused: any;
  label: string;
}

const getTabConfig = (routeName: string, isAuthenticated: boolean, isSeller: boolean): TabConfig => {
  switch (routeName) {
    case 'Home':
      return {
        iconFocused: 'storefront',
        iconUnfocused: 'storefront-outline',
        label: 'Chợ Campus',
      };
    case 'Saved':
      return {
        iconFocused: 'heart',
        iconUnfocused: 'heart-outline',
        label: 'Đã lưu',
      };
    case 'Chat':
      return {
        iconFocused: 'chatbubble-ellipses',
        iconUnfocused: 'chatbubble-ellipses-outline',
        label: 'Tin nhắn',
      };
    case 'Orders':
      return {
        iconFocused: 'bag-check',
        iconUnfocused: 'bag-check-outline',
        label: isSeller ? 'Đơn bán' : 'Đơn mua',
      };
    case 'Voucher':
      return {
        iconFocused: 'gift',
        iconUnfocused: 'gift-outline',
        label: 'Ưu đãi & Xu',
      };
    case 'PostItem':
      return {
        iconFocused: 'add-circle',
        iconUnfocused: 'add-circle-outline',
        label: 'Đăng tin',
      };
    case 'MyListings':
      return {
        iconFocused: 'file-tray-full',
        iconUnfocused: 'file-tray-full-outline',
        label: 'Kho hàng',
      };
    case 'Profile':
    default:
      return {
        iconFocused: 'person',
        iconUnfocused: 'person-outline',
        label: !isAuthenticated ? 'Đăng nhập' : isSeller ? 'Shop tôi' : 'Tài khoản',
      };
  }
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useUserStore();
  const { inventoryStats } = useKho();
  const { orders } = useOrderStore();
  const unreadChatCount = useChatStore((s) =>
    s.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'auth' | 'seller' | 'kyc'>('auth');
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);

  const isSeller = user?.role === 'SELLER';
  const isVerified = (user?.isKycVerified || isSeller) && user?.kycStatus !== 'PENDING';

  // 1. Badge Đơn mua/Đơn bán: Đếm các đơn hàng đang hoạt động / cần chú ý (đang thanh toán, chờ gặp Safe-Point, khiếu nại)
  const activeOrdersCount = useMemo(() => {
    if (!isAuthenticated || !user?.id) return 0;
    return orders.filter(
      (o) =>
        (isSeller ? o.sellerId === user.id || o.buyerId === user.id : o.buyerId === user.id) &&
        ['PENDING_SAFEPOINT', 'ESCROW_PAID', 'HANDOVER_CONFIRMED', 'DISPUTED'].includes(o.status)
    ).length;
  }, [orders, isAuthenticated, user?.id, isSeller]);

  // 2. Badge Kho hàng: Chỉ hiện khi có tin cần người bán chú ý (tin bị từ chối cần sửa hoặc tin chờ duyệt)
  const khoAttentionCount = (inventoryStats.rejected || 0) + (inventoryStats.pending || 0);

  useEffect(() => {
    if (isAuthenticated) {
      useChatStore.getState().fetchConversations().catch(() => {});
    }
  }, [isAuthenticated]);

  const handleTabPress = useCallback(
    (route: any, isFocused: boolean) => {
      // 1. Kiểm tra Guest Mode (Chưa đăng nhập)
      if (!isAuthenticated) {
        if (['Chat', 'Saved', 'Orders', 'Voucher', 'PostItem', 'MyListings'].includes(route.name)) {
          let featureName = 'tính năng này';
          if (route.name === 'Chat') featureName = 'Hộp thư tin nhắn & trả giá';
          if (route.name === 'Saved') featureName = 'Danh sách sản phẩm đã lưu';
          if (route.name === 'Orders') featureName = 'Quản lý đơn hàng';
          if (route.name === 'PostItem') featureName = 'Đăng bán đồ thanh lý';
          if (route.name === 'MyListings') featureName = 'Kho hàng & quản lý tin đăng';

          setModalMode('auth');
          setModalTitle('Yêu cầu đăng nhập tài khoản');
          setModalMessage(
            `Bạn đang ở chế độ xem sản phẩm (Khách). Để truy cập ${featureName}, vui lòng đăng nhập tài khoản Sinh viên FPT.`
          );
          setModalVisible(true);
          return;
        }

        if (route.name === 'Profile') {
          navigation.navigate('Login');
          return;
        }
      }

      // 2. Kiểm tra Xác thực Sinh viên (KYC): Chưa KYC SV KHÔNG ĐƯỢC CHAT
      if (isAuthenticated && !isVerified && route.name === 'Chat') {
        setModalMode('kyc');
        setModalTitle('Yêu cầu Xác thực Thẻ Sinh Viên');
        setModalMessage(
          'Theo quy định bảo vệ an toàn chợ Market FU, sinh viên cần xác thực Thẻ Sinh Viên FPT (KYC) để nhắn tin, trả giá và giao dịch.'
        );
        setModalVisible(true);
        return;
      }

      // Chuyển tab bình thường
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [isAuthenticated, isVerified, navigation]
  );

  // Ẩn thanh bottom tab bar khi đang ở màn hình Đăng tin (PostItem)
  // để toàn bộ diện tích màn hình dành cho form đăng bán và nút submit không bị che
  // (ĐẶT SAU TẤT CẢ CÁC HOOKS ĐỂ TUÂN THỦ 100% RULES OF HOOKS CỦA REACT)
  const currentRoute = state.routes[state.index];
  const focusedOptions = currentRoute ? descriptors[currentRoute.key]?.options : undefined;
  if (currentRoute?.name === 'PostItem' || (focusedOptions?.tabBarStyle as any)?.display === 'none') {
    return null;
  }

  return (
    <>
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 4 : 0),
          },
        ]}
      >
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            if (route.name === 'Explore') return null;

            const isFocused = state.index === index;
            const config = getTabConfig(route.name, isAuthenticated, isSeller);
            const iconName = isFocused ? config.iconFocused : config.iconUnfocused;
            const isPostItem = route.name === 'PostItem';

            if (isPostItem) {
              return (
                <TouchableOpacity
                  key={route.key}
                  style={styles.postItemTab}
                  activeOpacity={0.85}
                  onPress={() => handleTabPress(route, isFocused)}
                >
                  <View style={styles.postItemButton}>
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.postItemLabel}>Đăng tin</Text>
                </TouchableOpacity>
              );
            }

            const iconSize = isFocused ? 24 : 22;
            const iconColor = isFocused ? '#EA580C' : '#64748B';

            return (
              <TouchableOpacity
                key={route.key}
                style={[styles.tabItem, isFocused && styles.activeTabItem]}
                activeOpacity={0.7}
                onPress={() => handleTabPress(route, isFocused)}
              >
                <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                  <Ionicons name={iconName} size={iconSize} color={iconColor} />
                  {route.name === 'Chat' && isAuthenticated && unreadChatCount > 0 && (
                    <View style={styles.chatBadge}>
                      <Text style={styles.chatBadgeText}>
                        {unreadChatCount > 99 ? '99+' : unreadChatCount}
                      </Text>
                    </View>
                  )}
                  {route.name === 'Orders' && isAuthenticated && activeOrdersCount > 0 && (
                    <View style={styles.chatBadge}>
                      <Text style={styles.chatBadgeText}>
                        {activeOrdersCount > 99 ? '99+' : activeOrdersCount}
                      </Text>
                    </View>
                  )}
                  {route.name === 'MyListings' && isSeller && khoAttentionCount > 0 && (
                    <View style={styles.chatBadge}>
                      <Text style={styles.chatBadgeText}>
                        {khoAttentionCount > 99 ? '99+' : khoAttentionCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <RequireAuthModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mode={modalMode}
        title={modalTitle}
        message={modalMessage}
        onNavigateLogin={() => {
          navigation.navigate('Login');
        }}
        onNavigateKyc={() => {
          navigation.navigate('Profile');
        }}
      />
    </>
  );
};

export const BottomTabNavigator = () => {
  const { user, isAuthenticated } = useUserStore();
  const isSeller = isAuthenticated && user?.role === 'SELLER';

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      backBehavior="history"
      detachInactiveScreens={false}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      {isSeller ? (
        <>
          <Tab.Screen name="MyListings" component={ManageListingsScreen} />
          <Tab.Screen
            name="PostItem"
            component={PostItemScreen}
            options={{ tabBarStyle: { display: 'none' } }}
          />
          <Tab.Screen name="Chat" component={ChatListScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Orders" component={OrderListScreen} />
          <Tab.Screen name="Saved" component={SavedItemsScreen} />
          <Tab.Screen name="Chat" component={ChatListScreen} />
        </>
      )}

      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 8 },
    }),
  },
  tabBarInner: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5,
  },
  activeTabItem: {},
  iconContainer: {
    position: 'relative',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#EA580C',
    fontWeight: '800',
    fontSize: 10.5,
  },
  postItemTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -16,
  },
  postItemButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F27024',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  postItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F27024',
    marginTop: 2,
  },
  chatBadge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: '#EA580C',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
});

export default BottomTabNavigator;
