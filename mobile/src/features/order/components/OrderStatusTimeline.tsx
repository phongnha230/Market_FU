import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderStatusTimelineProps {
  orderStatus: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = React.memo(({
  orderStatus,
}) => {
  return (
    <View style={styles.timelineCard}>
      <View style={styles.timelineHeader}>
        <View style={styles.escrowTag}>
          <Ionicons name="shield-checkmark" size={14} color="#059669" />
          <Text style={styles.escrowTagText}>Bảo lãnh Escrow FPT</Text>
        </View>
        <Text
          style={[
            styles.statusName,
            orderStatus === 'cancelled' && { color: '#64748B' },
            orderStatus === 'completed' && { color: '#059669' },
          ]}
        >
          {orderStatus === 'escrow_holding'
            ? 'Đang giữ tiền Escrow'
            : orderStatus === 'completed'
            ? 'Đã hoàn tất & Giải ngân'
            : orderStatus === 'cancelled'
            ? 'Đã hủy đơn hàng'
            : 'Đang giải quyết khiếu nại'}
        </Text>
      </View>

      {/* 4 Step visual */}
      <View style={styles.stepsRow}>
        <View style={styles.stepCol}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.stepLabel}>Đặt cọc</Text>
        </View>
        <View style={[styles.stepLine, styles.stepLineDone]} />

        <View style={styles.stepCol}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.stepLabel}>Chuẩn bị</Text>
        </View>
        <View style={[styles.stepLine, orderStatus === 'completed' && styles.stepLineDone]} />

        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              orderStatus === 'escrow_holding' && styles.stepDotActive,
              orderStatus === 'completed' && styles.stepDotDone,
            ]}
          >
            {orderStatus === 'completed' ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name="time" size={12} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.stepLabel}>Safe-Point</Text>
        </View>
        <View style={[styles.stepLine, orderStatus === 'completed' && styles.stepLineDone]} />

        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              orderStatus === 'completed' ? styles.stepDotDone : styles.stepDotPending,
            ]}
          >
            <Ionicons
              name="shield"
              size={12}
              color={orderStatus === 'completed' ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
          <Text style={styles.stepLabel}>Giải ngân</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  escrowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  escrowTagText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  statusName: { fontSize: 12, fontWeight: '800', color: '#EA580C' },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepCol: { alignItems: 'center', width: 60 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: '#059669' },
  stepDotActive: { backgroundColor: '#EA580C' },
  stepDotPending: { backgroundColor: '#E2E8F0' },
  stepLabel: { fontSize: 10, fontWeight: '700', color: '#475569', marginTop: 4 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', top: -10 },
  stepLineDone: { backgroundColor: '#059669' },
});
