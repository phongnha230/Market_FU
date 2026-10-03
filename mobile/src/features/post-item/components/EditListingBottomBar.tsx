import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingBottomBarProps {
  paddingBottom: number;
  onCancel: () => void;
  onSave: () => void;
}

export const EditListingBottomBar: React.FC<EditListingBottomBarProps> = ({
  paddingBottom,
  onCancel,
  onSave,
}) => {
  return (
    <View style={[styles.bottomBar, { paddingBottom }]}>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelBtnText}>Hủy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={onSave}
        activeOpacity={0.85}
      >
        <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.saveBtnText}>Lưu Thay Đổi</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
