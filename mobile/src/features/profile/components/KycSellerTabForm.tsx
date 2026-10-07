import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { VIETNAMESE_BANKS } from '../constants/banks.constants';

const SELLER_CATEGORIES = [
  'Giáo trình & Tài liệu học IT',
  'Đồ gia dụng & Phòng trọ KTX',
  'Thiết bị điện tử & Laptop',
  'Thời trang & Đồ dùng cá nhân',
  'Xe máy & Xe đạp điện Campus',
];

interface KycSellerTabFormProps {
  fullName: string;
  studentId: string;
  campus: string;
  major: string;
  cohort?: string;
  isStudentVerified: boolean;
  storeName: string;
  setStoreName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  handoffSpot: string;
  setHandoffSpot: (val: string) => void;
  bankName: string;
  setBankName: (val: string) => void;
  bankAccount: string;
  setBankAccount: (val: string) => void;
  bankAccountName: string;
  setBankAccountName: (val: string) => void;
  citizenId: string;
  setCitizenId: (val: string) => void;
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
  fullName,
  studentId,
  campus,
  major,
  cohort,
  isStudentVerified,
  storeName,
  setStoreName,
  category,
  setCategory,
  handoffSpot,
  setHandoffSpot,
  bankName,
  setBankName,
  bankAccount,
  setBankAccount,
  bankAccountName,
  setBankAccountName,
  citizenId,
  setCitizenId,
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
    <View style={{ gap: 16 }}>
      {/* BƯỚC 2: HỒ SƠ SINH VIÊN FPT EDU (Đã xác thực qua FAP SSO - Được bảo vệ) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <Text style={styles.stepTitle}>BƯỚC 2: HỒ SƠ SINH VIÊN FPT EDU *</Text>
          {isStudentVerified ? (
            <View style={styles.fapBadge}>
              <Ionicons name="lock-closed" size={11} color="#059669" />
              <Text style={styles.fapBadgeText}>Đã xác thực FAP SSO</Text>
            </View>
          ) : (
            <Text style={styles.fapUnverifiedHint}>Sinh viên chính quy FPT</Text>
          )}
        </View>

        <View style={styles.fptInfoBox}>
          <View style={styles.fptInfoRow}>
            <View style={styles.fptInfoCol}>
              <Text style={styles.fptInfoLabel}>Họ tên sinh viên:</Text>
              <Text style={styles.fptInfoVal}>{fullName}</Text>
            </View>
            <View style={styles.fptInfoCol}>
              <Text style={styles.fptInfoLabel}>Mã SV (MSSV):</Text>
              <Text style={styles.fptInfoValMono}>{studentId}</Text>
            </View>
          </View>
          <View style={[styles.fptInfoRow, { marginTop: 8 }]}>
            <View style={styles.fptInfoCol}>
              <Text style={styles.fptInfoLabel}>Cơ sở Campus:</Text>
              <Text style={styles.fptInfoVal}>{campus || 'Hòa Lạc'}</Text>
            </View>
            <View style={styles.fptInfoCol}>
              <Text style={styles.fptInfoLabel}>Khóa & Ngành:</Text>
              <Text style={styles.fptInfoVal}>
                {cohort || 'K19'} • {major || 'Công nghệ thông tin'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* BƯỚC 3: THIẾT LẬP GIAN HÀNG & KINH DOANH CAMPUS */}
      <View style={styles.sectionCard}>
        <Text style={styles.stepTitle}>BƯỚC 3: THIẾT LẬP GIAN HÀNG & KINH DOANH CAMPUS</Text>

