import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingCampusCardProps {
  campus: string;
}

const LockedBadge: React.FC = React.memo(() => (
  <View style={styles.lockedBadge}>
    <Ionicons name="lock-closed" size={11} color="#64748B" />
    <Text style={styles.lockedBadgeText}>Cố định theo hồ sơ</Text>
  </View>
));

const LockedCampusDetails: React.FC<{ campus: string }> = React.memo(({ campus }) => (
  <View style={{ flex: 1 }}>
    <View style={styles.lockedCampusTitleRow}>
      <Text style={styles.lockedCampusTitle}>{campus}</Text>
      <LockedBadge />
    </View>
    <Text style={styles.lockedCampusSub}>
      Món đồ gắn liền với cơ sở người bán ({campus}), cố định theo hồ sơ đã đăng ký để giao dịch Safe-Point chính xác.
    </Text>
  </View>
));

export const EditListingCampusCard: React.FC<EditListingCampusCardProps> = React.memo(({ campus }) => {
  return (
    <View>
      <Text style={styles.inputLabel}>Cơ sở đăng bán</Text>
      <View style={styles.lockedCampusCard}>
        <View style={styles.lockedCampusIconWrap}>
          <Ionicons name="business" size={18} color="#EA580C" />
        </View>
        <LockedCampusDetails campus={campus} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  lockedCampusCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  lockedCampusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  lockedCampusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lockedCampusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  lockedCampusSub: {
    fontSize: 11,
    color: '#7C2D12',
    lineHeight: 16,
  },
});
