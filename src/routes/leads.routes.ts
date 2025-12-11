import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as leadsController from '../controllers/leads.controller';

const router = express.Router();

router.get('/', authenticate, leadsController.getLeads);

export default router;
