#!/usr/bin/env node
/**
 * Generate example outputs for all styles using the existing generation pipeline.
 *
 * Usage:
 *   node backend/scripts/generate-style-examples.js [--style=minimalist] [--dry-run]
 *
 * Options:
 *   --style=<key>   Generate only a specific style (default: all)
 *   --dry-run       Print what would be generated without running
 *
 * Requires: GOOGLE_API_KEY in .env, running Queen worker, running Postgres
 */

import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, db } from '../src/db.js';
import { STYLES } from '../src/prompt-builder.js';
import { MODEL_MAP } from '../src/models.js';
import queen from '../src/queen-client.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(__dirname, '../../examples');

// ─── Style → Prompt Mapping ─────────────────────────────────────────────────

const STYLE_PROMPTS = {
  minimalist: {
    prompt: 'Portfolio website for a photographer showcasing landscape and portrait work',
    mode: 'landing',
  },
  brutalist: {
    prompt: 'Art gallery website for contemporary exhibitions featuring emerging artists',
    mode: 'landing',
  },
  glassmorphism: {
    prompt: 'Weather app landing page with current conditions and 5-day forecast',
    mode: 'landing',
  },
  corporate: {
    prompt: 'Management consulting firm website with services and client testimonials',
    mode: 'landing',
  },
  playful: {
    prompt: "Children's educational game landing page for learning math through puzzles",
    mode: 'landing',
  },
  darkLuxury: {
    prompt: 'High-end watch brand website showcasing premium timepieces',
    mode: 'landing',
  },
  editorial: {
    prompt: 'Literary magazine homepage featuring essays, poetry, and book reviews',
    mode: 'landing',
  },
  retro: {
    prompt: 'Vintage vinyl record shop with curated collections and new arrivals',
    mode: 'landing',
  },
  neobrutalism: {
    prompt: 'Creative agency portfolio showcasing brand identity and web design work',
    mode: 'landing',
  },
  organic: {
    prompt: 'Organic skincare brand website with product line and ingredient philosophy',
    mode: 'landing',
  },
  cyberpunk: {
    prompt: 'Indie game studio landing page for a sci-fi action RPG',
    mode: 'landing',
  },
  swiss: {
    prompt: 'Architecture firm portfolio featuring residential and commercial projects',
    mode: 'landing',
  },
  artDeco: {
    prompt: 'Luxury boutique hotel website with rooms, amenities, and booking',
    mode: 'landing',
  },
  newspaper: {
    prompt: 'Local news publication homepage with breaking news and editorial sections',
    mode: 'landing',
  },
  neumorphism: {
    prompt: 'Podcast player landing page with featured shows and episode highlights',
    mode: 'landing',
  },
  monochrome: {
    prompt: 'Minimalist photography portfolio for black and white fine art prints',
    mode: 'landing',
  },
  y2k: {
    prompt: 'Retro gaming community website with forums and game reviews',
    mode: 'landing',
  },
  maximalist: {
    prompt: 'Music festival landing page with lineup, tickets, and experience preview',
    mode: 'landing',
  },
  cleanTech: {
    prompt: 'Renewable energy startup website promoting solar installation services',
    mode: 'landing',
  },
  warmCorporate: {
    prompt: 'HR consulting firm website with services and company culture showcase',
    mode: 'landing',
  },
  startupBold: {
    prompt: 'AI-powered writing assistant startup with features and pricing',
    mode: 'landing',
  },
  saasMarketing: {
    prompt: 'Project management tool landing page with features, pricing, and testimonials',
    mode: 'landing',
  },
  dashboardUI: {
    prompt: 'Marketing analytics dashboard showing campaign metrics and performance charts',
    mode: 'webapp',
  },
  ecommerce: {
    prompt: 'Online plant shop with product catalog, care guides, and shopping cart',
    mode: 'landing',
  },
  portfolio: {
    prompt: 'Freelance product designer portfolio with case studies and contact form',
    mode: 'landing',
  },
  documentation: {
    prompt: 'API documentation for a payments SDK with guides and code examples',
    mode: 'landing',
  },
  healthcare: {
    prompt: 'Telemedicine clinic website with services, doctors, and appointment booking',
    mode: 'landing',
  },
  fintech: {
    prompt: 'Personal finance app landing page with budgeting features and security info',
    mode: 'landing',
  },
  media: {
    prompt: 'Podcast network homepage featuring shows, episodes, and creator spotlights',
    mode: 'landing',
  },
  government: {
    prompt: 'City services portal with department info, forms, and contact details',
    mode: 'landing',
  },

  // ─── Additional Visual Styles ───────────────────────────────────────────────

  gradient: {
    prompt: 'Creative agency homepage showcasing design and branding services',
    mode: 'landing',
  },
  claymorphism: {
    prompt: 'Language learning app landing page with courses and progress tracking',
    mode: 'landing',
  },
  vaporwave: {
    prompt: 'Retro synthwave music artist website with albums and tour dates',
    mode: 'landing',
  },
  darkTech: {
    prompt: 'Developer tools startup landing page with API features and documentation',
    mode: 'landing',
  },
  pastel: {
    prompt: 'Self-care and journaling app landing page with features and testimonials',
    mode: 'landing',
  },
  handDrawn: {
    prompt: 'Artisan coffee roaster website with beans, brewing guides, and subscriptions',
    mode: 'landing',
  },
  memphis: {
    prompt: 'Design conference landing page with speakers, schedule, and tickets',
    mode: 'landing',
  },
  scandinavian: {
    prompt: 'Sustainable furniture brand website with product collections and philosophy',
    mode: 'landing',
  },

  // ─── Additional Industry Styles ─────────────────────────────────────────────

  education: {
    prompt: 'Online coding bootcamp landing page with courses, instructors, and student outcomes',
    mode: 'landing',
  },
  restaurant: {
    prompt: 'Farm-to-table restaurant website with menu, reservations, and chef story',
    mode: 'landing',
  },
  realEstate: {
    prompt: 'Luxury real estate agency website with property listings and agent profiles',
    mode: 'landing',
  },
  travel: {
    prompt: 'Boutique travel agency website with curated trips and destination guides',
    mode: 'landing',
  },
  fitness: {
    prompt: 'Premium fitness studio website with classes, trainers, and membership plans',
    mode: 'landing',
  },
  nonprofit: {
    prompt: 'Ocean conservation nonprofit website with mission, impact stats, and donation',
    mode: 'landing',
  },
  agency: {
    prompt: 'Award-winning digital design studio portfolio with case studies and philosophy',
    mode: 'landing',
  },
  events: {
    prompt: 'Annual tech summit landing page with speakers, agenda, and early bird tickets',
    mode: 'landing',
  },
  gaming: {
    prompt: 'Upcoming action RPG game landing page with features, trailer, and pre-order',
    mode: 'landing',
  },
  legal: {
    prompt: 'Corporate law firm website with practice areas, attorneys, and consultations',
    mode: 'landing',
  },
};

