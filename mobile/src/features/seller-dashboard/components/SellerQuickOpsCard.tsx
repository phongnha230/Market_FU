import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SellerQuickOpsCardProps {
  onPostItem: () => void;
  onMyListings: () => void;
  onInterCampus: () => void;
  onWithdraw: () => void;
}

export const SellerQuickOpsCard: React.FC<SellerQuickOpsCardProps> = ({
  onPostItem,
  onMyListings,
  onInterCampus,
  onWithdraw,
}) => {
  return (
    <View style={styles.quickOpsCard}>
      <Text style={styles.sectionHeading}>Lối tắt quản lý vận hành</Text>
      <View style={styles.quickOpsGrid}>
        <TouchableOpacity
          style={styles.quickOpBtn}
          activeOpacity={0.75}
          onPress={onPostItem}
        >
          <View style={[styles.quickOpIcon, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="add" size={20} color="#EA580C" />
          </View>
          <Text style={styles.quickOpLabel}>Đăng bài mới</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickOpBtn}
          activeOpacity={0.75}
          onPress={onMyListings}
        >
          <View style={[styles.quickOpIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="layers-outline" size={20} color="#2563EB" />
          </View>
          <Text style={styles.quickOpLabel}>Kho tin rao</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickOpBtn}
          activeOpacity={0.75}
          onPress={onInterCampus}
        >
          <View style={[styles.quickOpIcon, { backgroundColor: '#F5F3FF' }]}>
            <Ionicons name="airplane-outline" size={20} color="#7C3AED" />
          </View>
          <Text style={styles.quickOpLabel}>Liên Campus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickOpBtn}
          activeOpacity={0.75}
          onPress={onWithdraw}
        >
          <View style={[styles.quickOpIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="cash-outline" size={20} color="#059669" />
          </View>
          <Text style={styles.quickOpLabel}>Rút ATM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickOpsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  quickOpsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickOpBtn: {
    alignItems: 'center',
    width: '23%',
  },
  quickOpIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickOpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
});
