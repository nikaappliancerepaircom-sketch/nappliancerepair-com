/**
 * Google Indexing API -- Drip queue (2 URLs/day)
 * Usage: node drip-index.js [--count N] [--dry-run]
 * Reads url-drip-queue.json, submits N URLs, saves updated queue
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const QUEUE_FILE = path.join(__dirname, 'url-drip-queue.json');
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
  sign.update();
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = ;

  return new Promise((resolve, reject) => {
    const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt;
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': body.length },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.access_token) resolve(json.access_token);
        else reject(new Error('Token error: ' + data));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function submitUrl(token, url) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ url, type: 'URL_UPDATED' });
    const req = https.request({
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Authorization': ,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, url }));
    });
    req.on('error', e => resolve({ status: 'ERR', url, err: e.message }));
    req.write(body);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countIdx = args.indexOf('--count');
  const count = countIdx !== -1 ? parseInt(args[countIdx + 1]) : DEFAULT_COUNT;

  if (!fs.existsSync(QUEUE_FILE)) {
    console.error('Queue file not found:', QUEUE_FILE);
    process.exit(1);
  }

  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  if (queue.length === 0) {
    console.log('Queue is empty. Nothing to submit.');
    return;
  }

  const toSubmit = queue.splice(0, count);
  console.log();

  if (dryRun) {
    console.log('
[DRY RUN] Would submit:');
    toSubmit.forEach(u => console.log('  ', u));
    return;
  }

  const saJson = process.env.GOOGLE_INDEXING_SA;
  if (!saJson) {
    console.error('ERROR: Set GOOGLE_INDEXING_SA env var');
    process.exit(1);
  }

  const token = await getAccessToken(saJson);

  for (const url of toSubmit) {
    const result = await submitUrl(token, url);
    console.log();
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });