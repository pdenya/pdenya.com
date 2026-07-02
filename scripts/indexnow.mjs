#!/usr/bin/env node
// IndexNow deploy integration for pdenya.com (zero dependencies, Node ESM).
//
// Subcommands:
//   plan   - Run AFTER `hugo` build but BEFORE `aws s3 sync`. Diffs the live
//            sitemap (previous deploy) against the freshly built local sitemap
//            and records changed URLs in .indexnow-pending.json.
//   submit - Run AFTER `aws s3 sync` (pages must be live first). Submits the
//            pending URLs to IndexNow. Use --dry-run to preview the request.
//
// The sitemap is the source of truth: a page is "changed" if its URL is new or
// its <lastmod> differs from the previously deployed sitemap.

import {
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  readdirSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const STATIC_DIR = join(REPO_ROOT, 'static');
const LOCAL_SITEMAP = join(REPO_ROOT, 'public', 'sitemap.xml');
const PENDING_FILE = join(REPO_ROOT, '.indexnow-pending.json');

const HOST = 'www.pdenya.com';
// Env overrides exist only to make edge cases testable; production uses defaults.
const LIVE_SITEMAP_URL =
  process.env.INDEXNOW_LIVE_SITEMAP_URL || `https://${HOST}/sitemap.xml`;
const INDEXNOW_ENDPOINT =
  process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const LOCAL_SITEMAP_PATH = process.env.INDEXNOW_LOCAL_SITEMAP || LOCAL_SITEMAP;

const KEY_FILE_RE = /^[0-9a-f]{32}\.txt$/;
const KEY_RE = /^[0-9a-f]{32}$/;

function fail(message) {
  console.error(`indexnow: ${message}`);
  process.exit(1);
}

// Locate the IndexNow key file in static/ and read the key from it. This file
// is the single source of truth for the key.
function loadKey() {
  let entries;
  try {
    entries = readdirSync(STATIC_DIR);
  } catch (err) {
    fail(`could not read static/ directory (${STATIC_DIR}): ${err.message}`);
  }
  const keyFiles = entries.filter((f) => KEY_FILE_RE.test(f));
  if (keyFiles.length === 0) {
    fail(
      `no IndexNow key file found in static/ (expected a file named <32-hex>.txt).\n` +
        `Generate one with: KEY=$(openssl rand -hex 16) && printf '%s' "$KEY" > static/$KEY.txt`
    );
  }
  if (keyFiles.length > 1) {
    fail(
      `multiple IndexNow key files found in static/ (${keyFiles.join(
        ', '
      )}); expected exactly one.`
    );
  }
  const keyFile = keyFiles[0];
  const key = readFileSync(join(STATIC_DIR, keyFile), 'utf8').trim();
  if (!KEY_RE.test(key)) {
    fail(
      `key file static/${keyFile} does not contain a valid 32-hex key ` +
        `(its content must be exactly the key).`
    );
  }
  // For IndexNow, the filename must be "<key>.txt". Warn if they diverged.
  if (keyFile !== `${key}.txt`) {
    console.warn(
      `indexnow: warning - key file name (${keyFile}) does not match its ` +
        `contents (${key}.txt). IndexNow requires the filename to equal <key>.txt.`
    );
  }
  return { key, keyFile, keyLocation: `https://${HOST}/${keyFile}` };
}

function urlHost(u) {
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Parse a sitemap XML string into a Map<loc, lastmod>. Hugo emits stable,
// well-formed output, so string/regex parsing is sufficient here.
function parseSitemap(xml) {
  const map = new Map();
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const block of blocks) {
    const locMatch = block.match(/<loc>\s*([\s\S]*?)\s*<\/loc>/);
    if (!locMatch) continue;
    const loc = decodeEntities(locMatch[1].trim());
    const lastmodMatch = block.match(/<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/);
    const lastmod = lastmodMatch ? lastmodMatch[1].trim() : '';
    map.set(loc, lastmod);
  }
  return map;
}

async function fetchLiveSitemap() {
  try {
    const res = await fetch(LIVE_SITEMAP_URL, {
      headers: { 'User-Agent': 'pdenya-indexnow/1.0' },
    });
    if (!res.ok) {
      console.warn(
        `indexnow: warning - live sitemap fetch returned HTTP ${res.status}; ` +
          `treating all local URLs as changed.`
      );
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(
      `indexnow: warning - could not fetch live sitemap (${LIVE_SITEMAP_URL}): ` +
        `${err.message}; treating all local URLs as changed.`
    );
    return null;
  }
}

async function plan() {
  if (!existsSync(LOCAL_SITEMAP_PATH)) {
    fail(
      `local sitemap not found at ${LOCAL_SITEMAP_PATH}. Run \`hugo\` before \`plan\`.`
    );
  }
  const newMap = parseSitemap(readFileSync(LOCAL_SITEMAP_PATH, 'utf8'));
  if (newMap.size === 0) {
    fail(`local sitemap ${LOCAL_SITEMAP_PATH} contained no <url> entries.`);
  }

  const liveXml = await fetchLiveSitemap();
  const oldMap = liveXml ? parseSitemap(liveXml) : new Map();
  const firstDeploy = liveXml === null;

  const added = [];
  const updated = [];
  let skipped = 0;
  for (const [loc, lastmod] of newMap) {
    // IndexNow only accepts URLs on the declared host. Skip anything else
    // (e.g. a stale `hugo server` build with localhost URLs) so a bad local
    // sitemap can never submit garbage.
    if (urlHost(loc) !== HOST) {
      skipped++;
      continue;
    }
    if (!oldMap.has(loc)) {
      added.push(loc);
    } else if (oldMap.get(loc) !== lastmod) {
      updated.push(loc);
    }
  }
  if (skipped) {
    console.warn(
      `indexnow: warning - skipped ${skipped} URL(s) whose host is not ${HOST} ` +
        `(a dev/localhost build?). Ensure \`hugo\` ran a production build before deploy.`
    );
  }
  const urls = [...added, ...updated];

  const pending = {
    generatedAt: new Date().toISOString(),
    host: HOST,
    firstDeploy,
    counts: { added: added.length, updated: updated.length },
    urls,
  };
  writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2) + '\n');

  if (urls.length === 0) {
    console.log('indexnow plan: no changes (sitemap matches live).');
  } else {
    const parts = [];
    if (added.length) parts.push(`${added.length} new`);
    if (updated.length) parts.push(`${updated.length} updated`);
    const prefix = firstDeploy
      ? 'indexnow plan (live sitemap unavailable, all URLs treated as changed):'
      : 'indexnow plan:';
    console.log(`${prefix} ${parts.join(', ')} URL(s) to submit.`);
    for (const loc of added) console.log(`  + ${loc}`);
    for (const loc of updated) console.log(`  ~ ${loc}`);
  }
  console.log(`indexnow plan: wrote ${PENDING_FILE}`);
}

