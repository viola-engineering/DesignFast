import { createServer } from 'node:http';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';

import authRoutes from '../src/routes/auth.js';
import generationsRoutes from '../src/routes/generations.js';
import jobsRoutes from '../src/routes/jobs.js';
import previewRoutes from '../src/routes/preview.js';
import iterateRoutes from '../src/routes/iterate.js';
import accountRoutes from '../src/routes/account.js';
import billingRoutes from '../src/routes/billing.js';
import configRoutes from '../src/routes/config.js';
import { query, db } from '../src/db.js';

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
  await app.register(configRoutes);

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
 * Create a test user with pending email verification.
 * Manually sets verification code in DB to simulate RESEND_API_KEY being set.
 * Returns { user, cookie, verificationCode }.
 */
export async function seedUnverifiedUser(app, options = {}) {
  counter++;
  const email = options.email || `test-${counter}-${Date.now()}@example.com`;
  const password = options.password || 'testpassword123';
  const name = options.name || 'Test User';
  const verificationCode = '123456';

  // First register normally (will be auto-verified since no RESEND_API_KEY)
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { email, password, name },
  });

  const user = res.json().user;
  const setCookie = res.headers['set-cookie'];
  const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;

  // Override to unverified state with a verification code
  const expires = options.expired
    ? new Date(Date.now() - 60000) // 1 minute ago
    : new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await query(
    `UPDATE designfast.users
     SET email_verified_at = NULL,
         email_verification_code = $1,
         email_verification_expires = $2
     WHERE id = $3`,
    [verificationCode, expires, user.id]
  );

  return {
    user: { ...user, emailVerified: false },
    cookie: cookieHeader,
    verificationCode,
  };
}

/**
 * Clean up test-created data only. Deletes users whose email matches
 * the test pattern (test-*@example.com) and cascades to their related rows.
 * Real user data is preserved.
 */
export async function resetDb() {
  await query(`
    DELETE FROM designfast.users
    WHERE email LIKE 'test-%@example.com'
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
