import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Cart } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
const COOKIE_EXPIRE_DAYS = 7;

/**
 * Generate a signed JWT token for the user
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: `${COOKIE_EXPIRE_DAYS}d` }
  );
};

/**
 * Helper to set JWT cookie on response
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
    sameSite: 'lax',
    maxAge: COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000 // In milliseconds
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password with 12 rounds
    const password_hash = await bcrypt.hash(password, 12);

    // Create the User (first registered user can be admin, or we designate through seeders)
    // To make testing easier, if email contains 'admin', or is first user, make them admin:
    const isFirstUser = (await User.count()) === 0;
    const role = (isFirstUser || email.toLowerCase().includes('admin')) ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password_hash,
      role
    });

    // Create an associated shopping cart for the user
    await Cart.create({ user_id: user.id });

    // Generate token and set cookie
    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'Account registered successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed. Server error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Insure they have a cart (if not created during migration)
    await Cart.findOrCreate({ where: { user_id: user.id } });

    // Generate JWT and set httpOnly cookie
    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed. Server error.' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed.' });
  }
};

export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    res.json({ user: req.user });
  } catch (err) {
    console.error('CheckAuth Error:', err);
    res.status(500).json({ error: 'Server error checkauth.' });
  }
};

export const refresh = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Account disabled or missing.' });
    }
    const token = generateToken(user);
    setTokenCookie(res, token);
    res.json({ message: 'Token refreshed successfully.' });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Token refresh failed.' });
  }
};
