# DesignFast Backend Plan

## Overview

Single Node.js process that runs the web server (API + static serving) and the job worker in the same process. When we need to scale, we split them into separate containers — the code is already separated by concern.

```
┌─────────────────────────────────────────────────────────────┐
│  Single Node.js Process                                      │
│                                                               │
│  ┌─────────────────────┐    ┌──────────────────────────┐     │
│  │  Web Server          │    │  Worker                   │     │
│  │  (Next.js / Fastify) │    │  (Queen consumer)         │     │
│  │                      │    │                            │     │
│  │  - Auth routes       │    │  - Consumes jobs from      │     │
│  │  - API routes        │    │    designfast-jobs queue    │     │
│  │  - SSE streaming     │    │  - Runs AgentLoop          │     │
│  │  - Preview serving   │    │  - Writes files to temp    │     │
│  │  - ZIP downloads     │    │  - Stores in Postgres      │     │
│  │                      │    │  - Pushes progress events   │     │
│  └──────────┬───────────┘    └──────────┬─────────────────┘     │
│             │                           │                       │
│             └───────────┬───────────────┘                       │
│                         │                                       │
│               ┌─────────▼──────────┐                            │
│               │  Queen Client       │                            │
│               │  (HTTP to Queen)    │                            │
│               └─────────┬──────────┘                            │
└─────────────────────────┼───────────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │  Queen Server (C++)    │
              │  HTTP :6632            │
              └───────────┬───────────┘
                          │
              ┌───────────▼───────────┐
              │  PostgreSQL            │
              │  - queen schema        │
              │  - designfast schema   │
              └───────────────────────┘
```

When scaling: run the web server and worker as separate containers. Same code, different entry points. Queen handles job distribution.

---

## Database Schema

All tables in a `designfast` schema. Queen manages its own tables separately.

### `users`

```sql
CREATE TABLE designfast.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  password_hash TEXT,                          -- bcrypt, null if OAuth-only
  github_id     TEXT UNIQUE,                   -- GitHub OAuth
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free',  -- free | starter | pro
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT,
  generations_used      INT NOT NULL DEFAULT 0,   -- current billing period
  generations_limit     INT NOT NULL DEFAULT 5,   -- based on plan
  billing_period_start  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `api_keys`

Users can optionally provide their own LLM keys (BYOK) to bypass plan limits.

```sql
CREATE TABLE designfast.api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES designfast.users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,      -- anthropic | google
  key_encrypted TEXT NOT NULL,    -- encrypted at rest
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);
```

### `generations`

One row per generation run (the user clicking "generate"). A generation produces 1-N jobs.

```sql
CREATE TABLE designfast.generations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES designfast.users(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL,
  mode        TEXT NOT NULL DEFAULT 'landing',   -- landing | webapp
  theme_mode  TEXT NOT NULL DEFAULT 'freestyle', -- explicit | auto | synth | freestyle
  synth_brief TEXT,                              -- if theme_mode=synth, the generated brief
  auto_selected TEXT[],                          -- if theme_mode=auto, which styles were picked
  status      TEXT NOT NULL DEFAULT 'pending',   -- pending | running | done | partial | failed
  job_count   INT NOT NULL DEFAULT 0,
  jobs_done   INT NOT NULL DEFAULT 0,
  jobs_failed INT NOT NULL DEFAULT 0,
  total_tokens_in   INT NOT NULL DEFAULT 0,
  total_tokens_out  INT NOT NULL DEFAULT 0,
  total_cost_usd    NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_generations_user ON designfast.generations(user_id, created_at DESC);
```

### `jobs`

One row per individual generation job (one style × one version × one model).

```sql
CREATE TABLE designfast.jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id   UUID NOT NULL REFERENCES designfast.generations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES designfast.users(id) ON DELETE CASCADE,
  style_key       TEXT NOT NULL,         -- minimalist | synth | freestyle | etc
  style_name      TEXT NOT NULL,         -- display name
  style_prompt    TEXT,                  -- the full style prompt sent to the agent
  model           TEXT NOT NULL,         -- claude-sonnet-4-6 | gemini-2.5-pro
  provider        TEXT NOT NULL,         -- anthropic | gemini
  version         INT NOT NULL DEFAULT 1,
  variation_nudge TEXT,                  -- creative direction for this version
  status          TEXT NOT NULL DEFAULT 'queued',  -- queued | running | done | failed
  error_message   TEXT,
  tokens_in       INT NOT NULL DEFAULT 0,
  tokens_out      INT NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(10,4) NOT NULL DEFAULT 0,
  duration_ms     INT,
  queen_tx_id     TEXT,                  -- queen message transaction ID for tracking
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_jobs_generation ON designfast.jobs(generation_id);
CREATE INDEX idx_jobs_status ON designfast.jobs(status) WHERE status IN ('queued', 'running');
```

### `job_files`

Generated files stored as text in Postgres. No shared filesystem needed.

```sql
CREATE TABLE designfast.job_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES designfast.jobs(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,          -- style.css | index.html | app.js | dashboard.html
  content     TEXT NOT NULL,
  size_bytes  INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, filename)
);

