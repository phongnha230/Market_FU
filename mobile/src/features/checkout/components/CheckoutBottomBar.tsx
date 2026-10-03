import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutBottomBarProps {
  totalAmount: number;
  selectedPayment: 'vietqr' | 'fptpay' | 'cash';
  onConfirmPayment: () => void;
  formatCurrency: (val: number) => string;
}

export const CheckoutBottomBar: React.FC<CheckoutBottomBarProps> = ({
  totalAmount,
  selectedPayment,
  onConfirmPayment,
  formatCurrency,
}) => {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomPriceCol}>
        <Text style={styles.bottomTotalLabel}>Tổng thanh toán:</Text>
        <Text style={styles.bottomTotalPrice}>{formatCurrency(totalAmount)}</Text>
      </View>
      <TouchableOpacity
        style={styles.payBtn}
        activeOpacity={0.88}
        onPress={onConfirmPayment}
      >
        <Ionicons
          name={selectedPayment === 'cash' ? 'calendar-outline' : 'shield-checkmark'}
          size={18}
          color="#FFFFFF"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.payBtnText}>
          {selectedPayment === 'vietqr'
            ? 'Quét mã VietQR Escrow'
            : selectedPayment === 'fptpay'
            ? 'Thanh toán Ví FPT Pay'
            : 'Đặt hẹn Safe-Point'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    boxShadow: '0 -3px 6px rgba(0, 0, 0, 0.05)',
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomTotalPrice: {
    fontSize: 17,
    fontWeight: '900',
    color: '#EA580C',
  },
  payBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
