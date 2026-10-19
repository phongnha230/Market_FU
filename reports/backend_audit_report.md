# 🖥️ BÁO CÁO KIỂM TRA & RÀ SOÁT BACKEND (FU Student Second-hand Market)

> Ngày xuất báo cáo: 17/10/2026  
> Tình trạng biên dịch: **TypeScript: 0 lỗi (`npx tsc --noEmit` Pass)**

---

## 1. TỔNG QUAN HỆ THỐNG BACKEND
- **Môi trường & Công nghệ**: Node.js, Express, TypeScript, Prisma ORM / MongoDB / PostgreSQL, Socket.io, Meilisearch Engine.
- **Vai trò**: Cung cấp toàn bộ RESTful API & Realtime Socket cho cả Web (`frontend/`) và App (`mobile/`).

---

## 2. DANH MỤC API ENDPOINTS ĐANG HOẠT ĐỘNG TỐT NHƯNG UI CHƯA KHAI THÁC HẾT

| STT | Endpoint | Phương thức | Mô tả chức năng | Tình trạng tích hợp trên UI |
| :---: | :--- | :---: | :--- | :--- |
| 1 | `/products/trending/items` | `GET` | Trả về danh sách sản phẩm hot theo độ tương tác (views, likes, bids) | Web & Mobile đang tự tính toán client-side thay vì gọi trực tiếp endpoint này |
| 2 | `/users/leaderboard/reputation` | `GET` | Bảng xếp hạng điểm uy tín & top sellers của các campus | Chưa có trang hiển thị trên Web & Mobile |
| 3 | `/safe-handoff/nearby` | `GET` | Gợi ý trạm Safe-Handoff gần nhất dựa trên tọa độ GPS sinh viên | Mobile đang gọi list chung thay vì truyền tọa độ vị trí |
| 4 | `/profile/admin/quests` | `GET / POST / PATCH` | Quản trị viên cấu hình nhiệm vụ nhận xu/voucher | Service Web đã viết sẵn nhưng chưa gắn UI Form quản lý |
| 5 | `/categories` | `POST / PATCH / DELETE` | Quản lý thêm/sửa/xóa danh mục ngành hàng | Chỉ có API, chưa có màn hình Quản trị viên trong Admin portal |
| 6 | `/auth/forgot-password` & `/auth/reset-password` | `POST` | Quên mật khẩu qua email sinh viên FPT | Web đã dùng; Mobile mới chỉ hiển thị Alert thông báo |
| 7 | `/reviews/:id/toggle-public` | `POST` | Cho phép người bán ẩn/hiện review trên trang cá nhân | Web đã dùng; Mobile trước đó lưu local |
| 8 | `/reports/upload-evidence` | `POST` | Upload file/video bằng chứng tranh chấp khiếu nại | Web đã dùng; Mobile trước đó bỏ qua ảnh đính kèm |
| 9 | `/payments/order/:code/status` | `GET` | Polling trạng thái thanh toán đơn hàng real-time | Web đã dùng; Mobile chuyển thẳng sang màn Success |
| 10 | `/orders/:id/shipping` | `PATCH` | Người bán cập nhật mã vận đơn giao hàng liên campus | Web đã dùng; Mobile chưa có input nhập mã |

---

## 3. RÀ SOÁT CƠ CHẾ BẢO MẬT & XỬ LÝ LỖI (SECURITY & LOGIC)
1. **Kiểm tra Hạn mức Đăng tin (Rate-limiting bài đăng)**:
   - Backend đã có rule chặn sinh viên thường đăng quá 3 tin/tháng. Khi vượt hạn mức, Backend trả về HTTP `400 Bad Request` kèm message thông báo rõ ràng.
   - Trước đây Mobile bắt lỗi trong catch rồi tự rơi xuống lưu offline và báo thành công. Đã được khắc phục để hiển thị đúng thông báo từ backend.
2. **Xác thực JWT Token & Phân quyền**:
   - `Buyer` không được gọi các endpoint nhạy cảm của `Seller` hoặc `Admin`.
   - Cần đảm bảo token hết hạn trả về `401 Unauthorized` và UI tự động đăng xuất / refresh token thay vì dùng token giả.
3. **Escrow (Quỹ tạm giữ)**:
   - Dòng tiền cọc được giữ an toàn tại ví hệ thống cho tới khi người mua bấm "Đã nhận hàng thành công" hoặc hết hạn khiếu nại (48h).

---

## 4. KHUYẾN NGHỊ HÀNH ĐỘNG TIẾP THEO
- Mở rộng thêm Unit Test cho các luồng thanh toán Escrow (`orders`, `payments`).
- Hoàn thiện trang Admin Quản lý Danh mục (`/admin/categories`).
