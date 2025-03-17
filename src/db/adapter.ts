import logger from '../utils/logger';
import SqliteAdapter from './adapters/sqlite';
import { DatabaseAdapter, DatabaseStats, LifelogEntry, LifelogRecord } from '../types';

/**
 * Factory function to get the appropriate database adapter
 * based on configuration
 */
export function getDbAdapter(): DatabaseAdapter {
  const dbType = process.env.DB_TYPE || 'sqlite';
  logger.info(`Initializing database adapter for type: ${dbType}`);
  
  switch (dbType.toLowerCase()) {
    case 'sqlite':
      return new SqliteAdapter(process.env.DB_PATH || './data/limitless.db');
    // Add support for other database types here
    // case 'postgres':
    //   return new PostgresAdapter();
    // case 'mongodb':
    //   return new MongoAdapter();
    default:
      throw new Error(`Unsupported database type: ${dbType}`);
  }
}

// The DatabaseAdapter abstract class has been moved to types.ts

