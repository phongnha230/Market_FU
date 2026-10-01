import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export const OrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId || 'ORD-882194';
  const product = route.params?.product || {
    title: 'Màn hình Dell 24" UltraSharp U2419H',
    price: 1450000,
    priceStr: '1.450.000đ',
    image: require('../../../../assets/products/monitor-dell-24.jpg'),
    sellerName: 'Nguyễn Văn Nam',
    sellerMajor: 'K16 - SE',
    sellerCampus: 'Hòa Lạc',
  };

  const [orderStatus, setOrderStatus] = useState<string>(
    route.params?.status || 'escrow_holding'
  );
  const [isReviewed, setIsReviewed] = useState<boolean>(route.params?.isReviewed || false);

  const safePoint = route.params?.safePoint || 'Sảnh Tòa Alpha (Trạm Camera 24/7)';

  const handleConfirmReceived = () => {
    Alert.alert(
      'Xác nhận đã nhận hàng',
      'Bạn đã kiểm tra hàng tại Safe-Point và đồng ý giải ngân tiền cho người bán?',
      [
        { text: 'Kiểm tra thêm', style: 'cancel' },
        {
          text: 'Xác nhận & Giải ngân',
          onPress: () => {
            setOrderStatus('completed');
            Alert.alert(
              '🎉 Giao dịch hoàn tất!',
              'Hệ thống đã giải ngân tiền cọc Escrow cho người bán. Bạn có muốn đánh giá trải nghiệm để cộng điểm uy tín Campus không?',
              [
                { text: 'Để sau', style: 'cancel' },
                {
                  text: 'Đánh giá ngay',
                  onPress: () =>
                    navigation.navigate('Review', {
                      orderId,
                      productTitle: product.title,
                      sellerName: product.sellerName,
                      productImage: product.image,
                    }),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleOpenChat = () => {
    navigation.navigate('ChatDetail', {
      partner: {
        name: product.sellerName || 'Người bán',
        cohort: product.sellerMajor || 'Sinh viên FPT',
        isOnline: true,
      },
      product: {
        title: product.title,
        price: product.priceStr || '1.450.000đ',
        image: product.image,
      },
    });
  };

  const handleOpenDispute = () => {
    navigation.navigate('Dispute', {
      orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      price: product.priceStr || '1.450.000đ',
    });
  };

  const handleOpenReview = () => {
    navigation.navigate('Review', {
      orderId,
      productTitle: product.title,
      sellerName: product.sellerName,
      productImage: product.image,
    });
  };

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
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <Text style={styles.headerOrderId}>{orderId}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="home-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenChat} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#EA580C" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Status Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View style={styles.escrowTag}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.escrowTagText}>Bảo lãnh Escrow FPT</Text>
            </View>
            <Text style={styles.statusName}>
              {orderStatus === 'escrow_holding'
                ? 'Đang giữ tiền Escrow'
                : orderStatus === 'completed'
                ? 'Đã hoàn tất & Giải ngân'
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

        {/* Product Details */}
        <Text style={styles.sectionHeader}>THÔNG TIN SẢN PHẨM</Text>
        <View style={styles.productCard}>
          <Image
            source={typeof product.image === 'string' ? { uri: product.image } : product.image}
            style={styles.productThumb}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <Text style={styles.sellerText}>
              Người bán: {product.sellerName || 'Trần Quân'} ({product.sellerCampus || 'Hòa Lạc'})
            </Text>
            <Text style={styles.productPrice}>{product.priceStr || '1.450.000đ'}</Text>
          </View>
        </View>

        {/* Safe-Handoff QR & Info */}
        <Text style={styles.sectionHeader}>ĐIỂM HẸN & MÃ QR ĐỒNG KIỂM</Text>
        <View style={styles.safePointCard}>
          <View style={styles.safePointHeader}>
            <Ionicons name="location" size={20} color="#EA580C" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.safePointName}>{safePoint}</Text>
              <Text style={styles.safePointNotice}>
                Điểm giao dịch có camera AI giám sát 24/7 của Nhà trường
              </Text>
            </View>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code" size={130} color="#0F172A" />
            </View>
            <Text style={styles.qrCodeLabel}>MÃ HẸN BÀN GIAO: #{orderId}</Text>
            <Text style={styles.qrCodeHint}>
              Đưa mã này cho người bán hoặc bảo vệ tại Safe-Point quét khi nhận hàng
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {orderStatus === 'escrow_holding' && (
            <TouchableOpacity
              style={styles.confirmReceivedBtn}
              activeOpacity={0.88}
              onPress={handleConfirmReceived}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.confirmReceivedText}>Đã nhận hàng (Giải ngân Escrow)</Text>
            </TouchableOpacity>
          )}

          {orderStatus === 'completed' && !isReviewed && (
            <TouchableOpacity
              style={styles.reviewMainBtn}
              activeOpacity={0.88}
              onPress={handleOpenReview}
            >
              <Ionicons name="star" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.reviewMainText}>Đánh giá người bán ngay</Text>
            </TouchableOpacity>
          )}

          <View style={styles.subActionRow}>
            <TouchableOpacity
              style={styles.chatActionBtn}
              activeOpacity={0.8}
              onPress={handleOpenChat}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#0F172A" style={{ marginRight: 4 }} />
              <Text style={styles.chatActionText}>Nhắn tin người bán</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.disputeActionBtn}
              activeOpacity={0.8}
              onPress={handleOpenDispute}
            >
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" style={{ marginRight: 4 }} />
              <Text style={styles.disputeActionText}>Khiếu nại / Hoàn tiền</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerOrderId: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
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
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productThumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#F1F5F9', marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  sellerText: { fontSize: 11, color: '#64748B', marginTop: 3 },
  productPrice: { fontSize: 14, fontWeight: '900', color: '#EA580C', marginTop: 4 },
  safePointCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safePointHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  safePointName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  safePointNotice: { fontSize: 11, color: '#64748B', marginTop: 2 },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeLabel: { fontSize: 12.5, fontWeight: '900', color: '#0F172A', marginTop: 10 },
  qrCodeHint: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 4 },
  actionContainer: { marginTop: 20, gap: 10 },
  confirmReceivedBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmReceivedText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  reviewMainBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  reviewMainText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  subActionRow: { flexDirection: 'row', gap: 10 },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatActionText: { fontSize: 12.5, fontWeight: '700', color: '#0F172A' },
  disputeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  disputeActionText: { fontSize: 12.5, fontWeight: '700', color: '#DC2626' },
});

export default OrderDetailScreen;
