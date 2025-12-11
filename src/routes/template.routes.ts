import { Router } from 'express';
import * as templateController from '../controllers/template.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, templateController.createTemplate);
router.get('/', authenticate, templateController.getTemplates);
router.put('/:id', authenticate, templateController.updateTemplate);
router.delete('/:id', authenticate, templateController.deleteTemplate);

export default router;
