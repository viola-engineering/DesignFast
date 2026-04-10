import { randomUUID } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  AgentLoop,
  createProvider,
  createDefaultRegistry,
  DatabaseImpl,
} from '@angycode/core';
import { query } from './db.js';
import { decrypt } from './encryption.js';
import { MODEL_MAP, PROVIDER_TO_APIKEY_PROVIDER } from './models.js';
import { CREDIT_COSTS, WEBAPP_CREDIT_MULTIPLIER } from './plans.js';

/** Max USD cost per iterate session (cumulative across all messages). */
const MAX_ITERATE_COST_USD = 2.0;
import { activeSessions } from './iterate-sessions.js';
import queen from './queen-client.js';

/**
 * Resolve API key for a user + provider.
 */
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

/**
 * Push an event to the designfast-events queue keyed by sessionId.
 */
async function pushEvent(sessionId, event) {
  try {
    await queen
      .queue('designfast-events')
      .partition(sessionId)
      .push([{ data: { sessionId, ...event, timestamp: Date.now() } }]);
  } catch (err) {
    console.error(`[process-iterate] Failed to push event for session ${sessionId}:`, err.message);
  }
}

/**
 * Process an iterate task from the Queen queue.
 */
export async function processIterate(message) {
  const task = message.data || message;

  if (task.type === 'iterate-start') {
    await handleStart(task);
  } else if (task.type === 'iterate-send') {
    await handleSend(task);
  } else {
    console.error(`[process-iterate] Unknown task type: ${task.type}`);
  }
}

/**
 * Handle 'iterate-start': create agent, run init, optionally run first message.
 */
