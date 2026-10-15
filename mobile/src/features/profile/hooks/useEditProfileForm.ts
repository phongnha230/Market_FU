import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserStore } from '../../../stores/userStore';

const SAMPLE_AVATAR_URL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

interface ProfileFormData {
  avatar: string;
  name: string;
  studentId: string;
  campus: string;
  cohort: string;
  major: string;
  phone: string;
  dormRoom: string;
  bio: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

const isDummyAvatar = (url?: string | null) =>
  !url ||
  url.includes('photo-1535713875002-d1d0cf377fde') ||
  url.includes('photo-1534528741775-53994a69daeb') ||
  url.includes('photo-1570295999919-56ceb5ecca61');

const getInitialFormData = (user: any): ProfileFormData => {
  const derivedCohort =
    user?.cohort ||
    (user?.studentId ? `K${user.studentId.replace(/\D/g, '').slice(0, 2)}` : '') ||
    'K18';

  const rawAvatar = user?.avatarUrl || user?.avatar || '';
  const initialAvatar = isDummyAvatar(rawAvatar) ? '' : rawAvatar;

  return {
    avatar: initialAvatar,
    name: user?.name || '',
    studentId: user?.studentId || '',
    campus: user?.campus || 'HÒA LẠC',
    cohort: derivedCohort,
    major: user?.major || 'Kỹ thuật phần mềm (SE)',
    phone: user?.phone || '',
    dormRoom: user?.dormRoom || user?.roomNumber || '',
    bio: user?.bio || '',
    bankName: user?.bankAccount?.bankName || 'MB',
    accountNo: user?.bankAccount?.accountNo || '',
    accountName: user?.bankAccount?.accountName || user?.name?.toUpperCase() || '',
  };
};

async function pickAvatarFromSource(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập máy ảnh để chụp ảnh.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
  } else {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
  }
  return null;
}

function buildProfileUpdatePayload(params: ProfileFormData, isVerified: boolean) {
  const updates: any = {
    name: params.name.trim(),
    phone: params.phone.trim(),
    dormRoom: params.dormRoom.trim(),
    roomNumber: params.dormRoom.trim(),
    bio: params.bio.trim(),
    avatar: params.avatar || undefined,
    avatarUrl: params.avatar || undefined,
  };

  // Cố định campus nếu đã là sinh viên xác thực (giống hệt Web).
  // Chỉ cho phép chọn đổi cơ sở nếu tài khoản chưa xác thực Thẻ SV.
  if (!isVerified) {
    updates.campus = params.campus;
  }

  if (params.accountNo.trim()) {
    updates.bankAccount = {
      bankName: params.bankName,
      accountNo: params.accountNo.trim(),
      accountName: (params.accountName || params.name).trim().toUpperCase(),
    };
  }
  return updates;
}

export function useEditProfileForm(
  visible: boolean,
  onClose: () => void,
  onSaveSuccess?: () => void
) {
  const { user, updateUserProfile, isLoading } = useUserStore();
  const [formData, setFormData] = useState<ProfileFormData>(() => getInitialFormData(user));

  useEffect(() => {
    if (visible && user) {
      setFormData(getInitialFormData(user));
    }
  }, [visible, user]);

  const updateField = useCallback(<K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handlePickAvatar = useCallback(() => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn tải ảnh đại diện từ đâu?',
      [
        {
          text: 'Máy ảnh',
          onPress: async () => {
            const uri = await pickAvatarFromSource('camera');
            if (uri) updateField('avatar', uri);
          },
        },
        {
          text: 'Thư viện ảnh',
          onPress: async () => {
            const uri = await pickAvatarFromSource('library');
            if (uri) updateField('avatar', uri);
          },
        },
        {
          text: 'Xóa ảnh (dùng chữ cái đại diện)',
          style: 'destructive',
          onPress: () => updateField('avatar', ''),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  }, [updateField]);

  const isVerified = useMemo(() => {
    if (!user) return false;
    if ((user.role as string) === 'UNVERIFIED' || !user.studentId) {
      return false;
    }
    return Boolean(
      user.isKycVerified === true ||
      user.kycStatus === 'APPROVED' ||
      ((user.role as string) !== 'UNVERIFIED' && user.studentId)
    );
  }, [user]);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Họ và tên sinh viên không được để trống.');
      return;
    }

    const updates = buildProfileUpdatePayload(formData, isVerified);
    const res = await updateUserProfile(updates);
    if (res.success) {
      Alert.alert('Thành công', 'Hồ sơ sinh viên đã được cập nhật thành công!');
      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } else {
      Alert.alert('Lỗi', res.message || 'Không thể cập nhật hồ sơ');
    }
  }, [formData, isVerified, updateUserProfile, onSaveSuccess, onClose]);

  const isEduEmail = useMemo(() => {
    const email = user?.email?.toLowerCase() || '';
    return email.endsWith('@fpt.edu.vn') || email.endsWith('@fe.edu.vn');
  }, [user?.email]);

  const setName = useCallback((val: string) => updateField('name', val), [updateField]);
  const setCampus = useCallback((val: string) => updateField('campus', val), [updateField]);
  const setMajor = useCallback((val: string) => updateField('major', val), [updateField]);
  const setPhone = useCallback((val: string) => updateField('phone', val), [updateField]);
  const setDormRoom = useCallback((val: string) => updateField('dormRoom', val), [updateField]);
  const setBio = useCallback((val: string) => updateField('bio', val), [updateField]);
  const setBankName = useCallback((val: string) => updateField('bankName', val), [updateField]);
  const setAccountNo = useCallback((val: string) => updateField('accountNo', val), [updateField]);
  const setAccountName = useCallback((val: string) => updateField('accountName', val), [updateField]);

  return {
    avatar: formData.avatar,
    name: formData.name,
    setName,
    studentId: formData.studentId,
    campus: formData.campus,
    setCampus,
    cohort: formData.cohort,
    major: formData.major,
    setMajor,
    phone: formData.phone,
    setPhone,
    dormRoom: formData.dormRoom,
    setDormRoom,
    bio: formData.bio,
    setBio,
    bankName: formData.bankName,
    setBankName,
    accountNo: formData.accountNo,
    setAccountNo,
    accountName: formData.accountName,
    setAccountName,
    userEmail: user?.email || '',
    isEduEmail,
    isVerified,
    isLoading,
    handlePickAvatar,
    handleSave,
  };
}
