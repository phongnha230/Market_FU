import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { resolveProductImage } from '../../../lib/imageResolver';

interface SellerRecentOrdersSectionProps {
  recentSales?: Array<{
    id: string;
    orderCode: string;
    productTitle: string;
    productImage?: string;
    buyerName: string;
    amount: number;
    orderType: string;
    status: string;
    createdAt: string | Date;
  }>;
  totalOrdersCount: number;
  onNavigateOrderList: () => void;
  onNavigateInterCampus: () => void;
  onNavigateOrderDetail: (params: { orderId: string; status: string; product?: any; safePoint?: string }) => void;
  userName?: string;
}

export const SellerRecentOrdersSection: React.FC<SellerRecentOrdersSectionProps> = ({
  recentSales,
  totalOrdersCount,
  onNavigateOrderList,
  onNavigateInterCampus,
  onNavigateOrderDetail,
  userName,
}) => {
  return (
    <View style={styles.ordersSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeading}>Đơn hàng gần đây & Cần xử lý</Text>
        <TouchableOpacity onPress={onNavigateOrderList}>
          <Text style={styles.seeAllText}>
            Xem tất cả ({totalOrdersCount})
          </Text>
        </TouchableOpacity>
      </View>

      {recentSales && recentSales.length > 0 ? (
        recentSales.map((item) => {
          const isInterCampus = item.orderType === 'SHIP_COD';
          const isDone = item.status === 'COMPLETED';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.orderCard}
              activeOpacity={0.88}
              onPress={() => {
                if (isInterCampus) {
                  onNavigateInterCampus();
                } else {
                  onNavigateOrderDetail({
                    orderId: item.orderCode || item.id,
                    status: item.status,
                  });
                }
              }}
            >
              <View style={styles.orderTopBar}>
                <View
                  style={[
                    styles.busTag,
                    !isInterCampus && styles.safePointTag,
                  ]}
                >
                  <Ionicons
                    name={isInterCampus ? 'bus' : 'location'}
                    size={13}
                    color={isInterCampus ? '#7C3AED' : '#2563EB'}
                  />
                  <Text
                    style={[
                      styles.busTagText,
                      !isInterCampus && styles.safePointTagText,
                    ]}
                  >
                    {isInterCampus
                      ? 'GIAO DỊCH LIÊN CAMPUS (FPT BUS)'
                      : 'HẸN GẶP SAFE-POINT CÙNG CAMPUS'}
                  </Text>
                </View>
                <Text style={styles.orderPrice}>
                  {item.amount.toLocaleString('vi-VN')} đ
                </Text>
              </View>

              <View style={styles.orderMain}>
                <Image
                  source={resolveProductImage(item.productImage)}
                  style={styles.orderThumb}
                  contentFit="cover"
                />
                <View style={styles.orderDetail}>
                  <Text style={styles.orderTitle} numberOfLines={1}>
                    {item.productTitle}
                  </Text>
                  <Text style={styles.orderRoute}>
                    👤 Người mua:{' '}
                    <Text style={styles.boldText}>
                      {item.buyerName}
                    </Text>
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      isDone
                        ? styles.statusCompleted
                        : !isInterCampus
                        ? styles.statusPending
                        : null,
                    ]}
                  >
                    <Ionicons
                      name={
                        isDone
                          ? 'checkmark-circle'
                          : isInterCampus
                          ? 'sync-circle'
                          : 'time'
                      }
                      size={13}
                      color={
                        isDone
                          ? '#16A34A'
                          : isInterCampus
                          ? '#7C3AED'
                          : '#D97706'
                      }
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        isDone
                          ? styles.statusCompletedText
                          : !isInterCampus
                          ? styles.statusPendingText
                          : null,
                      ]}
                    >
                      {isDone
                        ? 'Đã hoàn tất • Đã giải ngân ví'
                        : isInterCampus
                        ? 'Đang vận chuyển FPT Bus • Đến trạm'
                        : 'Chờ bàn giao tại Safe-Point'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderFootTime}>Mã đơn: #{item.orderCode}</Text>
                <View style={styles.viewTimelineBtn}>
                  <Text
                    style={[
                      styles.viewTimelineText,
                      !isInterCampus && styles.viewDetailText,
                    ]}
                  >
                    {isInterCampus ? 'Theo dõi hành trình' : 'Xem chi tiết đơn'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={13}
                    color={isInterCampus ? '#7C3AED' : '#2563EB'}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={28} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào cần xử lý</Text>
          <Text style={styles.emptySubtitle}>
            Khi có sinh viên đặt mua đồ từ kho hàng của bạn, các đơn hàng cần giao hoặc điều phối sẽ xuất hiện tại đây.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ordersSection: {
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  busTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 4,
  },
  busTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  safePointTag: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  safePointTagText: {
    color: '#2563EB',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  orderMain: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  orderThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  orderDetail: {
    flex: 1,
    justifyContent: 'center',
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  orderRoute: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  statusCompleted: {
    backgroundColor: '#DCFCE7',
  },
  statusCompletedText: {
    color: '#16A34A',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPendingText: {
    color: '#B45309',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  orderFootTime: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  viewTimelineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewTimelineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  viewDetailText: {
    color: '#2563EB',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
