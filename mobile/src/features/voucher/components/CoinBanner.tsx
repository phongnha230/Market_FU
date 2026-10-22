import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CoinBannerProps {
  coins: number;
  checkedInToday?: boolean;
  streak?: number;
  isLoadingCheckIn?: boolean;
  onCheckIn?: () => void;
  onOpenHistory?: () => void;
}

export const CoinBanner: React.FC<CoinBannerProps> = ({
  coins,
  checkedInToday = false,
  streak = 0,
  isLoadingCheckIn = false,
  onCheckIn,
  onOpenHistory,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Số dư Campus Coins</Text>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color="#EA580C" />
              <Text style={styles.streakText}>Chuỗi {streak} ngày</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.coinRow}
          activeOpacity={0.7}
          onPress={onOpenHistory}
        >
          <Ionicons name="sparkles" size={20} color="#F59E0B" style={{ marginRight: 6 }} />
          <Text style={styles.coins}>{coins.toLocaleString('vi-VN')} Xu</Text>
          <Ionicons name="chevron-forward" size={16} color="#9A3412" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.viewWalletBtn}
        activeOpacity={0.8}
        onPress={onOpenHistory}
      >
        <Ionicons
          name="wallet-outline"
          size={15}
          color="#EA580C"
          style={{ marginRight: 4 }}
        />
        <Text style={styles.viewWalletText}>Ví Xu Campus</Text>
        <Ionicons name="chevron-forward" size={13} color="#EA580C" style={{ marginLeft: 2 }} />
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
    marginVertical: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  left: { flex: 1, marginRight: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  label: { fontSize: 11, color: '#9A3412', fontWeight: '700' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    gap: 2,
  },
  streakText: { fontSize: 10, fontWeight: '800', color: '#C2410C' },
  coinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  coins: { fontSize: 20, fontWeight: '900', color: '#EA580C' },
  viewWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  viewWalletText: { color: '#EA580C', fontSize: 11.5, fontWeight: '800' },
});

export default CoinBanner;
