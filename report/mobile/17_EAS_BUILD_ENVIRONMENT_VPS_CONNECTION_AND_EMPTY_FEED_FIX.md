# BÁO CÁO 17: KHẮC PHỤC LỖI TRỐNG SẢN PHẨM TRÊN TRANG CHỦ & ĐỒNG BỘ KẾT NỐI VPS TRÊN EAS BUILD

**Dự án:** Chợ Đồ Cũ Sinh Viên Đại Học FPT (`fu-secondhand-mobile`)  
**Phân hệ:** Mobile App Client (React Native 0.81.5, Expo SDK 54, EAS Build, Axios, Android Network Security)  
**Thời gian:** Tháng 10/2026  

---

## 1. MÔ TẢ HIỆN TƯỢNG (SYMPTOMS)

Sau khi khắc phục thành công sự cố văng app (crash) ở Báo cáo 16, người dùng cài đặt bản APK mới và truy cập thành công vào Trang chủ (`HomeScreen`):
* **Giao diện hiển thị hoàn chỉnh:** Thanh Header, Logo 5 Campus, Cụm phím tắt tiện ích (Đơn hàng, Tin nhắn, Voucher, Ví Coins, Đã lưu), Hero Carousel và Danh mục ngành hàng đều hiển thị sắc nét, mượt mà.
* **Sự cố phát sinh:** Tại khu vực **"TIN XU HƯỚNG / NỔI BẬT"** và **"TIN MỚI TẠI FU TẤT CẢ"**, ứng dụng không hiển thị bất kỳ sản phẩm nào mà rơi vào trạng thái rỗng (Empty State) kèm thông báo:
  > *"Chưa có món đồ nào ở cơ sở này. Hãy chọn cơ sở 'TẤT CẢ' hoặc chuyển sang cơ sở khác để khám phá thêm đồ sinh viên pass lại nhé!"*
* Dù người dùng chuyển đổi qua lại giữa các cơ sở (Hòa Lạc, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn, Tất cả), danh sách vẫn hoàn toàn trống trơn.

---

## 2. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Kiểm tra trực tiếp endpoint máy chủ Backend VPS tại `https://api.jintdp.dpdns.org/api/products` xác nhận: **Backend trên VPS hoàn toàn bình thường và đang lưu trữ sẵn 11 sản phẩm thực tế** (Ấm siêu tốc Lock&Lock, Bàn học gỗ, Tủ lạnh mini CoolTech, Bàn phím, Võ phục Vovinam, Chuột Razer Basilisk, Giáo trình C...).

Nguyên nhân sự cố nằm ở 3 điểm kết nối giữa bản build APK và VPS:

### 2.1. Lệch Môi Trường Biến (Environment Scoping) Trên Dashboard EAS (`expo.dev`)
* Trên trang quản lý dự án **expo.dev**, biến `EXPO_PUBLIC_API_URL` (`https://api.jintdp.dpdns.org/api`) chỉ được gán cho môi trường **`production`**.
* Tuy nhiên, quy trình build ra file `.apk` cài đặt trực tiếp sử dụng profile **`preview`** (`build.preview` trong `eas.json`).
* Theo cơ chế bảo mật của EAS, các biến chỉ thuộc môi trường `production` **sẽ bị loại bỏ hoàn toàn** khi thực hiện build với profile `preview`.

### 2.2. Cơ Chế Fallback Về IP Máy Ảo (`10.0.2.2:5001`)
* Do biến `EXPO_PUBLIC_API_URL` bị thiếu trong bản đóng gói `preview`, hàm `getApiBaseUrl()` trong `mobile/src/services/apiClient.ts` không nhận được URL VPS.
* Hàm tự động kích hoạt cơ chế fallback nội bộ dành cho Android:
  ```ts
  return Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
  ```
* Địa chỉ `10.0.2.2` chỉ có ý nghĩa bên trong trình giả lập Android Studio chạy trên máy tính lập trình viên. Trên điện thoại thật của người dùng, địa chỉ này hoàn toàn không tồn tại $\rightarrow$ Request gọi API bị lỗi Network Timeout $\rightarrow$ Hàm `fetchProducts()` bắt lỗi và trả về mảng rỗng `[]` $\rightarrow$ Màn hình hiển thị Empty State.

