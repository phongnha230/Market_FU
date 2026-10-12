import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { OnboardingTopCapsule } from '../components/OnboardingTopCapsule';
import { OnboardingFloatingBubbles } from '../components/OnboardingFloatingBubbles';
import { Onboarding1ScreenProps } from '../types/onboarding.types';
import { useUserStore } from '../../../stores/userStore';

const { height: SCREEN_H } = Dimensions.get('window');
const isSmallScreen = SCREEN_H < 720;

const HERO_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDK4hZYw1EkG_fPJnaT1JZEU-2Z62Z97NaKFs6l1tmfgs6w5JHu3nM8_Xaut8XmBpJHHo0BWn5JA9ibGAg8g7LGNJ4lkUxmci2S0ec4cHxNE7ygEnE_Zl1ESFCSfXPBGJ-5kp8e8bU5MO4_zxz0d7yd3gL_FokGrkxmhuVcCs-kCNdB3yJduKapM_NQQ_mWuZxPI6Nrywd39R8P0n6uJGFOH_7QeYUqc51Wzzb558r2fP67VxyRtQuyPQ';

export const Onboarding1Screen: React.FC<Onboarding1ScreenProps & { navigation?: any }> = ({
  onNext,
  onSkip,
  navigation: propNav,
}) => {
  const insets = useSafeAreaInsets();
  const hookNav = useNavigation<any>();
  const navigation = propNav || hookNav;

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (navigation?.navigate) {
      navigation.navigate('Onboarding2');
    }
  };

  const handleSkip = () => {
    useUserStore.getState().completeOnboarding();
    if (onSkip) {
      onSkip();
    } else if (navigation?.replace) {
      navigation.replace('MainTabs');
    } else if (navigation?.navigate) {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 8) }]}>
      <OnboardingFloatingBubbles />

      {/* Header Capsule */}
      <OnboardingTopCapsule currentStep={1} onSkip={handleSkip} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 12 },
        ]}
      >
        <View style={styles.topSection}>
          {/* Hero Media Card */}
          <View style={styles.heroCardContainer}>
            <View style={styles.heroImageWrapper}>
              <Image
                source={{ uri: HERO_IMAGE_URL }}
                placeholder={require('../../../../assets/images/fpt_campus_hero.jpg')}
                style={styles.heroImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.45)']}
                style={styles.imageOverlay}
              />

              {/* Campus Tags (Top Row) */}
              <View style={styles.campusTopRow}>
                <View style={styles.campusChipsGroup}>
                  <View style={styles.glassTag}>
                    <Text style={styles.glassTagText}>Hà Nội</Text>
                  </View>
                  <View style={styles.glassTag}>
                    <Text style={styles.glassTagText}>TP.HCM</Text>
                  </View>
                  <View style={styles.glassTag}>
                    <Text style={styles.glassTagText}>Đà Nẵng</Text>
                  </View>
                </View>
                <View style={[styles.glassTag, styles.plusCampusTag]}>
                  <Text style={styles.plusCampusTagText}>+2 Campus</Text>
                </View>
              </View>

              {/* Badges (Bottom Row) */}
              <View style={styles.heroBottomBadges}>
                <View style={styles.glassPillBadge}>
                  <LinearGradient
                    colors={['#F37021', '#EA580C']}
                    style={styles.badgeIconCircle}
                  >
                    <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                  </LinearGradient>
                  <View>
                    <Text style={styles.badgeTitle}>Safe-Point</Text>
                    <Text style={styles.badgeSub}>Sảnh Alpha/Beta</Text>
                  </View>
                </View>

                <View style={styles.glassPillBadge}>
                  <Ionicons name="checkmark-circle" size={15} color="#059669" />
                  <Text style={styles.badgeTextRight}>100% FAP SSO</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Title & Micro Headline */}
          <View style={styles.headingSection}>
            <View style={styles.ecoBadge}>
              <Ionicons name="shield-half" size={12} color="#F37021" />
              <Text style={styles.ecoBadgeText}>FPT ECO-SYSTEM</Text>
            </View>
            <Text style={styles.mainTitle}>
              Chợ Sinh Viên <Text style={styles.orangeTitleText}>FPT</Text>
            </Text>
            <Text style={styles.subTitle}>
              Trao đổi đồ học tập & công nghệ an toàn nội bộ trường.
            </Text>
          </View>

          {/* 3 Short Glass Bubble Pills (Ultra-Compact) */}
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="card-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.featureCardTitle}>100% MSSV FAP</Text>
              <Text style={[styles.featureCardSub, { color: '#059669' }]}>Không nick ảo</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="storefront-outline" size={18} color="#2563EB" />
              </View>
              <Text style={styles.featureCardTitle}>Hẹn Sảnh Trường</Text>
              <Text style={[styles.featureCardSub, { color: '#F37021' }]}>Có Camera 24/7</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#059669" />
              </View>
              <Text style={styles.featureCardTitle}>Ví Escrow 0đ</Text>
              <Text style={[styles.featureCardSub, { color: '#059669' }]}>Test máy mới trả</Text>
            </View>
          </View>

          {/* Pagination Dots */}
          <View style={styles.dotsRow}>
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
          </View>
        </View>

        {/* Bottom Actions Dock */}
        <View style={styles.bottomDock}>
          <TouchableOpacity activeOpacity={0.88} onPress={handleNext}>
            <LinearGradient
              colors={['#F37021', '#EA580C', '#FF9F43']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Bắt đầu khám phá</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subActionBtn}
            activeOpacity={0.7}
            onPress={handleSkip}
          >
            <Ionicons name="eye-outline" size={15} color="#64748B" style={{ marginRight: 5 }} />
            <Text style={styles.subActionText}>Duyệt khách tự do</Text>
          </TouchableOpacity>
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
    paddingTop: 8,
  },
  topSection: {
    flex: 1,
  },
  heroCardContainer: {
    borderRadius: 26,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: isSmallScreen ? 10 : 14,
  },
  heroImageWrapper: {
    position: 'relative',
    width: '100%',
    height: isSmallScreen ? 165 : 190,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
  },
  campusTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  campusChipsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  glassTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  glassTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  plusCampusTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  plusCampusTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F37021',
  },
  heroBottomBadges: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  glassPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 12,
  },
  badgeSub: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 10,
  },
  badgeTextRight: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#0F172A',
  },
  headingSection: {
    alignItems: 'center',
    marginVertical: isSmallScreen ? 8 : 12,
  },
  ecoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 215, 170, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(243, 112, 33, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 4,
    marginBottom: 6,
  },
  ecoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: isSmallScreen ? 22 : 25,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  orangeTitleText: {
    color: '#F37021',
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: isSmallScreen ? 8 : 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 14,
  },
  featureCardSub: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 10,
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F37021',
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  bottomDock: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  subActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  subActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
});

export default Onboarding1Screen;
