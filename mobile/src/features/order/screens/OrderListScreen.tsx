import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: 'escrow_holding' | 'completed' | 'disputed' | 'cancelled';
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  sellerName: string;
  sellerCohort: string;
  sellerCampus: string;
  productTitle: string;
  productPrice: number;
  productImage: any;
  safePoint: string;
  isReviewed?: boolean;
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-882194',
    date: 'Hôm nay, 14:15',
    status: 'escrow_holding',
    statusLabel: '🛡️ Đang giữ tiền Escrow',
    statusColor: '#EA580C',
    statusBg: '#FFF7ED',
    sellerName: 'Nguyễn Văn Nam',
    sellerCohort: 'K16 SE',
    sellerCampus: 'Hòa Lạc',
    productTitle: 'Màn hình Dell 24" UltraSharp U2419H',
    productPrice: 1450000,
    productImage: require('../../../../assets/products/monitor-dell-24.jpg'),
    safePoint: 'Sảnh Tòa Alpha (Camera 24/7)',
    isReviewed: false,
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-651239',
    date: '26/09/2026',
    status: 'completed',
    statusLabel: '✅ Giao dịch hoàn tất',
    statusColor: '#059669',
    statusBg: '#ECFDF5',
    sellerName: 'Trần Minh Quân',
    sellerCohort: 'K17 IA',
    sellerCampus: 'Hòa Lạc',
    productTitle: 'Bàn phím cơ Akko 3087 v2 Silent Switch',
    productPrice: 480000,
    productImage: require('../../../../assets/products/keyboard-akko.jpg'),
    safePoint: 'Sảnh Beta KTX',
    isReviewed: false,
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-440182',
    date: '20/09/2026',
    status: 'completed',
    statusLabel: '⭐ Đã đánh giá 5 sao',
    statusColor: '#2563EB',
    statusBg: '#EFF6FF',
    sellerName: 'Lê Hoàng Yến',
    sellerCohort: 'K18 MKT',
    sellerCampus: 'TP.HCM (FPT Bus)',
    productTitle: 'Võ phục Vovinam FPT size M kèm đai',
    productPrice: 120000,
    productImage: require('../../../../assets/products/vovinam-uniform.jpg'),
    safePoint: 'Phòng QL KTX Dom A',
    isReviewed: true,
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-312984',
    date: '15/09/2026',
    status: 'disputed',
    statusLabel: '⚠️ Đang xử lý khiếu nại',
    statusColor: '#DC2626',
    statusBg: '#FEF2F2',
    sellerName: 'Phạm Đức Duy',
    sellerCohort: 'K16 GD',
    sellerCampus: 'Đà Nẵng',
    productTitle: 'Tai nghe Bluetooth Sony WH-CH510',
    productPrice: 350000,
    productImage: require('../../../../assets/products/books-mas291.jpg'),
    safePoint: 'Trạm Safe-Point KTX',
    isReviewed: false,
  },
];

