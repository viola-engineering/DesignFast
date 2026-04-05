import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { createApp, seedUser, resetDb, ensureSchema, closeDb } from './helpers.js';

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

describe('POST /api/auth/register', () => {
  it('returns 201 with user and sets token cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'new@example.com', password: 'password123', name: 'Alice' },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.ok(body.user.id);
    assert.strictEqual(body.user.email, 'new@example.com');
    assert.strictEqual(body.user.name, 'Alice');
    assert.strictEqual(body.user.plan, 'free');
    assert.strictEqual(body.user.generationsUsed, 0);
    assert.strictEqual(body.user.generationsLimit, 3);
    assert.strictEqual(body.user.creditsUsed, 0);
    assert.strictEqual(body.user.creditsLimit, 0);
    // Must not include password_hash
    assert.strictEqual(body.user.password_hash, undefined);
    assert.strictEqual(body.user.passwordHash, undefined);

    // Cookie set
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie, 'set-cookie header should be present');
    const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    assert.ok(cookieStr.includes('token='), 'cookie should contain token');
  });

  it('returns 409 on duplicate email', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'dup@example.com', password: 'password123' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'dup@example.com', password: 'password456' },
    });

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.json().error, 'Email already registered');
  });

  it('returns 400 for missing email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { password: 'password123' },
    });

    assert.strictEqual(res.statusCode, 400);
  });

  it('returns 400 for short password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'test@example.com', password: 'short' },
    });

    assert.strictEqual(res.statusCode, 400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with user and sets cookie', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'login@example.com', password: 'password123' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'login@example.com', password: 'password123' },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.user.id);
    assert.strictEqual(body.user.email, 'login@example.com');
    assert.strictEqual(body.user.password_hash, undefined);

    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie);
  });

  it('returns 401 for invalid credentials', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: 'login2@example.com', password: 'password123' },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'login2@example.com', password: 'wrongpassword' },
    });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.json().error, 'Invalid email or password');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'nobody@example.com', password: 'password123' },
    });

    assert.strictEqual(res.statusCode, 401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user with valid cookie', async () => {
    const { user, cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    assert.strictEqual(body.user.id, user.id);
    assert.strictEqual(body.user.email, user.email);
    assert.ok(body.user.createdAt);
    assert.strictEqual(body.user.password_hash, undefined);
    assert.strictEqual(body.user.passwordHash, undefined);
  });

  it('returns 401 without cookie', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
    });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.json().error, 'Not authenticated');
  });
});

describe('POST /api/auth/logout', () => {
  it('clears cookie and returns ok', async () => {
    const { cookie } = await seedUser(app);

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { cookie },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json().ok, true);

    // Token cookie should be cleared
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
      const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      // Cleared cookie has empty value or expires in the past
      assert.ok(
        cookieStr.includes('token=;') || cookieStr.includes('Expires=Thu, 01 Jan 1970'),
        'cookie should be cleared'
      );
    }
  });
});
