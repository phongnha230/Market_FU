# 📜 FU Market - Backend Architecture & Coding Rules

> **Dành cho toàn bộ thành viên Backend Team**  
> Tài liệu này là bộ quy chuẩn kỹ thuật bắt buộc khi thiết kế, lập trình và mở rộng các tính năng Backend trong hệ thống **FU Student Second-hand Market** (Node.js, Express, TypeScript, Prisma ORM, MongoDB).

---

## 🏗️ 1. Kiến trúc phân tầng (Clean / 3-Tier Architecture)

Mỗi module chức năng nằm trong thư mục `src/modules/<feature_name>/` và **BẮT BUỘC** chia thành 4 tệp tách biệt:

```
src/modules/<feature_name>/
├── <feature_name>.dto.ts         # Schema validation (Zod) & TypeScript Types
├── <feature_name>.controller.ts  # HTTP Request/Response Handler (Không chứa Business Logic)
├── <feature_name>.service.ts     # Business Logic & Database Queries / Transactions
└── <feature_name>.routes.ts      # Express Router, Middlewares & URL Mapping
```

### Phân công trách nhiệm nghiêm ngặt:
1. **Routes (`*.routes.ts`)**:
   - Định nghĩa endpoint (`GET`, `POST`, `PUT`, `DELETE`).
   - Gắn middlewares theo thứ tự: Rate limiter -> `authenticate` -> `authorize(...)` -> `upload` -> Controller method.
   - Không viết callback trực tiếp trong route definition.

2. **Controller (`*.controller.ts`)**:
   - Chỉ làm 3 việc:
     1. Lấy dữ liệu từ `req.body`, `req.query`, `req.params` và xác thực qua DTO Schema (`schema.parse()`).
     2. Gọi hàm tương ứng từ `Service`.
     3. Trả về kết quả qua helper `sendSuccess(res, result, meta, statusCode)`.
   - Bắt toàn bộ lỗi trong khối `try ... catch (error) { next(error); }`.
   - **CẤM**: Viết logic tính toán nghiệp vụ, query DB trực tiếp (`prisma.xxx`), hoặc tự ý `res.json()` không đúng format.

3. **Service (`*.service.ts`)**:
   - Chứa **100% Business Logic** của hệ thống.
   - Gọi `prisma` để truy vấn/cập nhật database.
   - Quản lý Transaction khi có nhiều thao tác ghi dữ liệu.
   - Ném lỗi có chủ đích bằng `AppError` khi phát hiện vi phạm nghiệp vụ (vd: hàng đã bán, số dư không đủ, không có quyền sở hữu).

4. **DTO (`*.dto.ts`)**:
   - Dùng thư viện `zod` để định nghĩa validation schema cho Body, Query và Params.
   - Export các TypeScript type suy luận từ schema (`z.infer<typeof schema>`).

---

## 🔒 2. Quy chuẩn Bảo mật & Input Validation

### 2.1. 100% Input phải được xác thực bằng Zod
- Mọi dữ liệu người dùng gửi lên (`body`, `query`, `params`) đều phải được định nghĩa schema Zod và gọi `.parse()` ở Controller trước khi chuyển cho Service.
- Sử dụng `z.coerce.number()` cho các tham số số từ query params.

### 2.2. Mật khẩu & Xác thực (Authentication)
- Mật khẩu phải hash bằng `bcryptjs` với salt rounds tối thiểu là `10`.
- Sử dụng JWT:
  - **Access Token:** Thời hạn ngắn (15 phút), gửi qua header `Authorization: Bearer <token>`.
  - **Refresh Token:** Thời hạn dài (7 ngày), lưu trữ trong `HttpOnly, Secure, SameSite=Strict Cookie`.
- Bảo vệ endpoint bằng middleware `authenticate` và phân quyền bằng `authorize('ADMIN', 'SELLER')`.

### 2.3. Secrets & Biến môi trường
- **TUYỆT ĐỐI KHÔNG** hardcode secret key, database URL, Firebase token, AWS key vào mã nguồn.
- Tất cả phải khai báo trong `.env` và truy cập thông qua đối tượng `ENV` tại `src/config/env.ts`.

---

## ⚡ 3. Chuẩn hóa Response & Error Handling

Toàn bộ API trả về client phải tuân theo cấu trúc JSON đồng nhất 100%:

