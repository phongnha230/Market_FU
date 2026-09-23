import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { userService } from './user.service';
import { queryUserSchema, updateUserStatusSchema } from './user.dto';
import { profileController } from '../profile/profile.controller';
import { productService } from '../products/product.service';
import { sendSuccess } from '../../utils/response';
import { verifyAccessToken } from '../../utils/token';

export class UserController {
  // --------------------------------------------------------------------------
  // Delegation methods sang ProfileController (Tương thích ngược)
  // --------------------------------------------------------------------------
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    return profileController.getMyProfile(req, res, next);
  }

  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    return profileController.updateMyProfile(req, res, next);
  }

  async updateBankAccount(req: AuthRequest, res: Response, next: NextFunction) {
    return profileController.updateBankAccount(req, res, next);
  }

  async submitKyc(req: AuthRequest, res: Response, next: NextFunction) {
    return profileController.submitKyc(req, res, next);
  }

  /**
   * [GET /api/users/me/favorites] Lấy danh sách sản phẩm yêu thích (Chuẩn RESTful resource)
   */
  async getMyFavorites(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const products = await productService.getMyFavorites(req.user!.userId);
      return sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // Quản trị User (Admin) & Chi tiết User
  // --------------------------------------------------------------------------
  /**
   * [GET /api/users] Danh sách người dùng
   */
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryUserSchema.parse(req.query);
      const { users, pagination } = await userService.getUsers(query);
      return sendSuccess(res, users, pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET /api/users/:id] Chi tiết người dùng theo ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      let currentUser: any = (req as any).user;
      if (!currentUser && req.headers.authorization?.startsWith('Bearer ')) {
        try {
          const token = req.headers.authorization.split(' ')[1];
          currentUser = verifyAccessToken(token);
        } catch {
          // Token không hợp lệ -> Xem ở chế độ khách vãng lai
        }
      }
      const user = await userService.getUserById(id, currentUser);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PATCH /api/users/:id/status] Khóa hoặc mở khóa tài khoản người dùng
   */
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isActive } = updateUserStatusSchema.parse(req.body);
      const user = await userService.updateUserStatus(id, isActive);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
