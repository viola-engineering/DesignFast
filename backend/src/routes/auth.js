import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { signToken, authMiddleware } from '../auth.js';
import { formatUser } from '../format-user.js';

const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function (app) {
  // POST /api/auth/register
  app.post('/api/auth/register', async (req, reply) => {
    const { email, password, name } = req.body || {};

    if (!email || !EMAIL_RE.test(email)) {
      return reply.code(400).send({ error: 'Valid email is required' });
    }
    if (!password || password.length < 8) {
      return reply.code(400).send({ error: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let row;
    try {
      const { rows } = await query(
        `INSERT INTO designfast.users (email, password_hash, name)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, passwordHash, name || null]
      );
      row = rows[0];
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({ error: 'Email already registered' });
      }
      throw err;
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
  app.post('/api/auth/login', async (req, reply) => {
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

    return reply.code(200).send({ user: formatUser(user) });
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

    return { user: formatUser(rows[0]) };
  });
}
