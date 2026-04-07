import { query } from '../db.js';
import { authMiddleware } from '../auth.js';
import { encrypt } from '../encryption.js';
import { formatUser } from '../format-user.js';

const VALID_PROVIDERS = ['anthropic', 'google'];

export default async function (app) {
  app.addHook('onRequest', authMiddleware);

  // GET /api/account
  app.get('/api/account', async (req) => {
    const { rows } = await query(
      `SELECT * FROM designfast.users WHERE id = $1`,
      [req.userId]
    );
    return { user: formatUser(rows[0]) };
  });

  // PATCH /api/account
  app.patch('/api/account', async (req) => {
    const { name } = req.body || {};
    const { rows } = await query(
      `UPDATE designfast.users SET name = COALESCE($2, name) WHERE id = $1 RETURNING *`,
      [req.userId, name]
    );
    return { user: formatUser(rows[0]) };
  });

  // POST /api/account/api-keys
  app.post('/api/account/api-keys', async (req, reply) => {
    // BYOK only available on self-hosted deployments
    if (process.env.BYOK_ENABLED !== 'true') {
      return reply.code(403).send({ error: 'API key management is only available on self-hosted deployments' });
    }

    const { provider, key } = req.body || {};

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return reply.code(400).send({ error: `Provider must be one of: ${VALID_PROVIDERS.join(', ')}` });
    }
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      return reply.code(400).send({ error: 'Key is required' });
    }

    const keyEncrypted = encrypt(key);

    const { rows } = await query(
      `INSERT INTO designfast.api_keys (user_id, provider, key_encrypted)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, provider) DO UPDATE SET key_encrypted = $3, updated_at = NOW()
       RETURNING provider, created_at`,
      [req.userId, provider, keyEncrypted]
    );

    return reply.code(201).send({
      provider: rows[0].provider,
      createdAt: rows[0].created_at,
    });
  });

  // DELETE /api/account/api-keys/:provider
  app.delete('/api/account/api-keys/:provider', async (req, reply) => {
    if (process.env.BYOK_ENABLED !== 'true') {
      return reply.code(403).send({ error: 'API key management is only available on self-hosted deployments' });
    }

    const { provider } = req.params;

    const { rowCount } = await query(
      `DELETE FROM designfast.api_keys WHERE user_id = $1 AND provider = $2`,
      [req.userId, provider]
    );

    if (rowCount === 0) {
      return reply.code(404).send({ error: 'No key found for provider' });
    }

    return { ok: true };
  });
}
