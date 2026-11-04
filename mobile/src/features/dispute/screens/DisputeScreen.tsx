import React, { useMemo } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DisputeHeader from '../components/DisputeHeader';
import DisputeTypeSelector from '../components/DisputeTypeSelector';
import DisputeReasonSection from '../components/DisputeReasonSection';
import DisputeEvidenceSection from '../components/DisputeEvidenceSection';
import DisputeSubmitBar from '../components/DisputeSubmitBar';
import useDispute from '../hooks/useDispute';
import { DisputeScreenProps } from '../types/dispute.types';
import { useAuth } from '../../../hooks/useAuth';

export const DisputeScreen: React.FC<DisputeScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId;
  const productTitle = route.params?.productTitle;
  const sellerName = route.params?.sellerName;
  const price = route.params?.price;
  const isCod = route.params?.isCod ?? false;
  const order = route.params?.order;
  const rawPassedDispute = route.params?.dispute || order?.dispute;
  const isDisputeRefund = order?.cancelledBy === 'DISPUTE';

  const passedDispute = rawPassedDispute || (
    isDisputeRefund
      ? {
          id: `DSP-${String(order?.orderNumber || order?.id || orderId || '').replace('#', '')}`,
          reason: order?.cancelReason || 'Yêu cầu trả hàng & hoàn tiền 100%',
          details: 'Ban Quản Trị Campus đã thẩm định khiếu nại và chấp thuận hoàn trả tiền bảo hộ Escrow.',
          status: 'REFUNDED' as const,
          createdAt: order?.createdAt || 'Gần đây',
          adminNote: 'BQT FPT Campus đã duyệt yêu cầu hoàn tiền cho Người mua. Tiền cọc Escrow và Xu đã được hoàn trả về ví.',
        }
      : null
  );

  const { user } = useAuth();
  const routeIsSeller = route.params?.isSeller;
  const isSeller = useMemo(() => {
    if (typeof routeIsSeller === 'boolean') {
      return routeIsSeller;
    }
    const currentUserId = user?.id;
    const currentName = user?.name;
    const currentEmail = user?.email;

    const orderBuyerId = route.params?.order?.buyerId || route.params?.buyerId;
    if (currentUserId && orderBuyerId && currentUserId === orderBuyerId) {
      return false;
    }

    const orderSellerId = route.params?.order?.sellerId || route.params?.sellerId;
    if (currentUserId && orderSellerId && currentUserId === orderSellerId) {
      return true;
    }

    const orderSellerName = sellerName || route.params?.order?.sellerName;
    if (currentName && orderSellerName && currentName === orderSellerName) {
      return true;
    }

    const orderSellerEmail = route.params?.order?.sellerEmail;
    if (currentEmail && orderSellerEmail && currentEmail === orderSellerEmail) {
      return true;
    }

    return false;
  }, [routeIsSeller, user, sellerName, route.params]);

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const {
    disputeType,
    setDisputeType,
    reasons,
    selectedReasons,
    toggleReason,
    evidenceList,
    addEvidenceFromPicker,
    removeEvidence,
    description,
    setDescription,
    handleSubmit,
  } = useDispute(handleBack, orderId, productTitle, sellerName, isCod);

  // 1. Nếu Seller mở đơn chưa có khiếu nại -> Không hiển thị form tạo khiếu nại
  if (isSeller && !passedDispute) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
        <DisputeHeader onGoBack={handleBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="shield-checkmark" size={32} color="#2563EB" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
            Đơn hàng không có khiếu nại
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            Bạn là Người bán của đơn hàng này. Chỉ Người mua mới có quyền tạo yêu cầu khiếu nại & trả hàng trong thời gian bao test 24h.
          </Text>
          <TouchableOpacity
            style={[styles.backToListBtn, { alignSelf: 'stretch' }]}
            activeOpacity={0.85}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.backToListBtnText}>Quay lại danh sách đơn hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 2. Chặn Người mua mở form tạo khiếu nại nếu đơn hàng đã bị HỦY (không qua dispute)
  if (order?.status === 'CANCELLED' && !passedDispute) {
    const isShipper = order?.cancelledBy === 'SHIPPER';
    const isSellerCancel = order?.cancelledBy === 'SELLER';
    const isSystem = order?.cancelledBy === 'SYSTEM';

    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
        <DisputeHeader onGoBack={handleBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isShipper ? '#FFFBEB' : '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: isShipper ? '#FDE68A' : '#E2E8F0' }}>
            <Ionicons name={isShipper ? 'bus-outline' : 'close-circle-outline'} size={32} color={isShipper ? '#D97706' : '#64748B'} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
            {isShipper
              ? 'Đơn hàng đã được đơn vị vận chuyển hủy giao'
              : isSellerCancel
              ? 'Người bán đã từ chối nhận đơn'
              : isSystem
              ? 'Đơn hàng tự động hủy do quá hạn thanh toán'
              : 'Đơn hàng đã hủy'}
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            {isShipper
              ? `Đơn vị vận chuyển (${order?.shippingPartner || 'GHN'}) đã hủy giao / hoàn trả kiện hàng. Tiền cọc Escrow (nếu có) và Xu đã được hoàn trả đầy đủ về ví. Đơn hàng không còn hiệu lực để mở khiếu nại.`
              : isSellerCancel
              ? 'Người bán đã từ chối tiếp nhận đơn / lịch hẹn này. Tiền cọc Escrow (nếu có) và Xu đã hoàn lại 100%. Không thể tạo khiếu nại cho đơn đã hủy.'
              : 'Đơn hàng này đã dừng xử lý và hủy thành công trước khi giao nhận nên không phát sinh khiếu nại trả hàng.'}
          </Text>
          <TouchableOpacity
            style={[styles.backToListBtn, { alignSelf: 'stretch' }]}
            activeOpacity={0.85}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.backToListBtnText}>Quay lại danh sách đơn hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Chặn Người mua mở form khiếu nại nếu đơn hàng chưa giao đến nơi (PENDING / SHIPPING / SAFEPOINT)
  if (order && !['DELIVERED', 'COMPLETED', 'DISPUTED'].includes(order.status) && !passedDispute) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
        <DisputeHeader onGoBack={handleBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="time-outline" size={32} color="#EA580C" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
            Chưa thể mở khiếu nại trả hàng
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            Bạn chỉ có thể tạo yêu cầu Khiếu nại & Trả hàng sau khi đã nhận được sản phẩm tại điểm hẹn Safe-Point hoặc từ shipper (trong thời hạn bao test 48h).
          </Text>
          <TouchableOpacity
            style={[styles.backToListBtn, { alignSelf: 'stretch' }]}
            activeOpacity={0.85}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.backToListBtnText}>Quay lại danh sách đơn hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Nếu đơn hàng ĐÃ CÓ khiếu nại (như Ảnh 4 & Ảnh 5), hiển thị màn hình Hồ Sơ Khiếu Nại chi tiết!
  if (passedDispute) {
    const isRejected = passedDispute.status === 'REJECTED';
    const isRefunded = passedDispute.status === 'REFUNDED' || passedDispute.status === 'RESOLVED';
    const isPending = passedDispute.status === 'PENDING';

    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
        <DisputeHeader onGoBack={handleBack} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* 1. Header Card Hồ Sơ Khiếu Nại */}
          <View style={styles.detailHeaderCard}>
            <View style={styles.detailHeaderTopRow}>
              <View style={styles.detailIconBox}>
                <Ionicons name="document-text" size={22} color="#EA580C" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.detailMainTitle}>
                  {isSeller ? 'Hồ sơ Thẩm tra Khiếu nại (Chế độ Người bán)' : 'Hồ sơ Khiếu nại & Yêu cầu Trả hàng'}
                </Text>
                <Text style={styles.detailSubInfo} numberOfLines={1}>
                  Mã hồ sơ: {passedDispute.id || 'DSP-RECORD'} • {passedDispute.createdAt || 'Gần đây'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.detailStatusBadge,
                isRefunded
                  ? styles.statusBadgeRefunded
                  : isRejected
                  ? styles.statusBadgeRejected
                  : styles.statusBadgePending,
              ]}
            >
              <Ionicons
                name={isRefunded ? 'checkmark-circle' : isRejected ? 'close-circle' : 'time'}
                size={14}
                color={isRefunded ? '#059669' : isRejected ? '#DC2626' : '#D97706'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.detailStatusBadgeText,
                  isRefunded
                    ? styles.statusTextRefunded
                    : isRejected
                    ? styles.statusTextRejected
                    : styles.statusTextPending,
                ]}
              >
                {isRefunded
                  ? '✓ ĐÃ CHẤP THUẬN HOÀN TIỀN'
                  : isRejected
                  ? '✕ KHIẾU NẠI BỊ TỪ CHỐI'
                  : '⏳ ĐANG CHỜ BQT & NGƯỜI BÁN XỬ LÝ'}
              </Text>
            </View>

            {isSeller && (
              <View style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, padding: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 11, color: '#92400E', lineHeight: 16 }}>
                  🔒 <Text style={{ fontWeight: '700' }}>Chế độ Người bán (Chỉ xem):</Text> Bạn chỉ theo dõi tiến trình và phán quyết từ BQT Campus. Người bán không có quyền chỉnh sửa hay rút đơn khiếu nại.
                </Text>
              </View>
            )}
          </View>

          {/* 2. Thẻ Thông Tin Sản Phẩm */}
          {productTitle && (
            <View style={styles.detailProductCard}>
              <Text style={styles.detailSectionLabel}>ĐƠN HÀNG KHIẾU NẠI:</Text>
              <Text style={styles.detailProductTitle} numberOfLines={2}>
                {productTitle}
              </Text>
              <View style={styles.detailProductMeta}>
                {sellerName && <Text style={styles.detailSellerText}>Người bán: {sellerName}</Text>}
                {price && <Text style={styles.detailPriceText}>{price}</Text>}
              </View>
            </View>
          )}

          {/* 3. Chi Tiết Khiếu Nại */}
          <View style={styles.detailContentCard}>
            <View style={styles.detailItemBox}>
              <Text style={styles.detailItemLabel}>Lý do yêu cầu trả hàng:</Text>
              <Text style={styles.detailItemValueBold}>
                {passedDispute.reason || 'Hàng lỗi kỹ thuật/hỏng hóc khi test'}
              </Text>
            </View>

            <View style={styles.detailItemBox}>
              <Text style={styles.detailItemLabel}>Mô tả tình trạng chi tiết:</Text>
              <Text style={styles.detailItemValue}>
                {passedDispute.details ||
                  passedDispute.reason ||
                  'Người mua đã phản ánh món hàng không hoạt động đúng cam kết và yêu cầu hoàn trả tiền bảo hộ Escrow.'}
              </Text>
            </View>

            <View style={styles.detailVideoBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <Ionicons name="videocam" size={16} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.detailVideoText} numberOfLines={1}>
                  Video bằng chứng: video-unbox-test.mp4
                </Text>
              </View>
              <View style={styles.detailVideoUploadedBadge}>
                <Text style={styles.detailVideoUploadedText}>Đã tải lên</Text>
              </View>
            </View>

            {/* Ghi chú từ Ban Quản Trị (Nổi bật màu vàng cam nhạt như Ảnh 5) */}
            {passedDispute.adminNote && (
              <View style={styles.adminNoteBox}>
                <View style={styles.adminNoteHeader}>
                  <Ionicons name="shield-checkmark" size={15} color="#B45309" style={{ marginRight: 4 }} />
                  <Text style={styles.adminNoteTitle}>Ghi chú từ Ban Quản Trị:</Text>
                </View>
                <Text style={styles.adminNoteText}>{passedDispute.adminNote}</Text>
              </View>
            )}
          </View>

          {/* 4. Các kịch bản xử lý */}
          <View style={styles.scenarioCard}>
            <Text style={styles.scenarioCardHeader}>
              {isSeller ? 'QUY TRÌNH BẢO VỆ QUYỀN LỢI NGƯỜI BÁN' : 'CÁC KỊCH BẢN XỬ LÝ KHIẾU NẠI & QUYỀN LỢI CỦA BẠN'}
            </Text>

            <View style={styles.scenarioItemGreen}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="checkmark-circle" size={15} color="#059669" style={{ marginRight: 4 }} />
                <Text style={styles.scenarioTitleGreen}>
                  {isSeller ? 'Khi BQT Bác bỏ khiếu nại' : 'Khi BQT duyệt thành công'}
                </Text>
              </View>
              <Text style={styles.scenarioTextGreen}>
                {isSeller
                  ? 'Nếu bằng chứng không thuyết phục hoặc lỗi do người mua tự gây ra, BQT sẽ bác đơn và tiến hành giải ngân 100% tiền đơn hàng vào ví của bạn.'
                  : 'Bạn sẽ nhận mã gửi trả hàng miễn phí tại Safe-Point CLB IT hoặc GHN Campus. Sau khi bưu cục nhận đồ, 100% tiền Escrow và Xu giảm giá sẽ được hoàn trả tự động vào ví của bạn.'}
              </Text>
            </View>

            <View style={styles.scenarioItemAmber}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Ionicons name="alert-circle" size={15} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={styles.scenarioTitleAmber}>
                  {isSeller ? 'Khi BQT Duyệt trả hàng' : 'Khi BQT từ chối khiếu nại'}
                </Text>
              </View>
              <Text style={styles.scenarioTextAmber}>
                {isSeller
                  ? 'Người mua phải gửi trả hàng nguyên vẹn về Safe-Point của bạn trước khi được hoàn tiền. Bạn được quyền kiểm tra hàng khi nhận lại.'
                  : 'Nếu bằng chứng không hợp lệ hoặc món đồ lỗi do người dùng tự làm hỏng, BQT sẽ gửi văn bản giải thích chi tiết và tiến hành giải ngân tiền cho Người bán.'}
              </Text>
            </View>
          </View>

          {/* 5. Nút Quay Lại */}
          <View style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 20 }}>
            <TouchableOpacity
              style={styles.backToListBtn}
              activeOpacity={0.85}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.backToListBtnText}>Quay lại danh sách đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <DisputeHeader onGoBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (insets.top > 0 ? insets.top : 20) : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {orderId && (
            <View style={styles.orderContextCard}>
              <View style={styles.orderCodeRow}>
                <Ionicons name="shield-checkmark" size={15} color="#DC2626" />
                <Text style={styles.orderCodeText}>Đơn #{orderId} • Escrow bảo hộ</Text>
              </View>
              {productTitle && (
                <Text style={styles.orderProductTitle} numberOfLines={1}>
                  {productTitle}
                </Text>
              )}
              <View style={styles.orderMetaRow}>
                {sellerName && <Text style={styles.orderMetaText}>Người bán: {sellerName}</Text>}
                {price && <Text style={styles.orderPriceText}>{price}</Text>}
              </View>
            </View>
          )}

          <DisputeTypeSelector selectedType={disputeType} onSelect={setDisputeType} />
          <DisputeReasonSection
            reasons={reasons}
            selectedReasons={selectedReasons}
            onToggleReason={toggleReason}
            description={description}
            onChangeDescription={setDescription}
          />
          <DisputeEvidenceSection
            evidenceList={evidenceList}
            onRemoveEvidence={removeEvidence}
            onAddEvidence={addEvidenceFromPicker}
          />
        </ScrollView>

        <DisputeSubmitBar onSubmit={handleSubmit} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  orderContextCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  orderCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderCodeText: { fontSize: 12, fontWeight: '800', color: '#DC2626' },
  orderProductTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  orderMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  orderMetaText: { fontSize: 11, color: '#64748B' },
  orderPriceText: { fontSize: 12.5, fontWeight: '900', color: '#DC2626' },

  // Dispute Detail styles
  detailHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailMainTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailSubInfo: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
  },
  statusBadgeRefunded: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  detailStatusBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  statusTextRefunded: {
    color: '#059669',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  statusTextPending: {
    color: '#D97706',
  },
  detailProductCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailProductTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailProductMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailSellerText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  detailPriceText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  detailContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  detailItemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  detailItemValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailItemValue: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  detailVideoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  detailVideoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3730A3',
    flexShrink: 1,
  },
  detailVideoUploadedBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
    flexShrink: 0,
  },
  detailVideoUploadedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4338CA',
  },
  adminNoteBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  adminNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminNoteTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#B45309',
  },
  adminNoteText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scenarioCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  scenarioItemGreen: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 8,
  },
  scenarioTitleGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  scenarioTextGreen: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  scenarioItemAmber: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  scenarioTitleAmber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  scenarioTextAmber: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  backToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
  },
  backToListBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default DisputeScreen;
