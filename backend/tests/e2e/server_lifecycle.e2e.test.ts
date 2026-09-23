import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { runExpireProductsJob } from '../../src/cron/expire-products.cron';

describe('E2E Test: Server Lifecycle, Middlewares & Cron Execution', () => {
  it('Server khởi động và phản hồi /api/health đúng định dạng kèm Security Headers', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }
    const baseUrl = `http://localhost:${address.port}`;

    try {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);

      // Kiểm tra Security Headers từ Helmet
      const crossOriginPolicy = res.headers.get('cross-origin-resource-policy');
      assert.strictEqual(crossOriginPolicy, 'cross-origin');

      const body = (await res.json()) as any;
      assert.strictEqual(body.status, 'ok');
      assert.ok(body.message);
      assert.ok(body.timestamp);
    } finally {
      server.close();
    }
  });

  it('Tác vụ ngầm dọn dẹp tin đăng (runExpireProductsJob) thực thi trơn tru không lỗi', async () => {
    // Gọi hàm cron job một lần để kiểm tra query Prisma và bắt lỗi
    await assert.doesNotReject(async () => {
      await runExpireProductsJob();
    }, 'runExpireProductsJob phải thực thi không văng exception');
  });
});