CREATE INDEX idx_job_files_job ON designfast.job_files(job_id);
```

### `iterate_sessions`

When a user iterates on a generated output via the chat interface.

```sql
CREATE TABLE designfast.iterate_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES designfast.jobs(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES designfast.users(id) ON DELETE CASCADE,
  model           TEXT NOT NULL,
  agent_session_id TEXT,               -- AgentLoop session ID for resume
  status          TEXT NOT NULL DEFAULT 'active',  -- active | closed
  tokens_in       INT NOT NULL DEFAULT 0,
  tokens_out      INT NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at       TIMESTAMPTZ
);
```

### `iterate_messages`

Chat history for iterate sessions.

```sql
CREATE TABLE designfast.iterate_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES designfast.iterate_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,           -- user | assistant
  content     TEXT NOT NULL,
  tokens_in   INT NOT NULL DEFAULT 0,
  tokens_out  INT NOT NULL DEFAULT 0,
  cost_usd    NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_iterate_messages_session ON designfast.iterate_messages(session_id, created_at);
```

---

## Queen Setup

### Queues

```javascript
// Job processing queue — partitioned by user for fairness
await queen.queue('designfast-jobs').config({
  retryLimit: 2,
  dlqAfterMaxRetries: true,
  leaseTime: 600,              // 10 minutes — webapp jobs can be long
}).create()

// Progress events — partitioned by job ID for SSE streaming
await queen.queue('designfast-events').config({
  ttl: 3600,                   // events expire after 1 hour
  retentionSeconds: 3600,
}).create()
```

### Why two queues

- **designfast-jobs**: durable work queue. Workers consume, process, ack/nack. Retries on failure. DLQ for inspection.
- **designfast-events**: ephemeral event stream. The SSE endpoint consumes per-job events. Short TTL — once the user has seen the result, events are disposable.

---

## Worker

The worker runs inside the same process as the web server. It's a function that starts consuming from Queen on boot.

### Entry point

```javascript
// worker.js
import { Queen } from 'queen-mq'
import { AgentLoop, createProvider, createDefaultRegistry, DatabaseImpl } from '@angycode/core'
import { db } from './db.js'  // Postgres connection (app tables)

const queen = new Queen(process.env.QUEEN_URL || 'http://localhost:6632')

