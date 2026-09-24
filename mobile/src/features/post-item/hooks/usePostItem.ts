import { useState } from 'react';
import { Alert } from 'react-native';
import { PostCategory, PostCondition, PostImageItem } from '../types/post-item.types';
import { SAFE_POINT_DEFAULT } from '../constants/post-item.constants';
import { useCampusStore } from '../../../stores/useCampusStore';

export const usePostItem = (onSubmitSuccess?: () => void, onGoBack?: () => void) => {
  const { currentCampus } = useCampusStore();
  const [title, setTitle] = useState('Bàn phím cơ Akko 3087 v2 Silent Switch');
  const [price, setPrice] = useState('520.000');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('it');
  const [selectedCondition, setSelectedCondition] = useState<PostCondition>('new');
  const [allowNegotiate, setAllowNegotiate] = useState(true);
  const [freeForK20, setFreeForK20] = useState(false);
  const [selectedSafePoint, setSelectedSafePoint] = useState(SAFE_POINT_DEFAULT);
  const [campusShipEnabled, setCampusShipEnabled] = useState(true);

  const [images, setImages] = useState<PostImageItem[]>([
    {
      id: '1',
      source: require('../../../../assets/products/keyboard-akko.jpg'),
      isCover: true,
      isHd: true,
    },
    {
      id: '2',
      source: require('../../../../assets/products/books-mas291.jpg'),
      isCover: false,
      isHd: false,
    },
  ]);

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleApplySuggestion = (text: string) => {
    setTitle((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleSubmit = () => {
    Alert.alert(
      '🎉 Đăng tin thành công!',
      `Món đồ của bạn đã được FPT Bot duyệt tự động và xuất hiện tại ${currentCampus} Marketplace.`,
      [
        {
          text: 'Về trang chủ',
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
    images,
    handleRemoveImage,
    handleApplySuggestion,
    handleSubmit,
    currentCampus,
  };
};

export default usePostItem;
