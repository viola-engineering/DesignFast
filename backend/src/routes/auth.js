import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { signToken, authMiddleware } from '../auth.js';
import { formatUser, formatUserWithOAuth } from '../format-user.js';
import {
  isEmailVerificationEnabled,
  generateVerificationCode,
  sendVerificationEmail,
} from '../email.js';

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_EXPIRY_MINUTES = 10;

// Rate limit configurations
const RATE_LIMITS = {
  // Prevent mass account creation
  register: { max: 5, timeWindow: '1 hour' },
  // Prevent brute-force password attacks
  login: { max: 10, timeWindow: '15 minutes' },
  // STRICT: 6-digit code = 1M combinations, must limit attempts severely
  verifyEmail: { max: 5, timeWindow: '10 minutes' },
  // Prevent email spam
  resendVerification: { max: 3, timeWindow: '10 minutes' },
};

export default async function (app) {
  // POST /api/auth/register
  app.post('/api/auth/register', {
    config: { rateLimit: RATE_LIMITS.register }
  }, async (req, reply) => {
    const { email, password, name } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
      return reply.code(400).send({ error: 'Valid email is required' });
    }
    if (!password || password.length < 8) {
      return reply.code(400).send({ error: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const verificationEnabled = isEmailVerificationEnabled();
    const verificationCode = verificationEnabled ? generateVerificationCode() : null;
    const verificationExpires = verificationEnabled
      ? new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000)
      : null;

    let row;
    try {
      const { rows } = await query(
        `INSERT INTO designfast.users (email, password_hash, name, email_verification_code, email_verification_expires, email_verified_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          email,
          passwordHash,
          name || null,
          verificationCode,
          verificationExpires,
          verificationEnabled ? null : new Date(), // Auto-verify if email verification is disabled
        ]
      );
      row = rows[0];
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Email already registered' });
      }
      throw err;
    }

    if (verificationEnabled) {
      await sendVerificationEmail(email, verificationCode);
    }

    const token = signToken(row.id);
    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return reply.code(201).send({ user: formatUser(row) });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', {
    config: { rateLimit: RATE_LIMITS.login }
  }, async (req, reply) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const { rows } = await query(
      `SELECT * FROM designfast.users WHERE email = $1`,
      [email]
    );

    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const user = rows[0];

    // OAuth-only users don't have a password
    if (!user.password_hash) {
      return reply.code(401).send({ error: 'This account uses social login. Please sign in with Google or GitHub.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const token = signToken(user.id);
    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return reply.code(200).send({ user: await formatUserWithOAuth(user) });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (req, reply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.code(200).send({ ok: true });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', { onRequest: authMiddleware }, async (req, reply) => {
    const { rows } = await query(
      `SELECT * FROM designfast.users WHERE id = $1`,
      [req.userId]
    );

    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    return { user: await formatUserWithOAuth(rows[0]) };
  });

  // POST /api/auth/verify-email
  app.post('/api/auth/verify-email', {
    onRequest: authMiddleware,
    config: { rateLimit: RATE_LIMITS.verifyEmail }
  }, async (req, reply) => {
    const { code } = req.body || {};

    if (!code || typeof code !== 'string') {
      return reply.code(400).send({ error: 'Verification code is required' });
    }

    const { rows } = await query(
      `SELECT * FROM designfast.users WHERE id = $1`,
      [req.userId]
    );

    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const user = rows[0];

    if (user.email_verified_at) {
      return reply.code(400).send({ error: 'Email already verified' });
    }

    if (!user.email_verification_code) {
      return reply.code(400).send({ error: 'No verification pending' });
    }

    if (new Date() > new Date(user.email_verification_expires)) {
      return reply.code(400).send({ error: 'Verification code expired. Please request a new one.' });
    }

    if (user.email_verification_code !== code.trim()) {
      return reply.code(400).send({ error: 'Invalid verification code' });
    }

    const { rows: updatedRows } = await query(
      `UPDATE designfast.users
       SET email_verified_at = NOW(), email_verification_code = NULL, email_verification_expires = NULL
       WHERE id = $1
       RETURNING *`,
      [req.userId]
    );

    return { user: await formatUserWithOAuth(updatedRows[0]) };
  });

  // POST /api/auth/resend-verification
  app.post('/api/auth/resend-verification', {
    onRequest: authMiddleware,
    config: { rateLimit: RATE_LIMITS.resendVerification }
  }, async (req, reply) => {
    const { rows } = await query(
      `SELECT * FROM designfast.users WHERE id = $1`,
      [req.userId]
    );

    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const user = rows[0];

    if (user.email_verified_at) {
      return reply.code(400).send({ error: 'Email already verified' });
    }

    if (!isEmailVerificationEnabled()) {
      return reply.code(400).send({ error: 'Email verification is not enabled' });
    }

    const newCode = generateVerificationCode();
    const newExpires = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    await query(
      `UPDATE designfast.users
       SET email_verification_code = $1, email_verification_expires = $2
       WHERE id = $3`,
      [newCode, newExpires, req.userId]
    );

    const sent = await sendVerificationEmail(user.email, newCode);
    if (!sent) {
      return reply.code(500).send({ error: 'Failed to send verification email' });
    }

    return { ok: true };
  });
}
