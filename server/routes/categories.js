import express from 'express';
import { getCategories, createCategory } from '../controllers/categoriesController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getCategories);

// Admin route
router.post('/', verifyToken, requireRole('admin'), createCategory);

export default router;
