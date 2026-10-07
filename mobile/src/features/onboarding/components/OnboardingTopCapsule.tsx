import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingTopCapsuleProps {
  currentStep: 1 | 2 | 3;
  onBack?: () => void;
  onSkip?: () => void;
}

export const OnboardingTopCapsule: React.FC<OnboardingTopCapsuleProps> = ({
  currentStep,
  onBack,
  onSkip,
}) => {
  return (
    <View style={styles.container}>
      {/* Back button (Only for Step 2 and Step 3 if onBack provided) */}
      {currentStep > 1 && onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.75}
          onPress={onBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
      ) : currentStep === 1 ? (
        // Step 1: Step indicator capsule
        <View style={styles.stepCapsule1}>
          <View style={styles.indicatorPills}>
            <View style={[styles.pill, styles.pillActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.stepText1}>1/3</Text>
        </View>
      ) : (
        <View style={{ width: 40 }} />
      )}

      {/* Center content */}
      {currentStep === 1 ? (
        // 5 Campus Live Pulse
        <View style={styles.liveBadge}>
          <View style={styles.pulseDotWrapper}>
            <View style={styles.pulseDotPing} />
            <View style={styles.pulseDot} />
          </View>
          <Text style={styles.liveBadgeText}>5 Campus Live</Text>
        </View>
      ) : (
        // Step 2 & 3: Capsule Stepper
        <View style={styles.stepCapsuleCentered}>
          <Text style={styles.stepCapsuleText}>
            BƯỚC {currentStep}/3
          </Text>
          <View style={styles.dotsGroup}>
            <View style={styles.stepperDot} />
            <View
              style={[
                styles.stepperDot,
                currentStep === 2 && styles.stepperPillActive,
              ]}
            />
            <View
              style={[
                styles.stepperDot,
                currentStep === 3 && styles.stepperPillActive,
              ]}
            />
          </View>
        </View>
      )}

      {/* Skip Button */}
      {onSkip ? (
        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.7}
          onPress={onSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
          {currentStep === 1 && (
            <Ionicons name="chevron-forward" size={13} color="#64748B" style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ width: 50 }} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 50,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  stepCapsule1: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  indicatorPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  pillActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F37021',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  stepText1: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 250, 229, 0.65)',
    borderColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  pulseDotWrapper: {
    position: 'relative',
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDotPing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    opacity: 0.4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  stepCapsuleCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepCapsuleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F37021',
    letterSpacing: 0.4,
  },
  dotsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  stepperPillActive: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F37021',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});

export default OnboardingTopCapsule;
