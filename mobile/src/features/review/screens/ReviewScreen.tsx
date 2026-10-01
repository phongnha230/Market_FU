import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export const ReviewScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId || 'ORD-882194';
  const productTitle = route.params?.productTitle || 'Màn hình Dell 24" UltraSharp U2419H';
  const sellerName = route.params?.sellerName || 'Nguyễn Văn Nam';
  const productImage =
    route.params?.productImage || require('../../../../assets/products/monitor-dell-24.jpg');

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('Sản phẩm đúng như mô tả, người bán giao đúng giờ hẹn ở sảnh Alpha rất nhiệt tình!');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Đúng như mô tả',
    'Đúng giờ hẹn Safe-Point',
    'Người bán thân thiện',
  ]);

  const ratingLabels: { [key: number]: string } = {
    1: 'Rất tệ 😡',
    2: 'Không hài lòng 🙁',
    3: 'Bình thường 😐',
    4: 'Hài lòng 🙂',
    5: 'Tuyệt vời & Rất uy tín! ⭐',
  };

  const criteriaList = [
    'Đúng như mô tả',
    'Đúng giờ hẹn Safe-Point',
    'Người bán thân thiện',
    'Hàng nguyên tem/zin',
    'Giá tốt cho sinh viên',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = () => {
    Alert.alert(
      '🎉 Cảm ơn bạn đã đánh giá!',
      `Đánh giá ${rating} sao cho ${sellerName} đã được ghi nhận.\n\nBạn được cộng +20 Điểm Uy tín Campus và nhận 1 Voucher nước ép tại Căn tin KTX!`,
      [
        {
          text: 'Về trang đơn hàng',
          onPress: () => {
            navigation.navigate('OrderList');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Home' });
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá đơn hàng</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Product Summary */}
        <View style={styles.productCard}>
          <Image
            source={typeof productImage === 'string' ? { uri: productImage } : productImage}
            style={styles.productThumb}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {productTitle}
            </Text>
            <Text style={styles.sellerText}>Người bán: {sellerName}</Text>
            <Text style={styles.orderIdText}>Mã đơn: #{orderId}</Text>
          </View>
        </View>

        {/* Rating Stars */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingPrompt}>Bạn cảm thấy giao dịch này như thế nào?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPress={() => setRating(star)}
                style={styles.starBtn}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={34}
                  color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
        </View>

        {/* Criteria Tags */}
        <Text style={styles.sectionHeader}>TIÊU CHÍ NỔI BẬT</Text>
        <View style={styles.tagsContainer}>
          {criteriaList.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, isSelected && styles.activeTagChip]}
                activeOpacity={0.7}
                onPress={() => toggleTag(tag)}
              >
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                  size={15}
                  color={isSelected ? '#EA580C' : '#64748B'}
                />
                <Text style={[styles.tagChipText, isSelected && styles.activeTagChipText]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed Feedback Text */}
        <Text style={styles.sectionHeader}>NHẬN XÉT CỦA BẠN</Text>
        <View style={styles.commentBox}>
          <TextInput
            style={styles.textInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Chia sẻ thêm về trải nghiệm nhận hàng tại trạm Safe-point..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Upload Proof Photos */}
        <Text style={styles.sectionHeader}>HÌNH ẢNH THỰC TẾ ĐỒNG KIỂM</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={styles.addPhotoBtn}
            onPress={() => Alert.alert('Đính kèm ảnh', 'Tải ảnh chụp tại trạm Safe-Point')}
          >
            <Ionicons name="camera-outline" size={26} color="#EA580C" />
            <Text style={styles.addPhotoText}>Thêm ảnh</Text>
          </TouchableOpacity>

          <View style={styles.samplePhotoBox}>
            <Image
              source={typeof productImage === 'string' ? { uri: productImage } : productImage}
              style={styles.samplePhoto}
            />
            <View style={styles.photoVerifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.88}
          onPress={handleSubmitReview}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.submitBtnText}>Gửi đánh giá (+20 điểm Uy tín)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16.5, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productThumb: { width: 55, height: 55, borderRadius: 10, marginRight: 12 },
  productInfo: { flex: 1 },
  productTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  sellerText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  orderIdText: { fontSize: 10.5, color: '#94A3B8', marginTop: 1 },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingPrompt: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  starsRow: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  starBtn: { padding: 2 },
  ratingLabel: { fontSize: 14, fontWeight: '800', color: '#EA580C' },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  activeTagChip: { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' },
  tagChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  activeTagChipText: { color: '#EA580C', fontWeight: '700' },
  commentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textInput: { fontSize: 13, color: '#0F172A', minHeight: 80, textAlignVertical: 'top' },
  photoRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  addPhotoBtn: {
    width: 75,
    height: 75,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: { fontSize: 10, fontWeight: '700', color: '#EA580C', marginTop: 4 },
  samplePhotoBox: { position: 'relative', width: 75, height: 75, borderRadius: 12, overflow: 'hidden' },
  samplePhoto: { width: '100%', height: '100%' },
  photoVerifiedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 2,
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default ReviewScreen;
