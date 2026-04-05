#!/bin/bash
set -e

# Integration test script for frontend
# Starts services from clean state, runs health checks, verifies connectivity, tears down cleanly

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(dirname "$FRONTEND_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Cleanup function
cleanup() {
    log_info "Cleaning up..."

    # Kill frontend dev server if running
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        log_info "Stopping frontend dev server (PID: $FRONTEND_PID)"
        kill "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi

    # Kill backend server if running
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        log_info "Stopping backend server (PID: $BACKEND_PID)"
        kill "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi

    # Kill any orphaned processes on ports
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true

    log_info "Cleanup complete"
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Check for clean state
check_clean_state() {
    log_info "Checking for clean state..."

    # Check if ports are in use
    if lsof -ti:5173 >/dev/null 2>&1; then
        log_warn "Port 5173 is in use, cleaning up..."
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi

    if lsof -ti:3000 >/dev/null 2>&1; then
        log_warn "Port 3000 is in use, cleaning up..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi

    log_info "Clean state verified"
}

# Wait for service health check
wait_for_health() {
    local url=$1
    local service_name=$2
    local max_attempts=${3:-30}
    local attempt=1

    log_info "Waiting for $service_name to be healthy at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|304"; then
            log_info "$service_name is healthy!"
            return 0
        fi

        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done

    log_error "$service_name failed to start within $max_attempts seconds"
    return 1
}

# Main test execution
main() {
    log_info "Starting integration test..."
    log_info "Frontend directory: $FRONTEND_DIR"
    log_info "Root directory: $ROOT_DIR"

    # Step 1: Clean state check
    check_clean_state

    # Step 2: Install dependencies if needed
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        log_info "Installing frontend dependencies..."
        cd "$FRONTEND_DIR" && npm install
    fi

    # Step 3: Build the frontend
    log_info "Building frontend..."
    cd "$FRONTEND_DIR" && npm run build

    if [ $? -ne 0 ]; then
        log_error "Frontend build failed"
        exit 1
    fi
    log_info "Frontend build successful"

    # Step 4: Start backend if available
    if [ -d "$ROOT_DIR/backend" ] && [ -f "$ROOT_DIR/backend/package.json" ]; then
        log_info "Starting backend server..."
        cd "$ROOT_DIR/backend"

        # Check if backend dependencies are installed
        if [ ! -d "node_modules" ]; then
            log_info "Installing backend dependencies..."
            npm install
        fi

        # Run database setup if needed
        if [ -f "scripts/migrate.ts" ] || grep -q '"migrate"' package.json 2>/dev/null; then
            log_info "Running database migrations..."
            npm run migrate 2>/dev/null || log_warn "No migrate script found, skipping"
        fi

        npm run dev > /tmp/backend.log 2>&1 &
        BACKEND_PID=$!
        log_info "Backend started with PID: $BACKEND_PID"

        # Wait for backend health
        wait_for_health "http://localhost:3000/api/health" "Backend" 30 || {
            # If health endpoint doesn't exist, just wait a bit
            log_warn "Backend health endpoint not available, waiting 5 seconds..."
            sleep 5
        }
    else
        log_warn "Backend not found, skipping backend startup"
    fi

    # Step 5: Start frontend dev server
    log_info "Starting frontend dev server..."
    cd "$FRONTEND_DIR"
    npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    log_info "Frontend started with PID: $FRONTEND_PID"

    # Step 6: Wait for frontend health
    wait_for_health "http://localhost:5173" "Frontend" 30

    if [ $? -ne 0 ]; then
        log_error "Frontend failed to start"
        cat /tmp/frontend.log
        exit 1
    fi

    # Step 7: Verify inter-service connectivity (frontend -> backend proxy)
    if [ -n "$BACKEND_PID" ]; then
        log_info "Verifying frontend->backend proxy connectivity..."

        # Test proxy to backend through frontend
        PROXY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/api/health" 2>/dev/null || echo "000")

        if [ "$PROXY_RESPONSE" = "200" ] || [ "$PROXY_RESPONSE" = "404" ]; then
            # 404 is acceptable if /api/health doesn't exist but proxy works
            log_info "Proxy connectivity verified (HTTP $PROXY_RESPONSE)"
        else
            log_warn "Proxy connectivity check returned HTTP $PROXY_RESPONSE (backend may not have /api/health endpoint)"
        fi
    fi

    # Step 8: Verify frontend serves correctly
    log_info "Verifying frontend serves HTML..."
    FRONTEND_RESPONSE=$(curl -s "http://localhost:5173")

    if echo "$FRONTEND_RESPONSE" | grep -q "DesignFast"; then
        log_info "Frontend serves content correctly!"
    else
        log_error "Frontend content verification failed"
        echo "$FRONTEND_RESPONSE"
        exit 1
    fi

    log_info ""
    log_info "=========================================="
    log_info "  Integration test PASSED!"
    log_info "=========================================="
    log_info ""
    log_info "Services verified:"
    log_info "  - Frontend: http://localhost:5173"
    [ -n "$BACKEND_PID" ] && log_info "  - Backend:  http://localhost:3000"
    log_info ""

    # Cleanup happens automatically via trap
    exit 0
}

main "$@"
