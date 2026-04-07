import archiver from 'archiver';
import { query } from '../db.js';
import { authMiddleware } from '../auth.js';
import bus from '../event-bus.js';
import { requireUUID } from '../validation.js';
import { getSafeOrigin } from '../cors.js';

export default async function (app) {
  app.addHook('onRequest', authMiddleware);

  // GET /api/jobs/:id
  app.get('/api/jobs/:id', async (req, reply) => {
    if (requireUUID(req.params.id, reply)) return;

    const { rows } = await query(
      `SELECT * FROM designfast.jobs WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Job not found' });
    }

    const j = rows[0];
    return {
      id: j.id,
      generationId: j.generation_id,
      styleKey: j.style_key,
      styleName: j.style_name,
      model: j.model,
      provider: j.provider,
      version: j.version,
      status: j.status,
      errorMessage: j.error_message,
      durationMs: j.duration_ms,
      createdAt: j.created_at,
      startedAt: j.started_at,
      completedAt: j.completed_at,
      latestRevision: j.latest_revision || 0,
    };
  });

  // GET /api/jobs/:id/files
  app.get('/api/jobs/:id/files', async (req, reply) => {
    if (requireUUID(req.params.id, reply)) return;

    // Verify ownership
    const { rows: jobs } = await query(
      `SELECT id FROM designfast.jobs WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (jobs.length === 0) {
      return reply.code(404).send({ error: 'Job not found' });
    }

    const { rows } = await query(
      `SELECT DISTINCT ON (filename) id, filename, size_bytes, created_at 
       FROM designfast.job_files 
       WHERE job_id = $1 
       ORDER BY filename, revision DESC`,
      [req.params.id]
    );

    return {
      files: rows.map(f => ({
        id: f.id,
        filename: f.filename,
        sizeBytes: f.size_bytes,
        createdAt: f.created_at,
      })),
    };
  });

  // GET /api/jobs/:id/events — SSE stream
  app.get('/api/jobs/:id/events', async (req, reply) => {
    if (requireUUID(req.params.id, reply)) return;

    // Verify ownership
    const { rows: jobs } = await query(
      `SELECT id, status FROM designfast.jobs WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (jobs.length === 0) {
      return reply.code(404).send({ error: 'Job not found' });
    }

    const jobId = req.params.id;

    // Set SSE headers with CORS
    const origin = getSafeOrigin(req.headers.origin);
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    });

    // If job is already done/failed, send final event and close
    if (jobs[0].status === 'done' || jobs[0].status === 'failed') {
      reply.raw.write(`data: ${JSON.stringify({ jobId, type: jobs[0].status, timestamp: Date.now() })}\n\n`);
      reply.raw.end();
      return;
    }

    // Send keepalive every 30s to prevent proxy timeouts
    const keepalive = setInterval(() => {
      reply.raw.write(`: keepalive\n\n`);
    }, 30000);

    // Listen to in-memory event bus (fed by the global Queen consumer)
    const onEvent = (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);

      if (event.type === 'done' || event.type === 'error') {
        clearInterval(keepalive);
        bus.off(jobId, onEvent);
        reply.raw.end();
      }
    };

    bus.on(jobId, onEvent);

    // Clean up listener on client disconnect
    req.raw.on('close', () => {
      clearInterval(keepalive);
      bus.off(jobId, onEvent);
    });

    // Prevent Fastify from sending a response (we're handling raw)
    return reply;
  });

  // GET /api/jobs/:id/download — ZIP all job files
  app.get('/api/jobs/:id/download', async (req, reply) => {
    if (requireUUID(req.params.id, reply)) return;

    // Verify ownership
    const { rows: jobs } = await query(
      `SELECT id FROM designfast.jobs WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (jobs.length === 0) {
      return reply.code(404).send({ error: 'Job not found' });
    }

    const { rows: files } = await query(
      `SELECT DISTINCT ON (filename) filename, content 
       FROM designfast.job_files 
       WHERE job_id = $1 
       ORDER BY filename, revision DESC`,
      [req.params.id]
    );

    // Debug: check ALL job_uploads for this job
    const { rows: allJobUploads } = await query(
      `SELECT ju.upload_id, ju.purpose, u.filename
       FROM designfast.job_uploads ju
       JOIN designfast.uploads u ON u.id = ju.upload_id
       WHERE ju.job_id = $1`,
      [req.params.id]
    );
    req.log.info({ jobId: req.params.id, allJobUploads }, 'Download: all job_uploads for this job');

    const { rows: assets } = await query(
      `SELECT u.filename, u.data
       FROM designfast.job_uploads ju
       JOIN designfast.uploads u ON u.id = ju.upload_id
       WHERE ju.job_id = $1 AND ju.purpose = 'asset'`,
      [req.params.id]
    );

    // Debug: log what we found
    req.log.info({ jobId: req.params.id, fileCount: files.length, assetCount: assets.length, assetFilenames: assets.map(a => a.filename) }, 'Download: files and assets found');

    if (files.length === 0 && assets.length === 0) {
      return reply.code(404).send({ error: 'No files found' });
    }

    const jobId = req.params.id;

    reply.raw.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="designfast-${jobId}.zip"`,
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(reply.raw);

    for (const file of files) {
      archive.append(file.content, { name: file.filename });
    }

    for (const asset of assets) {
      // Put assets in the assets/ folder inside the zip
      archive.append(asset.data, { name: `assets/${asset.filename}` });
    }

    await archive.finalize();
    return reply;
  });
}