export async function startWorker() {
  await queen
    .queue('designfast-jobs')
    .group('workers')
    .batch(10)                   // grab up to 10 jobs at once
    .concurrency(2)              // max 2 batches in-flight (= up to 20 concurrent agents)
    .renewLease(true, 5000)      // renew every 5s for long jobs
    .autoAck(false)
    .consume(async (messages) => {
      const results = await Promise.allSettled(
        messages.map(msg => processJob(msg))
      )

      const successes = messages.filter((_, i) => results[i].status === 'fulfilled')
      const failures = messages.filter((_, i) => results[i].status === 'rejected')

      if (successes.length) await queen.ack(successes, true, { group: 'workers' })
      if (failures.length) await queen.ack(failures, false, { group: 'workers' })
    })
}
```

### Job processor

```javascript
// process-job.js
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function processJob(message) {
  const job = message.data
  const tempDir = mkdtempSync(join(tmpdir(), `designfast-${job.jobId}-`))

  try {
    // 1. Update job status to running
    await db.query(
      `UPDATE designfast.jobs SET status = 'running', started_at = now() WHERE id = $1`,
      [job.jobId]
    )

    // 2. Push "running" event
    await pushEvent(job.jobId, { type: 'status', status: 'running' })

    // 3. Resolve API key (user's BYOK or platform key)
    const apiKey = await resolveApiKey(job.userId, job.provider)

    // 4. Create provider + agent
    const provider = createProvider({
      name: job.provider,
      apiKey,
      model: job.model,
    })

    const tools = createDefaultRegistry()
    const agentDb = new DatabaseImpl()

    const agent = new AgentLoop({
      provider,
      tools,
      db: agentDb,
      workingDir: tempDir,
      maxTokens: 32_768,
      maxTurns: job.mode === 'webapp' ? 80 : 50,
      model: job.model,
    })

    let tokensIn = 0
    let tokensOut = 0
    let costUsd = 0

    // 5. Stream events to Queen
    agent.on('event', async (event) => {
      if (event.type === 'usage') {
        tokensIn += event.input_tokens || 0
        tokensOut += event.output_tokens || 0
        costUsd += event.cost_usd || 0
      }
      await pushEvent(job.jobId, event)
    })

    // 6. Build prompt (same logic as test-multi.js)
    const prompt = buildPrompt(job, tempDir)

    // 7. Run agent
    await agent.run(prompt)
    agentDb.close()

    // 8. Read generated files from temp dir → store in Postgres
    const files = readdirSync(tempDir).filter(f => /\.(css|js|html)$/.test(f))
    for (const filename of files) {
      const content = readFileSync(join(tempDir, filename), 'utf-8')
      await db.query(
        `INSERT INTO designfast.job_files (job_id, filename, content, size_bytes)
         VALUES ($1, $2, $3, $4)`,
        [job.jobId, filename, content, Buffer.byteLength(content)]
      )
    }

    // 9. Update job status to done
    const durationMs = Date.now() - job.startedAt
    await db.query(
      `UPDATE designfast.jobs
       SET status = 'done', tokens_in = $2, tokens_out = $3,
           cost_usd = $4, duration_ms = $5, completed_at = now()
       WHERE id = $1`,
      [job.jobId, tokensIn, tokensOut, costUsd, durationMs]
    )

    // 10. Update generation counters
    await db.query(
      `UPDATE designfast.generations
       SET jobs_done = jobs_done + 1,
           total_tokens_in = total_tokens_in + $2,
           total_tokens_out = total_tokens_out + $3,
           total_cost_usd = total_cost_usd + $4,
           status = CASE
             WHEN jobs_done + 1 + jobs_failed >= job_count THEN 'done'
             ELSE 'running'
           END,
           completed_at = CASE
             WHEN jobs_done + 1 + jobs_failed >= job_count THEN now()
             ELSE NULL
           END
       WHERE id = $1`,
      [job.generationId, tokensIn, tokensOut, costUsd]
    )

    // 11. Push "done" event
    await pushEvent(job.jobId, { type: 'done', files: files })

  } catch (error) {
    // Update job as failed
    await db.query(
      `UPDATE designfast.jobs SET status = 'failed', error_message = $2, completed_at = now() WHERE id = $1`,
      [job.jobId, error.message]
    )
    await db.query(
      `UPDATE designfast.generations
       SET jobs_failed = jobs_failed + 1,
           status = CASE
             WHEN jobs_done + jobs_failed + 1 >= job_count THEN
               CASE WHEN jobs_done > 0 THEN 'partial' ELSE 'failed' END
             ELSE 'running'
           END
       WHERE id = $1`,
      [job.generationId]
    )
    await pushEvent(job.jobId, { type: 'error', message: error.message })
    throw error  // re-throw so Queen marks as failed and retries
  } finally {
    // Clean up temp dir
    rmSync(tempDir, { recursive: true, force: true })
  }
}

