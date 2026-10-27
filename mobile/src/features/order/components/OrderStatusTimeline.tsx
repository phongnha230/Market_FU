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
  const isHolding = orderStatus === 'escrow_holding' || orderStatus === 'ESCROW_PAID';
  const isShipping = orderStatus === 'shipping' || orderStatus === 'HANDOVER_CONFIRMED';
  const isDelivered = orderStatus === 'delivered' || orderStatus === 'DELIVERED';
  const isCompleted = orderStatus === 'completed' || orderStatus === 'COMPLETED';
  const isCancelled = orderStatus === 'cancelled' || orderStatus === 'CANCELLED';
  const isDisputed = orderStatus === 'disputed' || orderStatus === 'DISPUTED';

  const getStatusText = () => {
    if (isCancelled) return '❌ Đã hủy đơn hàng';
    if (isDisputed) return isInterCampus ? '⚠️ Khiếu nại vận chuyển' : '⚠️ Đang giải quyết khiếu nại';
    if (isCompleted) return isInterCampus ? '✅ Giao thành công & Hoàn tất' : '✅ Đã hoàn tất & Giải ngân';
    if (isDelivered) return isInterCampus ? '🛵 Đã tới KTX (48h bao test)' : '🛡️ Đã bàn giao';
    if (isShipping) return isInterCampus ? '🚚 Đang vận chuyển liên Campus' : '🛡️ Chờ bàn giao Safe-Point';
    if (isHolding) return isInterCampus ? '🚚 Đang vận chuyển liên Campus' : '🛡️ Chờ bàn giao Safe-Point';
    if (isPending) return isInterCampus ? '📦 Chờ người bán gửi hàng' : '⏳ Chờ người bán xác nhận';
    return isInterCampus ? '🚚 Đơn liên Campus' : '⏳ Chờ xác nhận';
  };

  return (
    <View style={styles.timelineCard}>
      <View style={styles.timelineHeader}>
        {isInterCampus ? (
          <View style={[styles.escrowTag, styles.interCampusTag]}>
            <Ionicons name="bus-outline" size={14} color="#2563EB" />
            <Text style={[styles.escrowTagText, styles.interCampusTagText]}>Vận chuyển Liên Campus</Text>
          </View>
        ) : (
          <View style={styles.escrowTag}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.escrowTagText}>Bảo lãnh Escrow FPT</Text>
          </View>
        )}
        <Text
          style={[
            styles.statusName,
            isCancelled && { color: '#64748B' },
            isCompleted && { color: '#059669' },
            isPending && { color: '#D97706' },
            (isShipping || isHolding) && { color: isInterCampus ? '#2563EB' : '#059669' },
            isDelivered && { color: '#10B981' },
            isDisputed && { color: '#DC2626' },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getStatusText()}
        </Text>
      </View>

      {/* 4 Step visual */}
      <View style={styles.stepsRow}>
        {/* Step 1: Tạo đơn (Liên campus) / Đặt cọc (Safe-point) */}
        <View style={styles.stepCol}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Tạo đơn' : 'Đặt cọc'}</Text>
        </View>
        <View
          style={[
            styles.stepLine,
            !isCancelled && (isPending || isShipping || isHolding || isDelivered || isCompleted) && styles.stepLineDone,
          ]}
        />

        {/* Step 2: Gửi hàng (Liên campus) / Chốt hẹn (Safe-point) */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isPending && styles.stepDotActive,
              (isShipping || isHolding || isDelivered || isCompleted) && styles.stepDotDone,
              (!isPending && !isShipping && !isHolding && !isDelivered && !isCompleted) && styles.stepDotPending,
            ]}
          >
            {isShipping || isHolding || isDelivered || isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : isPending ? (
              <Ionicons name="time" size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={12} color="#94A3B8" />
            )}
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Gửi hàng' : 'Chốt hẹn'}</Text>
        </View>
        <View
          style={[
            styles.stepLine,
            !isCancelled && (isShipping || isHolding || isDelivered || isCompleted) && styles.stepLineDone,
          ]}
        />

        {/* Step 3: Vận chuyển (Liên campus) / Safe-Point (Cùng campus) */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              (isShipping || isHolding) && styles.stepDotActive,
              (isDelivered || isCompleted) && styles.stepDotDone,
              (!isShipping && !isHolding && !isDelivered && !isCompleted) && styles.stepDotPending,
            ]}
          >
            {isDelivered || isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : isShipping || isHolding ? (
              <Ionicons name={isInterCampus ? 'bus' : 'location'} size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name={isInterCampus ? 'bus-outline' : 'location-outline'} size={12} color="#94A3B8" />
            )}
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Vận chuyển' : 'Safe-Point'}</Text>
        </View>
        <View
          style={[
            styles.stepLine,
            !isCancelled && (isDelivered || isCompleted) && styles.stepLineDone,
          ]}
        />

        {/* Step 4: Giao KTX (Liên campus) / Giải ngân (Safe-point) */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isCompleted && styles.stepDotDone,
              isDelivered && styles.stepDotActive,
              (!isDelivered && !isCompleted) && styles.stepDotPending,
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : isDelivered ? (
              <Ionicons name="time" size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name={isInterCampus ? 'home-outline' : 'shield-outline'} size={12} color="#94A3B8" />
            )}
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
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    flexShrink: 0,
  },
  interCampusTag: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  escrowTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  interCampusTagText: {
    color: '#2563EB',
  },
  statusName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
    flexShrink: 1,
    textAlign: 'right',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#059669',
  },
  stepDotActive: {
    backgroundColor: '#EA580C',
  },
  stepDotPending: {
    backgroundColor: '#E2E8F0',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    top: -10,
  },
  stepLineDone: {
    backgroundColor: '#059669',
  },
});
