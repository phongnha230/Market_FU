import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InterCampusNoticeCardProps {
  toSafePoint: string;
  isSeller?: boolean;
}

export const InterCampusNoticeCard: React.FC<InterCampusNoticeCardProps> = ({ toSafePoint, isSeller = false }) => {
  if (isSeller) {
    return (
      <View style={[styles.stationNoticeCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
        <View style={styles.noticeHeader}>
          <Ionicons name="shield-checkmark" size={18} color="#2563EB" />
          <Text style={[styles.noticeTitle, { color: '#1E40AF' }]}>Quy Chuẩn Đóng Gói & Bàn Giao</Text>
        </View>
        <Text style={[styles.noticeBody, { color: '#1E3A8A' }]}>
          Người bán vui lòng quay video quá trình kiểm tra ngoại quan, đóng gói chống sốc và dán tem niêm phong seal trước khi bàn giao cho bưu tá GHN hoặc xe buýt FPT Bus. Đây là bằng chứng bảo vệ quyền lợi Người Bán 100% khi có đối soát khiếu nại.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stationNoticeCard}>
      <View style={styles.noticeHeader}>
        <Ionicons name="videocam" size={18} color="#059669" />
        <Text style={styles.noticeTitle}>Bàn giao có Camera An Ninh 24/7</Text>
      </View>
      <Text style={styles.noticeBody}>
        Khi xe buýt cập bến, bạn hãy đến <Text style={styles.noticeBold}>{toSafePoint}</Text> để lấy hàng. Quét mã QR mở hòm và kiểm tra ngoại quan trước camera giám sát. Nếu có vết nứt vỡ do vận chuyển, hãy chọn &quot;Khiếu nại ngay&quot; để được hoàn tiền 100%!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stationNoticeCard: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#065F46',
  },
  noticeBody: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  noticeBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
});
