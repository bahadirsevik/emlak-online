import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/events', authenticate, calendarController.getCalendarEvents);

export default router;
