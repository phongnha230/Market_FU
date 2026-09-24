import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          onIndexChange(index);
        }}
      >
        {images.map((img, i) => (
          <View key={i} style={styles.slide}>
            <Image source={img} style={styles.image} contentFit="cover" transition={200} />
          </View>
        ))}
      </ScrollView>

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
