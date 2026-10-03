import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface SavedItemsPriceDropBannerProps {
  onClose: () => void;
}

export const SavedItemsPriceDropBanner: React.FC<SavedItemsPriceDropBannerProps> = React.memo(({
  onClose,
}) => {
  return (
    <View style={styles.priceDropBanner}>
      <View style={styles.priceDropIconCircle}>
        <MaterialCommunityIcons name="trending-down" size={20} color="#FFFFFF" />
      </View>

      <View style={styles.priceDropContent}>
        <View style={styles.priceDropTagRow}>
          <View style={styles.hotDealTag}>
            <Text style={styles.hotDealTagText}>GIÁ HỜI</Text>
          </View>
          <Text style={styles.priceDropTime}>Hôm nay</Text>
        </View>
        <Text style={styles.priceDropDesc}>
          <Text style={styles.boldText}>ThinkPad T480</Text> vừa giảm{' '}
          <Text style={styles.boldOrange}>200.000 đ</Text>{'\n'}(xuống 5.800.000 đ)!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.closeAlertBtn}
        activeOpacity={0.7}
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={16} color="#9A3412" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  priceDropBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  priceDropIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  priceDropContent: {
    flex: 1,
  },
  priceDropTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  hotDealTag: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hotDealTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  priceDropTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  priceDropDesc: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 16,
  },
  boldText: {
    fontWeight: '700',
  },
  boldOrange: {
    fontWeight: '800',
    color: '#EA580C',
  },
  closeAlertBtn: {
    padding: 4,
  },
});
