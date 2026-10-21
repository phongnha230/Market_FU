# BÁO CÁO 16: KHẮC PHỤC LỖI VĂNG APP (CRASH) KHI VÀO TRANG CHỦ & CHUẨN HÓA BUILD ANDROID APK TRÊN EAS

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`fu-secondhand-mobile`)  
**Phân hệ:** Mobile App Client (React Native 0.81.5, Expo SDK 54, Hermes Engine, Zustand, React Navigation)  
**Thời gian:** Tháng 10/2026  

---

## 1. MÔ TẢ SỰ CỐ (SYMPTOMS)

Sau khi đóng gói bản cài đặt Android (`.apk`) thông qua **Expo Application Services (EAS Build)** và cài đặt lên thiết bị thực tế:
1. **Triệu chứng ban đầu:** Người dùng mở ứng dụng, xem bình thường qua 3 màn hình giới thiệu (`Onboarding1Screen` $\rightarrow$ `Onboarding2Screen` $\rightarrow$ `Onboarding3Screen`), nhưng ngay khi bấm nút **"Khám phá chợ ngay"** (hoặc **"Bỏ qua"**) để điều hướng vào `MainTabs` (`HomeScreen`), ứng dụng lập tức bị văng (force close / crash).
2. **Triệu chứng sau khi bọc `AppErrorBoundary`:** Sau khi bổ sung lớp chắn lỗi `AppErrorBoundary` tại `mobile/App.tsx`, ứng dụng không còn bị đóng đột ngột ở tầng Native mà bắt được ngoại lệ JavaScript trực tiếp trên màn hình:
   - **Thông báo lỗi:** `TypeError: undefined is not a function` ngay tại thời điểm mount `MainTabs` (`BottomTabNavigator` / `HomeScreen`).

---

## 2. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

