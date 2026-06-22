import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';

/**
 * Midleware to parse and verify the JWT access token.
 * Populates req.user with decoded credentials.
 */
export const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Read token from HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // 2. Fallback to Authorization Header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch user from DB to verify they are active and valid
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }

    // Attach user metadata to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    };

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid or corrupted authentication token.' });
  }
};

/**
 * Role-Based Access Control middleware.
 * Must be declared immediately AFTER verifyToken (e.g., verifyToken, requireRole('admin')).
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authenticated user required.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden. Role '${role}' required for this resource.` });
    }

    next();
  };
};
