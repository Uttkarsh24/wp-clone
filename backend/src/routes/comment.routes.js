import express from 'express';
import { getComments, getCommentsByPostId, createComment, moderateComment, deleteComment } from '../controllers/comment.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', requireAdmin, getComments);
router.get('/post/:postId', getCommentsByPostId);
router.post('/', createComment);
router.put('/:id', requireAdmin, moderateComment);
router.delete('/:id', requireAdmin, deleteComment);

export default router;
