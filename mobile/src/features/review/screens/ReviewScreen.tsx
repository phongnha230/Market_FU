import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useOrderStore } from '../../../stores/orderStore';
import { useUserStore } from '../../../stores/userStore';
import { useWalletStore } from '../../../stores/walletStore';
import { reviewMobileService } from '../../../services/reviewMobileService';
import { resolveProductImage } from '../../../lib/imageResolver';

interface ReviewMedia {
  id: string;
  uri: string;
  isVideo?: boolean;
  duration?: string;
}

export const ReviewScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { user } = useUserStore();
  const orderId = route.params?.orderId || '';
  const productTitle = route.params?.productTitle || 'Bàn phím cơ Gaming LED RGB';
  const sellerName = route.params?.sellerName || 'Nhã Trần CT';
  const sellerCampus = route.params?.sellerCampus || 'Cần Thơ';
  const productImage =
    route.params?.productImage ||
    require('../../../../assets/products/keyboard-akko.jpg');

  const isEditing = !!route.params?.isEditing;
  const initialData = route.params?.initialReviewData;

  const [rating, setRating] = useState<number>(initialData?.rating ?? 5);
  const [comment, setComment] = useState(initialData?.comment ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags ?? ['Đúng mô tả', 'Thân thiện']
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(initialData?.isAnonymous ?? true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Danh sách hình ảnh / video bóc hộp được chọn từ thiết bị
  const [mediaList, setMediaList] = useState<ReviewMedia[]>(() => {
    const list: ReviewMedia[] = [];
    if (initialData?.images && Array.isArray(initialData.images)) {
      initialData.images.forEach((img: string, i: number) => {
        list.push({ id: `init-img-${i}`, uri: img, isVideo: false });
      });
    }
    if (initialData?.proofVideoUrl) {
      list.push({ id: `init-vid`, uri: initialData.proofVideoUrl, isVideo: true, duration: 'Video' });
    }
    return list;
  });

  const buyerStudentId =
    user?.studentId ||
    user?.email?.match(/([a-zA-Z]{2}\d{6})/i)?.[1]?.toUpperCase() ||
    (user?.email ? user.email.split('@')[0].toUpperCase() : '') ||
    (user?.id ? `SV${user.id.slice(0, 6).toUpperCase()}` : 'SV_FPT');
  const anonymousBuyerCode =
    buyerStudentId.length > 4
      ? `${buyerStudentId.slice(0, 4)}**** (${user?.campus || 'HL'})`
      : `${buyerStudentId}**** (${user?.campus || 'HL'})`;

  const hasVideo = mediaList.some((m) => m.isVideo);
  const bonusCoins = hasVideo ? 200 : 100;

  const ratingLabels: { [key: number]: string } = {
    1: 'Rất tệ 😡',
    2: 'Chưa hài lòng 🙁',
    3: 'Bình thường 😐',
    4: 'Hài lòng 🙂',
    5: 'Rất hài lòng & Uy tín ⭐',
  };

  const quickTags = ['Đúng mô tả', 'Đúng hẹn', 'Thân thiện', 'Hàng nguyên tem'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePickMedia = useCallback(async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Quyền truy cập',
          'Vui lòng cấp quyền thư viện để chọn ảnh/video thực tế.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: ReviewMedia[] = result.assets.map((asset, index) => {
          const isVid = asset.type === 'video';
          return {
            id: `media-${Date.now()}-${index}`,
            uri: asset.uri,
            isVideo: isVid,
            duration:
              isVid && asset.duration ? `${Math.round(asset.duration / 1000)}s` : undefined,
          };
        });

        setMediaList((prev) => [...prev, ...newItems]);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể mở thư viện lúc này.');
    }
  }, []);

  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      if (!orderId) {
        Alert.alert('Thiếu đơn hàng', 'Không tìm thấy đơn hàng cần đánh giá. Hãy mở màn hình này từ chi tiết đơn hàng.');
        return;
      }

      // Upload media files lên server để có public URL dùng được cho cả Người Bán & Người Mua
      const cleanImages: string[] = [];
      for (const m of mediaList.filter((x) => !x.isVideo)) {
        if (m.uri.startsWith('http://') || m.uri.startsWith('https://') || m.uri.startsWith('data:')) {
          cleanImages.push(m.uri);
        } else {
          const uploadedUrl = await reviewMobileService.uploadMedia(m.uri, false);
          cleanImages.push(uploadedUrl || m.uri);
        }
      }

      let videoUri: string | undefined = undefined;
      const rawVideo = mediaList.find((m) => m.isVideo)?.uri;
      if (rawVideo) {
        if (rawVideo.startsWith('http://') || rawVideo.startsWith('https://')) {
          videoUri = rawVideo;
        } else {
          const uploadedVideoUrl = await reviewMobileService.uploadMedia(rawVideo, true);
          videoUri = uploadedVideoUrl || rawVideo;
        }
      }

      if (isEditing) {
        await reviewMobileService.updateReview({
          orderId,
          rating,
          comment: comment ? `${comment} [${selectedTags.join(', ')}]` : undefined,
          images: cleanImages,
          proofVideoUrl: videoUri,
        });

        useOrderStore.getState().updateOrderReview(orderId, {
          rating,
          comment,
          tags: selectedTags,
          images: cleanImages,
          proofVideoUrl: videoUri,
          isAnonymous,
          bonusCoins,
        });

        Alert.alert('✅ Thành công', 'Đánh giá của bạn đã được cập nhật thành công!', [
          {
            text: 'Đóng',
            onPress: () => navigation.goBack(),
          },
        ]);
        return;
      }

      const reviewPayload = {
        rating,
        comment,
        tags: selectedTags,
        images: cleanImages,
        proofVideoUrl: videoUri,
        isAnonymous,
        reviewedAt: 'Vừa xong',
        isPublic: true,
        canEdit: true,
        bonusCoins,
      };

      await reviewMobileService.createReview({
        orderId,
        rating,
        comment: comment ? `${comment} [${selectedTags.join(', ')}]` : undefined,
        images: cleanImages,
        proofVideoUrl: videoUri,
      });

      useOrderStore.getState().markOrderReviewed(orderId, reviewPayload);
      useWalletStore.getState().addCoins(bonusCoins);

      Alert.alert(
        '🎉 Đánh giá thành công!',
        `Đánh giá của bạn đã được công khai trên hồ sơ Người Bán và cộng +${bonusCoins} FPT Xu vào ví của bạn.${bonusCoins === 200 ? ' (Thưởng video test đồ)' : ''}`,
        [
          {
            text: 'Đóng',
            onPress: () => navigation.navigate('OrderList'),
          },
        ]
      );
    } catch (error: unknown) {
      console.error('Failed to submit review:', error);
      Alert.alert('Không thể gửi đánh giá', 'Đánh giá chưa được lưu. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Chỉnh sửa đánh giá' : 'Đánh giá đơn hàng'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Compact Product & Rating Card */}
        <View style={styles.combinedCard}>
          <View style={styles.productMiniRow}>
            <Image
              source={resolveProductImage(productImage)}
              style={styles.productThumb}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {productTitle}
              </Text>
              <Text style={styles.sellerSubText}>
                Người bán: <Text style={styles.boldText}>{sellerName}</Text> ({sellerCampus})
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Star Rating */}
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
                  size={36}
                  color={star <= rating ? '#F59E0B' : '#E2E8F0'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabelText}>{ratingLabels[rating]}</Text>
        </View>

        {/* Quick Tag Chips */}
        <View style={styles.tagsRow}>
          {quickTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, isSelected && styles.activeTagChip]}
                activeOpacity={0.7}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, isSelected && styles.activeTagText]}>
                  {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comment Box */}
        <View style={styles.commentCard}>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Chia sẻ trải nghiệm sản phẩm, đóng gói, bàn giao..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />

          {/* Media Attachments inline */}
          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={styles.addMediaBtn}
              onPress={handlePickMedia}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={20} color="#EA580C" />
              <Text style={styles.addMediaBtnText}>Ảnh / Video</Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroll}>
              {mediaList.map((item) => (
                <View key={item.id} style={styles.mediaThumbBox}>
                  <Image source={{ uri: item.uri }} style={styles.mediaThumb} contentFit="cover" />
                  {item.isVideo && (
                    <View style={styles.videoBadge}>
                      <Ionicons name="play" size={8} color="#FFFFFF" />
                      <Text style={styles.videoText}>{item.duration || 'Video'}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveMedia(item.id)}
                  >
                    <Ionicons name="close" size={10} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Reward Hint */}
        <View style={styles.rewardHintRow}>
          <Ionicons name="gift-outline" size={14} color="#D97706" />
          <Text style={styles.rewardHintText}>
            Thưởng: <Text style={styles.boldText}>+{bonusCoins} Xu</Text> ({hasVideo ? 'Đã có video bóc hộp' : 'Tải video unbox nhận +200 Xu'})
          </Text>
        </View>

        {/* Compact Anonymous Checkbox */}
        <TouchableOpacity
          style={styles.anonymousRow}
          activeOpacity={0.7}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <Ionicons
            name={isAnonymous ? 'checkbox' : 'square-outline'}
            size={19}
            color={isAnonymous ? '#EA580C' : '#94A3B8'}
          />
          <Text style={styles.anonymousLabel}>
            Đánh giá ẩn danh{' '}
            <Text style={styles.anonymousSubLabel}>
              ({isAnonymous ? anonymousBuyerCode : (user?.name || 'Tên của bạn')})
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          activeOpacity={0.88}
          onPress={handleSubmitReview}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting
              ? 'Đang lưu...'
              : isEditing
              ? 'Cập nhật đánh giá'
              : 'Hoàn tất đánh giá'}
          </Text>
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
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 30 },
  combinedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  productMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  productThumb: { width: 44, height: 44, borderRadius: 8, marginRight: 10, backgroundColor: '#F1F5F9' },
  productInfo: { flex: 1 },
  productTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  sellerSubText: { fontSize: 11, color: '#64748B', marginTop: 2 },
  boldText: { fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', width: '100%', marginVertical: 12 },
  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 2 },
  ratingLabelText: { fontSize: 13, fontWeight: '700', color: '#EA580C', marginTop: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tagChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeTagChip: { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' },
  tagText: { fontSize: 11.5, color: '#64748B', fontWeight: '600' },
  activeTagText: { color: '#EA580C', fontWeight: '700' },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentInput: {
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  addMediaBtnText: { fontSize: 11, fontWeight: '700', color: '#EA580C' },
  mediaScroll: { flexDirection: 'row', gap: 6 },
  mediaThumbBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumb: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  videoText: { color: '#FFFFFF', fontSize: 7, fontWeight: '700' },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  rewardHintText: { fontSize: 11, color: '#B45309' },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  anonymousLabel: { fontSize: 12.5, fontWeight: '600', color: '#334155' },
  anonymousSubLabel: { fontSize: 11.5, color: '#94A3B8', fontWeight: '400' },
  submitBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default ReviewScreen;
