import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { createApp, seedUser, resetDb, ensureSchema, closeDb } from './helpers.js';
import { query } from '../db.js';

let app;

before(async () => {
  await ensureSchema();
  app = await createApp();
});

beforeEach(async () => {
  await resetDb();
});

after(async () => {
  await app.close();
  await closeDb();
});

describe('GET /api/account', () => {
  it('returns user profile', async () => {
    const { user, cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'GET',
      url: '/api/account',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(body.user.id, user.id);
    assert.strictEqual(body.user.email, user.email);
    assert.strictEqual(body.user.plan, 'free');
  });

  it('returns 401 without auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/account' });
    assert.strictEqual(res.statusCode, 401);
  });
});

describe('PATCH /api/account', () => {
  it('updates name', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'PATCH',
      url: '/api/account',
      headers: { cookie },
      payload: { name: 'Updated Name' },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().user.name, 'Updated Name');
  });
});

describe('POST /api/account/api-keys', () => {
  it('stores encrypted key and returns provider + createdAt', async () => {
    const { user, cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/account/api-keys',
      headers: { cookie },
      payload: { provider: 'anthropic', key: 'sk-ant-test-key-12345' },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.strictEqual(body.provider, 'anthropic');
    assert.ok(body.createdAt);

    // Verify key is encrypted in DB (not plain text)
    const { rows } = await query(
      `SELECT key_encrypted FROM designfast.api_keys WHERE user_id = $1 AND provider = 'anthropic'`,
      [user.id]
    );
    assert.strictEqual(rows.length, 1);
    assert.notStrictEqual(rows[0].key_encrypted, 'sk-ant-test-key-12345');
    assert.ok(rows[0].key_encrypted.length > 0);
  });

  it('upserts when same provider is saved again', async () => {
    const { user, cookie } = await seedUser(app);

    await app.inject({
      method: 'POST',
      url: '/api/account/api-keys',
      headers: { cookie },
      payload: { provider: 'google', key: 'key-v1' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/account/api-keys',
      headers: { cookie },
      payload: { provider: 'google', key: 'key-v2' },
    });

    assert.strictEqual(res.statusCode, 201);

    // Should still have exactly one row
    const { rows } = await query(
      `SELECT key_encrypted FROM designfast.api_keys WHERE user_id = $1 AND provider = 'google'`,
      [user.id]
    );
    assert.strictEqual(rows.length, 1);
  });

  it('returns 400 for invalid provider', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/account/api-keys',
      headers: { cookie },
      payload: { provider: 'openai', key: 'sk-test' },
    });

    assert.strictEqual(res.statusCode, 400);
  });

  it('returns 400 for empty key', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/account/api-keys',
      headers: { cookie },
      payload: { provider: 'anthropic', key: '' },
    });

    assert.strictEqual(res.statusCode, 400);
  });
});

describe('DELETE /api/account/api-keys/:provider', () => {
  it('deletes existing key', async () => {
    const { cookie } = await seedUser(app);

    await app.inject({
      method: 'POST',
      url: '/api/account/api-keys',
      headers: { cookie },
      payload: { provider: 'anthropic', key: 'sk-test' },
    });

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/account/api-keys/anthropic',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().ok, true);
  });

  it('returns 404 for missing provider', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'DELETE',
      url: '/api/account/api-keys/anthropic',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.json().error, 'No key found for provider');
  });
});
