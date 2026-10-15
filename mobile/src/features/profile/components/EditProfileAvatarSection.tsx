import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface EditProfileAvatarSectionProps {
  avatar: string;
  name: string;
  onPickAvatar: () => void;
}

const isDummyAvatar = (url?: string | null) =>
  !url ||
  url.includes('photo-1535713875002-d1d0cf377fde') ||
  url.includes('photo-1534528741775-53994a69daeb') ||
  url.includes('photo-1570295999919-56ceb5ecca61');

export const EditProfileAvatarSection: React.FC<EditProfileAvatarSectionProps> = ({
  avatar,
  name,
  onPickAvatar,
}) => {
  const hasValidAvatar = Boolean(avatar && !isDummyAvatar(avatar));

  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity
        style={styles.avatarWrap}
        onPress={onPickAvatar}
        activeOpacity={0.8}
      >
        {hasValidAvatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>
              {name ? name.slice(0, 2).toUpperCase() : 'SV'}
            </Text>
          </View>
        )}
        <View style={styles.avatarBadge}>
          <Ionicons name="camera" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
      <View style={styles.infoCol}>
        <Text style={styles.avatarLabel}>Ảnh đại diện Campus</Text>
        <Text style={styles.avatarHint}>Chạm vào ảnh để đổi từ máy ảnh hoặc thư viện</Text>
        <TouchableOpacity
          style={styles.changeAvatarBtn}
          onPress={onPickAvatar}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={14} color="#EA580C" />
          <Text style={styles.changeAvatarText}>Tải ảnh từ máy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  changeAvatarText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
});
