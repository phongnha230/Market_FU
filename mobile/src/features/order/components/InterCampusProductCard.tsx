import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { resolveProductImage } from '../../../lib/imageResolver';

interface InterCampusProductCardProps {
  title: string;
  priceStr: string;
  image: any;
  sealCode?: string;
  isShipped?: boolean;
  onViewSealPhoto: () => void;
}

export const InterCampusProductCard: React.FC<InterCampusProductCardProps> = ({
  title,
  priceStr,
  image,
  sealCode,
  isShipped = false,
  onViewSealPhoto,
}) => {
  const hasSeal = Boolean(sealCode && sealCode.trim().length > 0);

  return (
    <View style={styles.productCard}>
      <View style={styles.topRow}>
        <Image source={resolveProductImage(image)} style={styles.productThumb} contentFit="cover" />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.productPrice}>{priceStr}</Text>
          <View style={styles.sealRow}>
            {hasSeal ? (
              <View style={styles.sealBadge}>
                <Ionicons name="pricetag" size={11} color="#2563EB" />
                <Text style={styles.sealBadgeText}>Mã Seal: {sealCode}</Text>
              </View>
            ) : (
              <View style={[styles.sealBadge, styles.sealPendingBadge]}>
                <Ionicons name="shield-outline" size={11} color="#64748B" />
                <Text style={[styles.sealBadgeText, styles.sealPendingText]}>
                  {isShipped ? 'Đã niêm phong gói hàng' : 'Chờ đóng gói & dán tem seal'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Button hoặc Thông báo ảnh kiện hàng bàn giao */}
      {hasSeal || isShipped ? (
        <TouchableOpacity
          style={styles.viewProofBtn}
          onPress={onViewSealPhoto}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="images-outline" size={15} color="#2563EB" />
          <Text style={styles.viewProofBtnText} numberOfLines={1} ellipsizeMode="tail">
            Xem ảnh kiện hàng lúc bàn giao tại Safe-Point
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#2563EB" />
        </TouchableOpacity>
      ) : (
        <View style={styles.viewProofPlaceholder}>
          <Ionicons name="information-circle-outline" size={14} color="#64748B" style={styles.mr6} />
          <Text style={styles.viewProofPlaceholderText} numberOfLines={1} ellipsizeMode="tail">
            Ảnh kiện hàng & tem seal sẽ hiển thị khi người bán bàn giao
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  sealRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sealPendingBadge: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  sealBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  sealPendingText: {
    color: '#64748B',
  },
  viewProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewProofBtnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    marginLeft: 8,
  },
  viewProofPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  viewProofPlaceholderText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  mr6: {
    marginRight: 6,
  },
});

export default InterCampusProductCard;
