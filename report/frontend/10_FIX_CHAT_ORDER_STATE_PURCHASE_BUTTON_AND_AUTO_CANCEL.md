# 10. Báo Cáo Xử Lý: Ẩn Nút Mua Hàng Khi Đã Đặt Đơn, Thẻ Đơn Hàng Escrow & Tự Động Đẩy Thông Báo Hủy Đơn Chat

## 1. Bối cảnh & Yêu cầu
Người dùng phát hiện 3 điểm bất hợp lý trong giao diện chat (Web Frontend):
1. **Đơn đã mua xong nhưng vẫn hiện nút mua hàng:** Ở thanh ghim sản phẩm trên đầu (`PinnedProductBar`), khi đã có đơn đặt mua (`[ORDER_CREATED] #ORD-...`) thành công, nút "Đặt mua ngay" / "Đặt Safe-Handoff" và nút "Đề nghị giá" vẫn hiển thị, dẫn tới nguy cơ người dùng đặt trùng đơn hoặc gây hiểu nhầm.
2. **Tin nhắn đặt đơn hiển thị dạng text thô:** Tin nhắn `[ORDER_CREATED]` trên Web hiển thị như một bubble chat bình thường thay vì dạng thẻ vé đơn hàng Escrow chuyên nghiệp như trên Mobile (`ChatOrderTicketBubble`).
3. **Đơn bị hủy chưa tự động thông báo trong chat:** Khi đơn hàng bị hủy (do người mua hủy, người bán từ chối hoặc hết hạn 15 phút), backend chỉ gửi notification và emit socket cá nhân, chưa tự động đẩy tin nhắn `[ORDER_CANCELLED]` vào cuộc trò chuyện giữa 2 bên để cập nhật tiến trình trao đổi.

---

## 2. Các thay đổi đã thực hiện

### 2.1. Web Frontend: [PinnedProductBar.tsx](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/chat/PinnedProductBar.tsx) & [page.tsx](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/app/chat/page.tsx)
- **Kiểm tra trạng thái đơn hàng (`hasActiveOrder`, `activeOrderCode`):**
  - Duyệt danh sách tin nhắn của hội thoại hiện tại. Nếu có `[ORDER_CREATED]` và không bị theo sau bởi `[ORDER_CANCELLED]`, xác định cuộc trò chuyện đang có một đơn hàng bảo chứng Escrow active.
- **Ẩn nút mua hàng & đề nghị giá:**
  - Nếu `hasActiveOrder === true`: Ẩn hoàn toàn nút "Đặt mua ngay", "Đặt Safe-Handoff" và nút "Đề nghị giá".
  - Thay thế bằng nút bấm xanh dương nổi bật: **"Xem đơn hàng"** (`<PackageCheck />`) dẫn thẳng tới `/orders/[orderCode]`.
  - Hiển thị badge trạng thái trên thanh sản phẩm: `Đơn hàng #ORD-...` cạnh mức giá giao dịch.
  - Xử lý thêm trạng thái nếu sản phẩm là `RESERVED` hoặc `SOLD` để ngăn đặt mua trùng lặp.

### 2.2. Web Frontend: [MessageHistory.tsx](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/components/chat/MessageHistory.tsx)
- **Thẻ Đơn Hàng Escrow (`[ORDER_CREATED]`):**
  - Trích xuất mã đơn hàng `#ORD-...`.
  - Hiển thị thẻ card bo góc sang trọng:
    - Badge: `Đơn Hàng Escrow` (xanh lá).
    - Tiêu đề: `Đã Đặt Mua Thành Công!` cùng icon `PackageCheck`.
    - Nội dung: Chi tiết tiền cọc và lưu ý an toàn sàn FPT giữ bảo chứng, chỉ chuyển tiền khi hai bên quét QR giao dịch.
    - Nút hành động: `Xem chi tiết đơn hàng` chuyển hướng sang `/orders/[orderCode]`.
- **Thẻ Hủy Đơn Hàng (`[ORDER_CANCELLED]`):**
  - Hiển thị banner/thẻ cảnh báo đỏ hồng:
    - Badge: `Đơn Hàng Đã Hủy`.
    - Tiêu đề: `Đơn hàng #ORD-... đã bị hủy`.
    - Nội dung: Lý do hủy và thông báo hoàn lại tiền cọc Escrow / FPT Coin cho người mua, mở lại trạng thái Đang bán cho món đồ.

### 2.3. Backend: [order.service.ts](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/backend/src/modules/orders/order.service.ts)
- Bổ sung logic trong `cancelPendingOrderInDb`:
  - Khi bất kỳ đơn hàng nào bị hủy (người dùng hủy, người bán hủy, hoặc cron tự động hủy do quá hạn 15 phút):
  - Tìm kiếm cuộc trò chuyện tương ứng với món hàng và hai bên mua - bán.
  - Tự động tạo tin nhắn `[ORDER_CANCELLED] Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}. Tiền cọc Escrow và sản phẩm đã được tự động hoàn trả.`
  - Cập nhật `lastMessageText: [Đã hủy đơn #${order.orderCode}]` cho conversation.
  - Bắn sự kiện socket `receive_message` tới room `conversation_${conversation.id}` để cả Web và Mobile lập tức thấy thông báo hủy đơn trong thời gian thực.

### 2.4. Mobile: [ChatDetailMessageItem.tsx](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/mobile/src/features/chat/components/ChatDetailMessageItem.tsx)
- Bổ sung component `ChatOrderCancelledBubble` đồng bộ hoàn toàn với Web khi nhận tin nhắn `[ORDER_CANCELLED]`.

---

## 3. Kết quả kiểm thử
- Frontend TypeCheck: `tsc --noEmit` hoàn tất với **0 lỗi**.
- Backend TypeCheck: `tsc --noEmit` hoàn tất với **0 lỗi**.
- Mobile TypeCheck: `tsc --noEmit` hoàn tất với **0 lỗi**.
- Quy chuẩn code tuân thủ triệt để tinh thần `/ponytail`: Tối giản, can thiệp đúng điểm nghẽn gốc, giải quyết triệt để và an toàn hồi quy.
