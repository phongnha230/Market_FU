import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface InterCampusProductCardProps {
  title: string;
  priceStr: string;
  image: any;
  sealCode?: string;
  onViewSealPhoto: () => void;
}

export const InterCampusProductCard: React.FC<InterCampusProductCardProps> = ({
  title,
  priceStr,
  image,
  sealCode = 'FPT-88921',
  onViewSealPhoto,
}) => {
  return (
    <View style={styles.productCard}>
      <View style={styles.topRow}>
        <Image source={image} style={styles.productThumb} contentFit="cover" />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.productPrice}>{priceStr}</Text>
          <View style={styles.sealRow}>
            <View style={styles.sealBadge}>
              <Ionicons name="pricetag" size={11} color="#2563EB" />
              <Text style={styles.sealBadgeText}>Mã Seal: {sealCode}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Prominent Button: Xem ảnh kiện hàng lúc bàn giao */}
      <TouchableOpacity
        style={styles.viewProofBtn}
        onPress={onViewSealPhoto}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="images-outline" size={15} color="#2563EB" />
        <Text style={styles.viewProofBtnText}>Xem ảnh kiện hàng lúc bàn giao tại Safe-Point</Text>
        <Ionicons name="chevron-forward" size={14} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 3,
  },
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  sealBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  viewProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  viewProofBtnText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginLeft: 6,
  },
});
