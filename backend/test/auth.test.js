import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { createApp, seedUser, seedUnverifiedUser, resetDb, ensureSchema, closeDb } from './helpers.js';

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
    const testEmail = `test-new-${Date.now()}@example.com`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { email: testEmail, password: 'password123', name: 'Alice' },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = res.json();
    assert.ok(body.user.id);
    assert.strictEqual(body.user.email, testEmail);
    assert.strictEqual(body.user.name, 'Alice');
    assert.strictEqual(body.user.plan, 'free');
    assert.strictEqual(body.user.generationsUsed, 0);
    assert.strictEqual(body.user.generationsLimit, 3);
    assert.strictEqual(body.user.creditsUsed, 0);
    assert.strictEqual(body.user.creditsLimit, 0);
    // Email should be auto-verified when RESEND_API_KEY is not set
    assert.strictEqual(body.user.emailVerified, true);
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

describe('Email verification', () => {
  describe('without RESEND_API_KEY (open source mode)', () => {
    it('auto-verifies users on registration', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { email: 'test-autoverify@example.com', password: 'password123' },
      });

      assert.strictEqual(res.statusCode, 201);
      const body = res.json();
      assert.strictEqual(body.user.emailVerified, true);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('returns 400 without code', async () => {
      const { cookie } = await seedUnverifiedUser(app);

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        headers: { cookie },
        payload: {},
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error, 'Verification code is required');
    });

    it('returns 400 for invalid code', async () => {
      const { cookie } = await seedUnverifiedUser(app);

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        headers: { cookie },
        payload: { code: '000000' },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error, 'Invalid verification code');
    });

    it('returns 400 for expired code', async () => {
      const { cookie } = await seedUnverifiedUser(app, { expired: true });

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        headers: { cookie },
        payload: { code: '123456' },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error, 'Verification code expired. Please request a new one.');
    });

    it('verifies email with correct code', async () => {
      const { cookie, verificationCode } = await seedUnverifiedUser(app);

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        headers: { cookie },
        payload: { code: verificationCode },
      });

      assert.strictEqual(res.statusCode, 200);
      const body = res.json();
      assert.strictEqual(body.user.emailVerified, true);
    });

    it('returns 400 if already verified', async () => {
      const { cookie } = await seedUser(app);

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        headers: { cookie },
        payload: { code: '123456' },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error, 'Email already verified');
    });

    it('returns 401 without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        payload: { code: '123456' },
      });

      assert.strictEqual(res.statusCode, 401);
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('returns 400 if already verified', async () => {
      const { cookie } = await seedUser(app);

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/resend-verification',
        headers: { cookie },
      });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error, 'Email already verified');
    });

    it('returns 400 if email verification not enabled', async () => {
      const { cookie } = await seedUnverifiedUser(app);

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/resend-verification',
        headers: { cookie },
      });

      // Without RESEND_API_KEY, resend should fail
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json().error, 'Email verification is not enabled');
    });

    it('returns 401 without auth', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/resend-verification',
      });

      assert.strictEqual(res.statusCode, 401);
    });
  });
});
