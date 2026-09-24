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
  getHubs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = QuerySafeHandoffHubsSchema.parse(req.query);
      const result = await safeHandoffService.getHubs(query);
      return sendSuccess(res, result.hubs, result.stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy chi tiết 1 trạm
   */
  getHubById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hub = await safeHandoffService.getHubById(req.params.id as string);
      return sendSuccess(res, hub);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tạo trạm mới (Admin)
   */
  createHub = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CreateSafeHandoffHubSchema.parse(req.body);
      const hub = await safeHandoffService.createHub(input);
      return sendSuccess(res, hub, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật thông tin trạm (Admin)
   */
  updateHub = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = UpdateSafeHandoffHubSchema.parse(req.body);
      const hub = await safeHandoffService.updateHub(req.params.id as string, input);
      return sendSuccess(res, hub);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bật / Tắt trạng thái hoạt động (Admin)
   */
  toggleHubStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hub = await safeHandoffService.toggleHubStatus(req.params.id as string);
      return sendSuccess(res, hub);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa trạm (Admin)
   */
  deleteHub = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await safeHandoffService.deleteHub(req.params.id as string);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tìm kiếm các trạm Safe-Handoff gần nhất (Redis Geospatial)
   */
  getNearbyHubs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lat = parseFloat((req.query.latitude as string) || (req.query.lat as string) || '21.0135');
      const lng = parseFloat((req.query.longitude as string) || (req.query.lng as string) || '105.5262');
      const radiusKm = parseFloat((req.query.radiusKm as string) || '10');
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const hubs = await safeHandoffService.getNearbyHubs(lng, lat, radiusKm, limit);
      return sendSuccess(res, hubs);
    } catch (error) {
      next(error);
    }
  };
}

export const safeHandoffController = new SafeHandoffController();
