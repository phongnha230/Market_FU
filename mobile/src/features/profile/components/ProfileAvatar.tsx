import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface ProfileAvatarProps {
  avatarUrl?: string;
  name?: string;
  isVerified: boolean;
  isPending: boolean;
  onPress?: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = React.memo(({
  avatarUrl,
  name,
  isVerified,
  isPending,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.avatarWrapper}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      )}

      {/* Status Dot */}
      <View
        style={[
          styles.statusDot,
          isVerified
            ? styles.dotVerified
            : isPending
            ? styles.dotPending
            : styles.dotUnverified,
        ]}
      >
        <Ionicons
          name={isVerified ? 'checkmark' : isPending ? 'time' : 'alert'}
          size={isVerified || isPending ? 11 : 10}
          color="#FFFFFF"
        />
      </View>

      {/* Camera mini badge */}
      <View style={styles.cameraBadge}>
        <Ionicons name="camera" size={10} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  avatarPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statusDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotVerified: {
    backgroundColor: '#10B981',
  },
  dotPending: {
    backgroundColor: '#F59E0B',
  },
  dotUnverified: {
    backgroundColor: '#EF4444',
  },
  cameraBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
