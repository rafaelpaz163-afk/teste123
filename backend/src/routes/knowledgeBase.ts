import { Router } from 'express';
import { knowledgeBaseController } from '../controllers/knowledgeBaseController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.get('/', authenticate, asyncHandler(knowledgeBaseController.list));
router.post('/', authenticate, asyncHandler(knowledgeBaseController.create));
router.post('/upload', authenticate, upload.single('file'), asyncHandler(knowledgeBaseController.uploadFile));
router.put('/:id', authenticate, asyncHandler(knowledgeBaseController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(knowledgeBaseController.delete));

export { router as knowledgeBaseRouter };
