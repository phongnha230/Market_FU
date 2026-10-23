import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { orderService } from '../../src/modules/orders/order.service';
import {
  runExpirePendingOrdersJob,
  startExpirePendingOrdersCron,
} from '../../src/cron/expire-pending-orders.cron';
import { cancelOrderSchema } from '../../src/modules/orders/order.dto';

describe('Unit Test: Auto-Cancel Expired Pending Orders & Cron', () => {
  it('orderService: Có phương thức cancelExpiredPendingOrders để hủy đơn quá hạn', () => {
    assert.strictEqual(typeof orderService.cancelExpiredPendingOrders, 'function');
  });

  it('cron: runExpirePendingOrdersJob và startExpirePendingOrdersCron được định nghĩa chuẩn xác', () => {
    assert.strictEqual(typeof runExpirePendingOrdersJob, 'function');
    assert.strictEqual(typeof startExpirePendingOrdersCron, 'function');
  });

  it('cancelOrderSchema: Hợp lệ với lý do hủy hợp lệ', () => {
    const valid = cancelOrderSchema.safeParse({
      reason: 'Người mua hủy giao dịch trên PayOS',
    });
    assert.strictEqual(valid.success, true);
  });

  it('cancelOrderSchema: Hợp lệ khi không truyền reason (optional)', () => {
    const parsed = cancelOrderSchema.safeParse({});
    assert.strictEqual(parsed.success, true);
  });

  it('Cutoff calculation: Đơn tạo cách đây 16 phút phải cũ hơn cutoff 15 phút', () => {
    const ttlMinutes = 15;
    const now = Date.now();
    const cutoffTime = new Date(now - ttlMinutes * 60 * 1000);

    const orderCreated16MinAgo = new Date(now - 16 * 60 * 1000);
    const orderCreated5MinAgo = new Date(now - 5 * 60 * 1000);

    assert.strictEqual(orderCreated16MinAgo.getTime() < cutoffTime.getTime(), true);
    assert.strictEqual(orderCreated5MinAgo.getTime() < cutoffTime.getTime(), false);
  });
});
