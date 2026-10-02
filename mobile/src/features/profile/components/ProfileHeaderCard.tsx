import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../../stores/userStore';

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  currentCampus: string;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ user, currentCampus }) => {
  const isSeller = user?.role === 'SELLER';
  const isVerified = user?.isKycVerified || isSeller;

  const roleBadgeLabel = isSeller
    ? 'TOP SELLER ⭐'
    : isVerified
    ? 'SV FPT Đã KYC ✓'
    : 'Chưa KYC SV ⚠️';

  const roleBadgeStyle = isSeller
    ? styles.roleBadgeSeller
    : isVerified
    ? styles.roleBadgeVerified
    : styles.roleBadgeUnverified;

  const roleTextStyle = isSeller
    ? styles.roleTextSeller
    : isVerified
    ? styles.roleTextVerified
    : styles.roleTextUnverified;

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrapper}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}
        {isVerified && (
          <View style={styles.verifiedDot}>
            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name || 'Khách Campus'}
          </Text>
          <View style={styles.campusBadge}>
            <Text style={styles.campusBadgeText}>{user?.campus || currentCampus}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.roleBadge, roleBadgeStyle]}>
            <Text style={[styles.roleText, roleTextStyle]}>{roleBadgeLabel}</Text>
          </View>
        </View>

        <Text style={styles.major}>{user?.major || 'Khóa & Chuyên ngành chưa cập nhật'}</Text>
        <Text style={styles.studentId}>MSSV: {user?.studentId || 'Chưa cập nhật'}</Text>

        {user?.dormRoom ? (
          <Text style={styles.dormText}>📍 {user.dormRoom}</Text>
        ) : null}

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F59E0B" style={{ marginRight: 3 }} />
          <Text style={styles.ratingText}>
            {user?.rating ? user.rating.toFixed(1) : '5.0'} (Độ uy tín TrustScore 100%)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  campusBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  campusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F27024',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeSeller: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  roleBadgeVerified: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  roleBadgeUnverified: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roleTextSeller: {
    color: '#4338CA',
  },
  roleTextVerified: {
    color: '#059669',
  },
  roleTextUnverified: {
    color: '#B45309',
  },
  major: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
  },
  studentId: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  dormText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
});

export default ProfileHeaderCard;
