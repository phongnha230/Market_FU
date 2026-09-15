import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isMeilisearchReady,
  syncProductToMeili,
  deleteProductFromMeili,
  searchProductsMeili,
} from '../../src/config/meilisearch';

describe('Unit Test: Meilisearch Config & Safe Search Fallback', () => {
  it('isMeilisearchReady() phải trả về giá trị kiểu boolean', () => {
    const ready = isMeilisearchReady();
    assert.strictEqual(typeof ready, 'boolean');
  });

  it('syncProductToMeili() phải an toàn khi Meilisearch offline, không ném exception', async () => {
    await assert.doesNotReject(async () => {
      await syncProductToMeili({
        id: 'mock_product_123',
        title: 'Nồi cơm điện Cuckoo',
        description: 'Dùng tốt cho phòng trọ',
        price: 250000,
        condition: 'USED_GOOD',
        quantity: 1,
        campus: 'HOL',
        categoryType: 'DORM_ITEM',
        status: 'AVAILABLE',
        createdAt: new Date(),
      });
    });
  });

  it('deleteProductFromMeili() phải an toàn khi Meilisearch offline, không ném exception', async () => {
    await assert.doesNotReject(async () => {
      await deleteProductFromMeili('mock_product_123');
    });
  });

  it('searchProductsMeili() khi offline phải trả về null an toàn để kích hoạt MongoDB Fallback', async () => {
    const result = await searchProductsMeili('noi com dien', {
      campus: 'HOL',
      minPrice: 100000,
      maxPrice: 500000,
    });
    // Khi offline, hàm luôn trả về null an toàn để service fallback sang MongoDB
    assert.strictEqual(result, null);
  });
});
