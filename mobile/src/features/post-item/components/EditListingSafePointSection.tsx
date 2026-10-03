import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingSafePointSectionProps {
  safePoint: string;
  onChangeSafePoint: (safePoint: string) => void;
}

export const EditListingSafePointSection: React.FC<EditListingSafePointSectionProps> = ({
  safePoint,
  onChangeSafePoint,
}) => {
  return (
    <>
      <Text style={styles.inputLabel}>Điểm hẹn Safe-Point tại Campus</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="location-outline" size={18} color="#059669" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={safePoint}
          onChangeText={onChangeSafePoint}
          placeholder="VD: Trạm Safe-Point Sảnh Tòa Alpha"
          placeholderTextColor="#94A3B8"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
});
