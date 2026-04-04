# DesignFast

AI-powered website and webapp generator. Produces complete, production-quality HTML/CSS/JS sites using LLM agents that write real code.

## Quick Start

```bash
npm install
export ANTHROPIC_API_KEY=sk-...        # required for Claude
export GOOGLE_API_KEY=AIza...          # required for Gemini
```

Generate a landing page:

```bash
node test-multi.js "A coffee subscription service" minimalist
```

Generate a multi-page webapp:

```bash
node test-multi.js "A project management app" --mode webapp
```

Open the result:

```bash
open output/*/index.html
```

---

## Usage

```
node test-multi.js <prompt> [styles] [options]
node test-multi.js --iterate <output-dir> [options]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `prompt` | Yes (for generate) | What to build. Be descriptive. |
| `styles` | No | Comma-separated style names, `all`, or omit entirely. |

---

## Choosing a Style

There are four ways to control the visual style of your output.

### 1. Explicit style(s)

Pick one or more from the 30 built-in presets:

```bash
# Single style
node test-multi.js "A photography portfolio" minimalist

# Multiple styles — generates one site per style, in parallel
node test-multi.js "A photography portfolio" minimalist,brutalist,playful

# All 30 styles
node test-multi.js "A photography portfolio" all
```

### 2. `--theme-auto` — LLM picks for you

The LLM reads your prompt, scans the full style catalog, and picks the 1-3 most appropriate styles. This is the recommended default for most use cases.

```bash
node test-multi.js "A smart building IoT platform" --theme-auto
# -> LLM picks: warmCorporate, cleanTech
# -> Generates both in parallel
```

```bash
node test-multi.js "A children's learning app" --theme-auto
# -> LLM picks: playful, startupBold
```

### 3. `--theme-synth` — LLM creates a custom style

Instead of picking from presets, the LLM generates a fully bespoke design brief — exact colors, fonts, spacing, component styles — tailored to your content. Use this when no preset fits, or when you want something unique.

```bash
node test-multi.js "A luxury pet grooming service in Tokyo" --theme-synth
# -> LLM synthesizes a custom style brief
# -> Generates using that brief
```

### 4. Freestyle (no flag, no style)

When you don't specify a style or a theme flag, the LLM has complete creative freedom. Results vary — you may get generic dark-mode SaaS aesthetics. Prefer `--theme-auto` or `--theme-synth` for better results.

```bash
node test-multi.js "A coffee subscription service"
```

---

## Options

### `--versions, -v <N>`

Generate N creative variations per style/model combo. Each version gets a different creative nudge (experimental, conservative, typography-focused, color-driven, etc.) to ensure genuine variety.

```bash
# 3 versions of minimalist
node test-multi.js "A portfolio site" minimalist -v 3
# Output: minimalist-v1/, minimalist-v2/, minimalist-v3/
```

### `--models, -m <list>`

Run generation on multiple LLM providers in parallel. Available: `claude`, `gemini`.

```bash
# Compare Claude vs Gemini
node test-multi.js "A SaaS landing page" cleanTech --models claude,gemini
# Output: cleanTech-claude/, cleanTech-gemini/
```

### `--mode <type>`

- `landing` (default) — single-page site: `style.css` + `index.html`
- `webapp` — multi-page app: `style.css` + `app.js` + multiple `.html` pages with shared navigation

```bash
node test-multi.js "A CRM with dashboard, contacts, and deals" --mode webapp
```

### `--from <dir>`

Use the design language from a previous generation as the style reference. The agent reads the CSS and HTML from that directory to extract colors, typography, spacing, and component patterns — then applies them to the new site.

```bash
# Step 1: Generate a landing page you like
node test-multi.js "Acme Inc" minimalist

# Step 2: Build a webapp in the same style
node test-multi.js "Acme CRM app" --mode webapp --from output/2026-04-04/minimalist/
```

Works with any previous output, including freestyle and synthesized styles. The `--from` directory must contain at least a `style.css`.

### `--iterate <dir>`

Open an interactive session to refine an existing output. The agent reads all files in the directory, then you type changes in a REPL loop.

```bash
node test-multi.js --iterate output/2026-04-04/minimalist-v1/
```

```
> make the hero section taller
  🔧 edit
  ✅ Done (1200ms)

> change the accent color to teal
  🔧 edit
  ✅ Done (800ms)

> add a pricing section with 3 tiers
  🔧 edit
  ✅ Done (3200ms)

> done

📊 Session Summary
  Tokens: 45000 in / 8000 out  |  Total: $0.2100
