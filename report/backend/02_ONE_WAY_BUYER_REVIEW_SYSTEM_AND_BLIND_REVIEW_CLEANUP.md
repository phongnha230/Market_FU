# BÁO CÁO 02: CHUẨN HÓA CƠ CHẾ ĐÁNH GIÁ 1 CHIỀU CHO NGƯỜI MUA, LOẠI BỎ BLIND REVIEW & KIỂM SOÁT ĐƠN HÀNG PAYOS

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`fu-secondhand-backend`)  
**Phân hệ:** Backend API (`backend/src/modules/reviews/`, `backend/src/modules/orders/`, `backend/src/modules/payments/`) & Database Schema  
**Thời gian xử lý:** Tháng 10/2026  
**Công nghệ:** Node.js, Express, TypeScript, Prisma ORM, MongoDB, Redis, PayOS Payment Gateway.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH NGHIỆP VỤ

Trong quá trình đối soát giữa quy trình vận hành thực tế của chợ sinh viên FPT và mã nguồn hệ thống, nhóm đã xác định và giải quyết 2 bài toán nghiệp vụ trọng tâm:

1. **Loại bỏ hoàn toàn cơ chế "Blind Review" (Đánh giá 2 chiều giấu kín chống trả đũa)**:
   - Trước đây trong tài liệu đặc tả sơ khai có đề xuất cơ chế Blind Review: Đánh giá bị ẩn (`isPublic = false`), chỉ được công khai khi cả Người mua và Người bán đều đánh giá nhau, hoặc sau 7 ngày kể từ khi hoàn tất giao dịch.
   - Tuy nhiên, trong mô hình Chợ sinh viên C2C (`FU Student Second-Hand Market`), giao dịch hoàn tất khi sinh viên gặp nhau tại trạm Safe-Point và đối soát thành công. Người mua là bên trải nghiệm và kiểm chứng chất lượng món đồ thanh lý (giáo trình, bàn phím, màn hình, xe đạp,...), do đó **chỉ Người mua đánh giá Người bán** về chất lượng đồ dùng và độ trung thực trong mô tả.
   - Việc giữ cơ chế Blind Review làm đánh giá bị "giam" suốt 7 ngày, người bán không nhận được uy tín ngay và người mua không thấy đánh giá của mình xuất hiện trên hồ sơ shop.

2. **Cơ chế kiểm soát và tự động hủy đơn PayOS chưa thanh toán**:
   - Khảo sát hiện tượng người mua chọn phương thức thanh toán chuyển khoản PayOS nhưng hủy giữa chừng hoặc đóng tab cổng thanh toán, dẫn đến việc phát sinh đơn hàng trạng thái chờ gây treo tình trạng sản phẩm.

---

## 2. NÂNG CẤP VÀ GIẢI PHÁP KỸ THUẬT

### 2.1. Chuẩn hóa Cơ chế Đánh giá 1 chiều (Buyer $\rightarrow$ Seller) & Xóa bỏ Blind Review
1. **Công khai tức thì (`isPublic = true`)**:
   - Khi Người mua gửi yêu cầu đánh giá đơn hàng qua `POST /api/reviews` (hoặc `POST /api/reviews/order/:orderId`), service xử lý lưu bản ghi với trạng thái `isPublic: true` ngay lập tức:
     ```typescript
     // backend/src/modules/reviews/review.service.ts
     const review = await prisma.review.create({
       data: {
         orderId,
         reviewerId: buyerId,
         targetUserId: sellerId,
         rating,
         comment,
         images: images || [],
         isPublic: true, // Hiển thị công khai ngay lập tức, không còn giam 7 ngày
         isAnonymous: Boolean(isAnonymous),
       },
     });
     ```
