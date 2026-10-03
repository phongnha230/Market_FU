import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SellerKpiGridProps {
  activeCount: number;
  reservedCount: number;
  shippingCount: number;
  soldCount: number;
  onNavigateMyListings: () => void;
  onNavigateOrderList: () => void;
  onNavigateInterCampus: () => void;
}

export const SellerKpiGrid: React.FC<SellerKpiGridProps> = ({
  activeCount,
  reservedCount,
  shippingCount,
  soldCount,
  onNavigateMyListings,
  onNavigateOrderList,
  onNavigateInterCampus,
}) => {
  return (
    <View style={styles.kpiGrid}>
      <TouchableOpacity
        style={styles.kpiCard}
        activeOpacity={0.8}
        onPress={onNavigateMyListings}
      >
        <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="file-tray-full" size={20} color="#2563EB" />
        </View>
        <Text style={styles.kpiNumber}>{activeCount}</Text>
        <Text style={styles.kpiTitle}>Tin đang rao bán</Text>
        <Text style={styles.kpiSub}>Xem kho đồ ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.kpiCard}
        activeOpacity={0.8}
        onPress={onNavigateOrderList}
      >
        <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="time" size={20} color="#D97706" />
        </View>
        <Text style={[styles.kpiNumber, { color: '#D97706' }]}>{reservedCount}</Text>
        <Text style={styles.kpiTitle}>Chờ giao đồ</Text>
        <Text style={styles.kpiSub}>Hẹn tại Safe-Point ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.kpiCard}
        activeOpacity={0.8}
        onPress={onNavigateInterCampus}
      >
        <View style={[styles.kpiIconBox, { backgroundColor: '#F3E8FF' }]}>
          <Ionicons name="bus" size={20} color="#7C3AED" />
        </View>
        <Text style={[styles.kpiNumber, { color: '#7C3AED' }]}>{shippingCount}</Text>
        <Text style={styles.kpiTitle}>Vận đơn FPT Bus</Text>
        <Text style={styles.kpiSub}>Chuyên tuyến liên cơ sở ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.kpiCard}
        activeOpacity={0.8}
        onPress={onNavigateOrderList}
      >
        <View style={[styles.kpiIconBox, { backgroundColor: '#DCFCE7' }]}>
          <Ionicons name="checkmark-done" size={20} color="#16A34A" />
        </View>
        <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>{soldCount}</Text>
        <Text style={styles.kpiTitle}>Đã bán hoàn tất</Text>
        <Text style={styles.kpiSub}>Đã nhận đủ tiền ›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
  },
});