### 3.1. Success Response (Thành công)
Sử dụng helper `sendSuccess(res, data, meta, statusCode)` từ `src/utils/response.ts`:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3.2. Error Response (Thất bại)
Khi cần báo lỗi trong `Service`, hãy `throw new AppError(message, statusCode, errorCode)`:
```typescript
import { AppError } from '../../middlewares/error.middleware';

// Ví dụ:
throw new AppError('Sản phẩm không tồn tại hoặc đã bị xóa', 404, 'PRODUCT_NOT_FOUND');
throw new AppError('Bạn không có quyền chỉnh sửa sản phẩm này', 403, 'FORBIDDEN');
```

Hệ thống sẽ tự động chuyển đổi thành format chuẩn qua `errorHandler`:
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Sản phẩm không tồn tại hoặc đã bị xóa"
  }
}
```

> ⚠️ **Lưu ý**: Ở môi trường `production`, không bao giờ để lộ raw database error hoặc stack trace ra bên ngoài.

---

## 💾 4. Quy chuẩn Database & Prisma ORM (MongoDB)

### 4.1. Phân trang (Pagination)
- Mọi API lấy danh sách **bắt buộc** phải hỗ trợ phân trang (`page`, `limit`).
- `limit` mặc định là 20, tối đa không quá 50 để tránh quá tải bộ nhớ.
- Trả về kèm trường `meta: { page, limit, total, totalPages }`.

### 4.2. Tối ưu Query (Projection)
- Không dùng query `findMany` mà lấy toàn bộ trường nặng nếu giao diện danh sách không cần đến (dùng `select` để chọn các field cần thiết).
- Tránh N+1 query: Dùng `include` hợp lý của Prisma để nạp quan hệ trong một câu truy vấn duy nhất.

### 4.3. Database Transactions
- Khi thực hiện chuỗi hành động ghi dữ liệu liên quan nhiều collection (ví dụ: Tạo đơn hàng + Giảm số lượng tồn kho sản phẩm + Tạo bản ghi thanh toán), **BẮT BUỘC** dùng `prisma.$transaction`:
```typescript
await prisma.$transaction(async (tx) => {
  const product = await tx.product.update({
    where: { id: productId },
    data: { status: 'SOLD' },
  });
  const order = await tx.order.create({
    data: { ...orderData },
  });
  return order;
});
```

---

## 📝 5. Code mẫu chuẩn (Boilerplate Template)

Khi tạo một module mới (ví dụ: `orders`), hãy copy theo mẫu chuẩn dưới đây:

### 📄 `orders.dto.ts`
```typescript
import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.string().min(1, 'productId không được để trống'),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'VNPay']),
  note: z.string().max(500).optional(),
});

export const queryOrderSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type QueryOrderInput = z.infer<typeof queryOrderSchema>;
```

### 📄 `orders.service.ts`
```typescript
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CreateOrderInput, QueryOrderInput } from './orders.dto';

export class OrderService {
  async createOrder(buyerId: string, input: CreateOrderInput) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
      }

      if (product.sellerId === buyerId) {
        throw new AppError('Bạn không thể tự mua sản phẩm của chính mình', 400, 'SELF_PURCHASE_NOT_ALLOWED');
      }

      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.sellerId,
          productId: product.id,
          totalAmount: product.price,
          status: 'PENDING',
          note: input.note,
        },
      });

      return order;
    });
  }

  async getOrders(userId: string, query: QueryOrderInput) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const orderService = new OrderService();
```

### 📄 `orders.controller.ts`
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { orderService } from './orders.service';
import { createOrderSchema, queryOrderSchema } from './orders.dto';
import { sendSuccess } from '../../utils/response';

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.userId, validatedData);
      return sendSuccess(res, order, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryOrderSchema.parse(req.query);
      const { orders, pagination } = await orderService.getOrders(req.user!.userId, query);
      return sendSuccess(res, orders, pagination);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
```

### 📄 `orders.routes.ts`
```typescript
import { Router } from 'express';
import { orderController } from './orders.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, (req, res, next) => orderController.createOrder(req, res, next));
router.get('/', authenticate, (req, res, next) => orderController.getOrders(req, res, next));

export default router;
```

---

## 🧪 6. Quy chuẩn Kiểm thử & Trước khi Commit

Mỗi khi phát triển tính năng mới, trước khi tạo Commit hoặc Pull Request, thành viên phải chạy các lệnh sau:

1. **Kiểm tra TypeScript & Build:**
   ```bash
   npm run build
   ```
2. **Chạy Unit/Integration Tests:**
   ```bash
   npm test
   ```
3. **Quy tắc Git:**
   - Tuyệt đối không commit file `.env`, tệp chứa key nhạy cảm hoặc các file private cá nhân.
   - Commit message rõ ràng theo Conventional Commits: `feat(orders): add create order transaction`, `fix(auth): fix token expiration handling`.
