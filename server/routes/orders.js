import express from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  exportOrdersCSV
} from '../controllers/ordersController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// User-specific order operations
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById); // Accessible by owner user or admin (authorization checked inside controller)

// Admin-specific operations
router.get('/', requireRole('admin'), getAllOrders);
router.get('/export/csv', requireRole('admin'), exportOrdersCSV);
router.put('/:id/status', requireRole('admin'), updateOrderStatus);

export default router;
