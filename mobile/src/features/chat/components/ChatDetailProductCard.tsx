import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

interface ChatDetailProductCardProps {
  product: {
    id: string;
    title: string;
    price: string;
    image: any;
  };
  onViewProduct: () => void;
}

export const ChatDetailProductCard: React.FC<ChatDetailProductCardProps> = ({
  product,
  onViewProduct,
}) => {
  return (
    <View style={styles.productStrip}>
      <Image
        source={typeof product.image === 'string' ? { uri: product.image } : product.image}
        style={styles.productStripThumb}
      />
      <View style={styles.productStripInfo}>
        <Text style={styles.productStripTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={styles.productStripPrice}>{product.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.viewProductBtn}
        onPress={onViewProduct}
      >
        <Text style={styles.viewProductBtnText}>Xem chi tiết</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  productStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  productStripThumb: { width: 38, height: 38, borderRadius: 8, marginRight: 10 },
  productStripInfo: { flex: 1 },
  productStripTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  productStripPrice: { fontSize: 12, fontWeight: '900', color: '#EA580C', marginTop: 1 },
  viewProductBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewProductBtnText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
});
