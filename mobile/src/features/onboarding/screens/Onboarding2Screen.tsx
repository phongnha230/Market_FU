import React, { useState } from 'react';
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
import { OnboardingStationToggle } from '../components/OnboardingStationToggle';
import { OnboardingCampusSelector } from '../components/OnboardingCampusSelector';
import {
  ONBOARDING_STATIONS,
  ONBOARDING_CAMPUSES,
  ONBOARDING_SAFETY_STEPS,
  StationItem,
  CampusItem,
} from '../constants/onboarding.constants';
import { Onboarding2ScreenProps } from '../types/onboarding.types';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useUserStore } from '../../../stores/userStore';

const { height: SCREEN_H } = Dimensions.get('window');
const isSmallScreen = SCREEN_H < 720;

const HUB_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWCFrVuzWElejd6w9JbuIj3AbDwmGDIWIv1hGzpqv-9JrsBnLbJhUmZgM1szG0jYfQo8se4EoEPVXK3oFEMoEXluqfPW271a2SbJiUEv0GiF6TKQyjmvmwEZi5MRpS23Dr-ouOdM5fW5zxKARRTBMfNQS_8zyZEwZ0n70Uk33YNb1fnZ4uLdploDksFv9DM-Cwcno9y3Aqmi-lGzQE2bvtQJAS668S7kkS-Ty7ZVdzRfOzfi3qyeCX0g';

