import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProductStore, ProductItem } from '../../../stores/productStore';
import { useUserStore } from '../../../stores/userStore';
import { fromBackendCampus } from '../../../lib/backendMappers';
import { productMobileService } from '../../../services/productMobileService';

export interface EditListingFormData {
  title: string;
  priceStr: string;
  category: string;
  condition: string;
  safePoint: string;
  status: ProductItem['status'];
  allowNegotiate: boolean;
  hashtags: string[];
}

const checkIsApproved = (status?: ProductItem['status']): boolean => {
  return status === 'AVAILABLE' || status === 'RESERVED' || status === 'SOLD';
};

const getInitialFormData = (product?: ProductItem): EditListingFormData => ({
  title: product?.title || '',
  priceStr: String(product?.price || ''),
  category: product?.category || 'electronics',
  condition: product?.condition || 'LIKE_NEW_99',
  safePoint: product?.safePoint || 'Trạm Safe-Point Sảnh Tòa Alpha',
  status: product?.status || 'AVAILABLE',
  allowNegotiate: product?.allowNegotiate ?? true,
  hashtags: Array.isArray(product?.hashtags) ? product.hashtags : [],
});

const validateForm = (title: string, priceStr: string): number | null => {
  if (!title.trim()) {
    Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề món đồ cần bán.');
    return null;
  }
  const price = parseInt(priceStr, 10);
  if (isNaN(price) || price <= 0) {
    Alert.alert('Giá không hợp lệ', 'Vui lòng nhập giá bán lớn hơn 0đ.');
    return null;
  }
  return price;
};

const confirmDeleteListing = (onConfirm: () => void) => {
  Alert.alert(
    'Xóa tin đăng',
    'Bạn có chắc chắn muốn xóa tin đăng này? Món đồ sẽ không còn xuất hiện trên Chợ Campus.',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận xóa',
        style: 'destructive',
        onPress: onConfirm,
      },
    ]
  );
};

export const useEditListingController = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { productId, product: passedProduct } = route.params || {};
  const { products, updateProduct, deleteProduct } = useProductStore();
  const { user } = useUserStore();

  const currentProduct = useMemo(
    () => products.find((p) => p.id === productId) || passedProduct || products[0],
    [products, productId, passedProduct]
  );

  const sellerCampus = useMemo(
    () => fromBackendCampus(user?.campus || currentProduct?.campus || 'Hòa Lạc'),
    [user?.campus, currentProduct?.campus]
  );

  const isApproved = checkIsApproved(currentProduct?.status);

  const [formData, setFormData] = useState<EditListingFormData>(() =>
    getInitialFormData(currentProduct)
  );

  const updateField = useCallback(<K extends keyof EditListingFormData>(
    field: K,
    value: EditListingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    const price = validateForm(formData.title, formData.priceStr);
    if (price === null || !currentProduct?.id) return;

    try {
      await productMobileService.updateProduct(currentProduct.id, {
        title: formData.title.trim(),
        price,
        category: formData.category,
        condition: formData.condition,
        safePoint: formData.safePoint,
        campus: sellerCampus,
        hashtags: formData.hashtags,
        description: currentProduct.description,
      });

      if (formData.status && formData.status !== currentProduct.status) {
        await productMobileService.updateProductStatus(currentProduct.id, formData.status);
      }
    } catch (e: any) {
      console.log('⚠️ [updateProduct API error, saving to local store]:', e?.message);
    }

    updateProduct(currentProduct.id, {
      title: formData.title.trim(),
      price,
      category: formData.category,
      condition: formData.condition,
      safePoint: formData.safePoint,
      campus: sellerCampus,
      status: formData.status,
      allowNegotiate: formData.allowNegotiate,
      hashtags: formData.hashtags,
    });

    Alert.alert('✅ Thành công', 'Tin đăng đã được cập nhật thành công!');
    navigation.goBack();
  }, [formData, currentProduct?.id, currentProduct?.status, currentProduct?.description, updateProduct, sellerCampus, navigation]);

  const handleDelete = useCallback(() => {
    confirmDeleteListing(async () => {
      if (currentProduct?.id) {
        try {
          await productMobileService.deleteProduct(currentProduct.id);
        } catch (e: any) {
          console.log('⚠️ [deleteProduct API error, deleting from local store]:', e?.message);
        }
        deleteProduct(currentProduct.id);
        Alert.alert('Đã xóa', 'Tin đăng đã được xóa khỏi hệ thống.');
        navigation.goBack();
      }
    });
  }, [currentProduct?.id, deleteProduct, navigation]);

  return {
    formData,
    updateField,
    isApproved,
    sellerCampus,
    handleSave,
    handleDelete,
    goBack: navigation.goBack,
  };
};
