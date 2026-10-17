import { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DEFAULT_PRODUCT_DETAIL, RELATED_PRODUCTS } from '../constants/product-detail.constants';
import { useFavoriteStore } from '../../../stores/useFavoriteStore';
import { useProductStore, ProductItem } from '../../../stores/productStore';
import { useUserStore } from '../../../stores/userStore';
import { productMobileService } from '../../../services/productMobileService';
import { profileMobileService } from '../../../services/profileMobileService';
import { chatMobileService } from '../../../services/chatMobileService';
import { fromBackendCategory } from '../../../lib/backendMappers';
import { ProductDetailData } from '../types/product-detail.types';

export const useProductDetail = (productId?: string) => {
  const navigation = useNavigation<any>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [remoteProduct, setRemoteProduct] = useState<ProductItem | null>(null);
  const [sellerPublicProfile, setSellerPublicProfile] = useState<any>(null);
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const { products } = useProductStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (!productId) return;
    productMobileService
      .getProductById(productId)
      .then((p) => {
        if (p) {
          setRemoteProduct(p);
          if (p.sellerId) {
            profileMobileService
              .getPublicProfile(p.sellerId)
              .then((prof) => {
                if (prof) setSellerPublicProfile(prof);
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    const local = products.find((p) => p.id === productId);
    if (local?.sellerId && !sellerPublicProfile) {
      profileMobileService
        .getPublicProfile(local.sellerId)
        .then((prof) => {
          if (prof) setSellerPublicProfile(prof);
        })
        .catch(() => {});
    }
  }, [productId, products, sellerPublicProfile]);

  const product: ProductDetailData = useMemo(() => {
    const found = remoteProduct || products.find((p) => p.id === productId);
    if (!found) return DEFAULT_PRODUCT_DETAIL;

    const hasDiscount = Boolean(found.originalPrice && found.originalPrice > found.price);
    const discountPercent = hasDiscount
      ? Math.round(((found.originalPrice! - found.price) / found.originalPrice!) * 100)
      : undefined;

    // 1. Số sản phẩm người bán đang có trên sàn (dựa trên danh sách sản phẩm thực tế)
    const sellerProductsInStore = products.filter(
      (p) =>
        (found.sellerId && p.sellerId === found.sellerId) ||
        (found.sellerName && p.sellerName && p.sellerName.trim().toLowerCase() === found.sellerName.trim().toLowerCase())
    );
    const activeListingsCount =
      sellerPublicProfile?._count?.products ??
      sellerPublicProfile?.activeListingsCount ??
      (sellerProductsInStore.length > 0 ? sellerProductsInStore.length : 1);

    // 2. Số đơn đã bán thành công (thật từ Database, không gán số ảo)
    const soldCount =
      typeof sellerPublicProfile?.dealCount === 'number'
        ? sellerPublicProfile.dealCount
        : 0;

    // 3. Đánh giá sao thật (nếu chưa có ai review thì trả về null, không tự gán 5.0)
    const reviewCount =
      typeof sellerPublicProfile?.reviewCount === 'number'
        ? sellerPublicProfile.reviewCount
        : 0;

    const rawRating =
      typeof sellerPublicProfile?.rating === 'number'
        ? sellerPublicProfile.rating
        : (typeof found.sellerRating === 'number' && found.sellerRating > 0 ? found.sellerRating : null);

    const rating = reviewCount > 0 && rawRating !== null ? rawRating : null;

    return {
      id: found.id,
      title: found.title,
      price: found.price.toLocaleString('vi-VN'),
      originalPrice: hasDiscount ? found.originalPrice!.toLocaleString('vi-VN') : undefined,
      discountBadge: hasDiscount ? `-${discountPercent}% Tiết kiệm` : undefined,
      conditionBadge: found.condition || 'Like New',
      location: `${found.campus} • ${found.safePoint || 'Safe-Point'}`,
      images: found.images && found.images.length > 0 ? found.images : [],
      specs: [
        { label: 'TÌNH TRẠNG', value: found.condition || 'Đã qua sử dụng' },
        { label: 'DANH MỤC', value: fromBackendCategory(found.categoryType || found.category) },
        { label: 'ĐIỂM GIAO DỊCH', value: found.safePoint || 'Safe-Point Campus' },
        { label: 'VẬN CHUYỂN', value: found.campusShipEnabled !== false ? 'Hỗ trợ FPT CampusShip' : 'Chỉ nhận trực tiếp' },
      ],
      description: found.description && found.description.trim()
        ? found.description.trim()
        : 'Sản phẩm giao dịch an toàn tại cơ sở FPT. Có thể hẹn kiểm tra trực tiếp tại trạm Safe-Point.',
      campus: found.campus,
      category: found.category,
      categoryType: found.categoryType,
      sellerId: found.sellerId,
      sellerCohort: found.sellerCohort,
      status: found.status,
      isSoldOrReserved: found.status !== 'AVAILABLE',
      seller: {
        id: found.sellerId,
        name: found.sellerName || 'Sinh viên FPT',
        avatarUrl: sellerPublicProfile?.avatarUrl || found.sellerAvatar || '',
        major: sellerPublicProfile?.major || found.sellerCohort || 'K17 Kỹ thuật phần mềm',
        rating,
        reviewCount,
        soldCount,
        activeListingsCount,
        isVerified: found.sellerIsVerified ?? true,
      },
      safePointInfo: {
        name: found.safePoint || 'Safe-Handoff Sảnh Tòa Alpha',
        desc: 'Hỗ trợ bàn test cắm máy tính & đo nguồn điện trực tiếp có bảo vệ quan sát.',
      },
      hashtags: Array.isArray(found.hashtags) ? found.hashtags : [],
    };
  }, [productId, products, remoteProduct, sellerPublicProfile]);

  const isSaved = isFavorite(product.id);

  const isOwnProduct = Boolean(
    user && (
      (user.id && (product.sellerId === user.id || product.seller?.id === user.id)) ||
      (user.name && product.seller?.name && user.name.trim().toLowerCase() === product.seller.name.trim().toLowerCase())
    )
  );

  const handleToggleFavorite = () => {
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Bạn không thể tự lưu sản phẩm do chính bạn đăng bán!');
      return;
    }
    toggleFavorite(product.id, product);
  };

  const handleBuyNow = () => {
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Bạn không thể mua sản phẩm do chính bạn đăng bán!');
      return;
    }
    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 0;

    navigation.navigate('Checkout', {
      product: {
        id: product.id,
        title: product.title,
        price: numericPrice,
        priceStr: `${numericPrice.toLocaleString('vi-VN')}đ`,
        image: product.images?.[0],
        sellerName: product.seller?.name || 'Người bán FPT',
        sellerCampus: product.campus || 'Cơ sở FPT',
        sellerId: product.seller?.id || product.sellerId || '',
      },
      safePoint: product.safePointInfo?.name,
    });
  };

  const handleChat = async () => {
    if (isOwnProduct) {
      Alert.alert('Thông báo', 'Bạn không thể tự nhắn tin với chính mình!');
      return;
    }
    const numericPrice =
      typeof product.price === 'number'
        ? product.price
        : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 0;

    try {
      if (product.id) {
        await chatMobileService.createOrGetConversation(product.id);
      }
    } catch {}

    navigation.navigate('ChatDetail', {
      partner: {
        id: product.seller?.id || product.sellerId || 'partner',
        name: product.seller?.name || 'Người bán FPT',
        avatar: product.seller?.avatarUrl || '',
        cohort: product.seller?.major || 'Sinh viên FPT',
        isOnline: true,
      },
      product: {
        id: product.id,
        title: product.title,
        price: `${numericPrice.toLocaleString('vi-VN')}đ`,
        image: product.images?.[0],
      },
    });
  };

  return {
    product,
    relatedProducts: RELATED_PRODUCTS,
    currentImageIndex,
    setCurrentImageIndex,
    isSaved,
    handleToggleFavorite,
    handleBuyNow,
    handleChat,
  };
};

export default useProductDetail;
