import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
  studentFrontCard: string | null;
  setStudentFrontCard: (val: string) => void;
  studentBackCard: string | null;
  setStudentBackCard: (val: string) => void;
  onPickImage: (setter: (uri: string) => void, title: string) => void;
  onUseDemoCards: () => void;
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
  studentFrontCard,
  setStudentFrontCard,
  studentBackCard,
  setStudentBackCard,
  onPickImage,
  onUseDemoCards,
}) => {
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

      <View style={styles.twoPhotosRow}>
        {/* Mặt trước */}
        <View style={{ flex: 1, marginRight: 6 }}>
          <Text style={styles.photoSlotLabel}>Mặt trước thẻ SV *</Text>
          {studentFrontCard ? (
            <View style={styles.photoPreviewBox}>
              <Image source={{ uri: studentFrontCard }} style={styles.photoThumb} contentFit="cover" />
              <TouchableOpacity
                style={styles.repickBtn}
                onPress={() => onPickImage(setStudentFrontCard, 'Mặt trước Thẻ SV')}
              >
                <Ionicons name="camera-reverse" size={14} color="#FFFFFF" />
                <Text style={styles.repickText}>Đổi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoUploadBox}
              onPress={() => onPickImage(setStudentFrontCard, 'Mặt trước Thẻ SV')}
            >
              <Ionicons name="camera-outline" size={24} color="#EA580C" />
              <Text style={styles.photoUploadText}>Chụp mặt trước</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mặt sau */}
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.photoSlotLabel}>Mặt sau hoặc FAP</Text>
          {studentBackCard ? (
            <View style={styles.photoPreviewBox}>
              <Image source={{ uri: studentBackCard }} style={styles.photoThumb} contentFit="cover" />
              <TouchableOpacity
                style={styles.repickBtn}
                onPress={() => onPickImage(setStudentBackCard, 'Mặt sau Thẻ SV')}
              >
                <Ionicons name="camera-reverse" size={14} color="#FFFFFF" />
                <Text style={styles.repickText}>Đổi</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoUploadBox}
              onPress={() => onPickImage(setStudentBackCard, 'Mặt sau Thẻ SV')}
            >
              <Ionicons name="image-outline" size={24} color="#64748B" />
              <Text style={styles.photoUploadText}>Mặt sau / FAP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick demo cards button */}
      <TouchableOpacity
        style={styles.demoFillBtn}
        onPress={onUseDemoCards}
        activeOpacity={0.7}
      >
        <Ionicons name="sparkles" size={14} color="#EA580C" />
        <Text style={styles.demoFillText}>Nạp thẻ sinh viên demo mẫu để thử nghiệm nhanh</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    paddingVertical: 10,
  },
  campusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
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
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  campusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  campusChipTextActive: {
    color: '#FFFFFF',
  },
  twoPhotosRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 10,
  },
  photoSlotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  photoUploadBox: {
    height: 105,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  photoUploadText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  photoPreviewBox: {
    height: 105,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  repickBtn: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  repickText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  demoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginTop: 6,
    marginBottom: 12,
  },
  demoFillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
});
