import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/conversations', authenticate, asyncHandler(reportController.conversations));
router.get('/appointments', authenticate, asyncHandler(reportController.appointments));
router.get('/performance', authenticate, asyncHandler(reportController.performance));

export { router as reportRouter };
