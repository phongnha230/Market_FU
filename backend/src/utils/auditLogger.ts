import { logger } from '../config/logger';

export class AuditLogger {
  /**
   * 1. Ghi nhận tiền cọc đã được giữ trong Escrow
   */
  recordEscrowHold(data: {
    orderId: string;
    orderCode: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    coinsUsed?: number;
    paymentMethod: string;
  }) {
    logger.audit('ESCROW', `Khóa tiền cọc Escrow cho đơn hàng #${data.orderCode}`, {
      action: 'ESCROW_HOLD',
      ...data,
    });
  }

  /**
   * 2. Ghi nhận giải ngân tiền Escrow cho Người bán
   */
  recordEscrowRelease(data: {
    orderId: string;
    orderCode: string;
    sellerId: string;
    amount: number;
    reason: string;
    releasedBy?: string;
  }) {
    logger.audit('ESCROW', `Giải ngân tiền bán hàng #${data.orderCode} (${data.amount.toLocaleString('vi-VN')} đ) cho người bán`, {
      action: 'ESCROW_RELEASE',
      ...data,
    });
  }

  /**
   * 3. Ghi nhận hoàn tiền cho Người mua (Khiếu nại / Hủy đơn)
   */
  recordRefund(data: {
    orderId: string;
    orderCode: string;
    buyerId: string;
    amount: number;
    coinsRefunded?: number;
    reason: string;
    actor: string;
  }) {
    logger.audit('ESCROW', `Hoàn tiền đơn hàng #${data.orderCode} cho người mua`, {
      action: 'REFUND_BUYER',
      ...data,
    });
  }

  /**
   * 4. Ghi nhận xác thực giao nhận Handshake tại Trạm Safe-Handoff
   */
  recordHandshakeVerified(data: {
    orderId: string;
    orderCode: string;
    buyerId: string;
    sellerId: string;
    hubCode?: string;
    method: 'QR_SCAN' | 'OTP_MANUAL';
  }) {
    logger.audit('HANDSHAKE', `Xác thực Handshake thành công cho đơn #${data.orderCode}`, {
      action: 'HANDSHAKE_VERIFIED',
      ...data,
    });
  }

  /**
   * 5. Ghi nhận Webhook thanh toán (PayOS / VietQR)
   */
  recordPaymentWebhook(data: {
    gateway: 'PAYOS' | 'VIETQR';
    orderCode: string;
    transactionId?: string | number;
    amount: number;
    isSuccess: boolean;
    rawCode?: string | number;
  }) {
    logger.audit('PAYMENT', `Webhook ${data.gateway} phản hồi cho mã đơn #${data.orderCode}`, {
      action: 'WEBHOOK_PROCESSED',
      ...data,
    });
  }

  /**
   * 6. Ghi nhận quyết định phê duyệt / từ chối KYC Thẻ Sinh Viên
   */
  recordKycDecision(data: {
    targetUserId: string;
    adminId: string;
    decision: 'APPROVED' | 'REJECTED';
    studentId?: string;
    bonusCoinsAwarded?: number;
    reason?: string;
  }) {
    logger.audit('KYC', `Admin [${data.adminId}] đã ${data.decision === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'} KYC cho User [${data.targetUserId}]`, {
      action: `KYC_${data.decision}`,
      ...data,
    });
  }

  /**
   * 7. Ghi nhận đổi Voucher FPT Coin
   */
  recordVoucherRedeemed(data: {
    voucherId: string;
    voucherCode: string;
    userId: string;
    coinsSpent: number;
  }) {
    logger.audit('VOUCHER', `User [${data.userId}] đã đổi Voucher [${data.voucherCode}] (-${data.coinsSpent} Xu)`, {
      action: 'VOUCHER_REDEEMED',
      ...data,
    });
  }

  /**
   * 8. Giám sát xung đột Concurrency / Distributed Lock Collision
   */
  recordLockCollision(data: {
    resourceKey: string;
    requesterId?: string;
    ttlMs: number;
  }) {
    logger.audit('CONCURRENCY', `[LOCK_COLLISION] Phát hiện 2 request tranh chấp cùng tài nguyên '${data.resourceKey}'`, {
      action: 'LOCK_COLLISION_DETECTED',
      ...data,
    });
  }
}

export const auditLogger = new AuditLogger();
