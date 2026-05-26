import express from 'express';
import { getMedia, createMedia, deleteMedia, upload } from '../controllers/media.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getMedia);
router.post('/', requireAdmin, upload.single('file'), createMedia);
router.delete('/:id', requireAdmin, deleteMedia);

export default router;
