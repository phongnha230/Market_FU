import { useState } from 'react';
import { Alert } from 'react-native';
import { DISPUTE_REASONS, EVIDENCE_ITEMS } from '../constants/dispute.constants';
import { DisputeType, EvidenceItem } from '../types/dispute.types';
import { useOrderStore } from '../../../stores/orderStore';

export const useDispute = (onGoBack?: () => void, orderId?: string) => {
  const [disputeType, setDisputeType] = useState<DisputeType>('refund_full');
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['wrong_item', 'wrong_spec']);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(EVIDENCE_ITEMS);
  const [description, setDescription] = useState(
    'Mình nhận tại Safe-Point Sảnh Alpha lúc 14:20 chiều nay. Khi mang về phòng KTX cắm thử thì nguồn chập chờn không lên...'
  );

  const toggleReason = (id: string) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const removeEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = () => {
    if (orderId) {
      useOrderStore.getState().createDispute(orderId, description);
    }
    Alert.alert(
      '✅ Đã gửi khiếu nại!',
      'Hội đồng Trọng tài Sinh viên FPT đã tiếp nhận hồ sơ. Tiền của bạn sẽ được giữ an toàn trên ví Escrow trong khi xử lý.',
      [{ text: 'Đã hiểu', onPress: onGoBack }]
    );
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
  };
};

export default useDispute;
