import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useKho } from '../../../context/KhoContext';
import { productMobileService } from '../../../services/productMobileService';
import { ListingItemData } from '../screens/ManageListingsScreen';
import { ListingStatus } from '../components/ManageListingsTabs';
import { resolveProductImage } from '../../../lib/imageResolver';
import { withRefreshTimeout } from '../../../utils/safeRefresh';

export const useManageListings = () => {
  const navigation = useNavigation<any>();
  const {
    currentCampus,
    user,
    isAuthenticated,
    myListings: khoMyListings,
    updateProductInKho,
    removeProductFromKho,
    refreshKhoHang,
  } = useKho();

  const [activeTab, setActiveTab] = useState<ListingStatus>('active');
  const [serverListings, setServerListings] = useState<ListingItemData[]>([]);
  const [hasFetchedServer, setHasFetchedServer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
          } else if (p.status === 'REJECTED' || p.status === 'LOCKED') {
            st = 'rejected';
            tag = p.status === 'LOCKED' ? 'Bị BQT khóa' : 'Bị từ chối';
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
            st = 'hidden';
            tag = 'Đã ẩn';
            tagColor = '#475569';
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
        setHasFetchedServer(true);
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

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchMyProducts();
      }
    }, [isAuthenticated, fetchMyProducts])
  );

  const onRefresh = useCallback(async () => {
    await withRefreshTimeout(fetchMyProducts, setRefreshing, 2000);
  }, [fetchMyProducts]);

  const listings: ListingItemData[] = useMemo(() => {
    if (hasFetchedServer || serverListings.length > 0) {
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
      } else if (p.status === 'REJECTED' || p.status === 'LOCKED') {
        st = 'rejected';
        tag = p.status === 'LOCKED' ? 'Bị BQT khóa' : 'Bị từ chối';
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
        st = 'hidden';
        tag = 'Đã ẩn';
        tagColor = '#475569';
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
  }, [hasFetchedServer, serverListings, khoMyListings]);

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
              refreshKhoHang().catch(() => {});
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
  }, [fetchMyProducts, refreshKhoHang]);

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
              refreshKhoHang().catch(() => {});
            } catch (err: any) {
              console.error('Could not renew listing', err);
              Alert.alert('Không thể gia hạn tin', err?.response?.data?.error?.message || err?.message || 'Vui lòng thử lại.');
              fetchMyProducts();
            }
          },
        },
      ]
    );
  }, [fetchMyProducts, refreshKhoHang]);

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
              refreshKhoHang().catch(() => {});
            } catch (error: any) {
              console.error('Could not mark listing as sold', error);
              Alert.alert('Không thể đánh dấu đã bán', error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  }, [updateProductInKho, fetchMyProducts, refreshKhoHang]);

  const handleToggleHide = useCallback((id: string, title: string, isCurrentlyHidden?: boolean) => {
    const actionText = isCurrentlyHidden ? 'Mở bán lại' : 'Tạm ẩn';
    const alertMessage = isCurrentlyHidden
      ? `Mở bán lại "${title}" để sinh viên khác có thể tìm thấy và đặt mua trên Chợ Campus?`
      : `Tạm ẩn "${title}" khỏi kết quả tìm kiếm của sinh viên khác? Bạn có thể mở bán lại bất cứ lúc nào trong mục Đã ẩn.`;

    Alert.alert(
      `👁️ ${actionText} tin đăng`,
      alertMessage,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: actionText,
          onPress: async () => {
            const nextStatus = isCurrentlyHidden ? 'AVAILABLE' : 'HIDDEN';
            try {
              await productMobileService.updateProductStatus(id, nextStatus);
              updateProductInKho(id, { status: nextStatus });
              Alert.alert(
                'Thành công',
                isCurrentlyHidden
                  ? `Tin đăng "${title}" đã được mở bán lại và hiển thị trên Chợ Campus.`
                  : `Tin đăng "${title}" đã được chuyển vào mục Đã ẩn.`
              );
              fetchMyProducts();
              refreshKhoHang().catch(() => {});
            } catch (error: any) {
              console.error('Could not change listing visibility', error);
              Alert.alert('Không thể đổi trạng thái tin', error?.response?.data?.error?.message || error?.message || 'Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  }, [updateProductInKho, fetchMyProducts, refreshKhoHang]);

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
              removeProductFromKho(id);
              Alert.alert('Đã xóa', 'Tin đăng đã được xóa khỏi hệ thống.');
              fetchMyProducts();
              refreshKhoHang().catch(() => {});
            } catch (err: any) {
              Alert.alert('Thông báo', err?.response?.data?.message || err?.message || 'Đã xóa tin đăng.');
              fetchMyProducts();
            }
          },
        },
      ]
    );
  }, [fetchMyProducts, removeProductFromKho, refreshKhoHang]);

  const handleEdit = useCallback((item: ListingItemData) => {
    const rawPrice = parseInt(item.price.replace(/[^\d]/g, ''), 10) || 500000;
    navigation.navigate('EditListing', {
      productId: item.id,
      product: {
        id: item.id,
        title: item.title,
        price: rawPrice,
        safePoint: item.location,
        status:
          item.rawStatus ||
          (item.status === 'pending'
            ? 'PENDING_APPROVAL'
            : item.status === 'rejected'
            ? 'REJECTED'
            : item.status === 'hidden'
            ? 'HIDDEN'
            : item.status === 'active'
            ? 'AVAILABLE'
            : item.status === 'sold'
            ? 'SOLD'
            : 'RESERVED'),
        rejectionReason: item.rejectionReason,
      },
    });
  }, [navigation]);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => item.status === activeTab);
  }, [listings, activeTab]);

  const activeCount = useMemo(() => listings.filter((l) => l.status === 'active').length, [listings]);
  const pendingCount = useMemo(() => listings.filter((l) => l.status === 'pending').length, [listings]);
  const hiddenCount = useMemo(() => listings.filter((l) => l.status === 'hidden').length, [listings]);
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
    hiddenCount,
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