// Use a dedicated "system" user for examples - create if not exists
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

async function ensureSystemUser() {
  const { rows } = await query(
    `SELECT id FROM designfast.users WHERE id = $1`,
    [SYSTEM_USER_ID]
  );
  if (rows.length === 0) {
    await query(
      `INSERT INTO designfast.users (id, email, password_hash, plan)
       VALUES ($1, 'system@designfast.internal', 'not-a-real-hash', 'enterprise')
       ON CONFLICT (id) DO NOTHING`,
      [SYSTEM_USER_ID]
    );
    console.log('  Created system user for examples');
  }
}

async function createJob(styleKey, config) {
  const style = STYLES[styleKey];
  const modelCfg = MODEL_MAP.gemini;

  const generationId = randomUUID();
  const jobId = randomUUID();

  const job = {
    id: jobId,
    generationId,
    userId: SYSTEM_USER_ID,
    styleKey,
    styleName: style.name,
    stylePrompt: style.prompt,
    version: 1,
    model: modelCfg.model,
    provider: modelCfg.providerName,
    prompt: config.prompt,
    mode: config.mode,
    fromJobId: null,
    billingMode: 'byok',
    creditCost: 0,
    uploadIds: [],
  };

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Insert generation
    await client.query(
      `INSERT INTO designfast.generations (id, user_id, prompt, mode, theme_mode, status, job_count)
       VALUES ($1, $2, $3, $4, 'explicit', 'running', 1)`,
      [generationId, SYSTEM_USER_ID, config.prompt, config.mode]
    );

    // Insert job
    await client.query(
      `INSERT INTO designfast.jobs (id, generation_id, user_id, style_key, style_name, model, provider, version, status, prompt, mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'queued', $9, $10)`,
      [jobId, generationId, SYSTEM_USER_ID, styleKey, style.name, modelCfg.model, modelCfg.providerName, 1, config.prompt, config.mode]
    );

    // Push to Queen
    await queen
      .queue('designfast-jobs')
      .partition(jobId)
      .push([{ data: job }]);

    await client.query('COMMIT');
    return { jobId, generationId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function waitForJob(jobId, timeoutMs = 300000) {
  const pollInterval = 2000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const { rows } = await query(
      `SELECT status, error_message FROM designfast.jobs WHERE id = $1`,
      [jobId]
    );

    if (rows.length === 0) {
      throw new Error('Job not found');
    }

    const { status, error_message } = rows[0];

    if (status === 'done') {
      return true;
    }
    if (status === 'failed') {
      throw new Error(`Job failed: ${error_message}`);
    }

    process.stdout.write('.');
    await new Promise(r => setTimeout(r, pollInterval));
  }

  throw new Error('Job timed out');
}

async function downloadJobFiles(jobId, outputDir) {
  const { rows: files } = await query(
    `SELECT DISTINCT ON (filename) filename, content
     FROM designfast.job_files
     WHERE job_id = $1
     ORDER BY filename, revision DESC`,
    [jobId]
  );

  if (files.length === 0) {
    throw new Error('No files generated');
  }

  mkdirSync(outputDir, { recursive: true });

  for (const file of files) {
    writeFileSync(join(outputDir, file.filename), file.content, 'utf8');
  }

  return files.map(f => f.filename);
}

async function generateExample(styleKey) {
  const style = STYLES[styleKey];
  const config = STYLE_PROMPTS[styleKey];

  if (!style) {
    console.error(`Unknown style: ${styleKey}`);
    return false;
  }

  if (!config) {
    console.error(`No prompt config for style: ${styleKey}`);
    return false;
  }

  const outputDir = join(EXAMPLES_DIR, styleKey);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Generating: ${style.name} (${styleKey})`);
  console.log(`Prompt: ${config.prompt}`);
  console.log(`Mode: ${config.mode}`);
  console.log(`Output: ${outputDir}`);
  console.log(`${'─'.repeat(60)}`);

  try {
    // Create job via the pipeline
    console.log('  Creating job...');
    const { jobId } = await createJob(styleKey, config);
    console.log(`  Job ID: ${jobId}`);

    // Wait for completion
    process.stdout.write('  Waiting for completion');
    await waitForJob(jobId);
    console.log(' done!');

    // Download files
    const files = await downloadJobFiles(jobId, outputDir);
    for (const f of files) {
      console.log(`  ✓ Saved ${f}`);
    }

    console.log(`  ✓ Complete!`);
    return true;

  } catch (err) {
    console.error(`\n  ✗ Failed: ${err.message}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const styleArg = args.find(a => a.startsWith('--style='));
  const specificStyle = styleArg ? styleArg.split('=')[1] : null;

  const styleKeys = specificStyle ? [specificStyle] : Object.keys(STYLES);
  const modelCfg = MODEL_MAP.gemini;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         DesignFast Style Example Generator                 ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Styles to generate: ${styleKeys.length.toString().padEnd(36)}║`);
  console.log(`║  Provider: ${modelCfg.providerName.padEnd(46)}║`);
  console.log(`║  Model: ${modelCfg.model.padEnd(49)}║`);
  console.log(`║  Output: examples/<style>/                                 ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (dryRun) {
    console.log('\n[DRY RUN] Would generate examples for:');
    for (const styleKey of styleKeys) {
      const style = STYLES[styleKey];
      const config = STYLE_PROMPTS[styleKey];
      console.log(`  - ${style?.name || styleKey}: "${config?.prompt || 'NO PROMPT'}"`);
    }
    return;
  }

  // Check for API key
  if (!process.env.GOOGLE_API_KEY) {
    console.error('\n✗ Error: GOOGLE_API_KEY environment variable is required');
    console.error('  Set it in your .env file');
    process.exit(1);
  }

  // Ensure system user exists
  await ensureSystemUser();

  const results = { success: [], failed: [] };

  for (const styleKey of styleKeys) {
    const success = await generateExample(styleKey);
    if (success) {
      results.success.push(styleKey);
    } else {
      results.failed.push(styleKey);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                        Summary                             ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  ✓ Success: ${results.success.length.toString().padEnd(45)}║`);
  console.log(`║  ✗ Failed: ${results.failed.length.toString().padEnd(46)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  if (results.failed.length > 0) {
    console.log('\nFailed styles:', results.failed.join(', '));
  }

  // Close DB pool
  await db.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
