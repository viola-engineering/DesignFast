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
import { PROVIDER_TO_APIKEY_PROVIDER, MODEL_MAP } from './models.js';
import { buildPrompt } from './prompt-builder.js';
import queen from './queen-client.js';

const MAX_TURNS = { landing: 50, webapp: 100 };

/**
 * Maximum USD cost per job before the agent is aborted.
 * Prevents runaway token consumption from a single generation.
 */
const MAX_COST_USD = { landing: 1.0, webapp: 4.0 };

/**
 * Error types that are fatal and should not be retried.
 * These indicate configuration/billing issues, not transient failures.
 */
const FATAL_ERROR_TYPES = [
  'invalid_request_error',  // Bad request, insufficient credits, invalid params
  'authentication_error',   // Invalid API key
  'permission_error',       // No permission to access resource
  'not_found_error',        // Model or resource not found
];

/**
 * Generic user-facing error message.
 * We don't expose internal API details to users.
 */
const USER_ERROR_MESSAGE = 'An internal error occurred. Please try again later.';

/**
 * Parse an error message to extract the API error type.
 * Message format: "400 {"type":"error","error":{"type":"invalid_request_error",...}}"
 *
 * @param {string} message - The error message
 * @returns {{ httpStatus: number|null, errorType: string|null, isFatal: boolean, userMessage: string }}
 */
function parseApiError(message) {
  const result = {
    httpStatus: null,
    errorType: null,
    isFatal: false,
    userMessage: USER_ERROR_MESSAGE,
  };

  if (!message || typeof message !== 'string') {
    return result;
  }

  // Try to extract HTTP status and JSON body
  const match = message.match(/^(\d{3})\s*(\{.+\})$/s);
  if (match) {
    result.httpStatus = parseInt(match[1], 10);
    try {
      const body = JSON.parse(match[2]);
      result.errorType = body?.error?.type || body?.type || null;
    } catch {
      // JSON parse failed, not a structured API error
    }
  }

  // Check if this is a fatal error
  if (result.errorType && FATAL_ERROR_TYPES.includes(result.errorType)) {
    result.isFatal = true;
  }

  // Also treat 401/403 as fatal regardless of body
  if (result.httpStatus === 401 || result.httpStatus === 403) {
    result.isFatal = true;
  }

  return result;
}

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
  const { id: jobId, userId, provider, model, prompt, mode, styleKey, stylePrompt, version, variationNudge, fromJobId, billingMode, creditCost, uploadIds = [] } = job;

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
        for (const f of refFiles) {
          writeFileSync(join(tempDir, f.filename), f.content, 'utf8');
        }
        fromFiles = refFiles.map(f => ({ filename: f.filename }));
      }
    }

    // ── Fetch uploads linked to this job ���─────────────────────────────
    // Read from job_uploads to ensure consistency with download endpoint
    // (purpose is captured at link-time, not read from uploads table at run-time)
    const referenceImages = []; // ImageInput[] for LLM vision
    const assetMeta = [];       // metadata for prompt builder

    const { rows: uploads } = await query(
      `SELECT u.id, u.filename, u.content_type, u.size_bytes, u.width, u.height, u.data, ju.purpose
       FROM designfast.job_uploads ju
       JOIN designfast.uploads u ON u.id = ju.upload_id
       WHERE ju.job_id = $1`,
      [jobId]
    );

    if (uploads.length > 0) {

      for (const u of uploads) {
        if (u.purpose === 'reference') {
          // Reference image → pass to LLM as base64 vision input
          referenceImages.push({
            data: u.data.toString('base64'),
            mimeType: u.content_type,
          });
        } else if (u.purpose === 'asset') {
          // Asset image → write to tempDir/assets/ for the agent
          const assetsDir = join(tempDir, 'assets');
          mkdirSync(assetsDir, { recursive: true });
          writeFileSync(join(assetsDir, u.filename), u.data);
          assetMeta.push({
            filename: u.filename,
            width: u.width,
            height: u.height,
            sizeBytes: u.size_bytes,
          });
        }
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
      { prompt, mode, styleKey, stylePrompt, version, variationNudge, fromFiles,
        hasReferenceImages: referenceImages.length > 0, assets: assetMeta },
      tempDir
    );

    // Create AgentLoop — MUST pass providerName explicitly for gemini
    const agent = new AgentLoop({
      provider: llmProvider,
      tools,
      db: agentDb,
      workingDir: tempDir,
      maxTokens: 32768,
      maxTurns: MAX_TURNS[mode] || MAX_TURNS.landing,
      model,
      providerName: provider, // CRITICAL: defaults to 'anthropic' if omitted
    });

    // Track usage
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCostUsd = 0;

    // Track fatal errors that should fail the job
    let fatalError = null;

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
        case 'usage': {
          totalTokensIn += event.input_tokens || 0;
          totalTokensOut += event.output_tokens || 0;
          totalCostUsd += event.cost_usd || 0;
          const costCap = MAX_COST_USD[mode] || MAX_COST_USD.landing;
          if (totalCostUsd >= costCap) {
            console.warn(`[process-job] Job ${jobId} hit cost cap ($${totalCostUsd.toFixed(2)} >= $${costCap}), aborting`);
            agent.abort();
          }
          break;
        }
        case 'error': {
          const parsed = parseApiError(event.message);
          pushEvent(jobId, {
            type: 'error',
            message: parsed.userMessage,  // User-friendly message
            rawMessage: event.message,    // Full raw error for debugging
            errorType: parsed.errorType,
            isFatal: parsed.isFatal,
          });
          // Store fatal error to throw after agent.run() completes
          if (parsed.isFatal && !fatalError) {
            fatalError = parsed.userMessage;
          }
          break;
        }
        case 'done':
          // If agent stopped due to error, check if we should fail the job
          if (event.stop_reason === 'error' && fatalError) {
            // Will be handled after agent.run() returns
          }
          break;
      }
    });

    // Run the agent (with reference images if provided)
    // NOTE: AgentLoop.run() expects ImageInput[] directly as the 2nd arg,
    // NOT wrapped in { images }. The .d.ts is misleading.
    await agent.run(fullPrompt, referenceImages.length > 0 ? referenceImages : undefined);

    // If a fatal error occurred during generation, fail the job
    if (fatalError) {
      throw new Error(fatalError);
    }

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

    // Deduct credits/generations based on billing mode
    if (billingMode === 'credits' && creditCost > 0) {
      await query(
        `UPDATE designfast.users SET credits_used = credits_used + $2 WHERE id = $1`,
        [userId, creditCost]
      );
    } else if (billingMode === 'byok') {
      await query(
        `UPDATE designfast.users SET byok_generations_used = byok_generations_used + 1 WHERE id = $1`,
        [userId]
      );
    } else if (billingMode === 'generation') {
      await query(
        `UPDATE designfast.users SET generations_used = generations_used + 1 WHERE id = $1`,
        [userId]
      );
    }

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
