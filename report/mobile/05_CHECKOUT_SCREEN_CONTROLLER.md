# BÁO CÁO 05: TÁI CẤU TRÚC CONTROLLER MÀN HÌNH THANH TOÁN (CHECKOUT)

## 1. Vấn đề phát hiện
- **File**: `src/features/checkout/screens/CheckoutScreen.tsx`
- **Tình trạng ban đầu**:
  - Vi phạm quy tắc `no-high-complexity-react-function`.
  - Màn hình chứa toàn bộ logic xử lý luồng đặt hàng:
    - Tính toán tiền hàng, chiết khấu voucher, phí dịch vụ Safe-Point FPT.
    - Lựa chọn phương thức thanh toán: COD, Ví Campus Pay, Chuyển khoản VietQR.
    - Chọn địa điểm hẹn nhận hàng an toàn (Safe-Point Hubs).
    - Tạo đơn hàng vào `orderStore`, trừ số dư ví vào `walletStore`, đánh dấu sử dụng voucher vào `voucherStore`.
    - Điều hướng sang màn hình thành công `CheckoutSuccessScreen`.
  - Toàn bộ subcomponents trong thư mục `src/features/checkout/components/` chưa được ghép nối hiệu quả vào màn hình chính.

---

## 2. Giải pháp kỹ thuật

### A. Xây dựng Controller Hook
Tạo hook [`useCheckoutController.ts`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/hooks/useCheckoutController.ts):
- Quản lý trạng thái:
  - `selectedSafePoint`: Điểm hẹn Safe-Point tại Campus.
  - `selectedPayment`: Phương thức thanh toán được chọn.
  - `selectedVoucher`: Mã giảm giá sinh viên được áp dụng.
  - `note`: Ghi chú đơn hàng.
  - `isProcessing`: Cờ báo đang xử lý đơn hàng nhằm ngăn chặn double-submit.
- Đóng gói hàm đặt hàng `handleConfirmOrder`:
  - Kiểm tra điều kiện số dư ví sinh viên nếu chọn thanh toán bằng ví.
  - Gọi action `createOrder` tạo đơn mới với mã bảo mật OTP.
  - Cập nhật kho voucher và chuyển hướng an toàn.

### B. Ghép nối Subcomponents dạng Declarative
Biến [`CheckoutScreen.tsx`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/screens/CheckoutScreen.tsx) thành màn hình khai báo dạng compose rõ ràng:
- [`CheckoutEscrowBanner`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutEscrowBanner.tsx): Banner bảo hiểm tiền cọc FPT Escrow.
- [`CheckoutProductCard`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutProductCard.tsx): Thông tin sản phẩm, giá, người bán.
- [`CheckoutSafePointCard`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutSafePointCard.tsx): Điểm hẹn bàn giao đồ.
- [`CheckoutPaymentMethods`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutPaymentMethods.tsx): Bộ chọn phương thức thanh toán.
- [`CheckoutVoucherCard`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutVoucherCard.tsx): Danh mục voucher giảm giá.
- [`CheckoutSummaryCard`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutSummaryCard.tsx): Bảng tổng kết số tiền chi tiết.
- [`CheckoutBottomBar`](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/checkout/components/CheckoutBottomBar.tsx): Nút xác nhận đặt hàng gắn liền bottom insets.

---

## 3. Kết quả
- Màn hình `CheckoutScreen.tsx` đạt tiêu chuẩn **Clean Architecture**: View chỉ render, không nắm giữ business logic.
- Khắc phục hoàn toàn cảnh báo `no-high-complexity-react-function`.
- Đảm bảo an toàn giao dịch tài chính sinh viên, ngăn chặn triệt để đặt hàng trùng lặp.
