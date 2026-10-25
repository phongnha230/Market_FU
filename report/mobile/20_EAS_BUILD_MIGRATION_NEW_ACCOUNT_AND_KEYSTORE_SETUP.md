# 📑 BÁO CÁO 20: DI CHUYỂN TÀI KHOẢN EXPO EAS BUILD MỚI, TẠO ANDROID KEYSTORE & CẤU HÌNH CLOUD CI/CD

**Thời gian xử lý:** 23/10/2026 - 24/10/2026  
**Phân hệ:** Mobile App (`mobile/app.json`, `mobile/eas.json`, Expo Cloud CI/CD)  
**Mục tiêu:**
1. Khắc phục sự cố tài khoản Expo cũ (`nha1905`) hết hạn ngạch build miễn phí hàng tháng (30 builds/tháng của gói Free Tier) bằng cách chuyển đổi an toàn sang tài khoản Expo mới (`NhaSC` / `nhasc`).
2. Khởi tạo Android Keystore chuẩn RSA 2048 bit phục vụ ký số file APK và ngăn chặn rò rỉ bảo mật.
3. Đồng bộ hóa biến môi trường kết nối máy chủ Production thật (`https://api.jintdp.dpdns.org`) trên EAS Cloud.
4. Xử lý triệt để lỗi không khớp định danh dự án (`slug mismatch`) trong quá trình resolve cấu hình build của EAS.

---

## 1. BỐI CẢNH VÀ THÁCH THỨC

- Trong quá trình phát triển và kiểm thử thực tế trên thiết bị vật lý của nhiều thành viên, tài khoản Expo cũ `nha1905` đã sử dụng hết 30 lượt build APK miễn phí trong tháng và phải chờ đến chu kỳ tiếp theo.
- Để không làm gián đoạn tiến độ thử nghiệm, nhóm đã tạo tài khoản Expo mới (`NhaSC`).
- **Thách thức kỹ thuật đặt ra:**
  1. File [`mobile/app.json`](../../mobile/app.json) bị gắn cứng với `projectId` cũ (`3ceb7672-6ffd-48c5-9636-3e2d4f8bc092`) và `owner: "nha1905"`. Nếu cố tình build từ tài khoản mới mà không cấu hình lại, EAS CLI sẽ lập tức chặn lại với lỗi phân quyền: `Entity not found` hoặc `You don't have access to project`.
  2. Mỗi tài khoản Expo mới cần chữ ký số (Android Keystore) riêng để ký gói cài đặt APK.
  3. Khi chuyển sang build qua GitHub Integration trên web Expo, nếu thông số `slug` trong `app.json` không khớp với tên slug khởi tạo trên web, quy trình build sẽ bị dừng ngay ở bước `Resolve build configuration`.

---

## 2. QUY TRÌNH XỬ LÝ & CẤU HÌNH KỸ THUẬT

### 2.1. Cấu hình lại Project ID và Owner trong `app.json`
Trên tài khoản Expo mới `NhaSC`, dự án mới được khởi tạo và cấp mã định danh:
- **Project ID mới:** `64579c58-c93c-4eed-bb47-db519499c10c`
- **Owner mới:** `nhasc`

Cập nhật vào [`mobile/app.json`](../../mobile/app.json):
```json
"extra": {
  "eas": {
    "projectId": "64579c58-c93c-4eed-bb47-db519499c10c"
  }
},
"owner": "nhasc"
```

### 2.2. Khởi tạo Android Keystore chuẩn hóa bằng JDK `keytool`
Để chủ động quản lý chứng chỉ ký số ứng dụng và sẵn sàng cho việc cập nhật app về sau:
1. **Sinh Keystore chuẩn:**
   Sử dụng công cụ `keytool` có sẵn của Java Runtime:
   ```bash
   keytool -genkeypair -v -keystore mobile/fu-market-release.jks \
     -alias fu-market-key -keyalg RSA -keysize 2048 -validity 10000 \
     -storepass MarketFU2026 -keypass MarketFU2026 \
     -dname "CN=FU SecondHand, OU=IT, O=FU, L=HoaLac, ST=HaNoi, C=VN"
   ```
   - **Tên file:** `fu-market-release.jks`
   - **Thời hạn chứng chỉ:** 10.000 ngày (~27 năm)
   - **Thuật toán mã hóa:** RSA 2048 bit, chữ ký SHA384withRSA
   - **Định danh ứng dụng (Application Identifier):** `com.fu.secondhandmarket`
