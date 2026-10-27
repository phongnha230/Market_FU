/**
 * 📦 Công cụ giả lập Webhook Vận chuyển (Shipping Webhook Mock Tool)
 * -------------------------------------------------------------
 * Mô phỏng đối tác vận chuyển (GHTK / GHN / CampusShip) gửi Webhook về hệ thống:
 * 1. DELIVERED: Bưu tá giao thành công -> Kích hoạt 48h bao test Escrow + Đổi SP sang SOLD
 * 2. CANCELLED: Đơn hàng bị bưu tá hủy hoặc hoàn trả về cho người bán
 * 
 * Cách dùng:
 * - Chạy tương tác: node scripts/mock-shipping-webhook.js
 * - Chạy trực tiếp: node scripts/mock-shipping-webhook.js <MÃ_ĐƠN> <delivered|cancelled> [--local]
 * Ví dụ:
 *   node scripts/mock-shipping-webhook.js ORD-123456-ABCD delivered
 *   node scripts/mock-shipping-webhook.js ORD-123456-ABCD cancelled
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Đọc file .env nếu có để lấy SHIPPING_WEBHOOK_SECRET
function loadEnvSecret() {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend', '.env'),
    path.resolve(__dirname, '..', '.env'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^SHIPPING_WEBHOOK_SECRET\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return process.env.SHIPPING_WEBHOOK_SECRET || 'your_hmac_secret_key_for_shipping_webhook';
}

const SECRET = loadEnvSecret();
const IS_LOCAL = process.argv.includes('--local') || process.argv.includes('-l');
const BASE_URL = IS_LOCAL
  ? 'http://localhost:5000/api/webhooks/shipping'
  : (process.env.API_URL || 'https://api.jintdp.dpdns.org/api/webhooks/shipping');

async function sendShippingWebhook(orderCodeOrTracking, action) {
  const isDelivered = action.toLowerCase() === 'delivered' || action === '1';
  const status = isDelivered ? 'DELIVERED' : 'CANCELLED';
  const cleanCode = orderCodeOrTracking.trim().replace(/^#/, '');

  const payload = {
    order_code: cleanCode,
    status: status,
    action_on: status,
    tracking_order_code: cleanCode,
  };

  const bodyStr = JSON.stringify(payload);
  const routePath = '/shipping';
  const signedPayload = `${routePath}${bodyStr}`;
  const signature = crypto.createHmac('sha256', SECRET).update(signedPayload).digest('hex');

  console.log('\n============================================================');
  console.log(`🚀 [SHIPPING WEBHOOK] Gửi giả lập sự kiện: ${status}`);
  console.log(`🎯 Endpoint   : ${BASE_URL}`);
  console.log(`📄 Đơn hàng   : #${cleanCode}`);
  console.log(`🔐 Chữ ký HMAC: ${signature}`);
  console.log(`📦 Payload    : ${bodyStr}`);
  console.log('============================================================\n');

  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Signature': signature,
      },
      body: bodyStr,
    });

    const resData = await res.json().catch(() => null);

    if (res.ok) {
      console.log('✅ [THÀNH CÔNG] Phản hồi từ Server HTTP', res.status);
      console.log('📄 Chi tiết:', JSON.stringify(resData, null, 2));

      if (isDelivered) {
        console.log('\n🎉 [KẾT QUẢ ĐÃ GHI NHẬN TRÊN HỆ THỐNG]');
        console.log('1. Đơn hàng chuyển sang trạng thái: DELIVERED (Đã giao hàng)');
        console.log('2. Bắt đầu đếm ngược 48 GIỜ BAO TEST bảo vệ Người mua');
        console.log('3. Sản phẩm tự động chuyển trạng thái: SOLD (Đã bán)');
        console.log('4. Realtime Socket & Email hóa đơn đã bắn cho Người mua + Người bán.');
      } else {
        console.log('\n↩️ [KẾT QUẢ ĐÃ GHI NHẬN TRÊN HỆ THỐNG]');
        console.log('1. Đơn hàng chuyển sang trạng thái: CANCELLED (Hủy/Hoàn trả)');
        console.log('2. Người mua và Người bán đã nhận thông báo hủy vận chuyển.');
      }
    } else {
      console.error('❌ [THẤT BẠI] Server trả về mã lỗi HTTP', res.status);
      console.error('📄 Lỗi:', JSON.stringify(resData, null, 2));
      if (res.status === 401) {
        console.log('\n💡 Gợi ý: Chữ ký HMAC không khớp! Kiểm tra lại SHIPPING_WEBHOOK_SECRET trong backend/.env');
      } else if (res.status === 404 || resData?.message?.includes('Không tìm thấy')) {
        console.log('\n💡 Gợi ý: Không tìm thấy mã đơn hàng này hoặc đơn hàng không phải loại SHIP_COD.');
      }
    }
  } catch (err) {
    console.error('❌ [LỖI KẾT NỐI]', err.message);
    console.log('💡 Gợi ý: Kiểm tra xem Backend / VPS có đang hoạt động không.');
  }
}

// Chạy trực tiếp nếu có tham số CLI
const args = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
if (args.length >= 2) {
  const [orderCode, action] = args;
  sendShippingWebhook(orderCode, action);
} else {
  // Chạy tương tác qua dòng lệnh Terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n========================================================');
  console.log('📦 BỘ TEST GIẢ LẬP WEBHOOK VẬN CHUYỂN (FU MARKETPLACE)');
  console.log(`🔐 Đang dùng Secret: ${SECRET.slice(0, 6)}...${SECRET.slice(-4)}`);
  console.log(`🌐 Đích đến: ${BASE_URL}`);
  console.log('========================================================\n');

  rl.question('👉 Nhập mã đơn hàng (ORD-...) hoặc Mã vận đơn bưu cục (GHN...): ', (code) => {
    if (!code.trim()) {
      console.log('❌ Mã đơn hàng / mã vận đơn không được để trống.');
      rl.close();
      return;
    }

    console.log('\nChọn kịch bản muốn test:');
    console.log('  [1] 📦 Giao hàng thành công (DELIVERED) - Kích hoạt 48h Escrow');
    console.log('  [2] ↩️ Hủy đơn / Hoàn hàng (CANCELLED) - Bưu tá hủy giao');
    rl.question('\n👉 Lựa chọn của bạn (1 hoặc 2): ', (choice) => {
      rl.close();
      const action = choice.trim() === '2' ? 'cancelled' : 'delivered';
      sendShippingWebhook(code.trim(), action);
    });
  });
}
