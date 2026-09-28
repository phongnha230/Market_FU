import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { productUploadMiddleware } from '../../middlewares/upload.middleware';

const router = Router();

// Public routes (Xem danh sách và chi tiết)
router.get('/', productController.getProducts);

// Protected routes (Xem danh sách yêu thích) - đặt trước :id
router.get('/favorites/me', authenticate, productController.getMyFavorites);

// Redis ZSET: Top từ khóa tìm kiếm & Top sản phẩm hot nhất trên sàn (đặt trước :id)
router.get('/trending/searches', productController.getTrendingSearches);
router.get('/trending/items', productController.getTrendingItems);

// Meilisearch autocomplete suggest (đặt trước :id)
router.get('/suggest', productController.suggestProducts);

router.get('/:id', productController.getProductById);

// Protected routes (Đăng bán, cập nhật, đổi trạng thái, xóa món đồ)
router.post('/', authenticate, productUploadMiddleware, productController.createProduct);
router.patch('/:id/status', authenticate, productController.updateProductStatus);
router.patch('/:id', authenticate, productUploadMiddleware, productController.updateProduct);
router.delete('/:id', authenticate, productController.deleteProduct);

// RESTful Favorite Management (PUT để thêm, DELETE để xóa - Idempotent)
router.put('/:id/favorite', authenticate, productController.addFavorite);
router.delete('/:id/favorite', authenticate, productController.removeFavorite);
// Tương thích ngược: POST toggle favorite
router.post('/:id/favorite', authenticate, productController.toggleFavorite);

// Quản lý gia hạn & Đẩy tin (Hỗ trợ cả RESTful sub-resource và action alias)
router.post('/:id/renew', authenticate, productController.renewProduct);
router.post('/:id/renewals', authenticate, productController.renewProduct);
router.post('/:id/boost', authenticate, productController.boostProduct);
router.post('/:id/boosts', authenticate, productController.boostProduct);

export default router;
