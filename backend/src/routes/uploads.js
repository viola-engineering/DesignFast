import { randomUUID } from 'node:crypto';
import imageSize from 'image-size';
import { query, getClient } from '../db.js';
import { authMiddleware } from '../auth.js';
import { PLANS } from '../plans.js';
import { requireUUID } from '../validation.js';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file

/**
 * Sanitise a filename: lowercase, replace spaces/special chars with hyphens,
 * keep only the basename, deduplicate hyphens.
 */
function sanitizeFilename(original) {
  const ext = original.slice(original.lastIndexOf('.')).toLowerCase();
  let base = original.slice(0, original.lastIndexOf('.'));
  base = base
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (base || 'upload') + ext;
}

export default async function (app) {
  app.addHook('onRequest', authMiddleware);

  // ── POST /api/uploads ──────────────────────────────────────────────
  app.post('/api/uploads', async (req, reply) => {
    // Require pro plan
    const { rows: [user] } = await query(
      `SELECT plan, uploads_bytes_used FROM designfast.users WHERE id = $1`,
      [req.userId]
    );
    const plan = PLANS[user.plan] || PLANS.free;
    if (plan.maxUploadBytes === 0) {
      return reply.code(403).send({ error: 'Image uploads require the Pro plan' });
    }

    // Parse multipart
    const file = await req.file();
    if (!file) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const purpose = file.fields.purpose?.value || 'asset';
    if (purpose !== 'reference' && purpose !== 'asset') {
      return reply.code(400).send({ error: 'Purpose must be "reference" or "asset"' });
    }

    // Validate content type
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return reply.code(400).send({
        error: `Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, SVG`,
      });
    }

    // Read full buffer
    const chunks = [];
    for await (const chunk of file.file) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Validate size
    if (buffer.length > MAX_FILE_BYTES) {
      return reply.code(400).send({ error: `File too large. Maximum is ${MAX_FILE_BYTES / 1024 / 1024} MB` });
    }

    // Check quota
    const bytesUsed = Number(user.uploads_bytes_used) || 0;
    if (bytesUsed + buffer.length > plan.maxUploadBytes) {
      const remainingMB = ((plan.maxUploadBytes - bytesUsed) / 1024 / 1024).toFixed(1);
      return reply.code(413).send({
        error: `Storage quota exceeded. You have ${remainingMB} MB remaining (${plan.maxUploadBytes / 1024 / 1024} MB total)`,
      });
    }

    // Get image dimensions (skip for SVG — imageSize doesn't handle all SVGs well)
    let width = null;
    let height = null;
    if (file.mimetype !== 'image/svg+xml') {
      try {
        const dims = imageSize(buffer);
        width = dims.width || null;
        height = dims.height || null;
      } catch {
        // Non-critical — dimensions are nice-to-have for the prompt
      }
    }

    const filename = sanitizeFilename(file.filename);
    const id = randomUUID();

    // Insert upload + update user quota in a transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO designfast.uploads (id, user_id, filename, original_name, content_type, size_bytes, width, height, data, purpose)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, req.userId, filename, file.filename, file.mimetype, buffer.length, width, height, buffer, purpose]
      );
      await client.query(
        `UPDATE designfast.users SET uploads_bytes_used = uploads_bytes_used + $2 WHERE id = $1`,
        [req.userId, buffer.length]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return reply.code(201).send({
      id,
      filename,
      originalName: file.filename,
      contentType: file.mimetype,
      sizeBytes: buffer.length,
      width,
      height,
      purpose,
    });
  });

  // ── GET /api/uploads ───────────────────────────────────────────────
  app.get('/api/uploads', async (req, reply) => {
    const { purpose } = req.query;
    let sql = `SELECT id, filename, original_name, content_type, size_bytes, width, height, purpose, created_at
               FROM designfast.uploads WHERE user_id = $1`;
    const params = [req.userId];

    if (purpose === 'reference' || purpose === 'asset') {
      sql += ` AND purpose = $2`;
      params.push(purpose);
    }

    sql += ` ORDER BY created_at DESC`;

    const { rows } = await query(sql, params);

    // Also return quota info
    const { rows: [user] } = await query(
      `SELECT uploads_bytes_used FROM designfast.users WHERE id = $1`,
      [req.userId]
    );

    return {
      uploads: rows.map(r => ({
        id: r.id,
        filename: r.filename,
        originalName: r.original_name,
        contentType: r.content_type,
        sizeBytes: r.size_bytes,
        width: r.width,
        height: r.height,
        purpose: r.purpose,
        createdAt: r.created_at,
      })),
      bytesUsed: Number(user.uploads_bytes_used) || 0,
    };
  });

  // ── PATCH /api/uploads/:id ───────────────────────────────────────────
  // Update purpose (reference ↔ asset).
  app.patch('/api/uploads/:id', async (req, reply) => {
    const { id } = req.params;
    if (requireUUID(id, reply)) return;

    const { purpose } = req.body || {};
    if (purpose !== 'reference' && purpose !== 'asset') {
      return reply.code(400).send({ error: 'Purpose must be "reference" or "asset"' });
    }

    const { rowCount } = await query(
      `UPDATE designfast.uploads SET purpose = $3 WHERE id = $1 AND user_id = $2`,
      [id, req.userId, purpose]
    );
    if (rowCount === 0) {
      return reply.code(404).send({ error: 'Upload not found' });
    }

    return { ok: true };
  });

  // ── GET /api/uploads/:id/thumbnail ─────────────────────────────────
  // Serves the raw image for thumbnail previews in the UI.
  // SECURITY: SVG files are sandboxed to prevent embedded script execution.
  app.get('/api/uploads/:id/thumbnail', async (req, reply) => {
    const { id } = req.params;
    if (requireUUID(id, reply)) return;

    const { rows } = await query(
      `SELECT data, content_type FROM designfast.uploads WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Upload not found' });
    }

    const contentType = rows[0].content_type;

    reply
      .header('Content-Type', contentType)
      .header('Cache-Control', 'private, max-age=3600')
      .header('X-Content-Type-Options', 'nosniff');

    // SVG files can contain <script> tags — sandbox them to prevent XSS
    if (contentType === 'image/svg+xml') {
      reply.header('Content-Security-Policy', "sandbox; default-src 'none'; style-src 'unsafe-inline'");
    }

    return reply.send(rows[0].data);
  });

  // ── DELETE /api/uploads/:id ────────────────────────────────────────
  app.delete('/api/uploads/:id', async (req, reply) => {
    const { id } = req.params;
    if (requireUUID(id, reply)) return;

    const { rows } = await query(
      `SELECT size_bytes FROM designfast.uploads WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Upload not found' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM designfast.uploads WHERE id = $1`, [id]);
      await client.query(
        `UPDATE designfast.users SET uploads_bytes_used = GREATEST(uploads_bytes_used - $2, 0) WHERE id = $1`,
        [req.userId, rows[0].size_bytes]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return { ok: true };
  });
}
