import { Router } from 'express';
import { petController } from '../controllers/petController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(petController.list));
router.post('/', authenticate, asyncHandler(petController.create));
router.put('/:id', authenticate, asyncHandler(petController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(petController.delete));

export { router as petRouter };
