import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderInterCampusBannerProps {
  shippingPartner?: string;
  onPress: () => void;
}

export const OrderInterCampusBanner: React.FC<OrderInterCampusBannerProps> = ({
  shippingPartner,
  onPress,
}) => {
  const isGhn = !shippingPartner || shippingPartner.toUpperCase().includes('GHN');
  const isBus = Boolean(shippingPartner?.toUpperCase().includes('BUS') || shippingPartner?.toUpperCase().includes('FPT'));

  const title = isGhn
    ? 'Vận Chuyển Liên Campus (GHN Express)'
    : isBus
    ? 'Vận Chuyển Tuyến FPT Bus'
    : `Vận Chuyển Liên Campus (${shippingPartner})`;

  const badgeText = isGhn ? 'GHN' : isBus ? 'FPT BUS' : 'LIÊN CƠ SỞ';

  const subtitle = isGhn
    ? 'Theo dõi lộ trình bưu tá GHN, tra cứu vận đơn & đối soát an toàn'
    : 'Theo dõi định vị chuyến xe buýt, tem seal niêm phong & camera trạm';

  return (
    <TouchableOpacity
      style={styles.interCampusBanner}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.interCampusLeft}>
        <View style={styles.interCampusIconCircle}>
          <Ionicons name={isGhn ? 'cube' : 'bus'} size={20} color={isGhn ? '#EA580C' : '#7C3AED'} />
        </View>
        <View style={styles.interCampusTextCol}>
          <View style={styles.titleRow}>
            <Text style={styles.interCampusTitle} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            <View style={[styles.interCampusBadge, isGhn && styles.ghnBadge]}>
              <Text style={[styles.interCampusBadgeText, isGhn && styles.ghnBadgeText]}>
                {badgeText}
              </Text>
            </View>
          </View>
          <Text style={styles.interCampusSub} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  interCampusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  interCampusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  interCampusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  interCampusTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 3,
  },
  interCampusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4C1D95',
    flexShrink: 1,
  },
  interCampusBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  interCampusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ghnBadge: {
    backgroundColor: '#EA580C',
  },
  ghnBadgeText: {
    color: '#FFFFFF',
  },
  interCampusSub: {
    fontSize: 11,
    color: '#6D28D9',
    lineHeight: 15,
  },
});

export default OrderInterCampusBanner;
