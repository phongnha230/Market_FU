# BÁO CÁO 09: KHẮC PHỤC LỖI KẸT PHÒNG CHAT, LIỆT CHỌN HỘI THOẠI & BẤT ĐỒNG BỘ TẠO PHÒNG TRÊN WEB FRONTEND

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`fu-secondhand-frontend`)  
**Phân hệ:** Web P2P Chat & Realtime Messaging (`/chat`)  
**Thời gian:** Tháng 10/2026  
**Trạng thái:** Hoàn thành & Đã nghiệm thu (TypeScript 0 lỗi, Build Clean)

---

## 1. MỤC TIÊU VÀ BỐI CẢNH SỰ CỐ

Người dùng và đội ngũ kiểm thử phát hiện lỗi nghiêm trọng trên giao diện Chat Web (`https://market-fu.vercel.app/chat` / [`frontend/src/app/chat/page.tsx`](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/app/chat/page.tsx)):

1. **Khóa cứng phòng chat (Locked Active Room):** Khu vực phòng chat và thanh sản phẩm ghim trên đầu (`PinnedProductBar`) bị "khóa cứng" vĩnh viễn vào cuộc hội thoại đầu tiên (ví dụ: iPhone 14 Pro, người bán Trần Đỗ Phong Nhã).
2. **Liệt thanh chọn bên ngoài (Sidebar Orange Indicator Freeze):** Khi người dùng click vào các đoạn hội thoại khác trong danh sách bên trái (Sidebar), thanh chỉ báo màu cam bên mép trái không chuyển động, phòng chat không thay đổi nội dung.
3. **Lỗi không tải được cuộc trò chuyện vừa tạo mới:** Khi người dùng mở cuộc trò chuyện mới từ một sản phẩm khác (ví dụ Đèn bàn LED "Vừa xong"), click vào hội thoại mới không load dữ liệu và bị kẹt, hệ thống tự động nhảy ngược về hội thoại cũ.

---

## 2. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Sau khi truy vết qua CodeGraph và phân tích luồng trạng thái (`page.tsx` kết hợp `chatStore.ts`), nguyên nhân được xác định bắt nguồn từ chuỗi 4 lỗi logic:

### 2.1. URL Query Param Hijacking (`sellerParam` ghi đè lựa chọn người dùng)
- Trong `page.tsx`, tại `useEffect` render danh sách cuộc trò chuyện:
  ```tsx
  if (sellerParam) {
    const match = mapped.find(
      (c) =>
        c.name.toLowerCase().includes(sellerParam.toLowerCase().trim()) ||
        sellerParam.toLowerCase().trim().includes(c.name.toLowerCase())
    );
    if (match) {
      setSelectedConvId(match.id);
      return;
    }
  }
  ```
- Khi người mua bấm "Nhắn tin" từ trang sản phẩm, trình duyệt điều hướng tới `/chat?seller=Trần Đỗ Phong Nhã&productId=...`.
- Tham số `sellerParam` tồn tại vĩnh viễn trên URL thanh địa chỉ mà không bao giờ bị xóa.
- Khi người dùng có nhiều cuộc trò chuyện với cùng một người bán (hoặc người bán có tên khớp chuỗi tìm kiếm), mỗi khi người dùng click vào bất kỳ hội thoại nào ở Sidebar:
  - Hàm `onSelectConv(id)` gọi `setSelectedConvId(id)` $\rightarrow$ kích hoạt `chatStore.fetchMessages(id)`.
  - Store cập nhật `chatStore.messagesByConversation` $\rightarrow$ kích hoạt lại `useEffect` render danh sách.
  - Trong `useEffect`, khối `if (sellerParam)` lập tức tìm thấy người bán và ép `selectedConvId` quay ngược về hội thoại số 0 (`mapped[0].id` - iPhone 14 Pro).
  - **Hậu quả:** Người dùng click vào bất cứ đâu cũng bị kéo giật ngược về hội thoại đầu tiên; thanh cam không đổi vị trí.

### 2.2. Không dọn dẹp Search Params sau khi nhận dữ liệu
- URL query params (`seller`, `productId`, `userId`) chỉ có ý nghĩa khi người dùng vừa chuyển trang vào `/chat`.
- Mã nguồn cũ không gọi `window.history.replaceState` để làm sạch thanh địa chỉ, dẫn đến việc URL param biến thành một trạng thái "ảo" ghi đè liên tục trong suốt phiên làm việc.

### 2.3. Bất đồng bộ ID giữa Client Optimistic và MongoDB Backend
- Khi tạo phòng chat mới cho sản phẩm khác, client tạo mã tạm `actualId` (`conv-prod-...`) và set `selectedConvId(actualId)`.
- Khi API `chatService.createOrGetConversation(productIdParam)` trả về MongoDB ObjectId thật (`res.id`), code cũ gọi `chatStore.fetchConversations()` để tải lại danh sách từ server (chứa `res.id`).
- Tuy nhiên, `selectedConvId` vẫn giữ nguyên chuỗi `actualId`. Khi component re-render, `mapped.some(m => m.id === selectedConvId)` trả về `false`, khiến hệ thống fallback chọn `mapped[0].id`.
- Vì thế hội thoại mới tạo ("Vừa xong") nằm trên danh sách nhưng click vào không liên kết được với dữ liệu và bị snap ngược về phòng đầu tiên.

