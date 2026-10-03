import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditProfileContactSectionProps {
  phone: string;
  onPhoneChange: (val: string) => void;
  dormRoom: string;
  onDormRoomChange: (val: string) => void;
  bio: string;
  onBioChange: (val: string) => void;
}

export const EditProfileContactSection: React.FC<EditProfileContactSectionProps> = ({
  phone,
  onPhoneChange,
  dormRoom,
  onDormRoomChange,
  bio,
  onBioChange,
}) => {
  return (
    <>
      <Text style={[styles.groupHeading, { marginTop: 14 }]}>
        LIÊN HỆ & ĐỊA ĐIỂM GIAO DỊCH TRONG TRƯỜNG
      </Text>

      {/* Số điện thoại */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Số điện thoại / Zalo</Text>
        <View style={styles.inputBox}>
          <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            placeholder="0987 654 321"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Phòng KTX / Điểm nhận */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phòng KTX / Điểm hẹn nhận đồ</Text>
        <View style={styles.inputBox}>
          <Ionicons name="location-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={dormRoom}
            onChangeText={onDormRoomChange}
            placeholder="Ví dụ: Phòng 304 - KTX Dom A (Hòa Lạc)"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* Bio */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Giới thiệu bản thân (Bio)</Text>
        <View style={[styles.inputBox, styles.bioBox]}>
          <TextInput
            style={[styles.textInput, styles.bioInput]}
            value={bio}
            onChangeText={onBioChange}
            placeholder="Mô tả đồ hay pass, sở thích hoặc thời gian rảnh..."
            placeholderTextColor="#94A3B8"
            multiline
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
  bioBox: {
    height: 75,
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  bioInput: {
    height: 60,
  },
});