2. **Cập nhật tức thời điểm tín nhiệm Người bán (Seller Reputation)**:
   - Hệ thống tự động tính lại điểm trung bình cộng số sao (`averageRating`) và tổng lượt đánh giá (`totalReviews`) của Người bán trong bảng `User`.
   - Cập nhật số dư Xu thưởng sinh viên (FPT Coin) cho Người mua vì đã đóng góp đánh giá cộng đồng văn minh.
   - Gửi thông báo thông qua Socket Realtime và Firebase Push Notification tới Người bán: *"Bạn vừa nhận được đánh giá [X] sao từ người mua cho đơn hàng [Mã đơn]"*.
3. **Dọn dẹp mã nguồn thừa (Clean up Dead Code)**:
   - Loại bỏ các biến logic kiểm tra cờ đánh giá phản hồi 2 chiều của người bán (`sellerReviewed`, `buyerReviewed`).
   - Xóa bỏ worker hoặc hàm đếm lùi 7 ngày mở khóa đánh giá trong `order.service.ts`.
   - Đảm bảo endpoint `GET /api/users/:id` trả về đầy đủ danh sách đánh giá công khai kèm bộ lọc số sao (1-5 sao) để Client Web và Mobile render chuẩn xác.

---

### 2.2. Kiểm soát Luồng Đơn hàng PayOS Chưa Thanh toán
1. **Nguyên nhân phát sinh**:
   - Khách hàng bấm "Thanh toán PayOS" $\rightarrow$ Backend tạo bản ghi đơn hàng với trạng thái `PENDING_PAYMENT` và gọi API PayOS để sinh link QR thanh toán.
   - Nếu khách hàng đổi ý, tắt trình duyệt hoặc không quét mã QR, đơn hàng vẫn nằm ở trạng thái `PENDING_PAYMENT`, khiến sản phẩm bị khóa ở trạng thái `RESERVED` (đã đặt chỗ) mà không ai khác mua được.
2. **Kiến trúc giải quyết tự động (Auto-Cancel Expired PayOS Orders)**:
   - **Thời gian hết hạn (TTL):** Thiết lập link thanh toán PayOS và đơn hàng có hiệu lực trong vòng **15 phút**.
   - **Webhook Callback từ PayOS:** Khi PayOS phát hiện link hết hạn hoặc khách hàng bấm hủy trên cổng thanh toán, PayOS gửi Webhook `CANCELLED` về backend.
   - **Background Worker Quét định kỳ:**
     - Thiết lập cron job định kỳ kiểm tra các đơn hàng có trạng thái `PENDING_PAYMENT` và thời gian tạo quá 15 phút:
       ```typescript
       // Tự động giải phóng sản phẩm và cập nhật đơn hàng quá hạn
       await prisma.$transaction([
         prisma.order.updateMany({
           where: {
             paymentMethod: 'PAYOS',
             status: 'PENDING_PAYMENT',
             createdAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
           },
           data: { status: 'CANCELLED', cancelReason: 'PAYMENT_TIMEOUT' },
         }),
         prisma.product.updateMany({
           where: { id: { in: expiredProductIds }, status: 'RESERVED' },
           data: { status: 'AVAILABLE' },
         }),
       ]);
       ```
     - Cơ chế này đảm bảo hoàn trả lại sản phẩm về chợ cho các sinh viên khác tiếp tục mua bán, triệt tiêu hoàn toàn rủi ro "treo hàng ảo".

---

## 3. KẾT QUẢ KIỂM THỬ VÀ TRẠNG THÁI GIT

1. **Biên dịch TypeScript Backend:**
   ```bash
   cd backend && npx tsc --noEmit
   # Exit code: 0 (PASS, 0 errors)
   ```
2. **Kiểm thử E2E Đánh giá & Hoàn tất đơn hàng:**
   - Đã chạy test xác nhận: Người mua bấm "Đã nhận hàng" $\rightarrow$ Gửi đánh giá 5 sao $\rightarrow$ Hồ sơ Người bán hiển thị ngay đánh giá mới $\rightarrow$ Điểm uy tín tăng tức thì.
3. **Các commit liên quan:**
   - Commit `eca363a`: `fix(review): ensure isPublic is immediately true on review submission`
   - Commit `2b1a821`: `refactor: align docs with codebase, clean up blind review dead code and standardize cloudflare r2`
