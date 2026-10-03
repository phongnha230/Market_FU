import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface ManageListingsAnalyticsProps {
  onSafeHandoffPress: () => void;
}

export const ManageListingsAnalytics: React.FC<ManageListingsAnalyticsProps> = ({
  onSafeHandoffPress,
}) => {
  return (
    <>
      {/* 3. THẺ THỐNG KÊ (ANALYTICS STRIP) */}
      <View style={styles.analyticsStrip}>
        {/* Stat 1: Lượt xem */}
        <View style={styles.statItem}>
          <View style={styles.statIconPink}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#DC2626" />
          </View>
          <View style={styles.statTextCol}>
            <Text style={styles.statNumber}>1.240 lượt xem</Text>
            <Text style={styles.statSub}>30 ngày qua</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        {/* Stat 2: Sinh viên FPT kết nối */}
        <View style={styles.statItem}>
          <View style={styles.statIconMint}>
            <MaterialCommunityIcons name="handshake-outline" size={20} color="#059669" />
          </View>
          <View style={styles.statTextCol}>
            <Text style={styles.statNumber}>28 sinh viên FPT</Text>
            <Text style={styles.statSub}>Đã kết nối deal</Text>
          </View>
        </View>
      </View>

      {/* 4. SAFE-HANDOFF NHẮC NHỞ */}
      <TouchableOpacity
        style={styles.reminderCard}
        activeOpacity={0.85}
        onPress={onSafeHandoffPress}
      >
        <View style={styles.reminderClockCircle}>
          <Ionicons name="time" size={20} color="#FFFFFF" />
        </View>

        <View style={styles.reminderContentCol}>
          <View style={styles.reminderTitleRow}>
            <Text style={styles.reminderTitle}>SAFE-HANDOFF NHẮC NHỞ</Text>
            <View style={styles.reminderGreenDot} />
          </View>
          <Text style={styles.reminderDesc}>
            Hẹn lúc <Text style={styles.reminderOrangeText}>16:30 hôm nay</Text> tại{' '}
            <Text style={styles.reminderBold}>Dom B KTX</Text> với bạn{' '}
            <Text style={styles.reminderBold}>Hoàng Long (HE180293)</Text>
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#EA580C" style={styles.reminderArrow} />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  analyticsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconPink: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconMint: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextCol: {
    flex: 1,
  },
  statNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#DBEAFE',
    marginHorizontal: 8,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  reminderClockCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContentCol: {
    flex: 1,
  },
  reminderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  reminderTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#047857',
    letterSpacing: 0.2,
  },
  reminderGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  reminderDesc: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16.5,
  },
  reminderOrangeText: {
    color: '#EA580C',
    fontWeight: '800',
  },
  reminderBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  reminderArrow: {
    marginLeft: 4,
  },
});
