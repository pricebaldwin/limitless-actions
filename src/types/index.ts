// Database Adapter interfaces
export interface IDatabaseAdapter {
  createTables(): Promise<boolean>;
  saveLifelogEntry(entry: LifelogEntry): Promise<boolean>;
  getUnparsedEntries(): Promise<LifelogRecord[]>;
  markEntryAsParsed(id: string): Promise<boolean>;
  getLatestEntryDate(): Promise<string | null>;
  getAllEntries(limit?: number, offset?: number): Promise<LifelogRecord[]>;
  getStats(): Promise<DatabaseStats>;
}

/**
 * Base class for all database adapters
 */
export abstract class DatabaseAdapter implements IDatabaseAdapter {
  abstract createTables(): Promise<boolean>;
  
  abstract saveLifelogEntry(entry: LifelogEntry): Promise<boolean>;
  
  abstract getUnparsedEntries(): Promise<LifelogRecord[]>;
  
  abstract markEntryAsParsed(id: string): Promise<boolean>;
  
  abstract getLatestEntryDate(): Promise<string | null>;
  
  abstract getAllEntries(limit?: number, offset?: number): Promise<LifelogRecord[]>;
  
  abstract getStats(): Promise<DatabaseStats>;
}

// Limitless API types
export interface LifelogEntry {
  id: string;
  title: string;
  markdown: string;
  contents?: LifelogContent[];
  created_at?: string;
  [key: string]: any; // Allow for additional properties
}

export interface LifelogContent {
  type: string;
  content: string;
  startTime?: string;
  endTime?: string;
  startOffsetMs?: number;
  endOffsetMs?: number;
  speakerName?: string;
  speakerIdentifier?: string | null;
  children?: LifelogContent[];
}

// Database record types
export interface LifelogRecord {
  id: string;
  title: string;
  markdown: string;
  raw_data: string;
  created_at: string;
  ingested_at: string;
  is_parsed: number;
  parsed_at: string | null;
}

// API response types
export interface ApiResponse<T> {
  status: string;
  data: T;
  timestamp: string;
}

export interface DatabaseStats {
  total: number;
  parsed: number;
  unparsed: number;
  latest: string | null;
}

export interface FetchOptions {
  date?: string;
  start?: string;
  end?: string;
  timezone?: string;
}

export interface IngestResponse {
  status: string;
}
