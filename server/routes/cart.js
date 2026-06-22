import express from 'express';
import { getCart, addToCart, updateCartItem, deleteCartItem } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require user verification
router.use(verifyToken);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', deleteCartItem);

export default router;
