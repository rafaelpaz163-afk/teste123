import { Router } from 'express';
import { auditLogController } from '../controllers/auditLogController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), asyncHandler(auditLogController.list));

export { router as auditLogRouter };
