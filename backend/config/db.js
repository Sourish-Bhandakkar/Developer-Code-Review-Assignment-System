import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbType = process.env.DATABASE_URL ? 'postgres' : 'sqlite';
let pool;

if (dbType === 'postgres') {
  console.log('Production/Staging: Initializing PostgreSQL database connection pool...');
  
  // Render PostgreSQL requires SSL in production
  const sslConfig = process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false;

  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
  });

  pool = {
    dbType: 'postgres',
    query: (text, params) => pgPool.query(text, params),
    connect: () => pgPool.connect(),
    checkTableExists: async (tableName) => {
      const res = await pgPool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );
      return res.rows[0].exists;
    }
  };
} else {
  // SQLite Local Development (lazily/dynamically loaded)
  let dbInstance = null;

  const getSqliteDb = async () => {
    if (dbInstance) return dbInstance;

    // Dynamically load sqlite3 to avoid loading native compiled binaries in production (Render glibc fix)
    const { default: sqlite3 } = await import('sqlite3');

    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'review_assignment.db');
    console.log(`Local Development: Initializing SQLite database at: ${dbPath}`);

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('CRITICAL: Failed to open SQLite database!', err);
          return reject(err);
        }
        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
          if (pragmaErr) {
            console.error('Failed to enable PRAGMA foreign_keys', pragmaErr);
          }
          dbInstance = db;
          resolve(db);
        });
      });
    });
  };

  pool = {
    dbType: 'sqlite',
    query: async (sql, params = []) => {
      const db = await getSqliteDb();
      // Convert $1, $2 params to ? for SQLite compatibility
      const sqliteSql = sql.replace(/\$\d+/g, '?');

      return new Promise((resolve, reject) => {
        const trimmed = sqliteSql.trim();
        const isMultiStatement = trimmed.includes(';') && 
                                 (trimmed.includes('CREATE TABLE') || trimmed.includes('DROP TABLE'));

        if (isMultiStatement) {
          db.exec(trimmed, (err) => {
            if (err) return reject(err);
            resolve({ rows: [] });
          });
          return;
        }

        const isSelect = trimmed.toUpperCase().startsWith('SELECT');
        const hasReturning = trimmed.toUpperCase().includes('RETURNING');

        if (isSelect || hasReturning) {
          db.all(sqliteSql, params, (err, rows) => {
            if (err) return reject(err);
            resolve({ rows: rows || [] });
          });
        } else {
          db.run(sqliteSql, params, function (err) {
            if (err) return reject(err);
            resolve({
              rows: [],
              lastID: this.lastID,
              changes: this.changes
            });
          });
        }
      });
    },
    connect: async () => {
      // Resolve the database before returning connection methods
      await getSqliteDb();
      return {
        query: (sql, params = []) => pool.query(sql, params),
        release: () => {} // No-op for SQLite
      };
    },
    checkTableExists: async (tableName) => {
      const res = await pool.query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name = $1`,
        [tableName]
      );
      return res.rows.length > 0;
    }
  };
}

export default pool;
