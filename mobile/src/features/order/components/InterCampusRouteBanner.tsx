import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    <View style={styles.routeBanner}>
      <View style={styles.routeTopLine}>
        <View style={styles.routePill}>
          <Ionicons name="airplane" size={13} color="#7C3AED" />
          <Text style={styles.routePillText}>CHUYÊN TUYẾN FPT BUS LIÊN CƠ SỞ</Text>
        </View>
        <View style={styles.escrowSafePill}>
          <Ionicons name="shield-checkmark" size={13} color="#059669" />
          <Text style={styles.escrowSafeText}>Escrow Bảo Hộ 100%</Text>
        </View>
      </View>

      <View style={styles.routeCitiesRow}>
        <View style={styles.cityCol}>
          <Text style={styles.cityRole}>CƠ SỞ GỬI</Text>
          <Text style={styles.cityName}>{fromCampus}</Text>
          <Text style={styles.stationName}>{fromSafePoint}</Text>
        </View>

        <View style={styles.busIndicator}>
          <View style={styles.busDashLine} />
          <View style={styles.busIconCircle}>
            <Ionicons name="bus" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.busDashLine} />
        </View>

        <View style={[styles.cityCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.cityRole}>CƠ SỞ NHẬN</Text>
          <Text style={[styles.cityName, { textAlign: 'right' }]}>{toCampus}</Text>
          <Text style={[styles.stationName, { textAlign: 'right' }]}>{toSafePoint}</Text>
        </View>
      </View>

      <View style={styles.routeBusMeta}>
        <Text style={styles.busMetaText}>
          🚌 Chuyến xe: <Text style={styles.busMetaBold}>FPT-BUS-LINE-02</Text> • Biển số: <Text style={styles.busMetaBold}>29B-512.44</Text>
        </Text>
        <Text style={styles.busMetaTime}>Dự kiến đến trạm: 17:30</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  routeBanner: {
    backgroundColor: '#1E1B4B',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 4px 8px rgba(30, 27, 75, 0.2)',
  },
  routeTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  routePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#C7D2FE',
  },
  escrowSafePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  escrowSafeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6EE7B7',
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
    color: '#A5B4FC',
    letterSpacing: 0.5,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  stationName: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  busIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  busDashLine: {
    width: 18,
    height: 1.5,
    backgroundColor: '#6366F1',
  },
  busIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  routeBusMeta: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  busMetaText: {
    fontSize: 10.5,
    color: '#C7D2FE',
  },
  busMetaBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  busMetaTime: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FCD34D',
  },
});
