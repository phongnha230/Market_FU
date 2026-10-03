import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderSafePointQrCardProps {
  safePoint: string;
  orderId: string;
}

export const OrderSafePointQrCard: React.FC<OrderSafePointQrCardProps> = React.memo(({
  safePoint,
  orderId,
}) => {
  return (
    <View style={styles.safePointCard}>
      <View style={styles.safePointHeader}>
        <Ionicons name="location" size={20} color="#EA580C" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.safePointName}>{safePoint}</Text>
          <Text style={styles.safePointNotice}>
            Điểm giao dịch có camera AI giám sát 24/7 của Nhà trường
          </Text>
        </View>
      </View>

      {/* QR Code Container */}
      <View style={styles.qrContainer}>
        <View style={styles.qrBox}>
          <Ionicons name="qr-code" size={130} color="#0F172A" />
        </View>
        <Text style={styles.qrCodeLabel}>MÃ HẸN BÀN GIAO: #{orderId}</Text>
        <Text style={styles.qrCodeHint}>
          Đưa mã này cho người bán hoặc bảo vệ tại Safe-Point quét khi nhận hàng
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  safePointCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  safePointName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  safePointNotice: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeLabel: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
  },
  qrCodeHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
