import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutKycBannerProps {
  isKycVerified: boolean;
  onOpenKycModal: () => void;
}

export const CheckoutKycBanner: React.FC<CheckoutKycBannerProps> = ({
  isKycVerified,
  onOpenKycModal,
}) => {
  if (isKycVerified) {
    return (
      <View style={styles.verifiedContainer}>
        <View style={styles.verifiedIconBg}>
          <Ionicons name="shield-checkmark" size={16} color="#059669" />
        </View>
        <View style={styles.verifiedContent}>
          <Text style={styles.verifiedTitle}>Sinh viên FPT đã xác thực danh tính</Text>
          <Text style={styles.verifiedDesc}>Kích hoạt chế độ Bảo vệ Escrow 48h & Bảo hiểm FPT Care</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.warningContainer}>
      <View style={styles.warningHeader}>
        <View style={styles.warningIconBg}>
          <Ionicons name="warning" size={18} color="#D97706" />
        </View>
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Yêu cầu Xác thực Thẻ Sinh Viên</Text>
          <Text style={styles.warningDesc}>
            Để bảo vệ an toàn giao dịch Safe-Handoff và kích hoạt bảo hiểm hoàn tiền 48h FPT Care, bạn cần xác thực thẻ sinh viên FPT chính chủ.
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={onOpenKycModal}
        activeOpacity={0.8}
      >
        <Ionicons name="card-outline" size={16} color="#FFFFFF" />
        <Text style={styles.verifyBtnText}>Xác thực Thẻ SV ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  verifiedIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedContent: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#065F46',
  },
  verifiedDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  warningContainer: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  warningIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  warningDesc: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 3,
    lineHeight: 16,
  },
  verifyBtn: {
    marginTop: 10,
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
