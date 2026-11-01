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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import orderMobileService from '../../../services/orderMobileService';
import {
  BUYER_CANCEL_REASONS,
  SELLER_CANCEL_REASONS,
} from '../constants/cancelReasons.constants';

interface OrderCancelModalProps {
  visible: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  productTitle?: string;
  coinsUsed?: number;
  totalAmount?: number;
  isSellerViewer?: boolean;
  onSuccess: (reason: string) => void;
}

export const OrderCancelModal: React.FC<OrderCancelModalProps> = ({
  visible,
  onClose,
  orderId,
  orderCode,
  productTitle,
  coinsUsed = 0,
  totalAmount = 0,
  isSellerViewer = false,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reasonsList = isSellerViewer ? SELLER_CANCEL_REASONS : BUYER_CANCEL_REASONS;
  const isCustom = selectedReason.includes('Lý do khác');

  const handleCancelSubmit = async () => {
    if (!selectedReason) {
      setErrorMsg('Vui lòng chọn một lý do hủy đơn hàng.');
      return;
    }

    if (isCustom && customReason.trim().length < 6) {
      setErrorMsg('Vui lòng nhập lý do cụ thể (tối thiểu 6 ký tự).');
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
      await orderMobileService.cancelOrder(orderId, finalReason);
      onSuccess(finalReason);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể hủy đơn lúc này. Vui lòng thử lại.';
      setErrorMsg(msg);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <View style={styles.warningCircle}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>{isSellerViewer ? 'Từ Chối Đơn Hàng' : 'Hủy Đơn Hàng An Toàn'}</Text>
                  <Text style={styles.headerSubtitle}>
                    {orderCode ? `#${orderCode}` : `Đơn #${orderId}`}
                    {isSellerViewer ? ' • Người bán hủy' : ' • Người mua hủy'}
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
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollBody}
            >
            {/* Policy Refund Summary Banner */}
            <View style={styles.policyCard}>
              <View style={styles.policyHeader}>
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text style={styles.policyHeading}>Chính sách hoàn tiền cọc Escrow:</Text>
              </View>
              <Text style={styles.policyText}>
                {isSellerViewer
                  ? `• Nếu Người mua đã thanh toán cọc Escrow (${totalAmount.toLocaleString('vi-VN')} đ), hệ thống sẽ tự động hoàn lại 100% về ví cho Người mua ngay lập tức.`
                  : `• Số tiền ký quỹ ${totalAmount.toLocaleString('vi-VN')} đ (nếu có) sẽ được hoàn trả tự động 100% về ví của bạn.`}
              </Text>
              {coinsUsed > 0 && (
                <Text style={styles.policyText}>
                  • Hoàn trả ngay <Text style={{ fontWeight: '800', color: '#EA580C' }}>+{coinsUsed} FPT Xu</Text> đã dùng cho đơn hàng này vào tài khoản của bạn.
                </Text>
              )}
              {productTitle && (
                <Text style={styles.policySub}>
                  Sản phẩm: <Text style={{ fontStyle: 'italic' }}>{productTitle}</Text>
                </Text>
              )}
            </View>

            {/* Error banner if any */}
            {errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Reason Selection */}
            <Text style={styles.sectionLabel}>CHỌN LÝ DO HỦY ĐƠN:</Text>
            <View style={styles.reasonsList}>
              {reasonsList.map((reason) => {
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

            {/* Custom reason input if needed */}
            {isCustom && (
              <View style={styles.customInputWrap}>
                <Text style={styles.inputLabel}>Nhập lý do cụ thể (tối thiểu 6 ký tự):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ví dụ: Hai bên không hẹn được lịch gặp tại Safe-Point Alpha..."
                  placeholderTextColor="#94A3B8"
                  value={customReason}
                  onChangeText={(text) => {
                    setCustomReason(text);
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
                style={[styles.confirmCancelBtn, submitting && { opacity: 0.6 }]}
                activeOpacity={0.85}
                onPress={handleCancelSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmCancelBtnText}>{isSellerViewer ? 'Xác Nhận Từ Chối & Hoàn Tiền' : 'Xác Nhận Hủy Đơn'}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keepOrderBtn}
                activeOpacity={0.8}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={styles.keepOrderBtnText}>Giữ Lại Đơn Hàng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
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
  warningCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
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
  policyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 14,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  policyHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  policyText: {
    fontSize: 11.5,
    color: '#15803D',
    lineHeight: 17,
  },
  policySub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 4,
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
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
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
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  reasonText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 17,
  },
  reasonTextActive: {
    color: '#991B1B',
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
  confirmCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    height: 48,
    borderRadius: 14,
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
  },
  confirmCancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  keepOrderBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  keepOrderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
