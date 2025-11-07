import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import type { Database as DatabaseInstance } from "better-sqlite3";

import { config } from "./config.js";

const dbFile = path.resolve(config.databasePath);
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

export const db: DatabaseInstance = new Database(dbFile);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    initial_value REAL NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    parent_operation_id INTEGER,
    operation_type TEXT NOT NULL,
    operand REAL NOT NULL,
    result REAL NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_operation_id) REFERENCES operations(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_operations_thread ON operations(thread_id);
  CREATE INDEX IF NOT EXISTS idx_operations_parent ON operations(parent_operation_id);
`);
