# 🛡️ BÁO CÁO TỔNG HỢP NÂNG CẤP BẢO MẬT & HARDENING HỆ THỐNG
**Dự án:** Sàn Đồ Cũ Sinh Viên Đại Học FPT (MarketFU)  
**Ngày thực hiện:** 14/09/2026  
**Trạng thái:** ✅ Đã hoàn thành 100% — Toàn bộ 129/129 Tests PASS  

---

## 📑 MỤC LỤC
1. [Tổng quan tình trạng bảo mật](#1-tổng-quan-tình-trạng-bảo-mật)
2. [Đợt 1: Khắc phục 10 lỗ hổng nghiêm trọng (CRITICAL & HIGH)](#2-đợt-1-khắc-phục-10-lỗ-hổng-nghiêm-trọng-critical--high)
3. [Đợt 2: Bảo vệ nâng cao & Logic nghiệp vụ (Phase 2 Hardening)](#3-đợt-2-bảo-vệ-nâng-cao--logic-nghiệp-vụ-phase-2-hardening)
4. [Danh sách các tệp tin đã chỉnh sửa](#4-danh-sách-các-tệp-tin-đã-chỉnh-sửa)
5. [Quy trình kiểm thử & Kết quả nghiệm thu](#5-quy-trình-kiểm-thử--kết-quả-nghiệm-thu)
6. [Lưu ý vận hành khi triển khai Production](#6-lưu-ý-vận-hành-khi-triển-khai-production)

---

## 1. TỔNG QUAN TÌNH TRẠNG BẢO MẬT

Sau quá trình rà soát toàn diện mã nguồn Backend (Express.js, Prisma ORM, MongoDB, Socket.io, Gemini AI), hệ thống đã được khắc phục triệt để các rủi ro bảo mật từ mức độ Nguy cấp (CRITICAL) đến mức độ Cao (HIGH) và Trung bình (MEDIUM).

### Bảng tổng kết trạng thái

| STT | Hạng mục an toàn | Mức độ | Trạng thái trước đây | Giải pháp đã triển khai |
|:---:|:---|:---:|:---|:---|
| 1 | **JWT Fallback Secrets** | 🔴 CRITICAL | Có secret mặc định trong Zod schema | Xóa default, yêu cầu tối thiểu 32 ký tự, crash ngay khi thiếu trên Production |
| 2 | **Giao dịch tài chính (Xu)** | 🔴 CRITICAL | Nguy cơ Race Condition double-spend | Bọc toàn bộ cộng/trừ Xu trong `prisma.$transaction` |
| 3 | **Nghe lén Socket.io** | 🔴 CRITICAL | Bất kỳ ai cũng có thể join room chat | Xác thực chặt chẽ `buyerId` / `sellerId` trước khi cho vào room |
| 4 | **Handshake Timing Attack & Brute-force** | 🔴 CRITICAL | Dùng `===` và không giới hạn OTP | Chuyển sang constant-time HMAC SHA-256 digest + Khóa 15 phút sau 5 lần thử sai |
| 5 | **reCAPTCHA Bypass** | 🔴 CRITICAL | Nguy cơ lọt request khi timeout | Fail-closed: Luôn ném lỗi `AppError` chặn request nếu không xác thực được |
| 6 | **AI Abuse & Quota Exhaustion** | 🔴 CRITICAL | Nguy cơ spam API gây phát sinh chi phí | Áp dụng `aiRateLimiter` (tối đa 20 lượt gọi / phút / IP) |
| 7 | **Refresh Token Revocation** | 🔴 CRITICAL | Đăng xuất chỉ xóa cookie, token vẫn sống | Thêm `tokenVersion` trên User, vô hiệu hóa ngay khi logout hoặc đổi mật khẩu |
| 8 | **Webhook HMAC Raw Body** | 🟠 HIGH | Tính HMAC trên JSON đã parse (sai lệch) | Lưu nguyên vẹn `req.rawBody` Buffer để tính chữ ký số chuẩn xác 100% |
| 9 | **Zod Validation Coverage** | 🟠 HIGH | Thiếu validate một số body (VD: boost post) | Bổ sung đầy đủ DTO và validate 100% endpoint đầu vào |
| 10 | **Password Policy** | 🟠 HIGH | Chỉ yêu cầu tối thiểu 6 ký tự | Bắt buộc 8+ ký tự, có chữ hoa, chữ số và ký tự đặc biệt |
| 11 | **Account Lockout per Email** | 🟠 HIGH | Chỉ rate limit theo IP, dễ bị botnet dò pass | Tạm khóa tài khoản 15 phút nếu nhập sai mật khẩu 5 lần liên tiếp |
| 12 | **Video Upload Magic Bytes** | 🟠 HIGH | Chỉ kiểm tra header MIME do client khai báo | Đọc chữ ký nhị phân trực tiếp (MP4 `ftyp`, WebM EBML ID) |
| 13 | **View Count Inflation** | 🟡 MEDIUM | Gọi GET /products/:id liên tục gây tăng view ảo | Throttling bộ nhớ đệm: mỗi IP/User chỉ tính 1 view mỗi 15 phút |
| 14 | **Siết điều kiện Review** | 🟡 MEDIUM | Cho phép đánh giá khi đơn còn ở DELIVERED | Bắt buộc hoàn tất `COMPLETED`, sửa lỗi đảo logic thưởng điểm uy tín |
| 15 | **Cron mở Blind Review 7 ngày** | 🟡 MEDIUM | Đánh giá ẩn bị giam mãi nếu đối tác im lặng | Tự động công khai sau 7 ngày lúc 00:00 và chống lặp email cảnh báo |

---

## 2. ĐỢT 1: KHẮC PHỤC 10 LỖ HỔNG NGHIÊM TRỌNG (CRITICAL & HIGH)

### 2.1. Loại bỏ chuỗi bí mật mặc định của JWT
* **Tệp tin:** `backend/src/config/env.ts`
* **Nguy cơ:** Trước đây `JWT_SECRET` và `JWT_REFRESH_SECRET` có `.default('fu_campus_market_secret_...')`. Nếu triển khai thiếu file `.env`, server sẽ chạy với secret công khai, cho phép kẻ xấu tự giả mạo token đăng nhập của Admin hoặc bất kỳ sinh viên nào.
* **Khắc phục:**
  * Bỏ hoàn toàn `.default()`.
  * Yêu cầu độ dài tối thiểu: `.min(32)` cho JWT secrets và `.min(16)` cho webhook/handshake secrets.
  * Trong hàm `parseEnv()`: Nếu phát hiện thiếu biến môi trường trên Production (`NODE_ENV === 'production'`), ứng dụng lập tức thoát `process.exit(1)` (Fail-fast). Ở chế độ Development, tự nạp chuỗi dev an toàn để lập trình viên local không bị gián đoạn.

### 2.2. Bảo vệ giao dịch tài chính bằng Atomic Transactions
* **Tệp tin:** `order.service.ts`, `product.service.ts`, `voucher.service.ts`, `review.service.ts`
* **Nguy cơ:** Kẻ xấu gửi đồng thời nhiều request trừ Xu (Race Condition) dẫn đến tiêu vượt số dư thực tế (Double-spending) hoặc mua hàng khi số lượng tồn kho đã hết.
* **Khắc phục:**
  * Toàn bộ thao tác kiểm tra số dư và trừ Xu (`createOrder`, `verifyHandshake`, `redeemVoucher`, `boostProduct`, `toggleFavorite`) được gom trọn vẹn vào `prisma.$transaction(async (tx) => { ... })`.
  * Đảm bảo tính toán số dư mới (`balanceAfter`) và ghi sổ cái `CoinTransaction` diễn ra nhất quán và nguyên tử.

### 2.3. Chặn nghe lén phòng chat Socket.io
* **Tệp tin:** `backend/src/utils/socket.ts`
* **Nguy cơ:** Sự kiện `join_conversation` nếu không kiểm tra quyền sẽ cho phép bất kỳ ai biết `conversationId` tham gia phòng chat và đọc trộm tin nhắn, thỏa thuận giá cả và địa điểm gặp mặt.
* **Khắc phục:**
  * Bắt buộc truy vấn kiểm tra: `conversation.buyerId !== userId && conversation.sellerId !== userId`. Nếu không thuộc 1 trong 2 người tham gia thì ngắt quyền và phát sự kiện lỗi `UNAUTHORIZED_CONVERSATION`.

### 2.4. Chống Timing Attack, Brute-force OTP và IDOR ở QR Handshake
* **Tệp tin:** `backend/src/modules/orders/order.service.ts`
* **Nguy cơ:**
  1. So sánh chuỗi token/OTP bằng toán tử `===` làm rò rỉ thời gian thực thi (Timing Attack).
  2. Mã OTP 4 số chỉ có 9.000 tổ hợp (1000–9999), kẻ xấu có thể viết bot vét cạn trong vài giây.
  3. API `GET /api/orders/:id` trả về toàn bộ trường `handshake.handshakeOtp`, người mua có thể tự đọc trộm để tự xác nhận nhận hàng mà không cần gặp mặt người bán.
* **Khắc phục:**
  * Tạo hàm `safeCompare`: Băm cả 2 chuỗi sang SHA-256 Digest 32 bytes trước khi đưa vào `crypto.timingSafeEqual()`, loại bỏ hoàn toàn chênh lệch thời gian thực thi và chống crash do lệch độ dài buffer.
  * Bộ đếm `handshakeAttemptStore`: Cho phép nhập sai tối đa 5 lần. Quá 5 lần sẽ khóa chức năng xác thực 15 phút (HTTP 429 - `TOO_MANY_HANDSHAKE_ATTEMPTS`).
  * Chống IDOR: Chỉ người mua (`buyerId === userId`) mới có quyền nhập mã xác thực; đồng thời trong `getOrderById`, mã OTP và Token được ẩn (`****`) khỏi người mua trước khi gặp mặt nhận đồ.

### 2.5. reCAPTCHA chuyển sang Fail-Closed
* **Tệp tin:** `backend/src/middlewares/recaptcha.middleware.ts`
* **Nguy cơ:** Khi máy chủ mất kết nối đến Google reCAPTCHA hoặc bị timeout mạng, nếu cấu hình cho đi qua (`next()`), botnet có thể cố tình làm nghẽn kết nối ngoài để bypass reCAPTCHA hàng loạt.
* **Khắc phục:** Toàn bộ khối `catch` đều ném `AppError('Không thể xác thực reCAPTCHA...', 500)`, đảm bảo nếu có sự cố thì chặn lại chứ không thả lọt.

### 2.6. Giới hạn tần suất gọi AI (Rate Limiter)
* **Tệp tin:** `backend/src/modules/ai/ai.routes.ts`, `backend/src/middlewares/rateLimit.middleware.ts`
* **Nguy cơ:** Kẻ xấu spam API trợ lý ảo Gemini để làm cạn kiệt hạn ngạch (quota) hoặc phát sinh chi phí lớn trên Google Cloud.
* **Khắc phục:** Gắn `aiRateLimiter` (tối đa 20 request / phút / IP) cho toàn bộ route AI chat và AI vision.

### 2.7. Thu hồi Refresh Token khi Đăng xuất & Đổi mật khẩu
* **Tệp tin:** `prisma/schema.prisma`, `token.ts`, `auth.service.ts`, `auth.controller.ts`, `auth.routes.ts`
* **Nguy cơ:** Trước đây JWT stateless lưu trong cookie, khi nhấn Đăng xuất server chỉ xóa cookie ở trình duyệt. Kẻ xấu nếu đã trích xuất được Refresh Token trước đó vẫn có thể tiếp tục xin Access Token mới trong suốt 30 ngày.
* **Khắc phục:**
  * Thêm trường `tokenVersion Int @default(0)` vào model `User` trong MongoDB.
  * Đưa `tokenVersion` vào payload của Refresh Token.
  * Khi gọi `POST /api/auth/refresh-token`, kiểm tra: Nếu `payload.tokenVersion !== user.tokenVersion` thì từ chối ngay lập tức (`TOKEN_REVOKED`).
  * Khi người dùng nhấn Đăng xuất (`logout`), đổi mật khẩu (`changePassword`) hoặc đặt lại mật khẩu qua OTP (`resetPassword`), trường `tokenVersion` tự động tăng lên 1 đơn vị, vô hiệu hóa toàn bộ các Refresh Token đã cấp trước đó trên mọi thiết bị.

### 2.8. Bảo đảm tính toán HMAC Webhook trên Raw Body
* **Tệp tin:** `app.ts`, `webhook.service.ts`, `order.controller.ts`
* **Nguy cơ:** Khi Express parse body sang JSON object rồi serialize ngược lại bằng `JSON.stringify()`, thứ tự các key hoặc khoảng trắng bị thay đổi, dẫn đến mã hash HMAC không khớp với chữ ký của đối tác giao vận (GHTK/GHN/PayOS).
* **Khắc phục:**
  * Thêm hook `verify` vào middleware `express.json`: Tự động lưu nguyên vẹn Buffer gốc vào `req.rawBody` đối với các route `/api/webhooks`.
  * `webhook.service.ts`: Tính toán HMAC SHA-256 trực tiếp từ Buffer nguyên bản.
  * Kiểm tra độ dài chữ ký trước khi gọi `crypto.timingSafeEqual` để tránh crash tiến trình Node.js.

### 2.9. Nâng cấp chuẩn mật khẩu mạnh (Password Policy)
* **Tệp tin:** `backend/src/modules/auth/auth.dto.ts`
* **Nguy cơ:** Mật khẩu chỉ yêu cầu 6 ký tự đơn giản dễ bị tấn công vét cạn (brute-force) hoặc tra từ điển (dictionary attack).
* **Khắc phục:**
  * Xây dựng `strongPasswordSchema`:
    * Tối thiểu 8 ký tự (`.min(8)`).
    * Ít nhất 1 chữ cái in hoa (`/[A-Z]/`).
    * Ít nhất 1 chữ số (`/[0-9]/`).
    * Ít nhất 1 ký tự đặc biệt (`/[^A-Za-z0-9]/`).
  * Áp dụng bắt buộc cho: Đăng ký tài khoản, Đổi mật khẩu, và Đặt lại mật khẩu qua OTP.

### 2.10. Rà soát & bao phủ 100% Zod Validation
* **Tệp tin:** `product.dto.ts`, `product.controller.ts` và toàn bộ 12 module
* **Nguy cơ:** Các trường payload gửi lên nếu không qua Zod schema có thể dẫn đến lỗi type runtime hoặc lỗ hổng Mass Assignment.
* **Khắc phục:** Bổ sung `boostProductSchema` cho tính năng đẩy bài/ghim bài (`POST /api/products/:id/boost`). Toàn bộ 100% controller hiện tại đều kiểm duyệt payload qua Zod trước khi chuyển xuống tầng Service.

---

## 3. ĐỢT 2: BẢO VỆ NÂNG CAO & LOGIC NGHIỆP VỤ (PHASE 2 HARDENING)

### 3.1. Khóa tài khoản theo Email chống dò mật khẩu phân tán (Account Lockout)
* **Tệp tin:** `backend/src/modules/auth/auth.service.ts`
* **Nguy cơ:** Kẻ tấn công sử dụng mạng proxy hoặc botnet hàng nghìn IP khác nhau để dò mật khẩu của một tài khoản sinh viên cụ thể (`victim@fpt.edu.vn`). Rate limiter theo IP sẽ bị vô hiệu hóa trong kịch bản này.
* **Khắc phục:**
  * Xây dựng `loginAttemptStore` quản lý số lần đăng nhập sai theo địa chỉ email.
  * Nếu nhập sai mật khẩu 5 lần liên tiếp:
    * Tài khoản bị tạm khóa trong vòng **15 phút**.
    * Trả về HTTP 429 (`ACCOUNT_TEMPORARILY_LOCKED`) kèm số phút còn lại phải chờ.
  * Đăng nhập thành công sẽ xóa bộ đếm về 0.
  * Thiết lập cơ chế tự dọn dẹp bộ nhớ RAM định kỳ mỗi 10 phút để chống rò rỉ bộ nhớ.

### 3.2. Chống spam tăng ảo lượt xem (View Count Inflation Protection)
* **Tệp tin:** `backend/src/modules/products/product.controller.ts`, `backend/src/modules/products/product.service.ts`
* **Nguy cơ:** Mỗi lần gọi `GET /api/products/:id`, hệ thống tự động chạy `viewsCount: { increment: 1 }`. Kẻ xấu có thể dùng script gửi 50.000 request để vừa làm sai lệch độ quan tâm của sản phẩm, vừa làm nghẽn năng lực ghi (I/O Write) của Database.
* **Khắc phục:**
  * Xây dựng bộ đệm `viewCooldownStore` với cơ chế throttle 15 phút.
  * Nhận diện viewer qua `req.ip` hoặc header proxy `x-forwarded-for`.
  * Cùng 1 IP / Viewer chỉ được tính tối đa 1 lượt xem cho 1 sản phẩm trong vòng 15 phút. Các request tiếp theo vẫn trả về thông tin món đồ bình thường nhưng không ghi vào Database.

### 3.3. Xác thực Magic Bytes thực tế cho Video Upload
* **Tệp tin:** `backend/src/config/storage.ts`, `backend/src/modules/products/product.service.ts`
* **Nguy cơ:** Trước đây việc kiểm tra file tải lên chỉ dựa vào header `file.mimetype` do phía client gửi lên. Kẻ xấu có thể đổi đuôi file mã độc (`.exe`, `.sh`, `.php`) thành `.mp4` kèm header `video/mp4` để upload lên máy chủ.
* **Khắc phục:**
  * Xây dựng hàm `isValidVideoBuffer`: Đọc trực tiếp chữ ký nhị phân (Magic Bytes) từ vùng đệm Buffer:
    * **MP4 / MOV / M4V:** Đọc 4 byte tại offset 4..8 phải chứa chuỗi ASCII `ftyp` hoặc `moov`.
    * **WebM / MKV:** Đọc 4 byte đầu tiên phải khớp mã định danh EBML `0x1A 0x45 0xDF 0xA3`.
  * Kiểm tra bắt buộc trước khi lưu trữ cục bộ hoặc đẩy lên Cloudflare R2. Tệp tin giả mạo sẽ bị từ chối ngay với mã lỗi `INVALID_VIDEO_SIGNATURE`.

### 3.4. Siết điều kiện đánh giá Review & Sửa lỗi logic điểm uy tín
* **Tệp tin:** `backend/src/modules/reviews/review.service.ts`
* **Nguy cơ:**
  1. Cho phép đánh giá khi đơn hàng còn ở trạng thái `DELIVERED` (lúc này người mua đang trong 48h bao test và vẫn có thể mở khiếu nại Dispute, dẫn đến đánh giá trước khi giải quyết tranh chấp).
  2. Lỗi logic ngược: Dòng kiểm tra `if (!isBuyer && rating === 5)` khiến điểm uy tín người bán (+5 điểm) không bao giờ được cộng khi người mua chấm 5 sao.
* **Khắc phục:**
  * Chỉ mở quyền đánh giá khi đơn hàng đã chuyển hẳn sang `COMPLETED`.
  * Sửa điều kiện thành `if (isBuyer && rating === 5)`: Khi người mua chấm 5 sao, người bán (`revieweeId`) được cộng chính xác +5 điểm uy tín vào hồ sơ.

### 3.5. Cron Job tự động mở Blind Review sau 7 ngày & Khắc phục lặp cảnh báo
* **Tệp tin:** `backend/src/cron/expirePosts.cron.ts`, `backend/src/modules/reviews/review.service.ts`
* **Nguy cơ:**
  1. Hệ thống thông báo với sinh viên rằng *"Đánh giá sẽ tự động công khai sau 7 ngày"*, nhưng không có cron job nào thực hiện điều này khiến đánh giá bị ẩn mãi mãi nếu đối tác không đánh giá lại.
  2. Cron quét tin hết hạn gửi lặp lại email/notification cảnh báo vào cả 3 ngày liên tiếp (ngày 27, 28, 29).
* **Khắc phục:**
  * Bổ sung phương thức `autoPublishExpiredBlindReviews()` trong `ReviewService`: Quét các review `isPublic: false` có `createdAt <= 7 ngày trước`, tự động cập nhật `isPublic: true` và gửi thông báo cho đối tác.
  * Tích hợp hàm quét này vào tiến trình Cron lúc `00:00:00` hàng ngày.
  * Thêm bộ nhớ `warnedProductIds`: Đảm bảo mỗi tin đăng sắp hết hạn chỉ gửi email và notification cảnh báo đúng 1 lần duy nhất vào ngày thứ 27.

---

## 4. DANH SÁCH CÁC TỆP TIN ĐÃ CHỈNH SỬA

| Đường dẫn tệp tin | Nội dung thay đổi chính |
|:---|:---|
| `backend/src/config/env.ts` | Bỏ default secret, validate min 32 chars, fail-fast trên Production |
| `backend/prisma/schema.prisma` | Thêm trường `tokenVersion Int @default(0)` vào model `User` |
| `backend/src/utils/token.ts` | Đưa `tokenVersion` vào payload Refresh Token, cập nhật hàm verify |
| `backend/src/app.ts` | Thêm hook `verify` lưu `req.rawBody` Buffer cho route webhook |
| `backend/src/modules/auth/auth.dto.ts` | Nâng cấp `strongPasswordSchema` (8+ chars, hoa, số, ký tự đặc biệt) |
| `backend/src/modules/auth/auth.service.ts` | Thêm `loginAttemptStore` khóa 15 phút sau 5 lần sai; tăng `tokenVersion` khi logout/đổi mật khẩu; check revocation khi refresh |
| `backend/src/modules/auth/auth.controller.ts` | Cập nhật method `logout` thu hồi toàn bộ token của phiên |
| `backend/src/modules/auth/auth.routes.ts` | Bổ sung middleware trích xuất token cho route logout |
| `backend/src/modules/orders/order.service.ts` | Hàm `safeCompare` chống timing attack; bộ đếm brute-force OTP 5 lần; ẩn OTP/Token khỏi người mua trong `getOrderById` |
| `backend/src/modules/orders/order.controller.ts` | Truyền `rawBody` Buffer vào hàm xác thực chữ ký số Webhook |
| `backend/src/modules/orders/webhook.service.ts` | Tính HMAC trên Buffer gốc, chống crash lệch độ dài chữ ký |
| `backend/src/modules/products/product.dto.ts` | Bổ sung `boostProductSchema` và export kiểu dữ liệu |
| `backend/src/modules/products/product.controller.ts` | Dùng `boostProductSchema`; truyền IP viewer vào hàm lấy chi tiết sản phẩm |
| `backend/src/modules/products/product.service.ts` | Throttle lượt xem 15 phút / IP; kiểm tra Magic Bytes cho video upload |
| `backend/src/config/storage.ts` | Xây dựng và xuất hàm `isValidVideoBuffer` đọc header MP4/WebM |
| `backend/src/modules/reviews/review.service.ts` | Ràng buộc chỉ review khi `COMPLETED`; sửa logic thưởng điểm uy tín; thêm hàm tự mở review sau 7 ngày |
| `backend/src/cron/expirePosts.cron.ts` | Chặn spam email cảnh báo ngày 27; kích hoạt cron quét mở Blind Review định kỳ lúc 00:00 |
| `backend/tests/unit/sprint3.features.unit.test.ts` | Bổ sung 5 unit test kiểm thử Magic Bytes, Account Lockout và Blind Review TTL |

---

## 5. QUY TRÌNH KIỂM THỬ & KẾT QUẢ NGHIỆM THU

### 5.1. Biên dịch mã nguồn TypeScript
```bash
npm run build
> tsc
```
* **Kết quả:** `Exit code: 0` — Toàn bộ dự án không có bất kỳ lỗi cú pháp hoặc xung đột kiểu dữ liệu (TypeScript type errors).

### 5.2. Chạy toàn bộ Test Suite (Unit & Integration Tests)
```bash
npm test
```
* **Kết quả thực tế:**
  ```text
  # tests 129
  # suites 35
  # pass 129
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 11203.9739
  ```
* **Đánh giá:** Toàn bộ **129/129 test cases** thuộc **35 test suites** đều vượt qua thành công 100%.

---

## 6. LƯU Ý VẬN HÀNH KHI TRIỂN KHAI PRODUCTION

Khi chuẩn bị đưa hệ thống lên máy chủ Production (Docker / VPS / Cloud), đội ngũ phát triển cần đảm bảo:

1. **File `.env` trên Production:**
   * `NODE_ENV=production`
   * `JWT_SECRET` và `JWT_REFRESH_SECRET` phải là chuỗi ngẫu nhiên dài từ 64 đến 128 ký tự hex (có thể sinh bằng lệnh `openssl rand -hex 64`).
   * `SHIPPING_WEBHOOK_SECRET` và `HANDSHAKE_QR_SECRET` phải từ 32 ký tự trở lên.
2. **Cơ sở dữ liệu MongoDB Atlas:**
   * Sau khi cập nhật Prisma schema, hãy chạy `npx prisma db push` hoặc `npx prisma migrate deploy` để đảm bảo các index và cấu trúc mới được áp dụng đầy đủ.
3. **Mật khẩu dịch vụ phụ trợ (`docker-compose.yml`):**
   * Đổi mật khẩu mẫu của Redis (`campusredispass123`) và Meilisearch (`masterKeyFU2026Secure`) sang biến môi trường bí mật trong file `.env.production`.
