import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SellerAiTipCard: React.FC = () => {
  return (
    <View style={styles.aiTipCard}>
      <View style={styles.aiTipHeader}>
        <View style={styles.aiTipIconWrap}>
          <Ionicons name="bulb" size={18} color="#EA580C" />
        </View>
        <Text style={styles.aiTipTitle}>Mẹo bán chạy từ AI Market FU</Text>
      </View>
      <Text style={styles.aiTipBody}>
        Mùa tân sinh viên K20 đang có nhu cầu tìm kiếm cao về:{' '}
        <Text style={styles.boldText}>Võ phục Vovinam</Text>,{' '}
        <Text style={styles.boldText}>Sách PRF192</Text> và{' '}
        <Text style={styles.boldText}>Màn hình máy tính phụ</Text>. Đăng bán vào khung giờ 11:30 - 13:00 hoặc 20:00 - 22:00 để chốt đơn nhanh nhất!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  aiTipCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 20,
  },
  aiTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiTipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  aiTipBody: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
});
