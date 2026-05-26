import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = resolve(__dirname, '../data');
const DB_PATH = resolve(DB_DIR, 'todo.db');

mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    title       TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending',
    priority    TEXT             DEFAULT 'medium',
    category    TEXT,
    timeLabel   TEXT,
    dueAt       INTEGER,
    source      TEXT,
    pipeline_id TEXT,
    pipelineId  TEXT,
    executionId TEXT,
    pipelineStatus TEXT,
    completedAt INTEGER,
    createdAt   INTEGER NOT NULL,
    updatedAt   INTEGER
  );

  CREATE TABLE IF NOT EXISTS config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id                   TEXT    PRIMARY KEY,
    patternSignature     TEXT,
    suggestedPipelineName TEXT,
    suggestedKeywords    TEXT,
    reason               TEXT,
    status               TEXT    NOT NULL DEFAULT 'pending',
    suppressUntil        INTEGER,
    sourcePattern        TEXT,
    createdAt            INTEGER NOT NULL,
    updatedAt            INTEGER
  );

  -- SRS V3.0 required tables
  CREATE TABLE IF NOT EXISTS pipeline_configs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id  TEXT    UNIQUE NOT NULL,
    display_name TEXT,
    api_base_url TEXT,
    created_at   TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pipeline_stats (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id        TEXT    NOT NULL REFERENCES pipeline_configs(pipeline_id) ON DELETE CASCADE,
    trigger_count      INTEGER DEFAULT 0,
    last_triggered_at  TEXT
  );

  CREATE TABLE IF NOT EXISTS app_config (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id TEXT    NOT NULL REFERENCES pipeline_configs(pipeline_id) ON DELETE CASCADE,
    useful      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now'))
  );
`);

export default db;
