import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// Feature Item Component
// ─────────────────────────────────────────────────────────────────────────────
interface FeatureItemProps {
  iconBg: string;
  iconColor: string;
  iconName: string;
  iconLib?: 'ionicons' | 'mci';
  title: string;
  titleBadge?: string;
  titleBadgeColor?: string;
  desc: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  iconBg,
  iconColor,
  iconName,
  iconLib = 'ionicons',
  title,
  titleBadge,
  titleBadgeColor = '#059669',
  desc,
}) => (
  <View style={featureStyles.row}>
    <View style={[featureStyles.iconBox, { backgroundColor: iconBg }]}>
      {iconLib === 'mci' ? (
        <MaterialCommunityIcons name={iconName as any} size={22} color={iconColor} />
      ) : (
        <Ionicons name={iconName as any} size={22} color={iconColor} />
      )}
    </View>
    <View style={featureStyles.textBox}>
      <View style={featureStyles.titleRow}>
        <Text style={featureStyles.title}>{title}</Text>
        {titleBadge && (
          <View style={[featureStyles.badge, { backgroundColor: titleBadgeColor + '22', borderColor: titleBadgeColor + '44' }]}>
            <Text style={[featureStyles.badgeText, { color: titleBadgeColor }]}>{titleBadge}</Text>
          </View>
        )}
      </View>
      <Text style={featureStyles.desc}>{desc}</Text>
    </View>
  </View>
);

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBox: {
    flex: 1,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 7,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  desc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding1Screen
// ─────────────────────────────────────────────────────────────────────────────
interface Onboarding1ScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

const Onboarding1Screen: React.FC<Onboarding1ScreenProps> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 0) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* ═══════════════════════════════════════════════════════════
          1. TOP BAR: Dot indicators + Skip
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.topBar}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkip}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          2. SYSTEM BADGE ROW
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.systemBadgeRow}>
        <View style={styles.systemBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#1D4ED8" style={{ marginRight: 5 }} />
          <Text style={styles.systemBadgeText}>HỆ THỐNG 5 CƠ SỞ</Text>
        </View>
        <View style={styles.connectedChip}>
          <View style={styles.greenDot} />
          <Text style={styles.connectedText}>Đang kết nối liên Campus</Text>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          3. HERO IMAGE with overlays
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.heroContainer}>
        <Image
          source={require('../../assets/images/fpt_campus_hero.jpg')}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Gradient overlay bottom */}
        <View style={styles.heroGradient} />

        {/* Campus location chips top */}
        <View style={styles.campusChipsRow}>
          {['Hòa Lạc', 'TP. HCM', 'Đà Nẵng', 'Quy Nhơn'].map((c) => (
            <View key={c} style={styles.campusChip}>
              <Text style={styles.campusChipText}>{c}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.campusChipsRow, { marginTop: 6 }]}>
          <View style={styles.campusChip}>
            <Text style={styles.campusChipText}>Cần Thơ</Text>
          </View>
        </View>

        {/* Safe-Handoff Node bottom overlay */}
        <View style={styles.handoffOverlay}>
          <View style={styles.handoffIcon}>
            <MaterialCommunityIcons name="truck-delivery" size={16} color="#EA580C" />
          </View>
          <View>
            <Text style={styles.handoffTitle}>Safe-Handoff Node</Text>
            <Text style={styles.handoffSub}>Sảnh Alpha & Beta Gate</Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          4. CONTENT SECTION
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.contentSection}>
        {/* Label badges */}
        <View style={styles.labelRow}>
          <View style={styles.studentOnlyBadge}>
            <Text style={styles.studentOnlyText}>FPT STUDENT ONLY</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="checkmark-circle" size={11} color="#059669" style={{ marginRight: 3 }} />
            <Text style={styles.trustText}>Tin cậy 100%</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>Chợ Sinh Viên{'\n'}5Campus</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Nền tảng mua bán đồ công nghệ, giáo trình và trao đổi vật phẩm nội bộ sinh viên FPT an toàn tuyệt đối.
        </Text>

        {/* Feature list */}
        <View style={styles.featureList}>
          <FeatureItem
            iconBg="#FFF7ED"
            iconColor="#EA580C"
            iconName="shield-checkmark"
            iconLib="ionicons"
            title="100% Xác thực FAP SSO"
            titleBadge="✓"
            titleBadgeColor="#059669"
            desc="Đăng nhập độc quyền qua email @fpt.edu.vn. Xóa bỏ hoàn toàn tình trạng nick ảo và gian lận."
          />

          <View style={styles.featureDivider} />

          <FeatureItem
            iconBg="#EFF6FF"
            iconColor="#1D4ED8"
            iconName="location"
            iconLib="ionicons"
            title="Trạm Safe-Point sảnh trường"
            desc="Giao dịch tận tay tại sảnh toàn nhà các campus hoặc chuyển phát tài liệu nội bộ giữa 5 chi nhánh nhanh chóng."
          />

          <View style={styles.featureDivider} />

          <FeatureItem
            iconBg="#ECFDF5"
            iconColor="#059669"
            iconName="shield-check"
            iconLib="mci"
            title="Quỹ Escrow bảo hộ"
            titleBadge="0% Phí"
            titleBadgeColor="#059669"
            desc="Tiền được giữ an toàn trên hệ thống cho tới khi người mua nhận máy, test chức năng và bấm đồng ý."
          />
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          5. BOTTOM ACTIONS
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {/* Dot indicators */}
        <View style={styles.bottomDotsRow}>
          <View style={[styles.bottomDot, styles.bottomDotActive]} />
          <View style={styles.bottomDot} />
          <View style={styles.bottomDot} />
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.88}
          onPress={onNext}
        >
          <Text style={styles.ctaBtnText}>Tiếp tục tìm hiểu  →</Text>
        </TouchableOpacity>

        {/* Guest Link */}
        <TouchableOpacity
          style={styles.guestBtn}
          activeOpacity={0.7}
          onPress={onSkip}
        >
          <Ionicons name="eye-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
          <Text style={styles.guestBtnText}>Khám phá ngay với tư cách Khách</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding1Screen;

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
    paddingVertical: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: '#EA580C',
    width: 20,
  },
  skipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  // System Badge Row
  systemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  systemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  systemBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  connectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  // Hero Image
  heroContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    height: SCREEN_H * 0.28,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  campusChipsRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  campusChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  campusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  handoffOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  handoffIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handoffTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 1,
  },
  handoffSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },

  // Content Section
  contentSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  studentOnlyBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  studentOnlyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  trustText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  featureList: {
    gap: 14,
    marginTop: 4,
  },
  featureDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Bottom Section
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  bottomDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  bottomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  bottomDotActive: {
    backgroundColor: '#EA580C',
    width: 28,
    borderRadius: 4,
  },
  ctaBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#EA580C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
});
