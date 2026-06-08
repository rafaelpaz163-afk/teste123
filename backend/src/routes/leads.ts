import { Router } from 'express';
import { leadController } from '../controllers/leadController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(leadController.list));
router.get('/export', authenticate, asyncHandler(leadController.export));
router.post('/:id/recover', authenticate, asyncHandler(leadController.recover));

export { router as leadRouter };
