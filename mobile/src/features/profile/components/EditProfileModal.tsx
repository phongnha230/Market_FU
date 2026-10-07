import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EditProfileAvatarSection } from './EditProfileAvatarSection';
import { EditProfileAcademicSection } from './EditProfileAcademicSection';
import { EditProfileContactSection } from './EditProfileContactSection';
import { useEditProfileForm } from '../hooks/useEditProfileForm';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const CAMPUSES = [
  'HÒA LẠC',
  'TP. HỒ CHÍ MINH',
  'ĐÀ NẴNG',
  'CẦN THƠ',
  'QUY NHƠN',
];

const EditProfileHeader: React.FC<{ onClose: () => void }> = React.memo(({ onClose }) => (
  <View style={styles.sheetHeader}>
    <View style={styles.dragIndicator} />
    <View style={styles.titleRow}>
      <View style={styles.headerIconBox}>
        <Ionicons name="person-circle" size={24} color="#EA580C" />
      </View>
      <View style={styles.titleTextCol}>
        <Text style={styles.sheetTitle}>Chỉnh sửa hồ sơ sinh viên</Text>
        <Text style={styles.sheetSubtitle}>Cập nhật thông tin giao dịch FPT 5Campus</Text>
      </View>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={22} color="#64748B" />
      </TouchableOpacity>
    </View>
  </View>
));

const EditProfileFooter: React.FC<{
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
}> = React.memo(({ isLoading, onClose, onSave }) => (
  <View style={styles.sheetFooter}>
    <TouchableOpacity
      style={styles.cancelBtn}
      onPress={onClose}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.saveBtn}
      onPress={onSave}
      activeOpacity={0.85}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          <MaterialCommunityIcons name="content-save-check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
        </>
      )}
    </TouchableOpacity>
  </View>
));

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  onSaveSuccess,
}) => {
  const form = useEditProfileForm(visible, onClose, onSaveSuccess);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalSheet}>
          <EditProfileHeader onClose={onClose} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            <EditProfileAvatarSection
              avatar={form.avatar}
              name={form.name}
              onPickAvatar={form.handlePickAvatar}
            />

            <EditProfileAcademicSection
              name={form.name}
              onNameChange={form.setName}
              studentId={form.studentId}
              email={form.userEmail}
              isEduEmail={form.isEduEmail}
              campus={form.campus}
              onCampusChange={form.setCampus}
              campuses={CAMPUSES}
              cohort={form.cohort}
              major={form.major}
              onMajorChange={form.setMajor}
              isVerified={form.isVerified}
            />

            <EditProfileContactSection
              phone={form.phone}
              onPhoneChange={form.setPhone}
              dormRoom={form.dormRoom}
              onDormRoomChange={form.setDormRoom}
              bio={form.bio}
              onBioChange={form.setBio}
            />
          </ScrollView>

          <EditProfileFooter
            isLoading={form.isLoading}
            onClose={onClose}
            onSave={form.handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileModal;

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
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
