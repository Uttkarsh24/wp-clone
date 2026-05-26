import express from 'express';
import { getPages, getPageBySlug, createPage, updatePage, deletePage } from '../controllers/page.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getPages);
router.get('/:slug', getPageBySlug);
router.post('/', requireAdmin, createPage);
router.put('/:id', requireAdmin, updatePage);
router.delete('/:id', requireAdmin, deletePage);

export default router;
