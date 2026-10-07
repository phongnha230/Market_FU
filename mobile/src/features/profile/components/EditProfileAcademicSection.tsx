import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditProfileAcademicSectionProps {
  name: string;
  onNameChange: (val: string) => void;
  studentId: string;
  email: string;
  isEduEmail: boolean;
  campus: string;
  onCampusChange: (val: string) => void;
  campuses: string[];
  cohort?: string;
  major?: string;
  onMajorChange?: (val: string) => void;
  isVerified: boolean;
}

export const EditProfileAcademicSection: React.FC<EditProfileAcademicSectionProps> = ({
  name,
  onNameChange,
  studentId,
  email,
  campus,
  onCampusChange,
  campuses,
  cohort,
  major,
  isVerified,
}) => {
  return (
    <>
      <Text style={styles.groupHeading}>THÔNG TIN CƠ BẢN</Text>

      {/* Họ và tên sinh viên (Tên hiển thị) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Tên hiển thị (Nickname) <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={onNameChange}
            placeholder="VD: Trần Đỗ Phong Nhã"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* FPT Student Identity (Read-only) - Đồng bộ 100% với Web */}
      <View style={styles.identityCard}>
        {/* Header với Lock Icon và Trạng thái xác thực */}
        <View style={styles.identityHeader}>
          <View style={styles.identityHeaderLeft}>
            <Ionicons name="lock-closed" size={14} color="#64748B" />
            <Text style={styles.identityHeaderTitle}>Thông tin sinh viên FPT (Chỉ đọc)</Text>
          </View>
          {isVerified ? (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#15803D" />
              <Text style={styles.verifiedBadgeText}>Đã xác thực chính quy</Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <Ionicons name="alert-circle" size={12} color="#B45309" />
              <Text style={styles.unverifiedBadgeText}>Chưa xác thực Thẻ SV</Text>
            </View>
          )}
        </View>

        {/* Cột 1 & 2: MSSV và Email */}
        <View style={styles.twoColRow}>
          {/* MSSV (Cố định 1) */}
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Mã số sinh viên (MSSV)</Text>
            <View style={styles.lockedBox}>
              <Text style={styles.mssvText} numberOfLines={1}>
                {studentId || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>

          {/* Email tài khoản (Cố định 2) */}
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Email tài khoản</Text>
            <View style={styles.lockedBox}>
              <Text style={styles.emailText} numberOfLines={1}>
                {email || '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Đường ngăn cách mỏng */}
        <View style={styles.cardDivider} />

        {/* Cột 3 & 4: Cơ sở và Khóa & Ngành */}
        <View style={styles.twoColRow}>
          {/* Cơ sở (Cố định 3 khi đã xác thực sinh viên - KHÔNG cho chọn) */}
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Cơ sở:</Text>
            {isVerified ? (
              <View style={styles.fixedCampusBox}>
                <Ionicons name="business" size={13} color="#EA580C" />
                <Text style={styles.fixedCampusText} numberOfLines={1}>
                  {campus || 'Hòa Lạc'}
                </Text>
              </View>
            ) : (
              <Text style={styles.unverifiedNotice}>Chưa cố định (chọn bên dưới)</Text>
            )}
          </View>

          {/* Khóa & Ngành (Cố định 4) */}
          <View style={styles.col}>
            <Text style={styles.fieldLabel}>Khóa & Ngành:</Text>
            <View style={styles.fixedMajorBox}>
              <Text style={styles.fixedMajorText} numberOfLines={2}>
                {cohort ? cohort : '—'} {major ? `(${major})` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Chỉ hiển thị bộ chọn Campus nếu CHƯA xác thực Thẻ SV (giống hệt select trên Web) */}
        {!isVerified && (
          <View style={styles.campusSelectSection}>
            <Text style={styles.campusSelectLabel}>Chọn cơ sở tạm thời:</Text>
            <View style={styles.campusChipsRow}>
              {campuses.map((c) => {
                const isSelected = campus.toUpperCase() === c.toUpperCase();
                return (
                  <TouchableOpacity
                    key={c}
                    style={[styles.campusChip, isSelected && styles.campusChipActive]}
                    onPress={() => onCampusChange(c)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.campusChipText, isSelected && styles.campusChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Chú thích đồng bộ nguyên văn từ Web */}
        <Text style={styles.disclaimerText}>
          * MSSV, Khóa học, Chuyên ngành và Cơ sở được bảo vệ và đồng bộ tự động từ kết quả duyệt Thẻ Sinh Viên (KYC).
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  groupHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
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
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  // FPT Identity Card Styles
  identityCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 13,
    marginBottom: 14,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  identityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  identityHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
    gap: 3.5,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
    gap: 3.5,
  },
  unverifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  lockedBox: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    justifyContent: 'center',
  },
  mssvText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emailText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  fixedCampusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  fixedCampusText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  unverifiedNotice: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '600',
    marginTop: 2,
  },
  fixedMajorBox: {
    marginTop: 2,
  },
  fixedMajorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 16,
  },
  campusSelectSection: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  campusSelectLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 6,
  },
  campusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  campusChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  campusChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  campusChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  campusChipTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
    marginTop: 10,
    fontStyle: 'italic',
  },
});
