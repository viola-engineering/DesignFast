#!/usr/bin/env node

/**
 * Release script - syncs version across all package.json files
 *
 * Usage:
 *   node scripts/release.js patch   # 0.1.0 -> 0.1.1
 *   node scripts/release.js minor   # 0.1.0 -> 0.2.0
 *   node scripts/release.js major   # 0.1.0 -> 1.0.0
 *   node scripts/release.js 1.2.3   # Set explicit version
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PACKAGE_FILES = [
  'package.json',
  'frontend/package.json'
];

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
}

function writeJson(path, data) {
  writeFileSync(join(ROOT, path), JSON.stringify(data, null, 2) + '\n');
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    default:
      if (/^\d+\.\d+\.\d+$/.test(type)) return type;
      throw new Error(`Invalid version type: ${type}`);
  }
}

function main() {
  const type = process.argv[2];
  if (!type) {
    console.error('Usage: node scripts/release.js <patch|minor|major|x.y.z>');
    process.exit(1);
  }

  const rootPkg = readJson('package.json');
  const currentVersion = rootPkg.version;
  const newVersion = bumpVersion(currentVersion, type);

  console.log(`Bumping version: ${currentVersion} -> ${newVersion}\n`);

  // Update all package.json files
  for (const file of PACKAGE_FILES) {
    const pkg = readJson(file);
    pkg.version = newVersion;
    writeJson(file, pkg);
    console.log(`  Updated ${file}`);
  }

  // Git operations
  console.log('\nCreating git commit and tag...');
  execSync('git add package.json frontend/package.json', { cwd: ROOT });
  execSync(`git commit -m "chore: release v${newVersion}"`, { cwd: ROOT });
  execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { cwd: ROOT });

  console.log(`\nRelease v${newVersion} created!`);
  console.log('\nNext steps:');
  console.log('  1. Update CHANGELOG.md with release notes');
  console.log('  2. Push with tags: git push && git push --tags');
}

main();
