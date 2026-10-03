import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useKho } from '../../../context/KhoContext';

interface CampusWalletCardProps {
  onWithdrawPress?: () => void;
  onDepositPress?: () => void;
}

export const CampusWalletCard: React.FC<CampusWalletCardProps> = ({
  onWithdrawPress,
  onDepositPress,
}) => {
  const navigation = useNavigation<any>();
  const { user, isSeller, availableBalance, escrowBalance, coins, depositToWallet } = useKho();

  const handleDeposit = () => {
    if (onDepositPress) {
      onDepositPress();
      return;
    }
    Alert.alert(
      'Nạp tiền ví Campus Escrow',
      'Chọn số tiền nạp nhanh thử nghiệm qua VietQR Napas 24/7:',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: '+200.000đ',
          onPress: async () => {
            await depositToWallet(200000);
            Alert.alert('Nạp tiền thành công', 'Đã cộng 200.000đ vào số dư ví của bạn.');
          },
        },
        {
          text: '+500.000đ',
          onPress: async () => {
            await depositToWallet(500000);
            Alert.alert('Nạp tiền thành công', 'Đã cộng 500.000đ vào số dư ví của bạn.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.walletRow}>
        <View style={styles.walletBox}>
          <Text style={styles.label}>
            {isSeller ? 'Ví Người Bán (Khả dụng rút)' : 'Số dư ví ký quỹ Escrow'}
          </Text>
          <Text style={styles.amount}>
            {availableBalance.toLocaleString('vi-VN')}
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>đ</Text>
          </Text>
          {escrowBalance > 0 && (
            <Text style={styles.subEscrow}>
              🔒 {escrowBalance.toLocaleString('vi-VN')}đ đang giữ bảo hộ
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.coinBox}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CoinHistory')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={styles.label}>Xu tích lũy</Text>
            <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
          </View>
          <View style={styles.coinRow}>
            <Ionicons name="sparkles" size={13} color="#F59E0B" style={{ marginRight: 3 }} />
            <Text style={styles.coinText}>{user?.coins ?? coins} Xu</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleDeposit}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={15} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.actionText}>Nạp ví</Text>
        </TouchableOpacity>

        <View style={styles.btnDivider} />

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            if (onWithdrawPress) onWithdrawPress();
            else Alert.alert('Rút tiền', 'Tính năng rút tiền về ngân hàng');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="card-outline" size={15} color="#059669" style={{ marginRight: 4 }} />
          <Text style={[styles.actionText, { color: '#059669' }]}>Rút ATM</Text>
        </TouchableOpacity>

        <View style={styles.btnDivider} />

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('WithdrawalHistory')}
          activeOpacity={0.7}
        >
          <Ionicons name="receipt-outline" size={15} color="#2563EB" style={{ marginRight: 4 }} />
          <Text style={[styles.actionText, { color: '#2563EB' }]}>Lịch sử rút</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletBox: { flex: 1 },
  coinBox: { alignItems: 'flex-end' },
  label: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  amount: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  subEscrow: { fontSize: 10.5, fontWeight: '600', color: '#EA580C', marginTop: 2 },
  coinRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  coinText: { fontSize: 15, fontWeight: '800', color: '#B45309' },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  btnDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },
  actionText: { fontSize: 12.5, fontWeight: '700', color: '#EA580C' },
});

export default CampusWalletCard;
