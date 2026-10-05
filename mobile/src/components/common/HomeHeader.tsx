import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface HomeHeaderProps {
  userName?: string;
  campusName?: string;
  avatarUrl?: string;
  isAuthenticated?: boolean;
  unreadNotificationCount?: number;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onCampusChangePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = memo(({
  userName = 'Bạn',
  campusName = 'HÒA LẠC',
  avatarUrl,
  isAuthenticated = false,
  unreadNotificationCount = 0,
  onSearchPress,
  onNotificationPress,
  onAvatarPress,
  onCampusChangePress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
            transition={200}
          />
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.brandTitle}>FPT 5Campus</Text>
          <TouchableOpacity
            style={styles.campusBadge}
            activeOpacity={0.7}
            onPress={onCampusChangePress}
          >
            <Text style={styles.campusBadgeText}>{campusName}</Text>
            <Ionicons name="caret-down" size={10} color="#F27024" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onSearchPress}
          >
            <Ionicons name="search-outline" size={22} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onNotificationPress}
          >
            {isAuthenticated && unreadNotificationCount > 0 && (
              unreadNotificationCount > 1 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </Text>
                </View>
              ) : (
                <View style={styles.notificationDot} />
              )
            )}
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.8}
            onPress={onAvatarPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isAuthenticated ? (
              avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatarInitialBox}>
                  <Text style={styles.avatarInitialText}>
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.guestAvatarCircle}>
                <Ionicons name="person" size={18} color="#64748B" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingRow}>
        <Text style={styles.greetingTitle}>
          Chào {isAuthenticated ? userName : 'Bạn'} 👋
        </Text>
        <View style={styles.liveBadge}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.liveBadgeText}>Hòa Lạc sôi động</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingBottom: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  leftSection: { width: 60, justifyContent: 'center' },
  logo: { width: 38, height: 38 },
  centerSection: { alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2 },
  campusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  campusBadgeText: { fontSize: 10, fontWeight: '800', color: '#F27024', letterSpacing: 0.2 },
  rightSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 110 },
  iconButton: { padding: 6, position: 'relative', marginLeft: 2 },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  avatarButton: { marginLeft: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
  guestAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EA580C',
  },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  greetingTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  greenPulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  liveBadgeText: { fontSize: 11, color: '#047857', fontWeight: '600' },
});

export default HomeHeader;
