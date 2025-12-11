import { Router } from 'express';
import * as instagramController from '../controllers/instagram.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/auth', authenticate, instagramController.initAuth);
router.get('/callback', authenticate, instagramController.callback); // Note: Callback might need special handling for auth if it comes from browser redirect
router.get('/accounts', authenticate, instagramController.getAccounts);
router.delete('/accounts/:id', authenticate, instagramController.disconnectAccount);
router.post('/manual_connect', authenticate, instagramController.connectManual);
router.put('/accounts/:id/watermark', authenticate, instagramController.updateWatermarkSettings);

export default router;
