import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCategory, PostCondition } from '../types/post-item.types';

interface AiPhotoAutoFillBannerProps {
  hasImages: boolean;
  onAutoFill: (data: {
    title: string;
    category: PostCategory;
    condition: PostCondition;
    price: string;
    description: string;
    tags: string[];
  }) => void;
}

const AI_PRESETS = [
  {
    title: 'Giáo trình Cấu trúc Dữ liệu & Giải thuật CSD201 (Kèm Note Lab)',
    category: 'books' as PostCategory,
    condition: 'good' as PostCondition,
    price: '95.000',
    description: 'Sách in màu chuẩn FPT Edu, không rách gáy, có highlight các câu hỏi thường gặp thi PE/FE. Tặng kèm source code 5 bài lab qua Google Drive.',
    tags: ['#csd201', '#giao_trinh', '#pe_fe'],
  },
  {
    title: 'Võ phục Vovinam FPT University size L (Kèm đai xanh)',
    category: 'vovinam' as PostCategory,
    condition: 'like_new' as PostCondition,
    price: '140.000',
    description: 'Áo võ mua kỳ trước mới mặc 3 buổi thi qua môn. Vải dày dặn, logo FPT thêu sắc nét, giặt sạch thơm tho. Nhận hàng tại KTX Dom A.',
    tags: ['#vovinam', '#vo_phuc', '#the_chat'],
  },
  {
    title: 'Bàn phím cơ không dây Akko 3087 v2 Silent Switch cho SV CNTT',
    category: 'it' as PostCategory,
    condition: 'like_new' as PostCondition,
    price: '480.000',
    description: 'Phím gõ cực êm không gây ồn phòng KTX, switch bấm nảy, fullbox kèm dây type-C và keypuller. Phù hợp sinh viên code đêm.',
    tags: ['#akko', '#ban_phim_co', '#cntt'],
  },
];

export const AiPhotoAutoFillBanner: React.FC<AiPhotoAutoFillBannerProps> = ({
  hasImages,
  onAutoFill,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const presetIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [filledSuccess, setFilledSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleScanAndFill = () => {
    setIsScanning(true);
    setFilledSuccess(false);

    // Simulate AI scanning image delay
    timerRef.current = setTimeout(() => {
      const nextIndex = (presetIndexRef.current + 1) % AI_PRESETS.length;
      presetIndexRef.current = nextIndex;
      const chosen = AI_PRESETS[nextIndex];

      onAutoFill(chosen);
      setIsScanning(false);
      setFilledSuccess(true);

      Alert.alert(
        '✨ AI Campus Vision đã nhận diện xong!',
        `Nhận diện: "${chosen.title}"\n• Danh mục: Tự động phân loại\n• Giá gợi ý: ${chosen.price}đ (so sánh 5Campus)\n• Tình trạng: Đã chọn\n\nBạn có thể chỉnh sửa lại theo ý muốn trước khi đăng!`
      );
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerCard}>
        <View style={styles.topRow}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#EA580C" />
            <Text style={styles.aiBadgeText}>AI Campus Vision</Text>
          </View>
          {filledSuccess && (
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#059669" />
              <Text style={styles.successBadgeText}>Đã tự điền 5 mục</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>Tự động nhận diện & điền thông tin từ ảnh</Text>
        <Text style={styles.desc}>
          AI quét bìa sách, nhãn mác máy tính, võ phục... để tự điền tên, danh mục, giá gợi ý và mô tả chuẩn SV FPT.
        </Text>

        <TouchableOpacity
          style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
          activeOpacity={0.85}
          disabled={isScanning}
          onPress={handleScanAndFill}
        >
          {isScanning ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.scanBtnText}>AI đang phân tích ảnh sản phẩm...</Text>
            </View>
          ) : (
            <View style={styles.btnContentRow}>
              <Ionicons name="scan-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.scanBtnText}>
                {filledSuccess ? 'Quét lại gợi ý khác bằng AI' : '🤖 AI Quét ảnh & Tự động điền'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  bannerCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    boxShadow: '0 3px 6px rgba(234, 88, 12, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  successBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9A3412',
    marginTop: 2,
  },
  desc: {
    fontSize: 11.5,
    color: '#C2410C',
    marginTop: 3,
    lineHeight: 16,
  },
  scanBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  scanBtnDisabled: {
    backgroundColor: '#FB923C',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});

export default AiPhotoAutoFillBanner;
