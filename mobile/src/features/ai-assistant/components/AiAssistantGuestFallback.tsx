import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AiAssistantGuestFallbackProps {
  insetsTop: number;
  onLogin: () => void;
  onBack: () => void;
}

export const AiAssistantGuestFallback: React.FC<AiAssistantGuestFallbackProps> = ({
  insetsTop,
  onLogin,
  onBack,
}) => {
  return (
    <View style={[styles.fallbackCenter, { paddingTop: Math.max(insetsTop, 20) }]}>
      <View style={styles.fallbackCard}>
        <View style={styles.fallbackIconCircle}>
          <Ionicons name="sparkles" size={40} color="#EA580C" />
        </View>
        <Text style={styles.fallbackTitle}>Trợ lý AI FPT 5Campus</Text>
        <Text style={styles.fallbackSubtitle}>
          Bạn đang ở chế độ xem hàng (Khách). Vui lòng đăng nhập tài khoản Sinh viên FPT để trò chuyện với Trợ lý AI, định giá sản phẩm và tìm bạn cùng KTX.
        </Text>
        <TouchableOpacity
          style={styles.fallbackBtn}
          onPress={onLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.fallbackBtnText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fallbackBackBtn} onPress={onBack}>
          <Text style={styles.fallbackBackText}>Quay lại trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8FAFC',
  },
  fallbackCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fallbackIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallbackSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  fallbackBtn: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  fallbackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fallbackBackBtn: {
    paddingVertical: 8,
  },
  fallbackBackText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
