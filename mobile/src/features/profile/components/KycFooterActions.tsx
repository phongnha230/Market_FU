import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KycType } from '../../../stores/kycStore';

interface KycFooterActionsProps {
  isPending: boolean;
  isSubmitting: boolean;
  activeTab: KycType;
  onSubmit: () => void;
  isStudentVerified?: boolean;
  isSellerApproved?: boolean;
  isEditingSeller?: boolean;
  onToggleEditSeller?: () => void;
  onCancelEditSeller?: () => void;
}

export const KycFooterActions: React.FC<KycFooterActionsProps> = ({
  isPending,
  isSubmitting,
  activeTab,
  onSubmit,
  isStudentVerified,
  isSellerApproved,
  isEditingSeller,
  onToggleEditSeller,
  onCancelEditSeller,
}) => {
  // Nếu đã xác thực sinh viên chính quy và đang ở tab Sinh viên -> không hiển thị nút nộp lại
  if (activeTab === 'STUDENT' && isStudentVerified) {
    return null;
  }

  // Nếu người bán đã được duyệt và đang ở chế độ xem
  if (activeTab === 'SELLER' && isSellerApproved && !isEditingSeller) {
    return (
      <View style={styles.sheetFooter}>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: '#059669' }]}
          onPress={onToggleEditSeller}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.submitBtnText}>Cập nhật tài khoản thanh toán</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Nếu người bán đang chỉnh sửa tài khoản thanh toán
  if (activeTab === 'SELLER' && isSellerApproved && isEditingSeller) {
    return (
      <View style={styles.sheetFooter}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={onSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Lưu thay đổi tài khoản nhận tiền</Text>
            </>
          )}
        </TouchableOpacity>
        {onCancelEditSeller && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancelEditSeller}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.sheetFooter}>
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={onSubmit}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-done" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>
              {activeTab === 'SELLER'
                ? (isSellerApproved ? 'Lưu thay đổi tài khoản nhận tiền' : 'Gửi Hồ Sơ Mở Bán')
                : 'Gửi Hồ Sơ Xác Thực Sinh Viên'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    boxShadow: '0 3px 5px rgba(234, 88, 12, 0.2)',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
