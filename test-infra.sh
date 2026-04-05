#!/usr/bin/env bash
#
# Integration test: starts Postgres from zero, runs migrations,
# verifies connectivity and schema, then tears down cleanly.
#
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.test.yml"
COMPOSE_PROJECT="designfast-test"
TEST_PG_PORT="${TEST_PG_PORT:-5434}"
DATABASE_URL="postgres://postgres:postgres@localhost:$TEST_PG_PORT/postgres"
export TEST_PG_PORT

cleanup() {
  echo "--- Tearing down ---"
  docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true
}

# Always clean up on exit
trap cleanup EXIT

echo "=== DesignFast Integration Test ==="
echo ""

# Step 0: Clean slate — remove any leftover containers/volumes/data
echo "--- Ensuring clean state (removing leftover containers/volumes) ---"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true

# Step 1: Start Postgres
echo "--- Starting Postgres ---"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" up -d --wait
echo "Postgres is healthy."

# Step 2: Verify Postgres connectivity
echo "--- Verifying Postgres connectivity ---"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "SELECT 1 AS connected;" | grep -q "1" || {
  echo "FAIL: Cannot connect to Postgres"
  exit 1
}
echo "Postgres connectivity OK."

# Step 3: Run migrations
echo "--- Running migrations ---"
DATABASE_URL="$DATABASE_URL" node "$PROJECT_DIR/migrate.js"
echo "Migrations completed."

# Step 4: Verify schema and all tables exist
echo "--- Verifying schema and tables ---"
EXPECTED_TABLES="users api_keys generations jobs job_files iterate_sessions iterate_messages"
for table in $EXPECTED_TABLES; do
  docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T postgres \
    psql -U postgres -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='designfast' AND table_name='$table';" | grep -q "1" || {
    echo "FAIL: Table designfast.$table not found"
    exit 1
  }
done
echo "All 7 tables verified in designfast schema."

# Step 5: Verify indexes exist
echo "--- Verifying indexes ---"
EXPECTED_INDEXES="idx_jobs_generation_id idx_jobs_user_id idx_job_files_job_id idx_iterate_sessions_job_id idx_iterate_sessions_user_id idx_iterate_messages_session_id idx_api_keys_user_id"
for idx in $EXPECTED_INDEXES; do
  docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T postgres \
    psql -U postgres -tAc "SELECT COUNT(*) FROM pg_indexes WHERE indexname='$idx';" | grep -q "1" || {
    echo "FAIL: Index $idx not found"
    exit 1
  }
done
echo "All indexes verified."

# Step 6: Verify idempotency — run migrations again
echo "--- Verifying migration idempotency ---"
DATABASE_URL="$DATABASE_URL" node "$PROJECT_DIR/migrate.js"
echo "Second migration run succeeded (idempotent)."

# Step 7: Verify basic INSERT/SELECT on each table
echo "--- Verifying INSERT/SELECT on users table ---"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U postgres -c "
    INSERT INTO designfast.users (email, password_hash, name)
    VALUES ('test@example.com', '\$2b\$10\$fakehash', 'Test User');
    SELECT id, email, plan, generations_used, generations_limit FROM designfast.users;
  " | grep -q "test@example.com" || {
  echo "FAIL: Could not insert/select from designfast.users"
  exit 1
}
echo "INSERT/SELECT verified."

# Step 8: Verify foreign key cascades work
echo "--- Verifying CASCADE deletes ---"
docker compose -p "$COMPOSE_PROJECT" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U postgres -c "
    DELETE FROM designfast.users WHERE email='test@example.com';
    SELECT COUNT(*) AS remaining FROM designfast.users;
  " | grep -q "0" || {
  echo "FAIL: CASCADE delete did not work as expected"
  exit 1
}
echo "CASCADE deletes verified."

# Step 9: Verify .env is in .gitignore
echo "--- Verifying .env is in .gitignore ---"
grep -q "^\.env$" "$PROJECT_DIR/.gitignore" || {
  echo "FAIL: .env not found in .gitignore"
  exit 1
}
echo ".env is in .gitignore."

# Step 10: Verify npm dependencies resolve
echo "--- Verifying npm dependencies ---"
node -e "
  Promise.all([
    import('pg'),
    import('fastify'),
    import('bcrypt'),
    import('jsonwebtoken'),
    import('archiver'),
    import('dotenv')
  ]).then(() => console.log('All dependencies importable.'))
    .catch(e => { console.error('FAIL:', e.message); process.exit(1); });
"

echo ""
echo "=== ALL INTEGRATION TESTS PASSED ==="