### 2.3. Chính Sách Bảo Mật Mạng Android 9+ (Cleartext Traffic Policy)
* Hệ điều hành Android từ phiên bản 9 (API Level 28) trở lên mặc định chặn toàn bộ kết nối HTTP không mã hóa (`http://`).
* Trong cấu hình gốc `mobile/app.json`, thuộc tính `usesCleartextTraffic` chưa được kích hoạt. Nếu VPS hoặc API chạy qua cổng HTTP thông thường, Android sẽ chặn đứng request ngay tại tầng hệ điều hành với lỗi *Cleartext HTTP traffic not permitted*.

---

## 3. GIẢI PHÁP & CHI TIẾT THAY ĐỔI (IMPLEMENTATION)

### 3.1. Gắn Cố Định Cấu Hình VPS Vào Cả 2 Profile Trên `mobile/eas.json`
- **Tệp chỉnh sửa:** [`mobile/eas.json`](../../mobile/eas.json)
- **Giải pháp:** Bổ sung trực tiếp `EXPO_PUBLIC_API_URL` và `EXPO_PUBLIC_SOCKET_URL` vào cả 2 profile **`preview`** và **`production`**. Điều này đảm bảo dù nhà phát triển chọn build file `.apk` nội bộ (`preview`) hay build nộp kho ứng dụng (`production`), ứng dụng luôn được nhúng sẵn link VPS chuẩn xác mà không phụ thuộc vào việc chọn môi trường trên giao diện web.

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.jintdp.dpdns.org/api",
        "EXPO_PUBLIC_SOCKET_URL": "https://api.jintdp.dpdns.org"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.jintdp.dpdns.org/api",
        "EXPO_PUBLIC_SOCKET_URL": "https://api.jintdp.dpdns.org"
      }
    }
  }
}
```

### 3.2. Bật Quyền Truy Cập Mạng Linh Hoạt (`usesCleartextTraffic`)
- **Tệp chỉnh sửa:** [`mobile/app.json`](../../mobile/app.json)
- **Giải pháp:** Thêm `"usesCleartextTraffic": true` vào cấu hình Android. Giúp ứng dụng kết nối mượt mà tới cả IP VPS dạng `http://` lẫn tên miền có SSL `https://`.

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#F27024"
  },
  "package": "com.fu.secondhandmarket",
  "googleServicesFile": "./google-services.json",
  "usesCleartextTraffic": true
}
```

### 3.3. Tự Động Chuẩn Hóa Đường Dẫn API (URL Normalization)
- **Tệp chỉnh sửa:** 
  - [`mobile/src/services/apiClient.ts`](../../mobile/src/services/apiClient.ts)
  - [`mobile/src/config/env.ts`](../../mobile/src/config/env.ts)
- **Giải pháp:** Nâng cấp bộ phân giải `getApiBaseUrl()`:
  - Tự động cắt bỏ dấu gạch chéo thừa ở cuối (`/`).
  - Tự động bổ sung hậu tố `/api` nếu người dùng chỉ nhập domain gốc hoặc IP (ví dụ: `https://api.jintdp.dpdns.org` tự thành `https://api.jintdp.dpdns.org/api`).
  - Giữ nguyên cấu hình `http://localhost:5001/api` cho file `.env` local để việc lập trình trên máy tính không bị ảnh hưởng.

---

## 4. KẾT QUẢ KIỂM CHỨNG (VERIFICATION)

1. **Kiểm tra API Thực Tế:**
   - Endpoint: `GET https://api.jintdp.dpdns.org/api/products`
   - Phản hồi: `HTTP 200 OK`, `meta.total = 11`, danh mục sản phẩm đầy đủ hình ảnh và thông tin người bán.
2. **Kiểm tra Biên Dịch & Cấu Trúc:**
   - `npx tsc --noEmit`: **0 lỗi (Exit code: 0)**.
   - `git diff mobile/eas.json`: Cả 2 profile `preview` và `production` đã được commit và push lên nhánh `main` (`commit 7e572f2`).
3. **Quy Trình Phát Triển Song Song:**
   - *Trên máy tính (Local):* Đọc file `.env` local (`http://localhost:5001/api`), phục vụ debug offline độc lập.
   - *Trên đám mây (EAS Build):* Đọc cấu hình `eas.json` (`https://api.jintdp.dpdns.org/api`), bản APK cài lên điện thoại tự động kết nối VPS 100%.
