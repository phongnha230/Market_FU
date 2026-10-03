import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DisputeReason } from '../types/dispute.types';

interface DisputeReasonSectionProps {
  reasons: DisputeReason[];
  selectedReasons: string[];
  onToggleReason: (id: string) => void;
  description: string;
  onChangeDescription: (text: string) => void;
}

export const DisputeReasonSection: React.FC<DisputeReasonSectionProps> = ({
  reasons,
  selectedReasons,
  onToggleReason,
  description,
  onChangeDescription,
}) => {
  const selectedSet = useMemo(() => new Set(selectedReasons), [selectedReasons]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Lý do khiếu nại (Chọn ít nhất 1)</Text>

      {reasons.map((r) => {
        const active = selectedSet.has(r.id);
        return (
          <TouchableOpacity
            key={r.id}
            style={[styles.reasonRow, active && styles.reasonRowActive]}
            activeOpacity={0.7}
            onPress={() => onToggleReason(r.id)}
          >
            <Text style={{ marginRight: 8 }}>{r.icon}</Text>
            <Text style={[styles.reasonText, active && styles.reasonTextActive]}>{r.label}</Text>
            <Ionicons
              name={active ? 'checkbox' : 'square-outline'}
              size={18}
              color={active ? '#F27024' : '#CBD5E1'}
            />
          </TouchableOpacity>
        );
      })}

      <Text style={[styles.label, { marginTop: 14 }]}>Mô tả chi tiết sự việc</Text>
      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        multiline
        numberOfLines={3}
        placeholder="Mô tả cụ thể tình trạng hàng..."
        placeholderTextColor="#94A3B8"
        style={styles.textArea}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 8 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  reasonRowActive: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  reasonText: { flex: 1, fontSize: 11.5, fontWeight: '600', color: '#334155' },
  reasonTextActive: { color: '#C2410C' },
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 10, fontSize: 12, color: '#0F172A', textAlignVertical: 'top', minHeight: 70 },
});

export default DisputeReasonSection;
