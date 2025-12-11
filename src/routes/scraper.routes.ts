import { Router } from 'express';
import * as scraperController from '../controllers/scraper.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/scrape', authenticate, scraperController.scrape);

export default router;
