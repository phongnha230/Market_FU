import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * B3-1 Regression Test: Trước đây `router.use(undefined)` (requireAuth không tồn tại)
 * làm entire app.ts crash khi import. Test này đảm bảo app luôn boot được
 * và các router BE-DEV 3 mount đúng đường dẫn.
 */
describe('Unit Test: App Boot Smoke (B3-1 regression)', () => {
  it('import src/app.ts không throw lỗi', async () => {
    const appModule = await import('../../src/app');
    const app = appModule.default;
    assert.ok(app, 'App instance phải tồn tại');
  });

  it('mount đủ các route BE-DEV 3: /api/orders, /api/payments, /api/reviews, /api/webhooks', async () => {
    const appModule = await import('../../src/app');
    const app: any = appModule.default;
    const stack: any[] = app?._router?.stack || app?.router?.stack || [];

    // Express path-to-regexp lưu đường dẫn mount trong regexp.source dạng
    // "^\\/api\\/orders(?:\\/(?=$))?$" — chỉ cần chuỗi "/api/orders" xuất hiện.
    const sources = stack
      .filter((l) => l.name === 'router' && l.regexp)
      .map((l) => String(l.regexp.source).replace(/\\\//g, '/'));

    for (const expected of ['/api/orders', '/api/payments', '/api/reviews', '/api/webhooks']) {
      assert.ok(
        sources.some((s) => s.includes(expected)),
        `Route ${expected} phải được mount trong app`
      );
    }
  });
});
