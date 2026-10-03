import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export interface SuggestedProductItem {
  id: string;
  domTag: string;
  conditionBadge: string;
  trustScore: string;
  title: string;
  sellerInfo: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  image: any;
}

interface AiAssistantProductCardProps {
  product: SuggestedProductItem;
  onDetail: (product: SuggestedProductItem) => void;
  onChatSeller: (product: SuggestedProductItem) => void;
}

export const AiAssistantProductCard: React.FC<AiAssistantProductCardProps> = ({
  product,
  onDetail,
  onChatSeller,
}) => {
  return (
    <View style={styles.productCard}>
      <View style={styles.productCardTop}>
        {/* Product Thumbnail */}
        <View style={styles.prodThumbBox}>
          <Image source={product.image} style={styles.prodThumbImg} contentFit="cover" />
          <View style={styles.domBadge}>
            <Text style={styles.domBadgeText}>{product.domTag}</Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.prodDetailsCol}>
          <View style={styles.prodBadgesRow}>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionBadgeText}>{product.conditionBadge}</Text>
            </View>
            <View style={styles.trustBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#059669" style={{ marginRight: 2 }} />
              <Text style={styles.trustBadgeText}>{product.trustScore}</Text>
            </View>
          </View>

          <Text style={styles.prodTitle} numberOfLines={1}>
            {product.title}
          </Text>

          <Text style={styles.prodSellerSub} numberOfLines={1}>
            {product.sellerInfo}
          </Text>

          <View style={styles.prodPriceRow}>
            <Text style={styles.prodPrice}>{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.prodOriginalPrice}>{product.originalPrice}</Text>
            )}
            {product.discountBadge && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{product.discountBadge}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Card Actions: Chi tiết & Nhắn bạn bán */}
      <View style={styles.prodActionButtonsRow}>
        <TouchableOpacity
          style={styles.detailBtn}
          activeOpacity={0.8}
          onPress={() => onDetail(product)}
        >
          <Ionicons name="information-circle-outline" size={14} color="#1E40AF" style={{ marginRight: 4 }} />
          <Text style={styles.detailBtnText}>Chi tiết đồ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatSellerBtn}
          activeOpacity={0.88}
          onPress={() => onChatSeller(product)}
        >
          <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.chatSellerBtnText}>Nhắn bạn bán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  productCardTop: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  prodThumbBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  prodThumbImg: {
    width: '100%',
    height: '100%',
  },
  domBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  domBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  prodDetailsCol: {
    flex: 1,
  },
  prodBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  conditionBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trustBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  prodTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  prodSellerSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 4,
  },
  prodPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prodPrice: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#EA580C',
  },
  prodOriginalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
  },
  prodActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  detailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 7,
  },
  detailBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  chatSellerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 7,
  },
  chatSellerBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
