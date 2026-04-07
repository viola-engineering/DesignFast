import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createApp, seedUser, ensureSchema, closeDb } from './helpers.js';

let app;

before(async () => {
  await ensureSchema();
  app = await createApp();
});

after(async () => {
  await app.close();
  await closeDb();
});

describe('GET /api/config', { concurrency: 1 }, () => {
  it('returns config without authentication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/config',
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(typeof body.byokEnabled, 'boolean');
    assert.strictEqual(typeof body.githubUrl, 'string');
    assert.strictEqual(body.githubUrl, 'https://github.com/viola-engineering/designfast');
  });

  it('byokEnabled reflects BYOK_ENABLED env var', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/config',
    });

    const body = res.json();
    // In test environment, BYOK_ENABLED is not set, so should be false
    assert.strictEqual(body.byokEnabled, process.env.BYOK_ENABLED === 'true');
  });
});

// Note: POST /api/account/api-keys and DELETE /api/account/api-keys/:provider
// tests require database access. When DATABASE_URL is properly configured, add:
//
// describe('POST /api/account/api-keys', { concurrency: 1 }, () => {
//   it('rejects when BYOK_ENABLED is not true', async () => { ... })
//   it('allows when BYOK_ENABLED is true', async () => { ... })
// })
//
// The BYOK check happens early in the handler (before DB operations),
// so these tests verify the env flag is respected.
