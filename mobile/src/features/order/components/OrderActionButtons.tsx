import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CancelledBannerProps {}

const CancelledBanner: React.FC<CancelledBannerProps> = React.memo(() => (
  <View style={styles.cancelledBanner}>
    <Ionicons name="close-circle" size={24} color="#64748B" />
    <View style={styles.cancelledTextWrap}>
      <Text style={styles.cancelledTitle}>Đơn hàng đã được hủy</Text>
      <Text style={styles.cancelledSub}>
        Giao dịch đã kết thúc an toàn. Tiền cọc Escrow (nếu có) đã được hoàn trả về ví Campus của bạn.
      </Text>
    </View>
  </View>
));
CancelledBanner.displayName = 'CancelledBanner';

interface DisputedBannerProps {
  isSeller?: boolean;
  onOpenDisputeDetail?: () => void;
  onWithdrawDispute?: () => void;
}

const DisputedBanner: React.FC<DisputedBannerProps> = React.memo(({ isSeller, onOpenDisputeDetail, onWithdrawDispute }) => (
  <View style={styles.disputedBanner}>
    <View style={styles.disputedHeader}>
      <Ionicons name="warning" size={20} color="#D97706" />
      <Text style={styles.disputedTitle}>
        {isSeller ? 'Đơn bán đang có khiếu nại đổi trả' : 'Đơn hàng đang có khiếu nại'}
      </Text>
    </View>
    <Text style={styles.disputedSub}>
      {isSeller
        ? 'Người mua đã gửi yêu cầu khiếu nại và đổi trả. Tiền Escrow tạm khóa bảo hộ. Bạn có thể bấm xem chi tiết phiếu khiếu nại và video bằng chứng để cùng đối soát.'
        : 'BQT đang thẩm tra bằng chứng giao nhận. Nếu bạn và đối tác đã tự thương lượng xong, bạn có thể tự rút đơn khiếu nại bên dưới.'}
    </Text>
    {isSeller && onOpenDisputeDetail && (
      <TouchableOpacity
        style={[styles.withdrawDisputeBtn, { backgroundColor: '#DC2626', marginTop: 10 }]}
        activeOpacity={0.85}
        onPress={onOpenDisputeDetail}
      >
        <Ionicons name="document-text-outline" size={17} color="#FFFFFF" style={styles.mr6} />
        <Text style={styles.withdrawDisputeBtnText}>Xem Chi Tiết Phiếu Khiếu Nại</Text>
      </TouchableOpacity>
    )}
    {!isSeller && (
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {onOpenDisputeDetail && (
          <TouchableOpacity
            style={[styles.withdrawDisputeBtn, { backgroundColor: '#DC2626', flex: 1, marginTop: 0 }]}
            activeOpacity={0.85}
            onPress={onOpenDisputeDetail}
          >
            <Ionicons name="document-text-outline" size={17} color="#FFFFFF" style={styles.mr6} />
            <Text style={styles.withdrawDisputeBtnText}>Xem Chi Tiết</Text>
          </TouchableOpacity>
        )}
        {onWithdrawDispute && (
          <TouchableOpacity
            style={[styles.withdrawDisputeBtn, { flex: 1, marginTop: 0 }]}
            activeOpacity={0.85}
            onPress={onWithdrawDispute}
          >
            <Ionicons name="refresh-circle" size={17} color="#FFFFFF" style={styles.mr6} />
            <Text style={styles.withdrawDisputeBtnText}>Rút Đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
));
DisputedBanner.displayName = 'DisputedBanner';

interface PrimaryActionButtonProps {
  orderStatus: string;
  isSeller: boolean;
  isInterCampus?: boolean;
  isReviewed: boolean;
  isSubmitting: boolean;
  isDisputed: boolean;
  onOpenShipModal?: () => void;
  onConfirmOrder?: () => void;
  onConfirmReceived: () => void;
  onOpenScanner: () => void;
  onOpenReview: () => void;
  onOpenReviewDetail?: () => void;
  onCancelOrder?: () => void;
}

const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = React.memo(({
  orderStatus,
  isSeller,
  isInterCampus,
  isReviewed,
  isSubmitting,
  isDisputed,
  onOpenShipModal,
  onConfirmOrder,
  onConfirmReceived,
  onOpenScanner,
  onOpenReview,
  onOpenReviewDetail,
  onCancelOrder,
}) => {
  const isPending = orderStatus === 'pending' || orderStatus === 'PENDING_SAFEPOINT';

  // 1. Seller flow
  if (isSeller && orderStatus !== 'completed' && orderStatus !== 'cancelled' && !isDisputed) {
    // When pending seller confirmation:
    if (isPending) {
      if (isInterCampus) {
        return (
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.confirmReceivedBtn, { backgroundColor: '#EA580C' }]}
              activeOpacity={0.88}
              onPress={onOpenShipModal || onConfirmOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="bus-outline" size={20} color="#FFFFFF" style={styles.mr6} />
                  <Text style={styles.confirmReceivedText}>
                    Bàn giao bưu cục GHN (Tạo mã vận đơn)
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {onCancelOrder && (
              <TouchableOpacity
                style={[styles.confirmReceivedBtn, { backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3' }]}
                activeOpacity={0.88}
                onPress={onCancelOrder}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle-outline" size={20} color="#E11D48" style={styles.mr6} />
                <Text style={[styles.confirmReceivedText, { color: '#E11D48', fontWeight: '700' }]}>
                  Từ chối đơn (Hoàn cọc 100% cho khách)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }

      return (
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            style={[styles.confirmReceivedBtn, { backgroundColor: '#059669' }]}
            activeOpacity={0.88}
            onPress={onConfirmOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.mr6} />
                <Text style={styles.confirmReceivedText}>
                  Đồng ý đơn & Chốt lịch hẹn
                </Text>
              </>
            )}
          </TouchableOpacity>

          {onCancelOrder && (
            <TouchableOpacity
              style={[styles.confirmReceivedBtn, { backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FECDD3' }]}
              activeOpacity={0.88}
              onPress={onCancelOrder}
              disabled={isSubmitting}
            >
              <Ionicons name="close-circle-outline" size={20} color="#E11D48" style={styles.mr6} />
              <Text style={[styles.confirmReceivedText, { color: '#E11D48', fontWeight: '700' }]}>
                Từ chối đơn (Hoàn cọc 100% cho khách)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (isInterCampus) {
      if (orderStatus === 'shipping' || orderStatus === 'SHIPPING' || orderStatus === 'HANDOVER_CONFIRMED') {
        return (
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              style={[styles.confirmReceivedBtn, { backgroundColor: '#EA580C' }]}
              activeOpacity={0.88}
              onPress={onOpenShipModal}
              disabled={isSubmitting}
            >
              <Ionicons name="bus-outline" size={20} color="#FFFFFF" style={styles.mr6} />
              <Text style={styles.confirmReceivedText}>Sửa mã vận đơn / Hãng vận chuyển</Text>
            </TouchableOpacity>
            <View style={[styles.confirmReceivedBtn, { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' }]}>
              <Ionicons name="cube-outline" size={20} color="#2563EB" style={styles.mr6} />
              <Text style={[styles.confirmReceivedText, { color: '#1E40AF', fontSize: 13 }]}>
                Kiện hàng đang được bưu cục luân chuyển
              </Text>
            </View>
          </View>
        );
      }
      if (orderStatus === 'delivered' || orderStatus === 'DELIVERED') {
        return (
          <View style={[styles.confirmReceivedBtn, { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#059669" style={styles.mr6} />
            <Text style={[styles.confirmReceivedText, { color: '#065F46', fontSize: 13 }]}>
              Đã phát tới KTX • Người mua đang trong 48h bao test
            </Text>
          </View>
        );
      }
      return (
        <View style={[styles.confirmReceivedBtn, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' }]}>
          <Ionicons name="cube-outline" size={20} color="#EA580C" style={styles.mr6} />
          <Text style={[styles.confirmReceivedText, { color: '#334155' }]}>Đơn liên campus • GHN luân chuyển & đối soát</Text>
        </View>
      );
    }

    // Already confirmed (Escrow holding) -> Seller has QR scanner
    return (
      <TouchableOpacity
        style={[styles.confirmReceivedBtn, styles.sellerBtnBg]}
        activeOpacity={0.88}
        onPress={onOpenScanner}
        disabled={isSubmitting}
      >
        <Ionicons name="scan" size={20} color="#FFFFFF" style={styles.mr6} />
        <Text style={styles.confirmReceivedText}>Quét mã QR / Nhập OTP để bàn giao hàng</Text>
      </TouchableOpacity>
    );
  }

  // 2. Buyer flow: when order is pending seller confirmation
  if (!isSeller && isPending) {
    return (
      <View style={styles.waitingSellerBanner}>
        <Ionicons name="hourglass-outline" size={22} color="#D97706" style={styles.mr6} />
        <View style={{ flex: 1 }}>
          <Text style={styles.waitingSellerTitle}>
            {isInterCampus ? 'Đang chờ người bán xác nhận gửi hàng' : 'Đang chờ người bán xác nhận hẹn gặp'}
          </Text>
          <Text style={styles.waitingSellerSub}>
            {isInterCampus
              ? 'Sau khi người bán đồng ý, kiện hàng sẽ được đóng gói và bàn giao cho đơn vị vận chuyển GHN / FPT Bus.'
              : 'Sau khi người bán đồng ý chốt giờ hẹn, mã QR nhận hàng sẽ kích hoạt tại Safe-Point.'}
          </Text>
        </View>
      </View>
    );
  }

  // 3. Buyer flow: when waiting for handover or when delivery confirmed
  if (!isSeller && (orderStatus === 'escrow_holding' || orderStatus === 'ESCROW_PAID')) {
    // Với đơn hẹn gặp Safe-Point (cùng campus), việc bàn giao do Người bán quét QR / nhập OTP xác thực tại bàn Safe-Point.
    // Người mua KHÔNG tự bấm "Đã nhận hàng" khi chưa gặp mặt đối tác!
    if (!isInterCampus) {
      return (
        <View style={styles.buyerHandoffGuideCard}>
          <Ionicons name="shield-checkmark" size={22} color="#059669" style={styles.mr6} />
          <View style={{ flex: 1 }}>
            <Text style={styles.buyerHandoffGuideTitle}>Đang bảo lãnh Escrow • Chờ bàn giao</Text>
            <Text style={styles.buyerHandoffGuideSub}>
              Hãy đến bàn Safe-Point đúng lịch hẹn để test máy. Sau khi ưng ý, hãy đưa mã QR hoặc đọc mã OTP 4 số cho người bán quét để hoàn tất bàn giao.
            </Text>
          </View>
        </View>
      );
    }

    // Với đơn liên campus đang vận chuyển, hiển thị trạng thái vận chuyển
    return (
      <View style={[styles.confirmReceivedBtn, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' }]}>
        <Ionicons name="cube-outline" size={20} color="#EA580C" style={styles.mr6} />
        <Text style={[styles.confirmReceivedText, { color: '#334155' }]}>Đơn liên campus • Đang vận chuyển tuyến FPT Bus</Text>
      </View>
    );
  }

  // 4. Buyer flow: khi shipper/bưu tá đã phát tới sảnh KTX (DELIVERED) hoặc đang giao (SHIPPING) mà người mua đã nhận tận tay
  const isDeliveryConfirmable =
    !isSeller &&
    (orderStatus === 'delivered' ||
      orderStatus === 'DELIVERED' ||
      orderStatus === 'shipping' ||
      orderStatus === 'SHIPPING' ||
      orderStatus === 'HANDOVER_CONFIRMED');

  if (isDeliveryConfirmable) {
    const isEarlyConfirm = orderStatus === 'shipping' || orderStatus === 'SHIPPING' || orderStatus === 'HANDOVER_CONFIRMED';
    return (
      <TouchableOpacity
        style={styles.confirmReceivedBtn}
        activeOpacity={0.88}
        onPress={onConfirmReceived}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={styles.mr6} />
            <Text style={styles.confirmReceivedText}>
              {isEarlyConfirm ? 'Đã nhận hàng tận tay (Xác nhận sớm)' : 'Đã nhận hàng (Giải ngân Escrow)'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // 5. Completed order flow
  const isCompleted = orderStatus === 'completed' || orderStatus === 'COMPLETED';
  if (isCompleted) {
    // 5a. Dành cho Người Bán: Không yêu cầu người bán tự đánh giá chính mình
    if (isSeller) {
      if (isReviewed) {
        return (
          <TouchableOpacity
            style={styles.viewReviewMainBtn}
            activeOpacity={0.88}
            onPress={onOpenReviewDetail}
          >
            <Ionicons name="star" size={17} color="#059669" style={styles.mr6} />
            <Text style={styles.viewReviewMainText}>Xem đánh giá từ người mua (★ Đã nhận đánh giá)</Text>
          </TouchableOpacity>
        );
      }
      return (
        <View style={styles.sellerCompletedBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#059669" style={styles.mr6} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sellerCompletedTitle}>Giao dịch thành công & Đã giải ngân!</Text>
            <Text style={styles.sellerCompletedSub}>
              {isInterCampus
                ? 'Người mua đã nhận hàng an toàn tại KTX/Cơ sở đích. Toàn bộ tiền bán đã được quyết toán vào số dư ví của bạn (+5 Điểm Uy Tín).'
                : 'Đã bàn giao đồ tại Safe-Point và khớp mã Handshake. Tiền bán đã được cộng vào số dư ví của bạn (+5 Điểm Uy Tín).'}
            </Text>
          </View>
        </View>
      );
    }

    // 5b. Dành cho Người Mua:
    if (!isReviewed) {
      return (
        <TouchableOpacity
          style={styles.reviewMainBtn}
          activeOpacity={0.88}
          onPress={onOpenReview}
        >
          <Ionicons name="star" size={18} color="#FFFFFF" style={styles.mr6} />
          <Text style={styles.reviewMainText}>Đánh giá người bán ngay</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.viewReviewMainBtn}
        activeOpacity={0.88}
        onPress={onOpenReviewDetail}
      >
        <Ionicons name="star" size={17} color="#059669" style={styles.mr6} />
        <Text style={styles.viewReviewMainText}>Xem lại đánh giá của bạn (★ Đã đánh giá)</Text>
      </TouchableOpacity>
    );
  }

  return null;
});
PrimaryActionButton.displayName = 'PrimaryActionButton';

interface SubActionButtonsProps {
  isSeller: boolean;
  canDispute: boolean;
  onOpenChat: () => void;
  onOpenDispute: () => void;
}

const SubActionButtons: React.FC<SubActionButtonsProps> = React.memo(({
  isSeller,
  canDispute,
  onOpenChat,
  onOpenDispute,
}) => (
  <View style={styles.subActionRow}>
    <TouchableOpacity
      style={styles.chatActionBtn}
      activeOpacity={0.8}
      onPress={onOpenChat}
    >
      <Ionicons name="chatbubble-outline" size={18} color="#0F172A" style={styles.mr4} />
      <Text style={styles.chatActionText}>{isSeller ? 'Nhắn cho người mua' : 'Nhắn tin người bán'}</Text>
    </TouchableOpacity>

    {canDispute && (
      <TouchableOpacity
        style={styles.disputeActionBtn}
        activeOpacity={0.8}
        onPress={onOpenDispute}
      >
        <Ionicons name="alert-circle-outline" size={18} color="#DC2626" style={styles.mr4} />
        <Text style={styles.disputeActionText}>Khiếu nại / Hoàn tiền</Text>
      </TouchableOpacity>
    )}
  </View>
));
SubActionButtons.displayName = 'SubActionButtons';

export interface OrderActionButtonsProps {
  onOpenShipModal?: () => void;
  onOpenDisputeDetail?: () => void;
  orderStatus: string;
  isSeller: boolean;
  isInterCampus?: boolean;
  isReviewed: boolean;
  isSubmitting: boolean;
  onConfirmOrder?: () => void;
  onConfirmReceived: () => void;
  onOpenScanner: () => void;
  onOpenReview: () => void;
  onOpenReviewDetail?: () => void;
  onOpenChat: () => void;
  onOpenDispute: () => void;
  onCancelOrder: () => void;
  onWithdrawDispute?: () => void;
}

export const OrderActionButtons: React.FC<OrderActionButtonsProps> = React.memo(({
  onOpenShipModal,
  onOpenDisputeDetail,
  orderStatus,
  isSeller,
  isInterCampus,
  isReviewed,
  isSubmitting,
  onConfirmOrder,
  onConfirmReceived,
  onOpenScanner,
  onOpenReview,
  onOpenReviewDetail,
  onOpenChat,
  onOpenDispute,
  onCancelOrder,
  onWithdrawDispute,
}) => {
  const isDisputed = orderStatus === 'disputed' || orderStatus === 'DISPUTED';
  const isCancelled = orderStatus === 'cancelled';
  const isPending = orderStatus === 'pending' || orderStatus === 'PENDING_SAFEPOINT';
  const canDispute = !isSeller && !isCancelled && !isDisputed && (orderStatus === 'delivered' || orderStatus === 'DELIVERED' || orderStatus === 'completed' || orderStatus === 'COMPLETED');
  const canCancel = !isCancelled && !isDisputed && (orderStatus === 'escrow_holding' || isPending || orderStatus === 'ESCROW_PAID') && !(isSeller && isPending);

  const cancelLabel = isSeller && isPending
    ? 'Từ chối đơn hàng'
    : isPending
    ? 'Hủy yêu cầu đặt đơn'
    : 'Hủy giao dịch';

  return (
    <View style={styles.actionContainer}>
      {isCancelled && <CancelledBanner />}

      {isDisputed && (
        <DisputedBanner isSeller={isSeller} onOpenDisputeDetail={onOpenDisputeDetail} onWithdrawDispute={onWithdrawDispute} />
      )}

      <PrimaryActionButton
        onOpenShipModal={onOpenShipModal}
        orderStatus={orderStatus}
        isSeller={isSeller}
        isInterCampus={isInterCampus}
        isReviewed={isReviewed}
        isSubmitting={isSubmitting}
        isDisputed={isDisputed}
        onConfirmOrder={onConfirmOrder}
        onConfirmReceived={onConfirmReceived}
        onOpenScanner={onOpenScanner}
        onOpenReview={onOpenReview}
        onOpenReviewDetail={onOpenReviewDetail}
        onCancelOrder={onCancelOrder}
      />

      <SubActionButtons
        isSeller={isSeller}
        canDispute={canDispute}
        onOpenChat={onOpenChat}
        onOpenDispute={onOpenDispute}
      />

      {canCancel && (
        <TouchableOpacity
          style={styles.cancelActionBtn}
          activeOpacity={0.8}
          onPress={onCancelOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#64748B" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={18} color="#64748B" style={styles.mr4} />
              <Text style={styles.cancelActionText}>{cancelLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});
OrderActionButtons.displayName = 'OrderActionButtons';

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: 20,
    gap: 10,
  },
  mr4: {
    marginRight: 4,
  },
  mr6: {
    marginRight: 6,
  },
  sellerBtnBg: {
    backgroundColor: '#EA580C',
  },
  confirmReceivedBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(5, 150, 105, 0.3)',
  },
  confirmReceivedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  waitingSellerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  waitingSellerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  waitingSellerSub: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  buyerHandoffGuideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  buyerHandoffGuideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  buyerHandoffGuideSub: {
    fontSize: 11.5,
    color: '#15803D',
    marginTop: 2,
    lineHeight: 16,
  },
  reviewMainBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  reviewMainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  viewReviewMainBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewReviewMainText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'center',
  },
  subActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chatActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  disputeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  disputeActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  cancelledTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  cancelledTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  cancelledSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  disputedBanner: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 4,
  },
  disputedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  disputedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  disputedSub: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
    marginBottom: 10,
  },
  withdrawDisputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
  },
  withdrawDisputeBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sellerCompletedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 4,
  },
  sellerCompletedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  sellerCompletedSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
});
