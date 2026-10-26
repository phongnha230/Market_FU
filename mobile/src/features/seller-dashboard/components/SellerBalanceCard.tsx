import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SellerBalanceCardProps {
  availableBalance: number;
  pendingEscrowAmount: number;
  totalRevenue: number;
  onOpenWithdrawModal: () => void;
  onOpenWithdrawHistory?: () => void;
}

export const SellerBalanceCard: React.FC<SellerBalanceCardProps> = ({
  availableBalance,
  pendingEscrowAmount,
  totalRevenue,
  onOpenWithdrawModal,
  onOpenWithdrawHistory,
}) => {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceHeader}>
        <View style={styles.balanceLeft}>
          <Text style={styles.balanceLabel}>Số dư khả dụng (Doanh thu đã giải ngân)</Text>
          <Text style={styles.balanceAmount}>
            {availableBalance.toLocaleString('vi-VN')} <Text style={styles.currency}>đ</Text>
          </Text>
        </View>
        <View style={styles.balanceActionGroup}>
          <TouchableOpacity
            style={styles.withdrawActionBtn}
            activeOpacity={0.85}
            onPress={onOpenWithdrawModal}
          >
            <Ionicons name="card" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.withdrawActionBtnText}>Rút ATM</Text>
          </TouchableOpacity>
          {onOpenWithdrawHistory && (
            <TouchableOpacity
              style={styles.historyActionBtn}
              activeOpacity={0.8}
              onPress={onOpenWithdrawHistory}
            >
              <Ionicons name="receipt-outline" size={13} color="#0F172A" style={{ marginRight: 3 }} />
              <Text style={styles.historyActionBtnText}>Lịch sử</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.balanceFooter}>
        <View style={styles.balanceFootItem}>
          <Ionicons name="lock-closed" size={14} color="#D97706" style={{ marginRight: 4 }} />
          <Text style={styles.footItemLabel}>
            Ký quỹ Escrow đang giữ: <Text style={styles.pendingEscrowHighlight}>{pendingEscrowAmount.toLocaleString('vi-VN')} đ</Text>
          </Text>
        </View>
        <View style={styles.balanceFootItem}>
          <Ionicons name="trending-up" size={14} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.footItemLabel}>
            Doanh số tháng: <Text style={styles.revenueHighlight}>{totalRevenue.toLocaleString('vi-VN')} đ</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA580C',
  },
  balanceActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyActionBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  withdrawActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  withdrawActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  balanceFootItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footItemLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  pendingEscrowHighlight: {
    fontWeight: '800',
    color: '#B45309',
  },
  revenueHighlight: {
    fontWeight: '800',
    color: '#059669',
  },
});
