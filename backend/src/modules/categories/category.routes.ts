import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes (Xem danh mục cho Web & Mobile)
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Seed danh mục chuẩn FU (Hỗ trợ setup ban đầu nhanh chóng)
router.post('/seed', categoryController.seedDefaultCategories);

// Protected routes (Dành riêng cho Quản trị viên ADMIN quản lý danh mục)
router.post('/', authenticate, authorize('ADMIN'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), categoryController.updateCategory);
router.patch('/:id', authenticate, authorize('ADMIN'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), categoryController.deleteCategory);

export default router;
