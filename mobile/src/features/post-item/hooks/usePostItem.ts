import { useState } from 'react';
import { Alert } from 'react-native';
import { PostCategory, PostCondition, PostImageItem } from '../types/post-item.types';
import { useProductStore } from '../../../stores/productStore';
import { useUserStore } from '../../../stores/userStore';
import { fromBackendCampus } from '../../../lib/backendMappers';

export const getCampusDefaultSafePoint = (campus: string): string => {
  const c = campus.trim().toUpperCase();
  if (c.includes('HỒ CHÍ MINH') || c === 'HCM' || c.includes('HỒ')) {
    return 'Trạm Safe-Point Sảnh Tòa Innovation (Bàn test đồ SV - Camera 24/7)';
  }
  if (c.includes('ĐÀ NẴNG') || c === 'DAD') {
    return 'Trạm Safe-Point Sảnh Tòa F (Bàn test đồ SV - Camera 24/7)';
  }
  if (c.includes('QUY NHƠN') || c === 'QN') {
    return 'Trạm Safe-Point Sảnh Trung tâm AI (Bàn test đồ SV - Camera 24/7)';
  }
  if (c.includes('CẦN THƠ') || c === 'CT') {
    return 'Trạm Safe-Point Sảnh Tòa Gamma (Bàn test đồ SV - Camera 24/7)';
  }
  return 'Trạm Sảnh Alpha (Bàn test đồ SV 04 - Có ổ cắm sạc & Camera 24/7)';
};

export const usePostItem = (onSubmitSuccess?: () => void, onGoBack?: () => void) => {
  const { user } = useUserStore();
  const { addProduct } = useProductStore();

  // QUY TẮC CỐT LÕI: Cơ sở đăng bán CỐ ĐỊNH gắn liền 100% với cơ sở đăng ký trong hồ sơ Seller (user.campus)
  // Tuyệt đối không lấy theo bộ lọc tìm kiếm tạm thời của app (useCampusStore) và không cho đổi tuỳ tiện.
  const sellerCampus = fromBackendCampus(user?.campus || 'Hòa Lạc');
  const defaultSafePoint = getCampusDefaultSafePoint(sellerCampus);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('it');
  const [selectedCondition, setSelectedCondition] = useState<PostCondition>('new');
  const [description, setDescription] = useState('');
  const [allowNegotiate, setAllowNegotiate] = useState(true);
  const [freeForK20, setFreeForK20] = useState(false);
  const [selectedSafePoint, setSelectedSafePoint] = useState(defaultSafePoint);
  const [campusShipEnabled, setCampusShipEnabled] = useState(true);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');

  const [images, setImages] = useState<PostImageItem[]>([]);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleApplySuggestion = (text: string) => {
    setTitle((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleAddHashtag = (tagToAdd?: string) => {
    const rawTag = (tagToAdd !== undefined ? tagToAdd : hashtagInput)
      .replace(/^#+/, '')
      .replace(/[,\s]/g, '')
      .trim()
      .toLowerCase();

    if (!rawTag) return;
    if (hashtags.length >= 8) {
      Alert.alert('Giới hạn hashtag', 'Mỗi bài đăng có tối đa 8 hashtag để tối ưu tìm kiếm Meilisearch.');
      return;
    }
    if (!hashtags.includes(rawTag)) {
      setHashtags([...hashtags, rawTag]);
    }
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = () => {
    const rawPrice = parseInt(price.replace(/[^\d]/g, ''), 10) || 0;
    const currentSeller = user || {
      id: '',
      name: 'Người bán FPT',
      campus: sellerCampus,
      cohort: '',
      rating: 5.0,
      isKycVerified: false,
    };

    addProduct({
      title,
      price: rawPrice,
      condition: selectedCondition === 'new' ? 'Mới 100%' : 'Like new 99%',
      category: selectedCategory === 'book' ? 'books' : 'electronics',
      images: images.map((i) => i.source),
      campus: sellerCampus, // Khóa cứng theo cơ sở Seller đăng ký
      sellerId: currentSeller.id,
      sellerName: currentSeller.name,
      sellerCohort: currentSeller.cohort || `${sellerCampus} Tech Store`,
      sellerRating: currentSeller.rating || 5.0,
      sellerIsVerified: true,
      safePoint: selectedSafePoint,
      allowNegotiate,
      campusShipEnabled,
      hashtags,
      description,
    });

    Alert.alert(
      '🎉 Đăng tin thành công!',
      `Món đồ "${title}" của bạn đã được niêm yết tại cơ sở ${sellerCampus} (khóa theo hồ sơ Seller của bạn).`,
      [
        {
          text: 'Xem tin đăng của tôi',
          onPress: () => {
            if (onSubmitSuccess) onSubmitSuccess();
            else if (onGoBack) onGoBack();
          },
        },
      ]
    );
  };

  return {
    title,
    setTitle,
    price,
    setPrice,
    description,
    setDescription,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    allowNegotiate,
    setAllowNegotiate,
    freeForK20,
    setFreeForK20,
    selectedSafePoint,
    setSelectedSafePoint,
    campusShipEnabled,
    setCampusShipEnabled,
    hashtags,
    hashtagInput,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    images,
    handleRemoveImage,
    handleApplySuggestion,
    handleSubmit,
    sellerCampus,
    currentCampus: sellerCampus, // Alias để tương thích ngược
  };
};

export default usePostItem;
