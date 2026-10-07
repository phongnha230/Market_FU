import React, { useCallback } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, ListRenderItemInfo } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { resolveProductImage } from '../../../lib/imageResolver';

const { width: SCREEN_W } = Dimensions.get('window');

interface ProductGalleryProps {
  images: any[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  currentIndex,
  onIndexChange,
}) => {
  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      onIndexChange(index);
    },
    [onIndexChange]
  );

  const renderItem = useCallback(({ item: img }: ListRenderItemInfo<any>) => (
    <View style={styles.slide}>
      <Image source={resolveProductImage(img)} style={styles.image} contentFit="cover" transition={200} />
    </View>
  ), []);

  const keyExtractor = useCallback((img: any, index: number) => {
    if (typeof img === 'string') return img;
    if (typeof img === 'number') return `asset-${img}-${index}`;
    return img?.uri || `img-${index}`;
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />

      {/* Page indicator pill */}
      <View style={styles.indicatorPill}>
        <Ionicons name="images" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
        <Text style={styles.indicatorText}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative', width: SCREEN_W, height: 260, backgroundColor: '#F8FAFC' },
  slide: { width: SCREEN_W, height: 260 },
  image: { width: '100%', height: '100%' },
  indicatorPill: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});

export default ProductGallery;
