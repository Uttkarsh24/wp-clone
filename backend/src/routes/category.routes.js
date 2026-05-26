import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/category.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', requireAdmin, createCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;
