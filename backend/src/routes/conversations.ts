import { Router } from 'express';
import { conversationController } from '../controllers/conversationController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, asyncHandler(conversationController.list));
router.get('/stats', authenticate, asyncHandler(conversationController.getStats));
router.get('/:id', authenticate, asyncHandler(conversationController.getById));
router.post('/:id/messages', authenticate, asyncHandler(conversationController.sendMessage));
router.post('/:id/takeover', authenticate, asyncHandler(conversationController.takeOver));
router.post('/:id/return-ai', authenticate, asyncHandler(conversationController.returnToAI));
router.post('/:id/close', authenticate, asyncHandler(conversationController.close));

export { router as conversationRouter };
