import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
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
  major: string;
  onMajorChange: (val: string) => void;
}

export const EditProfileAcademicSection: React.FC<EditProfileAcademicSectionProps> = ({
  name,
  onNameChange,
  studentId,
  email,
  isEduEmail,
  campus,
  onCampusChange,
  campuses,
  major,
  onMajorChange,
}) => {
  return (
    <>
      <Text style={styles.groupHeading}>THÔNG TIN HỌC TẬP & ĐỊNH DANH</Text>

      {/* Họ và tên */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Họ và tên sinh viên *</Text>
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={onNameChange}
            placeholder="Nhập họ và tên đầy đủ"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* MSSV (Locked) */}
      <View style={styles.inputGroup}>
        <View style={styles.labelWithBadge}>
          <Text style={styles.label}>Mã số sinh viên (MSSV)</Text>
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={10} color="#64748B" />
            <Text style={styles.lockedBadgeText}>FAP Cố định</Text>
          </View>
        </View>
        <View style={[styles.inputBox, styles.disabledBox]}>
          <Ionicons name="finger-print" size={18} color="#94A3B8" style={styles.inputIcon} />
          <Text style={styles.disabledText}>{studentId || 'Chưa cập nhật'}</Text>
        </View>
      </View>

      {/* Email (Locked) */}
      <View style={styles.inputGroup}>
        <View style={styles.labelWithBadge}>
          <Text style={styles.label}>Email liên kết</Text>
          <View style={[styles.lockedBadge, isEduEmail && styles.eduBadge]}>
            <Ionicons name={isEduEmail ? 'checkmark-circle' : 'mail'} size={10} color={isEduEmail ? '#059669' : '#64748B'} />
            <Text style={[styles.lockedBadgeText, isEduEmail && styles.eduBadgeText]}>
              {isEduEmail ? 'FPT SSO' : 'Cá nhân'}
            </Text>
          </View>
        </View>
        <View style={[styles.inputBox, styles.disabledBox]}>
          <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
          <Text style={styles.disabledText}>{email || 'Chưa liên kết'}</Text>
        </View>
      </View>

      {/* Chọn Campus */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cơ sở Campus FPT *</Text>
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

      {/* Khóa & Ngành học */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Khóa & Chuyên ngành đào tạo</Text>
        <View style={styles.inputBox}>
          <Ionicons name="school-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={major}
            onChangeText={onMajorChange}
            placeholder="Ví dụ: K18 Kỹ thuật phần mềm (SE)"
            placeholderTextColor="#94A3B8"
          />
        </View>
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
  labelWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  eduBadge: {
    backgroundColor: '#DCFCE7',
  },
  eduBadgeText: {
    color: '#15803D',
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
  disabledBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  disabledText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
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
  campusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  campusChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  campusChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  campusChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  campusChipTextActive: {
    color: '#EA580C',
  },
});
