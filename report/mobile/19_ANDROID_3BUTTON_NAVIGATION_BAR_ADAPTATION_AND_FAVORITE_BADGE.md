# 📑 BÁO CÁO 19: TƯƠNG THÍCH THANH ĐIỀU HƯỚNG 3 NÚT ẢO ANDROID & ĐỒNG BỘ BADGE TAB "ĐÃ LƯU" REALTIME

**Thời gian xử lý:** 23/10/2026 - 25/10/2026  
**Phân hệ:** Mobile App (`mobile/src/navigation/`, `mobile/src/stores/`, `mobile/src/components/common/`)  
**Mục tiêu:**
1. Khắc phục triệt để lỗi thanh điều hướng 3 nút ảo hệ thống Android (Menu - Home - Back) đè lên Bottom Tab Bar trên các thiết bị không dùng cử chỉ vuốt, tối ưu trải nghiệm đệm đáy tràn viền chuẩn như Shopee.
2. Sửa lỗi người dùng bấm "Thích" (thả tim) sản phẩm trên Trang chủ nhưng icon tab "Đã lưu" ở thanh điều hướng đáy không nhảy số đếm (badge count).

---

## 1. VẤN ĐỀ 1: THANH ĐIỀU HƯỚNG 3 NÚT HỆ THỐNG ĐÈ LÊN BOTTOM TAB BAR

### 1.1. Hiện tượng & Phân tích nguyên nhân gốc rễ (RCA)
- **Hiện tượng:**
  - Trên các thiết bị Android sử dụng thanh điều hướng 3 phím mềm (`|||` Menu, `O` Home, `<` Back), thanh hệ thống này nằm đè trực tiếp lên hàng icon và chữ của Bottom Tab Bar, khiến người dùng bấm bị cấn, khó bấm hoặc bấm nhầm vào phím Home/Back của hệ thống.
  - Trên các thiết bị sử dụng cử chỉ vuốt (Gesture navigation) hoặc iPhone, giao diện lại hiển thị bình thường.
- **Nguyên nhân cốt lõi:**
  - Trong [`mobile/src/navigation/BottomTabNavigator.tsx`](../../mobile/src/navigation/BottomTabNavigator.tsx), component `CustomTabBar` trước đây cấu hình cứng:
    ```tsx
    tabBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64, // Cố định chiều cao, không bù trừ Safe Area đáy
    }
    ```
  - Khi hệ điều hành Android kích hoạt chế độ "Edge-to-Edge" hoặc vẽ cửa sổ ứng dụng sau thanh điều hướng, các nút hệ thống chiếm khoảng ~40–48dp ở đáy màn hình. Việc cố định `height: 64` và `bottom: 0` làm toàn bộ diện tích của thanh tab bị thanh hệ thống che mất hơn một nửa.

### 1.2. Giải pháp kỹ thuật đã triển khai (Chuẩn Shopee)
Áp dụng cấu trúc **2 lớp (Two-Layer Container)** kết hợp `useSafeAreaInsets` từ thư viện `react-native-safe-area-context`:

```
┌────────────────────────────────────────────────────────┐
│ styles.tabBar (Lớp ngoài: Nền trắng #FFF)              │
│   paddingBottom: insets.bottom                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ styles.tabBarInner (Lớp trong: height: 60 cố định│  │
│  │  [Chợ Campus]  [Đơn mua]  (Đăng tin)  [Đã lưu]   │  │
│  └──────────────────────────────────────────────────┘  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓ [ |||       O       < ] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  <-- Thanh 3 nút ảo Android
└────────────────────────────────────────────────────────┘      (Nền trắng luồn phía sau)
```

1. **Lớp vỏ ngoài (`styles.tabBar`)**:
   - Tự động lấy khoảng đệm đáy `const insets = useSafeAreaInsets()`.
   - Thiết lập `paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 4 : 0)`.
   - Nền màu trắng `#FFFFFF` với bóng đổ `elevation: 8` / `shadow` được kéo dài xuống tận đáy mép màn hình, luồn ra sau 3 nút ảo giúp giao diện liền mạch, không để lộ khoảng đen hoặc khoảng trống xấu xí.
2. **Lớp nội dung bên trong (`styles.tabBarInner`)**:
   - Giữ chiều cao cố định `height: 60`, căn giữa (`alignItems: 'center'`, `justifyContent: 'space-around'`).
   - Mọi icon, tên tab và badge thông báo luôn nằm trọn vẹn ở vùng an toàn phía trên 3 nút ảo, đảm bảo diện tích bấm cảm ứng rộng rãi (tối thiểu 48x48dp theo chuẩn WCAG).
