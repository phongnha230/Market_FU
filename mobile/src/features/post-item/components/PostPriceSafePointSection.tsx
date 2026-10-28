import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PostPriceSafePointSectionProps {
  price: string;
  onChangePrice: (price: string) => void;
  allowNegotiate: boolean;
  onToggleNegotiate: (val: boolean) => void;
  freeForK20: boolean;
  onToggleFreeForK20: () => void;
  selectedSafePoint: string;
  campusShipEnabled: boolean;
  onToggleCampusShip: (val: boolean) => void;
}

export const PostPriceSafePointSection: React.FC<PostPriceSafePointSectionProps> = ({
  price,
  onChangePrice,
  allowNegotiate,
  onToggleNegotiate,
  freeForK20,
  onToggleFreeForK20,
  selectedSafePoint,
  campusShipEnabled,
  onToggleCampusShip,
}) => {
  const numericPrice = Number(String(price).replace(/\D/g, '')) || 0;
  const platformFee = Math.round(numericPrice * 0.05);
  const netEarnings = Math.max(0, numericPrice - platformFee);

  return (
    <View style={styles.container}>
      {/* 1. Price */}
      <Text style={styles.label}>Giá mong muốn (VNĐ)</Text>
      <View style={styles.priceRow}>
        <TextInput
          value={price}
          onChangeText={onChangePrice}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#94A3B8"
          style={styles.priceInput}
        />
        <Text style={styles.currency}>đ</Text>
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
            🛡️ Phí sàn 5% tự động khấu trừ khi giao dịch thành công để bảo đảm an toàn Escrow.
          </Text>
        </View>
      )}

      {/* 2. Options */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Cho phép sinh viên trả giá nhẹ</Text>
        <Switch
          value={allowNegotiate}
          onValueChange={onToggleNegotiate}
          trackColor={{ false: '#E2E8F0', true: '#F27024' }}
        />
      </View>

      <TouchableOpacity style={styles.checkRow} activeOpacity={0.7} onPress={onToggleFreeForK20}>
        <View style={[styles.checkbox, freeForK20 && styles.checkboxActive]}>
          {freeForK20 && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
        </View>
        <Text style={styles.checkLabel}>Ưu tiên tặng miễn phí 0đ cho Tân sinh viên K20</Text>
      </TouchableOpacity>

      {/* 3. Safe Point */}
      <Text style={[styles.label, { marginTop: 14 }]}>Điểm giao dịch Safe-Handoff Point</Text>
      <View style={styles.safePointBox}>
        <Ionicons name="location" size={18} color="#059669" style={{ marginRight: 6 }} />
        <Text style={styles.safePointText} numberOfLines={1}>{selectedSafePoint}</Text>
      </View>

      {/* 4. Campus Ship */}
      <View style={[styles.switchRow, { marginTop: 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Hỗ trợ CampusShip liên cơ sở</Text>
          <Text style={styles.subtext}>Gửi đồ qua tủ Locker KTX giữa Hòa Lạc - HCM</Text>
        </View>
        <Switch
          value={campusShipEnabled}
          onValueChange={onToggleCampusShip}
          trackColor={{ false: '#E2E8F0', true: '#10B981' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 44 },
  priceInput: { flex: 1, fontSize: 16, fontWeight: '900', color: '#DC2626' },
  currency: { fontSize: 15, fontWeight: '800', color: '#64748B' },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  switchLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },
  subtext: { fontSize: 10, color: '#64748B', marginTop: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkbox: { width: 17, height: 17, borderRadius: 4, borderWidth: 1.5, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkboxActive: { backgroundColor: '#F27024', borderColor: '#F27024' },
  checkLabel: { fontSize: 11.5, fontWeight: '600', color: '#475569' },
  safePointBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  safePointText: { fontSize: 11.5, fontWeight: '700', color: '#065F46', flex: 1 },
});

export default PostPriceSafePointSection;
