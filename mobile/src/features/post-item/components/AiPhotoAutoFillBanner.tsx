import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCategory, PostCondition } from '../types/post-item.types';
import aiMobileService from '../../../services/aiMobileService';

interface AiPhotoAutoFillBannerProps {
  hasImages: boolean;
  imageUri?: string;
  onAutoFill: (data: {
    title: string;
    category: PostCategory;
    condition: PostCondition;
    price: string;
    description: string;
    tags?: string[];
  }) => void;
}

export const AiPhotoAutoFillBanner: React.FC<AiPhotoAutoFillBannerProps> = ({
  hasImages,
  imageUri,
  onAutoFill,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [filledSuccess, setFilledSuccess] = useState(false);

  const handleScanAndFill = async () => {
    if (!hasImages || !imageUri) {
      Alert.alert(
        'Chưa có ảnh sản phẩm',
        'Vui lòng chụp hoặc chọn ít nhất 1 ảnh sản phẩm phía trên trước khi để AI quét nhận diện.'
      );
      return;
    }

    setIsScanning(true);
    setFilledSuccess(false);

    try {
      const result = await aiMobileService.scanProductImage(imageUri);

      // Map category
      let category: PostCategory = 'dorm';
      const catUpper = (result.category || '').toUpperCase();
      if (catUpper.includes('BOOK')) category = 'books';
      else if (catUpper.includes('ELECTRONIC') || catUpper.includes('IT') || catUpper.includes('LAPTOP')) category = 'electronics';
      else if (catUpper.includes('VOVINAM') || catUpper.includes('CLOTH') || catUpper.includes('FASHION')) category = 'fashion';
      else if (catUpper.includes('GAME') || catUpper.includes('HOBBY')) category = 'hobbies';
      else if (catUpper.includes('SERVICE')) category = 'services';
      else category = 'dorm';

      // Map condition
      let condition: PostCondition = 'good';
      const condUpper = (result.condition || '').toUpperCase();
      if (condUpper.includes('100') || condUpper.includes('SEAL')) condition = 'seal';
      else if (condUpper.includes('99') || condUpper.includes('LIKE')) condition = 'likenew';
      else if (condUpper.includes('CŨ') || condUpper.includes('USED') || condUpper.includes('FAIR')) condition = 'used';
      else condition = 'good';

      const rawPrice = result.estimatedPrice || (result as any).suggestedPrice || 100000;
      const priceStr = String(rawPrice);

      const title = result.title || 'Món đồ sinh viên FPT';
      const description = result.description || 'Đồ sinh viên FPT còn sử dụng tốt.';

      onAutoFill({
        title,
        category,
        condition,
        price: priceStr,
        description,
        tags: [`#${category}`, '#fpt_marketplace'],
      });

      setIsScanning(false);
      setFilledSuccess(true);

      Alert.alert(
        '✨ AI Campus Vision đã nhận diện xong!',
        `Nhận diện: "${title}"\n• Danh mục: ${category.toUpperCase()}\n• Giá gợi ý: ${Number(priceStr).toLocaleString('vi-VN')} đ\n• Tình trạng: ${condition === 'seal' ? 'Mới 100%' : condition === 'likenew' ? 'Mới 99%' : condition === 'good' ? 'Dùng rất tốt' : 'Pass thanh lý'}\n\nBạn có thể chỉnh sửa lại theo ý muốn trước khi đăng!`
      );
    } catch (err: any) {
      setIsScanning(false);
      Alert.alert('Lỗi nhận diện AI', err?.message || 'Không thể quét ảnh bằng AI, vui lòng tự điền thông tin.');
    }
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
