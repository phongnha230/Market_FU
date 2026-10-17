import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import reportMobileService from '../../../services/reportMobileService';
import { WITHDRAW_DISPUTE_REASONS } from '../constants/cancelReasons.constants';

interface WithdrawDisputeModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  disputeId?: string;
  onSuccess: () => void;
}

export const WithdrawDisputeModal: React.FC<WithdrawDisputeModalProps> = ({
  visible,
  onClose,
  orderId,
  orderCode,
  disputeId,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isCustom = selectedReason.includes('Lý do khác');

  const handleWithdraw = async () => {
    if (!selectedReason) {
      setErrorMsg('Vui lòng chọn một lý do rút đơn khiếu nại.');
      return;
    }

    if (isCustom && customReason.trim().length < 5) {
      setErrorMsg('Vui lòng nhập lý do cụ thể (tối thiểu 5 ký tự).');
      return;
    }

    const finalReason = isCustom
      ? customReason.trim()
      : customReason.trim()
      ? `${selectedReason}: ${customReason.trim()}`
      : selectedReason;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // Gọi API rút khiếu nại (bằng disputeId hoặc fallback orderId)
      const targetId = disputeId || orderId;
      await reportMobileService.cancelDispute(targetId, finalReason);

      Alert.alert(
        '🎉 Đã rút khiếu nại thành công',
        'Khiếu nại tranh chấp đã được đóng lại. Tiền ký quỹ Escrow tiếp tục được bảo hộ an toàn để bạn và người bán hoàn tất giao dịch.'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể rút đơn khiếu nại lúc này. Vui lòng thử lại sau.';
      setErrorMsg(msg);
      Alert.alert('Rút khiếu nại thất bại', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconCircle}>
                <Ionicons name="refresh-circle" size={22} color="#059669" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Rút Đơn Khiếu Nại</Text>
                <Text style={styles.headerSubtitle}>
                  {orderCode ? `Đơn #${orderCode}` : `Mã đơn #${orderId}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Notice */}
            <View style={styles.noticeCard}>
              <Ionicons name="information-circle" size={17} color="#0284C7" />
              <Text style={styles.noticeText}>
                Khi rút đơn khiếu nại, trạng thái tranh chấp sẽ được hủy bỏ. Khoản tiền cọc Escrow sẽ tiếp tục được giữ an toàn để bạn kiểm tra hàng và xác nhận giải ngân cho người bán.
              </Text>
            </View>

            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={15} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>CHỌN LÝ DO RÚT KHIẾU NẠI:</Text>
            <View style={styles.reasonsList}>
              {WITHDRAW_DISPUTE_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                    onPress={() => {
                      setSelectedReason(reason);
                      setErrorMsg(null);
                    }}
                    activeOpacity={0.75}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isCustom && (
              <View style={styles.customInputWrap}>
                <Text style={styles.inputLabel}>Ghi chú thêm cho BQT:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập lý do cụ thể..."
                  placeholderTextColor="#94A3B8"
                  value={customReason}
                  onChangeText={(t) => {
                    setCustomReason(t);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, submitting && { opacity: 0.6 }]}
                activeOpacity={0.88}
                onPress={handleWithdraw}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmBtnText}>Xác Nhận Rút Đơn</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.8}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Giữ Khiếu Nại</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  reasonsList: {
    gap: 8,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  reasonRowSelected: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: '#059669',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  reasonText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 17,
  },
  reasonTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  customInputWrap: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actionButtons: {
    marginTop: 18,
    gap: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 48,
    borderRadius: 14,
    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