### 2.4. Điều kiện gộp hội thoại bị lỏng lẻo trong Store (`chatStore.ts`)
- Hàm `addOrUpdateConversation` trong `chatStore.ts` kiểm tra:
  ```ts
  if (conversation.productId && c.productId) {
    return c.productId === conversation.productId && samePartner;
  }
  return samePartner;
  ```
- Nếu một hội thoại từ server thiếu trường `productId` hoặc `null`, điều kiện `if (conversation.productId && c.productId)` bị false, dẫn tới rơi xuống `return samePartner;`.
- Khi đó hai sản phẩm hoàn toàn khác nhau (ví dụ Laptop vs Đèn bàn) của cùng một người bán bị gộp nhầm thành cùng một cuộc trò chuyện.

---

## 3. CÁC THAY ĐỔI ĐÃ TRIỂN KHAI

### 3.1. Cập nhật [`frontend/src/app/chat/page.tsx`](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/app/chat/page.tsx)
1. **Xóa bỏ hoàn toàn khối `if (sellerParam)` trong effect render danh sách:**
   - Trọng tài duy nhất quyết định phòng chat đang mở là click của người dùng (`selectedConvId`).
   - Chỉ fallback về `mapped[0].id` khi người dùng chưa chọn gì hoặc ID đã chọn không còn tồn tại trong danh sách:
     ```tsx
     setConversations(mapped);
     if (mapped.length > 0) {
       if (!selectedConvId || !mapped.some((m) => m.id === selectedConvId)) {
         setSelectedConvId(mapped[0].id);
       }
     }
     ```
   - Xóa `sellerParam` khỏi dependency array của effect để tránh re-render thừa.
2. **Làm sạch URL ngay sau khi tiếp nhận thông số:**
   - Dùng `window.history.replaceState({}, '', window.location.pathname)` sau khi đã chọn phòng cũ hoặc tạo phòng mới, đưa URL về `/chat` sạch sẽ.
3. **Chuyển giao ID mượt mà khi Backend tạo phòng xong:**
   - Khi API `chatService.createOrGetConversation` phản hồi `res.id !== actualId`:
     ```tsx
     chatStore.replaceConversationId?.(actualId, res.id);
     setSelectedConvId(res.id);
     chatStore.setActiveConversation(res.id);
     await chatStore.fetchConversations();
     ```
   - Phòng chat lập tức chuyển sang ID thật mà không bị mất tin nhắn, không giật màn hình và không bị nhảy về phòng đầu tiên.

### 3.2. Cập nhật [`frontend/src/stores/chatStore.ts`](file:///c:/Users/HPPAVILION/Documents/IT/FU%20student%20second-hand%20market/frontend/src/stores/chatStore.ts)
1. **Tách biệt chính xác các sản phẩm của cùng một người bán:**
   - Sửa điều kiện so khớp:
     ```ts
     if (conversation.productId || c.productId) {
       return conversation.productId === c.productId && samePartner;
     }
     return samePartner;
     ```
   - Nếu có bất kỳ `productId` nào, bắt buộc phải trùng `productId` thì mới xem là cùng hội thoại.
2. **Bổ sung `replaceConversationId`:**
   - Hỗ trợ đổi ID phòng chat từ mã tạm client sang ID thật MongoDB mà không làm mất lịch sử tin nhắn trong `messagesByConversation`.
3. **Bảo toàn hội thoại Optimistic:**
   - Trong `fetchConversations()`, giữ lại các hội thoại client-side đang chờ backend xử lý (bắt đầu bằng `conv-`) để người dùng không bị mất giao diện trong lúc mạng chậm.

---

## 4. KẾT QUẢ KIỂM THỬ VÀ NGHIỆM THU

| Kịch Bản Kiểm Thử | Trạng Thái Trước Sửa | Kết Quả Sau Khi Sửa |
| :--- | :--- | :--- |
| **Bấm chọn các cuộc trò chuyện khác nhau ở Sidebar** | Thanh màu cam đứng yên ở phòng 1, nội dung không đổi | Thanh màu cam bám theo đúng hàng được click; Header và `PinnedProductBar` hiển thị đúng sản phẩm |
| **Mở chat từ link có `?seller=...`** | URL bị kẹt tham số, khóa cứng phòng chat của seller đó | URL được tự động làm sạch về `/chat`; người dùng chuyển phòng thoải mái |
| **Tạo cuộc trò chuyện mới từ sản phẩm khác** | Bấm vào không load, hệ thống nhảy về phòng 1 | Phòng chat mới hiển thị ngay lập tức, tự nâng cấp lên ID MongoDB và giữ vững tiêu điểm |
| **Kiểm tra TypeScript (`tsc --noEmit`)** | Có nguy cơ type mismatch | **0 Lỗi (Clean build)** |

---

## 5. ĐỐI SOÁT PHÂN HỆ MOBILE APP

Đã tiến hành rà soát chéo mã nguồn Mobile React Native (`mobile/src/features/chat/`):
- Phân hệ Mobile **không bị ảnh hưởng** bởi lỗi này do sử dụng kiến trúc điều hướng Native Stack (`ChatListScreen` $\rightarrow$ `ChatDetailScreen`).
- Mỗi phòng chat trên mobile là một màn hình riêng biệt nhận tham số độc lập qua `route.params`, không dùng URL query parameters và không chia sẻ thanh chọn trên cùng một View như Web.
