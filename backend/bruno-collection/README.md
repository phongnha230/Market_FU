# FU Student Second-Hand Market - Bruno API Test Collection (Chuẩn RESTful CRUD)

Bộ API Collection hoàn chỉnh cho **Bruno** (Open-source API Client) được tái cấu trúc bám sát chuẩn **RESTful CRUD (Create - Read - Update - Delete - Actions)** và quy chuẩn kỹ thuật hệ thống FU Student Second-hand Market.

---

## 📁 Cấu Trúc Toàn Bộ Collection Chuẩn CRUD

```text
backend/bruno-collection/
├── bruno.json                               <-- Cấu hình Collection Bruno
├── README.md                                <-- Tài liệu hướng dẫn chi tiết
├── HealthCheck.bru                          <-- GET /api/health (Kiểm tra server)
├── environments/
│   ├── Local.bru                            <-- Biến môi trường Local (http://localhost:5000)
│   └── Local.example.bru                    <-- Bản mẫu cấu hình môi trường
├── fixtures/
│   └── sample-product.png                   <-- Ảnh mẫu dùng cho multipart/form-data upload
│
├── 01-Auth/                                 <-- Xác thực & Quản lý người dùng
│   ├── 01-Login-Buyer.bru                   <-- [POST] Đăng nhập Buyer (Lưu buyerToken & token)
│   ├── 02-Login-Seller.bru                  <-- [POST] Đăng nhập Seller (Lưu sellerToken)
│   ├── 03-Login-Admin.bru                   <-- [POST] Đăng nhập Admin (Lưu adminToken)
│   ├── 04-Get-Current-User.bru              <-- [GET - READ] Lấy thông tin user hiện tại (Lưu userId)
│   ├── 05-Update-My-Profile.bru             <-- [PATCH - UPDATE] Cập nhật họ tên, SĐT, cơ sở
│   ├── 06-Update-Bank-Account.bru           <-- [PATCH - UPDATE] Cập nhật số tài khoản ngân hàng
│   ├── 07-Refresh-Token.bru                 <-- [POST] Cấp mới Access Token từ Refresh Token
│   └── 08-Logout.bru                        <-- [POST] Đăng xuất và thu hồi Refresh Token
│
├── 02-Products/                             <-- CRUD Trọn vẹn Danh mục & Sản phẩm
│   ├── 01-Get-Categories.bru                <-- [GET - READ ALL] Lấy danh mục sản phẩm
│   ├── 02-Get-Category-Detail.bru           <-- [GET - READ ONE] Chi tiết danh mục theo slug
│   ├── 03-Create-Product.bru                <-- [POST - CREATE] Seller đăng bán sản phẩm (Lưu productId)
│   ├── 04-Get-Products.bru                  <-- [GET - READ ALL] Tìm kiếm, lọc phân trang (Fallback productId)
│   ├── 05-Get-Product-Detail.bru            <-- [GET - READ ONE] Xem chi tiết sản phẩm theo {{productId}}
│   ├── 06-Update-Product.bru                <-- [PATCH - UPDATE] Seller sửa thông tin (tiêu đề, giá, mô tả)
│   ├── 07-Update-Product-Status.bru         <-- [PATCH - UPDATE STATUS] Đổi trạng thái (AVAILABLE, RESERVED, SOLD)
│   ├── 08-Renew-Product.bru                 <-- [POST - ACTION] Gia hạn bài đăng thêm 30 ngày
│   ├── 09-Boost-Product.bru                 <-- [POST - ACTION] Dùng Xu đẩy tin bài viết lên đầu sàn
│   ├── 10-Toggle-Favorite.bru               <-- [POST - ACTION] Thả tim / Bỏ tim sản phẩm
│   ├── 11-Get-My-Favorites.bru              <-- [GET - READ] Danh sách Wishlist yêu thích của tôi
│   ├── 12-Trending-Searches.bru             <-- [GET - QUERY] Top từ khóa tìm kiếm hot (Redis ZSET)
│   ├── 13-Trending-Items.bru                <-- [GET - QUERY] Top sản phẩm hot nhất theo view (Redis ZSET)
│   └── 14-Delete-Product.bru                <-- [DELETE - DELETE] Soft-delete món đồ (Chuyển sang HIDDEN)
│
├── 03-Orders/                               <-- CRUD Đơn hàng, Giao nhận & Đánh giá mù
│   ├── 01-Estimate-Shipping.bru             <-- [GET - QUERY] Ước tính cước phí ship liên campus
│   ├── 02-Create-Order-Meetup.bru           <-- [POST - CREATE] Người mua đặt đơn hẹn gặp (Lưu orderId, orderCode)
│   ├── 03-Create-Order-Shipping.bru         <-- [POST - CREATE] Người mua đặt đơn SHIP_COD
│   ├── 04-Get-My-Orders.bru                 <-- [GET - READ ALL] Danh sách đơn hàng theo role BUYER/SELLER
│   ├── 05-Get-Order-Detail.bru              <-- [GET - READ ONE] Chi tiết đơn hàng theo {{orderId}}
│   ├── 06-Seller-Update-Shipping.bru        <-- [PATCH - UPDATE] Người bán cập nhật mã vận đơn & trạng thái
│   ├── 07-Verify-Handshake.bru              <-- [POST - ACTION] Quét mã QR/OTP xác nhận giao hàng thành công
│   ├── 08-Create-Blind-Review.bru           <-- [POST - CREATE] Tạo đánh giá mù 2 chiều sau khi giao dịch
│   ├── 09-Get-Order-Reviews.bru             <-- [GET - READ] Xem các đánh giá liên quan đến đơn hàng
│   └── 10-Cancel-Order.bru                  <-- [POST - ACTION] Hủy đơn hàng và hoàn tiền/hàng
│
├── 04-Payments/                             <-- Thanh toán & Webhooks (Bảo mật HMAC)
│   ├── 01-Check-Payment-Status.bru          <-- [GET - READ] Kiểm tra trạng thái thanh toán theo orderCode
│   ├── 02-Mock-PayOS-Webhook.bru            <-- [POST - ACTION] Webhook PayOS/SePay (Tự động ký HMAC-SHA256)
│   └── 03-Mock-Shipping-Webhook.bru         <-- [POST - ACTION] Webhook vận chuyển GHTK/GHN (Ký HMAC-SHA256)
│
├── 05-SafeHandoff/                          <-- CRUD Trạm Giao Dịch An Toàn & Điểm Danh Xu
│   ├── 01-Admin-Create-Hub.bru              <-- [POST - CREATE] Admin tạo trạm giao dịch an toàn mới (Lưu hubId)
│   ├── 02-Get-All-Hubs.bru                  <-- [GET - READ ALL] Xem danh sách các trạm đang hoạt động
│   ├── 03-Get-Hub-Detail.bru                <-- [GET - READ ONE] Xem chi tiết 1 trạm theo {{hubId}}
│   ├── 04-Get-Nearby-Hubs-Geo.bru           <-- [GET - QUERY] Tìm trạm gần nhất theo tọa độ (Redis Geo)
│   ├── 05-Admin-Update-Hub.bru              <-- [PATCH - UPDATE] Admin cập nhật thông tin trạm
│   ├── 06-Admin-Toggle-Hub.bru              <-- [PATCH - UPDATE STATUS] Bật / Tắt trạng thái hoạt động trạm
│   ├── 07-Get-Daily-Checkin-Status.bru      <-- [GET - READ] Kiểm tra chuỗi điểm danh tháng (Redis Bitmap)
│   ├── 08-Daily-Checkin-Claim-Coin.bru      <-- [POST - ACTION] Điểm danh nhận Xu thưởng hàng ngày
│   └── 09-Admin-Delete-Hub.bru              <-- [DELETE - DELETE] Admin xóa trạm Safe-Handoff
│
├── 06-Vouchers/                             <-- CRUD Voucher Ưu Đãi Đối Tác
│   ├── 01-Admin-Create-Voucher.bru          <-- [POST - CREATE] Admin tạo voucher mới (Lưu voucherId)
│   ├── 02-Get-Available-Vouchers.bru        <-- [GET - READ ALL] Xem danh sách voucher công khai (Fallback voucherId)
│   ├── 03-Get-Voucher-Detail.bru            <-- [GET - READ ONE] Xem chi tiết 1 voucher theo {{voucherId}}
│   ├── 04-Admin-Update-Voucher.bru          <-- [PATCH - UPDATE] Admin chỉnh sửa voucher (số lượng, hạn dùng)
│   ├── 05-Redeem-Voucher.bru                <-- [POST - ACTION] Đổi voucher bằng Xu tích lũy
│   ├── 06-Get-My-Vouchers.bru               <-- [GET - READ] Xem danh sách voucher cá nhân đã đổi
│   ├── 07-Use-Voucher.bru                   <-- [POST - ACTION] Quét mã QR sử dụng voucher tại cửa hàng
│   └── 08-Admin-Delete-Voucher.bru          <-- [DELETE - DELETE] Admin xóa voucher
│
└── 07-Admin-And-Disputes/                   <-- CRUD Khiếu nại, Tố cáo, Quản trị User & KYC
    ├── 01-Create-Product-Report.bru         <-- [POST - CREATE] Người dùng gửi tố cáo vi phạm bài đăng/user
    ├── 02-Create-Order-Dispute.bru          <-- [POST - CREATE] Người mua mở khiếu nại hoàn tiền (Lưu disputeId)
    ├── 03-Admin-Get-Disputes.bru            <-- [GET - READ ALL] Admin xem danh sách khiếu nại PENDING
    ├── 04-Get-Dispute-Detail.bru            <-- [GET - READ ONE] Xem chi tiết khiếu nại theo {{disputeId}}
    ├── 05-Admin-Resolve-Dispute.bru         <-- [PATCH - UPDATE] Admin phán quyết hoàn tiền Buyer hoặc trả Seller
    ├── 06-Admin-Get-KYC-Verifications.bru   <-- [GET - READ ALL] Admin xem danh sách thẻ SV chờ duyệt (Lưu kycId)
    ├── 07-Admin-Approve-KYC.bru             <-- [PATCH - UPDATE] Admin duyệt thẻ SV (Cấp tích xanh + Xu)
    ├── 08-Admin-Get-Users.bru               <-- [GET - READ ALL] Admin xem danh sách người dùng (Lưu userId)
    ├── 09-Admin-Update-User-Status.bru      <-- [PATCH - UPDATE] Admin khóa / mở khóa tài khoản người dùng
    ├── 10-Semester-Analytics.bru            <-- [GET - READ] Báo cáo thống kê doanh số theo kỳ học & Campus
    └── 11-Reputation-Leaderboard.bru        <-- [GET - READ] Bảng xếp hạng uy tín sinh viên (Redis ZSET)
```

