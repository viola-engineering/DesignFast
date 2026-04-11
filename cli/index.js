#!/usr/bin/env node

/**
 * DesignFast CLI — generate websites from the terminal using Claude Code.
 *
 * Usage:
 *   node cli/index.js "A modern SaaS landing page for a project management tool"
 *   node cli/index.js "A portfolio site" --style minimalist
 *   node cli/index.js "A task manager app" --mode webapp --style auto
 *   node cli/index.js "A law firm website" --style synth --versions 2
 *   node cli/index.js --iterate <session-id>   # continue refining
 *
 * All output goes to ./output/ (or --output <dir>).
 */
import { mkdirSync, readdirSync, readFileSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { resolve, basename, extname, join } from 'node:path';
import { parseArgs } from 'node:util';
import imageSize from 'image-size';
import { createClaudeCodeQueryLLM, runGeneration, continueSession } from './claude-code.js';
import {
  STYLES,
  buildPrompt,
  resolveThemeAuto,
  resolveThemeSynth,
  generateVariationStrategies,
} from '../backend/src/prompt-builder.js';

// ── Arg parsing ──────────────────────────────────────────────────────────

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    style: { type: 'string', short: 's', default: 'auto' },
    mode: { type: 'string', short: 'm', default: 'landing' },
    model: { type: 'string', default: 'claude-sonnet-4-6' },
    versions: { type: 'string', short: 'v', default: '1' },
    output: { type: 'string', short: 'o', default: './output' },
    ref: { type: 'string', multiple: true, default: [] },
    asset: { type: 'string', multiple: true, default: [] },
    iterate: { type: 'string', short: 'i' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (flags.help || (!positionals.length && !flags.iterate)) {
  console.log(`
DesignFast CLI — generate websites using Claude Code

Usage:
  designfast "<prompt>"                        Generate a landing page
  designfast "<prompt>" --mode webapp          Generate a multi-page webapp
  designfast "<prompt>" --style minimalist     Use a specific style
  designfast "<prompt>" --style auto           Let AI pick the best style (default)
  designfast "<prompt>" --style synth          Let AI create a custom style
  designfast "<prompt>" --versions 2           Generate multiple variations
  designfast "<prompt>" --ref screenshot.png   Use a reference image for style
  designfast "<prompt>" --asset logo.png       Include asset images in the project
  designfast --iterate <session-id>            Continue refining a design

Options:
  -s, --style <name|auto|synth>   Style preset or mode (default: auto)
  -m, --mode <landing|webapp>     Generation mode (default: landing)
  -v, --versions <n>              Number of variations (default: 1)
  -o, --output <dir>              Output directory (default: ./output)
  --model <model>                 Claude model (default: claude-sonnet-4-6)
  --ref <file>                    Reference image (screenshot/mockup) for AI to match visually
                                  Can be specified multiple times: --ref a.png --ref b.jpg
  --asset <file>                  Asset image to include in the project (logo, photo, etc.)
                                  Can be specified multiple times: --asset logo.svg --asset hero.jpg
  --iterate <session-id>          Resume session for iterative refinement
  -h, --help                      Show this help

Available styles:
${Object.entries(STYLES).map(([key, s]) => `  ${key.padEnd(20)} ${s.name}`).join('\n')}
`);
  process.exit(0);
}

// ── Main ─────────────────────────────────────────────────────────────────

const versions = parseInt(flags.versions, 10) || 1;
const outputBase = resolve(flags.output);

function log(msg) {
  process.stderr.write(`\x1b[36m[designfast]\x1b[0m ${msg}\n`);
}

function logDim(msg) {
  process.stderr.write(`\x1b[90m${msg}\x1b[0m\n`);
}

// ── Image helpers ────────────────────────────────────────────────────────

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

/**
 * Load reference images from file paths into base64 vision inputs.
 * @param {string[]} paths
 * @returns {Array<{data: string, mimeType: string}>}
 */
function loadReferenceImages(paths) {
  const images = [];
  for (const p of paths) {
    const filePath = resolve(p);
    if (!existsSync(filePath)) {
      console.error(`Error: Reference image not found: ${p}`);
      process.exit(1);
    }
    const ext = extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext];
    if (!mimeType) {
      console.error(`Error: Unsupported image format "${ext}" for reference image: ${p}`);
      console.error(`  Supported: ${Object.keys(MIME_TYPES).join(', ')}`);
      process.exit(1);
    }
    const data = readFileSync(filePath).toString('base64');
    images.push({ data, mimeType });
  }
  return images;
}

/**
 * Load asset metadata and return info needed for prompt builder.
 * Does NOT copy files yet — that happens per output dir.
 * @param {string[]} paths
 * @returns {Array<{filePath: string, filename: string, width: number|null, height: number|null, sizeBytes: number}>}
 */
function loadAssetMeta(paths) {
  const assets = [];
  for (const p of paths) {
    const filePath = resolve(p);
    if (!existsSync(filePath)) {
      console.error(`Error: Asset file not found: ${p}`);
      process.exit(1);
    }
    const filename = basename(filePath);
    const sizeBytes = statSync(filePath).size;

    let width = null;
    let height = null;
    try {
      const dims = imageSize(filePath);
      width = dims.width || null;
      height = dims.height || null;
    } catch { /* not a raster image (e.g. SVG), skip dimensions */ }

    assets.push({ filePath, filename, width, height, sizeBytes });
  }
  return assets;
}

/**
 * Copy asset files into the output directory's assets/ subfolder.
 * @param {Array<{filePath: string, filename: string}>} assets
 * @param {string} outputDir
 */
function copyAssetsToDir(assets, outputDir) {
  if (assets.length === 0) return;
  const assetsDir = join(outputDir, 'assets');
  mkdirSync(assetsDir, { recursive: true });
  for (const a of assets) {
    copyFileSync(a.filePath, join(assetsDir, a.filename));
  }
}

async function main() {
  // ── Iterate mode ─────────────────────────────────────────────────────
  if (flags.iterate) {
    await handleIterate(flags.iterate);
    return;
  }

  const prompt = positionals.join(' ').trim();
  if (!prompt) {
    console.error('Error: Please provide a website description.');
    process.exit(1);
  }

  const mode = flags.mode;
  if (!['landing', 'webapp'].includes(mode)) {
    console.error(`Error: Invalid mode "${mode}". Use "landing" or "webapp".`);
    process.exit(1);
  }

  // ── Load reference images and assets ────────────────────────────────
  const referenceImages = loadReferenceImages(flags.ref);
  const assetsMeta = loadAssetMeta(flags.asset);

  if (referenceImages.length > 0) {
    log(`Loaded ${referenceImages.length} reference image${referenceImages.length > 1 ? 's' : ''} for visual matching`);
  }
  if (assetsMeta.length > 0) {
    log(`Loaded ${assetsMeta.length} asset${assetsMeta.length > 1 ? 's' : ''}:`);
    for (const a of assetsMeta) {
      const dims = a.width && a.height ? ` (${a.width}x${a.height}px)` : '';
      logDim(`  ${a.filename}${dims} — ${(a.sizeBytes / 1024).toFixed(1)} KB`);
    }
  }

  const queryLLM = createClaudeCodeQueryLLM({ model: flags.model });

  // ── Resolve style ──────────────────────────────────────────────────
  let styleKey = null;
  let stylePrompt = '';

  if (flags.style === 'auto') {
    log('Selecting best style...');
    const keys = await resolveThemeAuto(prompt, queryLLM);
    if (keys.length > 0) {
      styleKey = keys[0];
      stylePrompt = STYLES[styleKey].prompt;
      log(`Selected style: ${STYLES[styleKey].name} (${styleKey})`);
    } else {
      log('Could not auto-select style, using freestyle');
    }
  } else if (flags.style === 'synth') {
    styleKey = 'synth';
    // Synth results are generated per-version below (each version gets its own concept + config)
  } else if (flags.style !== 'freestyle' && STYLES[flags.style]) {
    styleKey = flags.style;
    stylePrompt = STYLES[styleKey].prompt;
    log(`Using style: ${STYLES[styleKey].name}`);
  } else if (flags.style !== 'freestyle') {
    console.error(`Error: Unknown style "${flags.style}". Use --help to see available styles.`);
    process.exit(1);
  }

  // ── Synth: generate N unique styles in one call ─────────────────────
  let synthStyles = []; // array of { tailwindConfig, prompt } per version
  if (styleKey === 'synth') {
    log(`Generating ${versions} unique design style${versions > 1 ? 's' : ''}...`);
    try {
      synthStyles = await resolveThemeSynth(prompt, queryLLM, versions);
      for (let i = 0; i < synthStyles.length; i++) {
        const s = synthStyles[i];
        const colors = s.tailwindConfig?.theme?.extend?.colors;
        const colorKeys = colors ? Object.keys(colors) : [];
        const fonts = s.tailwindConfig?.theme?.extend?.fontFamily;
        const fontNames = fonts ? Object.values(fonts).map(f => f[0]).join(', ') : 'none';
        log(`  v${i + 1}: ${colorKeys.length} colors [${colorKeys.slice(0, 5).join(', ')}${colorKeys.length > 5 ? '...' : ''}] | fonts: ${fontNames}`);
        logDim(`  v${i + 1} prompt:\n${s.prompt}`);
      }
    } catch (err) {
      log(`Style synthesis failed: ${err.message}`);
    }

    if (synthStyles.length === 0) {
      log('Style synthesis failed, using freestyle');
      styleKey = null;
    }
  }

  // ── Variation strategies (for non-synth multi-version) ────────────
  let variationStrategies = [];
  if (versions > 1 && styleKey !== 'synth') {
    log(`Generating ${versions - 1} variation strategies...`);
    try {
      variationStrategies = await generateVariationStrategies({
        userPrompt: prompt,
        stylePrompt,
        count: versions - 1,
        queryLLM,
      });
      for (let i = 0; i < variationStrategies.length; i++) {
        logDim(`  v${i + 2}: ${variationStrategies[i].substring(0, 100)}`);
      }
    } catch (err) {
      log(`Warning: Could not generate variation strategies: ${err.message}`);
    }
  }

  // ── Generate versions (up to 4 in parallel) ────────────────────────
  const CONCURRENCY = 4;

  // Build asset metadata for prompt builder (same shape as web app)
  const promptAssets = assetsMeta.map(a => ({
    filename: a.filename,
    width: a.width,
    height: a.height,
    sizeBytes: a.sizeBytes,
  }));

  const jobs = [];
  for (let v = 1; v <= versions; v++) {
    const outputDir = versions > 1 ? resolve(outputBase, `v${v}`) : outputBase;
    mkdirSync(outputDir, { recursive: true });

    // Copy assets into each version's output dir
    copyAssetsToDir(assetsMeta, outputDir);

    // For synth: each version has its own style (config + prompt) from the single synth call
    // For presets/freestyle: shared style + variation nudge
    const synthStyle = styleKey === 'synth' ? synthStyles[v - 1] : null;
    const versionStylePrompt = synthStyle ? synthStyle.prompt : stylePrompt;
    const versionTailwindConfig = synthStyle
      ? (synthStyle.tailwindConfig || null)
      : ((styleKey && STYLES[styleKey]?.tailwindConfig) || null);
    const variationNudge = (!synthStyle && v > 1) ? (variationStrategies[v - 2] || '') : '';

    const fullPrompt = buildPrompt(
      {
        prompt,
        mode,
        styleKey,
        stylePrompt: versionStylePrompt,
        tailwindConfig: versionTailwindConfig,
        version: v,
        variationNudge,
        fromFiles: null,
        hasReferenceImages: referenceImages.length > 0,
        assets: promptAssets,
      },
      outputDir,
    );

    jobs.push({ v, outputDir, fullPrompt });
  }

  log(`Generating ${versions} version${versions > 1 ? 's' : ''} (concurrency: ${Math.min(CONCURRENCY, versions)})...`);

  // Process jobs in batches of CONCURRENCY
  const results = [];
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(async (job) => {
      const label = versions > 1 ? `v${job.v}` : '';
      log(`  ${label} starting...`);

      const { sessionId, costUsd } = await runGeneration({
        prompt: job.fullPrompt,
        workingDir: job.outputDir,
        model: flags.model,
        images: referenceImages.length > 0 ? referenceImages : undefined,
      });

      const files = readdirSync(job.outputDir).filter(f => /\.(html|css|js)$/.test(f));
      return { ...job, sessionId, costUsd, files };
    }));
    results.push(...batchResults);
  }

  // Print summary
  log('');
  for (const r of results) {
    const label = versions > 1 ? `v${r.v}` : '';
    log(`${label} done — ${r.files.length} files → ${r.outputDir}`);
    for (const f of r.files) {
      const size = readFileSync(resolve(r.outputDir, f)).length;
      logDim(`  ${f} (${(size / 1024).toFixed(1)} KB)`);
    }
    if (r.costUsd > 0) logDim(`  Cost: $${r.costUsd.toFixed(4)}`);
    log(`  Session: ${r.sessionId}`);
  }

  if (versions === 1) {
    log(`\nTo refine: node cli/index.js --iterate ${results[0].sessionId}`);
  }
}

