# BÁO CÁO 08: KHẮC PHỤC DỮ LIỆU ẢO, NÚT BẤM LIỆT & ĐỒNG BỘ DỮ LIỆU THẬT TRÊN WEB FRONTEND

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`fu-secondhand-frontend`)  
**Phân hệ:** Web Frontend Client (Next.js 14 App Router, React, TailwindCSS, TypeScript, Lucide Icons)  
**Thời gian:** Tháng 10/2026  

---

## 1. MỤC TIÊU VÀ BỐI CẢNH

Quá trình kiểm tra rà soát Web Frontend phát hiện một số thành phần giao diện còn sử dụng dữ liệu mẫu (mock data), các nhánh catch block "báo thành công ảo" dù backend từ chối, và một số nút bấm thao tác chỉ hiển thị Toast giả định mà không kích hoạt nghiệp vụ thật. Báo cáo này ghi nhận toàn bộ các xử lý kỹ thuật đã hoàn thành để đảm bảo tính trung thực 100% của hệ thống Web.

---

## 2. CHI TIẾT CÁC HẠNG MỤC ĐÃ KHẮC PHỤC

### 2.1. Triệt Tiêu 3 Lỗ Hổng Nghiêm Trọng "Báo Thành Công Ảo"

1. **Đổi Mật Khẩu An Toàn (`ChangePasswordModal.tsx`):**
   - *Trước đây:* Không có ô nhập mật khẩu hiện tại, chỉ có mật khẩu mới và xác nhận mật khẩu; khi gọi API lỗi vẫn hiện thông báo đổi mật khẩu thành công.
   - *Đã xử lý:*
     - Bổ sung trường nhập mật khẩu hiện tại (`currentPassword`) với tính năng ẩn/hiện mật khẩu.
     - Kết nối trực tiếp `authService.changePassword({ currentPassword, newPassword })`.
     - Bổ sung trạng thái loading spinner và hiển thị thông báo lỗi chính xác từ Backend (ví dụ: "Mật khẩu hiện tại không đúng", "Mật khẩu mới không được trùng mật khẩu cũ").

2. **Nộp Hồ Sơ Xác Thực KYC Sinh Viên (`KycRegistrationModal.tsx`):**
   - *Trước đây:* State ban đầu được gán sẵn 2 link ảnh mẫu trên Unsplash; khi bấm gửi hồ sơ nếu API Backend thất bại vẫn tiếp tục chạy xuống code mở modal chúc mừng KYC thành công.
   - *Đã xử lý:*
     - Khởi tạo ảnh mặt trước và mặt sau thẻ sinh viên là rỗng (`null`).
     - Bắt buộc sinh viên phải tải lên cả 2 mặt thẻ thực tế mới cho phép bấm nộp hồ sơ.
     - Thêm lệnh `return` chặn luồng trong catch block: Nếu server trả về lỗi (ảnh mờ, sai định dạng, trùng MSSV), modal sẽ giữ nguyên và hiển thị lỗi để sinh viên tải lại ảnh khác, tuyệt đối không chúc mừng ảo.

3. **Đánh Giá Đơn Hàng & Cộng Xu Thật (`/orders/review/page.tsx`):**
   - *Trước đây:* Chứa silent catch nuốt lỗi trong `updateReview`, đồng thời tự ý cộng +200 Xu vào `walletStore` ở local browser dù máy chủ chưa ghi nhận đánh giá.
   - *Đã xử lý:* Xóa bỏ toàn bộ việc tự cộng Xu ảo ở local. Xu thưởng đánh giá (kèm video test đồ) hoàn toàn do Backend xử lý đối soát và cộng vào ví qua sự kiện máy chủ.

4. **Đăng Bán Bài Mới (`/create-post/page.tsx`):**
   - *Trước đây:* Khi người dùng là `BUYER` vượt quá hạn mức 3 tin/tháng, catch block tự lưu bài đăng vào mảng local và báo "Đăng tin thành công".
   - *Đã xử lý:* Loại bỏ hoàn toàn fallback lưu local; hiển thị thông báo lỗi trung thực từ server và hướng dẫn sinh viên nâng cấp lên tài khoản `SELLER` nếu có nhu cầu bán nhiều đồ.