---

## 🔄 Chu Trình Kiểm Thử Khuyến Nghị (Chaining Environment Variables)

Để các biến môi trường được kế thừa và tái sử dụng chuẩn xác qua từng bước kiểm thử:

1. **Khởi động**: Chạy `HealthCheck` để xác nhận máy chủ backend đang online.
2. **Xác thực**:
   - Chạy `01-Auth/01-Login-Buyer` ➔ Tự động lưu `token`, `buyerToken`, `refreshToken`.
   - Chạy `01-Auth/02-Login-Seller` ➔ Tự động lưu `sellerToken`.
   - Chạy `01-Auth/03-Login-Admin` ➔ Tự động lưu `adminToken`.
   - Chạy `01-Auth/04-Get-Current-User` ➔ Tự động lưu `userId`.
3. **Chu trình CRUD Sản phẩm (`02-Products`)**:
   - `03-Create-Product` ➔ Tạo sản phẩm mới kèm ảnh `fixtures/sample-product.png`, tự động lưu `productId`.
   - `04-Get-Products` ➔ Kiểm tra sản phẩm vừa tạo trong danh sách sàn.
   - `05-Get-Product-Detail` ➔ Kiểm tra chi tiết sản phẩm theo `{{productId}}`.
   - `06-Update-Product` ➔ Cập nhật giá và mô tả sản phẩm.
   - `07-Update-Product-Status` ➔ Cập nhật trạng thái sản phẩm (`AVAILABLE`).
   - `08-Renew-Product` & `09-Boost-Product` ➔ Gia hạn và đẩy tin.
   - `14-Delete-Product` ➔ Xóa món đồ sau khi kiểm thử xong.
