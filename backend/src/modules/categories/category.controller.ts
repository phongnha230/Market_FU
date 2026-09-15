import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';
import { createCategorySchema, updateCategorySchema } from './category.dto';
import { sendSuccess } from '../../utils/response';

export class CategoryController {
  // Lấy danh sách danh mục (Public)
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await categoryService.getAllCategories(includeInactive);
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh mục theo slug (Public)
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const category = await categoryService.getCategoryBySlug(slug);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  // Thêm mới danh mục (Admin)
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await categoryService.createCategory(validatedData);
      sendSuccess(res, category, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật danh mục (Admin)
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await categoryService.updateCategory(id, validatedData);
      sendSuccess(res, category);
    } catch (error) {
      next(error);
    }
  }

  // Xóa danh mục (Admin)
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await categoryService.deleteCategory(id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Khởi tạo danh mục mẫu chuẩn FU (Seed)
  async seedDefaultCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.seedDefaultCategories();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
