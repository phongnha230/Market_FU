import { Router } from 'express';
import { safeHandoffController } from './safehandoff.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// 1. Danh sách trạm Safe-Handoff (Công khai cho toàn bộ sinh viên xem)
router.get('/', (req, res, next) => safeHandoffController.getHubs(req, res, next));

// 2. Chi tiết 1 trạm
router.get('/:id', (req, res, next) => safeHandoffController.getHubById(req, res, next));

// 3. Quản trị trạm (Dành riêng cho ADMIN)
router.post('/', authenticate, authorize('ADMIN'), (req, res, next) =>
  safeHandoffController.createHub(req, res, next)
);

router.patch('/:id', authenticate, authorize('ADMIN'), (req, res, next) =>
  safeHandoffController.updateHub(req, res, next)
);

router.patch('/:id/toggle', authenticate, authorize('ADMIN'), (req, res, next) =>
  safeHandoffController.toggleHubStatus(req, res, next)
);

router.delete('/:id', authenticate, authorize('ADMIN'), (req, res, next) =>
  safeHandoffController.deleteHub(req, res, next)
);

export default router;
