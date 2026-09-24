import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DisputeType } from '../types/dispute.types';

interface DisputeTypeSelectorProps {
  selectedType: DisputeType;
  onSelect: (type: DisputeType) => void;
}

export const DisputeTypeSelector: React.FC<DisputeTypeSelectorProps> = ({ selectedType, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Yêu cầu xử lý của bạn</Text>

      <TouchableOpacity
        style={[styles.optionCard, selectedType === 'refund_full' && styles.optionCardActive]}
        activeOpacity={0.8}
        onPress={() => onSelect('refund_full')}
      >
        <Ionicons
          name={selectedType === 'refund_full' ? 'radio-button-on' : 'radio-button-off'}
          size={18}
          color={selectedType === 'refund_full' ? '#F27024' : '#94A3B8'}
        />
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>Trả hàng & Hoàn tiền 100%</Text>
          <Text style={styles.optionSub}>Gửi trả đồ tại trạm Safe-Handoff và nhận lại toàn bộ tiền</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, selectedType === 'keep_discount' && styles.optionCardActive]}
        activeOpacity={0.8}
        onPress={() => onSelect('keep_discount')}
      >
        <Ionicons
          name={selectedType === 'keep_discount' ? 'radio-button-on' : 'radio-button-off'}
          size={18}
          color={selectedType === 'keep_discount' ? '#F27024' : '#94A3B8'}
        />
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>Giữ đồ & Hoàn tiền một phần</Text>
          <Text style={styles.optionSub}>Người bán bớt giá do hàng có lỗi nhỏ so với mô tả</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 14, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8 },
  optionCardActive: { borderColor: '#F27024', backgroundColor: '#FFF7ED' },
  textContainer: { flex: 1, marginLeft: 10 },
  optionTitle: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  optionSub: { fontSize: 10.5, color: '#64748B', marginTop: 2, lineHeight: 14 },
});

export default DisputeTypeSelector;
