import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface InterCampusRouteBannerProps {
  fromCampus: string;
  toCampus: string;
  fromSafePoint: string;
  toSafePoint: string;
  isShipped?: boolean;
  shippingPartner?: string;
}

export const InterCampusRouteBanner: React.FC<InterCampusRouteBannerProps> = ({
  fromCampus,
  toCampus,
  fromSafePoint,
  toSafePoint,
  isShipped = false,
  shippingPartner,
}) => {
  const isGhn = !shippingPartner || shippingPartner.toUpperCase().includes('GHN');
  const isBus = Boolean(shippingPartner?.toUpperCase().includes('BUS') || shippingPartner?.toUpperCase().includes('FPT'));

  const bannerTagText = isGhn
    ? 'GHN EXPRESS LIÊN CAMPUS'
    : isBus
    ? 'FPT BUS LIÊN CAMPUS'
    : `${(shippingPartner || 'VẬN CHUYỂN').toUpperCase()} LIÊN CAMPUS`;

  return (
    <LinearGradient
      colors={['#1E3A8A', '#1D4ED8', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.routeBanner}
    >
      {/* Top Header Pill Row - Không bao giờ tràn chữ */}
      <View style={styles.routeTopLine}>
        <View style={styles.routePill}>
          <Ionicons name={isGhn ? 'cube-outline' : 'bus'} size={12} color="#FED7AA" />
          <Text style={styles.routePillText} numberOfLines={1}>{bannerTagText}</Text>
        </View>
        <View style={styles.escrowSafePill}>
          <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
          <Text style={styles.escrowSafeText} numberOfLines={1}>Escrow 100%</Text>
        </View>
      </View>

      {/* Cities and Path */}
      <View style={styles.routeCitiesRow}>
        <View style={styles.cityCol}>
          <Text style={styles.cityRole}>CƠ SỞ GỬI</Text>
          <Text style={styles.cityName} numberOfLines={1}>{fromCampus}</Text>
          <Text style={styles.stationName} numberOfLines={1}>{fromSafePoint}</Text>
        </View>

        <View style={styles.busIndicator}>
          <View style={styles.busDashLine} />
          <View style={styles.busIconCircle}>
            <Ionicons name={isGhn ? 'cube' : 'bus'} size={17} color="#EA580C" />
          </View>
          <View style={styles.busDashLine} />
        </View>

        <View style={[styles.cityCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.cityRole}>CƠ SỞ NHẬN</Text>
          <Text style={[styles.cityName, { textAlign: 'right' }]} numberOfLines={1}>{toCampus}</Text>
          <Text style={[styles.stationName, { textAlign: 'right' }]} numberOfLines={1}>{toSafePoint}</Text>
        </View>
      </View>

      {/* Carrier Meta Box - Hiển thị chuẩn theo hãng vận chuyển (GHN vs FPT Bus) */}
      <View style={styles.routeBusMetaBox}>
        {isShipped ? (
          <>
            <View style={styles.metaRow}>
              <Ionicons name="cube-outline" size={14} color="#BFDBFE" />
              <Text style={styles.busMetaText} numberOfLines={1} ellipsizeMode="tail">
                Đơn vị: <Text style={styles.busMetaBold}>{isGhn ? 'Giao Hàng Nhanh (GHN Express)' : isBus ? 'Tuyến Xe Buýt FPT Bus' : (shippingPartner || 'GHN Express')}</Text>
              </Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaTimeRow}>
              <View style={styles.timeTag}>
                <Ionicons name="time-outline" size={13} color="#047857" />
                <Text style={styles.timeTagText} numberOfLines={1}>
                  {isGhn ? 'Dự kiến: 2 - 3 ngày KTX' : 'Dự kiến đến trạm: 17:30'}
                </Text>
              </View>

              <View style={styles.sealTag}>
                <Ionicons name="lock-closed" size={11} color="#1E40AF" />
                <Text style={styles.sealTagText} numberOfLines={1}>Tem Seal niêm phong</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.metaWaitingRow}>
            <Ionicons name="time-outline" size={15} color="#BFDBFE" style={{ marginRight: 6 }} />
            <Text style={styles.waitingNoticeText} numberOfLines={1} ellipsizeMode="tail">
              {isGhn
                ? 'Đơn vị: GHN Express • Bưu tá sẽ tiếp nhận sau khi người bán đóng gói'
                : 'Chuyến xe liên cơ sở khởi hành sau khi tiếp nhận kiện hàng'}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  routeBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  routeTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexShrink: 1,
  },
  routePillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  escrowSafePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34D399',
    flexShrink: 0,
  },
  escrowSafeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  routeCitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cityCol: {
    flex: 1,
  },
  cityRole: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  stationName: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
  },
  busIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  busDashLine: {
    width: 14,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  busIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  routeBusMetaBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  busMetaText: {
    fontSize: 11.5,
    color: '#E0E7FF',
    flex: 1,
  },
  busMetaBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metaDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 8,
  },
  metaTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    flexShrink: 1,
  },
  timeTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
  },
  sealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  sealTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  metaWaitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingNoticeText: {
    fontSize: 11,
    color: '#E0E7FF',
    fontWeight: '600',
    flex: 1,
  },
});

export default InterCampusRouteBanner;