3. **Nút "Đăng tin" tròn màu cam ở giữa**:
   - Vẫn duy trì hiệu ứng nhô lên khỏi đường viền trên (`marginTop: -16`, `borderWidth: 3`, `borderColor: '#FFFFFF'`), không bị xô lệch vị trí dù thiết bị có hay không có 3 phím điều hướng ảo.

---

## 2. VẤN ĐỀ 2: BẤM THÍCH SẢN PHẨM NHƯNG TAB "ĐÃ LƯU" KHÔNG NHẢY SỐ ĐẾM (BADGE)

### 2.1. Hiện tượng & Phân tích nguyên nhân
- **Hiện tượng:**
  - Người dùng lướt Trang chủ hoặc Chi tiết sản phẩm, bấm vào nút trái tim trên thẻ sản phẩm. Trái tim trên ảnh đã chuyển sang màu đỏ và lưu vào bộ nhớ, nhưng tab **"Đã lưu"** ở thanh điều hướng đáy hoàn toàn không hiện số lượng sản phẩm đã thích.
- **Nguyên nhân cốt lõi:**
  - Kiểm tra code [`mobile/src/navigation/BottomTabNavigator.tsx`](../../mobile/src/navigation/BottomTabNavigator.tsx), logic hiển thị badge của `CustomTabBar` trước đây chỉ được cài đặt cho 3 tab:
    - Tab `Chat`: Hiển thị `unreadChatCount` (số tin nhắn chưa đọc).
    - Tab `Orders`: Hiển thị `activeOrdersCount` (số đơn đang xử lý).
    - Tab `MyListings`: Hiển thị `khoAttentionCount` (số tin chờ duyệt / bị từ chối).
  - Tab `Saved` ("Đã lưu") **hoàn toàn bị bỏ quên**, không có bất kỳ dòng code nào lắng nghe `useFavoriteStore` hay hiển thị badge.

### 2.2. Giải pháp kỹ thuật đã triển khai
1. **Kết nối `useFavoriteStore` vào Navigation:**
   ```tsx
   import { useUserStore, useChatStore, useOrderStore, useFavoriteStore } from '../stores';
   ```
2. **Đăng ký lắng nghe trực tiếp số lượng yêu thích:**
   ```tsx
   const savedCount = useFavoriteStore((s) => s.favoriteIds.length);
   ```
3. **Hiển thị Badge số đếm trên tab "Đã lưu":**
   ```tsx
   {route.name === 'Saved' && savedCount > 0 && (
     <View style={styles.chatBadge}>
       <Text style={styles.chatBadgeText}>
         {savedCount > 99 ? '99+' : savedCount}
       </Text>
     </View>
   )}
   ```
4. **Đồng bộ hóa tức thời (Realtime Reactivity):**
   - Khi người dùng bấm thả tim ở [`ProductCard.tsx`](../../mobile/src/components/common/ProductCard.tsx), hàm `toggleFavorite(id, productData)` cập nhật mảng `favoriteIds`.
   - Nhờ cơ chế subscribe của Zustand, `BottomTabNavigator` re-render ngay lập tức và tăng số badge (từ `0` $\rightarrow$ `1`, `2`...).
   - Khi vào màn hình `SavedItemsScreen` và xóa bớt sản phẩm, số badge tự động giảm xuống hoặc biến mất hoàn toàn khi danh sách về `0`.
   - Khi người dùng đăng nhập (`isAuthenticated`), hệ thống tự động gọi ngầm `useFavoriteStore.getState().fetchFavorites()` để đồng bộ danh sách đã lưu từ Backend server về máy.

---

## 3. KẾT QUẢ KIỂM THỬ & XÁC THỰC

1. **Kiểm tra biên dịch Type-Safety:**
   ```bash
   cd mobile && npx tsc --noEmit
   # Exit code: 0 (PASS - 0 errors)
   ```
2. **Xác thực thực tế trên thiết bị:**
   - Đã test trên Android bật thanh 3 phím điều hướng hệ thống: Thanh tab được đẩy lên an toàn, không bị che lấp, bấm nhạy 100%.
   - Đã test trên Android dùng cử chỉ vuốt và iPhone: `insets.bottom` trả về 0 hoặc khoảng cách nhỏ, giao diện hiển thị gọn gàng, không bị khoảng trống dư thừa.
   - Đã test thả tim / bỏ thích sản phẩm: Badge màu cam nhảy số chuẩn xác ngay lập tức.
3. **Trạng thái Git:**
   - Commit `c316680`: `fix(mobile): adapt bottom tab bar to android 3-button navigation bar with safe area insets`
   - Commit `2ac3374` / `a1181ee`: `fix(mobile): show badge count on Saved tab when liking products`
   - Đã merge và push đầy đủ lên nhánh `main`.
