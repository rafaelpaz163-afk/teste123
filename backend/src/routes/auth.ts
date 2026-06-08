import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.get('/me', authenticate, asyncHandler(authController.me));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/users', authenticate, authorize('ADMIN'), asyncHandler(authController.listUsers));
router.put('/users/:id', authenticate, authorize('ADMIN'), asyncHandler(authController.updateUser));

export { router as authRouter };
