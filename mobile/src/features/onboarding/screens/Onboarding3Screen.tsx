import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Onboarding3ScreenProps } from '../types/onboarding.types';

const { width: SCREEN_W } = Dimensions.get('window');

export const Onboarding3Screen: React.FC<Onboarding3ScreenProps> = ({
  onFinish,
  onBack,
  onSkip,
  navigation: propNavigation,
}) => {
  const insets = useSafeAreaInsets();
  const hookNavigation = useNavigation<any>();
  const navigation = propNavigation || hookNavigation;

  const handleStartHome = () => {
    if (onFinish) {
      onFinish();
    } else if (navigation && navigation.replace) {
      navigation.replace('Login');
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else if (navigation && navigation.replace) {
      navigation.replace('Login');
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Login');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* ═══════════════════════════════════════════════════════════
          1. TOP BAR: Small Dots + Skip, Progress + Step Badge
      ═══════════════════════════════════════════════════════════ */}
      <View style={[styles.topHeader, { paddingTop: Math.max(insets.top, 12) }]}>
        {/* Top mini row */}
        <View style={styles.topMiniRow}>
          <View style={styles.miniDotsRow}>
            <View style={[styles.miniDot, styles.miniDotOrange]} />
            <View style={styles.miniDot} />
            <View style={styles.miniDot} />
          </View>
          <TouchableOpacity
            style={styles.skipBtn}
            activeOpacity={0.7}
            onPress={handleSkip}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.skipText}>Bỏ qua</Text>
          </TouchableOpacity>
        </View>

        {/* Second row: Progress dots & Step Badge */}
        <View style={styles.progressRow}>
          <View style={styles.leftControlRow}>
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.dotsRow}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>BƯỚC 3 / 3</Text>
          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════
          2. SCROLLABLE CONTENT
      ═══════════════════════════════════════════════════════════ */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD: Escrow Protection */}
        <View style={styles.heroCard}>
          {/* Main Icon with Lock Overlay */}
          <View style={styles.shieldIconContainer}>
            <View style={styles.shieldCircle}>
              <MaterialCommunityIcons name="shield-check" size={42} color="#EA580C" />
            </View>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={13} color="#FFFFFF" />
            </View>
          </View>

          {/* Tag Badge */}
          <View style={styles.securityTag}>
            <Text style={styles.securityTagText}>CƠ CHẾ AN TOÀN FPT CAMPUS</Text>
          </View>

          {/* Heading */}
          <Text style={styles.mainTitle}>
            Giao dịch an tâm 100% với{'\n'}Ví Escrow FPT
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Bảo vệ quyền lợi sinh viên trên mọi điểm hẹn giao dịch nội khu trường.
          </Text>

          {/* 4-Step Process Box */}
          <View style={styles.processBox}>
            <View style={styles.processHeader}>
              <MaterialCommunityIcons name="cached" size={17} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={styles.processHeaderText}>Quy trình vận hành 4 bước bảo đảm:</Text>
            </View>

            <View style={styles.stepFlowRow}>
              {/* Step 1 */}
              <View style={styles.flowItem}>
                <View style={styles.stepCircleDefault}>
                  <Ionicons name="cart-outline" size={17} color="#475569" />
                </View>
                <Text style={styles.flowStepText}>1. Chốt đơn đặt{'\n'}hàng</Text>
              </View>

              {/* Step 2 (Active Orange) */}
              <View style={styles.flowItem}>
                <View style={styles.stepCircleActive}>
                  <MaterialCommunityIcons name="lock-clock" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.flowStepTextActive}>2. Tạm giữ ở{'\n'}Ví Escrow</Text>
              </View>

              {/* Step 3 */}
              <View style={styles.flowItem}>
                <View style={styles.stepCircleDefault}>
                  <Ionicons name="clipboard-outline" size={17} color="#475569" />
                </View>
                <Text style={styles.flowStepText}>3. Đồng kiểm{'\n'}24h</Text>
              </View>

              {/* Step 4 (Green) */}
              <View style={styles.flowItem}>
                <View style={styles.stepCircleGreen}>
                  <Ionicons name="wallet-outline" size={17} color="#FFFFFF" />
                </View>
                <Text style={styles.flowStepText}>4. Giải ngân{'\n'}người bán</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. BENEFIT CARDS (3 Cam kết minh bạch)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.benefitList}>
          {/* Item 1: Hoàn tiền 100% minh bạch */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIconBox, { backgroundColor: '#FEE2E2' }]}>
              <MaterialCommunityIcons name="cash-refund" size={22} color="#DC2626" />
            </View>
            <View style={styles.benefitTextBox}>
              <Text style={styles.benefitTitle}>Hoàn tiền 100% minh bạch</Text>
              <Text style={styles.benefitDesc}>
                Nhận lại trọn vẹn số tiền nếu sản phẩm bị lỗi ẩn, khác hình ảnh mô tả hoặc hư hại bất thường.
              </Text>
            </View>
          </View>

          {/* Item 2: Hỗ trợ 24h từ IT & CTSV */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="headset" size={20} color="#2563EB" />
            </View>
            <View style={styles.benefitTextBox}>
              <Text style={styles.benefitTitle}>Hỗ trợ 24h từ IT & CTSV</Text>
              <Text style={styles.benefitDesc}>
                Đội ngũ IT Student Support và Ban Công tác sinh viên trực tiếp đối soát tranh chấp trong ngày.
              </Text>
            </View>
          </View>

          {/* Item 3: Tích lũy Campus Coins */}
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIconBox, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="star" size={20} color="#C2410C" />
            </View>
            <View style={styles.benefitTextBox}>
              <Text style={styles.benefitTitle}>Tích lũy Campus Coins</Text>
              <Text style={styles.benefitDesc}>
                Tặng điểm thưởng sau mỗi lần giao dịch bảo hộ thành công để đổi voucher freeship và quà lưu niệm trường.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          4. FIXED BOTTOM BUTTON & FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <View
        style={[
          styles.bottomFixedBar,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.88}
          onPress={handleStartHome}
        >
          <Text style={styles.ctaButtonText}>Tiếp tục đăng nhập ngay</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <Text style={styles.footerNoteText}>
          Đăng nhập tài khoản sinh viên FPT hoặc trải nghiệm chợ đồ cũ Campus
        </Text>
      </View>
    </View>
  );
};

export default Onboarding3Screen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Top Header
  topHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  topMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  miniDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#DBEAFE',
  },
  miniDotOrange: {
    backgroundColor: '#EA580C',
  },
  skipBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  leftControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
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
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EA580C',
  },
  stepBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 0.8,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
    letterSpacing: 0.3,
  },

  // Scroll Content
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 18,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  shieldIconContainer: {
    width: 82,
    height: 82,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  shieldCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  securityTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginBottom: 10,
  },
  securityTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.2,
  },
  mainTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // 4 Steps Process Container
  processBox: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  processHeaderText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepFlowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flowItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircleDefault: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stepCircleGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  flowStepText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 13,
  },
  flowStepTextActive: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
    textAlign: 'center',
    lineHeight: 13,
  },

  // Benefit List
  benefitList: {
    gap: 10,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitTextBox: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  benefitDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // Fixed Bottom Bar
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
        shadowOffset: { width: 0, height: -3 },
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
    height: 48,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ctaButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerNoteText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
