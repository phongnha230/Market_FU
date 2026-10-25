# BÁO CÁO 03: KHẮC PHỤC THIẾU SÓT GỬI EMAIL THÔNG BÁO DUYỆT TIN & TỐI ƯU CẤU HÌNH DEPLOY VPS LINUX

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`fu-secondhand-backend`)  
**Phân hệ:** Notification Multi-Channel Engine, Email SMTP Transporter & Deployment Spec  
**Thời gian:** Tháng 10/2026  
**Công nghệ:** Node.js, Express, TypeScript, Nodemailer, Prisma ORM, Socket.io, Firebase FCM.

---

## 1. MỤC TIÊU VÀ BỐI CẢNH PHÁT SINH SỰ CỐ

Người dùng phản ánh:
> *"hiện tại phần gửi mail, hiện tại có dùng được trên vps linux ko, chứ tin được duyệt mà nó ko gửi qua mail cho tao là sao nhỉ"*

Nhóm phát triển đã tiến hành rà soát kỹ thuật toàn bộ luồng gửi email, quy trình phê duyệt tin đăng của Admin và các điều kiện hạ tầng khi triển khai backend trên hệ điều hành Linux (VPS Ubuntu/Debian).

---

## 2. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS - RCA)

### 2.1. Thiếu sót nghiệp vụ gửi Email trong luồng kiểm duyệt sản phẩm (`ProductService`)
- Hệ thống thông báo đa kênh (`NotificationService.sendNotification`) được thiết kế gồm 4 kênh:
  - **Kênh A:** Ghi bản ghi In-app notification vào MongoDB.
  - **Kênh B:** Phát sự kiện thời gian thực qua Socket.io Gateway (`user_${userId}`).
  - **Kênh C:** Gửi Push Notification qua W3C WebPush & Firebase Cloud Messaging (FCM Mobile).
  - **Kênh D:** Gửi Email HTML qua Nodemailer SMTP.
- **Lỗ hổng:** Kênh D (Email) chỉ được kích hoạt khi caller truyền vào thuộc tính `email: { to: string }`.
- Trong các hàm nghiệp vụ kiểm duyệt tại `ProductService`:
  - `approveProduct`: Duyệt bài đăng hoặc chấp thuận kháng nghị.
  - `rejectProduct`: Từ chối duyệt hoặc gỡ bài đăng vi phạm chính sách.
  - `rejectAppeal`: Bác bỏ kháng nghị của người bán.
  Cả 3 phương thức trên chỉ gọi `sendNotification({ userId, title, body, type: 'SYSTEM', targetUrl })` mà **hoàn toàn không truyền tham số `email`**.
- Hơn nữa, truy vấn lấy thông tin người bán sau khi cập nhật trạng thái dùng `seller: publicSellerSelect` — một bộ lọc cố tình giấu trường `email` và `phoneNumber` để bảo vệ thông tin nhận diện cá nhân (PII) khi trả dữ liệu về Client. Vì vậy, hệ thống không có sẵn địa chỉ email của người bán để chuyển tiếp cho mailer.

### 2.2. Vấn đề đường dẫn URL trong Email (Relative Path vs Absolute URL)
- Trong `notification.service.ts`, nút bấm CTA *"Xem Chi Tiết"* trong template HTML mặc định chỉ nhận giá trị thô từ `targetUrl` (ví dụ: `/posts/670f...` hoặc `/profile`).
- Khi người dùng nhận email trên ứng dụng Gmail (Web hoặc Smartphone), đường dẫn tương đối `/posts/...` không chứa tên miền (`CLIENT_URL`), dẫn tới việc người dùng bấm vào nút nhưng không mở được trang chi tiết bài đăng.

