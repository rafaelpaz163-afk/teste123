import { Router } from 'express';
import { whatsappController } from '../controllers/whatsappController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/status', authenticate, asyncHandler(whatsappController.getStatus));
router.post('/send', authenticate, authorize('ADMIN'), asyncHandler(whatsappController.sendMessage));
router.post('/send-group', authenticate, authorize('ADMIN'), asyncHandler(whatsappController.sendGroupMessage));

export { router as whatsappRouter };
