import dotenv from 'dotenv';
import path from 'path';
import cron from 'node-cron';
import { initializeDatabase } from './db/init';
import { fetchAndStoreLifelogs } from './api/limitless';
import { startServer } from './server/server';
import logger from './utils/logger';

// Load environment variables from .env file with explicit path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Log environment variables for debugging
logger.info(`Environment variables loaded: LIMITLESS_API_KEY=${process.env.LIMITLESS_API_KEY ? 'Yes' : 'No'}, DB_TYPE=${process.env.DB_TYPE}, PORT=${process.env.PORT}`);

// Initialize database
initializeDatabase()
  .then(() => {
    logger.info('Database initialized successfully');
    
    // Start API data ingestion on a schedule
    const schedule = process.env.INGESTION_SCHEDULE || '*/30 * * * *';
    logger.info(`Setting up scheduled ingestion with schedule: ${schedule}`);
    
    // Initial data fetch
    logger.info('Performing initial data fetch...');
    fetchAndStoreLifelogs().catch(err => {
      logger.error('Error during initial data fetch:', err);
    });
    
    // Schedule regular fetches
    const job = cron.schedule(schedule, async () => {
      logger.info('Running scheduled data ingestion...');
      try {
        await fetchAndStoreLifelogs();
        logger.info('Scheduled data ingestion completed successfully');
      } catch (error) {
        logger.error('Error during scheduled data ingestion:', error);
        // The job continues despite errors
      }
    });
    
    // Graceful shutdown handling
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, stopping services...');
      job.stop();
      
      // Close any other resources here
      
      logger.info('All services stopped, exiting process');
      process.exit(0);
    };
    
    // Listen for termination signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
    // Start HTTP server if enabled
    if (process.env.ENABLE_SERVER === 'true') {
      const preferredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
      const alternativePorts = [3001, 3002, 8080, 8081, 8082];
      
      try {
        startServer(preferredPort);
      } catch (error: any) {
        if (error.code === 'EADDRINUSE') {
          logger.warn(`Port ${preferredPort} is already in use, trying alternative ports`);
          
          // Try alternative ports
          let serverStarted = false;
          for (const port of alternativePorts) {
            try {
              startServer(port);
              serverStarted = true;
              break;
            } catch (err: any) {
              if (err.code === 'EADDRINUSE') {
                logger.warn(`Alternative port ${port} is also in use`);
              } else {
                logger.error(`Error starting server on port ${port}:`, err);
              }
            }
          }
          
          if (!serverStarted) {
            logger.error('Could not start server on any port');
          }
        } else {
          logger.error('Error starting server:', error);
        }
      }
    }
  })
  .catch(err => {
    logger.error('Failed to initialize database:', err);
    process.exit(1);
  });
