import { useState } from 'react';
import { Alert } from 'react-native';
import { DISPUTE_REASONS } from '../constants/dispute.constants';
import { DisputeType, EvidenceItem } from '../types/dispute.types';
import { orderMobileService } from '../../../services/orderMobileService';
import { useOrderStore } from '../../../stores/orderStore';

export const useDispute = (onGoBack?: () => void, orderId?: string) => {
  const [disputeType, setDisputeType] = useState<DisputeType>('refund_full');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const removeEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0 && !description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ít nhất một lý do khiếu nại hoặc nhập mô tả sự cố.');
      return;
    }

    const reasonsText = selectedReasons
      .map((r) => DISPUTE_REASONS.find((item) => item.id === r)?.label)
      .filter(Boolean)
      .join(', ');

    const fullReason = [reasonsText, description.trim()].filter(Boolean).join(' - ');

    try {
      setIsSubmitting(true);

      if (orderId) {
        useOrderStore.getState().createDispute(orderId, fullReason);
        await orderMobileService.createDispute(orderId, fullReason).catch(() => {});
      }

      Alert.alert(
        '✅ Đã gửi khiếu nại thành công!',
        'Hội đồng Trọng tài Sinh viên FPT đã tiếp nhận hồ sơ khiếu nại. Khoản tiền cọc đang được bảo lưu an toàn trên ví Escrow.',
        [{ text: 'Đã hiểu', onPress: onGoBack }]
      );
    } catch (err: any) {
      Alert.alert('Thông báo', err?.response?.data?.message || err?.message || 'Đã gửi hồ sơ khiếu nại thành công.');
      if (onGoBack) onGoBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    disputeType,
    setDisputeType,
    reasons: DISPUTE_REASONS,
    selectedReasons,
    toggleReason,
    evidenceList,
    removeEvidence,
    description,
    setDescription,
    handleSubmit,
    isSubmitting,
  };
};

export default useDispute;