4. **Chu trình CRUD Đơn hàng (`03-Orders`)**:
   - `02-Create-Order-Meetup` ➔ Tạo đơn hàng, tự động lưu `orderId` và `orderCode`.
   - `05-Get-Order-Detail` ➔ Xem chi tiết đơn hàng.
   - `06-Seller-Update-Shipping` ➔ Cập nhật vận đơn.
   - `07-Verify-Handshake` ➔ Xác thực giao nhận hoàn tất.
   - `08-Create-Blind-Review` ➔ Đánh giá đơn hàng.
5. **Chu trình CRUD Trạm Safe-Handoff (`05-SafeHandoff`)**:
   - `01-Admin-Create-Hub` ➔ Tạo trạm, tự động lưu `hubId`.
   - `02-Get-All-Hubs` & `03-Get-Hub-Detail` ➔ Xem danh sách và chi tiết trạm.
   - `05-Admin-Update-Hub` & `06-Admin-Toggle-Hub` ➔ Cập nhật và đổi trạng thái.
   - `09-Admin-Delete-Hub` ➔ Xóa trạm thử nghiệm.
6. **Chu trình CRUD Voucher (`06-Vouchers`)**:
   - `01-Admin-Create-Voucher` ➔ Tạo voucher, tự động lưu `voucherId`.
   - `02-Get-Available-Vouchers` & `03-Get-Voucher-Detail` ➔ Xem danh sách và chi tiết.
   - `04-Admin-Update-Voucher` ➔ Cập nhật voucher.
   - `05-Redeem-Voucher` ➔ Đổi voucher bằng Xu.
   - `08-Admin-Delete-Voucher` ➔ Xóa voucher thử nghiệm.
