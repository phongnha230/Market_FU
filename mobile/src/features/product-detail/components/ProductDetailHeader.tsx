import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductDetailHeaderProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
  isSaved: boolean;
  onToggleSaved: () => void;
  onOpenReport?: () => void;
  productId?: string;
  productTitle?: string;
}

export const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = memo(({
  onGoBack,
  onGoHome,
  isSaved,
  onToggleSaved,
  onOpenReport,
  productId,
  productTitle,
}) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem món đồ này trên Market FU: ${productTitle || 'Sản phẩm FPT'}\nhttps://marketfu.fpt.edu.vn/posts/${productId || ''}`,
      });
    } catch {}
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.btn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={onGoBack}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.center}>
        <Image
          source={require('../../../../assets/icon.png')}
          style={{ width: 24, height: 24, borderRadius: 6 }}
        />
        <Text style={styles.title}>Chi Tiết Sản Phẩm</Text>
      </View>

      <View style={styles.actions}>
        {onOpenReport && (
          <TouchableOpacity
            style={styles.btn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onOpenReport}
          >
            <Ionicons name="flag-outline" size={19} color="#DC2626" />
          </TouchableOpacity>
        )}

        {onGoHome && (
          <TouchableOpacity
            style={styles.btn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onGoHome}
          >
            <Ionicons name="home-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onToggleSaved}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? '#F27024' : '#0F172A'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  btn: { padding: 4, marginLeft: 4 },
  center: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: {
    backgroundColor: '#F27024',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  logoText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  title: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  actions: { flexDirection: 'row', alignItems: 'center' },
});

export default ProductDetailHeader;
