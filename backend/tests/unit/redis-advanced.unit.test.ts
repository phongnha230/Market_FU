import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  acquireLock,
  releaseLock,
  withLock,
  zIncrBy,
  zRevRangeWithScores,
  zScore,
  geoAdd,
  geoSearchRadius,
  setBit,
  getBit,
  bitCount,
  publishEvent,
  subscribeEvent,
} from '../../src/config/redis';

describe('Unit Test: Redis Advanced Capabilities', () => {
  describe('1. Distributed Lock (SET NX PX / Lua release)', () => {
    it('Thu thập lock thành công và chặn các request đồng thời khác', async () => {
      const resource = `test:product:${Date.now()}`;
      const lock1 = await acquireLock(resource, 2000);
      assert.ok(lock1, 'Request 1 phải lấy được lock');
      assert.ok(lock1.lockId, 'Lock phải có lockId');

      // Request thứ 2 cùng thời điểm phải bị chặn (trả về null)
      const lock2 = await acquireLock(resource, 2000);
      assert.equal(lock2, null, 'Request 2 cùng thời điểm phải bị từ chối');

      // Giải phóng lock 1
      const released = await releaseLock(lock1);
      assert.equal(released, true, 'Phải giải phóng lock thành công');

      // Sau khi giải phóng, request tiếp theo có thể lấy lại
      const lock3 = await acquireLock(resource, 2000);
      assert.ok(lock3, 'Request 3 phải lấy được lock sau khi lock 1 đã nhả');
      await releaseLock(lock3);
    });

    it('Không thể giải phóng lock bằng lockId không khớp', async () => {
      const resource = `test:product:fake:${Date.now()}`;
      const lock = await acquireLock(resource, 2000);
      assert.ok(lock);

      const fakeLock = { key: lock.key, lockId: 'fake-lock-id-999' };
      const released = await releaseLock(fakeLock);
      assert.equal(released, false, 'Không được phép giải phóng lock của người khác');

      await releaseLock(lock);
    });

    it('withLock tự động thu thập và giải phóng lock', async () => {
      const resource = `test:withlock:${Date.now()}`;
      let executed = false;

      const result = await withLock(resource, 2000, async () => {
        executed = true;
        return 'success';
      });

      assert.equal(result, 'success');
      assert.equal(executed, true);

      // Lock phải đã được giải phóng
      const lockAfter = await acquireLock(resource, 1000);
      assert.ok(lockAfter, 'Lock phải được giải phóng tự động sau khi hoàn tất');
      await releaseLock(lockAfter);
    });
  });

  describe('2. Sorted Sets (ZSET) - Trending & Leaderboard', () => {
    it('zIncrBy và zRevRangeWithScores xếp hạng chính xác theo điểm số', async () => {
      const setKey = `test:zset:${Date.now()}`;

      await zIncrBy(setKey, 'casio_580', 5);
      await zIncrBy(setKey, 'giao_trinh_c', 12);
      await zIncrBy(setKey, 'ao_polo_fpt', 8);

      const top2 = await zRevRangeWithScores(setKey, 0, 1);
      assert.equal(top2.length, 2);
      assert.equal(top2[0].member, 'giao_trinh_c');
      assert.equal(top2[0].score, 12);
      assert.equal(top2[1].member, 'ao_polo_fpt');
      assert.equal(top2[1].score, 8);

      const score = await zScore(setKey, 'casio_580');
      assert.equal(score, 5);
    });
  });

  describe('3. Geospatial (GEO) - Tìm trạm & vị trí gần nhất', () => {
    it('geoAdd và geoSearchRadius tính toán cự ly và lọc theo bán kính', async () => {
      const geoKey = `test:geo:${Date.now()}`;

      // Tòa Alpha ĐH FPT Hòa Lạc: 105.5262, 21.0135
      await geoAdd(geoKey, 105.5262, 21.0135, 'Toa_Alpha');
      // Thư viện Gamma (cách ~150m): 105.5270, 21.0142
      await geoAdd(geoKey, 105.527, 21.0142, 'Thu_Vien_Gamma');
      // KTX Dom A (cách ~300m): 105.5285, 21.012
      await geoAdd(geoKey, 105.5285, 21.012, 'Dom_A');
      // Điểm rất xa (Hồ Gươm Hà Nội): 105.8522, 21.0285 (~30km)
      await geoAdd(geoKey, 105.8522, 21.0285, 'Ho_Guom');

      // Tìm kiếm trong bán kính 1km quanh Tòa Alpha
      const nearby = await geoSearchRadius(geoKey, 105.5262, 21.0135, 1.0);

      // Phải tìm thấy 3 điểm trong campus FPT Hòa Lạc, loại bỏ Hồ Gươm
      assert.ok(nearby.length >= 3, 'Phải tìm thấy các điểm trong bán kính 1km');
      const members = nearby.map((n) => n.member);
      assert.ok(members.includes('Toa_Alpha'));
      assert.ok(members.includes('Thu_Vien_Gamma'));
      assert.ok(members.includes('Dom_A'));
      assert.equal(members.includes('Ho_Guom'), false, 'Hồ Gươm > 30km không được xuất hiện');

      // Điểm gần nhất phải là chính nó (Toa_Alpha có cự ly ~0 km)
      assert.equal(nearby[0].member, 'Toa_Alpha');
      assert.ok(nearby[0].distanceKm < 0.05);
    });
  });

  describe('4. Bitmaps - Điểm danh Daily Check-In', () => {
    it('setBit, getBit, bitCount ghi nhận và đếm ngày điểm danh chính xác', async () => {
      const bitmapKey = `test:bitmap:${Date.now()}`;

      // Ban đầu chưa điểm danh ngày nào
      const initialCount = await bitCount(bitmapKey);
      assert.equal(initialCount, 0);

      // Điểm danh ngày 1, ngày 5, ngày 15
      await setBit(bitmapKey, 1, 1);
      await setBit(bitmapKey, 5, 1);
      await setBit(bitmapKey, 15, 1);

      // Kiểm tra getBit
      const day1 = await getBit(bitmapKey, 1);
      const day5 = await getBit(bitmapKey, 5);
      const day2 = await getBit(bitmapKey, 2); // Chưa điểm danh
      assert.equal(day1, 1);
      assert.equal(day5, 1);
      assert.equal(day2, 0);

      // Đếm tổng số ngày đã điểm danh
      const totalDays = await bitCount(bitmapKey);
      assert.equal(totalDays, 3);
    });
  });

  describe('5. Pub/Sub Event Bus - Real-time Messaging', () => {
    it('publishEvent và subscribeEvent phát và nhận sự kiện chính xác', async () => {
      const channel = `test:channel:${Date.now()}`;
      let receivedData: any = null;

      const unsubscribe = subscribeEvent(channel, (payload) => {
        receivedData = payload;
      });

      await publishEvent(channel, { orderCode: 'ORD-999', amount: 50000 });

      assert.ok(receivedData, 'Subscriber phải nhận được payload');
      assert.equal(receivedData.orderCode, 'ORD-999');
      assert.equal(receivedData.amount, 50000);

      unsubscribe();
    });
  });
});
