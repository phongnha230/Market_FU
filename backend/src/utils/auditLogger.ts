import { logger } from '../config/logger';
import { prisma } from '../config/prisma';

export class AuditLogger {
  private persistDb(action: string, data: {
    actor?: string;
    targetId?: string;
    targetCode?: string;
    amount?: number;
    metadata?: any;
  }) {
    setImmediate(async () => {
      try {
        await prisma.auditLog.create({
          data: {
            action,
            actor: data.actor || null,
            targetId: data.targetId || null,
            targetCode: data.targetCode || null,
            amount: data.amount !== undefined ? Math.round(data.amount) : null,
            metadata: data.metadata || null,
          },
        });
      } catch (err: any) {
        logger.warn(`⚠️ [AuditLog DB Save Warning]: ${err?.message}`);
      }
    });
  }

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
    this.persistDb('ESCROW_HOLD', {
      actor: data.buyerId,
      targetId: data.orderId,
      targetCode: data.orderCode,
      amount: data.amount,
      metadata: {
        sellerId: data.sellerId,
        coinsUsed: data.coinsUsed,
        paymentMethod: data.paymentMethod,
      },
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
    this.persistDb('ESCROW_RELEASE', {
      actor: data.releasedBy || data.sellerId,
      targetId: data.orderId,
      targetCode: data.orderCode,
      amount: data.amount,
      metadata: { reason: data.reason, sellerId: data.sellerId },
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
    this.persistDb('REFUND_BUYER', {
      actor: data.actor,
      targetId: data.orderId,
      targetCode: data.orderCode,
      amount: data.amount,
      metadata: { buyerId: data.buyerId, coinsRefunded: data.coinsRefunded, reason: data.reason },
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
    this.persistDb('HANDSHAKE_VERIFIED', {
      actor: data.buyerId,
      targetId: data.orderId,
      targetCode: data.orderCode,
      metadata: { sellerId: data.sellerId, hubCode: data.hubCode, method: data.method },
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
    payload?: any;
  }) {
    logger.audit('PAYMENT', `Webhook ${data.gateway} phản hồi cho mã đơn #${data.orderCode}`, {
      action: 'WEBHOOK_PROCESSED',
      ...data,
    });
    this.persistDb('WEBHOOK_PROCESSED', {
      actor: data.gateway,
      targetCode: data.orderCode,
      amount: data.amount,
      metadata: { transactionId: data.transactionId, isSuccess: data.isSuccess, rawCode: data.rawCode },
    });

    // Lưu chi tiết giao dịch thanh toán vào PaymentTransaction collection
    setImmediate(async () => {
      try {
        await prisma.paymentTransaction.create({
          data: {
            orderCode: data.orderCode,
            gateway: data.gateway,
            amount: Math.round(data.amount || 0),
            transactionId: data.transactionId ? String(data.transactionId) : null,
            status: data.isSuccess ? 'SUCCESS' : 'FAILED',
            rawPayload: data.payload || null,
          },
        });
      } catch (err: any) {
        logger.warn(`⚠️ [PaymentTransaction DB Save Warning]: ${err?.message}`);
      }
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
    this.persistDb(`KYC_${data.decision}`, {
      actor: data.adminId,
      targetId: data.targetUserId,
      metadata: { studentId: data.studentId, bonusCoinsAwarded: data.bonusCoinsAwarded, reason: data.reason },
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
    this.persistDb('VOUCHER_REDEEMED', {
      actor: data.userId,
      targetId: data.voucherId,
      targetCode: data.voucherCode,
      amount: data.coinsSpent,
      metadata: { coinsSpent: data.coinsSpent },
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
    this.persistDb('LOCK_COLLISION', {
      actor: data.requesterId || 'SYSTEM',
      targetCode: data.resourceKey,
      metadata: { ttlMs: data.ttlMs },
    });
  }
}

export const auditLogger = new AuditLogger();
