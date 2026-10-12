import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SavedProductItem } from '../screens/SavedItemsScreen';
import { resolveProductImage } from '../../../lib/imageResolver';

interface SavedProductCardProps {
  product: SavedProductItem;
  onPress: (p: SavedProductItem) => void;
  onToggleLove: (id: string, title: string) => void;
  onActionPress: (p: SavedProductItem) => void;
}

export const SavedProductCard: React.FC<SavedProductCardProps> = React.memo(({
  product,
  onPress,
  onToggleLove,
  onActionPress,
}) => {
  const handleCardPress = useCallback(() => {
    onPress(product);
  }, [product, onPress]);

  const handleHeartPress = useCallback(() => {
    onToggleLove(product.id, product.title);
  }, [product.id, product.title, onToggleLove]);

  const handleAction = useCallback(() => {
    onActionPress(product);
  }, [product, onActionPress]);

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.92}
      onPress={handleCardPress}
    >
      {/* Product Image Wrapper */}
      <View style={styles.imageBox}>
        <Image source={resolveProductImage(product.image)} style={styles.productImg} contentFit="cover" />

        {/* Discount Badge */}
        {product.discountBadge && (
          <View style={styles.discountBadgeTop}>
            <Text style={styles.discountBadgeTopText}>{product.discountBadge}</Text>
          </View>
        )}

        {/* Location Tag */}
        <View style={styles.locationTagBox}>
          <Text style={styles.locationTagText}>{product.locationTag}</Text>
        </View>

        {/* Heart Button */}
        <TouchableOpacity
          style={styles.heartBtn}
          activeOpacity={0.7}
          onPress={handleHeartPress}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="heart" size={16} color="#DC2626" />
        </TouchableOpacity>

        {/* Sold Overlay Banner */}
        {product.isSoldOrReserved && (
          <View style={[
            styles.statusOverlayBanner,
            product.status === 'SOLD' ? styles.soldOverlayBanner : styles.reservedOverlayBanner
          ]}>
            <Ionicons
              name={product.status === 'SOLD' ? 'checkmark-circle' : 'time'}
              size={13}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statusOverlayBannerText}>
              {product.status === 'SOLD' ? 'ĐÃ BÁN (HẾT HÀNG)' : 'ĐANG HẸN CỌC'}
            </Text>
          </View>
        )}

        {/* Negotiating Banner */}
        {!product.isSoldOrReserved && product.negotiatingBanner && (
          <View style={styles.negotiatingBanner}>
            <Text style={styles.negotiatingBannerText}>Đang thương lượng</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfoBox}>
        <View style={styles.priceRow}>
          <Text style={[styles.productPrice, product.status === 'SOLD' && styles.soldPriceText]}>
            {product.price}
          </Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>{product.originalPrice}</Text>
          )}
        </View>

        <Text style={[styles.productTitle, product.status === 'SOLD' && styles.soldTitleText]} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Status indicator / Badge */}
        {product.statusText && (
          <View style={styles.stockStatusRow}>
            <View
              style={[
                styles.greenStockDot,
                product.status === 'SOLD'
                  ? styles.redStockDot
                  : product.status === 'RESERVED'
                  ? styles.amberStockDot
                  : styles.greenStockDot,
              ]}
            />
            <Text
              style={[
                styles.stockStatusText,
                product.status === 'SOLD'
                  ? styles.redStockText
                  : product.status === 'RESERVED'
                  ? styles.amberStockText
                  : styles.greenStockText,
              ]}
            >
              {product.statusText}
            </Text>
          </View>
        )}

        {product.statusBadge && (
          <View style={styles.specBadgeRow}>
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>{product.statusBadge}</Text>
            </View>
          </View>
        )}

        {product.interestedCount !== undefined && (
          <View style={styles.interestedRow}>
            <Ionicons name="chatbubble-outline" size={11} color="#64748B" style={{ marginRight: 3 }} />
            <Text style={styles.interestedText}>Có {product.interestedCount} bạn quan tâm</Text>
          </View>
        )}

        {/* Action Button: Nếu sản phẩm ĐÃ BÁN hoặc ĐANG HẸN CỌC -> Khóa nhắn tin, chuyển sang Xem chi tiết hoặc báo đã bán */}
        {product.isSoldOrReserved ? (
          <TouchableOpacity
            style={styles.actionDisabledSoldBtn}
            activeOpacity={0.8}
            onPress={handleCardPress}
          >
            <Ionicons
              name={product.status === 'SOLD' ? 'bag-check-outline' : 'lock-closed-outline'}
              size={13}
              color="#64748B"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.actionDisabledSoldBtnText}>
              {product.status === 'SOLD' ? 'Đã bán • Xem lại tin' : 'Đã hẹn cọc • Xem tin'}
            </Text>
          </TouchableOpacity>
        ) : product.actionType === 'chat_now' ? (
          <TouchableOpacity
            style={styles.actionChatNowBtn}
            activeOpacity={0.88}
            onPress={handleAction}
          >
            <Ionicons name="chatbubble-ellipses" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.actionChatNowBtnText}>Nhắn tin ngay</Text>
          </TouchableOpacity>
        ) : product.actionType === 'chat' ? (
          <TouchableOpacity
            style={styles.actionChatBtn}
            activeOpacity={0.8}
            onPress={handleAction}
          >
            <Ionicons name="chatbubble-outline" size={13} color="#1E40AF" style={{ marginRight: 4 }} />
            <Text style={styles.actionChatBtnText}>Nhắn tin</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionDetailBtn}
            activeOpacity={0.8}
            onPress={handleAction}
          >
            <Ionicons name="eye-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.actionDetailBtnText}>Xem chi tiết</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  imageBox: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  discountBadgeTop: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeTopText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  locationTagBox: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  locationTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heartBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  negotiatingBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  negotiatingBannerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productInfoBox: {
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 3,
  },
  productPrice: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16.5,
    marginBottom: 6,
    minHeight: 33,
  },
  stockStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greenStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 4,
  },
  stockStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  specBadgeRow: {
    marginBottom: 8,
  },
  specBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  interestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interestedText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  actionChatNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 10,
    paddingVertical: 7,
  },
  actionChatNowBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 7,
  },
  actionChatBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  actionDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 7,
  },
  actionDetailBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  // Overlay banners cho trạng thái ĐÃ BÁN / HẸN CỌC
  statusOverlayBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOverlayBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.88)',
  },
  reservedOverlayBanner: {
    backgroundColor: 'rgba(217, 119, 6, 0.88)',
  },
  statusOverlayBannerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  soldPriceText: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  soldTitleText: {
    color: '#64748B',
  },
  redStockDot: {
    backgroundColor: '#DC2626',
  },
  amberStockDot: {
    backgroundColor: '#D97706',
  },
  greenStockText: {
    color: '#059669',
  },
  redStockText: {
    color: '#DC2626',
  },
  amberStockText: {
    color: '#D97706',
  },
  actionDisabledSoldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionDisabledSoldBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
});
