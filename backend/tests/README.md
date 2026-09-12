# 🧪 Cấu Trúc Thư Mục Kiểm Thử (Testing Pyramid) - Backend

Thư mục này được tổ chức theo chuẩn **Testing Pyramid** chuyên nghiệp, sẵn sàng cho việc phát triển và tích hợp **CI/CD** (GitHub Actions, GitLab CI, Docker testing).

---

## 📂 Phân Cấp Các Tầng Kiểm Thử

### 1. `tests/unit/` (Unit Tests)
- **Mục đích**: Kiểm tra các hàm, module, thuật toán, utility độc lập trong hệ thống mà không cần bật server hay kết nối mạng phức tạp.
- **Ví dụ hiện tại**: `storage.unit.test.ts` kiểm tra nén ảnh WebP bằng Sharp, auto-rotate EXIF, resize ảnh và xóa file.
- **Lệnh chạy riêng**:
  ```bash
  npm run test:unit
  ```

### 2. `tests/integration/` (Integration Tests)
- **Mục đích**: Kiểm tra sự phối hợp giữa nhiều thành phần (Routes + Controller + Service + Middleware).
- **Ví dụ hiện tại**: `health.integration.test.ts` kiểm tra endpoint `/api/health`, xử lý 404 cho route không tồn tại, kiểm tra dữ liệu trả về từ Express server.
- **Lệnh chạy riêng**:
  ```bash
  npm run test:integration
  ```

### 3. `tests/e2e/` (End-to-End Tests)
- **Mục đích**: Kiểm thử chu trình toàn diện từ góc nhìn của Client/Frontend gọi vào Backend (Security Headers, CORS, Authentication Token, bảo mật dữ liệu).
- **Ví dụ hiện tại**: `api.e2e.test.ts` kiểm tra Helmet CORP headers cho phép load ảnh cross-origin, chặn truy cập trái phép 401 khi không có JWT token.
- **Lệnh chạy riêng**:
  ```bash
  npm run test:e2e
  ```

---

## 🚀 Các Lệnh Chạy Kiểm Thử

| Lệnh | Mô tả |
| :--- | :--- |
| `npm test` | Chạy toàn bộ tất cả các tầng test (`unit`, `integration`, `e2e`) |
| `npm run test:unit` | Chỉ chạy Unit Tests |
| `npm run test:integration` | Chỉ chạy Integration Tests |
| `npm run test:e2e` | Chỉ chạy End-to-End Tests |

---

## 🤖 Tích Hợp CI/CD
Tất cả các tầng test trên đã được kết nối tự động vào file `.github/workflows/ci.yml`. Mỗi khi có commit mới được push lên GitHub, toàn bộ 3 tầng test sẽ tự động kích hoạt để đảm bảo code không bị lỗi trước khi deploy.
