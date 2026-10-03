import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const CheckoutEscrowBanner: React.FC = () => {
  return (
    <View style={styles.escrowBanner}>
      <Ionicons name="shield-checkmark" size={24} color="#059669" />
      <View style={styles.content}>
        <Text style={styles.escrowTitle}>FPT Campus Escrow Protection</Text>
        <Text style={styles.escrowSub}>
          Tiền của bạn được giữ an toàn tại hệ thống trường. Người bán CHỈ nhận được tiền khi bạn bấm "Đã nhận hàng thành công" tại trạm Safe-Point.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
  escrowTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#065F46',
  },
  escrowSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
    lineHeight: 17,
  },
});
