import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the database directory exists
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'review_assignment.db');
console.log(`Initializing SQLite database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('CRITICAL: Failed to open SQLite database!', err);
  } else {
    // Enable foreign keys explicitly in SQLite
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Failed to enable PRAGMA foreign_keys', pragmaErr);
      }
    });
  }
});

/**
 * Promise-based SQLite database client interface.
 * Implements a pg-compatible pool object to minimize changes to controller code.
 */
const pool = {
  query: (sql, params = []) => {
    // 1. Convert PostgreSQL parameter place-holders ($1, $2, $3...) to SQLite parameters (?)
    const sqliteSql = sql.replace(/\$\d+/g, '?');

    return new Promise((resolve, reject) => {
      const trimmed = sqliteSql.trim();
      
      // 2. Check if it contains multiple statements (like schema.sql)
      const isMultiStatement = trimmed.includes(';') && 
                               (trimmed.includes('CREATE TABLE') || trimmed.includes('DROP TABLE'));

      if (isMultiStatement) {
        db.exec(trimmed, (err) => {
          if (err) {
            console.error('Database error executing multi-statement batch:', err);
            return reject(err);
          }
          resolve({ rows: [] });
        });
        return;
      }

      const isSelect = trimmed.toUpperCase().startsWith('SELECT');
      const hasReturning = trimmed.toUpperCase().includes('RETURNING');

      // 3. Select query or queries returning tables (like INSERT... RETURNING)
      if (isSelect || hasReturning) {
        db.all(sqliteSql, params, (err, rows) => {
          if (err) {
            console.error(`Database error executing query: ${sqliteSql}`, err);
            return reject(err);
          }
          resolve({ rows: rows || [] });
        });
      } else {
        // 4. Modifying write query (INSERT, UPDATE, DELETE) without RETURNING
        db.run(sqliteSql, params, function (err) {
          if (err) {
            console.error(`Database error executing run: ${sqliteSql}`, err);
            return reject(err);
          }
          resolve({
            rows: [],
            lastID: this.lastID,
            changes: this.changes
          });
        });
      }
    });
  },

  // Simulates transaction checkout client pool
  connect: async () => {
    return {
      query: (sql, params = []) => pool.query(sql, params),
      release: () => {} // No-op for SQLite
    };
  }
};

export default pool;
