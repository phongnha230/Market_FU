import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LISTING_CONDITIONS } from '../constants/editListingConstants';

interface EditListingConditionSectionProps {
  condition: string;
  onChangeCondition: (condition: string) => void;
}

export const EditListingConditionSection: React.FC<EditListingConditionSectionProps> = memo(({
  condition,
  onChangeCondition,
}) => {
  return (
    <>
      <Text style={styles.inputLabel}>Tình trạng món đồ</Text>
      <View style={styles.conditionBox}>
        {LISTING_CONDITIONS.map((cond) => {
          const isActive = condition === cond.id;
          return (
            <TouchableOpacity
              key={cond.id}
              style={[
                styles.conditionOption,
                isActive && styles.conditionOptionActive,
              ]}
              onPress={() => onChangeCondition(cond.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={isActive ? '#EA580C' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.conditionOptionText,
                  isActive && styles.conditionOptionTextActive,
                ]}
              >
                {cond.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  conditionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    marginBottom: 6,
  },
  conditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  conditionOptionActive: {
    backgroundColor: '#FFFFFF',
  },
  conditionOptionText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  conditionOptionTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