        {/* Tên gian hàng */}
        <Text style={styles.inputLabel}>Tên gian hàng hiển thị *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="storefront-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={storeName}
            onChangeText={setStoreName}
            placeholder="VD: Góc Pass Đồ Trần Đỗ Phong Nhã"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Danh mục đồ bán chính */}
        <Text style={styles.inputLabel}>Danh mục đồ bán chính *</Text>
        <View style={styles.categoryChipsRow}>
          {SELLER_CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Điểm hẹn Safe-Handoff ưu tiên */}
        <Text style={styles.inputLabel}>Điểm hẹn Safe-Handoff ưu tiên *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={handoffSpot}
            onChangeText={setHandoffSpot}
            placeholder="VD: Sảnh Tòa Alpha (Hola), Cổng Dom KTX..."
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      {/* BƯỚC 4: TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN GIAO DỊCH (ESCROW) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <Text style={styles.stepTitle}>BƯỚC 4: TÀI KHOẢN NGÂN HÀNG (ESCROW)</Text>
          <View style={styles.autoPayoutBadge}>
            <Text style={styles.autoPayoutBadgeText}>Chuyển khoản tự động sau 48h</Text>
          </View>
        </View>

        {/* Ngân hàng */}
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
        <Text style={styles.inputLabel}>Số tài khoản ngân hàng (STK) *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="card-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={bankAccount}
            onChangeText={setBankAccount}
            keyboardType="numeric"
            placeholder="Ví dụ: 0982345892 hoặc 10283948..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Tên chủ thẻ */}
        <Text style={styles.inputLabel}>Tên chủ tài khoản (In hoa không dấu) *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={bankAccountName}
            onChangeText={(val) => setBankAccountName(val.toUpperCase())}
            placeholder="VD: TRẦN ĐỖ PHONG NHÃ"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </View>

        <Text style={styles.bankNoticeText}>
          💡 Lưu ý: Tên chủ tài khoản ngân hàng nên trùng khớp với thông tin sinh viên để lệnh giải ngân tiền cọc Escrow được duyệt tự động.
        </Text>
      </View>

      {/* BƯỚC 5: XÁC THỰC CĂN CƯỚC CÔNG DÂN (CCCD) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderBetween}>
          <Text style={styles.stepTitle}>BƯỚC 5: XÁC THỰC CĂN CƯỚC CÔNG DÂN (CCCD) *</Text>
          <Text style={styles.secureStandardHint}>Chuẩn pháp lý bảo mật</Text>
        </View>

        <Text style={styles.inputLabel}>Số Căn cước công dân (12 chữ số) *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="id-card-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={citizenId}
            onChangeText={setCitizenId}
            keyboardType="numeric"
            maxLength={12}
            placeholder="Ví dụ: 001201018923"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.twoPhotosRow}>
          <KycPhotoUploadSlot
            style={{ marginRight: 6 }}
            label="1. Mặt trước CCCD *"
            photoUri={citizenFrontCard}
            onPick={() => onPickImage(setCitizenFrontCard, 'Mặt trước CCCD')}
            iconName="camera-outline"
            iconColor="#EA580C"
            uploadText="Chụp mặt trước"
          />
          <KycPhotoUploadSlot
            style={{ marginLeft: 6 }}
            label="2. Mặt sau CCCD (Chip & Vân tay) *"
            photoUri={citizenBackCard}
            onPick={() => onPickImage(setCitizenBackCard, 'Mặt sau CCCD')}
            iconName="image-outline"
            iconColor="#64748B"
            uploadText="Chụp mặt sau"
          />
        </View>
      </View>

      {/* Cam kết tuân thủ quy chế an toàn Escrow */}
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
          Tôi cam kết là sinh viên chính quy Đại học FPT, các thông tin học vụ, tài khoản ngân hàng và ảnh định danh cung cấp là chính chủ. Tôi cam kết tuân thủ quy chế mua bán Safe-Handoff và chính sách hoàn tiền Escrow 48h của trường FPT.
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.3,
  },
  fapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  fapBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#065F46',
  },
  fapUnverifiedHint: {
    fontSize: 10,
    color: '#94A3B8',
  },
  fptInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fptInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fptInfoCol: {
    flex: 1,
  },
  fptInfoLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  fptInfoVal: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  fptInfoValMono: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginTop: 4,
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
    marginBottom: 8,
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
  categoryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  categoryChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
  autoPayoutBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  autoPayoutBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#C2410C',
  },
  bankSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  bankPickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 10,
    maxHeight: 180,
    overflow: 'hidden',
  },
  bankPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  bankPickerItemActive: {
    backgroundColor: '#FFF7ED',
  },
  bankPickerText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  bankPickerTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  bankNoticeText: {
    fontSize: 10.5,
    color: '#D97706',
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '500',
  },
  secureStandardHint: {
    fontSize: 10,
    color: '#94A3B8',
  },
  twoPhotosRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  photoSlotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  photoUploadBox: {
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
  photoUploadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  photoPreviewBox: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photoThumb: {
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
  pledgeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 8,
  },
  pledgeText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '500',
  },
});
