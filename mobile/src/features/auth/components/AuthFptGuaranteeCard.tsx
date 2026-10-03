import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GuaranteeItemData {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
}

const GUARANTEE_ITEMS: GuaranteeItemData[] = [
  {
    icon: 'checkmark-circle-outline',
    title: 'Xác thực Thẻ SV:',
    desc: 'Chỉ sinh viên FPT đã KYC mới được quyền đăng bài bán và quản lý tin rao.',
  },
  {
    icon: 'shield-outline',
    title: 'Bảo hộ Quỹ Escrow:',
    desc: 'Tiền được tạm giữ an toàn, chỉ giải ngân khi người mua kiểm tra đồ ưng ý.',
  },
];

const GuaranteeHeader: React.FC = React.memo(() => (
  <View style={styles.guaranteeHeader}>
    <View style={styles.guaranteeTitleRow}>
      <View style={styles.greenShieldBox}>
        <Ionicons name="shield-checkmark" size={16} color="#059669" />
      </View>
      <Text style={styles.guaranteeTitle}>Bảo chứng 100% Sinh viên FPT</Text>
    </View>
    <View style={styles.closedBadge}>
      <Text style={styles.closedBadgeText}>Nội bộ</Text>
    </View>
  </View>
));

const GuaranteeStats: React.FC = React.memo(() => (
  <View style={styles.statsStrip}>
    <View style={styles.statsLeft}>
      <View style={styles.greenDot} />
      <Text style={styles.statsText}>
        <Text style={styles.statsBold}>1,420+</Text> sinh viên online
      </Text>
    </View>
    <Text style={styles.statsText}>
      <Text style={styles.statsBold}>3,850+</Text> giao dịch thành công
    </Text>
  </View>
));

export const AuthFptGuaranteeCard: React.FC = () => {
  return (
    <View style={styles.guaranteeCard}>
      <GuaranteeHeader />

      {GUARANTEE_ITEMS.map((item, idx) => (
        <View key={item.title} style={[styles.guaranteeItem, idx > 0 && { marginTop: 8 }]}>
          <Ionicons name={item.icon} size={15} color="#059669" style={{ marginRight: 8, marginTop: 1 }} />
          <Text style={styles.guaranteeItemText}>
            <Text style={styles.boldText}>{item.title} </Text>
            {item.desc}
          </Text>
        </View>
      ))}

      <GuaranteeStats />
    </View>
  );
};

const styles = StyleSheet.create({
  guaranteeCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  guaranteeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenShieldBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  closedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guaranteeItemText: {
    fontSize: 11.5,
    color: '#166534',
    lineHeight: 16,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statsText: {
    fontSize: 10.5,
    color: '#15803D',
  },
  statsBold: {
    fontWeight: '800',
  },
});

export default AuthFptGuaranteeCard;