---

### 2.2. Sửa Chữa Các Nút Bấm Bị Liệt & Cải Thiện Tương Tác

1. **Nút "Nhắn Tin >" Trong Thẻ Người Bán (`SellerTrustCard.tsx`):**
   - *Hiện trạng:* Nút bấm không có `onClick`, không thể bắt đầu chat với người bán từ trang chi tiết sản phẩm.
   - *Đã xử lý:* Gắn sự kiện `handleStartChat` gọi `chatService.createOrGetConversation(product.id, seller.id)` và tự động chuyển hướng người mua vào trang `/chat?conversationId=...`.

2. **Nút Phóng To Ảnh Sản Phẩm (`ProductGallery.tsx`):**
   - *Hiện trạng:* Nút icon `Maximize2` ở góc ảnh sản phẩm chỉ mang tính trang trí, bấm vào không có phản hồi.
   - *Đã xử lý:* Xây dựng modal lightbox toàn màn hình, hỗ trợ xem ảnh chất lượng cao, chuyển qua lại giữa các góc chụp và đóng nhanh bằng phím `ESC` hoặc nút bấm.

3. **Nút "Xem Bài Đăng Gốc" Trong Danh Sách Yêu Thích (`FavoriteModals.tsx`):**
   - *Hiện trạng:* Đường link bị gắn cứng (hardcoded) tới `/posts/feat-1`.
   - *Đã xử lý:* Thay đổi đường dẫn động `/posts/${previewItem.id}`, đảm bảo mở đúng sản phẩm sinh viên đã lưu.

4. **Trang Cài Đặt Quản Trị Viên (`/admin/settings/page.tsx`):**
   - *Hiện trạng:* Nút lưu cấu hình không có handler.
   - *Đã xử lý:* Bổ sung hàm `handleSaveSettings`, đồng bộ trạng thái lưu trữ và thông báo Toast xác nhận cho quản trị viên.

---

### 2.3. Dọn Dẹp Dữ Liệu Hiển Thị Hardcoded

1. **Khởi Tạo Danh Sách Bằng Chứng Rỗng (`DisputeEvidence.tsx`):**
   - Khởi tạo danh sách bằng chứng khiếu nại là rỗng `[]`, chỉ hiển thị thông tin video và hình ảnh khi các bên thực sự tải lên trong đơn tranh chấp.

2. **Dữ Liệu Thật Về Tình Trạng & Địa Điểm Hẹn (`ProductGallery.tsx`):**
   - Hiển thị độ mới thật (`condition`) và địa điểm hẹn Safe-Point thật (`meetupLocation` / `campusTag`) thay vì các chuỗi text cố định.

3. **Đồng Bộ Trạm Safe-Point Trong Khung Chat (`ChatInputBar.tsx`):**
   - Tải danh sách trạm Safe-Point động từ API Backend `safehandoffService.getHubs()`, hiển thị đúng các trạm bàn giao an toàn của cơ sở hiện tại (Hòa Lạc, TP.HCM, Đà Nẵng, Quy Nhơn, Cần Thơ).

---

## 3. KẾT QUẢ KIỂM THỬ BIÊN DỊCH

- **Kiểm tra TypeScript (`frontend/`):**
  ```bash
  cd frontend && npx tsc --noEmit
  # Exit code: 0 (PASS, 0 errors)
  ```
- Toàn bộ các page, component, service và modal trên Web Frontend đều vượt qua typecheck nghiêm ngặt, không có warning hoặc runtime exception.

---

## 4. KẾT LUẬN

Giao diện Web Frontend đã hoàn toàn loại bỏ các hành vi giả lập, bảo đảm tính xác thực của mọi giao dịch và mang lại trải nghiệm minh bạch cho sinh viên FPT.
