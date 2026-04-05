import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { createApp, seedUser, resetDb, ensureSchema, startMockQueen, closeDb } from './helpers.js';
import { query } from '../src/db.js';

let app;
let mockQueenServer;

before(async () => {
  // Start mock Queen BEFORE creating app (queen-client reads QUEEN_URL at call time)
  mockQueenServer = await startMockQueen();
  await ensureSchema();
  app = await createApp();
});

beforeEach(async () => {
  await resetDb();
});

after(async () => {
  await app.close();
  mockQueenServer.close();
  await closeDb();
});

describe('POST /api/generations', () => {
  it('returns 201 with generation and jobs', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: {
        prompt: 'A coffee shop landing page',
        models: ['claude'],
      },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.ok(body.id);
    assert.strictEqual(body.status, 'running');
    assert.ok(Array.isArray(body.jobs));
    assert.strictEqual(body.jobs.length, 1);
    assert.strictEqual(body.jobs[0].status, 'queued');
    assert.strictEqual(body.jobs[0].model, 'claude-sonnet-4-6');
    assert.strictEqual(body.jobs[0].styleKey, 'freestyle');
  });

  it('creates multiple jobs for explicit styles', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: {
        prompt: 'A portfolio site',
        themeMode: 'explicit',
        styles: ['minimalist'],
        models: ['claude'],
      },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.strictEqual(body.jobs.length, 1);
    assert.strictEqual(body.jobs[0].styleKey, 'minimalist');
    assert.strictEqual(body.jobs[0].styleName, 'Minimalist');
  });

  it('returns 400 for empty prompt', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: '', models: ['claude'] },
    });

    assert.strictEqual(res.statusCode, 400);
  });

  it('returns 400 for missing models', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'test' },
    });

    assert.strictEqual(res.statusCode, 400);
  });

  it('returns 400 for invalid model names', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'test', models: ['gpt4'] },
    });

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.json().error.includes('Invalid models'));
  });

  it('returns 400 for explicit themeMode without styles', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'test', models: ['claude'], themeMode: 'explicit' },
    });

    assert.strictEqual(res.statusCode, 400);
  });

  it('returns 403 when generation limit reached', async () => {
    const { user, cookie } = await seedUser(app);

    // Set generations_used to the free plan limit (5)
    await query(
      `UPDATE designfast.users SET generations_used = 5 WHERE id = $1`,
      [user.id]
    );

    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'test', models: ['claude'] },
    });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.json().error, 'Monthly generation limit reached');
  });

  it('returns 401 without auth', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/generations',
      payload: { prompt: 'test', models: ['claude'] },
    });

    assert.strictEqual(res.statusCode, 401);
  });
});

describe('GET /api/generations', () => {
  it('returns paginated generations', async () => {
    const { cookie } = await seedUser(app);

    // Create a generation first
    await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'test site', models: ['claude'] },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/generations',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.ok(Array.isArray(body.generations));
    assert.strictEqual(body.total, 1);
    assert.strictEqual(body.generations.length, 1);
    assert.strictEqual(body.generations[0].prompt, 'test site');
    assert.strictEqual(body.generations[0].status, 'running');
    assert.strictEqual(body.generations[0].jobCount, 1);
  });

  it('returns empty list for new user', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'GET',
      url: '/api/generations',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().total, 0);
    assert.strictEqual(res.json().generations.length, 0);
  });
});

describe('GET /api/generations/:id', () => {
  it('returns generation with jobs', async () => {
    const { cookie } = await seedUser(app);

    const createRes = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'detail test', models: ['claude'] },
    });

    const genId = createRes.json().id;

    const res = await app.inject({
      method: 'GET',
      url: `/api/generations/${genId}`,
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(body.id, genId);
    assert.strictEqual(body.prompt, 'detail test');
    assert.ok(Array.isArray(body.jobs));
    assert.strictEqual(body.jobs.length, 1);
  });

  it('returns 404 for non-existent generation', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'GET',
      url: '/api/generations/00000000-0000-0000-0000-000000000000',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 404);
  });
});

describe('DELETE /api/generations/:id', () => {
  it('deletes generation and returns ok', async () => {
    const { cookie } = await seedUser(app);

    const createRes = await app.inject({
      method: 'POST',
      url: '/api/generations',
      headers: { cookie },
      payload: { prompt: 'to delete', models: ['claude'] },
    });

    const genId = createRes.json().id;

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/generations/${genId}`,
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().ok, true);

    // Verify it's gone
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/generations/${genId}`,
      headers: { cookie },
    });
    assert.strictEqual(getRes.statusCode, 404);
  });

  it('returns 404 for non-existent generation', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/generations/00000000-0000-0000-0000-000000000000',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 404);
  });
});
