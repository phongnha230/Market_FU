import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../features/home/screens/HomeScreen';
import PostItemScreen from '../screens/PostItemScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManageListingsScreen from '../screens/ManageListingsScreen';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        // Skip hidden routes if any
        if (route.name === 'Explore') return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName: any = 'storefront-outline';
        let label = 'Chợ Campus';

        if (route.name === 'Home') {
          iconName = isFocused ? 'storefront' : 'storefront-outline';
          label = 'Chợ Campus';
        } else if (route.name === 'Chat') {
          iconName = isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          label = 'Tin nhắn';
        } else if (route.name === 'PostItem') {
          iconName = isFocused ? 'add-circle' : 'add-circle-outline';
          label = 'Đăng bán';
        } else if (route.name === 'MyListings') {
          iconName = isFocused ? 'file-tray-full' : 'file-tray-full-outline';
          label = 'Tin của tôi';
        } else if (route.name === 'Profile') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Tài khoản';
        }

        const iconSize = isFocused ? 28 : 22;
        const iconColor = isFocused ? '#EA580C' : '#64748B';

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabItem, isFocused && styles.activeTabItem]}
            activeOpacity={0.7}
            onPress={onPress}
          >
            <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
              <Ionicons name={iconName} size={iconSize} color={iconColor} />
              {route.name === 'Chat' && (
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>2</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="PostItem" component={PostItemScreen} />
      <Tab.Screen name="MyListings" component={ManageListingsScreen} />
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.05, shadowRadius: 6 },
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
