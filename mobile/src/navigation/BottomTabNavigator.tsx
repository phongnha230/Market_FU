import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../features/home/screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import PostItemScreen from '../screens/PostItemScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { MainTabsParamList } from './types';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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

        if (route.name === 'PostItem') {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.floatingCenterBtnWrapper}
              activeOpacity={0.85}
              onPress={onPress}
            >
              <View style={styles.floatingCenterBtn}>
                <Ionicons name="add" size={30} color="#FFFFFF" />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
                Đăng bán
              </Text>
            </TouchableOpacity>
          );
        }

        let iconName: any = 'home-outline';
        let label = 'Trang chủ';

        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
          label = 'Trang chủ';
        } else if (route.name === 'Explore') {
          iconName = isFocused ? 'compass' : 'compass-outline';
          label = 'Khám phá';
        } else if (route.name === 'Chat') {
          iconName = isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          label = 'Tin nhắn';
        } else if (route.name === 'Profile') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Hồ sơ';
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={onPress}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={22} color={isFocused ? '#F27024' : '#64748B'} />
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
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="PostItem" component={PostItemScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
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
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 4 },
  iconContainer: { position: 'relative' },
  tabLabel: { fontSize: 10, fontWeight: '600', color: '#64748B', marginTop: 2 },
  activeTabLabel: { color: '#F27024', fontWeight: '800' },
  floatingCenterBtnWrapper: { alignItems: 'center', justifyContent: 'center', top: -12, flex: 1 },
  floatingCenterBtn: {
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
  },
  chatBadge: {
    position: 'absolute',
    top: -3,
    right: -7,
    backgroundColor: '#EA580C',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  chatBadgeText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '900' },
});

export default BottomTabNavigator;
