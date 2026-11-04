import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderSafePointQrCardProps {
  safePoint: string;
  orderId: string;
  orderCode?: string;
  timeSlot?: string;
  note?: string;
  isConfirmed?: boolean;
  isSeller?: boolean;
  handshakeOtp?: string;
  handshakeToken?: string;
}

export const OrderSafePointQrCard: React.FC<OrderSafePointQrCardProps> = React.memo(({
  safePoint,
  orderId,
  orderCode,
  timeSlot,
  note,
  isConfirmed = true,
  isSeller = false,
  handshakeOtp,
  handshakeToken,
}) => {
  const [loading, setLoading] = useState(true);

  // Sinh hoặc lấy OTP 4 số đảm bảo không bao giờ bị rỗng
  const effectiveOtp = handshakeOtp || (orderId
    ? Math.abs(
        orderId.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 1234) % 9000 + 1000
      ).toString()
    : '1293');

  // Payload chuẩn chứa type, orderId, orderCode, otp và token
  const qrPayload = JSON.stringify({
    type: 'SAFE_HANDOFF',
    orderId: orderId,
    orderCode: orderCode || orderId,
    otp: effectiveOtp,
    token: handshakeToken || undefined,
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    qrPayload
  )}&margin=8&color=0f172a`;

  return (
    <View style={styles.safePointCard}>
      {/* 1. Safe-Point Location Header */}
      <View style={styles.safePointHeader}>
        <View style={styles.locationIconWrap}>
          <Ionicons name="location" size={20} color="#EA580C" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.safePointName}>{safePoint}</Text>
          <Text style={styles.safePointNotice}>
            Điểm giao dịch có camera AI giám sát 24/7 của Nhà trường
          </Text>
        </View>
      </View>

      {/* 2. Scheduled Appointment Time Slot Banner */}
      <View style={[styles.appointmentBox, isConfirmed ? styles.appointmentBoxConfirmed : styles.appointmentBoxPending]}>
        <View style={styles.appointmentHeaderRow}>
          <View style={styles.appointmentIconTitle}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={isConfirmed ? '#059669' : '#D97706'}
            />
            <Text style={[styles.appointmentTitle, { color: isConfirmed ? '#065F46' : '#92400E' }]} numberOfLines={1}>
              LỊCH HẸN BÀN GIAO
            </Text>
          </View>
          <View style={[styles.statusPill, isConfirmed ? styles.statusPillConfirmed : styles.statusPillPending]}>
            <Ionicons
              name={isConfirmed ? 'checkmark-circle' : 'hourglass-outline'}
              size={12}
              color={isConfirmed ? '#059669' : '#D97706'}
            />
            <Text style={[styles.statusPillText, { color: isConfirmed ? '#059669' : '#D97706' }]} numberOfLines={1}>
              {isConfirmed ? 'Đã chốt hẹn' : 'Chờ xác nhận'}
            </Text>
          </View>
        </View>

        <Text style={styles.appointmentTimeText}>
          {timeSlot || '16:30 - 17:15 (Chiều ca 4) • Hôm nay'}
        </Text>

        {!!note && (
          <View style={styles.noteRow}>
            <Ionicons name="chatbox-ellipses-outline" size={13} color="#64748B" style={{ marginTop: 2 }} />
            <Text style={styles.noteText}>
              <Text style={styles.noteLabel}>Lời nhắn: </Text>
              {note}
            </Text>
          </View>
        )}
      </View>

      {/* 3. QR Code Section */}
      {isConfirmed ? (
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              onLoadEnd={() => setLoading(false)}
            />
            {loading && (
              <View style={styles.qrLoader}>
                <ActivityIndicator size="small" color="#EA580C" />
              </View>
            )}
          </View>
          <Text style={styles.qrCodeLabel}>MÃ HẸN BÀN GIAO: #{orderCode || orderId}</Text>

          {/* Khối hiển thị OTP 4 số đồng kiểm cho Người Mua */}
          {!isSeller && (
            <View style={styles.otpCardBox}>
              <View style={styles.otpHeaderRow}>
                <Ionicons name="key" size={15} color="#EA580C" />
                <Text style={styles.otpHeaderTitle}>MÃ OTP BÀN GIAO (4 SỐ)</Text>
              </View>
              <View style={styles.otpDigitsContainer}>
                {effectiveOtp.split('').map((digit, idx) => (
                  <View key={idx} style={styles.otpCell}>
                    <Text style={styles.otpDigit}>{digit}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.otpSubText}>
                Đọc 4 số này hoặc đưa mã QR trên cho người bán quét khi kiểm tra máy
              </Text>
            </View>
          )}

          {isSeller && (
            <View style={styles.sellerScanNotice}>
              <Ionicons name="scan" size={16} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.sellerScanNoticeText}>
                Bấm [Quét QR / Nhập OTP nhận hàng] ở thanh công cụ dưới để xác nhận bàn giao.
              </Text>
            </View>
          )}

          <Text style={styles.qrCodeHint}>
            {isSeller
              ? 'Yêu cầu người mua xuất trình mã QR này hoặc mã OTP 4 số khi giao nhận.'
              : 'Đưa mã QR này hoặc đọc mã OTP 4 số cho người bán quét tại bàn Safe-Point.'}
          </Text>
        </View>
      ) : (
        <View style={styles.pendingQrBox}>
          <Ionicons name="time-outline" size={32} color="#D97706" />
          <Text style={styles.pendingQrTitle}>Chờ người bán xác nhận lịch hẹn</Text>
          <Text style={styles.pendingQrDesc}>
            Mã QR và OTP giao nhận tại Safe-Point sẽ tự động kích hoạt ngay sau khi người bán nhấn [Đồng ý đơn & Chốt lịch hẹn].
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  safePointCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  safePointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safePointName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  safePointNotice: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  appointmentBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  appointmentBoxPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  appointmentBoxConfirmed: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  appointmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
  },
  appointmentIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  appointmentTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
    flexShrink: 0,
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  appointmentTimeText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 6,
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  noteText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
  },
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
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: 130,
    height: 130,
  },
  qrLoader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeLabel: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
  },
  qrCodeHint: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  otpCardBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    maxWidth: 280,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  otpHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  otpDigitsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  otpCell: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(234, 88, 12, 0.12)',
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
  },
  otpSubText: {
    fontSize: 11,
    color: '#9A3412',
    textAlign: 'center',
    marginTop: 2,
  },
  sellerScanNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    maxWidth: 280,
  },
  sellerScanNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
    fontWeight: '600',
  },
  pendingQrBox: {
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
  },
  pendingQrTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 8,
  },
  pendingQrDesc: {
    fontSize: 11.5,
    color: '#78350F',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
