import express from 'express';
import { register, login, logout, me, refresh } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, me);
router.post('/refresh', verifyToken, refresh);

export default router;
