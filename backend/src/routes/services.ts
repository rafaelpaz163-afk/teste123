import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(serviceController.list));
router.post('/', authenticate, authorize('ADMIN'), asyncHandler(serviceController.create));
router.put('/:id', authenticate, authorize('ADMIN'), asyncHandler(serviceController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(serviceController.delete));

export { router as serviceRouter };
