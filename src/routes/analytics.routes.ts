import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/overview', authenticate, analyticsController.getOverview);
router.get('/accounts', authenticate, analyticsController.getAccountStats);

export default router;
