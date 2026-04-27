/**
 * Run via: node src/lib/db/migrate.js
 * Applies schema.sql to your PostgreSQL database once.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });

(async () => {
  try {
    await client.connect();
    await client.query(sql);
    console.log('✅  Schema migrated successfully');
  } catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
