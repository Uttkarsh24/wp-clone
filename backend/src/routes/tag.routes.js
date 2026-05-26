import express from 'express';
import { getTags, createTag, deleteTag } from '../controllers/tag.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getTags);
router.post('/', requireAdmin, createTag);
router.delete('/:id', requireAdmin, deleteTag);

export default router;
