import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app';
import { generateTokens } from '../../src/utils/token';
import { prisma } from '../../src/config/prisma';

describe('E2E Test: Report & Moderation Workflow', () => {
  it('Luồng E2E: Sinh viên tố cáo vi phạm -> Admin kiểm tra danh sách -> Admin giải quyết tố cáo', async () => {
    const server = app.listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Không thể khởi tạo test server');
    }
    const baseUrl = `http://localhost:${address.port}`;

    let testReportId: string | null = null;
    let reporterId: string | null = null;
    let targetUserId: string | null = null;

    try {
      // ── BƯỚC 0: TẠO DỮ LIỆU THỰC TRONG DB CHO SINH VIÊN VÀ ĐỐI TƯỢNG BỊ TỐ CÁO ──
      const reporter = await prisma.user.upsert({
        where: { email: 'reporter.e2e@fpt.edu.vn' },
        update: {},
        create: {
          email: 'reporter.e2e@fpt.edu.vn',
          role: 'BUYER',
          profile: {
            create: {
              fullName: 'Sinh Viên Tố Cáo E2E',
              campus: 'HOL',
            },
          },
        },
      });
      reporterId = reporter.id;

      const targetUser = await prisma.user.upsert({
        where: { email: 'target.scammer.e2e@fpt.edu.vn' },
        update: {},
        create: {
          email: 'target.scammer.e2e@fpt.edu.vn',
          role: 'BUYER',
          profile: {
            create: {
              fullName: 'Tài Khoản Gian Lận E2E',
              campus: 'HOL',
            },
          },
        },
      });
      targetUserId = targetUser.id;

      const admin = await prisma.user.upsert({
        where: { email: 'admin.e2e@fpt.edu.vn' },
        update: {},
        create: {
          email: 'admin.e2e@fpt.edu.vn',
          role: 'ADMIN',
          profile: {
            create: {
              fullName: 'Admin Ban Quản Trị E2E',
              campus: 'HOL',
            },
          },
        },
      });

      const reporterToken = generateTokens({
        userId: reporter.id,
        role: reporter.role,
        email: reporter.email,
      }).accessToken;

      const adminToken = generateTokens({
        userId: admin.id,
        role: admin.role,
        email: admin.email,
      }).accessToken;

      // ── BƯỚC 1: SINH VIÊN GỬI BÁO CÁO TỐ CÁO QUA REST API ──
      const reportRes = await fetch(`${baseUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${reporterToken}`,
        },
        body: JSON.stringify({
          targetType: 'USER',
          targetId: targetUserId,
          reason: 'Lừa đảo tiền cọc không giao hàng',
          details: 'Tôi đã chuyển cọc 50k nhưng bạn này chặn tin nhắn',
        }),
      });

      assert.strictEqual(reportRes.status, 201, 'Sinh viên gửi tố cáo phải thành công mã 201');
      const reportData = (await reportRes.json()) as any;
      assert.strictEqual(reportData.success, true);
      testReportId = reportData.data.id;
      assert.ok(testReportId, 'Report mới tạo phải có id');

      // ── BƯỚC 2: ADMIN XEM DANH SÁCH BÁO CÁO PENDING ──
      const listRes = await fetch(`${baseUrl}/api/reports?status=PENDING`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(listRes.status, 200);
      const listData = (await listRes.json()) as any;
      assert.strictEqual(listData.success, true);
      const found = listData.data.find((r: any) => r.id === testReportId);
      assert.ok(found, 'Báo cáo mới tạo phải nằm trong danh sách của Admin');
      assert.strictEqual(found.reporter.email, 'reporter.e2e@fpt.edu.vn');

      // ── BƯỚC 3: ADMIN XEM CHI TIẾT BÁO CÁO ──
      const detailRes = await fetch(`${baseUrl}/api/reports/${testReportId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(detailRes.status, 200);
      const detailData = (await detailRes.json()) as any;
      assert.strictEqual(detailData.data.reason, 'Lừa đảo tiền cọc không giao hàng');
      assert.ok(detailData.data.targetDetail, 'Phải có thông tin đối tượng bị tố cáo');

      // ── BƯỚC 4: ADMIN PHÁN QUYẾT BÁO CÁO (BAN_USER) ──
      const resolveRes = await fetch(`${baseUrl}/api/reports/${testReportId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'BAN_USER',
          adminNote: 'Xác minh có hành vi lừa đảo chiếm đoạt tài sản sinh viên, tiến hành khóa vĩnh viễn',
        }),
      });
      assert.strictEqual(resolveRes.status, 200);
      const resolveData = (await resolveRes.json()) as any;
      assert.strictEqual(resolveData.data.report.status, 'RESOLVED');

      // ── BƯỚC 5: KIỂM TRA TÀI KHOẢN VI PHẠM ĐÃ BỊ KHÓA ──
      const bannedUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      assert.strictEqual(bannedUser?.isActive, false, 'Tài khoản gian lận phải bị khóa (isActive = false)');
    } finally {
      // Dọn dẹp dữ liệu test
      if (testReportId) {
        await prisma.report.deleteMany({ where: { id: testReportId } }).catch(() => {});
      }
      server.close();
    }
  });
});
