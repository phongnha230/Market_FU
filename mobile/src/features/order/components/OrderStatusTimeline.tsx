import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderStatusTimelineProps {
  orderStatus: string;
  isInterCampus?: boolean;
  hasTrackingCode?: boolean;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = React.memo(({
  orderStatus,
  isInterCampus = false,
  hasTrackingCode = false,
}) => {
  const normStatus = String(orderStatus || '').toLowerCase();
  const isPending = normStatus === 'pending' || normStatus === 'pending_safepoint';
  const isHolding = normStatus === 'escrow_holding' || normStatus === 'escrow_paid';
  const isShipping = normStatus === 'shipping' || normStatus === 'handover_confirmed';
  const isDelivered = normStatus === 'delivered';
  const isCompleted = normStatus === 'completed';
  const isCancelled = normStatus === 'cancelled';
  const isDisputed = normStatus === 'disputed';

  const isInTransit = isInterCampus
    ? ((isShipping && Boolean(hasTrackingCode)) || isDelivered || isCompleted)
    : (isShipping || isDelivered || isCompleted);
  const isPackaging = isInterCampus
    ? (isPending || isHolding || (isShipping && !hasTrackingCode))
    : (isPending || isHolding);

  const getStatusText = () => {
    if (isCancelled) return '❌ Đã hủy đơn hàng';
    if (isDisputed) return isInterCampus ? '⚠️ Khiếu nại vận chuyển' : '⚠️ Đang giải quyết khiếu nại';
    if (isCompleted) return isInterCampus ? '✅ Giao thành công & Hoàn tất' : '✅ Đã hoàn tất & Giải ngân';
    if (isDelivered) return isInterCampus ? '🛵 Đã tới KTX (48h bao test)' : '🛡️ Đã bàn giao Safe-Point';
    if (isInterCampus) {
      if (isInTransit) return '🚚 Đang vận chuyển liên Campus';
      if (isPending) return '⏳ Chờ người bán xác nhận';
      return '📦 Người bán đang đóng gói';
    }
    if (isShipping) return '🛡️ Chờ bàn giao Safe-Point';
    if (isHolding) return '🛡️ Đã thanh toán Escrow';
    if (isPending) return '⏳ Chờ người bán xác nhận';
    return '⏳ Chờ xác nhận';
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
            isHolding && { color: isInterCampus ? '#EA580C' : '#059669' },
            isShipping && { color: isInterCampus ? '#2563EB' : '#059669' },
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
            !isCancelled && (isPending || isHolding || isShipping || isDelivered || isCompleted) && styles.stepLineDone,
          ]}
        />

        {/* Step 2: Đóng gói (Liên campus) / Chốt hẹn (Safe-point) */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              isPackaging && styles.stepDotActive,
              isInTransit && styles.stepDotDone,
              (!isPackaging && !isInTransit) && styles.stepDotPending,
            ]}
          >
            {isInTransit ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : isPackaging ? (
              <Ionicons name={isInterCampus ? 'cube-outline' : 'time'} size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark" size={12} color="#94A3B8" />
            )}
          </View>
          <Text style={styles.stepLabel}>{isInterCampus ? 'Đóng gói' : 'Chốt hẹn'}</Text>
        </View>
        <View
          style={[
            styles.stepLine,
            !isCancelled && isInTransit && styles.stepLineDone,
          ]}
        />

        {/* Step 3: Vận chuyển (Liên campus) / Safe-Point (Cùng campus) */}
        <View style={styles.stepCol}>
          <View
            style={[
              styles.stepDot,
              (isInterCampus ? (isShipping && Boolean(hasTrackingCode)) : isShipping) && styles.stepDotActive,
              (isDelivered || isCompleted) && styles.stepDotDone,
              (!isInTransit || (isInterCampus && !hasTrackingCode)) && styles.stepDotPending,
            ]}
          >
            {isDelivered || isCompleted ? (
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            ) : (isInterCampus ? (isShipping && Boolean(hasTrackingCode)) : isShipping) ? (
              <Ionicons name={isInterCampus ? 'cube' : 'location'} size={12} color="#FFFFFF" />
            ) : (
              <Ionicons name={isInterCampus ? 'cube-outline' : 'location-outline'} size={12} color="#94A3B8" />
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  interCampusTag: {
    backgroundColor: '#EFF6FF',
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
    fontSize: 12.5,
    fontWeight: '800',
    color: '#EA580C',
    flexShrink: 1,
    textAlign: 'right',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepCol: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDotDone: {
    backgroundColor: '#059669',
  },
  stepDotActive: {
    backgroundColor: '#EA580C',
  },
  stepDotPending: {
    backgroundColor: '#F1F5F9',
  },
  stepLabel: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  stepLineDone: {
    backgroundColor: '#059669',
  },
});

export default OrderStatusTimeline;
