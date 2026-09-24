# FU Student Second-Hand Market - Bruno API Test Collection

Bộ API Collection hoàn chỉnh cho công cụ kiểm thử **Bruno** (Open-source API Client thay thế Postman) được thiết kế bám sát kiến trúc hệ thống và quy chuẩn kỹ thuật của dự án FU Student Second-hand Market.

---

## 📁 Cấu Trúc Thư Mục & Luồng Nghiệp Vụ

```text
backend/bruno-collection/
├── bruno.json                      <-- File cấu hình Collection Bruno
├── README.md                       <-- Hướng dẫn chi tiết sử dụng Collection
├── HealthCheck.bru                 <-- Kiểm tra trạng thái máy chủ (GET /api/health)
├── environments/
│   ├── Local.bru                   <-- Biến môi trường Local (http://localhost:5000)
│   └── Local.example.bru           <-- Bản mẫu cấu hình môi trường
│
├── 01-Auth/                        <-- Xác thực & Quản lý phiên đăng nhập
│   ├── 01-Login-Buyer.bru          <-- Đăng nhập Người mua & lưu buyerToken
│   ├── 02-Login-Seller.bru         <-- Đăng nhập Người bán & lưu sellerToken
│   ├── 03-Login-Admin.bru          <-- Đăng nhập Quản trị viên & lưu adminToken
│   ├── 04-Get-Current-User.bru     <-- Lấy thông tin tài khoản hiện tại
│   ├── 05-Refresh-Token.bru        <-- Cấp mới access token từ refresh token
│   └── 06-Logout.bru               <-- Đăng xuất và thu hồi Refresh Token trong Redis
│
├── 02-Products/                    <-- Danh mục & Sản phẩm chợ sinh viên
│   ├── 01-Get-Categories.bru       <-- Lấy danh mục sản phẩm (Cached Redis)
│   ├── 02-Get-Category-Detail.bru  <-- Xem chi tiết danh mục theo slug
│   ├── 03-Get-Products.bru         <-- Lọc & tìm kiếm sản phẩm (lưu productId)
│   ├── 04-Get-Product-Detail.bru   <-- Xem chi tiết sản phẩm & tăng view
│   ├── 05-Trending-Searches.bru    <-- Top từ khóa hot (Redis ZSET)
│   ├── 06-Trending-Items.bru       <-- Top sản phẩm hot nhất (Redis ZSET)
│   ├── 07-Toggle-Favorite.bru      <-- Thêm/xóa sản phẩm yêu thích (Wishlist)
│   ├── 08-Renew-Product.bru        <-- Người bán gia hạn bài đăng thêm 30 ngày
│   └── 09-Boost-Product.bru        <-- Dùng Xu đẩy tin bài viết lên đầu sàn
│
├── 03-Orders/                      <-- Đơn hàng, Giao nhận & Đánh giá mù
│   ├── 01-Estimate-Shipping.bru    <-- Ước tính cước phí vận chuyển liên campus
│   ├── 02-Create-Order-Meetup.bru  <-- Tạo đơn hẹn gặp trực tiếp (lưu orderId, orderCode)
│   ├── 03-Create-Order-Shipping.bru<-- Tạo đơn giao nhận SHIP_COD
│   ├── 04-Get-My-Orders.bru        <-- Danh sách đơn hàng của tôi
│   ├── 05-Get-Order-Detail.bru     <-- Xem chi tiết đơn hàng
│   ├── 06-Verify-Handshake.bru     <-- Quét mã QR/OTP xác nhận giao nhận an toàn
│   ├── 07-Seller-Update-Shipping.bru<-- Người bán cập nhật mã vận đơn & giao hàng
│   ├── 08-Cancel-Order.bru         <-- Hủy đơn hàng và hoàn tiền/hàng
│   └── 09-Create-Blind-Review.bru  <-- Đánh giá mù 2 chiều sau khi giao dịch
│
├── 04-Payments/                    <-- Thanh toán & Webhooks
│   ├── 01-Check-Payment-Status.bru <-- Kiểm tra trạng thái thanh toán VietQR / PayOS
│   ├── 02-Mock-PayOS-Webhook.bru   <-- Giả lập Webhook PayOS/SePay (HMAC-SHA256)
│   └── 03-Mock-Shipping-Webhook.bru<-- Giả lập Webhook đối tác vận chuyển GHTK/GHN
│
├── 05-SafeHandoff/                 <-- Điểm giao dịch an toàn & Điểm danh Xu
│   ├── 01-Get-All-Hubs.bru         <-- Danh sách các trạm Safe-Handoff trong campus
│   ├── 02-Get-Nearby-Hubs-Geo.bru  <-- Tìm trạm gần nhất theo tọa độ (Redis Geo)
│   ├── 03-Get-Daily-Checkin-Status.bru <-- Trạng thái điểm danh tháng (Redis Bitmap)
│   └── 04-Daily-Checkin-Claim-Coin.bru <-- Điểm danh nhận Xu thưởng hàng ngày
│
├── 06-Vouchers/                    <-- Đổi Voucher Canteen/Passio bằng Xu
│   ├── 01-Get-Available-Vouchers.bru <-- Xem danh sách Voucher có thể đổi
│   ├── 02-Redeem-Voucher.bru       <-- Đổi Voucher bằng Xu tích lũy
│   └── 03-Get-My-Vouchers.bru      <-- Xem danh sách Voucher đã sở hữu
│
└── 07-Admin-And-Disputes/          <-- Quản trị, Khiếu nại, KYC & Báo cáo
    ├── 01-Create-Product-Report.bru <-- Tố cáo sản phẩm vi phạm quy định
    ├── 02-Create-Order-Dispute.bru  <-- Người mua mở khiếu nại hoàn tiền kèm video
    ├── 03-Admin-Get-Disputes.bru    <-- Admin xem danh sách khiếu nại chờ xử lý
    ├── 04-Admin-Resolve-Dispute.bru <-- Admin phân xử khiếu nại (Hoàn tiền/Thanh toán)
    ├── 05-Admin-Get-KYC-Verifications.bru <-- Admin duyệt danh sách thẻ SV KYC
    ├── 06-Admin-Approve-KYC.bru     <-- Admin duyệt thẻ SV và cộng Xu thưởng
    ├── 07-Admin-Create-Voucher.bru  <-- Admin tạo Voucher ưu đãi mới
    ├── 08-Semester-Analytics.bru    <-- Thống kê doanh số theo học kỳ & cơ sở
    └── 09-Reputation-Leaderboard.bru<-- Bảng xếp hạng uy tín sinh viên (Redis ZSET)
```

