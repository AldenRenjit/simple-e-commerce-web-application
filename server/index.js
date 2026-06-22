import express from 'express';
import cookieParser from 'cookie-parser';
import { sequelize } from './models/index.js';
import { runSeeder } from './seeders/seed.js';

// Import Route Groups
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Set up standard utilities
app.use(express.json());
app.use(cookieParser());

// REST API endpoint registration
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

/**
 * Configure database connections and schemas
 */
export async function initDatabase() {
  try {
    console.log('Database synchronization starting...');
    
    // Sync all models (will create tables if they do not exist)
    await sequelize.sync({ force: false });
    console.log('Sequelize Models synchronized successfully!');

    // Dry-run standard hydration
    await runSeeder();
  } catch (err) {
    console.error('Critical database initialization error:', err);
  }
}

export default app;
export { app };
