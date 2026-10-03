import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AccountStudentInfoFormProps {
  fullName: string;
  setFullName: (text: string) => void;
  mssv: string;
  phoneNumber: string;
  setPhoneNumber: (text: string) => void;
  major: string;
  setMajor: (text: string) => void;
  dormRoom: string;
  setDormRoom: (text: string) => void;
  bio: string;
  setBio: (text: string) => void;
  onSave: () => void;
  isLoading: boolean;
}

export const AccountStudentInfoForm: React.FC<AccountStudentInfoFormProps> = React.memo(({
  fullName,
  setFullName,
  mssv,
  phoneNumber,
  setPhoneNumber,
  major,
  setMajor,
  dormRoom,
  setDormRoom,
  bio,
  setBio,
  onSave,
  isLoading,
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>THÔNG TIN HỒ SƠ SINH VIÊN (LƯU LOCAL STORAGE)</Text>
      <View style={styles.card}>
        {/* Họ tên */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ và tên sinh viên *</Text>
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.divider} />

        {/* MSSV */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mã số sinh viên (MSSV)</Text>
          <View style={styles.disabledInputRow}>
            <Text style={styles.disabledInputText}>{mssv || 'Chưa cập nhật'}</Text>
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color="#64748B" />
              <Text style={styles.lockedText}>Định danh hệ thống FAP</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Số điện thoại */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số điện thoại / Zalo giao dịch</Text>
          <TextInput
            style={styles.textInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="Ví dụ: 0987 654 321 (Chưa có thông tin hãy lưu thử)"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.divider} />

        {/* Chuyên ngành */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Khóa & Chuyên ngành đào tạo</Text>
          <TextInput
            style={styles.textInput}
            value={major}
            onChangeText={setMajor}
            placeholder="Ví dụ: K18 An toàn thông tin (IA)"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.divider} />

        {/* Phòng KTX / Địa chỉ */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phòng Ký túc xá / Địa chỉ nhận đồ Campus</Text>
          <TextInput
            style={styles.textInput}
            value={dormRoom}
            onChangeText={setDormRoom}
            placeholder="Ví dụ: Phòng 402 - KTX Dom E (Hòa Lạc)"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.divider} />

        {/* Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tiểu sử / Giới thiệu bản thân</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 40 }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Mô tả ngắn gọn về bạn để bạn bè tin tưởng giao dịch..."
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        activeOpacity={0.85}
        onPress={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.saveBtnContent}>
            <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Lưu thay đổi vào Local Storage</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  inputGroup: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  disabledInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  disabledInputText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  lockedText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    boxShadow: '0 3px 5px rgba(234, 88, 12, 0.25)',
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
