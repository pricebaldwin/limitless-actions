import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import { getDbAdapter } from '../db/adapter';
import { fetchAndStoreLifelogs } from '../api/limitless';
import logger from '../utils/logger';
import { FetchOptions, DatabaseStats } from '../types';

/**
 * Creates and configures the Express server
 */
export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api', createApiRoutes());

  // For development, we'll just return a simple HTML response for the root route
  app.get('/', (req: Request, res: Response) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Limitless Data Ingestor</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { color: #333; }
          .container { max-width: 800px; margin: 0 auto; }
          .card { background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .status { display: flex; justify-content: space-between; margin-bottom: 10px; }
          button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
          button:hover { background: #45a049; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Limitless Data Ingestor</h1>
          <div class="card">
            <h2>API Status</h2>
            <p>The server is running. Use the API endpoints to interact with the service.</p>
            <ul>
              <li><strong>GET /api/status</strong> - Get service status and stats</li>
              <li><strong>GET /api/lifelogs</strong> - Get lifelogs with pagination</li>
              <li><strong>POST /api/ingest</strong> - Trigger manual data ingestion</li>
            </ul>
          </div>
          <p>For the full dashboard experience, run the React client separately.</p>
        </div>
      </body>
      </html>
    `);
  });

  return app;
}

/**
 * Creates API routes for the server
 */
function createApiRoutes(): Router {
  const router = express.Router();

  // Get service status and stats
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const db = getDbAdapter();
      const stats = await db.getStats();

      res.json({
        status: 'running',
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching service status:', error);
      res.status(500).json({ error: 'Failed to get service status' });
    }
  });

  // Get lifelogs with pagination
  router.get('/lifelogs', async (req: Request, res: Response) => {
    try {
      const db = getDbAdapter();
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const entries = await db.getAllEntries(limit, offset);
      res.json({ entries });
    } catch (error) {
      logger.error('Error fetching lifelogs:', error);
      res.status(500).json({ error: 'Failed to fetch lifelogs' });
    }
  });

  // Trigger manual data ingestion
  router.post('/ingest', async (req: Request, res: Response) => {
    try {
      const options: FetchOptions = req.body || {};
      logger.info(`Manual ingestion triggered with options: ${JSON.stringify(options)}`);

      // Start ingestion process
      fetchAndStoreLifelogs(options)
        .then(results => {
          logger.info(`Manual ingestion completed, stored ${results.length} entries`);
        })
        .catch(err => {
          logger.error('Error during manual ingestion:', err);
        });

      // Return immediately with acknowledgment
      res.json({ status: 'ingestion_started' });
    } catch (error) {
      logger.error('Error triggering ingestion:', error);
      res.status(500).json({ error: 'Failed to trigger ingestion' });
    }
  });

  // Get unparsed entries
  router.get('/unparsed', async (req: Request, res: Response) => {
    try {
      const db = getDbAdapter();
      const unparsedEntries = await db.getUnparsedEntries();
      res.json({ entries: unparsedEntries });
    } catch (error) {
      logger.error('Error fetching unparsed entries:', error);
      res.status(500).json({ error: 'Failed to fetch unparsed entries' });
    }
  });

  // Mark entry as parsed
  router.post('/mark-parsed/:id', async (req: Request, res: Response) => {
    try {
      const db = getDbAdapter();
      const { id } = req.params;

      const result = await db.markEntryAsParsed(id);
      if (result) {
        res.json({ status: 'success', message: `Entry ${id} marked as parsed` });
      } else {
        res.status(404).json({ error: `Entry ${id} not found or already parsed` });
      }
    } catch (error) {
      logger.error(`Error marking entry as parsed:`, error);
      res.status(500).json({ error: 'Failed to mark entry as parsed' });
    }
  });

  return router;
}

/**
 * Starts the HTTP server
 */
export function startServer(port = 3000) {
  const app = createServer();

  const server = app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });

  // Handle server errors
  server.on('error', (error: NodeJS.ErrnoException) => {
    logger.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`);
    }
  });

  return server;
}
