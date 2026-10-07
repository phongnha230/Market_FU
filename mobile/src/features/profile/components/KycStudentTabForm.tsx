import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUSES } from '../constants/campuses.constants';

interface KycStudentTabFormProps {
  studentId: string;
  setStudentId: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  campus: string;
  setCampus: (val: string) => void;
  major: string;
  setMajor: (val: string) => void;
  cohort?: string;
  studentFrontCard: string | null;
  setStudentFrontCard: (val: string) => void;
  studentBackCard: string | null;
  setStudentBackCard: (val: string) => void;
  onPickImage: (setter: (uri: string) => void, title: string) => void;
  isStudentVerified: boolean;
  onUpgradeToSeller: () => void;
}

export const KycStudentTabForm: React.FC<KycStudentTabFormProps> = React.memo(({
  studentId,
  setStudentId,
  fullName,
  setFullName,
  campus,
  setCampus,
  major,
  setMajor,
  cohort,
  studentFrontCard,
  setStudentFrontCard,
  studentBackCard,
  setStudentBackCard,
  onPickImage,
  isStudentVerified,
  onUpgradeToSeller,
}) => {
  // NẾU ĐÃ XÁC THỰC THẺ SINH VIÊN: Hiển thị thẻ đã duyệt, khóa form hoàn toàn (Đồng bộ 100% với Web)
  if (isStudentVerified) {
    return (
      <View style={styles.verifiedCard}>
        <View style={styles.verifiedHeader}>
          <Ionicons name="checkmark-circle" size={22} color="#059669" />
          <Text style={styles.verifiedTitle}>
            Tài khoản đã hoàn tất xác thực Thẻ Sinh Viên chính quy FPT
          </Text>
        </View>

        <Text style={styles.verifiedDesc}>
          Hồ sơ học vụ của bạn đã được đối soát tự động qua FAP SSO và đang được bảo hộ định danh chính chủ. Thông tin thẻ sinh viên đã được khóa an toàn và không thể chỉnh sửa lại.
        </Text>

        <View style={styles.verifiedInfoBox}>
          <View style={styles.verifiedInfoRow}>
            <View style={styles.verifiedInfoCol}>
              <Text style={styles.verifiedInfoLabel}>Họ và tên:</Text>
              <Text style={styles.verifiedInfoVal}>{fullName}</Text>
            </View>
            <View style={styles.verifiedInfoCol}>
              <Text style={styles.verifiedInfoLabel}>Mã SV (MSSV):</Text>
              <Text style={styles.verifiedInfoValMono}>{studentId}</Text>
            </View>
          </View>

          <View style={[styles.verifiedInfoRow, { marginTop: 10 }]}>
            <View style={styles.verifiedInfoCol}>
              <Text style={styles.verifiedInfoLabel}>Cơ sở Campus:</Text>
              <Text style={styles.verifiedInfoVal}>{campus || 'Hòa Lạc'}</Text>
            </View>
            <View style={styles.verifiedInfoCol}>
              <Text style={styles.verifiedInfoLabel}>Khóa & Ngành:</Text>
              <Text style={styles.verifiedInfoVal}>
                {cohort || 'K19'} • {major || 'Công nghệ thông tin'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.upgradeSellerBtn}
          onPress={onUpgradeToSeller}
          activeOpacity={0.85}
        >
          <Ionicons name="storefront" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.upgradeSellerBtnText}>
            Nâng cấp lên Người Bán (Seller) để đăng bài
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // NẾU CHƯA XÁC THỰC: Hiển thị form điền và chụp ảnh thẻ SV
  return (
    <View>
      <Text style={styles.sectionHeading}>THÔNG TIN SINH VIÊN FPT 5CAMPUS</Text>

      {/* MSSV */}
      <Text style={styles.inputLabel}>Mã số sinh viên (MSSV) *</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="finger-print" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={studentId}
          onChangeText={setStudentId}
          placeholder="VD: SE180293, HE172910..."
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
        />
      </View>

      {/* Họ tên */}
      <Text style={styles.inputLabel}>Họ và tên sinh viên *</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nguyễn Văn A"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Campus chips */}
      <Text style={styles.inputLabel}>Cơ sở Campus *</Text>
      <View style={styles.campusChipsRow}>
        {CAMPUSES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.campusChip, campus === c && styles.campusChipActive]}
            onPress={() => setCampus(c)}
          >
            <Text style={[styles.campusChipText, campus === c && styles.campusChipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chuyên ngành */}
      <Text style={styles.inputLabel}>Khóa & Chuyên ngành</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="school-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={major}
          onChangeText={setMajor}
          placeholder="K18 Kỹ thuật phần mềm (SE)"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Upload Thẻ SV */}
      <Text style={styles.sectionHeading}>CHỤP / TẢI ẢNH THẺ SINH VIÊN HOẶC FAP</Text>
      <View style={styles.cardSlotsRow}>
        {/* Mặt trước */}
        <View style={styles.slotCol}>
          <Text style={styles.slotLabel}>Mặt trước thẻ SV *</Text>
          {studentFrontCard ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: studentFrontCard }} style={styles.thumbImage} contentFit="cover" />
              <TouchableOpacity
                style={styles.repickBtn}
                onPress={() => onPickImage(setStudentFrontCard, 'Chụp mặt trước Thẻ SV')}
              >
                <Ionicons name="camera-reverse" size={14} color="#FFFFFF" />
                <Text style={styles.repickText}>Đổi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => onPickImage(setStudentFrontCard, 'Chụp mặt trước Thẻ SV')}
            >
              <Ionicons name="camera-outline" size={24} color="#EA580C" />
              <Text style={styles.uploadText}>Chụp mặt trước</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mặt sau */}
        <View style={styles.slotCol}>
          <Text style={styles.slotLabel}>Mặt sau hoặc FAP</Text>
          {studentBackCard ? (
            <View style={styles.previewBox}>
              <Image source={{ uri: studentBackCard }} style={styles.thumbImage} contentFit="cover" />
              <TouchableOpacity
                style={styles.repickBtn}
                onPress={() => onPickImage(setStudentBackCard, 'Chụp mặt sau Thẻ SV')}
              >
                <Ionicons name="camera-reverse" size={14} color="#FFFFFF" />
                <Text style={styles.repickText}>Đổi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => onPickImage(setStudentBackCard, 'Chụp mặt sau Thẻ SV')}
            >
              <Ionicons name="images-outline" size={24} color="#64748B" />
              <Text style={styles.uploadText}>Mặt sau / FAP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Verified Card Styles (Đồng bộ Web)
  verifiedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    lineHeight: 18,
  },
  verifiedDesc: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 17,
  },
  verifiedInfoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  verifiedInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  verifiedInfoCol: {
    flex: 1,
  },
  verifiedInfoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  verifiedInfoVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  verifiedInfoValMono: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  upgradeSellerBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
  },
  upgradeSellerBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Form Styles (Khi chưa xác thực)
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
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
    gap: 6,
    marginBottom: 12,
  },
  campusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  campusChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  campusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  campusChipTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  cardSlotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  slotCol: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  uploadBox: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  previewBox: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  repickBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  repickText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
