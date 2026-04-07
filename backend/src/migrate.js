import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `
CREATE SCHEMA IF NOT EXISTS designfast;

CREATE TABLE IF NOT EXISTS designfast.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  plan text NOT NULL DEFAULT 'free',
  avatar_url text,
  generations_used int NOT NULL DEFAULT 0,
  generations_limit int NOT NULL DEFAULT 3,
  credits_used int NOT NULL DEFAULT 0,
  credits_limit int NOT NULL DEFAULT 0,
  byok_generations_used int NOT NULL DEFAULT 0,
  billing_period_start timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS designfast.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES designfast.users ON DELETE CASCADE,
  provider text NOT NULL,
  key_encrypted text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS designfast.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES designfast.users ON DELETE CASCADE,
  prompt text NOT NULL,
  mode text NOT NULL DEFAULT 'landing',
  theme_mode text NOT NULL DEFAULT 'freestyle',
  auto_selected jsonb,
  synth_brief text,
  status text NOT NULL DEFAULT 'running',
  job_count int NOT NULL DEFAULT 0,
  jobs_done int NOT NULL DEFAULT 0,
  jobs_failed int NOT NULL DEFAULT 0,
  total_tokens_in int NOT NULL DEFAULT 0,
  total_tokens_out int NOT NULL DEFAULT 0,
  total_cost_usd numeric(10,4) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS designfast.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES designfast.generations ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES designfast.users ON DELETE CASCADE,
  style_key text NOT NULL,
  style_name text NOT NULL,
  model text NOT NULL,
  provider text NOT NULL,
  prompt text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'landing',
  version int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'queued',
  error_message text,
  tokens_in int NOT NULL DEFAULT 0,
  tokens_out int NOT NULL DEFAULT 0,
  cost_usd numeric(10,4) NOT NULL DEFAULT 0,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS designfast.job_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES designfast.jobs ON DELETE CASCADE,
  filename text NOT NULL,
  content text NOT NULL,
  size_bytes int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, filename)
);

CREATE TABLE IF NOT EXISTS designfast.iterate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES designfast.jobs ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES designfast.users ON DELETE CASCADE,
  model text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  tokens_in int NOT NULL DEFAULT 0,
  tokens_out int NOT NULL DEFAULT 0,
  cost_usd numeric(10,4) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS designfast.iterate_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES designfast.iterate_sessions ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_generation_id ON designfast.jobs(generation_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON designfast.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_job_files_job_id ON designfast.job_files(job_id);
CREATE INDEX IF NOT EXISTS idx_iterate_sessions_job_id ON designfast.iterate_sessions(job_id);
CREATE INDEX IF NOT EXISTS idx_iterate_sessions_user_id ON designfast.iterate_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_iterate_messages_session_id ON designfast.iterate_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON designfast.api_keys(user_id);
`;

const MIGRATIONS = `
-- Add revision tracking to job_files
DO $$ BEGIN
  ALTER TABLE designfast.job_files ADD COLUMN revision int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Replace unique constraint: (job_id, filename) -> (job_id, filename, revision)
DROP INDEX IF EXISTS designfast.idx_job_files_job_filename;
DO $$ BEGIN
  ALTER TABLE designfast.job_files DROP CONSTRAINT IF EXISTS job_files_job_id_filename_key;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE designfast.job_files ADD CONSTRAINT job_files_job_revision_filename_key UNIQUE (job_id, filename, revision);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_job_files_job_revision ON designfast.job_files(job_id, revision);

-- Add latest_revision counter to jobs
DO $$ BEGIN
  ALTER TABLE designfast.jobs ADD COLUMN latest_revision int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Credit system: add credits_used, credits_limit, byok_generations_used
DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN credits_used int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN credits_limit int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN byok_generations_used int NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update defaults for free plan (3 generations, not 5)
ALTER TABLE designfast.users ALTER COLUMN generations_limit SET DEFAULT 3;

-- Migrate existing starter users to free
UPDATE designfast.users SET plan = 'free', generations_limit = 3 WHERE plan = 'starter';

-- Set credits_limit for existing pro users
UPDATE designfast.users SET credits_limit = 100 WHERE plan = 'pro';

-- Update existing free users to new limit
UPDATE designfast.users SET generations_limit = 3 WHERE plan = 'free' AND generations_limit = 5;

-- Uploads: image storage for reference designs and user assets
CREATE TABLE IF NOT EXISTS designfast.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES designfast.users ON DELETE CASCADE,
  filename text NOT NULL,
  original_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes int NOT NULL,
  width int,
  height int,
  data bytea NOT NULL,
  purpose text NOT NULL DEFAULT 'asset',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON designfast.uploads(user_id);

-- Link uploads to jobs (covers both initial generation and iterate-added assets)
CREATE TABLE IF NOT EXISTS designfast.job_uploads (
  job_id uuid NOT NULL REFERENCES designfast.jobs ON DELETE CASCADE,
  upload_id uuid NOT NULL REFERENCES designfast.uploads ON DELETE CASCADE,
  purpose text NOT NULL DEFAULT 'asset',
  PRIMARY KEY (job_id, upload_id)
);
CREATE INDEX IF NOT EXISTS idx_job_uploads_job_id ON designfast.job_uploads(job_id);

-- Track total upload storage per user for quota enforcement
DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN uploads_bytes_used bigint NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Email verification columns
DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN email_verified_at timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN email_verification_code text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE designfast.users ADD COLUMN email_verification_expires timestamptz;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(DDL);
    await client.query(MIGRATIONS);
    console.log('Migration complete — all tables, indexes, and migrations applied.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
