import Database from 'better-sqlite3';
import logger from '../../utils/logger';
import { DatabaseAdapter, LifelogEntry, LifelogContent, LifelogRecord, DatabaseStats } from '../../types';

interface SqliteResult {
  changes: number;
  lastInsertRowid: number;
}

interface CountResult {
  count: number;
}

interface DateResult {
  created_at: string;
}

class SqliteAdapter extends DatabaseAdapter {
  private dbPath: string;
  private db: Database.Database;

  constructor(dbPath?: string) {
    super();
    this.dbPath = dbPath || './data/limitless.db';
    this.db = new Database(this.dbPath);
    logger.info(`SQLite database initialized at ${this.dbPath}`);
  }

  async createTables(): Promise<boolean> {
    try {
      // Create lifelogs table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS lifelogs (
          id TEXT PRIMARY KEY,
          title TEXT,
          markdown TEXT,
          raw_data TEXT,
          created_at TEXT,
          ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
          is_parsed INTEGER DEFAULT 0,
          parsed_at TEXT DEFAULT NULL
        )
      `);

      // Create contents table for structured content elements
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS lifelog_contents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lifelog_id TEXT,
          type TEXT,
          content TEXT,
          start_time TEXT,
          end_time TEXT,
          start_offset_ms INTEGER,
          end_offset_ms INTEGER,
          speaker_name TEXT,
          speaker_identifier TEXT,
          FOREIGN KEY (lifelog_id) REFERENCES lifelogs(id)
        )
      `);

      logger.info('Database tables created successfully');
      return true;
    } catch (error) {
      logger.error('Error creating database tables:', error);
      throw error;
    }
  }

  async saveLifelogEntry(entry: LifelogEntry): Promise<boolean> {
    try {
      // Start a transaction
      const transaction = this.db.transaction((entry: LifelogEntry) => {
        // Check if entry already exists
        const existingEntry = this.db.prepare('SELECT id FROM lifelogs WHERE id = ?').get(entry.id);
        
        if (!existingEntry) {
          // Insert the lifelog entry
          this.db.prepare(`
            INSERT INTO lifelogs (id, title, markdown, raw_data, created_at, ingested_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(
            entry.id,
            entry.title,
            entry.markdown,
            JSON.stringify(entry),
            entry.created_at || new Date().toISOString()
          );
          
          // Insert content items if they exist
          if (entry.contents && Array.isArray(entry.contents)) {
            const contentStmt = this.db.prepare(`
              INSERT INTO lifelog_contents (
                lifelog_id, type, content, start_time, end_time,
                start_offset_ms, end_offset_ms, speaker_name, speaker_identifier
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            for (const content of entry.contents) {
              contentStmt.run(
                entry.id,
                content.type,
                content.content,
                content.startTime,
                content.endTime,
                content.startOffsetMs,
                content.endOffsetMs,
                content.speakerName,
                content.speakerIdentifier
              );
            }
          }
          
          return true; // New entry added
        }
        
        return false; // Entry already exists
      });
      
      return transaction(entry);
    } catch (error) {
      logger.error('Error saving lifelog entry:', error);
      throw error;
    }
  }

  async getUnparsedEntries(): Promise<LifelogRecord[]> {
    try {
      return this.db.prepare('SELECT * FROM lifelogs WHERE is_parsed = 0 ORDER BY created_at ASC').all() as LifelogRecord[];
    } catch (error) {
      logger.error('Error getting unparsed entries:', error);
      throw error;
    }
  }

  async markEntryAsParsed(id: string): Promise<boolean> {
    try {
      const result = this.db.prepare(
        'UPDATE lifelogs SET is_parsed = 1, parsed_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(id) as SqliteResult;
      
      return result.changes > 0;
    } catch (error) {
      logger.error(`Error marking entry ${id} as parsed:`, error);
      throw error;
    }
  }

  async getLatestEntryDate(): Promise<string | null> {
    try {
      const result = this.db.prepare(
        'SELECT created_at FROM lifelogs ORDER BY created_at DESC LIMIT 1'
      ).get() as DateResult | undefined;
      
      return result ? result.created_at : null;
    } catch (error) {
      logger.error('Error getting latest entry date:', error);
      throw error;
    }
  }

  async getAllEntries(limit: number = 100, offset: number = 0): Promise<LifelogRecord[]> {
    try {
      return this.db.prepare(
        'SELECT * FROM lifelogs ORDER BY created_at DESC LIMIT ? OFFSET ?'
      ).all(limit, offset) as LifelogRecord[];
    } catch (error) {
      logger.error('Error getting all entries:', error);
      throw error;
    }
  }

  async getStats(): Promise<DatabaseStats> {
    try {
      const stats: DatabaseStats = {
        total: 0,
        parsed: 0,
        unparsed: 0,
        latest: null
      };
      
      const totalCount = this.db.prepare('SELECT COUNT(*) as count FROM lifelogs').get() as CountResult;
      const parsedCount = this.db.prepare('SELECT COUNT(*) as count FROM lifelogs WHERE is_parsed = 1').get() as CountResult;
      const latest = this.db.prepare('SELECT created_at FROM lifelogs ORDER BY created_at DESC LIMIT 1').get() as DateResult | undefined;
      
      stats.total = totalCount ? totalCount.count : 0;
      stats.parsed = parsedCount ? parsedCount.count : 0;
      stats.unparsed = stats.total - stats.parsed;
      stats.latest = latest ? latest.created_at : null;
      
      return stats;
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }
}

export default SqliteAdapter;
