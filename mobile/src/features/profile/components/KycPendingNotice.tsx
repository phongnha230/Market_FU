import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const KycPendingNotice: React.FC = () => {
  return (
    <View style={styles.pendingNotice}>
      <Ionicons name="time" size={20} color="#D97706" />
      <View style={styles.contentCol}>
        <Text style={styles.pendingNoticeTitle}>Hồ sơ đang chờ Admin xét duyệt</Text>
        <Text style={styles.pendingNoticeSub}>
          Bạn có thể bấm "⚡ Thử nghiệm duyệt nhanh (Demo)" ở dưới để mở khóa vai trò ngay lập tức.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pendingNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  contentCol: {
    flex: 1,
    marginLeft: 10,
  },
  pendingNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B45309',
  },
  pendingNoticeSub: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 16,
  },
});
