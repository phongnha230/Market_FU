import { Router } from 'express';
import { safeHandoffController } from './safehandoff.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// 1. Danh sách trạm Safe-Handoff (Công khai cho toàn bộ sinh viên xem)
router.get('/', safeHandoffController.getHubs);

// 2. Tìm trạm Safe-Handoff gần nhất (Redis Geospatial, đặt trước :id)
router.get('/nearby', safeHandoffController.getNearbyHubs);

// 3. Chi tiết 1 trạm
router.get('/:id', safeHandoffController.getHubById);

// 4. Quản trị trạm (Dành riêng cho ADMIN)
router.post('/', authenticate, authorize('ADMIN'), safeHandoffController.createHub);
router.patch('/:id', authenticate, authorize('ADMIN'), safeHandoffController.updateHub);
router.patch('/:id/toggle', authenticate, authorize('ADMIN'), safeHandoffController.toggleHubStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), safeHandoffController.deleteHub);

export default router;
