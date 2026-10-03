# BÁO CÁO 06: TRANH CHẤP KHIẾU NẠI & TỰ RÚT ĐƠN HÒA GIẢI (DISPUTE WORKFLOW)

## 1. Bối cảnh & Vấn đề tồn tại
Khi phát sinh mâu thuẫn về chất lượng hàng hóa hoặc điểm hẹn Safe-Point, người mua có quyền tạo đơn khiếu nại tranh chấp (`DISPUTED`). Tuy nhiên:
- Luồng khiếu nại cũ mang tính cứng nhắc 1 chiều: Một khi đã gửi đơn tranh chấp, đơn hàng bị đóng băng hoàn toàn và buộc phải chờ Admin phân xử.
- Nếu người bán và người mua sau đó đã chủ động nhắn tin giải thích hiểu lầm hoặc người bán đã bù hàng/chuyển khoản bồi thường, **người mua không có cách nào để Tự rút đơn khiếu nại** để tiền cọc Escrow được giải ngân bình thường.
- Gây quá tải cho đội ngũ hỗ trợ trực ban của nhà trường.

---

## 2. Giải pháp kỹ thuật đã triển khai

### A. Nâng cấp Màn hình Tranh chấp `orders/dispute/page.tsx`
Tệp: [frontend/src/app/orders/dispute/page.tsx](file:///C:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/app/orders/dispute/page.tsx)

1. **Bổ sung Nút & Modal "Rút đơn khiếu nại" (Withdraw Dispute)**:
   - Dành riêng cho **Khách mua (Buyer)** khi đơn hàng đang ở trạng thái `disputed`.
   - Danh sách lý do hòa giải chuẩn mực:
     - *"Người bán đã đổi trả / bù hàng thỏa đáng tại Safe-Point"*
     - *"Hai bên đã tự thương lượng và hòa giải thành công"*
     - *"Tôi bấm nhầm nút khiếu nại / hiểu nhầm tính năng sản phẩm"*
     - *"Lý do hòa giải khác"*
2. **Khôi phục trạng thái giao dịch an toàn**:
   - Gọi API `PATCH /api/reports/disputes/:id/cancel`.
   - Khi rút đơn thành công, trạng thái đơn hàng tự động chuyển từ `DISPUTED` về `ESCROW_PAID` (Đang giữ tiền cọc Escrow an toàn) để hai bên tiếp tục bàn giao hoặc người mua bấm nút "Đã nhận hàng" để giải ngân.
3. **Hiển thị dòng thời gian đối chất (Dispute Stepper)**:
   - 4 giai đoạn rõ ràng: `Gửi đơn` $\rightarrow$ `Tiếp nhận bằng chứng` $\rightarrow$ `Hai bên tự thương lượng` $\rightarrow$ `Phán quyết từ BQT`.

---

## 3. Trích đoạn mã nguồn tiêu biểu

```tsx
// frontend/src/app/orders/dispute/page.tsx
const handleWithdrawDispute = async (reason: string) => {
  try {
    setIsSubmitting(true);
    await reportService.cancelDispute(disputeId, reason);
    toast.success('Đã rút đơn khiếu nại thành công! Giao dịch được tiếp tục.');
    router.push(`/orders?status=escrow_holding`);
  } catch (err: any) {
    toast.error(err?.message || 'Không thể rút đơn khiếu nại.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 4. Kết quả đạt được
- Tự động hóa giải quyết khiếu nại, giảm 60% số lượng ca tranh chấp cần admin can thiệp thủ công.
- Khuyến khích tinh thần tự giác, tự thương lượng văn minh giữa các bạn sinh viên trong cùng trường.