export const Onboarding2Screen: React.FC<Onboarding2ScreenProps & { navigation?: any }> = ({
  onNext,
  onBack,
  onSkip,
  navigation: propNav,
}) => {
  const insets = useSafeAreaInsets();
  const hookNav = useNavigation<any>();
  const navigation = propNav || hookNav;

  const { setCampus } = useCampusStore();
  const [selectedStation, setSelectedStation] = useState<StationItem>(ONBOARDING_STATIONS[0]);
  const [selectedCampus, setSelectedCampus] = useState<CampusItem>(ONBOARDING_CAMPUSES[0]);

  const handleSelectCampus = (campus: CampusItem) => {
    setSelectedCampus(campus);
    if (campus.campusCode) {
      setCampus(campus.campusCode as any);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (navigation?.navigate) {
      navigation.navigate('Onboarding3');
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

      {/* Header Capsule */}
      <OnboardingTopCapsule
        currentStep={2}
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
          {/* Header Title Section */}
          <View style={styles.headerTitleSection}>
            <View style={styles.verifiedSafeBadge}>
              <View style={styles.pulseDot} />
              <Ionicons name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.verifiedSafeText}>Safe-Point 100% An Toàn</Text>
            </View>

            <Text style={styles.mainTitle}>Điểm Hẹn An Toàn & 5 Campus</Text>
            <Text style={styles.subTitle}>
              Giao dịch minh bạch sinh viên FPT • Hẹn sảnh có camera & test máy
            </Text>
          </View>

          {/* 1. COMPACT VISUAL CARD: SAFE-POINT & 3 BUBBLE STATIONS */}
          <View style={styles.hubCard}>
            <View style={styles.hubImageWrapper}>
              <Image
                source={{ uri: HUB_IMAGE_URL }}
                placeholder={require('../../../../assets/images/fpt_campus_hero.jpg')}
                style={styles.hubImage}
                contentFit="cover"
              />
              <LinearGradient
                colors={['rgba(15, 23, 42, 0.25)', 'transparent', 'rgba(15, 23, 42, 0.88)']}
                style={styles.hubOverlay}
              />

              {/* Inside Picture: Top tags */}
              <View style={styles.hubTopTags}>
                <View style={styles.hubGlassTag}>
                  <Ionicons name="videocam" size={12} color="#34D399" style={{ marginRight: 3 }} />
                  <Text style={styles.hubGlassTagText}>Camera 24/7</Text>
                </View>
                <View style={styles.hubGreenTag}>
                  <Ionicons name="shield" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.hubGreenTagText}>Bảo vệ trực</Text>
                </View>
              </View>

              {/* Inside Picture: Bottom active display */}
              <View style={styles.hubBottomBar}>
                <View style={{ flex: 1 }}>
                  <View style={styles.activeStationRow}>
                    <View style={styles.amberDot} />
                    <Text style={styles.activeStationLabel}>TRẠM KÍCH HOẠT:</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="navigate-circle" size={14} color="#F37021" style={{ marginRight: 4 }} />
                    <Text style={styles.activeStationTitle} numberOfLines={1}>
                      {selectedStation.title}
                    </Text>
                  </View>
                </View>
                <View style={styles.testBadgePill}>
                  <Text style={styles.testBadgeText}>{selectedStation.badge}</Text>
                </View>
              </View>
            </View>

            {/* 3 Station Toggle Chips */}
            <OnboardingStationToggle
              selectedStationId={selectedStation.id}
              onSelectStation={setSelectedStation}
            />
          </View>

          {/* 2. CAMPUS SELECTION: 5 BUBBLE PILLS */}
          <View style={styles.campusSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="school" size={15} color="#F37021" style={{ marginRight: 5 }} />
                <Text style={styles.sectionTitle}>Chọn 5 Campus sinh viên</Text>
              </View>
              <View style={styles.touchHintBadge}>
                <Text style={styles.touchHintText}>Chạm để đổi</Text>
              </View>
            </View>

            <OnboardingCampusSelector
              selectedCampusId={selectedCampus.id}
              onSelectCampus={handleSelectCampus}
            />
          </View>

          {/* 3. ULTRA CONCISE 3-STEP PROCESS */}
          <View style={styles.processSection}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={15} color="#059669" style={{ marginRight: 5 }} />
                <Text style={styles.sectionTitle}>Quy trình mua bán an toàn</Text>
              </View>
              <View style={styles.transparentBadge}>
                <Text style={styles.transparentBadgeText}>Minh bạch</Text>
              </View>
            </View>

            <View style={styles.stepsList}>
              {ONBOARDING_SAFETY_STEPS.map((item) => (
                <View key={item.step} style={styles.stepCard}>
                  <View style={styles.stepCardLeft}>
                    <View style={[styles.stepNumberCircle, { backgroundColor: item.numberBg }]}>
                      <Text style={[styles.stepNumberText, { color: item.numberColor }]}>
                        {item.step}
                      </Text>
                    </View>
                    <Text style={styles.stepCardTitle}>{item.title}</Text>
                  </View>
                  <View style={[styles.stepBadgeBox, { backgroundColor: item.badgeBg }]}>
                    <Text style={[styles.stepBadgeText, { color: item.badgeColor }]}>
                      {item.badge}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
              <Text style={styles.primaryBtnText}>Tiếp tục: Cơ chế Escrow</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Trust Disclaimer (Updated: no @fpt.edu.vn per user request) */}
          <View style={styles.trustDisclaimerRow}>
            <Ionicons name="shield-checkmark" size={13} color="#059669" style={{ marginRight: 4 }} />
            <Text style={styles.trustDisclaimerText}>
              Bảo vệ bởi mã hóa sinh viên <Text style={styles.boldText}>FAP SSO</Text>
            </Text>
          </View>
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
  headerTitleSection: {
    alignItems: 'center',
    marginVertical: isSmallScreen ? 6 : 10,
  },
  verifiedSafeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(209, 250, 229, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 4,
    marginBottom: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  verifiedSafeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  mainTitle: {
    fontSize: isSmallScreen ? 20 : 23,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  hubCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    padding: 10,
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 12,
  },
  hubImageWrapper: {
    position: 'relative',
    width: '100%',
    height: isSmallScreen ? 130 : 145,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  hubImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  hubOverlay: {
    ...StyleSheet.absoluteFill,
  },
  hubTopTags: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hubGlassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  hubGlassTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hubGreenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.85)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  hubGreenTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hubBottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  activeStationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FBBF24',
  },
  activeStationLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.4,
  },
  activeStationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  testBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  testBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  campusSection: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  touchHintBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  touchHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  processSection: {
    marginBottom: 10,
  },
  transparentBadge: {
    backgroundColor: 'rgba(209, 250, 229, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  transparentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  stepsList: {
    gap: 7,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  stepCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '900',
  },
  stepCardTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepBadgeBox: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  trustDisclaimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  trustDisclaimerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  boldText: {
    fontWeight: '800',
    color: '#0F172A',
  },
});

export default Onboarding2Screen;
