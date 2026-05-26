import express from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', requireAdmin, updateSettings);

export default router;
