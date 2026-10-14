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
  const { status, studentId: existingMssv, submitKyc } = useKycStore();

  const isStudentVerified = Boolean(
    user?.isKycVerified ||
    user?.kycStatus === 'APPROVED' ||
    ((user?.role as string) !== 'UNVERIFIED' && Boolean(user?.studentId))
  );

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
                onUpgradeToSeller={() => handleSelectTab('SELLER')}
              />
            ) : (
              <KycSellerTabForm
                fullName={fullName}
                studentId={studentId}
                campus={campus}
                major={major}
                cohort={cohort}
                isStudentVerified={isStudentVerified}
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