2. **Bảo mật mã nguồn:**
   Thêm `*.jks` và `*.keystore` vào [`.gitignore`](../../.gitignore) để đảm bảo tuyệt đối không lộ file chứng chỉ nhạy cảm lên kho mã nguồn công khai GitHub.
3. **Upload lên Expo Cloud:**
   Upload file keystore lên hệ thống Quản lý thông tin xác thực (Credentials) của Expo với alias `fu-market-key` để máy chủ build tự động ký mỗi khi có bản build mới.

### 2.3. Khắc phục lỗi Mismatch Slug trên EAS Cloud
Khi chạy lượt build đầu tiên từ GitHub, hệ thống EAS báo lỗi `build:internal command failed`:
```text
Project config: Slug for project identified by "extra.eas.projectId" (fu-secondhand)
does not match the "slug" field (fu-secondhand-market).
```
- **Nguyên nhân:** Khi tạo project mới trên giao diện web của Expo, tên slug được đặt ngắn gọn là `fu-secondhand`, trong khi file `app.json` của code vẫn lưu slug cũ `fu-secondhand-market`.
- **Xử lý:** Điều chỉnh trường `slug` trong [`mobile/app.json`](../../mobile/app.json) thành `fu-secondhand` cho khớp hoàn toàn 100%:
  ```json
  {
    "expo": {
      "name": "FU SecondHand",
      "slug": "fu-secondhand",
      "scheme": "fu-market",
      ...
    }
  }
  ```

### 2.4. Cấu hình biến môi trường Production & Làm rõ Warning
- Các biến môi trường kết nối tới Server VPS thật đã được cấu hình chặt chẽ:
  - `EXPO_PUBLIC_API_URL`: `https://api.jintdp.dpdns.org/api`
  - `EXPO_PUBLIC_SOCKET_URL`: `https://api.jintdp.dpdns.org`
  - Cùng đầy đủ các biến Firebase Auth / FCM và Google OAuth Client ID trong [`mobile/eas.json`](../../mobile/eas.json).
- **Làm rõ cảnh báo trùng lặp (Informational Warning):**
  - Trong log build có xuất hiện:
    `The following environment variables are defined in both the "preview" build profile "env" configuration and the "preview" environment on EAS... The values from the build profile configuration will be used.`
  - Đây là cảnh báo thông tin thông thường (không phải lỗi). EAS thông báo rằng cả trên web EAS lẫn trong file `eas.json` đều có khai báo biến môi trường, và hệ thống sẽ ưu tiên nạp giá trị từ file `eas.json` của code. Quá trình giải quyết cấu hình vẫn thành công (`✔ 11s`).

---

## 3. LƯU Ý KHI CÀI ĐẶT APK MỚI TRÊN THIẾT BỊ NGƯỜI DÙNG

Do bản APK mới được ký bằng Keystore mới của tài khoản `NhaSC`:
- Nếu máy điện thoại của người dùng hoặc kiểm thử viên **đang cài sẵn bản APK của tài khoản cũ `nha1905`**, hệ điều hành Android sẽ chặn cài đè với thông báo: *"Ứng dụng chưa được cài đặt do xung đột chữ ký / App not installed"*.
- **Cách khắc phục bắt buộc:** Người dùng chỉ cần **Gỡ cài đặt (Uninstall) app cũ** trên điện thoại trước, sau đó bấm cài đặt file APK mới là hoàn tất 100%.

---

## 4. KẾT QUẢ VÀ TRẠNG THÁI GIT

1. **Biên dịch mã nguồn:** Đã kiểm tra TypeScript `npx tsc --noEmit` hoàn tất không lỗi.
2. **Build EAS Cloud:** Bước `Resolve build configuration` đã vượt qua thành công với dấu tích xanh (`✔`).
3. **Các commit liên quan:**
   - Commit `85b8f40`: `build(mobile): link EAS project to new account NhaSC`
   - Commit `36be25e`: `build(mobile): update slug to fu-secondhand matching EAS project`
   - Commit `5981b92`: `chore: ignore keystore and jks files`
   - Đã đồng bộ đầy đủ lên cả 2 nhánh `feature/security-hardening-and-ponytail-cleanup` và `main`.
