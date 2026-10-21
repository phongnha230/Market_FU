import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { OnboardingTopCapsule } from '../components/OnboardingTopCapsule';
import { OnboardingFloatingBubbles } from '../components/OnboardingFloatingBubbles';
import { OnboardingEscrowTimeline } from '../components/OnboardingEscrowTimeline';
import { ONBOARDING_GUARANTEES } from '../constants/onboarding.constants';
import { Onboarding3ScreenProps } from '../types/onboarding.types';
import { useUserStore } from '../../../stores/userStore';

const { height: SCREEN_H } = Dimensions.get('window');
const isSmallScreen = SCREEN_H < 720;

export const Onboarding3Screen: React.FC<Onboarding3ScreenProps> = ({
  onFinish,
  onBack,
  onSkip,
  navigation: propNav,
}) => {
  const insets = useSafeAreaInsets();
  const hookNav = useNavigation<any>();
  const navigation = propNav || hookNav;

  const handleStartHome = () => {
    useUserStore.getState().completeOnboarding();
    if (onFinish) {
      onFinish();
    } else if (navigation?.navigate) {
      navigation.navigate('MainTabs');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    useUserStore.getState().completeOnboarding();
    if (onSkip) {
      onSkip();
    } else if (navigation?.navigate) {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      <OnboardingFloatingBubbles />

      {/* Top Header Capsule */}
      <OnboardingTopCapsule
        currentStep={3}
        onBack={handleBack}
        onSkip={handleSkip}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <View style={styles.topSection}>
          {/* Hero 3D Glass Bubble Centerpiece */}
          <View style={styles.heroCenterpieceWrapper}>
            {/* Outer Aura Glow */}
            <LinearGradient
              colors={['rgba(243, 112, 33, 0.25)', 'rgba(0, 172, 119, 0.2)', 'transparent']}
              style={styles.auraGlow}
            />

            {/* Main Glass Sphere Bubble */}
            <View style={styles.glassSphere}>
              {/* Glass Reflection Highlight */}
              <View style={styles.sphereHighlight} />

              {/* 3D Shield Lock Icon */}
              <View style={styles.shieldIconBox}>
                <Ionicons name="shield" size={50} color="#F37021" />
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                </View>
              </View>

              {/* Mini Verified Bubble Badge */}
              <View style={styles.miniVerifiedBadge}>
                <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* Punchy Headline & Subtext */}
          <View style={styles.headingSection}>
            <View style={styles.escrowBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.escrowBadgeText}>VÍ ESCROW SINH VIÊN FPT</Text>
            </View>
            <Text style={styles.mainTitle}>An toàn 100% · Mua bán an tâm</Text>
            <Text style={styles.subTitle}>
              Cơ chế bảo vệ tiền minh bạch, tự tin trao đổi trong toàn campus.
            </Text>
          </View>

          {/* Section: 4 Escrow Bubble Flow */}
          <OnboardingEscrowTimeline />

          {/* Section: 3 Compact Guarantee Tags */}
          <View style={styles.guaranteeGrid}>
            {ONBOARDING_GUARANTEES.map((item) => (
              <View key={item.id} style={styles.guaranteeCard}>
                <View style={[styles.guaranteeIconBox, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                </View>
                <Text style={styles.guaranteeTitle}>{item.title}</Text>
                <Text style={styles.guaranteeSub}>{item.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Actions Dock */}
        <View style={styles.bottomDock}>
          <TouchableOpacity activeOpacity={0.88} onPress={handleStartHome}>
            <LinearGradient
              colors={['#F37021', '#EA580C', '#FF9F43']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Vào Trang Chủ Ngay 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.microDisclaimer}>
            Duyệt đồ tự do · Đăng nhập khi phát sinh giao dịch
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  topSection: {
    flex: 1,
  },
  heroCenterpieceWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: isSmallScreen ? 10 : 16,
    position: 'relative',
  },
  auraGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  glassSphere: {
    width: isSmallScreen ? 100 : 115,
    height: isSmallScreen ? 100 : 115,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
    position: 'relative',
  },
  sphereHighlight: {
    position: 'absolute',
    top: 8,
    left: 14,
    width: 32,
    height: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ rotate: '-28deg' }],
  },
  shieldIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 14,
  },
  miniVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  headingSection: {
    alignItems: 'center',
    marginVertical: isSmallScreen ? 6 : 10,
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 250, 229, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 5,
    marginBottom: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  escrowBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: isSmallScreen ? 20 : 23,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  guaranteeGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: isSmallScreen ? 6 : 10,
  },
  guaranteeCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  guaranteeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  guaranteeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 14,
  },
  guaranteeSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  bottomDock: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  microDisclaimer: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 6,
  },
});

export default Onboarding3Screen;
