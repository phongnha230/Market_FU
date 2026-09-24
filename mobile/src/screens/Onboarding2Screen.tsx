import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────────────────────
export interface CampusItem {
  id: string;
  name: string;
  sub: string;
}

const CAMPUSES: CampusItem[] = [
  { id: 'hn', name: 'Hà Nội', sub: 'Hola Campus' },
  { id: 'hcm', name: 'TP.HCM', sub: 'Khu Công Nghệ\nCao' },
  { id: 'dn', name: 'Đà Nẵng', sub: 'KĐT FPT City' },
  { id: 'qn', name: 'Quy Nhơn', sub: 'An Phú Thịnh' },
  { id: 'ct', name: 'Cần Thơ', sub: 'Đường Nguyễn\nVăn Cừ' },
];

interface SafePointItem {
  id: string;
  label: string;
  fullName: string;
}

const SAFE_POINTS: SafePointItem[] = [
  { id: 'alpha', label: 'Sảnh Alpha', fullName: 'Sảnh Alpha (Tòa Innovation) - Camera 360°' },
  { id: 'beta', label: 'Thư viện Beta', fullName: 'Sảnh Thư viện Beta (Tầng 1) - Camera 360°' },
  { id: 'domB', label: 'KTX Dom B', fullName: 'Khu KTX Dom B (Sân Trung tâm) - Có bàn test' },
];

