import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/evolution', asyncHandler(webhookController.handleEvolution));
router.post('/evolution/status', asyncHandler(webhookController.handleStatus));

export { router as webhookRouter };
