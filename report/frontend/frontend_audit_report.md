# 🌐 BÁO CÁO KIỂM TRA & RÀ SOÁT WEB FRONTEND (Next.js)

> Ngày xuất báo cáo: 17/10/2026  
> Tình trạng biên dịch: **Production Build: Pass 100% (29/29 Static/Dynamic Routes, 0 TypeScript Errors)**

---

## 1. TỔNG QUAN HỆ THỐNG WEB
- **Công nghệ**: Next.js 16.3.4 (App Router & Turbopack), TailwindCSS, Zustand stores, Lucide icons, React Query.
- **Phạm vi rà soát**: Toàn bộ các trang sinh viên (`/posts`, `/checkout`, `/chat`, `/orders`, `/vouchers`, `/profile`) và trang quản trị (`/admin/*`).

---

## 2. CÁC ĐIỂM DỮ LIỆU GIẢ / HÀNH VI CẦN LƯU Ý ĐÃ RÀ SOÁT

### 2.1. CÁC LỖI NGUY HIỂM / LOGIC (ĐÃ XÁC ĐỊNH & CẦN ĐỒNG BỘ VỚI BACKEND)
1. **Đổi mật khẩu (`ChangePasswordModal.tsx`)**:
   - Hiện tại modal chưa gọi `PATCH /auth/change-password` của backend (trong khi bên Mobile đã có service gọi). Cần trỏ trực tiếp vào endpoint backend để xác thực mật khẩu cũ.
2. **Nộp hồ sơ KYC (`KycRegistrationModal.tsx`)**:
   - Khi API gặp sự cố, khối `catch` không `return` mà vẫn set store local và hiện thông báo nộp thành công. Cần bắt buộc báo lỗi đỏ và giữ form để sinh viên thử lại.
3. **Đánh giá đơn hàng (`/orders/review/page.tsx`)**:
   - Khi chỉnh sửa review gặp lỗi, đang rơi vào comment `// offline fallback`. Khi tạo review mới, cộng xu qua hàm `addCoins()` local thay vì nhận số dư chính xác từ Backend response.

### 2.2. NÚT CHỨC NĂNG / FORM CẦN HOÀN THIỆN SỰ KIỆN
- **Nút Nhắn tin (`SellerTrustCard.tsx`)**: Khi đã đăng nhập, bấm nút "Nhắn tin >" cần điều hướng trực tiếp sang phòng chat của người bán kèm sản phẩm liên quan.
- **Admin Settings (`/admin/settings/page.tsx`)**: Nút "Lưu cài đặt" cần kết nối với backend để lưu thông số hệ thống, không chỉ lưu biến state tạm thời.
- **Xem ảnh phóng to (`ProductGallery.tsx`)**: Cần mở Modal Lightbox xem full ảnh khi bấm "Xem toàn màn hình".

### 2.3. DỮ LIỆU CỨNG (HARDCODED STRINGS) CẦN THAY THẾ
- Bằng chứng khiếu nại mẫu trong `DisputeEvidence.tsx` (ảnh bàn phím và video mp4 placeholder).
- Mã khiếu nại cố định `ORD-88392-HCM-HL` trong `OrderAiBotModal.tsx` và `AIChatbotWidget.tsx`.
- Số điện thoại / STK fallback trong `ChatInputBar.tsx` cần chuyển sang lấy từ thông tin profile người bán.
- Xóa bỏ file `mockProducts.ts` cũ không còn dùng trong dự án.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG
- Lệnh: `npm run build`
- Kết quả: **29/29 routes build thành công, 0 lỗi TypeScript, 0 lỗi cú pháp.**