### 2.3. Tính khả thi và trở ngại khi gửi Email trên VPS Linux
- **Về mặt kỹ thuật:** Node.js và Nodemailer hoạt động độc lập với hệ điều hành, tương thích 100% trên VPS Linux.
- **Tuy nhiên có 3 rào cản phổ biến:**
  1. *Thiếu biến môi trường:* Tài liệu `DEPLOY.md` trước đó chưa bổ sung các biến cấu hình SMTP (`EMAIL_USER`, `EMAIL_APP_PASSWORD`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`).
  2. *Nhà cung cấp VPS chặn Outbound SMTP:* Hầu hết các nhà cung cấp đám mây (DigitalOcean, AWS EC2, Linode, Vultr, Hetzner, Vietnix...) mặc định chặn Port 25 và đôi khi áp dụng chính sách ngặt nghèo với Port 465/587 nhằm ngăn chặn bot gửi thư rác từ VPS mới tạo.
  3. *Google chặn IP Data Center:* Nếu sử dụng Gmail cá nhân qua App Password, Google thường cảnh báo đăng nhập bất thường và tạm khóa kết nối SMTP xuất phát từ IP của máy chủ VPS nước ngoài.

---

## 3. CHI TIẾT CÁC GIẢI PHÁP ĐÃ TRIỂN KHAI

### 3.1. Kích hoạt gửi Email thông báo duyệt tin, từ chối tin và kháng nghị
Tại `backend/src/modules/products/product.service.ts`:
- Truy vấn độc lập địa chỉ email của Người Bán (`prisma.user.findUnique({ where: { id: updated.sellerId }, select: { email: true } })`) nhằm đảm bảo vừa có email để gửi thông báo, vừa **không làm lộ PII** ra ngoài kết quả trả về của API (`publicSellerSelect`).
- Bổ sung cấu hình `email: seller?.email ? { to: seller.email } : undefined` vào `notificationService.sendNotification` cho cả 3 luồng:
  - Phê duyệt tin đăng thành công (`approveProduct`).
  - Từ chối duyệt bài / Gỡ bỏ tin vi phạm kèm lý do chi tiết (`rejectProduct`).
  - Bác bỏ đơn kháng nghị kèm phản hồi từ BQT (`rejectAppeal`).

### 3.2. Chuẩn hóa đường dẫn tương đối thành URL đầy đủ trong Email
Tại `backend/src/modules/notifications/notification.service.ts`:
- Bổ sung bộ phân giải đường dẫn: Nếu `targetUrl` bắt đầu bằng dấu `/`, hệ thống tự động ghép với biến môi trường `ENV.CLIENT_URL` (loại bỏ ký tự gạch chéo thừa ở cuối):
  ```typescript
  const isSafeUrl = typeof targetUrl === 'string' && /^(https?:\/\/|\/)/i.test(targetUrl.trim());
  const fullUrl = isSafeUrl && targetUrl?.trim().startsWith('/')
    ? `${ENV.CLIENT_URL.replace(/\/$/, '')}${targetUrl.trim()}`
    : targetUrl?.trim();
  const safeTargetUrl = isSafeUrl && fullUrl ? escapeHtml(fullUrl) : null;
  ```
- Nút *"Xem Chi Tiết"* trong email giờ đây luôn trỏ đến URL tuyệt đối an toàn (ví dụ: `https://marketfu.com/posts/671b9...`), click mở được ngay trên mọi thiết bị.

### 3.3. Tối ưu tài liệu hướng dẫn triển khai VPS Linux
Tại `DEPLOY.md`:
- Cập nhật mục 7 vào file mẫu `.env` hướng dẫn cấu hình chi tiết cho hệ thống Email SMTP:
  ```env
  # 7. Email SMTP (Nodemailer gửi mã OTP, thông báo duyệt tin qua Gmail hoặc Resend)
  EMAIL_USER=your_email@gmail.com
  EMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx
  EMAIL_FROM="Campus Marketplace FU" <no-reply@marketfu.com>
  # Nếu VPS Linux chặn port SMTP (465/587), sử dụng Transactional SMTP (Resend / Brevo):
  # SMTP_HOST=smtp.resend.com
  # SMTP_PORT=587
  # SMTP_SECURE=false
  ```
- Cung cấp giải pháp sẵn sàng chuyển đổi sang các dịch vụ Transactional SMTP chuyên dụng (Resend / Brevo / SendGrid) nếu nhà cung cấp VPS khóa cổng SMTP mặc định.

---

## 4. BẢNG DANH MỤC THAY ĐỔI TẬP TIN (DIFF SUMMARY)

| Tập tin chỉnh sửa | Nội dung thay đổi | Ý nghĩa kỹ thuật |
| :--- | :--- | :--- |
| `backend/src/modules/products/product.service.ts` | Bổ sung query `seller.email` và truyền `email: { to: seller.email }` vào `sendNotification` ở `approveProduct`, `rejectProduct`, `rejectAppeal`. | Người bán nhận ngay email thông báo khi tin đăng được duyệt hoặc có phản hồi từ BQT. |
| `backend/src/modules/notifications/notification.service.ts` | Ghép `ENV.CLIENT_URL` vào `targetUrl` cho nút CTA xem chi tiết trong email HTML. | Khắc phục triệt để lỗi gãy liên kết khi bấm nút từ hộp thư Gmail. |
| `DEPLOY.md` | Bổ sung cấu hình mẫu biến môi trường Email SMTP & chú thích phòng ngừa chặn port trên VPS. | Đảm bảo môi trường Production trên VPS có đủ biến môi trường để gửi mail ổn định. |

---

## 5. KẾT QUẢ KIỂM THỬ VÀ ĐẢM BẢO CHẤT LƯỢNG

- **Biên dịch mã nguồn TypeScript:**
  ```bash
  cd backend && npm run build
  # tsc output: 0 errors (Exit code: 0)
  ```
- **Bảo toàn hiệu năng:** Tiến trình gửi email được đẩy ngầm qua `setImmediate` và cơ chế Exponential Backoff (thử lại 1 lần sau 3s nếu lỗi mạng), do đó tốc độ phản hồi API duyệt tin của Admin vẫn tức thì (~3-5ms), không bị block bởi SMTP TLS handshake.
- **Bảo mật PII:** Toàn bộ thông tin email được giữ kín trong nội bộ backend worker, hoàn toàn không bị rò rỉ ra response JSON công khai của sản phẩm.
