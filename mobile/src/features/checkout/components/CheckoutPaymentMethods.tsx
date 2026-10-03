import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutPaymentMethodsProps {
  selectedPayment: 'vietqr' | 'fptpay' | 'cash';
  onSelectPayment: (method: 'vietqr' | 'fptpay' | 'cash') => void;
}

export const CheckoutPaymentMethods: React.FC<CheckoutPaymentMethodsProps> = ({
  selectedPayment,
  onSelectPayment,
}) => {
  return (
    <>
      <Text style={styles.sectionHeader}>PHƯƠNG THỨC THANH TOÁN</Text>
      <View style={styles.cardGroup}>
        {/* VietQR */}
        <TouchableOpacity
          style={[styles.payRow, selectedPayment === 'vietqr' && styles.selectedPayRow]}
          activeOpacity={0.7}
          onPress={() => onSelectPayment('vietqr')}
        >
          <View style={[styles.payIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="qr-code-outline" size={20} color="#2563EB" />
          </View>
          <View style={styles.payDetails}>
            <View style={styles.titleRow}>
              <Text style={styles.payTitle}>Chuyển khoản VietQR / PayOS 24/7</Text>
              <View style={styles.recBadge}>
                <Text style={styles.recBadgeText}>Khuyên dùng</Text>
              </View>
            </View>
            <Text style={styles.paySub}>Khớp lệnh tự động trong 3 giây • Mở App Ngân hàng 1 chạm</Text>
          </View>
          <Ionicons
            name={selectedPayment === 'vietqr' ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={selectedPayment === 'vietqr' ? '#EA580C' : '#CBD5E1'}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* FPTPay */}
        <TouchableOpacity
          style={[styles.payRow, selectedPayment === 'fptpay' && styles.selectedPayRow]}
          activeOpacity={0.7}
          onPress={() => onSelectPayment('fptpay')}
        >
          <View style={[styles.payIconBox, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="wallet-outline" size={20} color="#EA580C" />
          </View>
          <View style={styles.payDetails}>
            <View style={styles.titleRow}>
              <Text style={styles.payTitle}>Ví FPT Pay Sinh viên</Text>
              <View style={[styles.recBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.recBadgeText, { color: '#B45309' }]}>Tức thì</Text>
              </View>
            </View>
            <Text style={styles.paySub}>Số dư khả dụng: 2.850.000đ • Trừ ví tức thì 0đ phí</Text>
          </View>
          <Ionicons
            name={selectedPayment === 'fptpay' ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={selectedPayment === 'fptpay' ? '#EA580C' : '#CBD5E1'}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Cash */}
        <TouchableOpacity
          style={[styles.payRow, selectedPayment === 'cash' && styles.selectedPayRow]}
          activeOpacity={0.7}
          onPress={() => onSelectPayment('cash')}
        >
          <View style={[styles.payIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="cash-outline" size={20} color="#059669" />
          </View>
          <View style={styles.payDetails}>
            <Text style={styles.payTitle}>Thanh toán tiền mặt tại Safe-Point</Text>
            <Text style={styles.paySub}>Gặp mặt kiểm tra đồ trực tiếp tại trạm có camera an toàn</Text>
          </View>
          <Ionicons
            name={selectedPayment === 'cash' ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={selectedPayment === 'cash' ? '#EA580C' : '#CBD5E1'}
          />
        </TouchableOpacity>
      </View>
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
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectedPayRow: {
    backgroundColor: '#FFFDFB',
  },
  payIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  payDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  paySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  recBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  recBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
});
