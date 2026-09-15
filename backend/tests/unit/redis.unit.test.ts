import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getCache, setCache, delCache, delCachePattern, isRedisReady, redis } from '../../src/config/redis';

describe('Unit Test: Redis Config & Safe Cache Fallback', () => {
  it('isRedisReady() phải trả về giá trị kiểu boolean', () => {
    const ready = isRedisReady();
    assert.strictEqual(typeof ready, 'boolean');
  });

  it('getCache() khi Redis offline phải trả về null an toàn, không ném exception', async () => {
    const result = await getCache<any>('non_existent_key_9999');
    // Khi Redis offline hoặc key không tồn tại, hàm luôn trả về null an toàn
    assert.strictEqual(result, null);
  });

  it('setCache() phải xử lý an toàn (hoạt động không gây lỗi unhandled rejection)', async () => {
    await assert.doesNotReject(async () => {
      await setCache('test:unit:key', { message: 'Hello Redis', count: 123 }, 60);
    });
  });

  it('delCache() và delCachePattern() phải hoàn tất an toàn không gây lỗi', async () => {
    await assert.doesNotReject(async () => {
      await delCache('test:unit:key');
      await delCache(['test:unit:key1', 'test:unit:key2']);
      await delCachePattern('test:unit:*');
    });
  });
});
