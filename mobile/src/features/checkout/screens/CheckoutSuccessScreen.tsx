import React, { useEffect, useState } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import paymentMobileService from '../../../services/paymentMobileService';
import { orderMobileService } from '../../../services/orderMobileService';
import { useOrderStore } from '../../../stores/orderStore';

export const CheckoutSuccessScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const fetchOrders = useOrderStore((state) => state.fetchOrders);

  const {
    orderId = '',
    orderCode = '',
    totalAmount = 0,
    itemPrice,
    agreedPrice,
    originalPrice,
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
    paymentPending = false,
    paymentCheckoutUrl = '',
  } = route.params || {};

  const displayItemPrice =
    typeof agreedPrice === 'number' && agreedPrice > 0
      ? agreedPrice
      : typeof itemPrice === 'number' && itemPrice > 0
      ? itemPrice
      : typeof product?.price === 'number' && product.price > 0
      ? product.price
      : totalAmount;

  const displayOriginalPrice =
    typeof originalPrice === 'number' && originalPrice > displayItemPrice
      ? originalPrice
      : typeof product?.originalPrice === 'number' && product.originalPrice > displayItemPrice
      ? product.originalPrice
      : undefined;

  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(!paymentPending);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  useEffect(() => {
    if (!paymentPending || isPaymentConfirmed || !orderCode) return;

    let isActive = true;
    const checkStatus = async () => {
      const status = await paymentMobileService.checkPaymentStatus(orderCode);
      if (isActive && status.isPaid) setIsPaymentConfirmed(true);
    };

    void checkStatus();
    const intervalId = setInterval(() => void checkStatus(), 4000);
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [isPaymentConfirmed, orderCode, paymentPending]);

  const handleRetryPayment = async () => {
    if (!paymentCheckoutUrl) return;
    try {
      await WebBrowser.openBrowserAsync(paymentCheckoutUrl);
      const status = await paymentMobileService.checkPaymentStatus(orderCode);
      if (status.isPaid) setIsPaymentConfirmed(true);
    } catch (error) {
      console.error('Could not reopen PayOS checkout', error);
      Alert.alert('Không mở được PayOS', 'Vui lòng thử lại hoặc hủy đơn để tạo đơn mới.');
    }
  };

  const handleCancelOrder = () => {
    if (!orderId || isCancellingOrder) return;
    Alert.alert('Hủy đơn hàng?', 'PayOS và đơn hàng sẽ được hủy; sản phẩm, xu và voucher sẽ được trả lại.', [
      { text: 'Giữ đơn', style: 'cancel' },
      {
        text: 'Hủy đơn',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsCancellingOrder(true);
            await orderMobileService.cancelOrder(orderId, 'Người mua hủy thanh toán PayOS');
            await fetchOrders();
            navigation.navigate('OrderList');
          } catch (error: any) {
            Alert.alert('Chưa hủy được đơn', error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại sau.');
          } finally {
            setIsCancellingOrder(false);
          }
        },
      },
    ]);
  };

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
        <Text style={styles.headerTitle}>
          {isDifferentCampus ? 'Vận Đơn Liên Campus' : 'Vé Nhận Hàng Escrow'}
        </Text>
        {!isDifferentCampus ? (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareTicket}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="share-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Banner Success */}
        <View style={styles.successBanner}>
          <View style={[styles.checkCircle, paymentPending && !isPaymentConfirmed && styles.pendingCircle]}>
            <Ionicons name={paymentPending && !isPaymentConfirmed ? 'time-outline' : 'checkmark'} size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>
            {paymentPending && !isPaymentConfirmed ? 'Đơn hàng đang chờ PayOS xác nhận' : isDifferentCampus ? 'Đã Tạo Đơn Hàng Liên Campus!' : 'Đặt Hàng & Cọc Tiền Thành Công!'}
          </Text>
          <Text style={styles.successSub}>
            {paymentPending && !isPaymentConfirmed
              ? 'Thanh toán chỉ được xác nhận sau khi backend nhận webhook hợp lệ từ PayOS. Màn hình sẽ tự cập nhật khi giao dịch hoàn tất.'
              : isDifferentCampus
              ? <>Đơn hàng liên Campus đã được khởi tạo thành công. Người bán sẽ chuyển hàng qua xe FPT Bus / GHN và bạn sẽ nhận hàng, đồng kiểm 48h tại sảnh KTX {toCampus}.</>
              : <>Tiền của bạn đã được chuyển vào quỹ ký quỹ <Text style={styles.boldText}>Escrow FPT Market</Text>. Người bán sẽ chỉ nhận được tiền sau khi bạn kiểm tra và xác nhận hàng ưng ý.</>}
          </Text>
        </View>

        {paymentPending && !isPaymentConfirmed && (
          <View style={styles.pendingActions}>
            {!!paymentCheckoutUrl && (
              <TouchableOpacity style={styles.retryPaymentButton} onPress={handleRetryPayment}>
                <Text style={styles.retryPaymentText}>Mở lại PayOS để thanh toán</Text>
              </TouchableOpacity>
            )}
            {!!orderId && (
              <TouchableOpacity style={styles.cancelPaymentButton} onPress={handleCancelOrder} disabled={isCancellingOrder}>
                <Text style={styles.cancelPaymentText}>{isCancellingOrder ? 'Đang hủy đơn...' : 'Hủy đơn và trả sản phẩm'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Digital Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <View style={styles.ticketBrand}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>FPT</Text>
              </View>
              <Text style={styles.ticketBrandTitle}>
                {isDifferentCampus ? 'VẬN ĐƠN CAMPUS SHIP' : 'CAMPUS SAFE PASS'}
              </Text>
            </View>
            <View style={styles.ticketOrderCodeBox}>
              <Text style={styles.ticketOrderLabel}>MÃ ĐƠN HÀNG</Text>
              <Text style={styles.ticketOrderCode}>#{orderCode}</Text>
            </View>
          </View>

          {/* QR Code Presentation - CHỈ HIỂN THỊ KHI GIAO DỊCH CÙNG CAMPUS GẶP TRỰC TIẾP TẠI SAFE-POINT */}
          {!isDifferentCampus ? (
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
          ) : (
            <View style={styles.shippingBusSection}>
              <View style={styles.shippingBusIconBox}>
                <Ionicons name="bus" size={44} color="#7C3AED" />
              </View>
              <Text style={styles.shippingBusTitle}>Vận Đơn Tuyến Xe FPT Bus</Text>
              <Text style={styles.shippingBusRoute}>
                {fromCampus} ➔ {toCampus}
              </Text>
              <Text style={styles.shippingBusDesc}>
                Đơn hàng luân chuyển qua xe bus nội bộ giữa các Campus FPT. Không cần gặp mặt trực tiếp, bưu tá sẽ giao đến sảnh KTX của bạn kèm tem niêm phong an toàn.
              </Text>
            </View>
          )}

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
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                  <Text style={styles.productPrice}>{formatPrice(displayItemPrice)}</Text>
                  {displayOriginalPrice ? (
                    <Text style={{ fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '600' }}>
                      {formatPrice(displayOriginalPrice)}
                    </Text>
                  ) : null}
                  {displayOriginalPrice ? (
                    <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#15803D' }}>Giá thương lượng</Text>
                    </View>
                  ) : null}
                </View>
                {totalAmount > 0 && totalAmount !== displayItemPrice ? (
                  <Text style={{ fontSize: 11.5, color: '#475569', fontWeight: '600', marginTop: 2 }}>
                    Tổng thanh toán: <Text style={{ color: '#EA580C', fontWeight: '800' }}>{formatPrice(totalAmount)}</Text>
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Safe Point / KTX Receiving Box */}
            <View style={styles.safePointBox}>
              <View style={styles.safePointIconWrap}>
                <Ionicons name={isDifferentCampus ? 'business' : 'location'} size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.safePointTitle}>
                  {isDifferentCampus ? 'Địa chỉ KTX nhận hàng' : 'Điểm hẹn giao nhận'}
                </Text>
                <Text style={styles.safePointDesc}>{safePoint}</Text>
                <View style={styles.safePointMeta}>
                  <View style={styles.safeTag}>
                    <Ionicons name={isDifferentCampus ? 'shield-checkmark' : 'videocam'} size={11} color="#059669" />
                    <Text style={styles.safeTagText}>
                      {isDifferentCampus ? 'Tem Seal niêm phong' : 'Camera an ninh 24/7'}
                    </Text>
                  </View>
                  <View style={styles.safeTag}>
                    <Ionicons name="time" size={11} color="#059669" />
                    <Text style={styles.safeTagText}>{timeSlot}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Escrow Assurance Notice */}
            <View style={styles.assuranceBox}>
              <Ionicons name="shield-checkmark" size={16} color="#0284C7" style={{ marginTop: 1 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.assuranceTitle}>
                  {isDifferentCampus ? 'Chính sách đồng kiểm 48 Giờ (Liên Campus)' : 'Chính sách bao test 24 Giờ'}
                </Text>
                <Text style={styles.assuranceSub}>
                  {isDifferentCampus
                    ? 'Đơn liên Campus không dùng mã QR/OTP trực tiếp. Bạn có 48h kể từ khi nhận kiện hàng tại KTX để mở hộp kiểm tra và dùng thử trước khi hệ thống giải ngân cho người bán.'
                    : 'Bạn có 24h kể từ khi quét mã nhận đồ để dùng thử. Nếu sản phẩm lỗi hoặc không đúng mô tả, hãy bấm nút "Khiếu nại" để hệ thống hoàn trả 100% tiền cọc.'}
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
                  <Text style={styles.interCampusRouteText} numberOfLines={1} ellipsizeMode="tail">
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
          <Ionicons name="home-outline" size={18} color="#E2E8F0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            navigation.navigate('ChatDetail', {
              product,
              partner: {
                name: product.sellerName,
              },
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubbles-outline" size={16} color="#EA580C" style={{ marginRight: 4 }} />
          <Text style={styles.chatBtnText}>Khung chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() =>
            navigation.navigate('OrderDetail', {
              orderId: orderCode || orderId,
              orderDbId: orderId,
              product: {
                ...product,
                price: displayItemPrice,
                priceStr: formatPrice(displayItemPrice),
              },
              status: 'escrow_holding',
              safePoint,
              isDifferentCampus,
              totalAmount,
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="receipt-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.detailBtnText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  pendingActions: {
    gap: 10,
    marginBottom: 16,
  },
  retryPaymentButton: {
    borderRadius: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    alignItems: 'center',
  },
  retryPaymentText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelPaymentButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelPaymentText: {
    color: '#475569',
    fontWeight: '700',
  },
  pendingCircle: {
    backgroundColor: '#D97706',
    boxShadow: '0 6px 10px rgba(217, 119, 6, 0.35)',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  boldText: {
    color: '#059669',
    fontWeight: '800',
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
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
    gap: 6,
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
    flexShrink: 0,
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
    flexShrink: 1,
    textAlign: 'right',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
  },
  homeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 12,
    height: 48,
  },
  chatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  detailBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 12,
    height: 48,
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shippingBusSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  shippingBusIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shippingBusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B21B6',
    marginBottom: 4,
  },
  shippingBusRoute: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  shippingBusDesc: {
    fontSize: 12,
    color: '#6D28D9',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CheckoutSuccessScreen;
