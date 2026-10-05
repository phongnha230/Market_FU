import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { VIETNAMESE_BANKS } from '../constants/banks.constants';


interface KycSellerTabFormProps {
  storeName: string;
  setStoreName: (val: string) => void;
  handoffSpot: string;
  setHandoffSpot: (val: string) => void;
  bankName: string;
  setBankName: (val: string) => void;
  bankAccount: string;
  setBankAccount: (val: string) => void;
  bankAccountName: string;
  setBankAccountName: (val: string) => void;
  citizenFrontCard: string | null;
  setCitizenFrontCard: (val: string) => void;
  citizenBackCard: string | null;
  setCitizenBackCard: (val: string) => void;
  agreedTerms: boolean;
  setAgreedTerms: (val: boolean) => void;
  showBankPicker: boolean;
  setShowBankPicker: (val: boolean) => void;
  onPickImage: (setter: (uri: string) => void, title: string) => void;
}

interface KycPhotoUploadSlotProps {
  label: string;
  photoUri: string | null;
  onPick: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  uploadText: string;
  style?: object;
}

const KycPhotoUploadSlot: React.FC<KycPhotoUploadSlotProps> = ({
  label,
  photoUri,
  onPick,
  iconName,
  iconColor,
  uploadText,
  style,
}) => (
  <View style={[{ flex: 1 }, style]}>
    <Text style={styles.photoSlotLabel}>{label}</Text>
    {photoUri ? (
      <View style={styles.photoPreviewBox}>
        <Image source={{ uri: photoUri }} style={styles.photoThumb} contentFit="cover" />
        <TouchableOpacity style={styles.repickBtn} onPress={onPick}>
          <Ionicons name="camera-reverse" size={14} color="#FFFFFF" />
          <Text style={styles.repickText}>Đổi</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={styles.photoUploadBox} onPress={onPick}>
        <Ionicons name={iconName} size={24} color={iconColor} />
        <Text style={styles.photoUploadText}>{uploadText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const KycSellerTabForm: React.FC<KycSellerTabFormProps> = React.memo(({
  storeName,
  setStoreName,
  handoffSpot,
  setHandoffSpot,
  bankName,
  setBankName,
  bankAccount,
  setBankAccount,
  bankAccountName,
  setBankAccountName,
  citizenFrontCard,
  setCitizenFrontCard,
  citizenBackCard,
  setCitizenBackCard,
  agreedTerms,
  setAgreedTerms,
  showBankPicker,
  setShowBankPicker,
  onPickImage,
}) => {
  return (
    <View>
      <Text style={styles.sectionHeading}>THIẾT LẬP GIAN HÀNG PASS ĐỒ</Text>

      {/* Tên gian hàng */}
      <Text style={styles.inputLabel}>Tên gian hàng / Góc pass đồ *</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="storefront-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={storeName}
          onChangeText={setStoreName}
          placeholder="VD: Góc Pass Đồ Hoàng Long"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Điểm giao dịch quen thuộc */}
      <Text style={styles.inputLabel}>Điểm hẹn nhận đồ thuận tiện tại trường</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="location-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={handoffSpot}
          onChangeText={setHandoffSpot}
          placeholder="VD: Sảnh Alpha, Dom E, Canteen 1..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* THÔNG TIN NGÂN HÀNG RÚT TIỀN */}
      <Text style={styles.sectionHeading}>TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN BÁN (VÍ ESCROW)</Text>

      {/* Chọn Ngân hàng */}
      <Text style={styles.inputLabel}>Ngân hàng thụ hưởng *</Text>
      <TouchableOpacity
        style={styles.bankSelectBtn}
        onPress={() => setShowBankPicker(!showBankPicker)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="business-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
            {VIETNAMESE_BANKS.find((b) => b.code === bankName)?.name || bankName}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#64748B" />
      </TouchableOpacity>

      {showBankPicker && (
        <View style={styles.bankPickerDropdown}>
          {VIETNAMESE_BANKS.map((b) => (
            <TouchableOpacity
              key={b.code}
              style={[
                styles.bankPickerItem,
                bankName === b.code && styles.bankPickerItemActive,
              ]}
              onPress={() => {
                setBankName(b.code);
                setShowBankPicker(false);
              }}
            >
              <Text
                style={[
                  styles.bankPickerText,
                  bankName === b.code && styles.bankPickerTextActive,
                ]}
              >
                {b.name}
              </Text>
              {bankName === b.code && (
                <Ionicons name="checkmark" size={16} color="#EA580C" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* STK */}
      <Text style={styles.inputLabel}>Số tài khoản ngân hàng *</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="card-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={bankAccount}
          onChangeText={setBankAccount}
          keyboardType="numeric"
          placeholder="VD: 0987654321"
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Tên chủ thẻ */}
      <Text style={styles.inputLabel}>Tên chủ tài khoản (Viết hoa không dấu) *</Text>
      <View style={styles.inputWrap}>
        <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={bankAccountName}
          onChangeText={(val) => setBankAccountName(val.toUpperCase())}
          placeholder="VD: NGUYEN VAN A"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
        />
      </View>

      {/* CCCD / Thẻ SV upload */}
      <Text style={styles.sectionHeading}>GIẤY TỜ ĐỊNH DANH NGƯỜI BÁN (CCCD / THẺ SV)</Text>
      <View style={styles.twoPhotosRow}>
        <KycPhotoUploadSlot
          style={{ marginRight: 6 }}
          label="Mặt trước CCCD / Thẻ SV"
          photoUri={citizenFrontCard}
          onPick={() => onPickImage(setCitizenFrontCard, 'Mặt trước CCCD')}
          iconName="camera-outline"
          iconColor="#EA580C"
          uploadText="Chụp mặt trước"
        />
        <KycPhotoUploadSlot
          style={{ marginLeft: 6 }}
          label="Mặt sau CCCD"
          photoUri={citizenBackCard}
          onPick={() => onPickImage(setCitizenBackCard, 'Mặt sau CCCD')}
          iconName="image-outline"
          iconColor="#64748B"
          uploadText="Chụp mặt sau"
        />
      </View>

      {/* Safe Point Pledge */}
      <TouchableOpacity
        style={styles.pledgeBox}
        onPress={() => setAgreedTerms(!agreedTerms)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={agreedTerms ? 'checkbox' : 'square-outline'}
          size={20}
          color={agreedTerms ? '#059669' : '#64748B'}
        />
        <Text style={styles.pledgeText}>
          Tôi cam kết chỉ pass đồ trung thực, đúng chất lượng, giao dịch an toàn tại các trạm Safe-Point trong trường FPT.
        </Text>
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
  bankSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  bankPickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 180,
    overflow: 'hidden',
  },
  bankPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bankPickerItemActive: {
    backgroundColor: '#FFF7ED',
  },
  bankPickerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  bankPickerTextActive: {
    color: '#EA580C',
    fontWeight: '700',
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
  pledgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  pledgeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 16,
  },
});