export interface Onboarding2ScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Onboarding2Screen: React.FC<Onboarding2ScreenProps> = ({
  onNext,
  onBack,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedCampus, setSelectedCampus] = useState<string>('hn');
  const [selectedPoint, setSelectedPoint] = useState<string>('alpha');

  const currentSafePoint = SAFE_POINTS.find((p) => p.id === selectedPoint) || SAFE_POINTS[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ═══════════════════════════════════════════════════════════
          1. TOP BAR: Back Arrow + 4 Dots + Bỏ qua
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        {/* 4 Steps Indicator: Dot 2 is active (wide pill) */}
        <View style={styles.dotsRow}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <TouchableOpacity
          style={styles.skipBtn}
          activeOpacity={0.7}
          onPress={onSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          SCROLLABLE CONTENT
      ═══════════════════════════════════════════════════════════ */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════════════════
            2. TRUST BADGE & HEADLINE
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.headerSection}>
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#4338CA" style={{ marginRight: 5 }} />
            <Text style={styles.shieldBadgeText}>Bảo hộ giao dịch 100%</Text>
          </View>

          <Text style={styles.mainTitle}>
            Giao nhận an toàn tại Trạm Safe-Handoff hoặc Ship Liên Cơ Sở
          </Text>

          <Text style={styles.subtitle}>
            Hệ thống trạm hẹn giao dịch có camera giám sát và tiện ích kiểm tra sản phẩm độc quyền cho sinh viên.
          </Text>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. HERO CARD: Network Badge + Image + Chips
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.heroCard}>
          {/* Header inside Hero Card */}
          <View style={styles.heroCardHeader}>
            <View style={styles.networkInfo}>
              <View style={styles.networkIconBox}>
                <Ionicons name="git-network" size={20} color="#EA580C" />
              </View>
              <Text style={styles.networkTitle}>Mạng lưới 5 Cơ sở{'\n'}Toàn quốc</Text>
            </View>

            <View style={styles.handoffBadge}>
              <Text style={styles.handoffBadgeText}>12 Trạm Safe-{'\n'}Handoff</Text>
            </View>
          </View>

          {/* Campus Aerial Image with Overlays */}
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/images/fpt_campus_hero.jpg')}
              style={styles.campusImage}
              contentFit="cover"
            />

            {/* Top Node Tag */}
            <View style={styles.imageNodeTag}>
              <Text style={styles.imageNodeText}>FPT Safe-Point Campus Map 360°</Text>
            </View>

            {/* Virtual Building Markers */}
            <View style={[styles.markerTag, { top: 38, left: 18 }]}>
              <Text style={styles.markerText}>SAFE POINT 1</Text>
            </View>
            <View style={[styles.markerTag, { top: 28, left: 120 }]}>
              <Text style={styles.markerText}>TÒA INNOVATION</Text>
            </View>
            <View style={[styles.markerTag, { top: 22, right: 30 }]}>
              <Text style={styles.markerText}>THƯ VIỆN BETA</Text>
            </View>

            {/* Bottom Dark Overlay */}
            <View style={styles.imageBottomOverlay}>
              <View style={styles.selectedPointRow}>
                <View style={styles.greenPulseDot} />
                <Text style={styles.selectedPointLabel}>Trạm Safe-Handoff đang chọn:</Text>
              </View>
              <View style={styles.selectedPointNameRow}>
                <Text style={styles.selectedPointName} numberOfLines={1}>
                  {currentSafePoint.fullName}
                </Text>
                <View style={styles.guaranteeTag}>
                  <Text style={styles.guaranteeTagText}>Bảo đảm</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Interactive Safe-Point Chips */}
          <View style={styles.safeChipsRow}>
            {SAFE_POINTS.map((sp) => {
              const isSelected = sp.id === selectedPoint;
              return (
                <TouchableOpacity
                  key={sp.id}
                  style={[styles.safeChip, isSelected && styles.safeChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPoint(sp.id)}
                >
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color={isSelected ? '#FFFFFF' : '#EF4444'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.safeChipText, isSelected && styles.safeChipTextActive]}>
                    {sp.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. CHỌN CƠ SỞ CỦA BẠN (CAMPUS SELECTOR)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.campusSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Chọn cơ sở của bạn</Text>
            <Text style={styles.sectionSub}>Có thể đổi sau</Text>
          </View>

          {/* 3x2 Grid */}
          <View style={styles.campusGrid}>
            {CAMPUSES.map((c) => {
              const isSelected = selectedCampus === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.campusCard, isSelected && styles.campusCardActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCampus(c.id)}
                >
                  <Text style={[styles.campusName, isSelected && styles.campusNameActive]}>
                    {c.name}
                  </Text>
                  <Text style={styles.campusSub} numberOfLines={2}>
                    {c.sub}
                  </Text>
                  <View
                    style={[
                      styles.campusSelectBtn,
                      isSelected ? styles.campusSelectedBtn : styles.campusUnselectedBtn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.campusSelectBtnText,
                        isSelected ? styles.campusSelectedBtnText : styles.campusUnselectedBtnText,
                      ]}
                    >
                      {isSelected ? 'Đã chọn' : 'Chọn'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* 6th Card: Liên Campus */}
            <TouchableOpacity
              style={[
                styles.campusCard,
                styles.interCampusCard,
                selectedCampus === 'inter' && styles.campusCardActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setSelectedCampus('inter')}
            >
              <MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#1E40AF" />
              <Text style={styles.interCampusText}>Liên Campus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            5. QUY TRÌNH 3 BƯỚC MINH BẠCH
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.processSection}>
          <Text style={styles.sectionTitle}>Quy trình 3 bước minh bạch</Text>

          {/* Step 1 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Xem đồ pass quanh KTX</Text>
              <Text style={styles.stepDesc}>
                Chọn cơ sở bạn đang theo học để lọc bài đăng gần nhất, trao đổi trực tiếp không tốn phí vận chuyển.
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Hẹn tại điểm Safe-Handoff</Text>
              <Text style={styles.stepDesc}>
                Điểm hẹn chỉ định có camera an ninh trường học, ổ điện và dụng cụ test máy điện tử trước khi thanh toán.
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.stepItem}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Ship Liên Cơ Sở qua CampusShip</Text>
              <Text style={styles.stepDesc}>
                Đơn hàng khác campus được lưu kho trung chuyển ký túc xá, phát mã vận đơn theo dõi trạng thái 24/7.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          6. FIXED BOTTOM CTA & FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <View
        style={[
          styles.bottomFixedBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.88}
          onPress={onNext}
        >
          <Text style={styles.ctaButtonText}>Tiếp tục: Quy chế Escrow an toàn</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.bottomFooterText}>
          Bảo mật bằng email sinh viên @fpt.edu.vn
        </Text>
      </View>
    </View>
  );
};

export default Onboarding2Screen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DBEAFE',
  },
  dotActive: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  skipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  // Scroll Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Header Section
  headerSection: {
    marginBottom: 16,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    marginBottom: 12,
  },
  shieldBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },
  mainTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 31,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  networkIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  handoffBadge: {
    backgroundColor: '#6EE7B7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handoffBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#064E3B',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Image & Overlay
  imageWrapper: {
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    marginBottom: 12,
  },
  campusImage: {
    width: '100%',
    height: '100%',
  },
  imageNodeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageNodeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  markerTag: {
    position: 'absolute',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  markerText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  imageBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectedPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  selectedPointLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedPointNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPointName: {
    flex: 1,
    fontSize: 11,
    color: '#CBD5E1',
    marginRight: 6,
  },
  guaranteeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  guaranteeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Safe chips
  safeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 20,
  },
  safeChipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  safeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  safeChipTextActive: {
    color: '#FFFFFF',
  },

  // Campus Selector Section
  campusSection: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  campusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  campusCard: {
    width: (SCREEN_W - 40 - 20) / 3, // 3 columns with 10px gap
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  campusCardActive: {
    borderColor: '#FB923C',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  campusName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  campusNameActive: {
    color: '#EA580C',
  },
  campusSub: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 6,
  },
  campusSelectBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  campusSelectedBtn: {
    backgroundColor: '#FFEDD5',
    borderWidth: 0.8,
    borderColor: '#FDBA74',
  },
  campusUnselectedBtn: {
    backgroundColor: '#EFF6FF',
  },
  campusSelectBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  campusSelectedBtnText: {
    color: '#EA580C',
  },
  campusUnselectedBtnText: {
    color: '#3B82F6',
  },
  interCampusCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  interCampusText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
  },

  // 3 Steps Section
  processSection: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  stepNumberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#C2410C',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },

  // Bottom Fixed Bar
  bottomFixedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bottomFooterText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
