import { Request, Response, NextFunction } from 'express';
import { safeHandoffService } from './safehandoff.service';
import {
  CreateSafeHandoffHubSchema,
  UpdateSafeHandoffHubSchema,
  QuerySafeHandoffHubsSchema,
} from './safehandoff.dto';
import { sendSuccess } from '../../utils/response';

export class SafeHandoffController {
  /**
   * Lấy danh sách trạm Safe-Handoff (Public / User / Admin)
   */
  async getHubs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = QuerySafeHandoffHubsSchema.parse(req.query);
      const result = await safeHandoffService.getHubs(query);
      return sendSuccess(res, result.hubs, result.stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết 1 trạm
   */
  async getHubById(req: Request, res: Response, next: NextFunction) {
    try {
      const hub = await safeHandoffService.getHubById(req.params.id as string);
      return sendSuccess(res, hub);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tạo trạm mới (Admin)
   */
  async createHub(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateSafeHandoffHubSchema.parse(req.body);
      const hub = await safeHandoffService.createHub(input);
      return sendSuccess(res, hub, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin trạm (Admin)
   */
  async updateHub(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateSafeHandoffHubSchema.parse(req.body);
      const hub = await safeHandoffService.updateHub(req.params.id as string, input);
      return sendSuccess(res, hub);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bật / Tắt trạng thái hoạt động (Admin)
   */
  async toggleHubStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const hub = await safeHandoffService.toggleHubStatus(req.params.id as string);
      return sendSuccess(res, hub);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa trạm (Admin)
   */
  async deleteHub(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await safeHandoffService.deleteHub(req.params.id as string);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const safeHandoffController = new SafeHandoffController();
