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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/userStore';
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
  const { login, register, loginAsRole, isLoading } = useUserStore();
  const { setCampus } = useCampusStore();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form Login
  const [selectedCampusId, setSelectedCampusId] = useState<string>('hl');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('quanlmse172819@fpt.edu.vn');
  const [loginPassword, setLoginPassword] = useState<string>('fpt123456');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Form Register
  const [regFullName, setRegFullName] = useState<string>('');
  const [regStudentId, setRegStudentId] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  const currentCampus =
    CAMPUS_LIST.find((c) => c.id === selectedCampusId) || CAMPUS_LIST[0];

  const handleSelectCampus = (item: CampusChipItem) => {
    setSelectedCampusId(item.id);
    setCampus(item.storeValue);
  };

  const navigateAfterAuth = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (navigation && navigation.replace) {
      navigation.replace('MainTabs');
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  // Xử lý Đăng nhập
  const handleLoginSubmit = async () => {
    if (!loginIdentifier.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập MSSV hoặc Email FPT');
      return;
    }
    if (!loginPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    const res = await login(loginIdentifier.trim(), loginPassword.trim());
    if (res.success) {
      navigateAfterAuth();
    } else {
      Alert.alert('Đăng nhập thất bại', res.message);
    }
  };

  // Xử lý Đăng ký
  const handleRegisterSubmit = async () => {
    if (!regFullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }
    if (!regStudentId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mã số sinh viên (MSSV)');
      return;
    }
    if (!regEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Email FPT (@fpt.edu.vn)');
      return;
    }
    if (!regPassword.trim() || regPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const res = await register({
      fullName: regFullName.trim(),
      studentId: regStudentId.trim().toUpperCase(),
      email: regEmail.trim(),
      phone: regPhone.trim() || undefined,
      password: regPassword.trim(),
      campus: currentCampus.storeValue,
    });

    if (res.success) {
      Alert.alert(
        '🎉 Đăng ký thành công',
        `Chào mừng ${regFullName} gia nhập Market FU! Tài khoản đã được lưu vào bộ nhớ thiết bị.`,
        [{ text: 'Bắt đầu ngay', onPress: navigateAfterAuth }]
      );
    } else {
      Alert.alert('Đăng ký thất bại', res.message);
    }
  };

  // Test nhanh 3 Role
  const handleQuickSwitchRole = async (roleType: 'UNVERIFIED_STUDENT' | 'VERIFIED_STUDENT' | 'TOP_SELLER') => {
    const res = await loginAsRole(roleType);
    if (res.success) {
      navigateAfterAuth();
    } else {
      Alert.alert('Lỗi', res.message);
    }
  };

  const handleForgotPass = () => {
    Alert.alert(
      '🔑 Quên mật khẩu',
      'Vui lòng truy cập cổng FAP (fap.fpt.edu.vn) hoặc liên hệ IT Helpdesk FPT để lấy lại mật khẩu email / tài khoản MSSV.'
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
            1. HEADER & BRANDING
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoBadge5}>
              <Text style={styles.logoBadge5Text}>5 Cơ sở</Text>
            </View>
            <View style={styles.logoBox}>
              <MaterialCommunityIcons name="storefront" size={32} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.brandTitleRow}>
            <Text style={styles.brandFpt}>FPT</Text>
            <Text style={styles.brandCampus}> 5Campus</Text>
          </View>

          <Text style={styles.welcomeHeading}>
            {authMode === 'login' ? 'Chào mừng bạn trở lại! 👋' : 'Đăng ký tài khoản Sinh viên ✨'}
          </Text>
          <Text style={styles.welcomeSub}>
            Chợ trao đổi đồ an toàn & nội bộ dành riêng cho sinh viên 5 cơ sở Đại học FPT
          </Text>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            2. BỘ CHỌN ROLE TEST NHANH (QUICK SWITCHER)
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.quickTestBox}>
          <View style={styles.quickTestHeader}>
            <Ionicons name="flash" size={15} color="#EA580C" />
            <Text style={styles.quickTestTitle}>Kiểm thử phân quyền 3 Role (1 chạm):</Text>
          </View>
          <View style={styles.quickTestRow}>
            {/* 1. Chưa KYC */}
            <TouchableOpacity
              style={[styles.quickRoleBtn, styles.quickRoleBtnUnverified]}
              activeOpacity={0.8}
              onPress={() => handleQuickSwitchRole('UNVERIFIED_STUDENT')}
            >
              <Text style={styles.quickRoleTagUnverified}>Chưa KYC</Text>
              <Text style={styles.quickRoleName} numberOfLines={1}>SV K20</Text>
              <Text style={styles.quickRoleSub}>Chặn bán</Text>
            </TouchableOpacity>

            {/* 2. Đã KYC (Buyer) */}
            <TouchableOpacity
              style={[styles.quickRoleBtn, styles.quickRoleBtnVerified]}
              activeOpacity={0.8}
              onPress={() => handleQuickSwitchRole('VERIFIED_STUDENT')}
            >
              <Text style={styles.quickRoleTagVerified}>SV Đã KYC</Text>
              <Text style={styles.quickRoleName} numberOfLines={1}>SV K17</Text>
              <Text style={styles.quickRoleSub}>Chỉ mua đồ</Text>
            </TouchableOpacity>

            {/* 3. Seller */}
            <TouchableOpacity
              style={[styles.quickRoleBtn, styles.quickRoleBtnSeller]}
              activeOpacity={0.8}
              onPress={() => handleQuickSwitchRole('TOP_SELLER')}
            >
              <Text style={styles.quickRoleTagSeller}>SELLER ⭐</Text>
              <Text style={styles.quickRoleName} numberOfLines={1}>Thùy Dương</Text>
              <Text style={styles.quickRoleSub}>Được đăng bán</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            3. TAB SWITCHER: ĐĂNG NHẬP | ĐĂNG KÝ
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'login' && styles.tabBtnActive]}
            onPress={() => setAuthMode('login')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="log-in-outline"
              size={18}
              color={authMode === 'login' ? '#EA580C' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabBtnText, authMode === 'login' && styles.tabBtnTextActive]}>
              Đăng nhập
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, authMode === 'register' && styles.tabBtnActive]}
            onPress={() => setAuthMode('register')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-add-outline"
              size={18}
              color={authMode === 'register' ? '#EA580C' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabBtnText, authMode === 'register' && styles.tabBtnTextActive]}>
              Đăng ký mới
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            4. CHỌN CAMPUS HOẠT ĐỘNG
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.campusSection}>
          <View style={styles.campusHeaderRow}>
            <View style={styles.campusLeftRow}>
              <Ionicons name="location-outline" size={15} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={styles.campusLabel}>Campus hoạt động:</Text>
            </View>
            <Text style={styles.campusCurrentBadge}>{currentCampus.shortLabel}</Text>
          </View>

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
            5. FORM NỘI DUNG (LOGIN hoặc REGISTER)
        ═══════════════════════════════════════════════════════════ */}
        {authMode === 'login' ? (
          <View style={styles.formSection}>
            {/* Field MSSV / Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>MSSV hoặc Email FPT</Text>
                <Text style={styles.syncedTag}>Đã đồng bộ Storage</Text>
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
                  placeholder="Ví dụ: SE172819 hoặc quanlmse172819@fpt.edu.vn"
                  placeholderTextColor="#94A3B8"
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Field Mật khẩu */}
            <View style={[styles.inputGroup, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>Mật khẩu (Mặc định: fpt123456)</Text>
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
                  secureTextEntry={!showLoginPassword}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowLoginPassword(!showLoginPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ghi nhớ & Quên mật khẩu */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkboxBox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberText}>Ghi nhớ phiên đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} onPress={handleForgotPass}>
                <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Nút Đăng nhập */}
            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.88}
              onPress={handleLoginSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Đăng nhập ngay</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            {/* Field Họ tên */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên sinh viên *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ví dụ: Hoàng Tuấn Anh"
                  placeholderTextColor="#94A3B8"
                  value={regFullName}
                  onChangeText={setRegFullName}
                />
              </View>
            </View>

            {/* Field MSSV */}
            <View style={[styles.inputGroup, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>Mã số sinh viên (MSSV) *</Text>
              <View style={styles.inputBox}>
                <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ví dụ: SE180123"
                  placeholderTextColor="#94A3B8"
                  value={regStudentId}
                  onChangeText={setRegStudentId}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Field Email FPT */}
            <View style={[styles.inputGroup, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>Email FPT Education (@fpt.edu.vn) *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.inputField}
                  placeholder="anhhtse180123@fpt.edu.vn"
                  placeholderTextColor="#94A3B8"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Field Số điện thoại */}
            <View style={[styles.inputGroup, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>Số điện thoại liên hệ (Tùy chọn)</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.inputField}
                  placeholder="0987654321"
                  placeholderTextColor="#94A3B8"
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Field Mật khẩu */}
            <View style={[styles.inputGroup, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>Mật khẩu đăng nhập *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showRegPassword}
                  value={regPassword}
                  onChangeText={setRegPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowRegPassword(!showRegPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showRegPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nút Đăng ký */}
            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 16 }]}
              activeOpacity={0.88}
              onPress={handleRegisterSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Hoàn tất đăng ký & Lưu vào máy</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            6. CARD BẢO CHỨNG SINH VIÊN FPT
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.guaranteeCard}>
          <View style={styles.guaranteeHeader}>
            <View style={styles.guaranteeTitleRow}>
              <View style={styles.greenShieldBox}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
              </View>
              <Text style={styles.guaranteeTitle}>Bảo chứng 100% Sinh viên FPT</Text>
            </View>
            <View style={styles.closedBadge}>
              <Text style={styles.closedBadgeText}>Nội bộ</Text>
            </View>
          </View>

          <View style={styles.guaranteeItem}>
            <Ionicons name="checkmark-circle-outline" size={15} color="#059669" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.guaranteeItemText}>
              <Text style={styles.boldText}>Xác thực Thẻ SV:</Text> Chỉ sinh viên FPT đã KYC mới được quyền đăng bài bán và quản lý tin rao.
            </Text>
          </View>

          <View style={[styles.guaranteeItem, { marginTop: 8 }]}>
            <Ionicons name="shield-outline" size={15} color="#059669" style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={styles.guaranteeItemText}>
              <Text style={styles.boldText}>Bảo hộ Quỹ Escrow:</Text> Tiền được tạm giữ an toàn, chỉ giải ngân khi người mua kiểm tra đồ ưng ý.
            </Text>
          </View>

          <View style={styles.statsStrip}>
            <View style={styles.statsLeft}>
              <View style={styles.greenDot} />
              <Text style={styles.statsText}>
                <Text style={styles.statsBold}>1,420+</Text> sinh viên online
              </Text>
            </View>
            <Text style={styles.statsText}>
              <Text style={styles.statsBold}>3,850+</Text> giao dịch thành công
            </Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            7. FOOTER
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.helpdeskRow}
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('🎧 IT Helpdesk FPT', 'Hotline hỗ trợ sinh viên:\n• Hòa Lạc: (024) 7300 1866\n• TP.HCM: (028) 7300 5588\n• Email: it.support@fpt.edu.vn');
            }}
          >
            <Ionicons name="headset-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.helpdeskText}>
              Cần hỗ trợ? <Text style={styles.helpdeskUnderline}>Liên hệ IT Helpdesk FPT</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;

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
    marginBottom: 16,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
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
    marginBottom: 4,
  },
  brandFpt: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: -0.5,
  },
  brandCampus: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  welcomeHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 12,
  },

  // Quick Test Box
  quickTestBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  quickTestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  quickTestTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412',
  },
  quickTestRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickRoleBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickRoleBtnUnverified: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  quickRoleBtnVerified: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  quickRoleBtnSeller: {
    backgroundColor: '#E0E7FF',
    borderColor: '#C7D2FE',
  },
  quickRoleTagUnverified: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
  },
  quickRoleTagVerified: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  quickRoleTagSeller: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4338CA',
  },
  quickRoleName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  quickRoleSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    fontWeight: '800',
    color: '#EA580C',
  },

  // Campus Selector
  campusSection: {
    marginBottom: 16,
  },
  campusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
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
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  campusChipTextActive: {
    color: '#FFFFFF',
  },

  // Form Section
  formSection: {
    marginBottom: 16,
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
    fontSize: 10.5,
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
    height: 44,
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
    marginTop: 10,
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
    fontSize: 11.5,
    color: '#334155',
  },
  forgotPassText: {
    fontSize: 11.5,
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
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Guarantee Card
  guaranteeCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  guaranteeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenShieldBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  closedBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guaranteeItemText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
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
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
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
    fontSize: 10,
    color: '#475569',
  },
  statsBold: {
    fontWeight: '800',
    color: '#0F172A',
  },

  // Footer
  footerSection: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  helpdeskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
});
