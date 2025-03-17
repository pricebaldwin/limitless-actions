import path from 'path';
import fs from 'fs';
import { getDbAdapter } from './adapter';
import logger from '../utils/logger';
import { DatabaseAdapter } from '../types';

/**
 * Initializes the database by ensuring the data directory exists
 * and creating the necessary tables.
 */
export async function initializeDatabase(): Promise<DatabaseAdapter> {
  try {
    // Ensure data directory exists
    const dbPath = process.env.DB_PATH || './data/limitless.db';
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      logger.info(`Creating data directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Get database adapter based on configuration
    const db = getDbAdapter();
    
    // Create tables if they don't exist
    await db.createTables();
    
    return db;
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
}

