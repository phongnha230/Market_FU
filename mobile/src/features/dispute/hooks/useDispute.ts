import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DISPUTE_REASONS } from '../constants/dispute.constants';
import { DisputeType, EvidenceItem } from '../types/dispute.types';
import { orderMobileService } from '../../../services/orderMobileService';
import { useOrderStore } from '../../../stores/orderStore';

export const useDispute = (
  onGoBack?: () => void,
  orderId?: string,
  productTitle?: string,
  sellerName?: string,
  isCod?: boolean
) => {
  const [disputeType, setDisputeType] = useState<DisputeType>('refund_full');
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['defect']);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [description, setDescription] = useState(
    `Thiết bị ${productTitle || 'sản phẩm'} nhận tại KTX khi kiểm tra thực tế phát sinh lỗi kỹ thuật, không hoạt động bình thường. ${
      isCod
        ? 'Kính mong Sàn giữ đối soát COD và hỗ trợ hoàn tiền về STK Ngân hàng / Ví của em.'
        : 'Kính mong Sàn tạm khóa Escrow và hỗ trợ hoàn tiền bảo hộ.'
    }`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleReason = (id: string) => {
    const next = selectedReasons.includes(id)
      ? selectedReasons.filter((r) => r !== id)
      : [...selectedReasons, id];

    setSelectedReasons(next);

    const primaryReason = next[0] || id;
    const refundText = isCod
      ? 'Kính mong Sàn giữ đối soát COD và hỗ trợ hoàn tiền về STK Ngân hàng / Ví của em.'
      : 'Kính mong Sàn tạm khóa Escrow và hỗ trợ hoàn tiền bảo hộ.';

    if (primaryReason === 'defect') {
      setDescription(`Món hàng ${productTitle || 'sản phẩm'} nhận từ bạn ${sellerName || 'người bán'} khi bóc hộp cắm test thực tế tại KTX thì không hoạt động bình thường, bị lỗi chức năng so với cam kết. ${refundText}`);
    } else if (primaryReason === 'wrong_item') {
      setDescription(`Sản phẩm ${productTitle || 'sản phẩm'} nhận được khác hoàn toàn với hình ảnh, model và tình trạng mô tả trong bài đăng của bạn ${sellerName || 'người bán'}. ${refundText}`);
    } else if (primaryReason === 'damaged') {
      setDescription(`Kiện hàng ${productTitle || 'sản phẩm'} bị va đập, nứt vỡ/trầy xước nặng trong khâu vận chuyển khi nhận tại sảnh KTX. ${refundText}`);
    } else if (primaryReason === 'missing') {
      setDescription(`Kiện hàng ${productTitle || 'sản phẩm'} bị thiếu các phụ kiện đi kèm/quà tặng theo thỏa thuận với người bán ${sellerName || 'người bán'}. ${refundText}`);
    } else if (primaryReason === 'fake') {
      setDescription(`Sau khi kiểm tra linh kiện và serial, em phát hiện món đồ không đúng chuẩn cam kết của bạn ${sellerName || 'người bán'}. ${refundText}`);
    }
  };

  const addEvidenceFromPicker = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tải bằng chứng.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: EvidenceItem[] = result.assets.map((asset, index) => {
          const isVideo = asset.type === 'video';
          return {
            id: `pick-${Date.now()}-${index}`,
            label: isVideo ? 'Video test' : `Ảnh ${index + 1}`,
            source: { uri: asset.uri },
            isVideo,
            duration: isVideo && asset.duration ? `${Math.round(asset.duration / 1000)}s` : undefined,
          };
        });
        setEvidenceList((prev) => [...prev, ...newItems]);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh lúc này.');
    }
  }, []);

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
        const videoEvidence = evidenceList.find((e) => e.isVideo)?.source?.uri;
        await orderMobileService.createDispute(orderId, fullReason, videoEvidence);
        useOrderStore.getState().createDispute(orderId, fullReason);
      }

      Alert.alert(
        '✅ Đã gửi khiếu nại thành công!',
        'Hội đồng Trọng tài Sinh viên FPT đã tiếp nhận hồ sơ khiếu nại. Khoản tiền cọc đang được bảo lưu an toàn trên ví Escrow.',
        [{ text: 'Đã hiểu', onPress: onGoBack }]
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi khiếu nại lúc này. Vui lòng thử lại sau.';
      Alert.alert('Gửi khiếu nại thất bại', errorMessage);
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
    addEvidenceFromPicker,
    removeEvidence,
    description,
    setDescription,
    handleSubmit,
    isSubmitting,
  };
};

export default useDispute;
