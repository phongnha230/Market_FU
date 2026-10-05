import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';

export const CheckoutSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    orderCode = '',
    totalAmount = 0,
    product = {
      title: 'Đơn hàng mới',
      sellerName: 'Người bán FPT',
      sellerCohort: '',
      image: undefined,
    },
    safePoint = 'Trạm Safe-Point Campus',
    handshakeOtp = '----',
    timeSlot = 'Hôm nay',
    isDifferentCampus = false,
    fromCampus = 'Cơ sở gửi',
    toCampus = 'Cơ sở nhận',
  } = route.params || {};

  const [copiedOtp, setCopiedOtp] = useState(false);

  const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  const handleCopyOtp = () => {
    setCopiedOtp(true);
    Alert.alert('📋 Đã sao chép mã OTP', `Mã Handshake: ${handshakeOtp}\nHãy đưa mã này cho Người bán khi nhận hàng.`);
    setTimeout(() => setCopiedOtp(false), 3000);
  };

  const handleShareTicket = async () => {
    try {
      await Share.share({
        message: `[Campus Market] Vé giao nhận đồ an toàn:\nĐơn hàng: #${orderCode}\nMón đồ: ${product.title}\nĐịa điểm hẹn: ${safePoint}\nMã OTP: ${handshakeOtp}`,
      });
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vé Nhận Hàng Escrow</Text>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShareTicket}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="share-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Banner Success */}
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Đặt Hàng & Cọc Tiền Thành Công!</Text>
          <Text style={styles.successSub}>
            Tiền của bạn đã được chuyển vào quỹ ký quỹ <Text style={styles.boldText}>Escrow FPT Market</Text>. Người bán sẽ chỉ nhận được tiền sau khi bạn kiểm tra và xác nhận hàng ưng ý.
          </Text>
        </View>

        {/* Digital Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketBrand}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>FPT</Text>
              </View>
              <Text style={styles.ticketBrandTitle}>CAMPUS SAFE PASS</Text>
            </View>
            <View style={styles.ticketOrderCodeBox}>
              <Text style={styles.ticketOrderLabel}>MÃ ĐƠN HÀNG</Text>
              <Text style={styles.ticketOrderCode}>#{orderCode}</Text>
            </View>
          </View>

          {/* QR Code Presentation */}
          <View style={styles.qrSection}>
            <Text style={styles.qrInstruction}>
              Đưa mã QR này cho Người bán quét tại Safe-Point
            </Text>

            <View style={styles.qrFrame}>
              {/* Giả lập khung QR sắc nét phong cách vé điện tử */}
              <View style={styles.qrCorners}>
                <Ionicons name="qr-code" size={180} color="#0F172A" />
              </View>
              <View style={styles.qrShieldBadge}>
                <Ionicons name="shield-checkmark" size={24} color="#EA580C" />
              </View>
            </View>

            {/* OTP Code Display */}
            <View style={styles.otpBox}>
              <Text style={styles.otpLabel}>HOẶC ĐỌC MÃ XÁC THỰC OTP</Text>
              <View style={styles.otpDigitRow}>
                {['slot-1', 'slot-2', 'slot-3', 'slot-4'].map((slotId, slotIdx) => (
                  <View key={slotId} style={styles.otpDigitBox}>
                    <Text style={styles.otpDigitText}>{handshakeOtp[slotIdx] || ''}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.copyOtpBtn}
                onPress={handleCopyOtp}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copiedOtp ? 'checkmark-circle' : 'copy-outline'}
                  size={14}
                  color={copiedOtp ? '#059669' : '#EA580C'}
                />
                <Text style={[styles.copyOtpText, copiedOtp && { color: '#059669' }]}>
                  {copiedOtp ? 'Đã chép OTP' : 'Sao chép mã'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Perforated Divider */}
          <View style={styles.perforatedLine}>
            <View style={styles.perforatedHoleLeft} />
            <View style={styles.dashedBorder} />
            <View style={styles.perforatedHoleRight} />
          </View>

          {/* Ticket Body: Item & Location */}
          <View style={styles.ticketBody}>
            {/* Product summary */}
            <View style={styles.productRow}>
              <Image
                source={
                  typeof product.image === 'string'
                    ? { uri: product.image }
                    : product.image
                }
                style={styles.productThumb}
                contentFit="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.title}
                </Text>
                <Text style={styles.productSeller}>
                  Người bán: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{product.sellerName}</Text>
                </Text>
                <Text style={styles.productPrice}>{formatPrice(totalAmount)}</Text>
              </View>
            </View>

            {/* Safe Point Box */}
            <View style={styles.safePointBox}>
              <View style={styles.safePointIconWrap}>
                <Ionicons name="location" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.safePointTitle}>Điểm hẹn giao nhận</Text>
                <Text style={styles.safePointDesc}>{safePoint}</Text>
                <View style={styles.safePointMeta}>
                  <View style={styles.safeTag}>
                    <Ionicons name="videocam" size={11} color="#059669" />
                    <Text style={styles.safeTagText}>Camera an ninh 24/7</Text>
                  </View>
                  <View style={styles.safeTag}>
                    <Ionicons name="time" size={11} color="#059669" />
                    <Text style={styles.safeTagText}>{timeSlot}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Escrow 24h Assurance Notice */}
            <View style={styles.assuranceBox}>
              <Ionicons name="shield-checkmark" size={16} color="#0284C7" style={{ marginTop: 1 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.assuranceTitle}>Chính sách bao test 24 Giờ</Text>
                <Text style={styles.assuranceSub}>
                  Bạn có 24h kể từ khi quét mã nhận đồ để dùng thử. Nếu sản phẩm lỗi hoặc không đúng mô tả, hãy bấm nút "Khiếu nại" để hệ thống hoàn trả 100% tiền cọc.
                </Text>
              </View>
            </View>

            {/* Inter-Campus Escrow Delivery Card */}
            {isDifferentCampus && (
              <View style={styles.interCampusBox}>
                <View style={styles.interCampusTopRow}>
                  <View style={styles.interCampusBadge}>
                    <Ionicons name="bus" size={13} color="#7C3AED" />
                    <Text style={styles.interCampusBadgeText}>VẬN ĐƠN LIÊN CAMPUS</Text>
                  </View>
                  <Text style={styles.interCampusRouteText}>
                    {fromCampus} ➔ {toCampus}
                  </Text>
                </View>
                <Text style={styles.interCampusDesc}>
                  Hàng được gửi qua chuyến xe FPT Bus nội bộ có dán mã niêm phong Seal chống tháo gỡ.
                </Text>
                <TouchableOpacity
                  style={styles.interCampusBtn}
                  onPress={() =>
                    navigation.navigate('InterCampusTransaction', {
                      orderId: orderCode,
                      product,
                      fromCampus,
                      toCampus,
                    })
                  }
                  activeOpacity={0.85}
                >
                  <Ionicons name="shield-checkmark" size={15} color="#7C3AED" />
                  <Text style={styles.interCampusBtnText}>Theo dõi hành trình xe & Tem Seal</Text>
                  <Ionicons name="arrow-forward" size={14} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar in Thumb Zone */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.8}
        >
          <Ionicons name="home-outline" size={18} color="#475569" />
          <Text style={styles.homeBtnText}>Về trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() =>
            navigation.navigate('OrderDetail', {
              orderId: orderCode,
              product,
              status: 'escrow_holding',
              safePoint,
              totalAmount,
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="receipt-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.detailBtnText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark luxurious backdrop to make ticket pop
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  successBanner: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  checkCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    boxShadow: '0 6px 10px rgba(5, 150, 105, 0.4)',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  boldText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 10px 16px rgba(0, 0, 0, 0.25)',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ticketBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  ticketBrandTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  ticketOrderCodeBox: {
    alignItems: 'flex-end',
  },
  ticketOrderLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  ticketOrderCode: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  qrInstruction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrFrame: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCorners: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrShieldBadge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
  otpBox: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  otpLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  otpDigitRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  otpDigitBox: {
    width: 38,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigitText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  copyOtpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  copyOtpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  perforatedLine: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
  },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginHorizontal: 16,
  },
  perforatedHoleLeft: {
    position: 'absolute',
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  perforatedHoleRight: {
    position: 'absolute',
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
  },
  ticketBody: {
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productThumb: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  productSeller: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#EA580C',
  },
  safePointBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 10,
  },
  safePointIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safePointTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  safePointDesc: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  safePointMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  safeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  safeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  assuranceBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  assuranceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  assuranceSub: {
    fontSize: 11,
    color: '#0284C7',
    lineHeight: 16,
  },
  interCampusBox: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  interCampusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  interCampusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  interCampusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7C3AED',
  },
  interCampusRouteText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B21A8',
  },
  interCampusDesc: {
    fontSize: 11.5,
    color: '#6B21A8',
    lineHeight: 16,
    marginBottom: 10,
  },
  interCampusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  interCampusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  homeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155',
  },
  homeBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  detailBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 12,
    height: 48,
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  detailBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CheckoutSuccessScreen;
