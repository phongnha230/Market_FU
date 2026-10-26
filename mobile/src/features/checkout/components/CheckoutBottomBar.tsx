import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutBottomBarProps {
  totalAmount: number;
  selectedPayment: 'vietqr' | 'fptpay' | 'cash';
  isMeetup?: boolean;
  onConfirmPayment: () => void;
  formatCurrency: (val: number) => string;
  isSubmitting?: boolean;
}

export const CheckoutBottomBar: React.FC<CheckoutBottomBarProps> = ({
  totalAmount,
  selectedPayment,
  isMeetup = true,
  onConfirmPayment,
  formatCurrency,
  isSubmitting = false,
}) => {
  const getButtonText = () => {
    if (isSubmitting) return 'Đang kết nối Escrow...';
    if (selectedPayment === 'vietqr') return 'Quét mã VietQR Escrow';
    if (selectedPayment === 'fptpay') return 'Thanh toán Cổng PayOS';
    return isMeetup ? 'Đặt hẹn Safe-Point' : 'Xác nhận đặt đơn';
  };

  const getButtonIcon = () => {
    if (selectedPayment === 'cash') {
      return isMeetup ? 'calendar-outline' : 'checkmark-done-circle-outline';
    }
    return 'shield-checkmark';
  };

  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomPriceCol}>
        <Text style={styles.bottomTotalLabel}>Tổng thanh toán:</Text>
        <Text style={styles.bottomTotalPrice}>{formatCurrency(totalAmount)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.payBtn, isSubmitting && { opacity: 0.75 }]}
        activeOpacity={0.88}
        disabled={isSubmitting}
        onPress={onConfirmPayment}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
        ) : (
          <Ionicons
            name={getButtonIcon() as any}
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
        )}
        <Text style={styles.payBtnText}>{getButtonText()}</Text>
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
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
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
    elevation: 4,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default CheckoutBottomBar;
