import express from 'express';
import { getPosts, getPostBySlug, createPost, updatePost, deletePost } from '../controllers/post.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/', requireAdmin, createPost);
router.put('/:id', requireAdmin, updatePost);
router.delete('/:id', requireAdmin, deletePost);

export default router;