---

## ⚙️ Hướng Dẫn Sử Dụng Với Bruno App

1. Mở ứng dụng **Bruno** trên máy tính của bạn.
2. Chọn **"Open Collection"** trên màn hình chính.
3. Điều hướng và chọn thư mục:
   ```text
   <Đường_dẫn_dự_án>/backend/bruno-collection
   ```
4. Ở góc trên bên phải của Bruno, chọn Environment là **`Local`**.
5. Thứ tự chạy khuyến nghị để tự động lưu các biến phụ thuộc:
   - **Bước 1**: Chạy `HealthCheck` để chắc chắn backend đang hoạt động.
   - **Bước 2**: Chạy các request trong `01-Auth` (`01-Login-Buyer`, `02-Login-Seller`, `03-Login-Admin`) để tự động gán token tương ứng.
   - **Bước 3**: Chạy `02-Products/03-Get-Products` để hệ thống tự động gán biến `productId`.
   - **Bước 4**: Chạy `03-Orders/02-Create-Order-Meetup` để tự động gán `orderId` và `orderCode`.
   - **Bước 5**: Chạy các luồng thanh toán, safe-handoff, vouchers và admin tùy theo kịch bản cần kiểm thử.

---

## 🔑 Tài Khoản Kiểm Thử Mặc Định (Đã Seed Sẵn)

> **Lưu ý quan trọng**: Theo yêu cầu, luồng Đăng ký & Xác thực mã OTP được lược bỏ trong Collection này vì phụ thuộc vào luồng gửi mã email thực tế. Toàn bộ kịch bản sử dụng các tài khoản sinh viên và quản trị viên có sẵn sau:

| Vai trò | Email | Mật khẩu mặc định | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Buyer** (Người mua) | `buyer@fpt.edu.vn` | `Password123@` | Sinh viên cơ sở Hòa Lạc |
| **Seller** (Người bán) | `seller@fpt.edu.vn` | `Password123@` | Đã xác thực KYC Tích Xanh |
| **Admin** (Quản trị viên) | `admin@fpt.edu.vn` | `AdminPassword123@` | Toàn quyền kiểm duyệt sàn |

---

## 🛡️ Tự Động Tạo Chữ Ký Webhook (HMAC-SHA256)

Các request Webhook trong mục `04-Payments`:
- `02-Mock-PayOS-Webhook`
- `03-Mock-Shipping-Webhook`

Được tích hợp sẵn đoạn mã `script:pre-request` sử dụng thư viện Node.js `crypto` để tự động tính toán mã băm HMAC-SHA256 từ `body` và gán vào header `x-webhook-signature` / `Signature`, đảm bảo tương thích 100% với middleware xác thực webhook nghiêm ngặt trên backend.
