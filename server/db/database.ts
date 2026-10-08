import sqlite3 from 'sqlite3';
import { Pool, types } from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'autocare.db');

const postgresUrl = process.env.DATABASE_URL;
const postgresPool = postgresUrl
  ? new Pool({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false },
    })
  : null;

if (postgresPool) {
  types.setTypeParser(20, (value) => Number(value));
  types.setTypeParser(1700, (value) => Number(value));
} else {
  console.log(`Using local SQLite database at: ${dbPath}`);
}

const db = postgresPool ? null : new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to local SQLite database at: ${dbPath}`);
  }
});

db?.run('PRAGMA foreign_keys = ON;');

function preparePostgresQuery(sql: string): string {
  const conflictColumns: Record<string, string> = {
    customers: 'customer_id',
    vehicles: 'vehicle_id',
    mechanics: 'mechanic_id',
    service_jobs: 'service_id',
    invoices: 'invoice_number',
  };

  const normalizedSql = sql.replace(
    /INSERT\s+OR\s+REPLACE\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i,
    (_match, table: string, columns: string, values: string) => {
      const columnNames = columns.split(',').map((column) => column.trim());
      const conflictColumn = conflictColumns[table.toLowerCase()];
      if (!conflictColumn) {
        throw new Error(`PostgreSQL upsert is not configured for table "${table}".`);
      }
      const updates = columnNames
        .filter((column) => column !== conflictColumn)
        .map((column) => `${column} = EXCLUDED.${column}`)
        .join(', ');
      return `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT (${conflictColumn}) DO UPDATE SET ${updates}`;
    }
  );

  let parameterIndex = 0;
  return normalizedSql
    .replace(/PRAGMA\s+[^;]+;?/gi, '')
    .replace(/\bAS\s+([A-Za-z_][A-Za-z0-9_]*)/gi, 'AS "$1"')
    .replace(/\?/g, () => `$${++parameterIndex}`);
}

// Helper for SELECT queries returning multiple rows
export function queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (postgresPool) {
    return postgresPool.query(preparePostgresQuery(sql), params).then((result) => result.rows as T[]);
  }

  return new Promise((resolve, reject) => {
    db!.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

// Helper for SELECT query returning a single row
export function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  if (postgresPool) {
    return postgresPool.query(preparePostgresQuery(sql), params).then((result) => result.rows[0] as T | undefined);
  }

  return new Promise((resolve, reject) => {
    db!.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

// Helper for INSERT / UPDATE / DELETE queries
export function executeRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  if (postgresPool) {
    if (/^\s*PRAGMA\b/i.test(sql)) {
      return Promise.resolve({ lastID: 0, changes: 0 });
    }
    return postgresPool.query(preparePostgresQuery(sql), params).then((result) => ({
      lastID: 0,
      changes: result.rowCount ?? 0,
    }));
  }

  return new Promise((resolve, reject) => {
    db!.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Helper to run raw SQL script (e.g. schema.sql)
export function executeScript(sql: string): Promise<void> {
  if (postgresPool) {
    const postgresSchema = sql
      .replace(/^\s*PRAGMA\s+[^;]+;\s*$/gim, '')
      .replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
      .replace(/TEXT\s+DEFAULT\s+\(datetime\('now',\s*'localtime'\)\)/gi, "TEXT DEFAULT (to_char(CURRENT_TIMESTAMP, 'YYYY-MM-DD HH24:MI:SS'))");
    return postgresPool.query(postgresSchema).then(async () => {
      if (postgresUrl?.includes('supabase')) {
        await postgresPool!.query(`
          REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
          REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
          ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
          ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
          ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
          ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
          ALTER TABLE service_bays ENABLE ROW LEVEL SECURITY;
          ALTER TABLE service_jobs ENABLE ROW LEVEL SECURITY;
          ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
          ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
        `);
      }
    });
  }

  return new Promise((resolve, reject) => {
    db!.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
