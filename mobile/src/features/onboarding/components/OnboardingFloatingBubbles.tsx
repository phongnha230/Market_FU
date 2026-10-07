import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const OnboardingFloatingBubbles: React.FC = () => {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Big Warm Orange Bubble Top Right */}
      <LinearGradient
        colors={['rgba(243, 112, 33, 0.22)', 'rgba(254, 215, 170, 0.12)', 'transparent']}
        style={[styles.bubble, styles.bubbleTopRight]}
      />

      {/* Teal / Mint Bubble Mid Left */}
      <LinearGradient
        colors={['rgba(0, 172, 119, 0.18)', 'rgba(110, 231, 183, 0.10)', 'transparent']}
        style={[styles.bubble, styles.bubbleMidLeft]}
      />

      {/* Soft Blue Orb Bottom Left */}
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.15)', 'rgba(219, 234, 254, 0.08)', 'transparent']}
        style={[styles.bubble, styles.bubbleBottomLeft]}
      />

      {/* Small glowing glass bead floating */}
      <View style={[styles.glassOrb, styles.orb1]} />
      <View style={[styles.glassOrb, styles.orb2]} />
      <View style={[styles.glassOrb, styles.orb3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    borderRadius: 999,
  },
  bubbleTopRight: {
    top: -50,
    right: -50,
    width: 250,
    height: 250,
  },
  bubbleMidLeft: {
    top: '28%',
    left: -70,
    width: 220,
    height: 220,
  },
  bubbleBottomLeft: {
    bottom: -60,
    left: -40,
    width: 260,
    height: 260,
  },
  glassOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  orb1: {
    top: 130,
    right: 28,
    width: 28,
    height: 28,
  },
  orb2: {
    top: 260,
    left: 20,
    width: 18,
    height: 18,
  },
  orb3: {
    bottom: 220,
    right: 32,
    width: 24,
    height: 24,
  },
});

export default OnboardingFloatingBubbles;