async function pushEvent(jobId, event) {
  await queen
    .queue('designfast-events')
    .partition(jobId)
    .push([{ data: { jobId, ...event, timestamp: Date.now() } }])
}

async function resolveApiKey(userId, provider) {
  // Check if user has BYOK key
  const result = await db.query(
    `SELECT key_encrypted FROM designfast.api_keys WHERE user_id = $1 AND provider = $2`,
    [userId, provider]
  )
  if (result.rows.length > 0) {
    return decrypt(result.rows[0].key_encrypted)
  }
  // Fall back to platform key
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY
  if (provider === 'gemini') return process.env.GOOGLE_API_KEY
  throw new Error(`No API key available for provider: ${provider}`)
}
```

### Prompt builder

Same logic as test-multi.js, extracted into a function:

```javascript
function buildPrompt(job, outputDir) {
  const baseInstructions = job.mode === 'webapp' ? WEBAPP_INSTRUCTIONS : LANDING_INSTRUCTIONS

  let prompt = baseInstructions

  // Reference design (--from equivalent)
  if (job.fromJobId) {
    // Handled differently in web — we write reference files to a subdir
    // and tell the agent to read them. See API section.
    prompt += job.fromReference
  }

  prompt += `\n\nWEBSITE TO CREATE:\n${job.prompt}`

  if (job.stylePrompt) {
    prompt += `\n\nDESIGN STYLE:\n${job.stylePrompt}`
  } else {
    prompt += `\n\nDESIGN STYLE:\nYou have complete creative freedom...`
  }

  if (job.variationNudge) {
    prompt += `\n\nCREATIVE DIRECTION:\n${job.variationNudge}`
  }

  if (job.mode === 'webapp') {
    prompt += `\n\nWrite ALL files into the current directory. Write style.css first, then app.js, then each HTML page starting with index.html.`
  } else {
    prompt += `\n\nWrite both files into the current directory. Write style.css first, then index.html.`
  }

  return prompt
}
```

---

## API Routes

### Auth

```
POST   /api/auth/register        { email, password, name }
POST   /api/auth/login            { email, password }
POST   /api/auth/github           { code }              -- GitHub OAuth callback
POST   /api/auth/logout
GET    /api/auth/me                                     -- current user + plan info
```

Auth via HTTP-only cookies with signed JWT. Sessions stored server-side in Postgres if needed, or stateless JWT with short expiry + refresh token.

### Generations

```
POST   /api/generations           -- create a new generation run
GET    /api/generations           -- list user's generations (paginated)
GET    /api/generations/:id       -- get generation with all jobs
DELETE /api/generations/:id       -- delete generation + files
```

#### `POST /api/generations`

This is the main endpoint. It:
1. Validates the user's plan limits
2. Runs theme-auto or theme-synth if requested (quick LLM call, synchronous)
3. Creates the generation + job rows in Postgres
4. Pushes all jobs to Queen
5. Returns immediately with the generation ID + job IDs

```json
// Request
{
  "prompt": "A smart building IoT platform",
  "mode": "landing",
  "themeMode": "auto",            // explicit | auto | synth | freestyle
  "styles": [],                    // only for themeMode=explicit
  "versions": 2,
  "models": ["claude"],
  "fromJobId": null                // optional: job ID to use as style reference
}

