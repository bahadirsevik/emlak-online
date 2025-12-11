import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate-caption', authenticate, aiController.generateCaption);
router.post('/generate-hashtags', authenticate, aiController.generateHashtags);
router.post('/analyze-image', authenticate, aiController.analyzeImage);

export default router;
