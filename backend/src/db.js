import pg from 'pg';

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  return db.query(text, params);
}

/**
 * Get a dedicated client from the pool for transactions.
 * Caller MUST call client.release() when done.
 */
export async function getClient() {
  return db.connect();
}
