import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PostCategory, PostCondition, PostImageItem } from '../types/post-item.types';
import { useProductStore } from '../../../stores/productStore';
import { useUserStore } from '../../../stores/userStore';
import { fromBackendCampus } from '../../../lib/backendMappers';
import { productMobileService } from '../../../services/productMobileService';

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

  const handleAddImage = async () => {
    Alert.alert('Thêm ảnh sản phẩm', 'Chọn nguồn ảnh thực tế của món đồ', [
      {
        text: 'Chụp ảnh mới (Camera)',
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Cấp quyền', 'Vui lòng cấp quyền truy cập Camera để chụp ảnh sản phẩm.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const newAsset = res.assets[0];
              const newItem: PostImageItem = {
                id: `img_${Date.now()}`,
                source: { uri: newAsset.uri },
                isCover: images.length === 0,
              };
              setImages((prev) => [...prev, newItem]);
            }
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message || 'Không thể mở Camera.');
          }
        },
      },
      {
        text: 'Chọn từ Thư viện ảnh',
        onPress: async () => {
          try {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsMultipleSelection: true,
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const newItems: PostImageItem[] = res.assets.map((a, idx) => ({
                id: `img_${Date.now()}_${idx}`,
                source: { uri: a.uri },
                isCover: images.length === 0 && idx === 0,
              }));
              setImages((prev) => [...prev, ...newItems].slice(0, 6));
            }
          } catch (e: any) {
            Alert.alert('Lỗi', e?.message || 'Không thể mở thư viện ảnh.');
          }
        },
      },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

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

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập tài khoản Người bán để đăng tin.');
      return;
    }

    if (title.trim().length < 5) {
      Alert.alert('Tiêu đề quá ngắn', 'Tiêu đề sản phẩm phải có ít nhất 5 ký tự để người mua dễ tìm thấy.');
      return;
    }

    const rawPrice = parseInt(price.replace(/[^\d]/g, ''), 10) || 0;
    if (rawPrice <= 0) {
      Alert.alert('Giá không hợp lệ', 'Vui lòng nhập giá bán sản phẩm.');
      return;
    }

    const currentSeller = user || {
      id: '',
      name: 'Người bán FPT',
      campus: sellerCampus,
      cohort: '',
      rating: 5.0,
      isKycVerified: false,
    };

    const finalDescription =
      description.trim().length >= 10
        ? description.trim()
        : `${title.trim()} - Cần pass lại giá sinh viên FPT tại cơ sở ${sellerCampus}. Tình trạng tốt, có thể test đồ trực tiếp tại Safe-point.`;

    const mappedCategory =
      selectedCategory === 'book'
        ? 'BOOKS'
        : selectedCategory === 'dom'
        ? 'DORM_ITEM'
        : selectedCategory === 'vovinam'
        ? 'CLOTHING'
        : 'ELECTRONICS';

    const mappedCondition =
      selectedCondition === 'new'
        ? 'NEW_100'
        : selectedCondition === 'good'
        ? 'USED_GOOD'
        : 'USED_FAIR';

    const finalImageUrls = images.map((i) =>
      typeof i.source === 'object' && i.source.uri ? i.source.uri : i.source
    );

    try {
      const created = await productMobileService.createProduct({
        title: title.trim(),
        price: rawPrice,
        condition: mappedCondition,
        category: mappedCategory,
        images: finalImageUrls,
        campus: sellerCampus,
        safePoint: selectedSafePoint,
        allowNegotiate,
        campusShipEnabled,
        hashtags,
        description: finalDescription,
      });

      if (created) {
        addProduct(created);
      }
    } catch (err: any) {
      console.log('⚠️ [createProduct backend error, fallback to local store]:', err?.message);
      // Fallback lưu local store nếu backend offline
      addProduct({
        title: title.trim(),
        price: rawPrice,
        condition: selectedCondition === 'new' ? 'Mới 100%' : 'Like new 99%',
        category: selectedCategory === 'book' ? 'books' : selectedCategory === 'dom' ? 'dom' : selectedCategory === 'vovinam' ? 'vovinam' : 'electronics',
        images: finalImageUrls,
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
        description: finalDescription,
      });
    }

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
    handleAddImage,
    handleRemoveImage,
    handleApplySuggestion,
    handleSubmit,
    sellerCampus,
    currentCampus: sellerCampus, // Alias để tương thích ngược
  };
};

export default usePostItem;
