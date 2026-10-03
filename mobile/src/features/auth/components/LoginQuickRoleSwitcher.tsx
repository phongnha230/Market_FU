import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RoleKey = 'UNVERIFIED_STUDENT' | 'VERIFIED_STUDENT' | 'TOP_SELLER';

interface LoginQuickRoleSwitcherProps {
  onSwitchRole: (roleType: RoleKey) => void;
}

interface QuickRoleConfig {
  role: RoleKey;
  tag: string;
  name: string;
  sub: string;
  btnStyle: object;
  tagStyle: object;
}

const ROLES: QuickRoleConfig[] = [
  {
    role: 'UNVERIFIED_STUDENT',
    tag: 'Chưa KYC',
    name: 'SV K20',
    sub: 'Chặn bán',
    btnStyle: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
    tagStyle: { color: '#B45309' },
  },
  {
    role: 'VERIFIED_STUDENT',
    tag: 'SV Đã KYC',
    name: 'SV K17',
    sub: 'Chỉ mua đồ',
    btnStyle: { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
    tagStyle: { color: '#15803D' },
  },
  {
    role: 'TOP_SELLER',
    tag: 'SELLER ⭐',
    name: 'Thùy Dương',
    sub: 'Được đăng bán',
    btnStyle: { backgroundColor: '#E0E7FF', borderColor: '#C7D2FE' },
    tagStyle: { color: '#4338CA' },
  },
];

export const LoginQuickRoleSwitcher: React.FC<LoginQuickRoleSwitcherProps> = ({ onSwitchRole }) => {
  return (
    <View style={styles.quickTestBox}>
      <View style={styles.quickTestHeader}>
        <Ionicons name="flash" size={15} color="#EA580C" />
        <Text style={styles.quickTestTitle}>Kiểm thử phân quyền 3 Role (1 chạm):</Text>
      </View>
      <View style={styles.quickTestRow}>
        {ROLES.map((item) => (
          <TouchableOpacity
            key={item.role}
            style={[styles.quickRoleBtn, item.btnStyle]}
            activeOpacity={0.8}
            onPress={() => onSwitchRole(item.role)}
          >
            <Text style={[styles.quickRoleTag, item.tagStyle]}>{item.tag}</Text>
            <Text style={styles.quickRoleName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.quickRoleSub}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  quickRoleTag: {
    fontSize: 9.5,
    fontWeight: '800',
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
});

export default LoginQuickRoleSwitcher;
