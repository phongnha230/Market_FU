import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface InterCampusRouteBannerProps {
  fromCampus: string;
  toCampus: string;
  fromSafePoint: string;
  toSafePoint: string;
}

export const InterCampusRouteBanner: React.FC<InterCampusRouteBannerProps> = ({
  fromCampus,
  toCampus,
  fromSafePoint,
  toSafePoint,
}) => {
  return (
    <LinearGradient
      colors={['#1E3A8A', '#1D4ED8', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.routeBanner}
    >
      {/* Top Header Pill Row */}
      <View style={styles.routeTopLine}>
        <View style={styles.routePill}>
          <Ionicons name="bus" size={13} color="#FED7AA" />
          <Text style={styles.routePillText}>CHUYÊN TUYẾN FPT BUS LIÊN CƠ SỞ</Text>
        </View>
        <View style={styles.escrowSafePill}>
          <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
          <Text style={styles.escrowSafeText}>Escrow Bảo Hộ 100%</Text>
        </View>
      </View>

      {/* Cities and Bus Path */}
      <View style={styles.routeCitiesRow}>
        <View style={styles.cityCol}>
          <Text style={styles.cityRole}>CƠ SỞ GỬI</Text>
          <Text style={styles.cityName} numberOfLines={1}>{fromCampus}</Text>
          <Text style={styles.stationName} numberOfLines={1}>{fromSafePoint}</Text>
        </View>

        <View style={styles.busIndicator}>
          <View style={styles.busDashLine} />
          <View style={styles.busIconCircle}>
            <Ionicons name="bus" size={17} color="#EA580C" />
          </View>
          <View style={styles.busDashLine} />
        </View>

        <View style={[styles.cityCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.cityRole}>CƠ SỞ NHẬN</Text>
          <Text style={[styles.cityName, { textAlign: 'right' }]} numberOfLines={1}>{toCampus}</Text>
          <Text style={[styles.stationName, { textAlign: 'right' }]} numberOfLines={1}>{toSafePoint}</Text>
        </View>
      </View>

      {/* Bus Meta Box - Chia 2 hàng rõ ràng, chống tràn chữ 100% */}
      <View style={styles.routeBusMetaBox}>
        <View style={styles.metaRow}>
          <Ionicons name="cube-outline" size={14} color="#BFDBFE" />
          <Text style={styles.busMetaText} numberOfLines={1}>
            Chuyến xe: <Text style={styles.busMetaBold}>FPT-BUS-LINE-02</Text> • Biển: <Text style={styles.busMetaBold}>29B-512.44</Text>
          </Text>
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.metaTimeRow}>
          <View style={styles.timeTag}>
            <Ionicons name="time-outline" size={13} color="#047857" />
            <Text style={styles.timeTagText}>Dự kiến đến trạm: 17:30</Text>
          </View>

          <View style={styles.sealTag}>
            <Ionicons name="lock-closed" size={11} color="#1E40AF" />
            <Text style={styles.sealTagText}>Tem Seal bảo mật</Text>
          </View>
        </View>
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
    boxShadow: '0 6px 14px rgba(30, 58, 138, 0.25)',
  },
  routeTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingVertical: 6,
  },
  cityCol: {
    flex: 1,
  },
  cityRole: {
    fontSize: 9,
    fontWeight: '800',
    color: '#BFDBFE',
    letterSpacing: 0.5,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
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
    height: 1.5,
    backgroundColor: '#93C5FD',
  },
  busIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  routeBusMetaBox: {
    marginTop: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  busMetaText: {
    fontSize: 11,
    color: '#DBEAFE',
    flex: 1,
  },
  busMetaBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metaDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  metaTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  timeTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
  },
  sealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  sealTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E40AF',
  },
});
