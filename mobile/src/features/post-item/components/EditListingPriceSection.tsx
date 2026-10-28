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
  const numericPrice = Number(String(priceStr).replace(/\D/g, '')) || 0;
  const platformFee = Math.round(numericPrice * 0.05);
  const netEarnings = Math.max(0, numericPrice - platformFee);

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

      {numericPrice > 0 && (
        <View style={styles.feePreviewBox}>
          <View style={styles.feePreviewRow}>
            <Text style={styles.feePreviewLabel}>Phí sàn FMarket (5%):</Text>
            <Text style={styles.feePreviewRed}>-{platformFee.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.feePreviewRow}>
            <Text style={styles.feePreviewNetLabel}>Dự kiến nhận về ví:</Text>
            <Text style={styles.feePreviewGreen}>+{netEarnings.toLocaleString('vi-VN')} đ</Text>
          </View>
          <Text style={styles.feePreviewHelp}>
            🛡️ Phí sàn 5% tự động khấu trừ khi giao dịch thành công. Người bán không thể rút số tiền phí này.
          </Text>
        </View>
      )}
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
  feePreviewBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 10,
    marginTop: 8,
  },
  feePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feePreviewLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  feePreviewRed: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  feePreviewNetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  feePreviewGreen: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  feePreviewHelp: {
    fontSize: 10,
    color: '#9A3412',
    lineHeight: 14,
    marginTop: 2,
  },
});
