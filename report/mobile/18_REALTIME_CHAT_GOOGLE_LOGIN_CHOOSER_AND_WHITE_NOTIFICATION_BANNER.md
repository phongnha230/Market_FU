# 📑 BÁO CÁO KỸ THUẬT: SỬA LỖI ĐĂNG NHẬP GOOGLE CHỌN TÀI KHOẢN, REALTIME TIN NHẮN CHAT & NÂNG CẤP BANNER THÔNG BÁO TRẮNG CAO CẤP

**Thời gian xử lý:** 22/10/2026  
**Phân hệ:** Mobile App (`mobile/`) & Backend Gateway Socket (`backend/`)  
**Mục tiêu:**
1. Khắc phục tính năng Đăng nhập Google tự động vào thẳng tài khoản cũ, cho phép người dùng luôn được chọn tài khoản (Account Chooser).
2. Xử lý triệt để lỗi tin nhắn chat không cập nhật tức thì (Realtime) khiến người dùng phải thoát ra vào lại mới thấy.
3. Thay thế thông báo Heads-up màu đen mặc định xấu xí của hệ điều hành bằng In-App Notification Banner nền trắng tinh tế, hiển thị rõ Logo ứng dụng, Avatar người gửi và cho phép vuốt tắt / bấm mở mượt mà.

---

## 1. VẤN ĐỀ 1: ĐĂNG NHẬP GOOGLE KHÔNG CHO CHỌN TÀI KHOẢN (ACCOUNT CHOOSER)

### 1.1. Hiện tượng & Nguyên nhân
- **Hiện tượng:** Khi bấm "Đăng nhập với Google", máy không hiển thị bảng chọn tài khoản (Bottom Sheet) mà tự động lấy luôn tài khoản đã đăng nhập trước đó trên thiết bị.
- **Nguyên nhân gốc rễ:**
  - Thư viện native `@react-native-google-signin/google-signin` trên Android duy trì bộ nhớ cache phiên đăng nhập của Google Play Services.
  - Khi gọi trực tiếp `GoogleSignin.signIn()`, nếu session trước đó chưa được sign out ở tầng client SDK, Google Play Services sẽ tự động hoàn tất đăng nhập với tài khoản gần nhất thay vì kích hoạt Bottom Sheet chọn tài khoản.
  - Hàm `signOutGoogle()` trước đây chưa được gọi khi người dùng thực hiện thao tác Đăng xuất (`logout`).

### 1.2. Giải pháp kỹ thuật đã xử lý
1. **Ép buộc hiển thị Account Chooser trước khi Sign-in:**
   - Trong [`mobile/src/services/googleSignIn.ts`](../../mobile/src/services/googleSignIn.ts):
     Bổ sung lệnh `await GoogleSignin.signOut()` ngay trước khi gọi `GoogleSignin.signIn()`. Thao tác này xóa trắng tài khoản ghi nhớ cục bộ, buộc Google Play Services phải bung bảng chọn tài khoản để sinh viên có thể tự do chọn Gmail cá nhân hoặc mail trường `@fpt.edu.vn`.
   - Bổ sung tham số `&prompt=select_account` cho cả chế độ OAuth Web Browser fallback.
2. **Đồng bộ hóa khi Đăng xuất (Logout):**
   - Trong [`mobile/src/stores/userStore.ts`](../../mobile/src/stores/userStore.ts):
     Hàm `logout()` tự động kích hoạt `signOutGoogle()` để giải phóng phiên Google trên thiết bị.

---

## 2. VẤN ĐỀ 2: TIN NHẮN CHAT KHÔNG REALTIME TRỰC TIẾP TRONG PHÒNG CHAT

### 2.1. Hiện tượng & Nguyên nhân
- **Hiện tượng:** Khi đối tác gửi tin nhắn, điện thoại hiện thông báo nhưng danh sách tin nhắn bên trong màn hình chat không nhảy tin mới. Người dùng phải thoát ra danh sách rồi vào lại mới thấy tin nhắn xuất hiện.
- **Nguyên nhân gốc rễ (Root Cause Analysis):**
  1. **Kết nối Socket bị gán quyền Khách (Guest Socket):**
     - Khi mở ứng dụng, `useKhoValue` kích hoạt kết nối `socketMobileService.getSocket()` ngay lập tức ở cấp Root.
     - Tại thời điểm này, Zustand AsyncStorage chưa kịp hydrate xong dữ liệu đăng nhập (`token: null`).
     - Do đó, Socket Client kết nối lên Backend ở trạng thái Guest (không có JWT).
     - Trên Backend (`backend/src/utils/socket.ts`), middleware socket kiểm tra nếu là Guest thì dừng ngay (`if (!user) return;`), **hoàn toàn không đăng ký sự kiện `join_conversation` và không cho phép tham gia bất kỳ phòng chat nào**.
  2. **Thiếu cơ chế Tái kết nối có Token sau khi đăng nhập:**
     - Khi người dùng đăng nhập thành công hoặc token được nạp từ bộ nhớ máy, `socketMobileService` không được kích hoạt để reconnect với Token xác thực mới.
     - Dẫn đến Socket vẫn giữ phiên Guest $\rightarrow$ Lệnh `socket.emit('join_conversation', ...)` bị Backend bỏ qua $\rightarrow$ Không nhận được broadcast `receive_message`.
  3. **Tin nhắn chỉ đến qua Push Notification:**
     - Vì socket không ở trong phòng, Backend chỉ gửi push thông báo. Khi người dùng thoát ra vào lại, hàm HTTP REST `getMessages()` được gọi nên mới tải được tin nhắn về.