async function handleStart(task) {
  const {
    sessionId, jobId, userId, modelKey, billingMode, creditCost, message,
  } = task;

  const modelCfg = MODEL_MAP[modelKey];

  try {
    await pushEvent(sessionId, { type: 'status', status: 'running', message: 'Initializing...' });

    // Resolve API key
    const apiKey = await getApiKey(userId, modelCfg.providerName);
    if (!apiKey) {
      throw new Error(`No API key available for ${modelCfg.providerName}`);
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

    // ── Fetch uploads linked to this job (from generation + any iterate additions) ──
    const referenceImages = []; // ImageInput[] for LLM vision
    const assetMeta = [];       // metadata for init prompt

    const { rows: uploads } = await query(
      `SELECT u.filename, u.content_type, u.width, u.height, u.size_bytes, u.data, ju.purpose
       FROM designfast.job_uploads ju
       JOIN designfast.uploads u ON u.id = ju.upload_id
       WHERE ju.job_id = $1`,
      [jobId]
    );

    for (const u of uploads) {
      if (u.purpose === 'reference') {
        referenceImages.push({
          data: u.data.toString('base64'),
          mimeType: u.content_type,
        });
      } else if (u.purpose === 'asset') {
        const assetsDir = join(tempDir, 'assets');
        mkdirSync(assetsDir, { recursive: true });
        writeFileSync(join(assetsDir, u.filename), u.data);
        assetMeta.push({
          filename: u.filename,
          width: u.width,
          height: u.height,
        });
      }
    }

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

    // Single permanent listener for usage tracking AND per-send text collection.
    // runSend() toggles _collectText on the live object to collect assistant text
    // without registering additional listeners on each call.
    //
    // All mutable state lives on liveRef so the closure and the live object
    // (which === liveRef after Object.assign) share the same reference.
    const liveRef = {
      _collectText: false,
      _assistantText: '',
      totalTokensIn: 0,
      totalTokensOut: 0,
      totalCostUsd: 0,
    };

    agent.on('event', (event) => {
      if (event.type === 'usage') {
        liveRef.totalTokensIn += event.input_tokens || 0;
        liveRef.totalTokensOut += event.output_tokens || 0;
        liveRef.totalCostUsd += event.cost_usd || 0;
        if (liveRef.totalCostUsd >= MAX_ITERATE_COST_USD) {
          console.warn(`[process-iterate] Session hit cost cap ($${liveRef.totalCostUsd.toFixed(2)}), aborting`);
          agent.abort();
        }
      }
      if (liveRef._collectText && event.type === 'text') {
        liveRef._assistantText += event.text;
      }
    });

    // Init prompt — agent reads all project files
    let assetBlock = '';
    if (assetMeta.length > 0) {
      const assetList = assetMeta.map(a => {
        const dims = a.width && a.height ? ` (${a.width}×${a.height}px)` : '';
        return `  - assets/${a.filename}${dims}`;
      }).join('\n');
      assetBlock = `\nUSER ASSETS available in the project:
${assetList}
Use these EXACT relative paths (e.g. assets/${assetMeta[0].filename}) in HTML/CSS.\n`;
    }

    let refBlock = '';
    if (referenceImages.length > 0) {
      refBlock = `\nREFERENCE IMAGE:
The user provided a reference image showing their desired visual style.
Keep this design direction in mind when making changes.\n`;
    }

    const initPrompt = `You are a world-class web designer and developer working on an existing project.

The project files are in "${tempDir}/". The files are:
${fileList.map(f => `  - ${tempDir}/${f}`).join('\n')}

FIRST: Use your read tool to read ALL of these files so you understand the current state of the project. Start with style.css, then the HTML files, then any JS files.
${refBlock}${assetBlock}
RULES:
- When the user asks for changes, modify the existing files in "${tempDir}/" using the edit tool or write tool.
- Always re-read a file before editing it if you haven't read it recently in this conversation.
- Maintain visual consistency — same design language, colors, fonts, spacing.
- If adding new pages, follow the same patterns (same nav, same head, same CSS/JS includes).
- Keep all file paths relative within the "${tempDir}/" folder.
- After making changes, briefly confirm what you changed (one line).
- Do NOT rewrite entire files unless necessary — prefer targeted edits.
- If the user provides a URL (https://...), use your WebFetch tool to visit it and study the content, structure, and design before making changes.

Start by reading all the files now.`;

    // NOTE: AgentLoop.run() expects ImageInput[] directly as the 2nd arg,
    // NOT wrapped in { images }. The .d.ts is misleading.
    const session = await agent.run(initPrompt, referenceImages.length > 0 ? referenceImages : undefined);

    // Store session in memory.
    // Object.assign mutates liveRef in-place so live === liveRef.
    // The permanent event listener's closure over liveRef therefore
    // directly updates live.totalTokensIn etc.
    const live = Object.assign(liveRef, {
      agent,
      agentDb,
      tempDir,
      agentSessionId: session.id,
      userId,
      jobId,
      modelKey,
      billingMode,
    });
    activeSessions.set(sessionId, live);

    // Deduct credits for the /start call
    if (billingMode === 'credits') {
      await query(
        `UPDATE designfast.users SET credits_used = credits_used + $2 WHERE id = $1`,
        [userId, creditCost]
      );
    } else if (billingMode === 'byok') {
      await query(
        `UPDATE designfast.users SET byok_generations_used = byok_generations_used + 1 WHERE id = $1`,
        [userId]
      );
    } else {
      await query(
        `UPDATE designfast.users SET generations_used = generations_used + 1 WHERE id = $1`,
        [userId]
      );
    }

    // If a first message was included, run it now
    if (message) {
      await pushEvent(sessionId, { type: 'status', status: 'running', message: 'Refining design...' });
      const result = await runSend(sessionId, live, message);
      await pushEvent(sessionId, {
        type: 'done',
        revision: result.revision,
        content: result.content,
        filesChanged: result.filesChanged,
      });
    } else {
      // No message — just signal session is ready
      await pushEvent(sessionId, { type: 'ready' });
    }
  } catch (err) {
    console.error(`[process-iterate] Start failed for session ${sessionId}:`, err);
    await pushEvent(sessionId, { type: 'error', message: err.message });

    // Clean up if partially created
    const live = activeSessions.get(sessionId);
    if (live) {
      try { rmSync(live.tempDir, { recursive: true, force: true }); } catch {}
      try { live.agentDb.close(); } catch {}
      activeSessions.delete(sessionId);
    }

    await query(
      `UPDATE designfast.iterate_sessions SET status = 'failed', closed_at = NOW() WHERE id = $1`,
      [sessionId]
    ).catch(() => {});

    throw err;
  }
}

/**
 * Handle 'iterate-send': continue agent conversation with user message.
 * Supports optional uploadIds for new reference images or assets.
 */
async function handleSend(task) {
  const { sessionId, messageId, message, userId, uploadIds = [] } = task;

  const live = activeSessions.get(sessionId);
  if (!live) {
    await pushEvent(sessionId, { type: 'error', message: 'Session is no longer active (server may have restarted)' });
    return;
  }

  try {
    await pushEvent(sessionId, { type: 'status', status: 'running', message: 'Refining design...' });

    // Deduct credits for this /send call
    if (live.billingMode === 'credits') {
      const sendCost = CREDIT_COSTS[MODEL_MAP[live.modelKey]?.providerName] || 0;
      if (sendCost > 0) {
        await query(
          `UPDATE designfast.users SET credits_used = credits_used + $2 WHERE id = $1`,
          [userId, sendCost]
        );
      }
    }

    // Process new uploads for this message
    const sendImages = []; // reference images → vision input
    let assetNote = '';    // note appended to message about new assets

    if (uploadIds.length > 0) {
      const { rows: uploads } = await query(
        `SELECT id, filename, content_type, width, height, size_bytes, data, purpose
         FROM designfast.uploads WHERE id = ANY($1) AND user_id = $2`,
        [uploadIds, userId]
      );

      for (const u of uploads) {
        if (u.purpose === 'reference') {
          sendImages.push({
            data: u.data.toString('base64'),
            mimeType: u.content_type,
          });
        } else if (u.purpose === 'asset') {
          // Write new asset to the session's temp dir
          const assetsDir = join(live.tempDir, 'assets');
          mkdirSync(assetsDir, { recursive: true });
          writeFileSync(join(assetsDir, u.filename), u.data);

          // Link to job so preview can serve it
          await query(
            `INSERT INTO designfast.job_uploads (job_id, upload_id, purpose)
             VALUES ($1, $2, 'asset') ON CONFLICT DO NOTHING`,
            [live.jobId, u.id]
          );

          const dims = u.width && u.height ? ` (${u.width}×${u.height}px)` : '';
          assetNote += `\n[New asset available: assets/${u.filename}${dims} — use it as <img src="assets/${u.filename}">]`;
        }
      }
    }

    // Build the final message with optional asset notes
    const fullMessage = assetNote ? message + assetNote : message;

    const result = await runSend(sessionId, live, fullMessage, sendImages);

    await pushEvent(sessionId, {
      type: 'done',
      revision: result.revision,
      content: result.content,
      filesChanged: result.filesChanged,
    });
  } catch (err) {
    console.error(`[process-iterate] Send failed for session ${sessionId}:`, err);
    await pushEvent(sessionId, { type: 'error', message: err.message });
    throw err;
  }
}

/**
 * Shared logic: run agent with a user message, save files, return result.
 * @param {string} sessionId
 * @param {object} live - active session from activeSessions map
 * @param {string} message - user message
 * @param {Array} images - optional ImageInput[] for vision (reference images)
 */
async function runSend(sessionId, live, message, images = []) {
  // Snapshot files before
  const filesBefore = new Set(readdirSync(live.tempDir).filter(f => /\.(html|css|js)$/.test(f)));

  // Record user message
  await query(
    `INSERT INTO designfast.iterate_messages (id, session_id, role, content) VALUES ($1, $2, 'user', $3)`,
    [randomUUID(), sessionId, message]
  );

  // Toggle text collection on the single permanent listener
  // (registered in handleStart) — no new listeners needed per send.
  live._assistantText = '';
  live._collectText = true;

  // NOTE: continueSession() expects ImageInput[] directly as the 3rd arg.
  await live.agent.continueSession(live.agentSessionId, message, images.length > 0 ? images : undefined);

  live._collectText = false;
  const assistantText = live._assistantText;

  // Determine changed/new files
  const filesAfter = readdirSync(live.tempDir).filter(f => /\.(html|css|js)$/.test(f));
  const filesChanged = filesAfter.filter(f => !filesBefore.has(f));

  // Record assistant message
  const content = assistantText.trim() || '(no text output)';
  await query(
    `INSERT INTO designfast.iterate_messages (id, session_id, role, content) VALUES ($1, $2, 'assistant', $3)`,
    [randomUUID(), sessionId, content]
  );

  // Update session usage in DB
  await query(
    `UPDATE designfast.iterate_sessions SET tokens_in = $2, tokens_out = $3, cost_usd = $4 WHERE id = $1`,
    [sessionId, live.totalTokensIn, live.totalTokensOut, live.totalCostUsd]
  );

  // Increment revision and save all files as a new snapshot
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

  return { revision: newRevision, content, filesChanged };
}
