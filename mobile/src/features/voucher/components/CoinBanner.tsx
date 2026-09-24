import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CoinBannerProps {
  coins: number;
}

export const CoinBanner: React.FC<CoinBannerProps> = ({ coins }) => {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Text style={styles.label}>Số dư xu hiện có</Text>
        <View style={styles.coinRow}>
          <Ionicons name="sparkles" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={styles.coins}>{coins} FU-Coins</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkinBtn}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Điểm danh thành công', 'Bạn nhận được +10 Coins hôm nay!')}
      >
        <Ionicons name="gift-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text style={styles.checkinText}>Điểm danh nhận xu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  left: { flex: 1 },
  label: { fontSize: 11, color: '#9A3412', fontWeight: '600' },
  coinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  coins: { fontSize: 18, fontWeight: '900', color: '#EA580C' },
  checkinBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EA580C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  checkinText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
});

export default CoinBanner;
