import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderInterCampusBannerProps {
  onPress: () => void;
}

export const OrderInterCampusBanner: React.FC<OrderInterCampusBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.interCampusBanner}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.interCampusLeft}>
        <View style={styles.interCampusIconCircle}>
          <Ionicons name="bus" size={20} color="#7C3AED" />
        </View>
        <View style={styles.interCampusTextCol}>
          <View style={styles.titleRow}>
            <Text style={styles.interCampusTitle}>Vận Chuyển Liên Cơ Sở FPT Bus</Text>
            <View style={styles.interCampusBadge}>
              <Text style={styles.interCampusBadgeText}>TRỰC TIẾP</Text>
            </View>
          </View>
          <Text style={styles.interCampusSub}>
            Theo dõi định vị chuyến xe buýt, tem seal niêm phong & camera trạm
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
    gap: 6,
  },
  interCampusTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#6D28D9',
  },
  interCampusBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  interCampusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  interCampusSub: {
    fontSize: 11,
    color: '#7C3AED',
    marginTop: 2,
    lineHeight: 15,
  },
});
