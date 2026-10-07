import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resolveProductImage } from '../../../lib/imageResolver';

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
        source={resolveProductImage(product.image)}
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
        activeOpacity={0.8}
        onPress={onViewProduct}
      >
        <Text style={styles.viewProductBtnText}>Xem món</Text>
        <Ionicons name="chevron-forward" size={11} color="#EA580C" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  productStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productStripThumb: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginRight: 9,
    backgroundColor: '#F1F5F9',
  },
  productStripInfo: { flex: 1, marginRight: 8 },
  productStripTitle: { fontSize: 11.5, fontWeight: '700', color: '#0F172A' },
  productStripPrice: { fontSize: 11.5, fontWeight: '900', color: '#EA580C', marginTop: 1 },
  viewProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 1.5,
  },
  viewProductBtnText: { fontSize: 10.5, fontWeight: '700', color: '#EA580C' },
});
