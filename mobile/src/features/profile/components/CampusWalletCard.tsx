import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const CampusWalletCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.walletRow}>
        <View style={styles.walletBox}>
          <Text style={styles.label}>Số dư ví Escrow an toàn</Text>
          <Text style={styles.amount}>1.450.000đ</Text>
        </View>

        <View style={styles.coinBox}>
          <Text style={styles.label}>Xu tích lũy</Text>
          <View style={styles.coinRow}>
            <Ionicons name="sparkles" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
            <Text style={styles.coinText}>320 Coin</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Ví Escrow', 'Nạp tiền vào ví Escrow')}
        >
          <Ionicons name="add-circle-outline" size={15} color="#F27024" style={{ marginRight: 4 }} />
          <Text style={styles.actionText}>Nạp tiền ví</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => Alert.alert('Rút tiền', 'Yêu cầu rút tiền về tài khoản ngân hàng SV')}
        >
          <Ionicons name="card-outline" size={15} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.actionText}>Rút về ATM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#F8FAFC', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  walletBox: { flex: 1 },
  coinBox: { alignItems: 'flex-end' },
  label: { fontSize: 10.5, fontWeight: '600', color: '#64748B' },
  amount: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  coinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  coinText: { fontSize: 14, fontWeight: '800', color: '#B45309' },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  actionText: { fontSize: 11.5, fontWeight: '700', color: '#334155' },
});

export default CampusWalletCard;
