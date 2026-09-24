import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoucherHeaderProps {
  onGoBack?: () => void;
}

export const VoucherHeader: React.FC<VoucherHeaderProps> = ({ onGoBack }) => {
  return (
    <View style={styles.header}>
      {onGoBack && (
        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onGoBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>Kho Voucher & Đổi Thưởng</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => Alert.alert('Lịch sử', 'Xem lịch sử dùng voucher')}
      >
        <Ionicons name="receipt-outline" size={20} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  btn: { padding: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
});

export default VoucherHeader;
