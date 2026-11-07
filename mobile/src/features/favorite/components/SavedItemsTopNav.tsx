import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useUserStore } from '../../../stores/userStore';
import { useNotificationStore } from '../../../stores/notificationStore';
import { resolveAvatarImage } from '../../../lib/imageResolver';

interface SavedItemsTopNavProps {
  currentCampus: string;
  topInset: number;
  onBack: () => void;
  onHome: () => void;
  onNotification: () => void;
  onProfile: () => void;
}

export const SavedItemsTopNav: React.FC<SavedItemsTopNavProps> = React.memo(({
  currentCampus,
  topInset,
  onBack,
  onHome,
  onNotification,
  onProfile,
}) => {
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const hasUnreadNotifications = useNotificationStore((s) => s.notifications.some((n) => n.unread));

  const avatarUrl = user?.avatarUrl || user?.avatar;
  const userName = user?.name || (user as any)?.fullName || '';

  return (
    <View style={[styles.topNavBar, { paddingTop: Math.max(topInset, 10) }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity
          style={styles.bellBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.campusChip} activeOpacity={0.8}>
          <Ionicons name="location-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.campusChipText}>FPT {currentCampus || 'Hòa Lạc'}</Text>
          <Ionicons name="chevron-down" size={13} color="#64748B" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.topRightIcons}>
        <TouchableOpacity
          style={styles.bellBtn}
          activeOpacity={0.8}
          onPress={onHome}
        >
          <Ionicons name="home-outline" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellBtn}
          activeOpacity={0.8}
          onPress={onNotification}
        >
          <Ionicons name="notifications-outline" size={20} color="#0F172A" />
          {isAuthenticated && hasUnreadNotifications && <View style={styles.bellDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarBtn}
          activeOpacity={0.8}
          onPress={onProfile}
        >
          {isAuthenticated && avatarUrl ? (
            <Image
              source={resolveAvatarImage(avatarUrl)}
              style={styles.avatarImg}
              contentFit="cover"
              transition={200}
            />
          ) : isAuthenticated && userName ? (
            <View style={styles.avatarInitialBox}>
              <Text style={styles.avatarInitialText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.guestAvatarCircle}>
              <Ionicons name="person" size={15} color="#64748B" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  campusChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 5,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarInitialBox: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guestAvatarCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
