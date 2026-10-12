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
  onWithdrawDispute?: () => void;
}

const DisputedBanner: React.FC<DisputedBannerProps> = React.memo(({ isSeller, onWithdrawDispute }) => (
  <View style={styles.disputedBanner}>
    <View style={styles.disputedHeader}>
      <Ionicons name="warning" size={20} color="#D97706" />
      <Text style={styles.disputedTitle}>
        {isSeller ? 'Đơn bán đang có khiếu nại đổi trả' : 'Đơn hàng đang có khiếu nại'}
      </Text>
    </View>
    <Text style={styles.disputedSub}>
      {isSeller
        ? 'Người mua đã gửi yêu cầu khiếu nại và đổi trả. Tiền Escrow tạm khóa bảo hộ. Bạn có thể nhắn tin cho người mua để cùng trao đổi xử lý.'
        : 'BQT đang thẩm tra bằng chứng giao nhận. Nếu bạn và đối tác đã tự thương lượng xong, bạn có thể tự rút đơn khiếu nại bên dưới.'}
    </Text>
    {!isSeller && onWithdrawDispute && (
      <TouchableOpacity
        style={styles.withdrawDisputeBtn}
        activeOpacity={0.85}
        onPress={onWithdrawDispute}
      >
        <Ionicons name="refresh-circle" size={18} color="#FFFFFF" style={styles.mr6} />
        <Text style={styles.withdrawDisputeBtnText}>Rút Đơn Khiếu Nại (Đã Tự Thỏa Thuận)</Text>
      </TouchableOpacity>
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
  onConfirmReceived: () => void;
  onOpenScanner: () => void;
  onOpenReview: () => void;
}

const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = React.memo(({
  orderStatus,
  isSeller,
  isInterCampus,
  isReviewed,
  isSubmitting,
  isDisputed,
  onConfirmReceived,
  onOpenScanner,
  onOpenReview,
}) => {
  if (isSeller && orderStatus !== 'completed' && orderStatus !== 'cancelled' && !isDisputed) {
    if (isInterCampus) {
      return (
        <View style={[styles.confirmReceivedBtn, { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' }]}>
          <Ionicons name="cube-outline" size={20} color="#EA580C" style={styles.mr6} />
          <Text style={[styles.confirmReceivedText, { color: '#334155' }]}>Đơn liên campus • GHN luân chuyển & đối soát</Text>
        </View>
      );
    }
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

  if (!isSeller && (orderStatus === 'escrow_holding' || orderStatus === 'delivered' || orderStatus === 'DELIVERED')) {
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
            <Text style={styles.confirmReceivedText}>Đã nhận hàng (Giải ngân Escrow)</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (orderStatus === 'completed' && !isReviewed) {
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
  orderStatus: string;
  isSeller: boolean;
  isInterCampus?: boolean;
  isReviewed: boolean;
  isSubmitting: boolean;
  onConfirmReceived: () => void;
  onOpenScanner: () => void;
  onOpenReview: () => void;
  onOpenChat: () => void;
  onOpenDispute: () => void;
  onCancelOrder: () => void;
  onWithdrawDispute?: () => void;
}

export const OrderActionButtons: React.FC<OrderActionButtonsProps> = React.memo(({
  orderStatus,
  isSeller,
  isInterCampus,
  isReviewed,
  isSubmitting,
  onConfirmReceived,
  onOpenScanner,
  onOpenReview,
  onOpenChat,
  onOpenDispute,
  onCancelOrder,
  onWithdrawDispute,
}) => {
  const isDisputed = orderStatus === 'disputed' || orderStatus === 'DISPUTED';
  const isCancelled = orderStatus === 'cancelled';
  const canDispute = !isSeller && !isCancelled && !isDisputed && (orderStatus === 'delivered' || orderStatus === 'DELIVERED' || orderStatus === 'completed' || orderStatus === 'COMPLETED');
  const canCancel = !isCancelled && !isDisputed && (orderStatus === 'escrow_holding' || orderStatus === 'pending' || orderStatus === 'PENDING_SAFEPOINT' || orderStatus === 'ESCROW_PAID');

  return (
    <View style={styles.actionContainer}>
      {isCancelled && <CancelledBanner />}

      {isDisputed && (
        <DisputedBanner isSeller={isSeller} onWithdrawDispute={onWithdrawDispute} />
      )}

      <PrimaryActionButton
        orderStatus={orderStatus}
        isSeller={isSeller}
        isInterCampus={isInterCampus}
        isReviewed={isReviewed}
        isSubmitting={isSubmitting}
        isDisputed={isDisputed}
        onConfirmReceived={onConfirmReceived}
        onOpenScanner={onOpenScanner}
        onOpenReview={onOpenReview}
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
              <Text style={styles.cancelActionText}>Hủy giao dịch</Text>
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
});
