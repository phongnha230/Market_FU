import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { UserProfile } from '../../../stores/userStore';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileCtaButton } from './ProfileCtaButton';

interface ProfileHeaderCardProps {
  user: UserProfile | null;
  currentCampus: string;
  onKycPress?: (role?: 'STUDENT' | 'SELLER') => void;
  onEditPress?: () => void;
  onManageListings?: () => void;
  onSellerDashboard?: () => void;
  onTrustScorePress?: () => void;
}

interface RoleBadgeConfig {
  label: string;
  badgeStyle: object;
  textStyle: object;
}

const getRoleBadgeConfig = (isSeller: boolean, isPending: boolean, isVerified: boolean): RoleBadgeConfig => {
  if (isSeller) {
    return {
      label: 'TOP SELLER ⭐',
      badgeStyle: styles.roleBadgeSeller,
      textStyle: styles.roleTextSeller,
    };
  }
  if (isPending) {
    return {
      label: 'Đang duyệt KYC ⏳',
      badgeStyle: styles.roleBadgePending,
      textStyle: styles.roleTextPending,
    };
  }
  if (isVerified) {
    return {
      label: 'SV FPT Đã KYC ✓',
      badgeStyle: styles.roleBadgeVerified,
      textStyle: styles.roleTextVerified,
    };
  }
  return {
    label: 'Chưa KYC SV ⚠️',
    badgeStyle: styles.roleBadgeUnverified,
    textStyle: styles.roleTextUnverified,
  };
};

const ProfileIdentityInfo: React.FC<{
  user: UserProfile | null;
  currentCampus: string;
  roleBadgeConfig: RoleBadgeConfig;
  onRoleBadgePress: () => void;
  canKyc: boolean;
}> = React.memo(({ user, currentCampus, roleBadgeConfig, onRoleBadgePress, canKyc }) => (
  <View style={styles.info}>
    <View style={styles.nameRow}>
      <Text style={styles.name} numberOfLines={1}>
        {user?.name || 'Sinh viên Campus'}
      </Text>
      <View style={styles.campusBadge}>
        <Text style={styles.campusBadgeText}>{user?.campus || currentCampus}</Text>
      </View>
    </View>

    <View style={styles.badgeRow}>
      <TouchableOpacity
        style={[styles.roleBadge, roleBadgeConfig.badgeStyle]}
        onPress={onRoleBadgePress}
        activeOpacity={0.7}
        disabled={!canKyc}
      >
        <Text style={[styles.roleText, roleBadgeConfig.textStyle]}>
          {roleBadgeConfig.label}
        </Text>
      </TouchableOpacity>

      <View style={styles.mssvBadge}>
        <Text style={styles.mssvText}>{user?.studentId || 'Chưa có MSSV'}</Text>
      </View>
    </View>

    <Text style={styles.major} numberOfLines={1}>
      {user?.major || 'Khóa & Chuyên ngành chưa cập nhật'}
    </Text>

    {Boolean(user?.dormRoom || user?.roomNumber) && (
      <Text style={styles.dormText} numberOfLines={1}>
        📍 {user?.dormRoom || user?.roomNumber}
      </Text>
    )}
  </View>
));

const ProfileBottomMeta: React.FC<{
  isEduEmail: boolean;
  email?: string;
  trustScore?: number;
  rating?: number;
  onTrustScorePress?: () => void;
}> = React.memo(
  ({ isEduEmail, email, trustScore = 100, rating = 5.0, onTrustScorePress }) => (
    <View style={styles.bottomMetaRow}>
      <View style={styles.emailPill}>
        <Ionicons
          name={isEduEmail ? 'school' : 'mail-outline'}
          size={12}
          color={isEduEmail ? '#059669' : '#64748B'}
        />
        <Text style={styles.emailText} numberOfLines={1}>
          {email || 'Chưa liên kết email'}
        </Text>
        <View style={[styles.emailTypeTag, isEduEmail && styles.emailTypeEdu]}>
          <Text style={[styles.emailTypeTxt, isEduEmail && styles.emailTypeEduTxt]}>
            {isEduEmail ? 'FPT SSO' : 'Cá nhân'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.ratingBox}
        onPress={onTrustScorePress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="shield-checkmark" size={13} color="#059669" style={{ marginRight: 3 }} />
        <Text style={styles.ratingText}>TrustScore {trustScore}% ({rating.toFixed(1)} ★)</Text>
        <Ionicons name="chevron-forward" size={11} color="#059669" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  )
);

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = React.memo(({
  user,
  currentCampus,
  onKycPress,
  onEditPress,
  onManageListings,
  onSellerDashboard,
  onTrustScorePress,
}) => {
  const isSeller = user?.role === 'SELLER';
  const isPending = user?.kycStatus === 'PENDING';
  const isVerified = Boolean((user?.isKycVerified || isSeller) && !isPending);

  const roleBadgeConfig = useMemo(
    () => getRoleBadgeConfig(isSeller, isPending, isVerified),
    [isSeller, isPending, isVerified]
  );

  const isEduEmail = Boolean(
    user?.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    user?.email?.toLowerCase().endsWith('@fe.edu.vn')
  );

  const displayAvatar = user?.avatarUrl || user?.avatar;

  const handleRoleBadgePress = useCallback(() => {
    if (onKycPress) {
      onKycPress(isVerified ? 'SELLER' : 'STUDENT');
    }
  }, [onKycPress, isVerified]);

  const handleSellerHubPress = useCallback(() => {
    if (onSellerDashboard) {
      onSellerDashboard();
    } else if (onManageListings) {
      onManageListings();
    }
  }, [onSellerDashboard, onManageListings]);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <ProfileAvatar
          avatarUrl={displayAvatar}
          name={user?.name}
          isVerified={isVerified}
          isPending={isPending}
          onPress={onEditPress}
        />

        <ProfileIdentityInfo
          user={user}
          currentCampus={currentCampus}
          roleBadgeConfig={roleBadgeConfig}
          onRoleBadgePress={handleRoleBadgePress}
          canKyc={Boolean(onKycPress)}
        />
      </View>

      <View style={styles.actionButtonsRow}>
        <ProfileCtaButton
          isSeller={isSeller}
          isPending={isPending}
          isVerified={isVerified}
          onSellerPress={handleSellerHubPress}
          onKycPress={onKycPress}
        />
      </View>

      <ProfileBottomMeta
        isEduEmail={isEduEmail}
        email={user?.email}
        trustScore={user?.reputationScore ?? 100}
        rating={user?.rating ?? 5.0}
        onTrustScorePress={onTrustScorePress}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  campusBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  campusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  roleBadgeSeller: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  roleBadgePending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  roleBadgeVerified: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  roleBadgeUnverified: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  roleTextSeller: { color: '#4338CA' },
  roleTextPending: { color: '#B45309' },
  roleTextVerified: { color: '#059669' },
  roleTextUnverified: { color: '#64748B' },
  mssvBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mssvText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  major: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  dormText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editProfileBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    marginRight: 8,
  },
  emailText: {
    fontSize: 11.5,
    color: '#64748B',
    flexShrink: 1,
  },
  emailTypeTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  emailTypeEdu: {
    backgroundColor: '#ECFDF5',
  },
  emailTypeTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  emailTypeEduTxt: {
    color: '#059669',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});

export default ProfileHeaderCard;
