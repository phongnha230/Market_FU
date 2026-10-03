import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../../stores/userStore';

interface AccountVerificationBannerProps {
  user: UserProfile | null;
  isVerified: boolean;
}

export const AccountVerificationBanner: React.FC<AccountVerificationBannerProps> = React.memo(({
  user,
  isVerified,
}) => {
  return (
    <View style={[styles.verifiedBanner, !isVerified && styles.unverifiedBanner]}>
      <Ionicons
        name={isVerified ? 'checkmark-circle' : 'alert-circle'}
        size={24}
        color={isVerified ? '#059669' : '#D97706'}
      />
      <View style={styles.verifiedContent}>
        <Text style={[styles.verifiedTitle, !isVerified && styles.unverifiedTitle]}>
          {user?.role === 'SELLER'
            ? 'Tài khoản TOP SELLER - Đã xác minh'
            : isVerified
            ? 'Tài khoản Sinh viên FPT Đã xác thực KYC'
            : 'Tài khoản Tân sinh viên - Chưa xác thực Thẻ SV'}
        </Text>
        <Text style={[styles.verifiedSub, !isVerified && styles.unverifiedSub]}>
          Email FPT: {user?.email || 'Chưa liên kết email'} | Campus: {user?.campus || 'HÒA LẠC'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  unverifiedBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  verifiedContent: {
    flex: 1,
    marginLeft: 10,
  },
  verifiedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  unverifiedTitle: {
    color: '#92400E',
  },
  verifiedSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  unverifiedSub: {
    color: '#B45309',
  },
});
