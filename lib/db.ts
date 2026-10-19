import Database from 'better-sqlite3';
import path from 'path';
import { SCHEMA } from './schema';

const g = globalThis as unknown as { __eloraDb?: Database.Database };

export function getDb(): Database.Database {
  if (!g.__eloraDb) {
    const file = process.env.DATABASE_FILE || path.join(process.cwd(), 'data', 'elora.db');
    require('fs').mkdirSync(path.dirname(file), { recursive: true });
    const db = new Database(file);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);
    g.__eloraDb = db;
  }
  return g.__eloraDb;
}

export const all = <T = any>(sql: string, ...p: any[]): T[] => getDb().prepare(sql).all(...p) as T[];
export const get = <T = any>(sql: string, ...p: any[]): T | undefined => getDb().prepare(sql).get(...p) as T | undefined;
export const run = (sql: string, ...p: any[]) => getDb().prepare(sql).run(...p);
export const tx = <T,>(fn: () => T): T => getDb().transaction(fn)();
