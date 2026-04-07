import { randomUUID } from 'node:crypto';
import { query, db } from '../db.js';
import { authMiddleware } from '../auth.js';
import { checkUsageLimits, hasApiKeys, CREDIT_COSTS } from '../plans.js';
import { MODEL_MAP, PROVIDER_TO_APIKEY_PROVIDER } from '../models.js';
import { STYLES, resolveThemeAuto, resolveThemeSynth } from '../prompt-builder.js';
import queen from '../queen-client.js';
import { decrypt } from '../encryption.js';
import { requireUUID } from '../validation.js';

const VALID_MODES = ['landing', 'webapp'];
const VALID_THEME_MODES = ['explicit', 'auto', 'synth', 'freestyle'];
const VALID_MODEL_KEYS = Object.keys(MODEL_MAP);

/**
 * Resolve API key for a provider — BYOK first, then env fallback.
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

export default async function (app) {
  app.addHook('onRequest', authMiddleware);

  // POST /api/generations
  app.post('/api/generations', async (req, reply) => {
    const {
      prompt,
      mode = 'landing',
      themeMode = 'freestyle',
      styles: requestedStyles,
      versions = 1,
      models,
      fromJobId = null,
      uploadIds = [],
    } = req.body || {};

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return reply.code(400).send({ error: 'Prompt is required' });
    }
    if (prompt.trim().length > 2000) {
      return reply.code(400).send({ error: 'Prompt must be 2000 characters or fewer' });
    }
    if (!VALID_MODES.includes(mode)) {
      return reply.code(400).send({ error: `Mode must be one of: ${VALID_MODES.join(', ')}` });
    }
    if (!VALID_THEME_MODES.includes(themeMode)) {
      return reply.code(400).send({ error: `themeMode must be one of: ${VALID_THEME_MODES.join(', ')}` });
    }
    if (!Number.isInteger(versions) || versions < 1) {
      return reply.code(400).send({ error: 'Versions must be a positive integer' });
    }
    if (!Array.isArray(models) || models.length === 0) {
      return reply.code(400).send({ error: 'Models is required and must be a non-empty array' });
    }
    const invalidModels = models.filter(m => !VALID_MODEL_KEYS.includes(m));
    if (invalidModels.length > 0) {
      return reply.code(400).send({ error: `Invalid models: ${invalidModels.join(', ')}` });
    }
    if (themeMode === 'explicit') {
      if (!Array.isArray(requestedStyles) || requestedStyles.length === 0) {
        return reply.code(400).send({ error: 'Styles are required when themeMode is explicit' });
      }
      const invalidStyles = requestedStyles.filter(s => !STYLES[s]);
      if (invalidStyles.length > 0) {
        return reply.code(400).send({ error: `Invalid styles: ${invalidStyles.join(', ')}` });
      }
    }

    // Validate uploadIds
    req.log.info({ uploadIds, uploadIdsLength: uploadIds?.length }, 'Generation: uploadIds received');
    if (!Array.isArray(uploadIds)) {
      return reply.code(400).send({ error: 'uploadIds must be an array' });
    }
    if (uploadIds.length > 0) {
      const { rows: validUploads } = await query(
        `SELECT id, purpose FROM designfast.uploads WHERE id = ANY($1) AND user_id = $2`,
        [uploadIds, req.userId]
      );
      if (validUploads.length !== uploadIds.length) {
        return reply.code(400).send({ error: 'One or more uploadIds are invalid' });
      }
    }

    // Get user for limit check
    const { rows: [user] } = await query(
      `SELECT * FROM designfast.users WHERE id = $1`,
      [req.userId]
    );

    // Resolve styles based on themeMode
    let styles = [];
    let autoSelected = null;
    let synthBrief = null;

    if (themeMode === 'explicit') {
      styles = requestedStyles.map(key => ({
        key,
        name: STYLES[key].name,
        prompt: STYLES[key].prompt,
      }));
    } else if (themeMode === 'auto') {
      // Use first model's provider for the auto-selector
      const firstModel = MODEL_MAP[models[0]];
      const apiKey = await getApiKey(req.userId, firstModel.providerName);
      if (!apiKey) {
        return reply.code(400).send({ error: `No API key available for ${firstModel.providerName}` });
      }
      const keys = await resolveThemeAuto(prompt, firstModel.model, firstModel.providerName, apiKey);
      if (keys.length > 0) {
        styles = keys.map(key => ({
          key,
          name: STYLES[key].name,
          prompt: STYLES[key].prompt,
        }));
        autoSelected = keys;
      }
    } else if (themeMode === 'synth') {
      const firstModel = MODEL_MAP[models[0]];
      const apiKey = await getApiKey(req.userId, firstModel.providerName);
      if (!apiKey) {
        return reply.code(400).send({ error: `No API key available for ${firstModel.providerName}` });
      }
      const brief = await resolveThemeSynth(prompt, firstModel.model, firstModel.providerName, apiKey);
      if (brief) {
        synthBrief = brief;
        styles = [{ key: 'synth', name: 'Custom Style', prompt: brief }];
      }
    }

    // Freestyle: no style constraint — single entry with no style prompt
    if (styles.length === 0) {
      styles = [{ key: 'freestyle', name: 'Freestyle', prompt: '' }];
    }

    // Determine BYOK status
    const providerNames = models.map(m => MODEL_MAP[m].providerName);
    const isByok = await hasApiKeys(req.userId, providerNames);

    // Check limits
    const limitCheck = checkUsageLimits(user, { models, versions, styles, isByok }, MODEL_MAP);
    if (!limitCheck.allowed) {
      return reply.code(403).send({ error: limitCheck.error });
    }

    // Build job matrix: styles × versions × models
    const generationId = randomUUID();
    const jobs = [];

    for (const style of styles) {
      for (let v = 1; v <= versions; v++) {
        for (const modelKey of models) {
          const modelCfg = MODEL_MAP[modelKey];
          jobs.push({
            id: randomUUID(),
            generationId,
            userId: req.userId,
            styleKey: style.key,
            styleName: style.name,
            stylePrompt: style.prompt,
            version: v,
            model: modelCfg.model,
            provider: modelCfg.providerName,
            prompt: prompt.trim(),
            mode,
            fromJobId,
            billingMode: limitCheck.billingMode,
            creditCost: limitCheck.billingMode === 'credits'
              ? (CREDIT_COSTS[modelCfg.providerName] || 0)
              : 0,
            uploadIds,
          });
        }
      }
    }

    // Wrap generation + job inserts + Queen push in a transaction
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // INSERT generation
      await client.query(
        `INSERT INTO designfast.generations (id, user_id, prompt, mode, theme_mode, auto_selected, synth_brief, status, job_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'running', $8)`,
        [generationId, req.userId, prompt.trim(), mode, themeMode, autoSelected ? JSON.stringify(autoSelected) : null, synthBrief, jobs.length]
      );

      // INSERT jobs
      for (const job of jobs) {
        await client.query(
          `INSERT INTO designfast.jobs (id, generation_id, user_id, style_key, style_name, model, provider, version, status, prompt, mode)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'queued', $9, $10)`,
          [job.id, generationId, req.userId, job.styleKey, job.styleName, job.model, job.provider, job.version, job.prompt, job.mode]
        );
      }

      // Link uploads to each job
      if (uploadIds.length > 0) {
        req.log.info({ uploadIds, jobCount: jobs.length }, 'Generation: linking uploads to jobs');
        for (const job of jobs) {
          for (const uploadId of uploadIds) {
            // Look up purpose from the uploads table
            const { rows: [upload] } = await client.query(
              `SELECT purpose FROM designfast.uploads WHERE id = $1`,
              [uploadId]
            );
            req.log.info({ jobId: job.id, uploadId, purpose: upload?.purpose }, 'Generation: linking upload');
            await client.query(
              `INSERT INTO designfast.job_uploads (job_id, upload_id, purpose)
               VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [job.id, uploadId, upload.purpose]
            );
          }
        }
        req.log.info('Generation: uploads linked successfully');
      } else {
        req.log.info('Generation: no uploadIds to link');
      }

      // Push jobs to Queen — if this fails, the transaction is rolled back
      try {
        for (const job of jobs) {
          await queen
            .queue('designfast-jobs')
            .partition(job.id)
            .push([{ data: job }]);
        }
      } catch (queenErr) {
        await client.query('ROLLBACK');
        req.log.error({ err: queenErr }, 'Failed to push jobs to Queen');
        return reply.code(502).send({ error: 'Job queue unavailable, please try again later' });
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }

    return reply.code(201).send({
      id: generationId,
      status: 'running',
      jobs: jobs.map(j => ({
        id: j.id,
        styleKey: j.styleKey,
        styleName: j.styleName,
        model: j.model,
        version: j.version,
        status: 'queued',
      })),
    });
  });

  // GET /api/generations
  app.get('/api/generations', async (req) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { rows: [{ count }] } = await query(
      `SELECT COUNT(*) FROM designfast.generations WHERE user_id = $1`,
      [req.userId]
    );

    const { rows } = await query(
      `SELECT g.*,
        (SELECT COUNT(*) FROM designfast.jobs WHERE generation_id = g.id AND status = 'done') AS jobs_done,
        (SELECT COUNT(*) FROM designfast.jobs WHERE generation_id = g.id AND status = 'failed') AS jobs_failed
       FROM designfast.generations g
       WHERE g.user_id = $1
       ORDER BY g.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    return {
      generations: rows.map(r => ({
        id: r.id,
        prompt: r.prompt,
        mode: r.mode,
        themeMode: r.theme_mode,
        status: r.status,
        jobCount: r.job_count,
        jobsDone: parseInt(r.jobs_done),
        jobsFailed: parseInt(r.jobs_failed),
        createdAt: r.created_at,
        completedAt: r.completed_at,
      })),
      total: parseInt(count),
    };
  });

  // GET /api/generations/:id
  app.get('/api/generations/:id', async (req, reply) => {
    if (requireUUID(req.params.id, reply)) return;

    const { rows: gens } = await query(
      `SELECT * FROM designfast.generations WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (gens.length === 0) {
      return reply.code(404).send({ error: 'Generation not found' });
    }

    const gen = gens[0];

    const { rows: jobs } = await query(
      `SELECT * FROM designfast.jobs WHERE generation_id = $1 ORDER BY created_at`,
      [gen.id]
    );

    const jobsDone = jobs.filter(j => j.status === 'done').length;
    const jobsFailed = jobs.filter(j => j.status === 'failed').length;
    const totalCredits = jobs
      .filter(j => j.status === 'done')
      .reduce((s, j) => s + (CREDIT_COSTS[j.provider] || 0), 0);

    return {
      id: gen.id,
      prompt: gen.prompt,
      mode: gen.mode,
      themeMode: gen.theme_mode,
      autoSelected: gen.auto_selected || null,
      synthBrief: gen.synth_brief,
      status: gen.status,
      jobCount: gen.job_count,
      jobsDone,
      jobsFailed,
      totalCredits,
      createdAt: gen.created_at,
      completedAt: gen.completed_at,
      jobs: jobs.map(j => ({
        id: j.id,
        styleKey: j.style_key,
        styleName: j.style_name,
        model: j.model,
        provider: j.provider,
        version: j.version,
        status: j.status,
        creditCost: CREDIT_COSTS[j.provider] || 0,
        durationMs: j.duration_ms,
        createdAt: j.created_at,
        completedAt: j.completed_at,
      })),
    };
  });

  // DELETE /api/generations/:id
  app.delete('/api/generations/:id', async (req, reply) => {
    if (requireUUID(req.params.id, reply)) return;

    const { rowCount } = await query(
      `DELETE FROM designfast.generations WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (rowCount === 0) {
      return reply.code(404).send({ error: 'Generation not found' });
    }

    return { ok: true };
  });
}