// ── Iterate mode ─────────────────────────────────────────────────────────

async function handleIterate(sessionId) {
  // Load reference images if provided (useful for showing the AI a new target)
  const iterateRefImages = loadReferenceImages(flags.ref);
  if (iterateRefImages.length > 0) {
    log(`Loaded ${iterateRefImages.length} reference image${iterateRefImages.length > 1 ? 's' : ''}`);
  }

  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  log(`Resuming session: ${sessionId}`);
  log('Type your refinement requests. Ctrl+D to exit.\n');

  const askQuestion = () => {
    return new Promise((resolve) => {
      rl.question('\x1b[33myou>\x1b[0m ', (answer) => {
        resolve(answer);
      });
      rl.once('close', () => resolve(null));
    });
  };

  while (true) {
    const message = await askQuestion();
    if (message === null) break; // EOF
    if (!message.trim()) continue;

    log('Refining...');
    try {
      const result = await continueSession({
        sessionId,
        message: message.trim(),
        workingDir: outputBase,
        model: flags.model,
        images: iterateRefImages.length > 0 ? iterateRefImages : undefined,
        onText: (text) => process.stderr.write(text),
      });

      if (result.costUsd > 0) {
        logDim(`Cost: $${result.costUsd.toFixed(4)}`);
      }
      log('');
    } catch (err) {
      log(`Error: ${err.message}`);
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
  process.exit(1);
});
