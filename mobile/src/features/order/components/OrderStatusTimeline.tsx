import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderStatusTimelineProps {
  orderStatus: string;
  isInterCampus?: boolean;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = React.memo(({
  orderStatus,
  isInterCampus = false,
}) => {
  const isPending = orderStatus === 'pending' || orderStatus === 'PENDING_SAFEPOINT';
  const isHolding = orderStatus === 'escrow_holding' || orderStatus === 'ESCROW_PAID' || orderStatus === 'delivered' || orderStatus === 'DELIVERED';
  const isCompleted = orderStatus === 'completed' || orderStatus === 'COMPLETED';
  const isCancelled = orderStatus === 'cancelled' || orderStatus === 'CANCELLED';

  const getStatusText = () => {
    if (isCancelled) return 'Đã hủy đơn hàng';
    if (isCompleted) return 'Đã hoàn tất & Giải ngân';
    if (isPending) return isInterCampus ? '📦 Chờ gửi hàng' : '⏳ Chờ người bán xác nhận';
    if (isHolding) return isInterCampus ? '🚚 Đang luân chuyển' : '🛡️ Chờ bàn giao Safe-Point';
    return 'Đang giải quyết khiếu nại';
  };

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
            isCancelled && { color: '#64748B' },
            isCompleted && { color: '#059669' },
            isPending && { color: '#D97706' },
            isHolding && { color: '#059669' },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getStatusText()}
        </Text>
      </View>

      {/* 4 Step visual */}
      <View style={styles.stepsRow}>
        {/* Step 1: Đặt cọc */}
        <View style={styles.stepCol}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.stepLabel}>Đặt cọc</Text>
        </View>
        <View style={[styles.stepLine, (isPending || isHolding || isCompleted) && styles.stepLineDone]} />

        {/* Step 2: Chốt hẹn */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isPending && styles.stepDotActive,
              (isHolding || isCompleted) && styles.stepDotDone,
              !isPending && !isHolding && !isCompleted && styles.stepDotPending,
            ]}
          >
            {isHolding || isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : isPending ? (
              <Ionicons name="time" size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={12} color="#94A3B8" />
            )}
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Gửi hàng' : 'Chốt hẹn'}</Text>
        </View>
        <View style={[styles.stepLine, (isHolding || isCompleted) && styles.stepLineDone]} />

        {/* Step 3: Safe-Point */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isHolding && styles.stepDotActive,
              isCompleted && styles.stepDotDone,
              !isHolding && !isCompleted && styles.stepDotPending,
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : isHolding ? (
              <Ionicons name="time" size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name="location" size={12} color="#94A3B8" />
            )}
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Vận chuyển' : 'Safe-Point'}</Text>
        </View>
        <View style={[styles.stepLine, isCompleted && styles.stepLineDone]} />

        {/* Step 4: Giải ngân */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isCompleted ? styles.stepDotDone : styles.stepDotPending,
            ]}
          >
            <Ionicons
              name="shield"
              size={12}
              color={isCompleted ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Giao KTX' : 'Giải ngân'}</Text>
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
    gap: 8,
  },
  escrowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    flexShrink: 0,
  },
  escrowTagText: { fontSize: 11, fontWeight: '800', color: '#059669' },
  statusName: { fontSize: 12, fontWeight: '800', color: '#EA580C', flexShrink: 1, textAlign: 'right' },
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
