import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingPriceSectionProps {
  priceStr: string;
  onChangePriceStr: (price: string) => void;
}

export const EditListingPriceSection: React.FC<EditListingPriceSectionProps> = ({
  priceStr,
  onChangePriceStr,
}) => {
  return (
    <>
      <Text style={styles.inputLabel}>Giá bán thanh lý (VNĐ) *</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="pricetag-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={priceStr}
          onChangeText={onChangePriceStr}
          placeholder="VD: 1850000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
        />
        <Text style={styles.unitText}>VNĐ</Text>
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
  unitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
