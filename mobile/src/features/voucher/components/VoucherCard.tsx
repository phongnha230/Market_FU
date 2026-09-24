import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VoucherItem } from '../types/voucher.types';

interface VoucherCardProps {
  item: VoucherItem;
  onAction: (item: VoucherItem) => void;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ item, onAction }) => {
  return (
    <View style={[styles.card, { borderColor: item.borderColor }]}>
      <View style={styles.topRow}>
        <View style={[styles.tag, { backgroundColor: item.lightBg }]}>
          <Text style={[styles.tagText, { color: item.accentColor }]}>{item.categoryTag}</Text>
        </View>
        {item.daysLeft && (
          <Text style={styles.daysLeft}>Còn {item.daysLeft} ngày</Text>
        )}
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

      {item.usedPercent !== undefined && (
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.usedPercent}%`, backgroundColor: item.accentColor }]} />
          </View>
          <Text style={styles.progressText}>Đã dùng {item.usedPercent}%</Text>
        </View>
      )}

      <View style={styles.footer}>
        {item.coinCost ? (
          <Text style={styles.costText}>{item.coinCost} Coins</Text>
        ) : (
          <Text style={styles.codeText}>{item.code || 'Tự động áp dụng'}</Text>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, item.actionType === 'saved' ? styles.btnSaved : { backgroundColor: item.accentColor }]}
          disabled={item.actionType === 'saved' || item.actionType === 'ready'}
          onPress={() => onAction(item)}
        >
          <Text style={styles.btnText}>
            {item.actionType === 'saved'
              ? 'Đã lưu'
              : item.actionType === 'ready'
              ? 'Sẵn sàng dùng'
              : item.actionType === 'exchange'
              ? 'Đổi ngay'
              : 'Lưu mã'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '800' },
  daysLeft: { fontSize: 10.5, color: '#94A3B8' },
  title: { fontSize: 13.5, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  desc: { fontSize: 11, color: '#64748B', lineHeight: 15, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  progressBar: { flex: 1, height: 5, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginRight: 8 },
  progressFill: { height: '100%' },
  progressText: { fontSize: 9.5, color: '#94A3B8', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 8 },
  costText: { fontSize: 13, fontWeight: '900', color: '#EA580C' },
  codeText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  btnSaved: { backgroundColor: '#E2E8F0' },
  btnText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
});

export default VoucherCard;
