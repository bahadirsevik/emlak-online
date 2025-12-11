import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

const router = Router();

// Verification endpoint for Facebook
router.get('/instagram', webhookController.verifyWebhook);

// Event listener endpoint
router.post('/instagram', webhookController.handleWebhook);

export default router;
