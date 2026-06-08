import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(appointmentController.list));
router.get('/stats', authenticate, asyncHandler(appointmentController.getStats));
router.post('/', authenticate, asyncHandler(appointmentController.create));
router.put('/:id', authenticate, asyncHandler(appointmentController.update));

export { router as appointmentRouter };
