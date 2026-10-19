import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PostSubmitBarProps {
  onSubmit: () => void;
  campusName?: string;
  isSubmitting?: boolean;
}

export const PostSubmitBar: React.FC<PostSubmitBarProps> = ({
  onSubmit,
  campusName = 'Hòa Lạc',
  isSubmitting = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.pledgeRow}>
        <Ionicons name="shield-checkmark" size={13} color="#059669" style={{ marginRight: 4 }} />
        <Text style={styles.pledgeText}>
          Cam kết mô tả đúng thực tế đồ sinh viên tại {campusName}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        activeOpacity={0.88}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitText}>Đang gửi tin đăng...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Đăng bán ngay (Miễn phí 100%)</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  pledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pledgeText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#F27024',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F27024',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#F27024',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  submitBtnDisabled: {
    backgroundColor: '#FB923C',
    opacity: 0.8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default PostSubmitBar;
