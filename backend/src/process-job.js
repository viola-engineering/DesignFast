import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
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
import { PROVIDER_TO_APIKEY_PROVIDER, MODEL_MAP } from './models.js';
import { buildPrompt } from './prompt-builder.js';
import queen from './queen-client.js';

const MAX_TURNS = 50;

/**
 * Resolve the API key for a given user and provider.
 * First checks for a BYOK key in the DB, then falls back to env vars.
 *
 * @param {string} userId
 * @param {string} providerName - 'anthropic' | 'gemini'
 * @returns {Promise<string>} The API key
 */
async function resolveApiKey(userId, providerName) {
  // Map provider name to api_keys table provider label
  // e.g. 'gemini' -> 'google'
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

  // Fall back to environment variable
  // Find the env var name from MODEL_MAP
  const modelEntry = Object.values(MODEL_MAP).find(m => m.providerName === providerName);
  if (modelEntry && process.env[modelEntry.apiKeyEnv]) {
    return process.env[modelEntry.apiKeyEnv];
  }

  throw new Error(`No API key available for provider: ${providerName}`);
}

/**
 * Push an event to the designfast-events queue for SSE streaming.
 */
async function pushEvent(jobId, event) {
  try {
    await queen
      .queue('designfast-events')
      .partition(jobId)
      .push([{ data: { jobId, ...event, timestamp: Date.now() } }]);
  } catch (err) {
    console.error(`[process-job] Failed to push event for ${jobId}:`, err.message);
  }
}

/**
 * Process a single job message from the queue.
 *
 * @param {object} message - Queue message with job data
 */
export async function processJob(message) {
  const job = message.data || message;
  const { id: jobId, userId, provider, model, prompt, mode, styleKey, stylePrompt, version, fromJobId } = job;

  let tempDir;
  let agentDb;

  try {
    // Mark job as running
    await query(
      `UPDATE designfast.jobs SET status = 'running', started_at = NOW() WHERE id = $1`,
      [jobId]
    );

    await pushEvent(jobId, { type: 'status', status: 'running' });

    // Create temp working directory
    tempDir = mkdtempSync(join(tmpdir(), `designfast-${jobId}-`));

    // If fromJobId, write reference files into temp dir
    let fromFiles = null;
    if (fromJobId) {
      const { rows: refFiles } = await query(
        `SELECT filename, content FROM designfast.job_files WHERE job_id = $1`,
        [fromJobId]
      );
      if (refFiles.length > 0) {
        const { writeFileSync } = await import('node:fs');
        for (const f of refFiles) {
          writeFileSync(join(tempDir, f.filename), f.content, 'utf8');
        }
        fromFiles = refFiles.map(f => ({ filename: f.filename }));
      }
    }

    // Resolve API key (BYOK first, then env fallback)
    const apiKey = await resolveApiKey(userId, provider);

    // Create provider — name is 'anthropic' | 'gemini', NOT 'claude'
    const llmProvider = createProvider({
      name: provider,
      apiKey,
    });

    // Create per-agent SQLite DB (separate from Postgres!)
    agentDb = new DatabaseImpl();

    const tools = createDefaultRegistry();

    // Build the full prompt
    const fullPrompt = buildPrompt(
      { prompt, mode, styleKey, stylePrompt, version, fromFiles },
      tempDir
    );

    // Create AgentLoop — MUST pass providerName explicitly for gemini
    const agent = new AgentLoop({
      provider: llmProvider,
      tools,
      db: agentDb,
      workingDir: tempDir,
      maxTokens: 32768,
      maxTurns: MAX_TURNS,
      model,
      providerName: provider, // CRITICAL: defaults to 'anthropic' if omitted
    });

    // Track usage
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCostUsd = 0;

    // Stream events to Queen for SSE
    agent.on('event', (event) => {
      switch (event.type) {
        case 'text':
          pushEvent(jobId, { type: 'text', text: event.text });
          break;
        case 'tool_start':
          pushEvent(jobId, { type: 'tool_start', id: event.id, name: event.name, input: event.input });
          break;
        case 'tool_output':
          pushEvent(jobId, { type: 'tool_output', id: event.id, is_error: event.is_error });
          break;
        case 'usage':
          totalTokensIn += event.input_tokens || 0;
          totalTokensOut += event.output_tokens || 0;
          totalCostUsd += event.cost_usd || 0;
          pushEvent(jobId, {
            type: 'usage',
            input_tokens: event.input_tokens,
            output_tokens: event.output_tokens,
            cost_usd: event.cost_usd,
          });
          break;
        case 'error':
          pushEvent(jobId, { type: 'error', message: event.message });
          break;
      }
    });

    // Run the agent
    await agent.run(fullPrompt);

    // Read generated files from temp dir and store in Postgres
    const generatedFiles = readdirSync(tempDir).filter(f =>
      /\.(html|css|js)$/.test(f)
    );

    for (const filename of generatedFiles) {
      const content = readFileSync(join(tempDir, filename), 'utf8');
      await query(
        `INSERT INTO designfast.job_files (job_id, filename, content, size_bytes, revision)
         VALUES ($1, $2, $3, $4, 0)`,
        [jobId, filename, content, Buffer.byteLength(content, 'utf8')]
      );
    }

    // Calculate duration
    const { rows: [jobRow] } = await query(
      `SELECT started_at FROM designfast.jobs WHERE id = $1`,
      [jobId]
    );
    const durationMs = jobRow ? Date.now() - new Date(jobRow.started_at).getTime() : 0;

    // Mark job as done
    await query(
      `UPDATE designfast.jobs
       SET status = 'done', completed_at = NOW(),
           tokens_in = $2, tokens_out = $3, cost_usd = $4, duration_ms = $5
       WHERE id = $1`,
      [jobId, totalTokensIn, totalTokensOut, totalCostUsd, durationMs]
    );

    // Push done event with file list
    await pushEvent(jobId, { type: 'done', files: generatedFiles });

    // Check if all jobs for this generation are done, update generation status
    await updateGenerationStatus(job.generationId);

  } catch (err) {
    console.error(`[process-job] Job ${jobId} failed:`, err);

    // Mark job as failed
    await query(
      `UPDATE designfast.jobs SET status = 'failed', error_message = $2, completed_at = NOW() WHERE id = $1`,
      [jobId, err.message]
    ).catch(() => {});

    await pushEvent(jobId, { type: 'error', message: err.message });

    // Update generation status even on failure
    if (job.generationId) {
      await updateGenerationStatus(job.generationId).catch(() => {});
    }

    throw err;
  } finally {
    // Clean up temp dir
    if (tempDir) {
      try {
        rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    }
    // Close agent SQLite DB
    if (agentDb) {
      try {
        agentDb.close();
      } catch {}
    }
  }
}

/**
 * Check if all jobs for a generation are complete and update generation status.
 */
async function updateGenerationStatus(generationId) {
  if (!generationId) return;

  const { rows: [stats] } = await query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status IN ('done', 'failed')) AS finished,
       COUNT(*) FILTER (WHERE status = 'failed') AS failed
     FROM designfast.jobs WHERE generation_id = $1`,
    [generationId]
  );

  if (parseInt(stats.finished) === parseInt(stats.total)) {
    const status = parseInt(stats.failed) === parseInt(stats.total) ? 'failed' : 'done';
    await query(
      `UPDATE designfast.generations SET status = $2, completed_at = NOW() WHERE id = $1`,
      [generationId, status]
    );
  }
}
