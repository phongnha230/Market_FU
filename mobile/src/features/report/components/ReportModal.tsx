import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  PRODUCT_REPORT_REASONS,
  USER_REPORT_REASONS,
} from '../constants/reportReasons.constants';
import { ReportReasonSelector } from './ReportReasonSelector';
import { useReportModal } from '../hooks/useReportModal';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'PRODUCT' | 'USER';
  targetId: string;
  targetTitle?: string;
  onViewMyReports?: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onViewMyReports,
}) => {
  const reasons = targetType === 'PRODUCT' ? PRODUCT_REPORT_REASONS : USER_REPORT_REASONS;
  const {
    selectedReasonId,
    setSelectedReasonId,
    details,
    setDetails,
    isSubmitting,
    handleSubmit,
  } = useReportModal({
    targetType,
    targetId,
    onClose,
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.warningIconBadge}>
                <Ionicons name="flag" size={16} color="#DC2626" />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {targetType === 'PRODUCT' ? 'Báo cáo Tin Đăng' : 'Tố cáo Người Dùng'}
                </Text>
                {targetTitle ? (
                  <Text style={styles.headerSub} numberOfLines={1}>
                    {targetTitle}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Reason selector */}
            <ReportReasonSelector
              reasons={reasons}
              selectedReasonId={selectedReasonId}
              onSelectReason={setSelectedReasonId}
            />

            {/* Details */}
            <Text style={styles.inputLabel}>Mô tả chi tiết bằng chứng (tùy chọn)</Text>
            <TextInput
              style={styles.textArea}
              value={details}
              onChangeText={setDetails}
              placeholder="VD: Người bán đòi chuyển cọc trước 200k qua số tài khoản lạ..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={isSubmitting}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Gửi Báo Cáo</Text>
              )}
            </TouchableOpacity>

            {onViewMyReports && (
              <TouchableOpacity
                style={styles.viewHistoryBtn}
                onPress={() => {
                  onClose();
                  onViewMyReports();
                }}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.viewHistoryText}>Xem lịch sử các đơn tố cáo của bạn</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  warningIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 16,
    maxHeight: 380,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 4,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 80,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  viewHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  viewHistoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});

export default ReportModal;
