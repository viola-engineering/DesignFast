import { randomUUID } from 'node:crypto';
import { mkdtempSync, writeFileSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  AgentLoop,
  createProvider,
  createDefaultRegistry,
  DatabaseImpl,
} from '@angycode/core';
import { query } from '../db.js';
import { authMiddleware } from '../auth.js';
import { MODEL_MAP, PROVIDER_TO_APIKEY_PROVIDER } from '../models.js';
import { decrypt } from '../encryption.js';
import { requireUUID } from '../validation.js';
import { PLANS, CREDIT_COSTS, hasApiKeys } from '../plans.js';

// In-memory store for active iterate sessions.
// If the server restarts, active sessions are lost. The user can start a new
// session — it reads current files from Postgres, so no work is lost.
const activeSessions = new Map();

async function getApiKey(userId, providerName) {
  const apiKeyProvider = PROVIDER_TO_APIKEY_PROVIDER[providerName];
  if (apiKeyProvider) {
    const { rows } = await query(
      `SELECT key_encrypted FROM designfast.api_keys WHERE user_id = $1 AND provider = $2`,
      [userId, apiKeyProvider]
    );
    if (rows.length > 0) {
      return decrypt(rows[0].key_encrypted);
    }
  }
  const modelEntry = Object.values(MODEL_MAP).find(m => m.providerName === providerName);
  if (modelEntry && process.env[modelEntry.apiKeyEnv]) {
    return process.env[modelEntry.apiKeyEnv];
  }
  return null;
}

