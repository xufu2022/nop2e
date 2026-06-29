#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORE = ['node_modules', '.git', 'playwright-report', 'test-results', 'playwright/.auth', 'envs'];

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full);
    if (IGNORE.some(i => rel.split(path.sep)[0] === i)) continue;
    if (e.isDirectory()) {
      walk(full, fileList);
    } else {
      fileList.push(rel.replace(/\\\\/g, '/'));
    }
  }
  return fileList;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function scoreCandidate(query, file) {
  const name = path.basename(file, path.extname(file));
  const nq = normalize(query);
  const nn = normalize(name);
  if (!nq) return 0;
  if (nn === nq) return 1000;
  if (nn.startsWith(nq)) return 900;
  if (nn.includes(nq)) return 800;
  const dist = levenshtein(nq, nn);
  // Smaller distance -> higher score
  return Math.max(0, 700 - dist);
}

function suggest(query) {
  const files = walk(ROOT);
  const candidates = files.map(f => ({ f, s: scoreCandidate(query, f) }));
  candidates.sort((a, b) => b.s - a.s || a.f.localeCompare(b.f));
  return candidates.filter(c => c.s > 0).slice(0, 15).map(c => c.f);
}

function printUsage() {
  console.log('Usage: node tools/suggest-filename.js <partial name>');
  console.log('Example: node tools/suggest-filename.js "product list"');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) { printUsage(); process.exit(1); }
  const query = args.join(' ');
  console.log(`Searching workspace for: "${query}"\n`);
  const results = suggest(query);
  if (!results.length) {
    console.log('No matches found. Try a shorter or different phrase.');
    process.exit(0);
  }
  results.forEach((r, i) => console.log(`${i + 1}. ${r}`));
}

if (require.main === module) main();
