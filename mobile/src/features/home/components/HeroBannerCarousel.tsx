import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = Math.floor(SCREEN_WIDTH - 32);
const BANNER_HEIGHT = 120;

export interface HeroSlide {
  id: string;
  tag: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgGradient: string;
  accentColor: string;
  isGraphicBanner?: boolean;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-safepoint',
    tag: '⚡ SAFE-POINT & GIAO TẬN TAY',
    title: 'Giao dịch An Toàn 100%',
    desc: 'Bàn giao có camera 24/7, bàn cắm sạc test máy & bảo vệ hỗ trợ tại Sảnh Alpha.',
    icon: 'location',
    bgGradient: '#0D9488',
    accentColor: '#FFFFFF',
    isGraphicBanner: true,
  },
  {
    id: 'slide-kyc',
    tag: 'FPT KYC PASS',
    title: 'Bảo trợ sinh viên',
    desc: 'Xác thực sinh viên để nhận huy hiệu tin cậy & giao dịch Safe-Handoff an toàn tại Sảnh Alpha & KTX.',
    icon: 'shield-checkmark',
    bgGradient: '#F27024',
    accentColor: '#FFFFFF',
  },
  {
    id: 'slide-voucher',
    tag: 'FPT REWARDS',
    title: 'Đổi xu Canteen & Passio',
    desc: 'Tích xu qua mỗi đơn bán thành công để đổi voucher Cơm trưa Căn Tin và Cà phê Passio tại Campus.',
    icon: 'gift',
    bgGradient: '#7C3AED',
    accentColor: '#FFFFFF',
  },
];

interface HeroBannerCarouselProps {
  onSlidePress?: (slideId: string) => void;
}

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({ onSlidePress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Tự động chuyển slide (Auto-scroll) mỗi 4.5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % HERO_SLIDES.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / BANNER_WIDTH);
    if (index >= 0 && index < HERO_SLIDES.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        bounces={false}
        style={styles.carouselScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {HERO_SLIDES.map((slide) => {
          if (slide.isGraphicBanner) {
            return (
              <TouchableOpacity
                key={slide.id}
                activeOpacity={0.9}
                style={[styles.bannerCard, styles.safepointCard]}
                onPress={() => onSlidePress && onSlidePress(slide.id)}
              >
                <ImageBackground
                  source={require('../../../../assets/images/banner_delivery.jpg')}
                  style={styles.imageBackground}
                  imageStyle={styles.imageStyle}
                  resizeMode="cover"
                >
                  <View style={styles.safepointOverlay} />
                  <View style={styles.safepointContent}>
                    <View style={styles.safepointTopRow}>
                      <View style={styles.safepointTag}>
                        <Ionicons name="flash" size={11} color="#EA580C" style={{ marginRight: 3 }} />
                        <Text style={styles.safepointTagText}>{slide.tag}</Text>
                      </View>
                      <View style={styles.safepointCameraBadge}>
                        <Ionicons name="videocam" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.safepointCameraText}>Camera 24/7</Text>
                      </View>
                    </View>
                    <View style={styles.safepointCenterBlock}>
                      <Text style={styles.safepointTitle}>{slide.title}</Text>
                      <Text style={styles.safepointDesc} numberOfLines={2}>
                        {slide.desc}
                      </Text>
                    </View>
                    <View style={styles.safepointCta}>
                      <Text style={styles.safepointCtaText}>Khám phá 5 Trạm Campus</Text>
                      <Ionicons name="arrow-forward" size={11} color="#0F172A" />
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={slide.id}
              style={[styles.bannerCard, { backgroundColor: slide.bgGradient }]}
              activeOpacity={0.9}
              onPress={() => onSlidePress && onSlidePress(slide.id)}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={slide.icon} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.textContent}>
                <View style={styles.headerRow}>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{slide.tag}</Text>
                  </View>
                  <Text style={styles.headerTitle}>{slide.title}</Text>
                </View>
                <Text style={styles.descText} numberOfLines={2}>
                  {slide.desc}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsRow}>
        {HERO_SLIDES.map((slide, i) => (
          <View
            key={`dot-${slide.id}`}
            style={[styles.dot, activeIndex === i ? styles.activeDot : styles.inactiveDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 14,
    width: BANNER_WIDTH,
    alignSelf: 'center',
  },
  carouselScroll: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scrollContent: {
    height: BANNER_HEIGHT,
    alignItems: 'center',
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  safepointCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#0F172A',
  },
  imageBackground: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    justifyContent: 'center',
  },
  imageStyle: {
    borderRadius: 16,
  },
  safepointOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    borderRadius: 16,
  },
  safepointContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  safepointTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safepointTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  safepointTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  safepointCameraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  safepointCameraText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  safepointCenterBlock: {
    marginVertical: 2,
  },
  safepointTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  safepointDesc: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 14.5,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  safepointCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  safepointCtaText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  textContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  descText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 16,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 16,
    backgroundColor: '#F27024',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
});

export default HeroBannerCarousel;
