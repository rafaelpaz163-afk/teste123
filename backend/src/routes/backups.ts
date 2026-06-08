import { Router } from 'express';
import { backupController } from '../controllers/backupController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), asyncHandler(backupController.list));
router.post('/', authenticate, authorize('ADMIN'), asyncHandler(backupController.create));
router.post('/:id/restore', authenticate, authorize('ADMIN'), asyncHandler(backupController.restore));

export { router as backupRouter };
