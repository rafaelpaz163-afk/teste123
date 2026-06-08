import { Router } from 'express';
import { aiConfigController } from '../controllers/aiConfigController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/status', authenticate, asyncHandler(aiConfigController.getStatus));
router.put('/status', authenticate, authorize('ADMIN'), asyncHandler(aiConfigController.updateStatus));
router.post('/toggle', authenticate, authorize('ADMIN'), asyncHandler(aiConfigController.toggleAI));

export { router as aiConfigRouter };