export const OrderListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'all' | 'escrow' | 'completed' | 'disputed'>('all');

  const filteredOrders = MOCK_ORDERS.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'escrow') return item.status === 'escrow_holding';
    if (activeTab === 'completed') return item.status === 'completed';
    if (activeTab === 'disputed') return item.status === 'disputed';
    return true;
  });

  const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.cardHeader}>
        <View style={styles.orderCodeRow}>
          <Ionicons name="receipt-outline" size={16} color="#64748B" />
          <Text style={styles.orderCode}>{item.orderNumber}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
          <Text style={[styles.statusBadgeText, { color: item.statusColor }]}>
            {item.statusLabel}
          </Text>
        </View>
      </View>

      {/* Product Row */}
      <TouchableOpacity
        style={styles.cardBody}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('OrderDetail', {
            orderId: item.orderNumber,
            product: {
              title: item.productTitle,
              price: item.productPrice,
              priceStr: formatPrice(item.productPrice),
              image: item.productImage,
              sellerName: item.sellerName,
              sellerMajor: item.sellerCohort,
              sellerCampus: item.sellerCampus,
            },
            status: item.status,
            safePoint: item.safePoint,
            isReviewed: item.isReviewed,
          })
        }
      >
        <Image
          source={typeof item.productImage === 'string' ? { uri: item.productImage } : item.productImage}
          style={styles.productThumb}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.productTitle}
          </Text>
          <Text style={styles.sellerText}>Người bán: {item.sellerName} ({item.sellerCampus})</Text>
          <View style={styles.safePointRow}>
            <Ionicons name="location-outline" size={12} color="#059669" />
            <Text style={styles.safePointText}>{item.safePoint}</Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(item.productPrice)}</Text>
        </View>
      </TouchableOpacity>

      {/* Card Actions */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{item.date}</Text>

        <View style={styles.actionButtonsRow}>
          {item.status === 'escrow_holding' && (
            <TouchableOpacity
              style={styles.disputeBtn}
              onPress={() =>
                navigation.navigate('Dispute', {
                  orderId: item.orderNumber,
                  productTitle: item.productTitle,
                  sellerName: item.sellerName,
                  price: formatPrice(item.productPrice),
                })
              }
            >
              <Text style={styles.disputeBtnText}>Khiếu nại</Text>
            </TouchableOpacity>
          )}

          {item.status === 'completed' && !item.isReviewed && (
            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() =>
                navigation.navigate('Review', {
                  orderId: item.orderNumber,
                  productTitle: item.productTitle,
                  sellerName: item.sellerName,
                  productImage: item.productImage,
                })
              }
            >
              <Ionicons name="star" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.reviewBtnText}>Đánh giá ngay</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() =>
              navigation.navigate('OrderDetail', {
                orderId: item.orderNumber,
                product: {
                  title: item.productTitle,
                  price: item.productPrice,
                  priceStr: formatPrice(item.productPrice),
                  image: item.productImage,
                  sellerName: item.sellerName,
                  sellerMajor: item.sellerCohort,
                  sellerCampus: item.sellerCampus,
                },
                status: item.status,
                safePoint: item.safePoint,
                isReviewed: item.isReviewed,
              })
            }
          >
            <Text style={styles.detailBtnText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('MainTabs', { screen: 'Home' });
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng & Ký quỹ Escrow</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'escrow', label: '🛡️ Đang giữ Escrow' },
          { key: 'completed', label: 'Hoàn tất' },
          { key: 'disputed', label: 'Khiếu nại' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabBtnText, isActive && styles.activeTabBtnText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào trong mục này</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16.5, fontWeight: '800', color: '#0F172A' },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  activeTabBtn: { backgroundColor: '#EA580C' },
  tabBtnText: { fontSize: 11.5, fontWeight: '700', color: '#64748B' },
  activeTabBtnText: { color: '#FFFFFF' },
  listContent: { padding: 16, paddingBottom: 40 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    backgroundColor: '#FAFAFA',
  },
  orderCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderCode: { fontSize: 12.5, fontWeight: '800', color: '#475569' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },
  cardBody: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productThumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F1F5F9', marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  sellerText: { fontSize: 11, color: '#64748B', marginTop: 3 },
  safePointRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  safePointText: { fontSize: 10.5, color: '#059669', fontWeight: '600' },
  priceText: { fontSize: 14, fontWeight: '900', color: '#EA580C', marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateText: { fontSize: 11, color: '#94A3B8' },
  actionButtonsRow: { flexDirection: 'row', gap: 8 },
  disputeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  disputeBtnText: { fontSize: 11.5, fontWeight: '700', color: '#DC2626' },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EA580C',
  },
  reviewBtnText: { fontSize: 11.5, fontWeight: '800', color: '#FFFFFF' },
  detailBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  detailBtnText: { fontSize: 11.5, fontWeight: '700', color: '#475569' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 13, color: '#94A3B8', marginTop: 10 },
});

export default OrderListScreen;
