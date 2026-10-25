import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { productMobileService } from '../../../services/productMobileService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ManageListingsFallback } from '../components/ManageListingsFallback';
import { ManageListingsHeader } from '../components/ManageListingsHeader';
import { ManageListingsAnalytics } from '../components/ManageListingsAnalytics';
import { ManageListingsTabs, ListingStatus } from '../components/ManageListingsTabs';
import { ManageListingsCard } from '../components/ManageListingsCard';
import { useManageListings } from '../hooks/useManageListings';
import { BoostProductModal } from '../../seller/components/BoostProductModal';
import { useUserStore } from '../../../stores/userStore';
import { useOrderStore } from '../../../stores/orderStore';

export type { ListingStatus };

export interface ListingItemData {
  id: string;
  title: string;
  price: string;
  timeAgo: string;
  location: string;
  locationIcon: 'location-outline' | 'school-outline' | 'fitness-outline';
  image: any;
  tag?: string;
  tagColor?: string;
  tagTextColor?: string;
  unreadMessages?: number;
  scheduledAppointments?: number;
  views: number;
  status: ListingStatus;
  isBoosted?: boolean;
  rawStatus?: string;
  rejectionReason?: string;
  appealStatus?: string | null;
  appealReason?: string | null;
}

export interface ManageListingsScreenProps {
  onGoBack?: () => void;
  onPostNew?: () => void;
}

