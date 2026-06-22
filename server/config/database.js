import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

/**
 * DATABASE SCHEMA EQUIVALENTS (For reference as requested):
 * 
 * -- MySQL Equalities schema:
 * CREATE TABLE users (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(255) NOT NULL,
 *   email VARCHAR(255) UNIQUE NOT NULL,
 *   password_hash VARCHAR(255) NOT NULL,
 *   role ENUM('admin', 'user') DEFAULT 'user',
 *   is_active BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 * 
 * -- MongoDB Equivalent schema (using Mongoose):
 * const UserSchema = new mongoose.Schema({
 *   name: { type: String, required: true },
 *   email: { type: String, unique: true, required: true },
 *   password_hash: { type: String, required: true },
 *   role: { type: String, enum: ['admin', 'user'], default: 'user' },
 *   is_active: { type: Boolean, default: true }
 * }, { timestamps: true });
 */

let sequelize;

if (process.env.DB_HOST || process.env.SQL_HOST) {
  // Use PostgreSQL
  const dbHost = process.env.SQL_HOST || process.env.DB_HOST || 'localhost';
  const dbUser = process.env.SQL_USER || process.env.DB_USER || 'postgres';
  const dbPass = process.env.SQL_PASSWORD || process.env.DB_PASS || 'postgres';
  const dbName = process.env.SQL_DB_NAME || process.env.DB_NAME || 'ecommerce';
  const dbPort = process.env.DB_PORT || 5432;

  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
    dialectOptions: dbHost.startsWith('/') ? {
      socketPath: dbHost // Support Unix socket for Google Cloud SQL
    } : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  console.log('Database configured for PostgreSQL');
} else {
  // Use SQLite as local out-of-box fallback
  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });
  console.log(`Database configured for SQLite: ${dbPath}`);
}

export default sequelize;
export { sequelize };
