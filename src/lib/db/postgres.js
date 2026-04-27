import { Pool } from 'pg';

if (!process.env.POSTGRES_URL) {
  console.warn('[DB] POSTGRES_URL not set — inbox/CRM features disabled');
}

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max:              10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    pool.on('error', (err) => console.error('[PG] Pool error:', err.message));
  }
  return pool;
}

/**
 * Execute a parameterised query.
 * @param {string} text  - SQL with $1..$n placeholders
 * @param {any[]}  params
 */
export async function query(text, params = []) {
  const start = Date.now();
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PG] ${Date.now() - start}ms — ${text.slice(0, 80)}`);
    }
    return result;
  } finally {
    client.release();
  }
}

/** Convenience: return all rows */
export async function queryRows(text, params = []) {
  const { rows } = await query(text, params);
  return rows;
}

/** Convenience: return first row or null */
export async function queryOne(text, params = []) {
  const { rows } = await query(text, params);
  return rows[0] ?? null;
}

/** Run multiple queries in a single transaction */
export async function transaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
