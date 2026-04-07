import { randomUUID } from 'node:crypto';
import { rmSync } from 'node:fs';
import { query } from '../db.js';
import { authMiddleware } from '../auth.js';
import { MODEL_MAP, PROVIDER_TO_MODEL_KEY } from '../models.js';
import { requireUUID } from '../validation.js';
import { PLANS, CREDIT_COSTS, hasApiKeys } from '../plans.js';
import { activeSessions } from '../iterate-sessions.js';
import queen from '../queen-client.js';
import bus from '../event-bus.js';

export default async function (app) {
  app.addHook('onRequest', authMiddleware);

  // POST /api/iterate/:jobId/start
  //
  // Starts an iterate session. Accepts an optional `message` so the first
  // refinement can be bundled with init (avoids a round-trip).
  //
  // The heavy work (agent init + first message) is pushed to the
  // designfast-iterate Queen queue and processed by the iterate worker.
  // Progress is streamed via GET /api/iterate/:sessionId/events (SSE).
  app.post('/api/iterate/:jobId/start', async (req, reply) => {
    const { jobId } = req.params;
    if (requireUUID(jobId, reply)) return;

    const { model: explicitModelKey, message, uploadIds = [] } = req.body || {};

    if (message !== undefined && (typeof message !== 'string' || message.trim().length === 0)) {
      return reply.code(400).send({ error: 'Message must be a non-empty string when provided' });
    }
    if (message && message.trim().length > 2000) {
      return reply.code(400).send({ error: 'Message must be 2000 characters or fewer' });
    }
    if (!Array.isArray(uploadIds)) {
      return reply.code(400).send({ error: 'uploadIds must be an array' });
    }

    // Validate upload ownership
    if (uploadIds.length > 0) {
      const { rows: validUploads } = await query(
        `SELECT id FROM designfast.uploads WHERE id = ANY($1) AND user_id = $2`,
        [uploadIds, req.userId]
      );
      if (validUploads.length !== uploadIds.length) {
        return reply.code(400).send({ error: 'One or more uploadIds are invalid' });
      }
    }

    // Verify job ownership and status
    const { rows: jobs } = await query(
      `SELECT * FROM designfast.jobs WHERE id = $1 AND user_id = $2`,
      [jobId, req.userId]
    );
    if (jobs.length === 0) {
      return reply.code(404).send({ error: 'Job not found' });
    }
    if (jobs[0].status !== 'done') {
      return reply.code(400).send({ error: 'Job is not completed' });
    }

    // Resolve model: explicit override > job's original model
    const jobProvider = jobs[0].provider; // 'anthropic' | 'gemini'
    const modelKey = explicitModelKey || PROVIDER_TO_MODEL_KEY[jobProvider] || 'gemini';

    const modelCfg = MODEL_MAP[modelKey];
    if (!modelCfg) {
      return reply.code(400).send({ error: `Invalid model: ${modelKey}` });
    }

    // Check plan limits
    const { rows: [iterUser] } = await query(
      `SELECT * FROM designfast.users WHERE id = $1`,
      [req.userId]
    );
    const plan = PLANS[iterUser.plan] || PLANS.free;

    // Check model access
    if (!plan.allowedModels.includes(modelKey)) {
      return reply.code(403).send({ error: `Upgrade to Pro to use ${modelKey === 'claude' ? 'Claude' : modelKey}` });
    }

    // Determine BYOK and billing
    const isByok = await hasApiKeys(req.userId, [modelCfg.providerName]);
    const creditCost = CREDIT_COSTS[modelCfg.providerName] || 0;

    let billingMode = 'generation';
    if (isByok && plan.byokEnabled) {
      billingMode = 'byok';
    } else if (iterUser.plan === 'pro') {
      if (iterUser.credits_used + creditCost <= iterUser.credits_limit) {
        billingMode = 'credits';
      } else if (modelKey !== 'gemini') {
        return reply.code(403).send({ error: 'Credits exhausted. You can still refine with Gemini.' });
      }
    }

    // Create session in DB
    const sessionId = randomUUID();
    await query(
      `INSERT INTO designfast.iterate_sessions (id, job_id, user_id, model, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [sessionId, jobId, req.userId, modelCfg.model]
    );

    // Link any new uploads to the job
    if (uploadIds.length > 0) {
      for (const uploadId of uploadIds) {
        const { rows: [upload] } = await query(
          `SELECT purpose FROM designfast.uploads WHERE id = $1`,
          [uploadId]
        );
        await query(
          `INSERT INTO designfast.job_uploads (job_id, upload_id, purpose)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [jobId, uploadId, upload.purpose]
        );
      }
    }

    // Push task to Queen — the iterate worker will do the heavy lifting
    await queen
      .queue('designfast-iterate')
      .partition(sessionId)
      .push([{
        data: {
          type: 'iterate-start',
          sessionId,
          jobId,
          userId: req.userId,
          modelKey,
          billingMode,
          creditCost,
          message: message ? message.trim() : null,
        },
      }]);

    return reply.code(201).send({
      sessionId,
      jobId,
      model: modelCfg.model,
      status: 'initializing',
    });
  });

  // POST /api/iterate/:sessionId/send
  //
  // Send a refinement message to an active session.
  // The work is pushed to the Queen queue. Progress via SSE.
  app.post('/api/iterate/:sessionId/send', async (req, reply) => {
    const { sessionId } = req.params;
    if (requireUUID(sessionId, reply)) return;

    const { message, uploadIds = [] } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return reply.code(400).send({ error: 'Message is required' });
    }
    if (message.trim().length > 2000) {
      return reply.code(400).send({ error: 'Message must be 2000 characters or fewer' });
    }
    if (!Array.isArray(uploadIds)) {
      return reply.code(400).send({ error: 'uploadIds must be an array' });
    }

    // Validate upload ownership
    if (uploadIds.length > 0) {
      const { rows: validUploads } = await query(
        `SELECT id FROM designfast.uploads WHERE id = ANY($1) AND user_id = $2`,
        [uploadIds, req.userId]
      );
      if (validUploads.length !== uploadIds.length) {
        return reply.code(400).send({ error: 'One or more uploadIds are invalid' });
      }
    }

    // Verify session ownership
    const { rows: sessions } = await query(
      `SELECT * FROM designfast.iterate_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.userId]
    );
    if (sessions.length === 0) {
      return reply.code(404).send({ error: 'Session not found' });
    }
    if (sessions[0].status !== 'active') {
      return reply.code(400).send({ error: 'Session is closed' });
    }

    const live = activeSessions.get(sessionId);
    if (!live) {
      return reply.code(400).send({ error: 'Session is no longer active (server may have restarted)' });
    }

    // Check credits
    if (live.billingMode === 'credits') {
      const { rows: [sendUser] } = await query(
        `SELECT credits_used, credits_limit FROM designfast.users WHERE id = $1`,
        [req.userId]
      );
      const sendCost = CREDIT_COSTS[MODEL_MAP[live.modelKey]?.providerName] || 0;
      if (sendUser.credits_used + sendCost > sendUser.credits_limit) {
        return reply.code(403).send({ error: 'Credits exhausted. Close this session or switch to Gemini.' });
      }
    }

    const messageId = randomUUID();

    // Push task to Queen
    await queen
      .queue('designfast-iterate')
      .partition(sessionId)
      .push([{
        data: {
          type: 'iterate-send',
          sessionId,
          messageId,
          message: message.trim(),
          userId: req.userId,
          uploadIds,
        },
      }]);

    return { messageId, status: 'processing' };
  });

  // GET /api/iterate/:sessionId/events — SSE stream for iterate progress
  app.get('/api/iterate/:sessionId/events', async (req, reply) => {
    const { sessionId } = req.params;
    if (requireUUID(sessionId, reply)) return;

    // Verify session ownership
    const { rows: sessions } = await query(
      `SELECT * FROM designfast.iterate_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.userId]
    );
    if (sessions.length === 0) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    // Set SSE headers with CORS
    const origin = req.headers.origin || '*';
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    });

    // If session is already failed/closed, send that and close
    if (sessions[0].status === 'failed') {
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: 'Session failed' })}\n\n`);
      reply.raw.end();
      return reply;
    }
    if (sessions[0].status === 'closed') {
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: 'Session closed' })}\n\n`);
      reply.raw.end();
      return reply;
    }

    const eventKey = `session:${sessionId}`;

    // Send keepalive every 30s to prevent proxy timeouts
    const keepalive = setInterval(() => {
      reply.raw.write(`: keepalive\n\n`);
    }, 30000);

    const onEvent = (event) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);

      // Close SSE on terminal events
      if (event.type === 'done' || event.type === 'error') {
        clearInterval(keepalive);
        bus.off(eventKey, onEvent);
        reply.raw.end();
      }
    };

    bus.on(eventKey, onEvent);

    // Clean up on client disconnect
    req.raw.on('close', () => {
      clearInterval(keepalive);
      bus.off(eventKey, onEvent);
    });

    return reply;
  });

  // POST /api/iterate/:sessionId/close
  app.post('/api/iterate/:sessionId/close', async (req, reply) => {
    const { sessionId } = req.params;
    if (requireUUID(sessionId, reply)) return;

    const { rows: sessions } = await query(
      `SELECT * FROM designfast.iterate_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.userId]
    );
    if (sessions.length === 0) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    // Clean up in-memory resources
    const live = activeSessions.get(sessionId);
    if (live) {
      try { rmSync(live.tempDir, { recursive: true, force: true }); } catch {}
      try { live.agentDb.close(); } catch {}
      activeSessions.delete(sessionId);
    }

    await query(
      `UPDATE designfast.iterate_sessions SET status = 'closed', closed_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    return { ok: true };
  });

  // GET /api/iterate/:sessionId
  app.get('/api/iterate/:sessionId', async (req, reply) => {
    const { sessionId } = req.params;
    if (requireUUID(sessionId, reply)) return;

    const { rows: sessions } = await query(
      `SELECT * FROM designfast.iterate_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.userId]
    );
    if (sessions.length === 0) {
      return reply.code(404).send({ error: 'Session not found' });
    }

    const s = sessions[0];

    const { rows: messages } = await query(
      `SELECT * FROM designfast.iterate_messages WHERE session_id = $1 ORDER BY created_at`,
      [sessionId]
    );

    return {
      id: s.id,
      jobId: s.job_id,
      model: s.model,
      status: s.status,
      createdAt: s.created_at,
      messages: messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    };
  });
}
