import React from 'react';
import { QrScannerHandshakeModal } from './QrScannerHandshakeModal';
import { PackageHandoverProofModal } from './PackageHandoverProofModal';
import { OrderCancelModal } from './OrderCancelModal';
import { WithdrawDisputeModal } from './WithdrawDisputeModal';

export interface OrderDetailModalsProps {
  orderId: string;
  matchedOrder?: any;
  product: {
    title: string;
    price?: number;
    image?: any;
  };
  safePoint: string;
  isSeller: boolean;
  showScannerModal: boolean;
  showProofModal: boolean;
  showCancelModal: boolean;
  showWithdrawDisputeModal: boolean;
  onCloseScanner: () => void;
  onCloseProof: () => void;
  onCloseCancel: () => void;
  onCloseWithdrawDispute: () => void;
  onScannerSuccess: () => void;
  onCancelSuccess: (reason: string) => void;
  onWithdrawDisputeSuccess: () => void;
  onReportDispute: () => void;
}

export const OrderDetailModals: React.FC<OrderDetailModalsProps> = React.memo(({
  orderId,
  matchedOrder,
  product,
  safePoint,
  isSeller,
  showScannerModal,
  showProofModal,
  showCancelModal,
  showWithdrawDisputeModal,
  onCloseScanner,
  onCloseProof,
  onCloseCancel,
  onCloseWithdrawDispute,
  onScannerSuccess,
  onCancelSuccess,
  onWithdrawDisputeSuccess,
  onReportDispute,
}) => {
  return (
    <>
      <QrScannerHandshakeModal
        visible={showScannerModal}
        onClose={onCloseScanner}
        orderId={orderId}
        expectedOtp={matchedOrder?.handshakeOtp || '738192'}
        onSuccess={onScannerSuccess}
      />

      <PackageHandoverProofModal
        visible={showProofModal}
        onClose={onCloseProof}
        sealCode="FPT-88921"
        productTitle={product.title}
        productImage={product.image}
        safePointName={safePoint}
        handoffTime="10:15 - Hôm nay"
        onReportDispute={onReportDispute}
      />

      <OrderCancelModal
        visible={showCancelModal}
        onClose={onCloseCancel}
        orderId={orderId}
        orderCode={matchedOrder?.orderNumber}
        productTitle={product.title}
        totalAmount={product.price || 0}
        coinsUsed={0}
        isSellerViewer={Boolean(isSeller)}
        onSuccess={onCancelSuccess}
      />

      <WithdrawDisputeModal
        visible={showWithdrawDisputeModal}
        onClose={onCloseWithdrawDispute}
        orderId={orderId}
        orderCode={matchedOrder?.orderNumber}
        onSuccess={onWithdrawDisputeSuccess}
      />
    </>
  );
});

OrderDetailModals.displayName = 'OrderDetailModals';
