import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { reportMobileService } from '../../../services/reportMobileService';

interface UseReportModalParams {
  targetType: 'PRODUCT' | 'USER';
  targetId: string;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useReportModal = ({
  targetType,
  targetId,
  onSuccess,
  onClose,
}: UseReportModalParams) => {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = useCallback(async () => {
    if (!selectedReasonId) {
      Alert.alert('Chưa chọn lý do', 'Vui lòng chọn một lý do vi phạm cụ thể.');
      return;
    }

    try {
      setIsSubmitting(true);
      await reportMobileService.createReport({
        targetType,
        targetId,
        reason: selectedReasonId,
        details: details.trim() || undefined,
      });

      Alert.alert(
        'Đã gửi báo cáo',
        'Cảm ơn bạn đã phản ánh! Ban Quản Trị Campus sẽ điều tra và xử lý vi phạm trong vòng 24 giờ.'
      );
      setSelectedReasonId('');
      setDetails('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi báo cáo lúc này, vui lòng thử lại sau.';
      Alert.alert('Lỗi', msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedReasonId, details, targetType, targetId, onSuccess, onClose]);

  return {
    selectedReasonId,
    setSelectedReasonId,
    details,
    setDetails,
    isSubmitting,
    handleSubmit,
  };
};

export default useReportModal;