// Response
{
  "id": "gen_abc123",
  "status": "running",
  "jobs": [
    { "id": "job_001", "style": "warmCorporate", "model": "claude", "version": 1, "status": "queued" },
    { "id": "job_002", "style": "warmCorporate", "model": "claude", "version": 2, "status": "queued" },
    { "id": "job_003", "style": "cleanTech", "model": "claude", "version": 1, "status": "queued" },
    { "id": "job_004", "style": "cleanTech", "model": "claude", "version": 2, "status": "queued" }
  ]
}
```

#### Flow inside `POST /api/generations`

```
1. Check user.generations_used < user.generations_limit (or BYOK)
2. If themeMode === 'auto':
     Run resolveThemeAuto(prompt, model) → returns style keys
     Store in generation.auto_selected
3. If themeMode === 'synth':
     Run resolveThemeSynth(prompt, model) → returns style brief
     Store in generation.synth_brief
4. Build job matrix: styles × versions × models
5. INSERT generation row
6. INSERT job rows (status: 'queued')
7. For each job: push to Queen
     queen.queue('designfast-jobs')
       .partition(userId)
       .push([{ data: { jobId, generationId, userId, prompt, ... } }])
8. Increment user.generations_used
9. Return generation + jobs
```

### Jobs

```
GET    /api/jobs/:id              -- job status + metadata
GET    /api/jobs/:id/files        -- list files for a completed job
GET    /api/jobs/:id/events       -- SSE stream of progress events
```

#### `GET /api/jobs/:id/events` (SSE)

Server-Sent Events endpoint. The client connects and receives real-time progress.

```javascript
// SSE endpoint
app.get('/api/jobs/:id/events', async (req, res) => {
  const jobId = req.params.id

  // Verify user owns this job
  // ...

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  // Consume from Queen events partition for this job
  // subscriptionMode 'all' replays from start (handles late connections)
  const consumer = await queen
    .queue('designfast-events')
    .partition(jobId)
    .group(`sse-${jobId}-${Date.now()}`)   // unique group per SSE connection
    .subscriptionMode('all')
    .autoAck(true)
    .consume(async (msg) => {
      res.write(`data: ${JSON.stringify(msg.data)}\n\n`)

      // If job is done or failed, close the stream
      if (msg.data.type === 'done' || msg.data.type === 'error') {
        res.end()
      }
    })

  // Clean up on client disconnect
  req.on('close', () => {
    consumer.stop()
  })
})
```

### Preview & Download

```
GET    /preview/:jobId/:filename  -- serve a generated file (for iframe preview)
GET    /api/jobs/:id/download     -- download all files as ZIP
```

#### `GET /preview/:jobId/:filename`

Serves generated files from Postgres with correct MIME types. Used by the frontend iframe.

```javascript
app.get('/preview/:jobId/:filename', async (req, res) => {
  const { jobId, filename } = req.params

  const result = await db.query(
    `SELECT content FROM designfast.job_files WHERE job_id = $1 AND filename = $2`,
    [jobId, filename]
  )

  if (!result.rows.length) return res.status(404).end()

  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
  }
  const ext = filename.substring(filename.lastIndexOf('.'))
  res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.send(result.rows[0].content)
})
```

#### `GET /api/jobs/:id/download`

Streams a ZIP file containing all generated files for a job.

```javascript
import archiver from 'archiver'

