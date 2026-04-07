#!/usr/bin/env node
/**
 * Generate screenshots for all style examples.
 *
 * Usage:
 *   node backend/scripts/generate-screenshots.js [--style=minimalist]
 *
 * Requires: puppeteer (npm install puppeteer)
 */

import puppeteer from 'puppeteer';
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(__dirname, '../../examples');

const VIEWPORT = { width: 1440, height: 900 };

async function generateScreenshot(styleKey, browser) {
  const exampleDir = join(EXAMPLES_DIR, styleKey);
  const htmlPath = join(exampleDir, 'index.html');
  const outputPath = join(exampleDir, 'thumbnail.png');

  if (!existsSync(htmlPath)) {
    console.log(`  ⊘ Skipping ${styleKey} - no index.html`);
    return false;
  }

  console.log(`  → ${styleKey}...`);

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  try {
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait a bit for any animations/fonts to settle
    await new Promise(r => setTimeout(r, 500));

    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });

    console.log(`    ✓ Saved thumbnail.png`);
    return true;
  } catch (err) {
    console.error(`    ✗ Failed: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const styleArg = args.find(a => a.startsWith('--style='));
  const specificStyle = styleArg ? styleArg.split('=')[1] : null;

  // Get all style directories
  const allStyles = readdirSync(EXAMPLES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const styleKeys = specificStyle ? [specificStyle] : allStyles;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Screenshot Generator                               ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Styles to process: ${styleKeys.length.toString().padEnd(37)}║`);
  console.log(`║  Viewport: ${VIEWPORT.width}x${VIEWPORT.height}                                   ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\nLaunching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = { success: [], failed: [] };

  for (const styleKey of styleKeys) {
    const success = await generateScreenshot(styleKey, browser);
    if (success) {
      results.success.push(styleKey);
    } else {
      results.failed.push(styleKey);
    }
  }

  await browser.close();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                        Summary                             ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  ✓ Success: ${results.success.length.toString().padEnd(45)}║`);
  console.log(`║  ✗ Failed/Skipped: ${results.failed.length.toString().padEnd(38)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
