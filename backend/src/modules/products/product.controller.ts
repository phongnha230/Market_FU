import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { productService } from './product.service';
import { trendingService } from '../analytics/trending.service';
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  queryProductSchema,
  boostProductSchema,
  approveProductSchema,
  rejectProductSchema,
} from './product.dto';
import { sendSuccess } from '../../utils/response';

export class ProductController {
  // Đăng bán
  async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createProductSchema.parse(req.body);

      let imageFiles: Express.Multer.File[] = [];
      let videoFile: Express.Multer.File | undefined;

      if (Array.isArray(req.files)) {
        // Hỗ trợ trường hợp client upload theo mảng generic
        req.files.forEach((file) => {
          if (file.mimetype.startsWith('video/')) {
            if (!videoFile) videoFile = file;
          } else {
            imageFiles.push(file);
          }
        });
      } else if (req.files && typeof req.files === 'object') {
        // Hỗ trợ trường hợp multer.fields ({ images: [...], video: [...] })
        const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
        imageFiles = filesMap['images'] || [];
        videoFile = filesMap['video']?.[0];
      }

      const product = await productService.createProduct(
        req.user!.userId,
        validatedData,
        imageFiles,
        videoFile
      );
      sendSuccess(res, product, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // Danh sách + Lọc (có meta pagination theo chuẩn GEMINI.md)
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryProductSchema.parse(req.query);
      const { products, pagination } = await productService.getProducts(query);
      sendSuccess(res, products, pagination);
    } catch (error) {
      next(error);
    }
  }

  // Chi tiết sản phẩm
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const viewerIp = (req as any).user?.userId || req.ip || 'anonymous';
      const product = await productService.getProductById(id, viewerIp, (req as AuthRequest).user?.userId, (req as AuthRequest).user?.role);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách sản phẩm của người dùng đang đăng nhập (GET /api/products/me)
  async getMyProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryProductSchema.parse({
        ...req.query,
        sellerId: req.user!.userId,
        allStatuses: 'true', // Hiện tất cả trạng thái (available, sold, hidden...)
        limit: 50,
      });
      const { products, pagination } = await productService.getProducts(query, { ownerId: req.user!.userId });
      sendSuccess(res, products, pagination);
    } catch (error) {
      next(error);
    }
  }

  // Gia hạn 30 ngày
  async renewProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const product = await productService.renewProduct(req.user!.userId, id);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  // Thả tim / Bỏ tim sản phẩm
  async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.toggleFavorite(req.user!.userId, id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Xem danh sách món đồ đã lưu yêu thích (Wishlist)
  async getMyFavorites(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const products = await productService.getMyFavorites(req.user!.userId);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }

  // Dùng Xu để đẩy tin / ghim nổi bật bài viết (Boost Post)
  async boostProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = boostProductSchema.parse(req.body);
      const result = await productService.boostProduct(req.user!.userId, id, validated.type);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật sản phẩm (PATCH /api/products/:id)
  async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validatedData = updateProductSchema.parse(req.body);

      let imageFiles: Express.Multer.File[] = [];
      if (Array.isArray(req.files)) {
        imageFiles = req.files.filter((f) => !f.mimetype.startsWith('video/'));
      } else if (req.files && typeof req.files === 'object') {
        const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
        imageFiles = filesMap['images'] || [];
      }

      const updated = await productService.updateProduct(
        req.user!.userId,
        id,
        validatedData,
        imageFiles.length > 0 ? imageFiles : undefined
      );
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật trạng thái sản phẩm (PATCH /api/products/:id/status - Task 1.4)
  async updateProductStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validated = updateProductStatusSchema.parse(req.body);
      const updated = await productService.updateProductStatus(req.user!.userId, id, validated.status);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  // Xóa sản phẩm (DELETE /api/products/:id)
  async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.deleteProduct(req.user!.userId, req.user!.role, id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Thêm vào danh sách yêu thích (PUT /api/products/:id/favorite - Idempotent)
  async addFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.addFavorite(req.user!.userId, id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Xóa khỏi danh sách yêu thích (DELETE /api/products/:id/favorite - Idempotent)
  async removeFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await productService.removeFavorite(req.user!.userId, id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Lấy Top từ khóa tìm kiếm hot nhất từ Redis ZSET (GET /api/products/trending/searches)
  async getTrendingSearches(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 20) : 10;
      const trends = await trendingService.getTrendingKeywords(limit);
      sendSuccess(res, trends);
    } catch (error) {
      next(error);
    }
  }

  // Lấy Top sản phẩm hot nhất theo tương tác từ Redis ZSET (GET /api/products/trending/items)
  async getTrendingItems(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 20) : 8;
      const items = await trendingService.getTrendingProducts(limit);
      sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  }

  // Gợi ý tìm kiếm thông minh qua Meilisearch (GET /api/products/suggest?q=sach&campus=HOL&limit=6)
  async suggestProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string || '').trim();
      const campus = req.query.campus as string | undefined;
      const limit = Math.min(parseInt(req.query.limit as string || '6', 10), 10);

      if (!q || q.length < 1) {
        return sendSuccess(res, []);
      }

      const suggestions = await productService.getSuggestions(q, { campus, limit });
      return sendSuccess(res, suggestions);
    } catch (error) {
      next(error);
    }
  }

  // Quản trị viên xem danh sách tin kiểm duyệt (GET /api/products/admin/moderation)
  async getAdminProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await productService.getAdminProducts(req.query as any);
      sendSuccess(res, result.products, {
        ...result.pagination,
        counts: result.counts,
      });
    } catch (error) {
      next(error);
    }
  }

  // Quản trị viên phê duyệt tin đăng (PATCH /api/products/admin/:id/approve)
  async approveProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { expectedUpdatedAt } = approveProductSchema.parse(req.body);
      const result = await productService.approveProduct(req.user!.userId, id, expectedUpdatedAt);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Quản trị viên từ chối tin đăng (PATCH /api/products/admin/:id/reject)
  async rejectProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reason, expectedUpdatedAt } = rejectProductSchema.parse(req.body);
      const result = await productService.rejectProduct(req.user!.userId, id, reason, expectedUpdatedAt);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
