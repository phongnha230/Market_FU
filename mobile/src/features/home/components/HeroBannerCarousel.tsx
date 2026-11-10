import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = Math.floor(SCREEN_WIDTH - 32);
const BANNER_HEIGHT = 112;

interface HeroBannerCarouselProps {
  onSlidePress?: (slideId: string) => void;
}

/**
 * Single static Safe-Point banner aligned to the 3-colour palette (white/slate, charcoal, FPT orange).
 */
export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = React.memo(({ onSlidePress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bannerCard}
        onPress={() => onSlidePress && onSlidePress('slide-safepoint')}
      >
        <ImageBackground
          source={require('../../../../assets/images/banner_delivery.jpg')}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.tag}>
                <Ionicons name="shield-checkmark" size={11} color={theme.colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.tagText}>SAFE-POINT 5 CAMPUS</Text>
              </View>
            </View>

            <View>
              <Text style={styles.title}>Giao dịch An Toàn tại Trạm KTX</Text>
              <Text style={styles.desc} numberOfLines={1}>
                Bàn giao có camera 24/7, bàn cắm sạc test máy tại Sảnh Alpha.
              </Text>
            </View>

            <View style={styles.cta}>
              <Text style={styles.ctaText}>Xem 5 Trạm Safe-Point</Text>
              <Ionicons name="arrow-forward" size={11} color={theme.colors.primary} />
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 14,
    width: BANNER_WIDTH,
    alignSelf: 'center',
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: theme.colors.text.primary,
  },
  imageBackground: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    justifyContent: 'center',
  },
  imageStyle: {
    borderRadius: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderRadius: 14,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: theme.colors.text.inverse,
    marginBottom: 2,
  },
  desc: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ctaText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.primary,
  },
});

export default HeroBannerCarousel;
