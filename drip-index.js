/**
 * Google Indexing API — Drip queue
 * Submits N URLs/day, adds them to sitemap-published.json, regenerates sitemap.xml
 * Usage: node drip-index.js [--count N] [--dry-run]
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'url-drip-queue.json');
const PUBLISHED_FILE = path.join(__dirname, 'sitemap-published.json');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');
const DEFAULT_COUNT = 2;
const DELAY_MS = 300;

async function getAccessToken(saJson) {
  const { createSign } = require('crypto');
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => { const j = JSON.parse(data); j.access_token ? resolve(j.access_token) : reject(new Error(data)); });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function submitUrl(token, url) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = https.request({
      hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish', method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, url }));
    });
    req.on('error', e => resolve({ status: 'ERR', url, err: e.message }));
    req.write(body); req.end();
  });
}

function addToSitemapAndRegenerate(urls) {
  if (!fs.existsSync(PUBLISHED_FILE)) return;
  const published = JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf8'));
  const existing = new Set(published.map(p => p.url));
  const today = new Date().toISOString().split('T')[0];
  let added = 0;
  for (const url of urls) {
    if (!existing.has(url)) {
      published.push({ url, lastmod: today, priority: '0.6' });
      added++;
    }
  }
  if (added > 0) {
    fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(published, null, 2));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${published.map(u => `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;
    fs.writeFileSync(SITEMAP_FILE, xml);
    console.log(`  Sitemap updated: ${published.length} URLs`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countIdx = args.indexOf('--count');
  const count = countIdx !== -1 ? parseInt(args[countIdx + 1]) : DEFAULT_COUNT;

  if (!fs.existsSync(QUEUE_FILE)) { console.error('Queue file not found:', QUEUE_FILE); process.exit(1); }

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  if (queue.length === 0) { console.log('Queue is empty. Nothing to submit.'); return; }

  const toSubmit = queue.splice(0, count);
  console.log(`Queue: ${queue.length + toSubmit.length} URLs → submitting ${toSubmit.length}`);

  if (dryRun) {
    console.log('\n[DRY RUN] Would submit:');
    toSubmit.forEach(u => console.log(' ', u));
    return;
  }

  const saJson = process.env.GOOGLE_INDEXING_SA;
  if (!saJson) { console.error('ERROR: Set GOOGLE_INDEXING_SA env var'); process.exit(1); }

  const token = await getAccessToken(saJson);

  for (const url of toSubmit) {
    const result = await submitUrl(token, url);
    console.log(`  ${result.status === 200 ? '✓' : '✗'} [${result.status}] ${url}`);
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  addToSitemapAndRegenerate(toSubmit);
  console.log(`\nDone. ${queue.length} URLs still in queue.`);
}

main().catch(e => { console.error(e); process.exit(1); });
