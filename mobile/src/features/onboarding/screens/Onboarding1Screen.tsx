import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingFeatureItem from '../components/OnboardingFeatureItem';
import { Onboarding1ScreenProps } from '../types/onboarding.types';

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
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Onboarding2');
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (navigation && navigation.replace) {
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroBox}>
          <Image
            source={require('../../../../assets/images/fpt_campus_hero.jpg')}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>CHỢ ĐỒ CŨ SINH VIÊN FPT</Text>
          </View>
        </View>

        <Text style={styles.mainHeading}>
          Trao đổi đồ cũ sinh viên{'\n'}
          <Text style={styles.highlight}>An toàn • Nhanh gọn • Tiết kiệm</Text>
        </Text>

        <OnboardingFeatureItem
          iconBg="#DCFCE7"
          iconColor="#059669"
          iconName="shield-checkmark"
          title="Safe-Handoff Point"
          titleBadge="Bàn test sạc & điện"
          desc="Giao dịch trực tiếp tại sảnh tòa Alpha & thư viện có bảo vệ và camera giám sát."
        />
        <OnboardingFeatureItem
          iconBg="#EFF6FF"
          iconColor="#1D4ED8"
          iconName="school"
          title="FPT KYC Pass"
          titleBadge="Xác minh email FPT"
          desc="100% người bán và người mua đều là sinh viên FPT đã được định danh số thẻ."
        />
        <OnboardingFeatureItem
          iconBg="#FFF7ED"
          iconColor="#EA580C"
          iconName="flash"
          title="CampusShip Liên Cơ Sở"
          titleBadge="Hòa Lạc - HCM - ĐN"
          desc="Gửi và nhận đồ qua hệ thống Locker thông minh giữa các cơ sở của trường."
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextBtn} activeOpacity={0.88} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Tiếp tục khám phá ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0', marginRight: 6 },
  dotActive: { width: 22, backgroundColor: '#F27024' },
  skipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  heroBox: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 14 },
  heroImage: { width: '100%', height: '100%' },
  heroBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  heroBadgeText: { color: '#FFFFFF', fontSize: 9.5, fontWeight: '900' },
  mainHeading: { fontSize: 20, fontWeight: '900', color: '#0F172A', lineHeight: 26, marginBottom: 16 },
  highlight: { color: '#F27024' },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  nextBtn: { backgroundColor: '#F27024', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default Onboarding1Screen;
