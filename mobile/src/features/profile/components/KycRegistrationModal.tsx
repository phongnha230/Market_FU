import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useKycStore, KycType } from '../../../stores/kycStore';
import { useUserStore } from '../../../stores/userStore';
import { profileMobileService } from '../../../services/profileMobileService';
import { KycHeaderTabs } from './KycHeaderTabs';
import { KycPendingNotice } from './KycPendingNotice';
import { KycStudentTabForm } from './KycStudentTabForm';
import { KycSellerTabForm } from './KycSellerTabForm';
import { KycFooterActions } from './KycFooterActions';

interface KycRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  initialRole?: 'STUDENT' | 'SELLER';
  onSuccess?: () => void;
}

const showImagePickerAlert = (
  title: string,
  targetSetter: (uri: string) => void
) => {
  Alert.alert(
    title,
    'Chọn phương thức tải ảnh',
    [
      {
        text: 'Chụp ảnh mới (Camera)',
        onPress: async () => {
          const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
          if (camStatus !== 'granted') {
            Alert.alert('Cấp quyền', 'Vui lòng cho phép quyền máy ảnh.');
            return;
          }
          const res = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 10],
            quality: 0.8,
          });
          if (!res.canceled && res.assets && res.assets.length > 0) {
            targetSetter(res.assets[0].uri);
          }
        },
      },
      {
        text: 'Chọn từ Thư viện',
        onPress: async () => {
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 10],
            quality: 0.8,
          });
          if (!res.canceled && res.assets && res.assets.length > 0) {
            targetSetter(res.assets[0].uri);
          }
        },
      },
      { text: 'Hủy', style: 'cancel' },
    ]
  );
};

