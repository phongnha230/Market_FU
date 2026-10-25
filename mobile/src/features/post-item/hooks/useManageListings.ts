import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useKho } from '../../../context/KhoContext';
import { productMobileService } from '../../../services/productMobileService';
import { ListingItemData } from '../screens/ManageListingsScreen';
import { ListingStatus } from '../components/ManageListingsTabs';
import { resolveProductImage } from '../../../lib/imageResolver';
import { withRefreshTimeout } from '../../../utils/safeRefresh';

const INITIAL_LISTINGS: ListingItemData[] = [];

export const useManageListings = () => {
  const navigation = useNavigation<any>();
  const {
    currentCampus,
    user,
    isAuthenticated,
    myListings: khoMyListings,
    updateProductInKho,
  } = useKho();

  const [activeTab, setActiveTab] = useState<ListingStatus>('active');
  const [serverListings, setServerListings] = useState<ListingItemData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const currentSellerId = user?.id || '';

  const fetchMyProducts = useCallback(async () => {
    try {
      const items = await productMobileService.getMyProducts();
      if (Array.isArray(items)) {
        const mapped: ListingItemData[] = items.map((p) => {
          let st: ListingStatus = 'active';
          let tag = 'Đang hiển thị';
          let tagColor = '#059669';

          if (p.status === 'PENDING_APPROVAL') {
            st = 'pending';
            tag = 'Chờ BQT duyệt';
            tagColor = '#D97706';
          } else if (p.status === 'REJECTED') {
            st = 'rejected';
            tag = 'Bị từ chối';
            tagColor = '#DC2626';
          } else if (p.status === 'RESERVED') {
            st = 'scheduled';
            tag = 'Đang hẹn giao';
            tagColor = '#2563EB';
          } else if (p.status === 'SOLD') {
            st = 'sold';
            tag = 'Đã thanh toán';
            tagColor = '#64748B';
          } else if (p.status === 'HIDDEN') {
            st = 'sold';
            tag = 'Tạm ẩn';
            tagColor = '#64748B';
          }

          return {
            id: p.id,
            title: p.title,
            price: p.price.toLocaleString('vi-VN') + ' đ',
            timeAgo: p.createdAt ? 'Vừa cập nhật' : 'Hôm nay',
            location: p.safePoint || 'Sảnh Alpha Hòa Lạc',
            locationIcon: 'location-outline',
            image: resolveProductImage(p.images?.[0]),
            tag,
            tagColor,
            tagTextColor: '#FFFFFF',
            views: p.viewsCount || 1,
            status: st,
            rawStatus: p.status,
            rejectionReason: p.rejectionReason,
            appealStatus: p.appealStatus,
            appealReason: p.appealReason,
          };
        });
        setServerListings(mapped);
      }
    } catch (e) {
      console.log('Error fetching my products from backend:', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProducts();
    }
  }, [isAuthenticated, fetchMyProducts]);

  const onRefresh = useCallback(async () => {
    await withRefreshTimeout(fetchMyProducts, setRefreshing, 2000);


  }, [fetchMyProducts]);

  const listings: ListingItemData[] = useMemo(() => {
    if (serverListings.length > 0) {
      return serverListings;
    }
    const list: ListingItemData[] = [];

    khoMyListings.forEach((p) => {
      let st: ListingStatus = 'active';
      let tag = 'Đang hiển thị';
      let tagColor = '#059669';

      if (p.status === 'PENDING_APPROVAL') {
        st = 'pending';
        tag = 'Chờ BQT duyệt';
        tagColor = '#D97706';
      } else if (p.status === 'REJECTED') {
        st = 'rejected';
        tag = 'Bị từ chối';
        tagColor = '#DC2626';
      } else if (p.status === 'RESERVED') {
        st = 'scheduled';
        tag = 'Đang hẹn giao';
        tagColor = '#2563EB';
      } else if (p.status === 'SOLD') {
        st = 'sold';
        tag = 'Đã thanh toán';
        tagColor = '#64748B';
      } else if (p.status === 'HIDDEN') {
        st = 'sold';
        tag = 'Tạm ẩn';
        tagColor = '#64748B';
      }

      list.push({
        id: p.id,
        title: p.title,
        price: p.price.toLocaleString('vi-VN') + ' đ',
        timeAgo: p.createdAt || 'Hôm nay',
        location: p.safePoint || 'Sảnh Alpha Hòa Lạc',
        locationIcon: 'location-outline',
        image: resolveProductImage(p.images?.[0]),
        tag,
        tagColor,
        tagTextColor: '#FFFFFF',
        views: p.viewsCount || 0,
        status: st,
        rawStatus: p.status,
        rejectionReason: p.rejectionReason,
        appealStatus: p.appealStatus,
        appealReason: p.appealReason,
      });
    });

    return list;
  }, [serverListings, khoMyListings]);

  const handleBoost = useCallback((id: string, title: string) => {
    Alert.alert(
      '🚀 Đẩy tin đăng (20 Campus Coins)',
      `Bạn có muốn dùng 20 Campus Coins để đẩy tin "${title}" lên vị trí đầu trang Chợ Campus trong 24h?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đẩy tin ngay',
          onPress: async () => {
            try {
              await productMobileService.boostProduct(id, 'BUMP');
              Alert.alert(
                '🚀 Đẩy tin thành công!',
                `Tin đăng "${title}" đã được ưu tiên hiển thị lên đầu trang Chợ Campus trong 24h.`
              );
              fetchMyProducts();
            } catch (err: any) {
              Alert.alert(
                'Thông báo',
                err?.response?.data?.message || err?.message || 'Đã đẩy tin đăng lên vị trí ưu tiên.'
              );
              fetchMyProducts();
            }
          },
        },
      ]
    );
  }, [fetchMyProducts]);

  const handleRenew = useCallback((id: string, title: string) => {
    Alert.alert(
      '🔄 Gia hạn tin đăng',
      `Gia hạn tin "${title}" thêm 30 ngày hiển thị trên sàn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gia hạn ngay',
          onPress: async () => {
            try {
              await productMobileService.renewProduct(id);
              Alert.alert('🎉 Thành công', `Đã gia hạn 30 ngày cho tin "${title}"!`);
              fetchMyProducts();
            } catch (err: any) {
              console.error('Could not renew listing', err);
              Alert.alert('Không thể gia hạn tin', err?.response?.data?.error?.message || err?.message || 'Vui lòng thử lại.');
              fetchMyProducts();
            }
          },
        },
      ]
    );
  }, [fetchMyProducts]);

  const handleMarkSold = useCallback((id: string, title: string) => {
    Alert.alert(
      '✓ Xác nhận đã bán',
      `Bạn đã bán thành công "${title}" cho bạn cùng trường?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận đã bán',
          onPress: async () => {
            try {
              await productMobileService.updateProductStatus(id, 'SOLD');
              updateProductInKho(id, { status: 'SOLD' });
              Alert.alert('🎉 Chúc mừng!', 'Tin đã được chuyển vào mục Đã bán.');
              fetchMyProducts();
            } catch (error: any) {
              console.error('Could not mark listing as sold', error);
              Alert.alert('Không thể đánh dấu đã bán', error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  }, [updateProductInKho, fetchMyProducts]);

  const handleToggleHide = useCallback((id: string, title: string, isCurrentlyHidden?: boolean) => {
    const actionText = isCurrentlyHidden ? 'Hiện lại' : 'Tạm ẩn';
    Alert.alert(
      `👁️ ${actionText} tin đăng`,
      `${actionText} "${title}" khỏi kết quả tìm kiếm của sinh viên khác?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: actionText,
          onPress: async () => {
            const nextStatus = isCurrentlyHidden ? 'AVAILABLE' : 'HIDDEN';
            try {
              await productMobileService.updateProductStatus(id, nextStatus);
              updateProductInKho(id, { status: nextStatus });
              Alert.alert('Thành công', `Tin đăng đã được ${actionText.toLowerCase()}.`);
              fetchMyProducts();
            } catch (error: any) {
              console.error('Could not change listing visibility', error);
              Alert.alert('Không thể đổi trạng thái tin', error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  }, [updateProductInKho, fetchMyProducts]);

  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert(
      '🗑️ Xóa tin đăng',
      `Bạn có chắc chắn muốn xóa vĩnh viễn bài đăng "${title}"? Thao tác này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await productMobileService.deleteProduct(id);
              Alert.alert('Đã xóa', 'Tin đăng đã được xóa khỏi hệ thống.');
              fetchMyProducts();
            } catch (err: any) {
              Alert.alert('Thông báo', err?.response?.data?.message || err?.message || 'Đã xóa tin đăng.');
              fetchMyProducts();
            }
          },
        },
      ]
    );
  }, [fetchMyProducts]);

  const handleEdit = useCallback((item: ListingItemData) => {
    const rawPrice = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 500000;
    navigation.navigate('EditListing', {
      productId: item.id,
      product: {
        id: item.id,
        title: item.title,
        price: rawPrice,
        safePoint: item.location,
        status: item.rawStatus || (item.status === 'pending' ? 'PENDING_APPROVAL' : item.status === 'rejected' ? 'REJECTED' : item.status === 'active' ? 'AVAILABLE' : (item.status === 'sold' ? 'SOLD' : 'RESERVED')),
        rejectionReason: item.rejectionReason,
      },
    });
  }, [navigation]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => item.status === activeTab);
  }, [listings, activeTab]);

  const activeCount = useMemo(() => listings.filter((l) => l.status === 'active').length, [listings]);
  const pendingCount = useMemo(() => listings.filter((l) => l.status === 'pending').length, [listings]);
  const rejectedCount = useMemo(() => listings.filter((l) => l.status === 'rejected').length, [listings]);
  const scheduledCount = useMemo(() => listings.filter((l) => l.status === 'scheduled').length, [listings]);
  const soldCount = useMemo(() => listings.filter((l) => l.status === 'sold').length, [listings]);

  return {
    currentCampus,
    isAuthenticated,
    isSeller: user?.role === 'SELLER',
    activeTab,
    setActiveTab,
    refreshing,
    onRefresh,
    filteredListings,
    activeCount,
    pendingCount,
    rejectedCount,
    scheduledCount,
    soldCount,
    handleBoost,
    handleRenew,
    handleMarkSold,
    handleToggleHide,
    handleDelete,
    handleEdit,
  };
};
