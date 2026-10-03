import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useKycStore, KycType } from '../../../stores/kycStore';
import { useUserStore } from '../../../stores/userStore';
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

const SAMPLE_STUDENT_CARD_FRONT = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80';
const SAMPLE_STUDENT_CARD_BACK = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
const SAMPLE_CITIZEN_FRONT = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';
const SAMPLE_CITIZEN_BACK = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80';

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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
  const { status, studentId: existingMssv, submitKyc, simulateApproveKyc } = useKycStore();

  const [activeTab, setActiveTab] = useState<KycType>(() => initialRole || (user?.isKycVerified ? 'SELLER' : 'STUDENT'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Fields
  const [studentId, setStudentId] = useState(existingMssv || user?.studentId || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [campus, setCampus] = useState(user?.campus || 'HÒA LẠC');
  const [major, setMajor] = useState(user?.major || 'Kỹ thuật phần mềm (SE)');

  // Student Tab Specific Photos
  const [studentFrontCard, setStudentFrontCard] = useState<string | null>(null);
  const [studentBackCard, setStudentBackCard] = useState<string | null>(null);

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

  // Synchronize user info when opening
  useEffect(() => {
    if (visible && user) {
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
  }, [visible, user, existingMssv]);

  const pickImage = useCallback((targetSetter: (uri: string) => void, title: string) => {
    showImagePickerAlert(title, targetSetter);
  }, []);

  const handleUseDemoStudentCards = useCallback(() => {
    setStudentFrontCard(SAMPLE_STUDENT_CARD_FRONT);
    setStudentBackCard(SAMPLE_STUDENT_CARD_BACK);
    setStudentId((prev) => prev || 'SE180293');
    Alert.alert('Ảnh mẫu đã sẵn sàng', 'Đã nạp 2 ảnh Thẻ sinh viên FPT demo chuẩn.');
  }, []);

  const handleUseDemoSellerCards = useCallback(() => {
    setCitizenFrontCard(SAMPLE_CITIZEN_FRONT);
    setCitizenBackCard(SAMPLE_CITIZEN_BACK);
    setBankAccount((prev) => prev || '0987654321');
    if (fullName) setBankAccountName(fullName.toUpperCase());
    Alert.alert('Dữ liệu mẫu đã sẵn sàng', 'Đã nạp ảnh CCCD và số tài khoản demo.');
  }, [fullName]);

  const handleSubmit = useCallback(async () => {
    if (!studentId.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Mã số sinh viên FPT (MSSV).');
      return;
    }

    if (activeTab === 'STUDENT') {
      if (!studentFrontCard) {
        Alert.alert('Thiếu ảnh thẻ', 'Vui lòng chụp hoặc tải ảnh mặt trước Thẻ Sinh Viên FPT.');
        return;
      }
    } else {
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
      const chosenImage = activeTab === 'STUDENT'
        ? (studentFrontCard || SAMPLE_STUDENT_CARD_FRONT)
        : (citizenFrontCard || studentFrontCard || SAMPLE_CITIZEN_FRONT);

      await submitKyc(studentId.trim().toUpperCase(), chosenImage, activeTab, {
        studentName: fullName,
        campus,
        major,
      });

      if (activeTab === 'SELLER') {
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
          : 'Hồ sơ xác thực sinh viên FPT đã được tiếp nhận. Bạn có thể sử dụng nút Thử nghiệm duyệt nhanh để kiểm tra.'
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

  const handleInstantApprove = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await simulateApproveKyc();

      if (activeTab === 'SELLER') {
        await updateUserProfile({
          role: 'SELLER',
          avatarBadge: 'TOP_SELLER',
          bankAccount: {
            bankName,
            accountNo: bankAccount.trim() || '0987654321',
            accountName: bankAccountName.trim().toUpperCase() || fullName.toUpperCase(),
          },
        });
      }

      Alert.alert(
        '✅ Đã phê duyệt KYC thành công (Demo)',
        `Tài khoản đã nâng cấp thành công vai trò ${activeTab === 'SELLER' ? 'TOP SELLER ⭐' : 'Sinh viên FPT Đã KYC ✓'}.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [simulateApproveKyc, activeTab, updateUserProfile, bankName, bankAccount, bankAccountName, fullName, onSuccess, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          <KycHeaderTabs
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onClose={onClose}
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
                studentFrontCard={studentFrontCard}
                setStudentFrontCard={setStudentFrontCard}
                studentBackCard={studentBackCard}
                setStudentBackCard={setStudentBackCard}
                onPickImage={pickImage}
                onUseDemoCards={handleUseDemoStudentCards}
              />
            ) : (
              <KycSellerTabForm
                storeName={storeName}
                setStoreName={setStoreName}
                handoffSpot={handoffSpot}
                setHandoffSpot={setHandoffSpot}
                bankName={bankName}
                setBankName={setBankName}
                bankAccount={bankAccount}
                setBankAccount={setBankAccount}
                bankAccountName={bankAccountName}
                setBankAccountName={setBankAccountName}
                citizenFrontCard={citizenFrontCard}
                setCitizenFrontCard={setCitizenFrontCard}
                citizenBackCard={citizenBackCard}
                setCitizenBackCard={setCitizenBackCard}
                agreedTerms={agreedTerms}
                setAgreedTerms={setAgreedTerms}
                showBankPicker={showBankPicker}
                setShowBankPicker={setShowBankPicker}
                onPickImage={pickImage}
                onUseDemoCards={handleUseDemoSellerCards}
              />
            )}
          </ScrollView>

          <KycFooterActions
            isPending={status === 'PENDING'}
            isSubmitting={isSubmitting}
            activeTab={activeTab}
            onInstantApprove={handleInstantApprove}
            onSubmit={handleSubmit}
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
});
