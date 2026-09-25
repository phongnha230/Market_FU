import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

/**
 * ============================================================================
 * k6 LOAD TEST: KIỂM CHỨNG TẬN MẮT REDIS DISTRIBUTED LOCK (FU MARKET)
 * ============================================================================
 * 
 * Cách chạy:
 *   1. Chạy server backend: npm run dev
 *   2. Chạy k6:
 *      k6 run scripts/k6-distributed-lock.js
 *      hoặc qua Docker:
 *      docker run --rm -i --net=host grafana/k6 run - <scripts/k6-distributed-lock.js
 * ============================================================================
 */

// Định nghĩa Custom Metrics theo chuẩn k6
const ordersCreated = new Counter('orders_created');
const ordersBlockedByLock = new Counter('orders_blocked_by_lock');
const ordersAlreadyReserved = new Counter('orders_already_reserved');
const serverErrors = new Counter('server_errors');

export const options = {
  scenarios: {
    concurrent_purchase_rush: {
      executor: 'shared-iterations',
      vus: 20,              // 20 Virtual Users tranh mua cùng lúc
      iterations: 20,       // Tổng cộng 20 requests
      maxDuration: '10s',
    },
  },
  thresholds: {
    // KỲ VỌNG: DUY NHẤT 1 đơn hàng được tạo thành công
    'orders_created': ['count==1'],
    // KHÔNG ĐƯỢC CÓ BẤT KỲ LỖI 500 SERVER NÀO
    'server_errors': ['count==0'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Setup: Đăng nhập lấy Token và tìm 1 sản phẩm còn AVAILABLE
export function setup() {
  console.log(`[k6 Setup] Đang kết nối tới ${BASE_URL}...`);

  // 1. Đăng nhập Buyer
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'buyer@fpt.edu.vn',
      password: 'Password123@',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'Setup: Đăng nhập Buyer thành công (200)': (r) => r.status === 200,
  });

  const loginData = JSON.parse(loginRes.body);
  const token = loginData.data.tokens.accessToken;

  // 2. Lấy danh sách sản phẩm để chọn 1 sản phẩm AVAILABLE
  const prodRes = http.get(`${BASE_URL}/api/products?limit=1&status=AVAILABLE`);
  const prodData = JSON.parse(prodRes.body);
  const productId =
    __ENV.PRODUCT_ID ||
    (prodData.data && prodData.data.length > 0 ? prodData.data[0].id : null);

  if (!productId) {
    throw new Error('Không tìm thấy sản phẩm AVAILABLE nào để test! Hãy chạy npm run db:seed trước.');
  }

  console.log(`[k6 Setup] Sản phẩm test được chọn: ${productId}`);
  return { token, productId };
}

// Hàm thực thi cho 20 Virtual Users đồng thời
export default function (data) {
  const payload = JSON.stringify({
    productId: data.productId,
    orderType: 'MEETUP',
    paymentMethod: 'CASH',
    coinsUsed: 0,
    deliveryNote: 'k6 Concurrency Test - Redis Distributed Lock Demo',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  const res = http.post(`${BASE_URL}/api/orders`, payload, params);

  // Phân tích trạng thái phản hồi
  if (res.status === 201) {
    ordersCreated.add(1);
  } else if (res.status === 409) {
    // 409: Bị Redis Lock chặn đứng (PRODUCT_CONCURRENTLY_LOCKED hoặc PRODUCT_JUST_TAKEN)
    ordersBlockedByLock.add(1);
  } else if (res.status === 400) {
    // 400: Món đồ đã được chuyển sang RESERVED nên không thể mua
    ordersAlreadyReserved.add(1);
  } else if (res.status >= 500) {
    serverErrors.add(1);
  }

  check(res, {
    'Status là 201 (Thành công) HOẶC 409/400 (Chặn an toàn)': (r) =>
      [201, 409, 400].includes(r.status),
    'Không xảy ra lỗi máy chủ (Status < 500)': (r) => r.status < 500,
  });
}

// Báo cáo tổng kết sau khi test kết thúc
export function teardown(data) {
  console.log('\n================================================================');
  console.log('🏆 KẾT QUẢ KIỂM THỬ K6 - REDIS DISTRIBUTED LOCK');
  console.log('================================================================');
  console.log('Nếu ngưỡng orders_created == 1 pass:');
  console.log('==> CHỨNG MINH HỆ THỐNG TUYỆT ĐỐI KHÔNG BỊ LỖI MUA TRÙNG!');
  console.log('================================================================\n');
}