function readPending() {
  if (!existsSync(PENDING_FILE)) return null;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(PENDING_FILE, 'utf8'));
  } catch (err) {
    fail(`could not parse ${PENDING_FILE}: ${err.message}`);
  }
  // Accept either our object format or a bare array of URLs.
  const urls = Array.isArray(parsed) ? parsed : parsed.urls;
  if (!Array.isArray(urls)) {
    fail(`${PENDING_FILE} did not contain a "urls" array.`);
  }
  return urls;
}

async function submit(dryRun) {
  const urls = readPending();
  if (urls === null || urls.length === 0) {
    console.log('indexnow submit: nothing to submit.');
    // Clean up an empty pending file so no stale state remains.
    if (urls !== null && existsSync(PENDING_FILE)) unlinkSync(PENDING_FILE);
    return;
  }

  const { key, keyLocation } = loadKey();
  const body = {
    host: HOST,
    key,
    keyLocation,
    urlList: urls,
  };

  if (dryRun) {
    console.log('indexnow submit (--dry-run): would send the following request');
    console.log(`  POST ${INDEXNOW_ENDPOINT}`);
    console.log('  Content-Type: application/json; charset=utf-8');
    console.log('  Body:');
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  let res;
  try {
    res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(
      `indexnow submit: request failed (${err.message}); pending file kept for retry.`
    );
    process.exit(1);
  }

  const text = await res.text().catch(() => '');
  if (res.status === 200 || res.status === 202) {
    console.log(
      `indexnow submit: success (HTTP ${res.status}) - submitted ${urls.length} URL(s).`
    );
    unlinkSync(PENDING_FILE);
  } else {
    console.error(
      `indexnow submit: unexpected response HTTP ${res.status}.\n${text}`
    );
    console.error(
      `indexnow submit: pending file kept (${PENDING_FILE}); safe to re-run.`
    );
    process.exit(1);
  }
}

async function main() {
  const cmd = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');
  switch (cmd) {
    case 'plan':
      await plan();
      break;
    case 'submit':
      await submit(dryRun);
      break;
    default:
      console.error('Usage: node scripts/indexnow.mjs <plan|submit> [--dry-run]');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`indexnow: unexpected error: ${err.stack || err.message}`);
  process.exit(1);
});
