import { createHmac } from 'crypto';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../../src/config/prisma';
import { ENV } from '../../src/config/env';
import { AppError } from '../../src/middlewares/error.middleware';
import { paymentService, verifyPaymentWebhookSignature } from '../../src/modules/payments/payment.service';

describe('Payment webhook security', () => {
  it('rejects a missing webhook signature', () => {
    assert.throws(
      () => verifyPaymentWebhookSignature(Buffer.from('{}')),
      (error: unknown) => error instanceof AppError && error.code === 'WEBHOOK_SIGNATURE_MISSING'
    );
  });

  it('accepts only a matching HMAC signature', () => {
    const rawBody = Buffer.from('{"transferType":"in"}');
    const signature = createHmac('sha256', ENV.PAYMENT_WEBHOOK_SECRET).update(rawBody).digest('hex');
    assert.doesNotThrow(() => verifyPaymentWebhookSignature(rawBody, `sha256=${signature}`));
    assert.throws(
      () => verifyPaymentWebhookSignature(rawBody, 'sha256=invalid'),
      (error: unknown) => error instanceof AppError && error.code === 'WEBHOOK_SIGNATURE_INVALID'
    );
  });

  it('does not process a failed provider event', async () => {
    await assert.rejects(
      paymentService.processPaymentWebhook({ eventStatus: 'FAILED' }, true),
      (error: unknown) => error instanceof AppError && error.code === 'PAYMENT_EVENT_NOT_SUCCESSFUL'
    );
  });

  it('restricts payment status to the buyer or seller on the order', async () => {
    const originalFindUnique = prisma.order.findUnique;
    (prisma.order as unknown as { findUnique: (...args: unknown[]) => Promise<unknown> }).findUnique = async () => ({
      id: 'order-id',
      orderCode: 'ORD-000001-ABCD',
      buyerId: 'buyer-id',
      sellerId: 'seller-id',
      status: 'PENDING',
      payment: { isPaid: false, paidAt: null, totalAmount: 100, vietqrUrl: 'https://example.test/qr' },
      warrantyEndsAt: null,
    });
    try {
      await assert.rejects(
        paymentService.getPaymentStatus('ORD-000001-ABCD', 'other-user'),
        (error: unknown) => error instanceof AppError && error.code === 'FORBIDDEN'
      );
      const result = await paymentService.getPaymentStatus('ORD-000001-ABCD', 'buyer-id');
      assert.equal(result.orderCode, 'ORD-000001-ABCD');
    } finally {
      (prisma.order as unknown as { findUnique: unknown }).findUnique = originalFindUnique;
    }
  });
});
