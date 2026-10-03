# BÁO CÁO 08: CHUẨN HÓA TYPE SAFETY & SỬA LỖI TYPESCRIPT COMPILER

## 1. Vấn đề phát hiện
Trong quá trình refactor và kiểm tra nghiêm ngặt với `npx tsc --noEmit`, một số lỗi TypeScript đã được phát hiện và xử lý:

1. **Lỗi Promise với setTimeout trong TypeScript Strict Mode (TS2345)**:
   - **Đoạn mã lỗi**:
     ```typescript
     await new Promise((r) => setTimeout(r, 600));
     ```
   - **Nguyên nhân**: Trong định nghĩa kiểu chuẩn của TypeScript, hàm resolve `r` trong executor mong đợi 0 hoặc 1 đối số tương ứng với kiểu generic. Khi truyền trực tiếp hàm `r` vào `setTimeout`, hàm `setTimeout` truyền một số đối số (như timer id hoặc args) vào `r`, dẫn đến xung đột kiểu.
2. **Lỗi Non-component export trong component file (ESLint/React-Doctor)**:
   - File `.tsx` export các interfaces/types/constants cùng lúc với React component chính.
3. **Lỗi ép kiểu `route.params`**:
   - `const { productId, product } = route.params || {};` có nguy cơ `undefined` khi navigate không truyền params.
4. **Lỗi State updater generic typing**:
   - Hàm `updateField` trong các controller hooks khi nhận key và value không khớp type có thể gây lỗi runtime nếu không ràng buộc generic constraints.

---

## 2. Giải pháp kỹ thuật

### A. Chuẩn hóa hàm trễ (Delay / Sleep)
Chuyển đổi toàn bộ các lệnh chờ bất đồng bộ mô phỏng mạng sang dạng chuẩn Type-Safe:
```typescript
await new Promise<void>((resolve) => {
  setTimeout(() => resolve(), 600);
});
```
Đảm bảo hàm `resolve()` được gọi không có đối số và `Promise` trả về đúng kiểu `<void>`.

### B. Ràng buộc Generic Type-Safe cho Form Updaters
Áp dụng mẫu thiết kế cập nhật trường an toàn tuyệt đối trong các custom hooks (`useEditProfileForm`, `useEditListingController`):
```typescript
const updateField = useCallback(<K extends keyof EditListingFormData>(
  field: K,
  value: EditListingFormData[K]
) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
}, []);
```
TypeScript sẽ tự động báo lỗi ngay tại IDE nếu người dùng truyền nhầm kiểu (ví dụ truyền boolean cho field kiểu string).

### C. Phân tách Hằng số và Type Definitions
- Trích xuất toàn bộ hằng số sang tệp riêng (`listingConstants.ts`, `editListingConstants.ts`, `banks.constants.ts`, `campuses.constants.ts`).
- Các interfaces dùng chung được tổ chức rõ ràng trong thư mục `types/`.

---

## 3. Kết quả xác minh
- Lệnh kiểm tra:
  ```powershell
  npx tsc --noEmit
  ```
- Kết quả: **Exit code 0 (Zero errors)**. Toàn bộ mã nguồn Mobile đạt chuẩn kiểm soát kiểu dữ liệu tĩnh 100%.
