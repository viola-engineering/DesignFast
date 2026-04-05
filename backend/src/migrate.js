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
  generations_limit int NOT NULL DEFAULT 5,
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
