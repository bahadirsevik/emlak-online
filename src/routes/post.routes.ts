import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/schedule', authenticate, postController.schedulePost);
router.get('/stats', authenticate, postController.getPostStats);
router.get('/recent', authenticate, postController.getRecentPosts);

export default router;
