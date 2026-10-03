# BÁO CÁO 04: THEO DÕI DANH SÁCH TỐ CÁO VI PHẠM & GHI CHÚ ADMIN (MY REPORTS MODAL)

## 1. Bối cảnh & Vấn đề tồn tại
Môi trường mua bán sinh viên yêu cầu tính minh bạch và an toàn cao để bài trừ các hành vi lừa đảo cọc, bán hàng giả hoặc vi phạm quy chế học đường. Trước đây:
- Sinh viên gửi báo cáo vi phạm qua `ReportModal`, nhưng sau đó không có bất kỳ kênh nào để theo dõi tiến trình xử lý của Ban Quản Trị (BQT).
- Khi Admin xử lý xong (xóa bài, khóa tài khoản vi phạm, hoặc yêu cầu hòa giải), sinh viên không nhận được thông báo hay ghi chú phản hồi chính thức.
- Dẫn đến tâm lý hoài nghi về hiệu quả của công tác kiểm duyệt nội bộ trường.

---

## 2. Giải pháp kỹ thuật đã triển khai

### A. Xây dựng Component `MyReportsModal.tsx`
Tệp: [frontend/src/components/modals/MyReportsModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/modals/MyReportsModal.tsx)

1. **Hiển thị tiến độ xử lý theo mã màu tiêu chuẩn**:
   - `PENDING` (Màu vàng): *Chờ ban quản trị tiếp nhận*.
   - `INVESTIGATING` (Màu xanh dương): *Đang thẩm tra đối chất hai bên*.
   - `RESOLVED` (Màu xanh lá): *Đã xử lý vi phạm & có quyết định kỷ luật*.
   - `DISMISSED` (Màu xám): *Đã từ chối / Bằng chứng chưa đủ căn cứ*.
2. **Khung phản hồi & Ghi chú từ Admin BQT (`adminNote`)**:
   - Mỗi thẻ tố cáo có một khung nổi bật hiển thị nguyên văn lời phản hồi và biện pháp xử lý từ cán bộ trực ban:
     - VD: *"Đã khóa tài khoản người bán 7 ngày vì vi phạm mô tả gian dối linh kiện máy tính."*
     - Hoặc: *"Đã hoàn trả 100% tiền cọc Escrow cho người mua sau khi đối chiếu camera Safe-Point."*
3. **Danh mục bằng chứng đối chiếu**:
   - Hiển thị ảnh chụp màn hình tin nhắn hoặc ảnh hàng hóa mà sinh viên đã đính kèm lúc gửi đơn.
4. **Kết nối API & Tích hợp**:
   - Tự động gọi `reportService.getMyReports()` khi mở modal.
   - Được gắn vào menu hỗ trợ tại Header và trang cá nhân sinh viên.

---

## 3. Trích đoạn mã nguồn tiêu biểu

```tsx
// frontend/src/components/modals/MyReportsModal.tsx
const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ tiếp nhận',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: Clock,
  },
  INVESTIGATING: {
    label: 'Đang thẩm tra',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: ShieldAlert,
  },
  RESOLVED: {
    label: 'Đã giải quyết',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
  DISMISSED: {
    label: 'Đã đóng / Từ chối',
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    icon: XCircle,
  },
};
```

---

## 4. Kết quả đạt được
- Tăng cường trách nhiệm giải trình của Ban Quản Trị Campus đối với sinh viên.
- Khuyến khích văn hóa tố cáo văn minh, loại bỏ gian lận và nâng cao chỉ số tin cậy toàn sàn.
