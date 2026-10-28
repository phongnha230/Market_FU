import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileCtaButtonProps {
  isSeller: boolean;
  isPending: boolean;
  isVerified: boolean;
  onSellerPress?: () => void;
  onKycPress?: (role?: 'STUDENT' | 'SELLER') => void;
}

export const ProfileCtaButton: React.FC<ProfileCtaButtonProps> = React.memo(({
  isSeller,
  isPending,
  isVerified,
  onSellerPress,
  onKycPress,
}) => {
  if (isSeller) {
    return (
      <TouchableOpacity
        style={[styles.actionBtn, styles.sellerBtn]}
        onPress={onSellerPress}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        delayPressIn={0}
      >
        <Ionicons name="speedometer-outline" size={15} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>Kênh Người Bán (Hub)</Text>
      </TouchableOpacity>
    );
  }

  if (isPending) {
    return (
      <TouchableOpacity
        style={[styles.actionBtn, styles.pendingBtn]}
        onPress={() => onKycPress && onKycPress('STUDENT')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        delayPressIn={0}
      >
        <Ionicons name="time-outline" size={15} color="#B45309" />
        <Text style={[styles.actionBtnText, { color: '#B45309' }]}>Chi tiết hồ sơ KYC</Text>
      </TouchableOpacity>
    );
  }

  if (isVerified) {
    return (
      <TouchableOpacity
        style={[styles.actionBtn, styles.upgradeSellerBtn]}
        onPress={() => onKycPress && onKycPress('SELLER')}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        delayPressIn={0}
      >
        <Ionicons name="storefront-outline" size={15} color="#FFFFFF" />
        <Text style={styles.actionBtnText}>Đăng ký mở Người bán</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.actionBtn, styles.verifyStudentBtn]}
      onPress={() => onKycPress && onKycPress('STUDENT')}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      delayPressIn={0}
    >
      <Ionicons name="shield-checkmark" size={15} color="#FFFFFF" />
      <Text style={styles.actionBtnText}>Xác thực Thẻ Sinh Viên</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sellerBtn: {
    backgroundColor: '#4338CA',
  },
  pendingBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  upgradeSellerBtn: {
    backgroundColor: '#EA580C',
  },
  verifyStudentBtn: {
    backgroundColor: '#2563EB',
  },
});
