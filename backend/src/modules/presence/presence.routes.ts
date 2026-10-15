import { Router } from 'express';
import { PresenceController } from './presence.controller';

const router = Router();
const controller = new PresenceController();

// Có thể xem trạng thái online khi đã xác thực hoặc xem công khai
router.get('/:userId', controller.getUserPresence);
router.post('/batch', controller.getBatchPresence);

export default router;