```

Type `done`, `exit`, or `quit` to end the session. All changes are made in-place.

You can specify which model to use:

```bash
node test-multi.js --iterate output/2026-04-04/minimalist-v1/ --models gemini
```

---

## Combining Options

Options compose freely. The generation runs every combination of `style x version x model` in parallel.

### Style + versions

```bash
node test-multi.js "A fintech dashboard" fintech -v 3
# 3 jobs: fintech-v1/, fintech-v2/, fintech-v3/
```

### Multiple styles + versions

```bash
node test-multi.js "A fintech dashboard" fintech,corporate -v 2
# 4 jobs: fintech-v1/, fintech-v2/, corporate-v1/, corporate-v2/
```

### Multiple styles + versions + models

```bash
node test-multi.js "A fintech dashboard" fintech,corporate -v 2 -m claude,gemini
# 8 jobs: fintech-claude-v1/, fintech-claude-v2/, fintech-gemini-v1/, ...
```

### Auto-select + versions + models

```bash
node test-multi.js "A hospital patient portal" --theme-auto -v 2 -m claude,gemini
# LLM picks e.g. healthcare, warmCorporate
# 8 jobs: healthcare-claude-v1/, healthcare-claude-v2/, healthcare-gemini-v1/, ...
```

### Synth + webapp + versions

```bash
node test-multi.js "A vintage bookshop with online catalog" --theme-synth --mode webapp -v 3
# LLM synthesizes a bespoke style
# 3 jobs: synth-v1/, synth-v2/, synth-v3/
```

### From + webapp

```bash
node test-multi.js "Admin dashboard" --mode webapp --from output/2026-04-04/cleanTech/
# 1 job using the cleanTech design language, but as a multi-page app
```

---

## Available Styles

### Aesthetic styles (18)

| Key | Name | Vibe |
|-----|------|------|
| `minimalist` | Minimalist | Dieter Rams, Japanese zen |
| `brutalist` | Brutalist | Raw concrete, punk zine |
| `glassmorphism` | Glassmorphism | iOS frosted glass, atmospheric |
| `corporate` | Corporate | McKinsey, enterprise SaaS |
| `playful` | Playful | Duolingo, kindergarten meets web |
| `darkLuxury` | Dark Luxury | Rolex, Aesop, luxury hotel |
| `editorial` | Editorial | NYT Magazine, Bloomberg |
| `retro` | Retro | Vintage apothecary, letterpress |
| `neobrutalism` | Neobrutalism | Figma, Gumroad, paper cutouts |
| `organic` | Organic | Wellness spa, connected to nature |
| `cyberpunk` | Cyberpunk | Blade Runner, neon Tokyo |
| `swiss` | Swiss / Bauhaus | Muller-Brockmann, mathematical |
| `artDeco` | Art Deco | Great Gatsby, Chrysler Building |
| `newspaper` | Newspaper | NYT front page, broadsheet |
| `neumorphism` | Neumorphism | Soft UI, sculpted from clay |
| `monochrome` | Monochrome | Single-hue, architectural restraint |
| `y2k` | Y2K / 2000s | GeoCities, iMac G3 era |
| `maximalist` | Maximalist | Wes Anderson, William Morris |

### Industry & functional styles (12)

| Key | Name | Vibe |
|-----|------|------|
| `cleanTech` | Clean Tech | Vercel, Linear, Supabase |
| `warmCorporate` | Warm Corporate | Bosch, Siemens, European B2B |
| `startupBold` | Startup Bold | Notion, Arc, Cal.com |
| `saasMarketing` | SaaS Marketing | Clerk, Resend, PlanetScale |
| `dashboardUI` | Dashboard UI | Stripe Dashboard, Grafana |
| `ecommerce` | E-commerce | Apple Store, Everlane |
| `portfolio` | Portfolio | Awwwards, designer showcase |
| `documentation` | Documentation | Stripe Docs, Tailwind Docs |
| `healthcare` | Healthcare | One Medical, Headspace |
| `fintech` | Fintech | Mercury, Wise, Revolut |
| `media` | Media | Medium, Substack, The Verge |
| `government` | Government | GOV.UK, radically accessible |

---

## Output Structure

All output goes to `output/<timestamp>/`. Each job gets its own subdirectory:

```
output/2026-04-04-12-36/
├── minimalist/              # single style
│   ├── style.css
│   └── index.html
├── minimalist-v1/           # with --versions
├── minimalist-v2/
├── minimalist-claude/       # with --models
├── minimalist-gemini/
├── minimalist-claude-v1/    # with both
├── minimalist-claude-v2/
├── minimalist-gemini-v1/
└── minimalist-gemini-v2/
```

Webapp mode (`--mode webapp`) adds more files:

```
output/2026-04-04-12-36/corporate/
├── style.css
├── app.js
├── index.html
├── dashboard.html
├── settings.html
└── tasks.html
```

---

## Cost and Performance

Each generation job is one LLM agent session. Typical costs per job (Claude Sonnet):

| Mode | Time | Cost |
|------|------|------|
| Landing page | 30-90s | $0.30-0.80 |
| Webapp (4 pages) | 300-600s | $1.50-2.50 |
| Theme auto-select | 3-5s | $0.01-0.02 |
| Theme synthesize | 5-10s | $0.02-0.05 |
| Iterate (per change) | 5-30s | $0.05-0.20 |

Gemini is significantly faster and cheaper but produces less functional output (fewer interactive features, thinner CSS).

All jobs in a run execute in parallel. A 12-job matrix takes the same wall time as its slowest single job.
