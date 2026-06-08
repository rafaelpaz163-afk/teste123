import { Router } from 'express';
import { qualityScoreController } from '../controllers/qualityScoreController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(qualityScoreController.list));
router.get('/stats', authenticate, asyncHandler(qualityScoreController.getStats));
router.post('/', authenticate, authorize('ADMIN'), asyncHandler(qualityScoreController.create));

export { router as qualityScoreRouter };
