# BÁO CÁO 01: MODAL HỦY ĐƠN AN TOÀN & TÓM TẮT HOÀN CỌC ESCROW (FRONTEND)

## 1. Bối cảnh & Vấn đề tồn tại trước đây
Trước phiên làm việc này, quy trình hủy đơn hàng trên giao diện Web Frontend (`/orders`) tồn tại các hạn chế nghiêm trọng:
1. **Thiếu tính minh bạch tài chính**: Người dùng không nhìn thấy số tiền cọc Escrow đã thanh toán và số FPT Coin đã dùng sẽ được hoàn trả ra sao sau khi hủy đơn.
2. **Không phân định vai trò**: Sử dụng hộp thoại xác nhận hủy chung chung, không tách biệt lý do hủy giữa **Khách mua (Buyer)** và **Người bán (Seller)**.
3. **Thiếu cơ chế cảnh báo trách nhiệm**: Không nhắc nhở người dùng về cam kết giao dịch tại Safe-Point nội bộ trường đại học FPT.

---

## 2. Giải pháp kỹ thuật đã triển khai

### A. Xây dựng Component `OrderCancelModal.tsx`
Tệp: [frontend/src/components/orders/OrderCancelModal.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/orders/OrderCancelModal.tsx)

1. **Phân hóa lý do theo vai trò (`isSellerViewer`)**:
   - **Khách mua (Buyer)**:
     - *"Thay đổi nhu cầu, không còn cần sản phẩm này"*
     - *"Tìm thấy sản phẩm khác giá tốt hơn / gần hơn"*
     - *"Người bán không phản hồi tin nhắn / không hẹn Safe-Point"*
     - *"Phát hiện thông tin mô tả sản phẩm không đúng thực tế"*
     - *"Lý do cá nhân khác"*
   - **Người bán (Seller)**:
     - *"Hàng hóa đã bán trên kênh khác / không còn sẵn có"*
     - *"Sản phẩm phát hiện bị lỗi / hư hỏng trước khi giao"*
     - *"Không sắp xếp được thời gian gặp tại Safe-Point đã chọn"*
     - *"Khách mua yêu cầu hủy giao dịch qua tin nhắn"*
     - *"Lý do cá nhân khác"*
2. **Bảng tóm tắt chính sách hoàn cọc Escrow tự động**:
   - Hiển thị rõ tổng tiền hàng, số FPT Coin đã áp dụng.
   - Thẻ thông báo màu xanh lá khẳng định: *"100% tiền cọc Escrow và FPT Xu (nếu có) sẽ được hoàn trả tự động vào Ví Campus ngay khi thao tác hủy thành công."*
3. **Ô nhập lý do bổ sung bắt buộc khi chọn 'Lý do khác'**:
   - Tối thiểu 6 ký tự để đảm bảo có căn cứ rõ ràng cho hệ thống kiểm toán đơn hàng.
4. **Kết nối API**:
   - Gọi hàm `orderService.cancelOrder(orderId, finalReason)`.
   - Cập nhật state đơn hàng tại [OrderCard.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/orders/OrderCard.tsx) và [orderStore.ts](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/stores/orderStore.ts) thành `CANCELLED`.

---

## 3. Trích đoạn mã nguồn tiêu biểu

```tsx
// frontend/src/components/orders/OrderCancelModal.tsx
const BUYER_CANCEL_REASONS = [
  'Thay đổi nhu cầu, không còn cần sản phẩm này',
  'Tìm thấy sản phẩm khác giá tốt hơn / gần hơn',
  'Người bán không phản hồi tin nhắn / không hẹn Safe-Point',
  'Phát hiện thông tin mô tả sản phẩm không đúng thực tế',
  'Lý do cá nhân khác',
];

const SELLER_CANCEL_REASONS = [
  'Hàng hóa đã bán trên kênh khác / không còn sẵn có',
  'Sản phẩm phát hiện bị lỗi / hư hỏng trước khi giao',
  'Không sắp xếp được thời gian gặp tại Safe-Point đã chọn',
  'Khách mua yêu cầu hủy giao dịch qua tin nhắn',
  'Lý do cá nhân khác',
];
```

---

## 4. Kết quả đạt được
- **Trải nghiệm người dùng**: Giao diện Modal hiện đại với backdrop mờ, icon trực quan và cảnh báo màu cam/đỏ đúng chuẩn an toàn.
- **Tính an toàn giao dịch**: Hạn chế tối đa các trường hợp hủy vô cớ; dữ liệu lý do hủy được lưu lại đầy đủ trên cơ sở dữ liệu làm cơ sở đánh giá độ uy tín tài khoản.