### 2.1. Lỗi Chính: Vòng Lặp Phụ Thuộc (Circular Dependency) Làm `useAuthStore` Bị `undefined`
Bằng phương pháp trích xuất bundle production của Android (`npx expo export:embed --platform android --dev false --minify false`) và phân tích đồ thị phụ thuộc (Tarjan's Strongly Connected Components) trên toàn bộ **1.759 module**, nguyên nhân chính xác gây ra lỗi `TypeError: undefined is not a function` được xác định tại chuỗi nạp module:

```text
App.tsx
 └── KhoProvider (KhoContext.tsx / useKhoValue.ts)
      └── userStore.ts (Module 974)
           └── chatStore.ts (Module 1009)
                └── chatMobileService.ts (Module 1010)
                     └── socketMobileService.ts (Module 1011)
                          └── useAuthStore.ts (Module 994)
                               └── userStore.ts (Module 974 - ĐANG KHỞI TẠO DỞ DANG!)
```

**Cơ chế xảy ra lỗi trên Hermes Engine:**
1. Khi ứng dụng khởi động, `useKhoValue.ts` nạp `userStore.ts` (`Module 974`).
2. Trước khi chạy tới dòng khởi tạo `export const useUserStore = create(...)`, phần đầu của `userStore.ts` thực thi lệnh `require('./chatStore')` $\rightarrow$ kéo theo `chatMobileService.ts` $\rightarrow$ `socketMobileService.ts` $\rightarrow$ `useAuthStore.ts` (`Module 994`).
3. Trong `useAuthStore.ts`, câu lệnh gán tĩnh ở cấp cao nhất (top-level evaluation):
   ```ts
   import { useUserStore } from './userStore';
   export const useAuthStore = useUserStore;
   export default useUserStore;
   ```
   được thực thi **ngay trong lúc `userStore.ts` vẫn chưa chạy tới dòng `create(...)`**. Tại thời điểm đó, `_userStore.useUserStore` đang có giá trị là `undefined`.
4. Hệ quả là biến `useAuthStore` và `default` bên trong `Module 994` (`useAuthStore.ts`) bị gán cố định giá trị `undefined` suốt vòng đời ứng dụng:
   ```text
   Module 994 (useAuthStore.ts) -> { default: undefined, useAuthStore: undefined, useUserStore: function }
   ```
5. **Vì sao 3 trang Onboarding vẫn chạy được?** Vì `Onboarding1/2/3Screen` và `useKhoValue.ts` import `useUserStore` trực tiếp từ `userStore.ts` (`Module 974`), nên sau khi `userStore.ts` chạy xong, getter `exports.useUserStore` của `Module 974` trả về đúng hàm store.
6. **Vì sao bấm vào Trang chủ lại văng?** Khi chuyển sang `HomeScreen`, hook `useHomeFeed.ts` (`mobile/src/screens/Home/hooks/useHomeFeed.ts`) import `useAuthStore` từ `useAuthStore.ts` (`Module 994`) và gọi:
   ```ts
   const { user } = useAuthStore(); // Thực chất gọi undefined()
   ```
   dẫn tới ngoại lệ **`TypeError: undefined is not a function`** trong pha render của `HomeScreen`.

---

### 2.2. Các Rủi Ro Tương Thích Native & Cấu Hình Build Đã Xử Lý Kèm Theo
Bên cạnh lỗi vòng lặp module ở trên, quá trình rà soát toàn diện bản build APK cũng phát hiện và xử lý các điểm nhạy cảm trên Android Production:
1. **`react-native-CSS-interop` / NativeWind Style & Shadow trên `BottomTabNavigator`:**
   - Các giá trị `fontWeight` dạng số hoặc chuỗi không chuẩn và thuộc tính shadow phức tạp dễ gây xung đột khi chuyển đổi qua bridge Android.
2. **Bảo vệ tương thích trên `HomeHeader`, `CampusSelector`, `HeroBannerCarousel`, `SafePointWidget`, `RequireAuthModal`, `ProductCardSkeleton`:**
   - Loại bỏ `overflow: 'hidden'` kết hợp `elevation` gây lỗi cắt khung hoặc crash dựng hình trên một số dòng GPU Android.
   - Đảm bảo `Animated.Value` trong `ProductCardSkeleton` khởi tạo lười (lazy initializer `useState(() => new Animated.Value(0.4))`).
3. **Chuẩn hóa Icon & Adaptive Icon cho EAS Doctor (`npx expo-doctor`):**
   - Khắc phục lỗi `icon.png` và `adaptive-icon.png` không vuông (`480x120`) khiến bước kiểm tra schema của EAS Build báo lỗi; thay thế bằng bộ icon chuẩn tỉ lệ `1:1` (`1024x1024`).

---

## 3. CHI TIẾT CÁC TỆP ĐÃ CHỈNH SỬA

### 3.1. Xóa Bỏ Vòng Lặp Phụ Thuộc & Sửa Lỗi `useAuthStore` (`undefined is not a function`)
- **Tệp 1:** [`mobile/src/stores/useAuthStore.ts`](../../mobile/src/stores/useAuthStore.ts)
  - Thay thế phép gán biến tĩnh `export const useAuthStore = useUserStore` bằng cú pháp **live getter re-export** chuẩn ES Module:
    ```ts
    export { useUserStore, useAuthStore, default } from './userStore';
    export * from './userStore';
    ```
  - Khi biên dịch qua Babel, `exports.useAuthStore` trở thành hàm getter động (`get: () => _userStore.useAuthStore`), luôn trả về instance store chính xác bất kể thứ tự nạp module.
- **Tệp 2:** [`mobile/src/services/socketMobileService.ts`](../../mobile/src/services/socketMobileService.ts)
  - Loại bỏ lệnh `import { useAuthStore } from '../stores/useAuthStore'` ở đầu file.
  - Chuyển sang hàm `getAuthToken()` nạp lười (lazy require `../stores/userStore`) bên trong `getSocket()`, cắt đứt hoàn toàn chu trình `userStore -> chatStore -> chatMobileService -> socketMobileService -> useAuthStore -> userStore`.

### 3.2. Bổ Sung Lớp Chắn Lỗi Toàn Cục (`AppErrorBoundary`)
- **Tệp chỉnh sửa:** [`mobile/App.tsx`](../../mobile/App.tsx)
  - Bọc toàn bộ cây giao diện trong `AppErrorBoundary` để ngăn chặn ứng dụng tự đóng đột ngột (hard crash) nếu có bất kỳ lỗi render phát sinh nào, đồng thời hiển thị thông báo rõ ràng kèm nút **"Tải lại màn hình"**.

### 3.3. Tối Ưu Tương Thích Android UI Trên Luồng Trang Chủ & Thanh Điều Hướng
- **Tệp chỉnh sửa:**
  - [`mobile/src/navigation/BottomTabNavigator.tsx`](../../mobile/src/navigation/BottomTabNavigator.tsx)
  - [`mobile/src/components/common/HomeHeader.tsx`](../../mobile/src/components/common/HomeHeader.tsx)
  - [`mobile/src/components/common/ProductCard.tsx`](../../mobile/src/components/common/ProductCard.tsx)
  - [`mobile/src/components/common/ProductCardSkeleton.tsx`](../../mobile/src/components/common/ProductCardSkeleton.tsx)
  - [`mobile/src/components/common/RequireAuthModal.tsx`](../../mobile/src/components/common/RequireAuthModal.tsx)
  - [`mobile/src/screens/Home/HomeScreen.tsx`](../../mobile/src/screens/Home/HomeScreen.tsx)
  - [`mobile/src/screens/Home/components/CampusSelector.tsx`](../../mobile/src/screens/Home/components/CampusSelector.tsx)
  - [`mobile/src/screens/Home/components/HeroBannerCarousel.tsx`](../../mobile/src/screens/Home/components/HeroBannerCarousel.tsx)
  - [`mobile/src/screens/Home/components/SafePointWidget.tsx`](../../mobile/src/screens/Home/components/SafePointWidget.tsx)

---

## 4. KẾT QUẢ KIỂM CHỨNG (VERIFICATION)

1. **Kiểm thử thực thi trực tiếp trên Production Bundle (`bundle.js`):**
   - Xuất bundle thật bằng lệnh `npx expo export:embed --platform android --dev false --minify false`.
   - Kiểm tra `Module 994` (`useAuthStore.ts`) sau khi `KhoProvider` khởi chạy:
     ```text
     Module 994 (useAuthStore.ts) exports: {
       default: 'function',
       useAuthStore: 'function',
       useUserStore: 'function'
     }
     ```
   - Thực thi `useHomeFeed()` và các `useEffect` liên quan: chạy thành công 100%, không còn bất kỳ lỗi `undefined is not a function` nào.
2. **Kiểm tra TypeScript & Expo Doctor:**
   - `npx tsc --noEmit`: **PASS (0 lỗi)**.
   - `npx expo-doctor`: **21/21 checks passed**.