export const ManageListingsScreen: React.FC<ManageListingsScreenProps> = ({
  onGoBack,
  onPostNew,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    currentCampus,
    isAuthenticated,
    isSeller,
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
  } = useManageListings();

  const [appealItem, setAppealItem] = useState<ListingItemData | null>(null);
  const [appealReasonText, setAppealReasonText] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);

  const handleOpenAppealModal = useCallback((item: ListingItemData) => {
    setAppealItem(item);
    setAppealReasonText('');
  }, []);

  const handleConfirmAppeal = useCallback(async () => {
    if (!appealItem || !appealReasonText.trim() || appealReasonText.trim().length < 5) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập lý do giải trình chi tiết (tối thiểu 5 ký tự)');
      return;
    }
    try {
      setIsSubmittingAppeal(true);
      await productMobileService.appealProduct(appealItem.id, appealReasonText.trim());
      Alert.alert('Thành công', 'Đã gửi đơn kháng nghị lên Ban Quản Trị');
      setAppealItem(null);
      setAppealReasonText('');
      onRefresh();
    } catch (err: any) {
      Alert.alert('Lỗi gửi kháng nghị', err?.message || 'Vui lòng thử lại sau');
    } finally {
      setIsSubmittingAppeal(false);
    }
  }, [appealItem, appealReasonText, onRefresh]);

  const [boostTarget, setBoostTarget] = useState<{
    id: string;
    title: string;
    price: number;
    image?: any;
  } | null>(null);

  const handleOpenBoostModal = useCallback((id: string, title: string) => {
    const item = filteredListings.find((l) => l.id === id);
    const numericPrice = item?.price ? Number(String(item.price).replace(/[^\d]/g, '')) : 0;
    setBoostTarget({
      id,
      title: item?.title || title,
      price: numericPrice,
      image: item?.image,
    });
  }, [filteredListings]);

  const handleBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  }, [navigation, onGoBack]);

  const handleCreatePost = useCallback(() => {
    if (onPostNew) {
      onPostNew();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'PostItem' });
    }
  }, [navigation, onPostNew]);

  const handleProfile = useCallback(() => {
    if (navigation && navigation.navigate) {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  }, [navigation]);

  const { user } = useUserStore();
  const { orders } = useOrderStore();
  const currentUserId = user?.id || '';

  const activeHandoffOrder = useMemo(() => {
    const found = orders.find(
      (o) =>
        (o.sellerId === currentUserId || o.buyerId === currentUserId) &&
        ['PENDING_SAFEPOINT', 'ESCROW_PAID', 'HANDOVER_CONFIRMED'].includes(o.status)
    );
    if (!found) return null;
    return {
      id: found.id,
      orderNumber: found.orderNumber,
      partnerName:
        found.sellerId === currentUserId
          ? found.buyerName || 'Người mua'
          : found.sellerName || 'Người bán',
      timeSlot: found.timeSlot,
      safePoint: found.safePoint,
      productTitle: found.productTitle,
    };
  }, [orders, currentUserId]);

  const totalViews = useMemo(() => {
    return filteredListings.reduce((sum, item) => sum + (item.views || 0), 0);
  }, [filteredListings]);

  const dealsCount = useMemo(() => {
    return soldCount + scheduledCount;
  }, [soldCount, scheduledCount]);

  const handleSafeHandoffReminderPress = useCallback(() => {
    if (activeHandoffOrder) {
      navigation.navigate('OrderDetail', { orderId: activeHandoffOrder.id });
    } else {
      navigation.navigate('SafePointHubs');
    }
  }, [navigation, activeHandoffOrder]);

  const handleExploreSafePoints = useCallback(() => {
    navigation.navigate('SafePointHubs');
  }, [navigation]);

  // 1. Nếu chưa đăng nhập (Guest)
  if (!isAuthenticated) {
    return (
      <View style={styles.screen}>
        <ManageListingsFallback
          type="guest"
          insetsTop={insets.top}
          onLogin={() => navigation.navigate('Login')}
          onProfile={handleProfile}
          onBack={handleBack}
        />
      </View>
    );
  }

  // 2. Nếu đã đăng nhập nhưng KHÔNG PHẢI SELLER
  if (!isSeller) {
    return (
      <View style={styles.screen}>
        <ManageListingsFallback
          type="non-seller"
          insetsTop={insets.top}
          onLogin={() => navigation.navigate('Login')}
          onProfile={handleProfile}
          onBack={handleBack}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ManageListingsHeader
        insetsTop={insets.top}
        currentCampus={currentCampus}
        onBack={handleBack}
        onProfile={handleProfile}
        onPostNew={handleCreatePost}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 70 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
        }
      >
        <ManageListingsAnalytics
          totalViews={totalViews}
          dealsCount={dealsCount}
          activeOrder={activeHandoffOrder}
          onSafeHandoffPress={handleSafeHandoffReminderPress}
          onExploreSafePoints={handleExploreSafePoints}
        />

        <ManageListingsTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeCount={activeCount}
          pendingCount={pendingCount}
          rejectedCount={rejectedCount}
          scheduledCount={scheduledCount}
          soldCount={soldCount}
        />

        <View style={styles.listingList}>
          {filteredListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyText}>Chưa có món đồ nào trong mục này</Text>
            </View>
          ) : (
            filteredListings.map((item) => (
              <ManageListingsCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onBoost={handleOpenBoostModal}
                onRenew={handleRenew}
                onToggleHide={handleToggleHide}
                onMarkSold={handleMarkSold}
                onDelete={handleDelete}
                onAppeal={handleOpenAppealModal}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Boost / VIP / Renew Modal */}
      <BoostProductModal
        visible={Boolean(boostTarget)}
        onClose={() => setBoostTarget(null)}
        product={boostTarget}
        onSuccess={(msg) => {
          Alert.alert('🎉 Thành công', msg);
          onRefresh();
        }}
        onNavigateToDeposit={() => {
          navigation.navigate('MainTabs', { screen: 'Profile' });
        }}
      />

      {/* Modal Kháng nghị tin đăng */}
      <Modal
        visible={Boolean(appealItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setAppealItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="alert-circle-outline" size={20} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.modalTitle}>Kháng nghị gỡ tin đăng</Text>
              </View>
              <TouchableOpacity onPress={() => setAppealItem(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {appealItem && (
              <View style={styles.modalBody}>
                <Text style={styles.modalItemTitle} numberOfLines={1}>
                  {appealItem.title}
                </Text>

                <View style={styles.modalRejectionBox}>
                  <Text style={styles.modalRejectionLabel}>Lý do BQT từ chối / gỡ tin:</Text>
                  <Text style={styles.modalRejectionText}>
                    {appealItem.rejectionReason || 'Vi phạm tiêu chuẩn kiểm duyệt của sàn.'}
                  </Text>
                </View>

                <Text style={styles.modalInputLabel}>Nội dung giải trình / Minh chứng:</Text>
                <TextInput
                  style={styles.modalTextInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Nêu rõ lý do vì sao bài đăng không vi phạm (VD: ảnh thật chụp tại phòng KTX, thiết bị phù hợp công suất an toàn...)"
                  placeholderTextColor="#94A3B8"
                  value={appealReasonText}
                  onChangeText={setAppealReasonText}
                  textAlignVertical="top"
                />
                <Text style={styles.modalInputHint}>Tối thiểu 5 ký tự. BQT sẽ xem xét và phản hồi sớm.</Text>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalCancelBtn]}
                    onPress={() => setAppealItem(null)}
                    disabled={isSubmittingAppeal}
                  >
                    <Text style={styles.modalCancelText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      styles.modalSubmitBtn,
                      (isSubmittingAppeal || appealReasonText.trim().length < 5) && styles.modalSubmitBtnDisabled,
                    ]}
                    onPress={handleConfirmAppeal}
                    disabled={isSubmittingAppeal || appealReasonText.trim().length < 5}
                  >
                    {isSubmittingAppeal ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Gửi kháng nghị</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ManageListingsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  listingList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginTop: 12,
  },
  modalItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalRejectionBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  modalRejectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  modalRejectionText: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 16,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 90,
  },
  modalInputHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#DC2626',
  },
  modalSubmitBtnDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
