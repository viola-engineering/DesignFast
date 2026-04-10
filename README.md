# DesignFast 

AI-powered design generation for developers. Describe what you want, pick a style, and get production-quality HTML, CSS, and JS in seconds.

**DesignFast is also available as a hosted service at [designfast.app](https://designfast.app).**

## CLI (via Claude Code)

Generate websites directly from your terminal using Claude Code as the LLM backend. No database, no server, no setup — just Claude Code installed and you're ready.

### Requirements

- Node.js 24+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated

### Quick Start

```bash
npm install
node cli/index.js "A modern SaaS landing page for a project management tool"
```

### Examples

```bash
# Auto-pick the best style (default)
node cli/index.js "A mini landing page about Trento" --style auto

# Generate 4 variations with AI-picked style
node cli/index.js "A mini landing page about Trento" -s auto -v 4

# Use Opus 4.6
node cli/index.js "A portfolio site" --model claude-opus-4-6

# Use a specific style
node cli/index.js "A law firm website" --style legal

# AI-generated custom style
node cli/index.js "An artisan coffee shop" --style synth

# Multi-page webapp
node cli/index.js "A task manager app" --mode webapp

# Custom output directory
node cli/index.js "A travel blog" -o ./my-site

# Iterative refinement (after a generation, use the session ID printed)
node cli/index.js --iterate <session-id>
```

### Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--style <name\|auto\|synth>` | `-s` | `auto` | Style preset, `auto` (AI picks), or `synth` (AI creates custom) |
| `--mode <landing\|webapp>` | `-m` | `landing` | Single-page landing or multi-page webapp |
| `--versions <n>` | `-v` | `1` | Number of variations to generate |
| `--output <dir>` | `-o` | `./output` | Output directory |
| `--model <model>` | | `claude-sonnet-4-6` | Claude model to use |
| `--iterate <session-id>` | `-i` | | Resume a session for iterative refinement |

48 style presets are available — run `node cli/index.js --help` to see the full list.

---

<img src="assets/home.png" alt="DesignFast Home" width="720" />

<img src="assets/generation.png" alt="DesignFast Generation" width="720" />

## What is this?

DesignFast is a web application that uses LLMs (Claude and Gemini) to generate complete, styled web pages and web applications. Instead of starting from scratch or buying templates, you describe what you want and select from 30 curated design styles (minimalist, brutalist, glassmorphism, corporate, cyberpunk, etc.).

**Features:**
- 48 curated design styles with distinct typography, layout, and color systems
- Multiple versions generation with different theme for each style, every time
- Landing page and multi-page webapp generation modes
- Support for Claude (Anthropic) and Gemini (Google) models
- BYOK (Bring Your Own Key) - users can add their own API keys
- Iterative refinement - chat with the AI to modify generated designs
- Download generated code as ZIP
- Real-time generation progress via SSE

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Queen-MQ   │
│   (Vue 3)   │     │  (Fastify)  │     │ (Job Queue) │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  PostgreSQL │     │   Workers   │
                    │  (Database) │     │ (LLM Calls) │
                    └─────────────┘     └─────────────┘
```

- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Fastify
- **Queue**: [Queen-MQ](https://github.com/smartpricing/queen) (PostgreSQL-based job queue)
- **Database**: PostgreSQL 16
- **LLM**: @angycode/core (agent framework for Claude/Gemini)

## Prerequisites

- Node.js 24+
- PostgreSQL 16+
- [Queen-MQ server](https://github.com/smartpricing/queen) running on port 6632

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/viola-engineering/designfast.git
cd designfast
```

### 2. Install dependencies

```bash
# Backend dependencies (from root)
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Set up PostgreSQL

Create a database (or use the default `postgres` database):

```bash
createdb designfast
```

### 4. Set up Queen-MQ

Queen-MQ is a PostgreSQL-based job queue. Install and run it:

```bash
# Option A: Using Docker
docker run -d --name queen \
  -e PG_HOST=host.docker.internal \
  -e PG_PORT=5432 \
  -e PG_USER=postgres \
  -e PG_PASSWORD=postgres \
  -e PG_DATABASE=designfast \
  -p 6632:6632 \
  smartnessai/queen-mq:latest

# Option B: Build from source (see https://github.com/smartpricing/queen)
```

### 5. Configure environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Database connection
DATABASE_URL=postgres://postgres:postgres@localhost:5432/designfast

# Queen job queue server
QUEEN_URL=http://localhost:6632

# Security keys (generate these!)
JWT_SECRET=your-secret-here          # openssl rand -hex 32
ENCRYPTION_KEY=your-64-char-hex-key  # openssl rand -hex 32

# LLM API Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-...         # From https://console.anthropic.com
GOOGLE_API_KEY=...                   # From https://aistudio.google.com

# Optional: Email verification (disabled if not set)
RESEND_API_KEY=                      # From https://resend.com

# Optional: Stripe for payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Server port
PORT=3000
```

#### Required Keys

| Key | Required | Where to get it |
|-----|----------|-----------------|
| `JWT_SECRET` | Yes | Generate: `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Yes | Generate: `openssl rand -hex 32` |
| `ANTHROPIC_API_KEY` | One of these | [Anthropic Console](https://console.anthropic.com) |
| `GOOGLE_API_KEY` | One of these | [Google AI Studio](https://aistudio.google.com) |

#### Optional Keys

| Key | Purpose |
|-----|---------|
| `RESEND_API_KEY` | Email verification (if not set, verification is skipped) |
| `STRIPE_SECRET_KEY` | Credit purchases and billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook validation |

### 6. Set up frontend environment

```bash
cp frontend/.env.example frontend/.env
```

The default is fine for local development:
```bash
VITE_API_URL=http://localhost:3000
```

### 7. Run database migrations

```bash
npm run migrate
```

### 8. Start the development servers

In separate terminals:

```bash
# Terminal 1: Backend (API + Workers)
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Usage

1. **Register/Login** - Create an account (email verification optional based on config)
2. **Generate** - Go to /generate, describe what you want, pick a style
3. **Preview** - Watch real-time generation progress, preview the result
4. **Iterate** - Chat with the AI to refine the design
5. **Download** - Download the generated HTML/CSS/JS as a ZIP

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.js          # Fastify server entry point
│   │   ├── worker.js          # Job queue consumers
│   │   ├── process-job.js     # LLM generation logic
│   │   ├── process-iterate.js # Iterative refinement logic
│   │   ├── prompt-builder.js  # Style prompts (30 styles)
│   │   ├── routes/            # API routes
│   │   └── migrate.js         # Database migrations
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── views/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── api/               # API client
│   │   └── stores/            # Pinia stores
│   └── public/
├── examples/                   # Style example files (HTML/CSS)
├── docker-compose.yml          # Production deployment
├── Dockerfile                  # Backend container
└── .env.example               # Environment template
```

## Production Deployment

See the docker-compose.yml for a complete production setup with:
- PostgreSQL with persistent storage
- Queen-MQ job queue
- API server
- Generation workers (scalable)
- Cloudflare Tunnel for ingress

```bash
# Copy and configure production env
cp .env.production.example .env.production
# Edit .env.production with production values

# Start all services
docker compose --env-file .env.production up -d

# Run migrations
docker compose --env-file .env.production run --rm api node -r dotenv/config backend/src/migrate.js
```

## License

[FSL-1.1-Apache-2.0](LICENSE) (Functional Source License)

- **Free to use** - self-host, modify, internal use
- **No competing SaaS** - cannot offer as a hosted service
- **Converts to Apache 2.0** - on April 7, 2028