app.get('/api/jobs/:id/download', async (req, res) => {
  const jobId = req.params.id

  const files = await db.query(
    `SELECT filename, content FROM designfast.job_files WHERE job_id = $1`,
    [jobId]
  )

  if (!files.rows.length) return res.status(404).end()

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="designfast-${jobId}.zip"`)

  const archive = archiver('zip')
  archive.pipe(res)
  for (const file of files.rows) {
    archive.append(file.content, { name: file.filename })
  }
  archive.finalize()
})
```

### Iterate

```
POST   /api/iterate/:jobId/start     -- start an iterate session on a job
POST   /api/iterate/:sessionId/send  -- send a message in an iterate session
POST   /api/iterate/:sessionId/close -- close the session
GET    /api/iterate/:sessionId        -- get session + message history
```

#### `POST /api/iterate/:jobId/start`

1. Read all files for the job from `job_files`
2. Write them to a temp dir
3. Create an AgentLoop with the temp dir as working directory
4. Run the initial prompt (same as CLI iterate — tells agent to read the files)
5. Store the AgentLoop session ID
6. Return the iterate session ID

#### `POST /api/iterate/:sessionId/send`

```json
// Request
{ "message": "make the sidebar collapsible on mobile" }

// Response (SSE stream or JSON)
{
  "role": "assistant",
  "content": "Updated style.css with a mobile media query...",
  "filesChanged": ["style.css"]
}
```

1. Resume the AgentLoop via `agent.continueSession(sessionId, message)`
2. Stream events back via SSE (or return JSON after completion)
3. After agent finishes: read changed files from temp dir, update `job_files` in Postgres
4. Store the message in `iterate_messages`

#### File sync after iterate

After each iterate message completes, we diff the temp dir against `job_files`:

```javascript
async function syncFilesAfterIterate(jobId, tempDir) {
  const currentFiles = readdirSync(tempDir).filter(f => /\.(css|js|html)$/.test(f))

  for (const filename of currentFiles) {
    const content = readFileSync(join(tempDir, filename), 'utf-8')
    await db.query(
      `INSERT INTO designfast.job_files (job_id, filename, content, size_bytes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (job_id, filename) DO UPDATE SET content = $3, size_bytes = $4`,
      [jobId, filename, content, Buffer.byteLength(content)]
    )
  }
}
```

### Account & Billing

```
GET    /api/account               -- user profile + usage stats
PATCH  /api/account               -- update name, etc
POST   /api/account/api-keys      -- save BYOK API key
DELETE /api/account/api-keys/:provider
POST   /api/billing/checkout      -- create Stripe checkout session
POST   /api/billing/portal        -- create Stripe billing portal link
POST   /api/billing/webhook       -- Stripe webhook handler
```

---

## Plans & Limits

```
free:     5 generations/month,  models: [claude, gemini], max versions: 1, max styles: 1
starter:  50 generations/month, models: [claude, gemini], max versions: 3, max styles: 5,  $19/mo
pro:      200 generations/month, models: [claude, gemini], max versions: 5, max styles: all, $49/mo
byok:     unlimited (user's own API keys), all features
```

A "generation" is one `POST /api/generations` call, regardless of how many jobs it produces. A user on `starter` who generates 3 styles × 2 versions = 6 jobs uses 1 generation from their quota.

### Limit enforcement

```javascript
async function checkGenerationLimits(user, request) {
  // BYOK users have no limits
  const hasByok = await hasApiKeys(user.id, request.models)
  if (hasByok) return { allowed: true }

  // Check monthly quota
  if (user.generations_used >= user.generations_limit) {
    return { allowed: false, reason: 'Monthly generation limit reached' }
  }

  // Check plan feature limits
  const plan = PLANS[user.plan]
  if (request.versions > plan.maxVersions) {
    return { allowed: false, reason: `Your plan allows up to ${plan.maxVersions} versions` }
  }
  if (request.styles.length > plan.maxStyles) {
    return { allowed: false, reason: `Your plan allows up to ${plan.maxStyles} styles per generation` }
  }

  return { allowed: true }
}
```

---

## --from (Style Reference) in Web Context

When a user clicks "use this style" on a previous generation, the frontend sends `fromJobId` in the request. The job processor:

1. Reads the reference job's files from `job_files` table
2. Writes them to a `_reference/` subdir in the temp dir
3. Builds the reference prompt pointing at those files (same as CLI `--from`)

```javascript
if (job.fromJobId) {
  const refFiles = await db.query(
    `SELECT filename, content FROM designfast.job_files WHERE job_id = $1`,
    [job.fromJobId]
  )
  const refDir = join(tempDir, '_reference')
  mkdirSync(refDir)
  for (const file of refFiles.rows) {
    writeFileSync(join(refDir, file.filename), file.content)
  }
  // Agent prompt tells it to read from _reference/ directory
}
```

---

## Theme Auto/Synth in Web Context

These run synchronously during `POST /api/generations`, before jobs are queued. They use the same `resolveThemeAuto()` and `resolveThemeSynth()` functions from test-multi.js. They're fast (3-10 seconds) and cheap ($0.01-0.05), so running them inline is fine.

If they become a latency concern, they could be moved to a separate quick-response queue, but for MVP this is unnecessary.

---

## Single Process Startup

```javascript
// server.js — single entry point
import Fastify from 'fastify'
import { startWorker } from './worker.js'
import { registerRoutes } from './routes.js'
import { initQueues } from './queen-setup.js'

const app = Fastify()

// Register all API routes
await registerRoutes(app)

// Initialize Queen queues (idempotent)
await initQueues()

// Start the worker (background consumer)
startWorker()

// Start the web server
await app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
console.log('DesignFast running on :3000 (server + worker)')
```

When splitting later:

```javascript
// web.js — web server only
const app = Fastify()
await registerRoutes(app)
await app.listen({ port: 3000, host: '0.0.0.0' })

// worker.js — worker only
await initQueues()
startWorker()
```

Same code, different entry points. No refactoring needed.

---

## Environment Variables

```bash
# Postgres
DATABASE_URL=postgres://user:pass@localhost:5432/designfast

# Queen
QUEEN_URL=http://localhost:6632

# Platform LLM keys (used when user has no BYOK)
ANTHROPIC_API_KEY=sk-...
GOOGLE_API_KEY=AIza...

# Auth
JWT_SECRET=...
ENCRYPTION_KEY=...          # for encrypting stored BYOK API keys

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...

# Server
PORT=3000
NODE_ENV=production
```

---

## File Cleanup

Generated files in Postgres accumulate. A daily cron (or pg_cron) cleans up:

```sql
-- Delete files for generations older than 30 days for free users
DELETE FROM designfast.job_files
WHERE job_id IN (
  SELECT j.id FROM designfast.jobs j
  JOIN designfast.generations g ON j.generation_id = g.id
  JOIN designfast.users u ON g.user_id = u.id
  WHERE u.plan = 'free' AND g.created_at < now() - interval '30 days'
);

-- Delete files for generations older than 90 days for paid users
DELETE FROM designfast.job_files
WHERE job_id IN (
  SELECT j.id FROM designfast.jobs j
  JOIN designfast.generations g ON j.generation_id = g.id
  JOIN designfast.users u ON g.user_id = u.id
  WHERE u.plan != 'free' AND g.created_at < now() - interval '90 days'
);
```

Or simpler: a `retention_until` column on `generations` set at creation time based on plan. One cleanup query:

```sql
DELETE FROM designfast.generations WHERE retention_until < now();
-- CASCADE deletes jobs, job_files, iterate_sessions, iterate_messages
```

---

## Error Handling & Resilience

### Job failures

Queen handles retries (2 attempts). After max retries, job goes to DLQ. The job status is set to `failed` with the error message. The generation status becomes `partial` (some jobs succeeded) or `failed` (all jobs failed).

### Iterate session recovery

If the server crashes mid-iterate, the AgentLoop session is lost (it's in-memory). The `job_files` table has the last synced state. The user can start a new iterate session — it reads the current files from Postgres, so no work is lost.

### Worker concurrency

The `.concurrency(2)` on the Queen consumer means at most 2 batches of 10 jobs = 20 concurrent AgentLoops. Each AgentLoop holds one LLM connection. Tune based on:
- VM memory (each agent uses ~50-100MB)
- LLM API rate limits (Anthropic: ~50 concurrent requests per org)
- CPU (minimal — agents are I/O bound waiting for LLM responses)

For a single VM with 4GB RAM, `concurrency(2)` with `batch(5)` is conservative. Scale up from there.