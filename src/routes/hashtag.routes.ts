import { Router } from 'express';
import * as hashtagController from '../controllers/hashtag.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/groups', authenticate, hashtagController.getHashtagGroups);
router.post('/groups', authenticate, hashtagController.createHashtagGroup);
router.delete('/groups/:id', authenticate, hashtagController.deleteHashtagGroup);

export default router;
