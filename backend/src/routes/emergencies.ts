import { Router } from 'express';
import { emergencyController } from '../controllers/emergencyController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(emergencyController.list));
router.post('/:id/resolve', authenticate, asyncHandler(emergencyController.resolve));

export { router as emergencyRouter };
