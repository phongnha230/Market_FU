import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutVoucherCardProps {
  appliedVoucher: {
    code: string;
    discount: number;
    title?: string;
  } | null;
  onOpenModal: () => void;
  onRemoveVoucher: () => void;
  formatCurrency: (val: number) => string;
}

export const CheckoutVoucherCard: React.FC<CheckoutVoucherCardProps> = ({
  appliedVoucher,
  onOpenModal,
  onRemoveVoucher,
  formatCurrency,
}) => {
  return (
    <>
      <Text style={styles.sectionHeader}>MÃ GIẢM GIÁ / VOUCHER</Text>
      <TouchableOpacity
        style={styles.voucherCard}
        activeOpacity={0.75}
        onPress={onOpenModal}
      >
        <Ionicons name="ticket" size={20} color="#EA580C" />
        <View style={styles.voucherInfo}>
          <Text style={styles.voucherCode}>
            {appliedVoucher ? `Mã: ${appliedVoucher.code}` : 'Chưa áp dụng voucher'}
          </Text>
          <Text style={styles.voucherDesc}>
            {appliedVoucher
              ? `${appliedVoucher.title ? appliedVoucher.title + ' • ' : ''}Giảm ${formatCurrency(appliedVoucher.discount)}`
              : 'Bấm để chọn hoặc nhập voucher giảm giá'}
          </Text>
        </View>
        {appliedVoucher ? (
          <TouchableOpacity
            style={styles.appliedBadge}
            onPress={(e) => {
              e.stopPropagation();
              onRemoveVoucher();
            }}
          >
            <Text style={styles.appliedText}>Bỏ chọn ✕</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.selectVoucherBadge}>
            <Text style={styles.selectVoucherText}>Chọn mã ›</Text>
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  voucherInfo: {
    flex: 1,
    marginLeft: 10,
  },
  voucherCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  voucherDesc: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 1,
  },
  appliedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  appliedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  selectVoucherBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
  },
  selectVoucherText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
});
