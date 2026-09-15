import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';

describe('Integration Test: Express API Endpoints & Middleware', () => {
  it('GET /api/health phải trả về status ok, message hợp lệ và timestamp', async () => {
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    const port = address.port;

    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      assert.strictEqual(response.status, 200, 'HTTP status phải là 200');

      const data = (await response.json()) as { status: string; message: string; timestamp: string };
      assert.strictEqual(data.status, 'ok', 'Status trong body phải là ok');
      assert.ok(data.message.includes('FU Second-hand Market'), 'Message phải chứa tên dự án');
      assert.ok(data.timestamp, 'Response phải có timestamp');
    } finally {
      server.close();
    }
  });

  it('Các route không tồn tại phải được xử lý trả về mã lỗi 404', async () => {
    const server = app.listen(0);
    const address = server.address();

    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }

    const port = address.port;

    try {
      const response = await fetch(`http://localhost:${port}/api/non-existing-route-test`);
      assert.strictEqual(response.status, 404, 'Route không tồn tại phải trả về 404');
    } finally {
      server.close();
    }
  });
});
