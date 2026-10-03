import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportReasonOption } from '../constants/reportReasons.constants';

interface ReportReasonSelectorProps {
  reasons: ReportReasonOption[];
  selectedReasonId: string;
  onSelectReason: (id: string) => void;
}

export const ReportReasonSelector: React.FC<ReportReasonSelectorProps> = memo(({
  reasons,
  selectedReasonId,
  onSelectReason,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chọn lý do vi phạm *</Text>
      <View style={styles.list}>
        {reasons.map((r) => {
          const isSelected = selectedReasonId === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[styles.itemCard, isSelected && styles.itemCardSelected]}
              onPress={() => onSelectReason(r.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? '#EF4444' : '#94A3B8'}
                style={styles.radioIcon}
              />
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}>
                  {r.label}
                </Text>
                <Text style={styles.itemDesc}>{r.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  list: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  itemCardSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  radioIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 3,
  },
  itemLabelSelected: {
    color: '#B91C1C',
  },
  itemDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});

export default ReportReasonSelector;
