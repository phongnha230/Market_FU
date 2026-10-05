import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KycType } from '../../../stores/kycStore';

interface KycFooterActionsProps {
  isPending: boolean;
  isSubmitting: boolean;
  activeTab: KycType;
  onSubmit: () => void;
}

export const KycFooterActions: React.FC<KycFooterActionsProps> = ({
  isPending,
  isSubmitting,
  activeTab,
  onSubmit,
}) => {
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
              {activeTab === 'SELLER' ? 'Gửi Hồ Sơ Mở Bán' : 'Gửi Hồ Sơ Xác Thực Sinh Viên'}
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
});
