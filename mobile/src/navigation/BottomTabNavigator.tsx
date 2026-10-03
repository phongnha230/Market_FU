import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  PostItemScreen,
  ChatListScreen,
  ProfileScreen,
  ManageListingsScreen,
  OrderListScreen,
  VoucherScreen,
} from '../screens';
import { MainTabsParamList } from './types';
import { useUserStore } from '../stores';
import { RequireAuthModal } from '../components';

const Tab = createBottomTabNavigator<MainTabsParamList>();

interface TabConfig {
  iconFocused: any;
  iconUnfocused: any;
  label: string;
}

const getTabConfig = (routeName: string): TabConfig => {
  switch (routeName) {
    case 'Home':
      return {
        iconFocused: 'storefront',
        iconUnfocused: 'storefront-outline',
        label: 'Chợ Campus',
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
        label: 'Đơn mua',
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
        label: 'Đăng bán',
      };
    case 'MyListings':
      return {
        iconFocused: 'file-tray-full',
        iconUnfocused: 'file-tray-full-outline',
        label: 'Kênh bán',
      };
    case 'Profile':
    default:
      return {
        iconFocused: 'person',
        iconUnfocused: 'person-outline',
        label: 'Tài khoản',
      };
  }
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { isAuthenticated, user } = useUserStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'auth' | 'seller' | 'kyc'>('auth');
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalMessage, setModalMessage] = useState<string | undefined>(undefined);

  const isSeller = user?.role === 'SELLER';
  const isVerified = (user?.isKycVerified || isSeller) && user?.kycStatus !== 'PENDING';

  const handleTabPress = useCallback(
    (route: any, isFocused: boolean) => {
      // 1. Kiểm tra Guest Mode (Chưa đăng nhập)
      if (!isAuthenticated) {
        if (['Chat', 'Orders', 'Voucher', 'PostItem', 'MyListings', 'Profile'].includes(route.name)) {
          let featureName = 'tính năng này';
          if (route.name === 'Chat') featureName = 'Hộp thư tin nhắn & trả giá';
          if (route.name === 'Orders') featureName = 'Quản lý đơn hàng mua';
          if (route.name === 'Voucher') featureName = 'Ví voucher & điểm danh nhận xu';
          if (route.name === 'PostItem') featureName = 'Đăng bán đồ thanh lý';
          if (route.name === 'MyListings') featureName = 'Quản lý tin rao bán';
          if (route.name === 'Profile') featureName = 'Hồ sơ cá nhân';

          setModalMode('auth');
          setModalTitle('Yêu cầu đăng nhập tài khoản');
          setModalMessage(
            `Bạn đang ở chế độ xem sản phẩm (Khách). Để truy cập ${featureName}, vui lòng đăng nhập tài khoản Sinh viên FPT.`
          );
          setModalVisible(true);
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

  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          if (route.name === 'Explore') return null;

          const isFocused = state.index === index;
          const config = getTabConfig(route.name);
          const iconName = isFocused ? config.iconFocused : config.iconUnfocused;
          const iconSize = isFocused ? 26 : 22;
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
                {route.name === 'Chat' && isAuthenticated && (
                  <View style={styles.chatBadge}>
                    <Text style={styles.chatBadgeText}>2</Text>
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
  const { user } = useUserStore();
  const isSeller = user?.role === 'SELLER';

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />

      {isSeller ? (
        <>
          <Tab.Screen name="PostItem" component={PostItemScreen} />
          <Tab.Screen name="MyListings" component={ManageListingsScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Orders" component={OrderListScreen} />
          <Tab.Screen name="Voucher" component={VoucherScreen} />
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
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
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
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 5,
  },
  activeTabItem: {},
  iconContainer: {
    position: 'relative',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    transform: [{ scale: 1.15 }],
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
