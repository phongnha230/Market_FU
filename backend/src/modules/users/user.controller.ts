import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { userService } from './user.service';
import { queryUserSchema, updateUserStatusSchema } from './user.dto';
import { productService } from '../products/product.service';
import { trendingService } from '../analytics/trending.service';
import { sendSuccess } from '../../utils/response';

export class UserController {
  /**
   * [GET /api/users/me/favorites] Lấy danh sách sản phẩm yêu thích (Chuẩn RESTful resource)
   */
  getMyFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const products = await productService.getMyFavorites(authReq.user!.userId);
      return sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  // --------------------------------------------------------------------------
  // Quản trị User (Admin) & Chi tiết User
  // --------------------------------------------------------------------------
  /**
   * [GET /api/users] Danh sách người dùng
   */
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = queryUserSchema.parse(req.query);
      const { users, pagination } = await userService.getUsers(query);
      return sendSuccess(res, users, pagination);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/users/:id] Chi tiết người dùng theo ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.getUserById(id);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [PATCH /api/users/:id/status] Khóa hoặc mở khóa tài khoản người dùng
   */
  updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isActive } = updateUserStatusSchema.parse(req.body);
      const user = await userService.updateUserStatus(id, isActive);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/users/leaderboard/reputation] Bảng xếp hạng sinh viên uy tín nhất từ Redis ZSET
   */
  getReputationLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 50) : 10;
      const leaderboard = await trendingService.getReputationLeaderboard(limit);
      return sendSuccess(res, leaderboard);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