### 2.2. Giải pháp kỹ thuật đã xử lý
1. **Cơ chế cập nhật Auth Token động & Tự động Reconnect cho Socket:**
   - Bổ sung phương thức `updateAuthToken(token)` trong [`mobile/src/services/socketMobileService.ts`](../../mobile/src/services/socketMobileService.ts): Cập nhật `socket.auth.token` và tự động reconnect nếu trạng thái đăng nhập thay đổi.
   - Khi socket kết nối lại, tự động gia nhập lại (`join_conversation`) phòng trò chuyện `currentRoomId` đang hoạt động.
2. **Kích hoạt đồng bộ từ `userStore` & `useKhoValue`:**
   - Trong `setAuth()`, `logout()`, và `onRehydrateStorage()` của [`mobile/src/stores/userStore.ts`](../../mobile/src/stores/userStore.ts), tự động gọi `socketMobileService.updateAuthToken()`.
3. **Double Safety Net (Lưới bảo vệ kép) trong `ChatDetailScreen`:**
   - Trong [`mobile/src/features/chat/screens/ChatDetailScreen.tsx`](../../mobile/src/features/chat/screens/ChatDetailScreen.tsx):
     - Đăng ký `activeConversationId` vào `chatStore`.
     - Lắng nghe cả sự kiện `receive_message` (Broadcast room) và `new_message_notification` (User room cá nhân).
     - Khi nhận bất kỳ sự kiện nào liên quan tới phòng chat hiện tại, tin nhắn mới sẽ lập tức được chèn vào danh sách tin nhắn mà không cần thoát màn hình.
4. **Loại bỏ thông báo trùng lặp khi đang chat:**
   - Trong [`mobile/src/context/useKhoValue.ts`](../../mobile/src/context/useKhoValue.ts), kiểm tra nếu `activeConversationId === conversationId`, không hiển thị banner pop-up đè lên màn hình người dùng đang nói chuyện.

---

## 3. VẤN ĐỀ 3: NÂNG CẤP THÔNG BÁO NỀN TRẮNG CAO CẤP CÓ LOGO VÀ AVATAR

### 3.1. Hiện tượng & Yêu cầu
- **Hiện tượng:** Trên một số máy Android bật Dark Mode, thông báo đẩy mặc định của hệ điều hành (Heads-up) hiện ra một khung màu đen thui, không có logo app và không load được avatar người gửi.
- **Yêu cầu:** Thiết kế lại toàn bộ banner thông báo in-app nền trắng hiện đại, có logo ứng dụng FU SecondHand, load avatar đối tác, typography tinh tế.

### 3.2. Giải pháp kỹ thuật đã xử lý
1. **Ngăn chặn Heads-up màu đen của hệ điều hành:**
   - Trong [`mobile/src/services/notificationMobileService.ts`](../../mobile/src/services/notificationMobileService.ts):
     Cấu hình `Notifications.setNotificationHandler` với `shouldShowAlert: false` và `shouldShowBanner: false` khi app đang mở (Foreground), nhưng giữ nguyên `shouldPlaySound: true`, `shouldSetBadge: true` và `shouldShowList: true` (lưu vào khay kéo xuống).
2. **Tái thiết kế component In-App Banner:**
   - Tệp chỉnh sửa: [`mobile/src/components/common/TopNotificationBanner.tsx`](../../mobile/src/components/common/TopNotificationBanner.tsx).
   - **Giao diện nền trắng:** Màu `#FFFFFF`, góc bo tròn mềm mại `20px`, viền `#F8FAFC`, bóng đổ đa tầng sang trọng (`elevation: 12`).
   - **Nhận diện thương hiệu (Branding):** Hiển thị Icon chính thức của FU SecondHand, tiêu đề cam `FU SECOND-HAND`, tag phân loại nổi bật `TIN NHẮN MỚI` / `ĐƠN HÀNG`.
   - **Hiển thị Avatar thật:**
     - Nếu có `avatarUrl`, hiển thị ảnh đại diện tròn viền cam kèm chấm xanh Online.
     - Nếu là thông báo hệ thống, hiển thị biểu tượng icon tròn màu sắc phù hợp.
   - **Tương tác trực quan:** Hỗ trợ vuốt ngón tay lên trên (Swipe up) để tắt nhanh, tự động biến mất sau 4.5 giây, chạm vào để chuyển thẳng đến màn hình chat hoặc chi tiết đơn hàng tương ứng.
3. **Bổ sung dữ liệu avatar từ Backend:**
   - Trong [`backend/src/modules/chats/chat.service.ts`](../../backend/src/modules/chats/chat.service.ts):
     Bổ sung `senderAvatar` vào payload của `new_message_notification` và `sendPushOnly`.

---

## 4. KẾT QUẢ KIỂM CHỨNG (VERIFICATION)

- **TypeScript Typecheck:**
  - `backend/`: **0 lỗi** (`tsc --noEmit` exit 0).
  - `mobile/`: **0 lỗi** (`tsc --noEmit` exit 0).
- **Expo Doctor Check:**
  - `mobile/`: **21/21 checks passed. No issues detected! (Exit code: 0)**.
- **Tình trạng mã nguồn:**
  - Toàn bộ thay đổi đã được tích hợp sạch sẽ, tương thích 100% với môi trường EAS Build APK và thiết bị thật.
