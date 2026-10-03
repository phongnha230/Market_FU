import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface VovinamBannerProps {
  onPress?: () => void;
}

export const VovinamBanner: React.FC<VovinamBannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image
          source={require('../../../../assets/products/vovinam-uniform.jpg')}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.tag}>
          <Text style={styles.tagText}>Size L</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>140.000đ</Text>
          <View style={styles.conditionPill}>
            <Text style={styles.conditionText}>Mới 95%</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          Bộ võ phục Vovinam FPT kèm đai xanh
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.locationText}>🥋 Sân Vovinam Beta</Text>
          <View style={styles.sellerRow}>
            <Text style={styles.sellerText}>Hoàng Long</Text>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
    padding: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  image: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  content: { flex: 1, marginLeft: 12, justifyContent: 'space-between', paddingVertical: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '900', color: '#DC2626', marginRight: 8 },
  conditionPill: { backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  conditionText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  title: { fontSize: 13, fontWeight: '700', color: '#0F172A', lineHeight: 18 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerText: { fontSize: 11, fontWeight: '600', color: '#0F172A' },
});

export default VovinamBanner;
