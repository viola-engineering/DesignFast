import { createServer } from 'node:http';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';

import authRoutes from '../routes/auth.js';
import generationsRoutes from '../routes/generations.js';
import jobsRoutes from '../routes/jobs.js';
import previewRoutes from '../routes/preview.js';
import iterateRoutes from '../routes/iterate.js';
import accountRoutes from '../routes/account.js';
import billingRoutes from '../routes/billing.js';
import { query, db } from '../db.js';

let counter = 0;

/**
 * Build a Fastify app with all plugins registered.
 * Does NOT start the worker or initialize Queen queues.
 */
export async function createApp() {
  const app = Fastify({ logger: false });

  await app.register(cookie);
  await app.register(cors, { origin: true, credentials: true });

  await app.register(authRoutes);
  await app.register(generationsRoutes);
  await app.register(jobsRoutes);
  await app.register(previewRoutes);
  await app.register(iterateRoutes);
  await app.register(accountRoutes);
  await app.register(billingRoutes);

  await app.ready();
  return app;
}

/**
 * Register a test user and return { user, cookie }.
 */
export async function seedUser(app, overrides = {}) {
  counter++;
  const email = overrides.email || `test-${counter}-${Date.now()}@example.com`;
  const password = overrides.password || 'testpassword123';
  const name = overrides.name || 'Test User';

  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email, password, name },
  });

  const setCookie = res.headers['set-cookie'];
  // Extract cookie value for injection
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;

  return {
    user: res.json().user,
    cookie: cookieHeader,
  };
}

/**
 * Truncate all designfast tables. Call in beforeEach.
 */
export async function resetDb() {
  await query(`
    TRUNCATE
      designfast.iterate_messages,
      designfast.iterate_sessions,
      designfast.job_files,
      designfast.jobs,
      designfast.generations,
      designfast.api_keys,
      designfast.users
    CASCADE
  `);
}

/**
 * No-op — kept for backward compatibility with test imports.
 * The main migration now includes all required columns and constraints.
 */
export async function ensureSchema() {
  // All columns and constraints are in migrate.js
}

/**
 * Start a mock Queen server that accepts all requests.
 * Set QUEEN_URL before importing modules that use queen-client.
 */
export async function startMockQueen() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, messages: [] }));
      });
    });
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      process.env.QUEEN_URL = `http://127.0.0.1:${port}`;
      resolve(server);
    });
  });
}

/**
 * Seed a job + files directly in the DB for testing.
 * Returns { userId, generationId, jobId, fileIds }.
 */
export async function seedJobWithFiles(userId) {
  // Create generation
  const { rows: [gen] } = await query(
    `INSERT INTO designfast.generations (user_id, prompt, mode, theme_mode, status, job_count)
     VALUES ($1, 'test prompt', 'landing', 'freestyle', 'done', 1)
     RETURNING id`,
    [userId]
  );

  // Create job
  const { rows: [job] } = await query(
    `INSERT INTO designfast.jobs (generation_id, user_id, style_key, style_name, model, provider, version, status)
     VALUES ($1, $2, 'minimalist', 'Minimalist', 'claude-sonnet-4-6', 'anthropic', 1, 'done')
     RETURNING id`,
    [gen.id, userId]
  );

  // Create files
  const { rows: [file1] } = await query(
    `INSERT INTO designfast.job_files (job_id, filename, content, size_bytes)
     VALUES ($1, 'index.html', '<html><body>Hello</body></html>', 31)
     RETURNING id`,
    [job.id]
  );

  const { rows: [file2] } = await query(
    `INSERT INTO designfast.job_files (job_id, filename, content, size_bytes)
     VALUES ($1, 'style.css', 'body { margin: 0; }', 19)
     RETURNING id`,
    [job.id]
  );

  return {
    userId,
    generationId: gen.id,
    jobId: job.id,
    fileIds: [file1.id, file2.id],
  };
}

/**
 * Close the database pool. Call in after().
 */
export async function closeDb() {
  await db.end();
}