export const KycRegistrationModal: React.FC<KycRegistrationModalProps> = ({
  visible,
  onClose,
  initialRole = 'STUDENT',
  onSuccess,
}) => {
  const { user, updateUserProfile } = useUserStore();
  const { status, studentId: existingMssv, submitKyc } = useKycStore();

  const isStudentVerified = Boolean(
    user?.isKycVerified ||
    user?.kycStatus === 'APPROVED' ||
    ((user?.role as string) !== 'UNVERIFIED' && Boolean(user?.studentId))
  );
  const isSellerApproved = user?.role === 'SELLER';
  const [isEditingSellerInfo, setIsEditingSellerInfo] = useState(false);

  const [activeTab, setActiveTab] = useState<KycType>(() => {
    if (!isStudentVerified) return 'STUDENT';
    return initialRole || 'SELLER';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Fields
  const [studentId, setStudentId] = useState(existingMssv || user?.studentId || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [campus, setCampus] = useState(user?.campus || 'HÒA LẠC');
  const [major, setMajor] = useState(user?.major || 'Kỹ thuật phần mềm (SE)');

  // Student Tab Specific Photos
  const [studentFrontCard, setStudentFrontCard] = useState<string | null>(null);
  const [studentBackCard, setStudentBackCard] = useState<string | null>(null);

  const cohort = user?.cohort || (user?.studentId ? `K${user.studentId.replace(/\D/g, '').slice(0, 2)}` : '') || 'K19';
  const [category, setCategory] = useState('Giáo trình & Tài liệu học IT');
  const [citizenId, setCitizenId] = useState('');

  // Seller Tab Specific Fields
  const [storeName, setStoreName] = useState(user?.name ? `Góc Pass Đồ ${user.name}` : 'Góc Pass Đồ Campus');
  const [handoffSpot, setHandoffSpot] = useState(user?.dormRoom || 'Sảnh Tòa Alpha / Thư viện');
  const [bankName, setBankName] = useState(user?.bankAccount?.bankName || 'MB');
  const [bankAccount, setBankAccount] = useState(user?.bankAccount?.accountNo || '');
  const [bankAccountName, setBankAccountName] = useState(user?.bankAccount?.accountName || user?.name?.toUpperCase() || '');
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [citizenFrontCard, setCitizenFrontCard] = useState<string | null>(null);
  const [citizenBackCard, setCitizenBackCard] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(true);

  const handleSelectTab = useCallback((tab: KycType) => {
    if (tab === 'SELLER' && !isStudentVerified) {
      Alert.alert(
        '🔒 Yêu cầu Thẻ Sinh Viên FPT',
        'Quy định an toàn FPT Campus: Bạn cần hoàn thành Xác thực Thẻ Sinh Viên (Bước 1) và được duyệt trước khi đăng ký mở gian hàng Người Bán!'
      );
      return;
    }
    setActiveTab(tab);
  }, [isStudentVerified]);

  // Synchronize user info when opening
  useEffect(() => {
    if (visible) {
      if (!isStudentVerified) {
        setActiveTab('STUDENT');
      } else if (initialRole) {
        setActiveTab(initialRole);
      }
      if (user) {
        setStudentId(user.studentId || existingMssv || '');
        setFullName(user.name || '');
        setCampus(user.campus || 'HÒA LẠC');
        setMajor(user.major || 'Kỹ thuật phần mềm (SE)');
        if (user.dormRoom) setHandoffSpot(user.dormRoom);
        if (user.name) {
          setStoreName(`Góc Pass Đồ ${user.name}`);
          setBankAccountName(user.name.toUpperCase());
        }
        if (user.bankAccount) {
          setBankName(user.bankAccount.bankName || 'MB');
          setBankAccount(user.bankAccount.accountNo || '');
          setBankAccountName(user.bankAccount.accountName || user.name?.toUpperCase() || '');
        }
      }
    }
  }, [visible, user, existingMssv, initialRole, isStudentVerified]);

  const pickImage = useCallback((targetSetter: (uri: string) => void, title: string) => {
    showImagePickerAlert(title, targetSetter);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!studentId.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Mã số sinh viên FPT (MSSV).');
      return;
    }

    if (activeTab === 'SELLER' && isSellerApproved) {
      if (!bankAccount.trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập Số tài khoản ngân hàng để nhận tiền rút từ ví.');
        return;
      }
      try {
        setIsSubmitting(true);
        await updateUserProfile({
          bankAccount: {
            bankName,
            accountNo: bankAccount.trim(),
            accountName: bankAccountName.trim().toUpperCase() || fullName.toUpperCase(),
          },
          dormRoom: handoffSpot.trim(),
        });
        Alert.alert(
          '🎉 Cập nhật thành công!',
          'Thông tin tài khoản nhận tiền thanh toán và điểm hẹn Safe-Point của bạn đã được lưu trữ an toàn.'
        );
        setIsEditingSellerInfo(false);
        if (onSuccess) onSuccess();
      } catch (e: any) {
        Alert.alert('Lỗi', e.message || 'Không thể cập nhật tài khoản.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'STUDENT') {
      if (isStudentVerified) {
        Alert.alert('Thông báo', 'Tài khoản của bạn đã được xác thực Thẻ Sinh Viên chính quy FPT rồi.');
        return;
      }
      if (!studentFrontCard) {
        Alert.alert('Thiếu ảnh thẻ', 'Vui lòng chụp hoặc tải ảnh mặt trước Thẻ Sinh Viên FPT.');
        return;
      }
    } else {
      if (!isStudentVerified) {
        Alert.alert(
          '🔒 Yêu cầu Thẻ Sinh Viên FPT',
          'Quy định an toàn FPT Campus: Bạn cần hoàn thành Xác thực Thẻ Sinh Viên FPT (Bước 1) và được duyệt trước khi đăng ký mở gian hàng Người Bán.'
        );
        return;
      }
      if (!bankAccount.trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập Số tài khoản ngân hàng để nhận tiền rút từ ví.');
        return;
      }
      if (!agreedTerms) {
        Alert.alert('Chưa xác nhận', 'Vui lòng đồng ý với cam kết giao dịch an toàn tại Safe-Point Campus.');
        return;
      }
      if (!citizenFrontCard && !studentFrontCard) {
        Alert.alert('Thiếu giấy tờ', 'Vui lòng tải ảnh CCCD hoặc Thẻ Sinh viên để mở quyền Người bán.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const chosenImage = (activeTab === 'STUDENT'
        ? studentFrontCard
        : (citizenFrontCard || studentFrontCard)) || '';

      await submitKyc(studentId.trim().toUpperCase(), chosenImage, activeTab, {
        studentName: fullName,
        campus,
        major,
      });

      if (activeTab === 'SELLER') {
        try {
          await profileMobileService.submitSellerOnboarding({
            fullName: fullName.trim(),
            studentId: studentId.trim().toUpperCase(),
            phoneNumber: user?.phone || '0901234567',
            campus,
            bankName,
            accountNo: bankAccount.trim(),
            accountName: bankAccountName.trim().toUpperCase() || fullName.toUpperCase(),
            cardImageUri: chosenImage || undefined,
          });
        } catch (err: any) {
          console.log('⚠️ [submitSellerOnboarding error/fallback]:', err?.message);
        }

        await updateUserProfile({
          bankAccount: {
            bankName,
            accountNo: bankAccount.trim(),
            accountName: bankAccountName.trim().toUpperCase() || fullName.toUpperCase(),
          },
          dormRoom: handoffSpot.trim(),
        });
      }

      Alert.alert(
        '🎉 Gửi hồ sơ thành công!',
        activeTab === 'SELLER'
          ? 'Hồ sơ đăng ký Người Bán đã được gửi. Admin Campus sẽ phê duyệt trong vòng 2-4 giờ.'
          : 'Hồ sơ xác thực sinh viên FPT đã được tiếp nhận. Admin Campus sẽ phê duyệt trong vòng 2-4 giờ.'
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể gửi hồ sơ xác thực.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    studentId,
    activeTab,
    isStudentVerified,
    studentFrontCard,
    bankAccount,
    agreedTerms,
    citizenFrontCard,
    submitKyc,
    fullName,
    campus,
    major,
    updateUserProfile,
    bankName,
    bankAccountName,
    handoffSpot,
    onSuccess,
    onClose,
  ]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          <KycHeaderTabs
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            onClose={onClose}
            isStudentVerified={isStudentVerified}
            isSellerVerified={isSellerApproved}
          />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {status === 'PENDING' && <KycPendingNotice />}

            {activeTab === 'STUDENT' ? (
              <KycStudentTabForm
                studentId={studentId}
                setStudentId={setStudentId}
                fullName={fullName}
                setFullName={setFullName}
                campus={campus}
                setCampus={setCampus}
                major={major}
                setMajor={setMajor}
                cohort={cohort}
                studentFrontCard={studentFrontCard}
                setStudentFrontCard={setStudentFrontCard}
                studentBackCard={studentBackCard}
                setStudentBackCard={setStudentBackCard}
                onPickImage={pickImage}
                isStudentVerified={isStudentVerified}
                isSellerApproved={isSellerApproved}
                onUpgradeToSeller={() => handleSelectTab('SELLER')}
              />
            ) : isSellerApproved && !isEditingSellerInfo ? (
              <View style={styles.verifiedSellerOverviewCard}>
                <View style={styles.verifiedSellerBadgeRow}>
                  <View style={styles.verifiedIconCircle}>
                    <Ionicons name="shield-checkmark" size={24} color="#059669" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.verifiedSellerTitle}>TOP SELLER ĐÃ XÁC THỰC ⭐</Text>
                    <Text style={styles.verifiedSellerSub}>
                      Tài khoản của bạn đã hoàn tất định danh Người Bán Campus FPT và đang hoạt động bình thường.
                    </Text>
                  </View>
                </View>

                <View style={styles.verifiedSellerInfoGrid}>
                  <View style={styles.verifiedGridRow}>
                    <Text style={styles.gridLabel}>Chủ gian hàng:</Text>
                    <Text style={styles.gridValBold} numberOfLines={1}>{user?.name || fullName}</Text>
                  </View>
                  <View style={styles.verifiedGridRow}>
                    <Text style={styles.gridLabel}>MSSV & Cơ sở:</Text>
                    <Text style={styles.gridVal} numberOfLines={1}>{user?.studentId || studentId} • {user?.campus || campus}</Text>
                  </View>
                  <View style={styles.verifiedGridRow}>
                    <Text style={styles.gridLabel}>Tài khoản Escrow:</Text>
                    <Text style={styles.gridValHighlight} numberOfLines={1}>
                      {bankName} • {bankAccount ? `${bankAccount.slice(0, 4)}***${bankAccount.slice(-3)}` : '0397***607'}
                    </Text>
                  </View>
                  <View style={styles.verifiedGridRow}>
                    <Text style={styles.gridLabel}>Tên chủ tài khoản:</Text>
                    <Text style={styles.gridValBold} numberOfLines={1}>{bankAccountName || fullName.toUpperCase()}</Text>
                  </View>
                  <View style={styles.verifiedGridRow}>
                    <Text style={styles.gridLabel}>Điểm hẹn Handoff:</Text>
                    <Text style={styles.gridVal} numberOfLines={1}>{handoffSpot}</Text>
                  </View>
                  <View style={styles.verifiedGridRow}>
                    <Text style={styles.gridLabel}>Giấy tờ lưu trữ:</Text>
                    <View style={styles.secureDocRow}>
                      <Ionicons name="lock-closed" size={12} color="#059669" />
                      <Text style={styles.secureDocText}>Đã mã hóa & bảo vệ</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editPayoutBtn}
                  activeOpacity={0.8}
                  onPress={() => setIsEditingSellerInfo(true)}
                >
                  <Ionicons name="create-outline" size={16} color="#EA580C" style={{ marginRight: 6 }} />
                  <Text style={styles.editPayoutBtnText}>Cập nhật lại tài khoản thanh toán</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <KycSellerTabForm
                fullName={fullName}
                studentId={studentId}
                campus={campus}
                major={major}
                cohort={cohort}
                isStudentVerified={isStudentVerified}
                isSellerApproved={isSellerApproved}
                isEditingSeller={isEditingSellerInfo}
                storeName={storeName}
                setStoreName={setStoreName}
                category={category}
                setCategory={setCategory}
                handoffSpot={handoffSpot}
                setHandoffSpot={setHandoffSpot}
                bankName={bankName}
                setBankName={setBankName}
                bankAccount={bankAccount}
                setBankAccount={setBankAccount}
                bankAccountName={bankAccountName}
                setBankAccountName={setBankAccountName}
                citizenId={citizenId}
                setCitizenId={setCitizenId}
                citizenFrontCard={citizenFrontCard}
                setCitizenFrontCard={setCitizenFrontCard}
                citizenBackCard={citizenBackCard}
                setCitizenBackCard={setCitizenBackCard}
                agreedTerms={agreedTerms}
                setAgreedTerms={setAgreedTerms}
                showBankPicker={showBankPicker}
                setShowBankPicker={setShowBankPicker}
                onPickImage={pickImage}
              />
            )}
          </ScrollView>

          <KycFooterActions
            isPending={status === 'PENDING'}
            isSubmitting={isSubmitting}
            activeTab={activeTab}
            onSubmit={handleSubmit}
            isStudentVerified={isStudentVerified}
            isSellerApproved={isSellerApproved}
            isEditingSeller={isEditingSellerInfo}
            onToggleEditSeller={() => setIsEditingSellerInfo(true)}
            onCancelEditSeller={() => setIsEditingSellerInfo(false)}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default KycRegistrationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  verifiedSellerOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  verifiedSellerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedSellerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  verifiedSellerSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  verifiedSellerInfoGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  verifiedGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    flexShrink: 0,
  },
  gridVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  gridValBold: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  gridValHighlight: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  secureDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  secureDocText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#065F46',
  },
  editPayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  editPayoutBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EA580C',
  },
});
