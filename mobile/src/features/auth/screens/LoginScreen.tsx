import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useCampusStore, CampusType } from '../../../stores/useCampusStore';

interface CampusChipItem {
  id: string;
  name: string;
  shortLabel: string;
  storeValue: CampusType;
}

const CAMPUS_LIST: CampusChipItem[] = [
  { id: 'hl', name: 'Hòa Lạc', shortLabel: 'Hòa Lạc (HL)', storeValue: 'HÒA LẠC' },
  { id: 'hcm', name: 'Hồ Chí Minh', shortLabel: 'Hồ Chí Minh (HCM)', storeValue: 'TP.HCM' },
  { id: 'dn', name: 'Đà Nẵng', shortLabel: 'Đà Nẵng (ĐN)', storeValue: 'ĐÀ NẴNG' },
  { id: 'ct', name: 'Cần Thơ', shortLabel: 'Cần Thơ (CT)', storeValue: 'CẦN THƠ' },
  { id: 'qn', name: 'Quy Nhơn', shortLabel: 'Quy Nhơn (QN)', storeValue: 'HÒA LẠC' },
];

export interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onGoBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoBack,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { setAuth } = useAuthStore();
  const { setCampus } = useCampusStore();

  const [selectedCampusId, setSelectedCampusId] = useState<string>('hl');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const currentCampus =
    CAMPUS_LIST.find((c) => c.id === selectedCampusId) || CAMPUS_LIST[0];

  const handleSelectCampus = (item: CampusChipItem) => {
    setSelectedCampusId(item.id);
    setCampus(item.storeValue);
  };

  const handleFinishLogin = (method: string) => {
    const studentCode = username.trim() || 'SE172819';
    const email = studentCode.includes('@')
      ? studentCode
      : `${studentCode.toLowerCase()}@fpt.edu.vn`;

    setAuth(
      {
        id: 'u_logged_student',
        name: 'Nguyễn Văn Quân',
        studentId: studentCode.toUpperCase(),
        email: email,
        campus: currentCampus.storeValue,
        isKycVerified: true,
        major: 'K17 Kỹ thuật phần mềm (SE)',
        rating: 5.0,
      },
      `mock_token_${method}`
    );

    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (navigation && navigation.replace) {
      navigation.replace('MainTabs');
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleDirectSubmit = () => {
    handleFinishLogin('mssv_fap');
  };

  const handleForgotPass = () => {
    Alert.alert(
      '🔑 Quên mật khẩu',
      'Vui lòng truy cập cổng FAP (fap.fpt.edu.vn) hoặc liên hệ IT Helpdesk FPT để lấy lại mật khẩu email / tài khoản MSSV.'
    );
  };

  const handleRegister = () => {
    Alert.alert(
      '🎓 Dành cho tân sinh viên K20',
      'Tài khoản FPT 5Campus Marketplace được đồng bộ trực tiếp từ hệ thống tuyển sinh FPT. Bạn chỉ cần bấm "Đăng nhập bằng FPT Edu Mail" bằng email trường cấp để kích hoạt ngay!'
    );
  };

  const handleHelpdesk = () => {
    Alert.alert(
      '🎧 IT Helpdesk FPT',
      'Hotline hỗ trợ sinh viên:\n• Hòa Lạc: (024) 7300 1866\n• TP.HCM: (028) 7300 5588\n• Email: it.support@fpt.edu.vn'
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 20) + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Back/Home Bar */}
        <View style={styles.topBackBar}>
          <TouchableOpacity
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              if (onGoBack) {
                onGoBack();
              } else if (navigation && navigation.canGoBack()) {
                navigation.goBack();
              } else if (navigation) {
                navigation.navigate('MainTabs', { screen: 'Home' });
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              if (navigation) {
                navigation.navigate('MainTabs', { screen: 'Home' });
              }
            }}
          >
            <Ionicons name="home-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            1. TOP BRANDING: LOGO 5 CƠ SỞ & LỜI CHÀO
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.headerContainer}>
          {/* Logo Box with Tag */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoBadge5}>
              <Text style={styles.logoBadge5Text}>5 Cơ sở</Text>
            </View>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="storefront" size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Brand Name */}
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandFpt}>FPT</Text>
            <Text style={styles.brandCampus}> 5Campus</Text>
          </View>

          {/* Welcome Heading */}
          <Text style={styles.welcomeHeading}>Chào mừng bạn trở lại! 👋</Text>
          <Text style={styles.welcomeSub}>
            Chợ trao đổi đồ an toàn & nội bộ dành riêng cho sinh{'\n'}viên 5 cơ sở Đại học FPT
          </Text>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            2. CHỌN CAMPUS HOẠT ĐỘNG CỦA BẠN
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.campusSection}>
          <View style={styles.campusHeaderRow}>
            <View style={styles.campusLeftRow}>
              <Ionicons name="location-outline" size={15} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.campusLabel}>Chọn Campus hoạt động của bạn</Text>
            </View>
            <Text style={styles.campusCurrentBadge}>{currentCampus.shortLabel}</Text>
          </View>

          {/* Horizontal Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.campusChipsScroll}
          >
            {CAMPUS_LIST.map((c) => {
              const isSelected = c.id === selectedCampusId;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.campusChip, isSelected && styles.campusChipActive]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectCampus(c)}
                >
                  <View
                    style={[
                      styles.chipDot,
                      isSelected ? styles.chipDotActive : styles.chipDotInactive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.campusChipText,
                      isSelected && styles.campusChipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. HAI NÚT ĐĂNG NHẬP SSO NHANH
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.ssoSection}>
          {/* Nút 1: FPT Edu Mail */}
          <TouchableOpacity
            style={styles.fptEduBtn}
            activeOpacity={0.88}
            onPress={() => handleFinishLogin('fpt_edu_mail')}
          >
            <View style={styles.fptEduIconCircle}>
              <Ionicons name="school" size={18} color="#EA580C" />
            </View>
            <View style={styles.fptEduTextBox}>
              <Text style={styles.fptEduTitle}>Đăng nhập bằng FPT Edu Mail</Text>
              <Text style={styles.fptEduSub}>Xác thực tức thì qua SSO @fpt.edu.vn</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Nút 2: Google SSO */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.85}
            onPress={() => handleFinishLogin('google_sso')}
          >
            <View style={styles.googleGContainer}>
              <Text style={styles.googleGLetter}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>
              Tài khoản Google (@fe.edu.vn / @fpt.edu.vn)
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. PHÂN CÁCH HOẶC MSSV / MẬT KHẨU
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc MSSV / Mật khẩu</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            5. FORM ĐĂNG NHẬP THỦ CÔNG
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.formSection}>
          {/* Field 1: MSSV / Email */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <Text style={styles.inputLabel}>Mã số sinh viên (MSSV) hoặc Email</Text>
              <Text style={styles.syncedTag}>Đã đồng bộ DNG/AP</Text>
            </View>
            <View style={styles.inputBox}>
              <MaterialCommunityIcons
                name="card-account-details-outline"
                size={18}
                color="#64748B"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Ví dụ: SE172819 hoặc quanlmse@fpt.edu.vn"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Field 2: Mật khẩu */}
          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputBox}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#64748B"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.inputField}
                placeholder="•••••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Row Ghi nhớ & Quên mật khẩu */}
          <View style={styles.rememberRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkboxBox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleForgotPass}>
              <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Nút Đăng nhập ngay */}
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.88}
            onPress={handleDirectSubmit}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            6. CARD BẢO CHỨNG 100% SINH VIÊN FPT
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.guaranteeCard}>
          {/* Header Card */}
          <View style={styles.guaranteeHeader}>
            <View style={styles.guaranteeTitleRow}>
              <View style={styles.greenShieldBox}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
              </View>
              <Text style={styles.guaranteeTitle}>
                Bảo chứng 100% Sinh viên{'\n'}FPT
              </Text>
            </View>
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>Khép kín</Text>
            </View>
          </View>

          {/* 3 cam kết */}
          <View style={styles.guaranteeItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={15}
              color="#059669"
              style={{ marginRight: 8, marginTop: 1 }}
            />
            <Text style={styles.guaranteeItemText}>
              <Text style={styles.boldText}>Chỉ thành viên xác thực MSSV</Text> mới được phép duyệt bài, chat giá và hẹn giao dịch.
            </Text>
          </View>

          <View style={[styles.guaranteeItem, { marginTop: 8 }]}>
            <Ionicons
              name="navigate-outline"
              size={15}
              color="#059669"
              style={{ marginRight: 8, marginTop: 1 }}
            />
            <Text style={styles.guaranteeItemText}>
              <Text style={styles.boldText}>Safe-Handoff Points:</Text> Khuyên dùng điểm hẹn an toàn tại Sảnh Alpha, Thư viện Gamma, Nhà ăn & KTX.
            </Text>
          </View>

          <View style={[styles.guaranteeItem, { marginTop: 8 }]}>
            <Ionicons
              name="shield-outline"
              size={15}
              color="#059669"
              style={{ marginRight: 8, marginTop: 1 }}
            />
            <Text style={styles.guaranteeItemText}>
              Hệ thống chống lừa đảo nội bộ & hỗ trợ giải quyết tranh chấp bởi Ban Quản Trị CLB sinh viên FPT.
            </Text>
          </View>

          {/* Online Stats strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statsLeft}>
              <View style={styles.greenDot} />
              <Text style={styles.statsText}>
                <Text style={styles.statsBold}>1,420+</Text> sinh viên đang online
              </Text>
            </View>
            <Text style={styles.statsText}>
              <Text style={styles.statsBold}>3,850+</Text> món đồ đã pass an toàn
            </Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            7. FOOTER LINKS & TRỢ GIÚP
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.footerSection}>
          <Text style={styles.k20PromptText}>
            Bạn là tân sinh viên K20 chưa có tài khoản?{' '}
            <Text style={styles.registerLink} onPress={handleRegister}>
              Đăng ký ngay
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.helpdeskRow}
            activeOpacity={0.7}
            onPress={handleHelpdesk}
          >
            <Ionicons name="headset-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.helpdeskText}>
              Cần hỗ trợ đăng nhập?{' '}
              <Text style={styles.helpdeskUnderline}>Liên hệ IT Helpdesk FPT</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Text style={styles.termsLink}>Quy chế trao đổi sinh viên</Text> và{' '}
            <Text style={styles.termsLink}>Chính sách bảo mật dữ liệu FPT</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  topBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },

  // 1. Header & Logo
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 10,
    marginTop: 4,
  },
  logoBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
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
  logoBadge5: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#059669',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  logoBadge5Text: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandFpt: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: -0.5,
  },
  brandCampus: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // 2. Campus Selector
  campusSection: {
    marginBottom: 18,
  },
  campusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  campusLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  campusCurrentBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C2410C',
  },
  campusChipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  campusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  campusChipActive: {
    backgroundColor: '#0F172A',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chipDotActive: {
    backgroundColor: '#EA580C',
  },
  chipDotInactive: {
    backgroundColor: '#93C5FD',
  },
  campusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  campusChipTextActive: {
    color: '#FFFFFF',
  },

  // 3. SSO Section
  ssoSection: {
    gap: 10,
    marginBottom: 16,
  },
  fptEduBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
  fptEduIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fptEduTextBox: {
    flex: 1,
  },
  fptEduTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fptEduSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    height: 48,
  },
  googleGContainer: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleGLetter: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA4335',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  // 4. Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11.5,
    color: '#64748B',
    paddingHorizontal: 10,
  },

  // 5. Form Section
  formSection: {
    marginBottom: 18,
  },
  inputGroup: {},
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  syncedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  checkboxActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  rememberText: {
    fontSize: 12,
    color: '#334155',
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 6. Guarantee Card
  guaranteeCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  guaranteeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenShieldBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  guaranteeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  closedBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  closedBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F766E',
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guaranteeItemText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16.5,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statsText: {
    fontSize: 10.5,
    color: '#475569',
  },
  statsBold: {
    fontWeight: '800',
    color: '#0F172A',
  },

  // 7. Footer
  footerSection: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  k20PromptText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  registerLink: {
    color: '#EA580C',
    fontWeight: '800',
  },
  helpdeskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpdeskText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  helpdeskUnderline: {
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: '#64748B',
  },
});
