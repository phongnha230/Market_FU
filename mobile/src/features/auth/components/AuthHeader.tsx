import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AuthHeaderProps {
  authMode: 'login' | 'register';
  onSelectMode: (mode: 'login' | 'register') => void;
}

interface AuthTabItem {
  mode: 'login' | 'register';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const AUTH_TABS: AuthTabItem[] = [
  { mode: 'login', label: 'Đăng nhập', icon: 'log-in-outline' },
  { mode: 'register', label: 'Đăng ký mới', icon: 'person-add-outline' },
];

const AuthBrandHeader: React.FC<{ authMode: 'login' | 'register' }> = React.memo(({ authMode }) => (
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
  </View>
));

export const AuthHeader: React.FC<AuthHeaderProps> = ({ authMode, onSelectMode }) => {
  return (
    <>
      <AuthBrandHeader authMode={authMode} />

      {/* Tab Switcher: Đăng nhập | Đăng ký */}
      <View style={styles.tabContainer}>
        {AUTH_TABS.map((tab) => {
          const isActive = authMode === tab.mode;
          return (
            <TouchableOpacity
              key={tab.mode}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => onSelectMode(tab.mode)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? '#EA580C' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    boxShadow: '0 4px 8px rgba(234, 88, 12, 0.3)',
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
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#EA580C',
  },
});

export default AuthHeader;
