import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductDeliveryRouteCardProps {
  isSameCampus: boolean;
  sellerCampus: string;
  userCampus?: string;
  safePointName?: string;
}

export const ProductDeliveryRouteCard: React.FC<ProductDeliveryRouteCardProps> = ({
  isSameCampus,
  sellerCampus,
  userCampus = 'Hòa Lạc',
  safePointName = 'Trạm Safe-Point Sảnh Alpha',
}) => {
  return (
    <View style={[styles.container, isSameCampus ? styles.borderGreen : styles.borderOrange]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons
            name={isSameCampus ? 'shield-checkmark' : 'cube'}
            size={16}
            color={isSameCampus ? '#059669' : '#EA580C'}
          />
          <Text style={styles.titleText}>
            {isSameCampus ? 'Giao dịch Safe-Handoff (Cùng Campus)' : 'Vận chuyển Liên Campus (FPT CampusShip)'}
          </Text>
        </View>
        <View style={[styles.badgePill, isSameCampus ? styles.badgeGreen : styles.badgeOrange]}>
          <Text style={[styles.badgeText, isSameCampus ? styles.textGreen : styles.textOrange]}>
            {isSameCampus ? 'Bảo hành 24h' : 'Escrow 48h'}
          </Text>
        </View>
      </View>

      <Text style={styles.descText}>
        {isSameCampus
          ? `Món đồ cùng cơ sở ${sellerCampus} với bạn. Hai bên hẹn gặp tại Safe-Point để kiểm tra thực tế, sau đó quét mã QR Handshake để hoàn tất giao dịch an toàn.`
          : `Món đồ tại cơ sở ${sellerCampus} khác với cơ sở ${userCampus} của bạn. Hệ thống hỗ trợ đóng gói chuyển phát qua tuyến xe trường FPT và ký quỹ Escrow bảo hộ.`}
      </Text>

      {/* Visual Transit Line */}
      <View style={styles.routeBox}>
        <View style={styles.routeCol}>
          <Text style={styles.routeStepLabel}>{isSameCampus ? 'ĐIỂM HẸN' : 'NƠI GỬI'}</Text>
          <Text style={styles.routeCampusText} numberOfLines={1}>
            {isSameCampus ? safePointName : sellerCampus}
          </Text>
        </View>

        <View style={styles.routeMidCol}>
          <View style={styles.routeLine}>
            <View style={[styles.dot, isSameCampus ? styles.dotGreen : styles.dotOrange]} />
            <View style={styles.line} />
            <Ionicons
              name={isSameCampus ? 'walk-outline' : 'bus-outline'}
              size={14}
              color={isSameCampus ? '#059669' : '#EA580C'}
              style={{ marginHorizontal: 2 }}
            />
            <View style={styles.line} />
            <View style={[styles.dot, isSameCampus ? styles.dotGreen : styles.dotOrange]} />
          </View>
          <Text style={styles.routeTimeEstimate}>
            {isSameCampus ? 'Test trực tiếp' : '1 - 2 ngày làm việc'}
          </Text>
        </View>

        <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeStepLabel}>{isSameCampus ? 'HÌNH THỨC' : 'NƠI NHẬN'}</Text>
          <Text style={styles.routeCampusText} numberOfLines={1}>
            {isSameCampus ? 'QR Handshake' : userCampus}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  borderGreen: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  borderOrange: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },
  badgeOrange: {
    backgroundColor: '#FFEDD5',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textGreen: {
    color: '#15803D',
  },
  textOrange: {
    color: '#C2410C',
  },
  descText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 10,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  routeCol: {
    flex: 1,
  },
  routeStepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  routeCampusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  routeMidCol: {
    flex: 1.2,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#CBD5E1',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#059669',
  },
  dotOrange: {
    backgroundColor: '#EA580C',
  },
  routeTimeEstimate: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 3,
  },
});

export default ProductDeliveryRouteCard;