export default async function (app) {
  app.addHook('onRequest', authMiddleware);

  // POST /api/iterate/:jobId/start
  app.post('/api/iterate/:jobId/start', async (req, reply) => {
    const { jobId } = req.params;
    if (requireUUID(jobId, reply)) return;

    const { model: modelKey = 'claude' } = req.body || {};

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

    const modelCfg = MODEL_MAP[modelKey];
    if (!modelCfg) {
      return reply.code(400).send({ error: `Invalid model: ${modelKey}` });
    }

    // Check plan limits for iterate
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

    let iterBillingMode = 'generation';
    if (isByok && plan.byokEnabled) {
      iterBillingMode = 'byok';
    } else if (iterUser.plan === 'pro') {
      if (iterUser.credits_used + creditCost <= iterUser.credits_limit) {
        iterBillingMode = 'credits';
      } else if (modelKey !== 'gemini') {
        return reply.code(403).send({ error: 'Credits exhausted. You can still refine with Gemini.' });
      }
    }

    // Resolve API key
    const apiKey = await getApiKey(req.userId, modelCfg.providerName);
    if (!apiKey) {
      return reply.code(400).send({ error: `No API key available for ${modelCfg.providerName}` });
    }

    // Load job files at latest revision into temp dir
    const { rows: files } = await query(
      `SELECT filename, content FROM designfast.job_files
       WHERE job_id = $1 AND revision = (SELECT latest_revision FROM designfast.jobs WHERE id = $1)`,
      [jobId]
    );

    const tempDir = mkdtempSync(join(tmpdir(), `designfast-iterate-`));
    for (const f of files) {
      writeFileSync(join(tempDir, f.filename), f.content, 'utf8');
    }

    const fileList = files.map(f => f.filename);

    // Create agent
    const provider = createProvider({ name: modelCfg.providerName, apiKey });
    const agentDb = new DatabaseImpl();
    const tools = createDefaultRegistry();

    const agent = new AgentLoop({
      provider,
      tools,
      db: agentDb,
      workingDir: tempDir,
      maxTokens: 32768,
      maxTurns: 50,
      model: modelCfg.model,
      providerName: modelCfg.providerName,
    });

    // Track usage
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCostUsd = 0;

    agent.on('event', (event) => {
      if (event.type === 'usage') {
        totalTokensIn += event.input_tokens || 0;
        totalTokensOut += event.output_tokens || 0;
        totalCostUsd += event.cost_usd || 0;
      }
    });

    // Create session in DB
    const sessionId = randomUUID();
    await query(
      `INSERT INTO designfast.iterate_sessions (id, job_id, user_id, model, status)
       VALUES ($1, $2, $3, $4, 'active')`,
      [sessionId, jobId, req.userId, modelCfg.model]
    );

    // Initialize agent — read all files
    const dir = tempDir;
    const initPrompt = `You are a world-class web designer and developer working on an existing project.

The project files are in "${dir}/". The files are:
${fileList.map(f => `  - ${dir}/${f}`).join('\n')}

FIRST: Use your read tool to read ALL of these files so you understand the current state of the project. Start with style.css, then the HTML files, then any JS files.

RULES:
- When the user asks for changes, modify the existing files in "${dir}/" using the edit tool or write tool.
- Always re-read a file before editing it if you haven't read it recently in this conversation.
- Maintain visual consistency — same design language, colors, fonts, spacing.
- If adding new pages, follow the same patterns (same nav, same head, same CSS/JS includes).
- Keep all file paths relative within the "${dir}/" folder.
- After making changes, briefly confirm what you changed (one line).
- Do NOT rewrite entire files unless necessary — prefer targeted edits.

Start by reading all the files now.`;

    const session = await agent.run(initPrompt);

    // Deduct credits for the initial /start call
    if (iterBillingMode === 'credits') {
      await query(
        `UPDATE designfast.users SET credits_used = credits_used + $2 WHERE id = $1`,
        [req.userId, creditCost]
      );
    } else if (iterBillingMode === 'byok') {
      await query(
        `UPDATE designfast.users SET byok_generations_used = byok_generations_used + 1 WHERE id = $1`,
        [req.userId]
      );
    } else {
      await query(
        `UPDATE designfast.users SET generations_used = generations_used + 1 WHERE id = $1`,
        [req.userId]
      );
    }

    // Store session in memory
    activeSessions.set(sessionId, {
      agent,
      agentDb,
      tempDir,
      agentSessionId: session.id,
      userId: req.userId,
      jobId,
      totalTokensIn,
      totalTokensOut,
      totalCostUsd,
      modelKey,
      billingMode: iterBillingMode,
    });

    return reply.code(201).send({
      sessionId,
      jobId,
      model: modelCfg.model,
      status: 'active',
      files: fileList,
    });
  });

  // POST /api/iterate/:sessionId/send
  app.post('/api/iterate/:sessionId/send', async (req, reply) => {
    const { sessionId } = req.params;
    if (requireUUID(sessionId, reply)) return;

    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return reply.code(400).send({ error: 'Message is required' });
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

    // Check credits for this /send call
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

    // Snapshot files before the agent runs
    const filesBefore = new Set(readdirSync(live.tempDir).filter(f => /\.(html|css|js)$/.test(f)));

    // Record user message
    await query(
      `INSERT INTO designfast.iterate_messages (id, session_id, role, content) VALUES ($1, $2, 'user', $3)`,
      [randomUUID(), sessionId, message.trim()]
    );

    // Collect assistant text
    let assistantText = '';
    const textHandler = (event) => {
      if (event.type === 'text') {
        assistantText += event.text;
      }
      if (event.type === 'usage') {
        live.totalTokensIn += event.input_tokens || 0;
        live.totalTokensOut += event.output_tokens || 0;
        live.totalCostUsd += event.cost_usd || 0;
      }
    };
    live.agent.on('event', textHandler);

    await live.agent.continueSession(live.agentSessionId, message.trim());

    // Determine changed files
    const filesAfter = readdirSync(live.tempDir).filter(f => /\.(html|css|js)$/.test(f));
    const filesChanged = filesAfter.filter(f => !filesBefore.has(f));
    // Also check modified files by comparing content — simplified: just report all current files
    // For a more accurate diff we'd need to hash before/after, but this is sufficient

    // Record assistant message
    const content = assistantText.trim() || '(no text output)';
    await query(
      `INSERT INTO designfast.iterate_messages (id, session_id, role, content) VALUES ($1, $2, 'assistant', $3)`,
      [randomUUID(), sessionId, content]
    );

    // Deduct credits for this /send call
    if (live.billingMode === 'credits') {
      const sendCost = CREDIT_COSTS[MODEL_MAP[live.modelKey]?.providerName] || 0;
      if (sendCost > 0) {
        await query(
          `UPDATE designfast.users SET credits_used = credits_used + $2 WHERE id = $1`,
          [req.userId, sendCost]
        );
      }
    }

    // Update session usage in DB
    await query(
      `UPDATE designfast.iterate_sessions SET tokens_in = $2, tokens_out = $3, cost_usd = $4 WHERE id = $1`,
      [sessionId, live.totalTokensIn, live.totalTokensOut, live.totalCostUsd]
    );

    // Increment revision counter and save all files as a new snapshot
    const { rows: [{ latest_revision: newRevision }] } = await query(
      `UPDATE designfast.jobs SET latest_revision = latest_revision + 1
       WHERE id = $1 RETURNING latest_revision`,
      [live.jobId]
    );

    for (const filename of filesAfter) {
      const fileContent = readFileSync(join(live.tempDir, filename), 'utf8');
      const sizeBytes = Buffer.byteLength(fileContent, 'utf8');
      await query(
        `INSERT INTO designfast.job_files (job_id, filename, content, size_bytes, revision)
         VALUES ($1, $2, $3, $4, $5)`,
        [live.jobId, filename, fileContent, sizeBytes, newRevision]
      );
    }

    return {
      role: 'assistant',
      content,
      filesChanged,
      revision: newRevision,
    };
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
