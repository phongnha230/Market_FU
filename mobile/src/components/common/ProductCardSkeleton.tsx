import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProductCardSkeletonProps {
  cardStyle?: any;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ cardStyle }) => {
  const [pulseAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.card, cardStyle]}>
      {/* Ảnh thumbnail shimmer */}
      <Animated.View style={[styles.imagePlaceholder, { opacity: pulseAnim }]} />

      <View style={styles.content}>
        {/* Dòng giá */}
        <Animated.View style={[styles.pricePlaceholder, { opacity: pulseAnim }]} />

        {/* Tiêu đề 2 dòng */}
        <Animated.View style={[styles.titlePlaceholder1, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.titlePlaceholder2, { opacity: pulseAnim }]} />

        {/* Thông tin phụ & người bán */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.metaPlaceholder, { opacity: pulseAnim }]} />
        </View>
        <View style={styles.sellerRow}>
          <Animated.View style={[styles.sellerPlaceholder, { opacity: pulseAnim }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  imagePlaceholder: {
    width: '100%',
    height: 135,
    backgroundColor: '#E2E8F0',
  },
  content: {
    padding: 10,
  },
  pricePlaceholder: {
    width: '55%',
    height: 16,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },
  titlePlaceholder1: {
    width: '95%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 5,
  },
  titlePlaceholder2: {
    width: '65%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  metaRow: {
    marginBottom: 6,
  },
  metaPlaceholder: {
    width: '40%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerPlaceholder: {
    width: '50%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
});

export default ProductCardSkeleton;
