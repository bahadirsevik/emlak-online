import { Router } from 'express';
import multer from 'multer';
import { upload } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const uploadMiddleware = multer({ dest: 'uploads/' });

router.post('/', authenticate, uploadMiddleware.single('image'), upload);

export default router;
