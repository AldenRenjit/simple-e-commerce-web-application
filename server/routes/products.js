import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkStockUpdate
} from '../controllers/productsController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', verifyToken, requireRole('admin'), createProduct);
router.put('/:id', verifyToken, requireRole('admin'), updateProduct);
router.delete('/:id', verifyToken, requireRole('admin'), deleteProduct);
router.post('/bulk-stock-update', verifyToken, requireRole('admin'), bulkStockUpdate);

export default router;
