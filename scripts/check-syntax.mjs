#!/usr/bin/env node
/** Syntax-checks every .js file in the repo (excluding node_modules). */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IGNORE = new Set(['node_modules', '.git']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(js|mjs)$/.test(entry.name)) out.push(p);
  }
  return out;
}

import fs from 'node:fs';
const files = walk(ROOT);

if (files.length === 0) {
  console.error('No JS files found.');
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`OK   ${path.relative(ROOT, file)}`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${path.relative(ROOT, file)}\n${err.stderr}`);
  }
}

console.log(`\n${files.length - failed}/${files.length} files OK`);
process.exit(failed ? 1 : 0);
