import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckoutSafePointCardProps {
  selectedSafePoint: string;
  onSelectSafePoint: (point: string) => void;
}

export const CheckoutSafePointCard: React.FC<CheckoutSafePointCardProps> = ({
  selectedSafePoint,
  onSelectSafePoint,
}) => {
  const handleOpenDialog = () => {
    Alert.alert(
      'Chọn trạm Safe-Point',
      'Chọn vị trí gần bạn nhất:\n1. Sảnh Tòa Alpha\n2. Sảnh Beta KTX\n3. Thư viện tầng 1',
      [
        { text: 'Sảnh Tòa Alpha', onPress: () => onSelectSafePoint('Sảnh Tòa Alpha (Camera 24/7)') },
        { text: 'Sảnh Beta KTX', onPress: () => onSelectSafePoint('Sảnh Beta KTX (Có bảo vệ trực)') },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };

  return (
    <>
      <Text style={styles.sectionHeader}>ĐIỂM NHẬN HÀNG SAFE-POINT</Text>
      <View style={styles.cardGroup}>
        <View style={styles.safePointBox}>
          <View style={styles.safePointIconBg}>
            <Ionicons name="location" size={20} color="#EA580C" />
          </View>
          <View style={styles.safePointInfo}>
            <Text style={styles.safePointTitle}>Điểm bàn giao có Camera giám sát</Text>
            <Text style={styles.safePointSub}>{selectedSafePoint}</Text>
          </View>
          <TouchableOpacity onPress={handleOpenDialog}>
            <Text style={styles.changeBtnText}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
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
  safePointBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  safePointIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  safePointInfo: {
    flex: 1,
  },
  safePointTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  safePointSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginLeft: 8,
  },
});
