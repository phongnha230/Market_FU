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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export const CheckoutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Params passed from ProductDetail
  const product = route.params?.product || {
    id: 'prod-escrow-1',
    title: 'Màn hình Dell 24" UltraSharp U2419H',
    price: 1450000,
    priceStr: '1.450.000đ',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
    sellerName: 'Nguyễn Văn Nam',
    sellerMajor: 'K16 - Kỹ thuật phần mềm',
    sellerCampus: 'TP. Hồ Chí Minh',
    isDifferentCampus: true,
  };

  const isDifferentCampus = route.params?.isDifferentCampus ?? true;

  const [selectedSafePoint, setSelectedSafePoint] = useState(
    isDifferentCampus ? 'Sảnh KTX Dom A (Cơ sở Hòa Lạc - Nhận từ FPT Bus)' : 'Sảnh Tòa Alpha (Trạm Safe-Point có camera)'
  );
  const [selectedPayment, setSelectedPayment] = useState<'fptpay' | 'vietqr' | 'momo'>('fptpay');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>({
    code: 'FPTK20WELCOME',
    discount: 30000,
  });

  const basePrice = typeof product.price === 'number' ? product.price : 1450000;
  const shippingFee = isDifferentCampus ? 30000 : 0;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalAmount = Math.max(0, basePrice + shippingFee - discountAmount);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + 'đ';
  };

  const handleConfirmPayment = () => {
    Alert.alert(
      '🎉 Đặt cọc Escrow thành công!',
      `Đã thanh toán an toàn ${formatCurrency(totalAmount)}.\nSố tiền được giữ bảo lãnh tại hệ thống. Mã hẹn Safe-Point đã được tạo.`,
      [
        {
          text: 'Xem đơn hàng ngay',
          onPress: () => {
            navigation.replace('OrderDetail', {
              orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
              product: {
                ...product,
                price: basePrice,
                priceStr: formatCurrency(basePrice),
              },
              status: 'escrow_holding',
              totalAmount,
            });
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Thanh toán & Ký quỹ Escrow</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Escrow Guarantee Banner */}
        <View style={styles.escrowBanner}>
          <Ionicons name="shield-checkmark" size={24} color="#059669" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.escrowTitle}>FPT Campus Escrow Protection</Text>
            <Text style={styles.escrowSub}>
              Tiền của bạn được giữ an toàn tại hệ thống trường. Người bán CHỈ nhận được tiền khi bạn bấm "Đã nhận hàng thành công" tại trạm Safe-Point.
            </Text>
          </View>
        </View>

        {/* Product Card */}
        <Text style={styles.sectionHeader}>SẢN PHẨM GIAO DỊCH</Text>
        <View style={styles.productCard}>
          <Image
            source={typeof product.image === 'string' ? { uri: product.image } : product.image}
            style={styles.productThumb}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {product.title}
            </Text>
            <View style={styles.sellerRow}>
              <Ionicons name="person-circle-outline" size={14} color="#64748B" />
              <Text style={styles.sellerText}>Người bán: {product.sellerName || 'Nam NV'}</Text>
            </View>
            <View style={styles.campusBadgeRow}>
              <View style={[styles.campusBadge, isDifferentCampus && styles.diffCampusBadge]}>
                <Text style={[styles.campusBadgeText, isDifferentCampus && styles.diffCampusBadgeText]}>
                  {product.sellerCampus || 'Campus khác'}
                </Text>
              </View>
              {isDifferentCampus && (
                <Text style={styles.interCampusHint}>⚡ Ship xe FPT Bus 24h</Text>
              )}
            </View>
            <Text style={styles.productPrice}>{formatCurrency(basePrice)}</Text>
          </View>
        </View>

        {/* Safe-Handoff Point */}
        <Text style={styles.sectionHeader}>ĐIỂM NHẬN HÀNG SAFE-POINT</Text>
        <View style={styles.cardGroup}>
          <View style={styles.safePointBox}>
            <View style={styles.safePointIconBg}>
              <Ionicons name="location" size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.safePointTitle}>Điểm bàn giao có Camera giám sát</Text>
              <Text style={styles.safePointSub}>{selectedSafePoint}</Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Chọn trạm Safe-Point',
                  'Chọn vị trí gần bạn nhất:\n1. Sảnh Tòa Alpha\n2. Sảnh Beta KTX\n3. Thư viện tầng 1',
                  [
                    { text: 'Sảnh Tòa Alpha', onPress: () => setSelectedSafePoint('Sảnh Tòa Alpha (Camera 24/7)') },
                    { text: 'Sảnh Beta KTX', onPress: () => setSelectedSafePoint('Sảnh Beta KTX (Có bảo vệ trực)') },
                    { text: 'Đóng', style: 'cancel' },
                  ]
                )
              }
            >
              <Text style={styles.changeBtnText}>Thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionHeader}>PHƯƠNG THỨC THANH TOÁN</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity
            style={[styles.payRow, selectedPayment === 'fptpay' && styles.selectedPayRow]}
            activeOpacity={0.7}
            onPress={() => setSelectedPayment('fptpay')}
          >
            <View style={[styles.payIconBox, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="wallet-outline" size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.payTitle}>Ví FPT Pay Sinh viên</Text>
                <View style={styles.recBadge}>
                  <Text style={styles.recBadgeText}>Khuyên dùng</Text>
                </View>
              </View>
              <Text style={styles.paySub}>Số dư khả dụng: 2.850.000đ (Miễn phí rút/nạp)</Text>
            </View>
            <Ionicons
              name={selectedPayment === 'fptpay' ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={selectedPayment === 'fptpay' ? '#EA580C' : '#CBD5E1'}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.payRow, selectedPayment === 'vietqr' && styles.selectedPayRow]}
            activeOpacity={0.7}
            onPress={() => setSelectedPayment('vietqr')}
          >
            <View style={[styles.payIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="qr-code-outline" size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payTitle}>Chuyển khoản VietQR / App Ngân hàng</Text>
              <Text style={styles.paySub}>Quét mã QR tự động xác thực trong 3 giây</Text>
            </View>
            <Ionicons
              name={selectedPayment === 'vietqr' ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={selectedPayment === 'vietqr' ? '#EA580C' : '#CBD5E1'}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.payRow, selectedPayment === 'momo' && styles.selectedPayRow]}
            activeOpacity={0.7}
            onPress={() => setSelectedPayment('momo')}
          >
            <View style={[styles.payIconBox, { backgroundColor: '#FDF2F8' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#DB2777" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payTitle}>Ví MoMo / ZaloPay</Text>
              <Text style={styles.paySub}>Liên kết ví điện tử thanh toán tức thì</Text>
            </View>
            <Ionicons
              name={selectedPayment === 'momo' ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={selectedPayment === 'momo' ? '#EA580C' : '#CBD5E1'}
            />
          </TouchableOpacity>
        </View>

        {/* Voucher */}
        <Text style={styles.sectionHeader}>MÃ GIẢM GIÁ / VOUCHER</Text>
        <View style={styles.voucherCard}>
          <Ionicons name="ticket" size={20} color="#EA580C" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.voucherCode}>Mã: FPTK20WELCOME</Text>
            <Text style={styles.voucherDesc}>Giảm 30.000đ cho sinh viên FPT</Text>
          </View>
          <View style={styles.appliedBadge}>
            <Text style={styles.appliedText}>Đã áp dụng</Text>
          </View>
        </View>

        {/* Payment Summary */}
        <Text style={styles.sectionHeader}>CHI TIẾT THANH TOÁN</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền hàng</Text>
            <Text style={styles.summaryVal}>{formatCurrency(basePrice)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển {isDifferentCampus ? '(FPT Bus liên Campus)' : '(Safe-Point)'}</Text>
            <Text style={styles.summaryVal}>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí bảo lãnh ký quỹ Escrow</Text>
            <Text style={[styles.summaryVal, { color: '#059669', fontWeight: '700' }]}>Miễn phí (Tài trợ 100%)</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá voucher</Text>
              <Text style={[styles.summaryVal, { color: '#EA580C', fontWeight: '700' }]}>
                -{formatCurrency(discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền thanh toán</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomTotalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.bottomTotalPrice}>{formatCurrency(totalAmount)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.88}
          onPress={handleConfirmPayment}
        >
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.payBtnText}>Đặt cọc Escrow</Text>
        </TouchableOpacity>
      </View>
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
  scrollBody: { paddingHorizontal: 16, paddingBottom: 100 },
  escrowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  escrowTitle: { fontSize: 13.5, fontWeight: '800', color: '#065F46' },
  escrowSub: { fontSize: 11.5, color: '#047857', marginTop: 2, lineHeight: 17 },
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
  productThumb: { width: 75, height: 75, borderRadius: 10, backgroundColor: '#F1F5F9', marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  sellerText: { fontSize: 11, color: '#64748B' },
  campusBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  campusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  campusBadgeText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  diffCampusBadge: { backgroundColor: '#F5F3FF' },
  diffCampusBadgeText: { color: '#7C3AED' },
  interCampusHint: { fontSize: 10, fontWeight: '700', color: '#EA580C' },
  productPrice: { fontSize: 14.5, fontWeight: '900', color: '#EA580C', marginTop: 4 },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  safePointBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  safePointIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  safePointTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  safePointSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },
  changeBtnText: { fontSize: 12, fontWeight: '700', color: '#EA580C', marginLeft: 8 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  selectedPayRow: { backgroundColor: '#FFFDFB' },
  payIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  payTitle: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  paySub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  recBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  recBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#059669' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  voucherCode: { fontSize: 13, fontWeight: '800', color: '#9A3412' },
  voucherDesc: { fontSize: 11, color: '#C2410C', marginTop: 1 },
  appliedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  appliedText: { fontSize: 10.5, fontWeight: '700', color: '#059669' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: { fontSize: 12.5, color: '#64748B' },
  summaryVal: { fontSize: 12.5, color: '#0F172A', fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  totalAmount: { fontSize: 17, fontWeight: '900', color: '#EA580C' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPriceCol: { justifyContent: 'center' },
  bottomTotalLabel: { fontSize: 11, color: '#64748B' },
  bottomTotalPrice: { fontSize: 17, fontWeight: '900', color: '#EA580C' },
  payBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingHorizontal: 20,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default CheckoutScreen;
