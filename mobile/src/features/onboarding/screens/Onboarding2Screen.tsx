import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CampusSelectionGrid from '../components/CampusSelectionGrid';
import { Onboarding2ScreenProps } from '../types/onboarding.types';
import { useCampusStore } from '../../../stores/useCampusStore';

export const Onboarding2Screen: React.FC<Onboarding2ScreenProps & { navigation?: any }> = ({
  onNext,
  onBack,
  onSkip,
  navigation: propNav,
}) => {
  const insets = useSafeAreaInsets();
  const hookNav = useNavigation<any>();
  const navigation = propNav || hookNav;
  const [selectedCampusId, setSelectedCampusId] = useState('hn');
  const { setCampus } = useCampusStore();

  const handleFinish = () => {
    if (selectedCampusId === 'hn') setCampus('HÒA LẠC');
    else if (selectedCampusId === 'hcm') setCampus('TP.HCM');
    else if (selectedCampusId === 'dn') setCampus('ĐÀ NẴNG');
    else if (selectedCampusId === 'ct') setCampus('CẦN THƠ');

    if (onNext) {
      onNext();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Onboarding3');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
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
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={13} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.badgeText}>Chọn Cơ Sở Chính Của Bạn</Text>
        </View>

        <Text style={styles.heading}>Bạn đang học tập tại Campus nào?</Text>
        <Text style={styles.subheading}>
          Ứng dụng sẽ tự động ưu tiên gợi ý các món đồ cũ gần ký túc xá và sảnh tòa nhà của bạn.
        </Text>

        <CampusSelectionGrid
          selectedId={selectedCampusId}
          onSelect={setSelectedCampusId}
        />

        <View style={styles.safePointBox}>
          <Ionicons name="location" size={18} color="#F27024" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.safeTitle}>Trạm Safe-Handoff Point mặc định</Text>
            <Text style={styles.safeDesc}>Bàn test sạc & đồ điện Sảnh Alpha (Camera 24/7)</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.finishBtn} activeOpacity={0.88} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>Tiếp tục: Quy chế Escrow an toàn  →</Text>
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
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 10 },
  badgeText: { fontSize: 10.5, fontWeight: '800', color: '#059669' },
  heading: { fontSize: 20, fontWeight: '900', color: '#0F172A', lineHeight: 26, marginBottom: 6 },
  subheading: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 16 },
  safePointBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FED7AA' },
  safeTitle: { fontSize: 11.5, fontWeight: '800', color: '#9A3412' },
  safeDesc: { fontSize: 10.5, color: '#C2410C', marginTop: 1 },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  finishBtn: { backgroundColor: '#F27024', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  finishBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default Onboarding2Screen;
