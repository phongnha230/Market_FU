import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { resolveProductImage } from '../../../lib/imageResolver';

export interface ChatProductStripProps {
  product?: {
    title: string;
    price: string;
    image?: any;
    badge?: string;
  };
}

export const ChatProductStrip: React.FC<ChatProductStripProps> = ({ product }) => {
  if (!product || !product.title) return null;

  return (
    <View style={styles.strip}>
      <Image
        source={resolveProductImage(product.image)}
        style={styles.thumb}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.price}>{product.price}</Text>
      </View>
      {product.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.badge}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  thumb: { width: 36, height: 36, borderRadius: 6 },
  content: { flex: 1, marginLeft: 10 },
  title: { fontSize: 11.5, fontWeight: '700', color: '#0F172A' },
  price: { fontSize: 11, fontWeight: '800', color: '#DC2626', marginTop: 1 },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9.5, fontWeight: '700', color: '#2563EB' },
});

export default ChatProductStrip;
