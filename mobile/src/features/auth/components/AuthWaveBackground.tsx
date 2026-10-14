import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Modern Organic Wave Background
 * Tạo 2 dải viền sóng lượn (Top Wave & Bottom Wave) chuẩn theo bản vẽ tay của người dùng:
 * - Viền trên: Dải sóng uốn lượn màu cam FPT + hình elip bong bóng điểm xuyết
 * - Viền dưới: Mảng sóng uốn lượn ôm trọn chân trang
 */
export const AuthWaveBackground: React.FC = memo(() => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. TOP WAVE SECTION (Viền sóng trên) */}
      <View style={styles.topWaveContainer}>
        {/* Lớp nền sóng chính uốn lượn */}
        <LinearGradient
          colors={['#FFEDD5', '#FFF7ED', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topMainGradient}
        />

        {/* Mảng sóng thứ hai màu cam đậm tạo độ lượn theo bản vẽ */}
        <LinearGradient
          colors={['#F27024', '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.topWaveAccent}
        />

        {/* Lớp cong tạo đường cong võng mềm mại */}
        <View style={styles.topWaveMask} />

        {/* Hình Elip / Bong bóng điểm xuyết góc phải theo bản vẽ */}
        <View style={styles.topRightBubble}>
          <LinearGradient
            colors={['rgba(242, 112, 36, 0.25)', 'rgba(234, 88, 12, 0.05)']}
            style={styles.bubbleFill}
          />
        </View>
        <View style={styles.topSmallBubble} />
      </View>

      {/* 2. BOTTOM WAVE SECTION (Viền sóng dưới) */}
      <View style={styles.bottomWaveContainer}>
        {/* Dải sóng lượn ôm đáy */}
        <LinearGradient
          colors={['#FFFFFF', '#FFF7ED', '#FFEDD5']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.bottomMainGradient}
        />

        {/* Mảng sóng cong uốn lượn góc đáy */}
        <LinearGradient
          colors={['#EA580C', '#F27024']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomWaveAccent}
        />
        <View style={styles.bottomWaveMask} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Top Wave Styles
  topWaveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    overflow: 'hidden',
  },
  topMainGradient: {
    ...StyleSheet.absoluteFill,
    opacity: 0.8,
  },
  topWaveAccent: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: SCREEN_WIDTH * 1.1,
    height: 180,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 260,
    transform: [{ rotate: '-8deg' }],
    opacity: 0.88,
  },
  topWaveMask: {
    position: 'absolute',
    top: 60,
    left: -50,
    width: SCREEN_WIDTH * 1.3,
    height: 160,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 220,
    borderTopRightRadius: 190,
    transform: [{ rotate: '6deg' }],
  },
  topRightBubble: {
    position: 'absolute',
    top: 25,
    right: 20,
    width: 68,
    height: 95,
    borderRadius: 45,
    transform: [{ rotate: '25deg' }],
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(242, 112, 36, 0.35)',
  },
  bubbleFill: {
    ...StyleSheet.absoluteFill,
  },
  topSmallBubble: {
    position: 'absolute',
    top: 110,
    right: 75,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(242, 112, 36, 0.2)',
  },

  // Bottom Wave Styles
  bottomWaveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    overflow: 'hidden',
  },
  bottomMainGradient: {
    ...StyleSheet.absoluteFill,
    opacity: 0.6,
  },
  bottomWaveAccent: {
    position: 'absolute',
    bottom: -60,
    right: -30,
    width: SCREEN_WIDTH * 1.15,
    height: 130,
    borderTopLeftRadius: 240,
    borderTopRightRadius: 180,
    transform: [{ rotate: '5deg' }],
    opacity: 0.85,
  },
  bottomWaveMask: {
    position: 'absolute',
    bottom: 40,
    left: -30,
    width: SCREEN_WIDTH * 1.2,
    height: 110,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 240,
    transform: [{ rotate: '-4deg' }],
  },
});

export default AuthWaveBackground;
