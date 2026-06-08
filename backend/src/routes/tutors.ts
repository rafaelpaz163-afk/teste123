import { Router } from 'express';
import { tutorController } from '../controllers/tutorController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(tutorController.list));
router.get('/:id', authenticate, asyncHandler(tutorController.getById));
router.post('/', authenticate, asyncHandler(tutorController.create));
router.put('/:id', authenticate, asyncHandler(tutorController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(tutorController.delete));

export { router as tutorRouter };
