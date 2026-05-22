/**
 * index-priority-nar.js
 * Google Indexing API — 6 high-priority NAR URLs
 */

const https = require('https');
const { createSign } = require('crypto');

const PRIORITY_URLS = [
  'https://nappliancerepair.com/dishwasher-repair-richmond-hill',
  'https://nappliancerepair.com/richmond-hill',
  'https://nappliancerepair.com/newmarket',
  'https://nappliancerepair.com/dishwasher-repair-newmarket',
  'https://nappliancerepair.com/markham',
  'https://nappliancerepair.com/vaughan',
];

async function getAccessToken(saJson) {
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const iat = now - 60;
  const exp = now + 3000;
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat,
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data, url }));
    });
    req.on('error', e => resolve({ status: 'ERR', url, err: e.message }));
    req.write(body);
    req.end();
  });
}

async function main() {
  const saJson = process.env.GOOGLE_INDEXING_SA;
  if (!saJson) { process.stderr.write('ERROR: Set GOOGLE_INDEXING_SA\n'); process.exit(1); }

  let token;
  try {
    token = await getAccessToken(saJson);
    process.stdout.write('Auth OK\n');
  } catch (e) {
    process.stderr.write('Auth failed: ' + e.message + '\n');
    process.exit(1);
  }

  process.stdout.write('Submitting ' + PRIORITY_URLS.length + ' priority NAR URLs...\n');
  const results = [];
  for (const url of PRIORITY_URLS) {
    const r = await submitUrl(token, url);
    const mark = r.status === 200 ? 'OK' : 'FAIL';
    const line = `  [${r.status}] ${mark}  ${url}\n`;
    process.stdout.write(line);
    results.push(r);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const ok = results.filter(r => r.status === 200).length;
  const fail = results.filter(r => r.status !== 200).length;
  process.stdout.write(`\nDone: ${ok} OK, ${fail} failed\n`);

  if (fail > 0) {
    results.filter(r => r.status !== 200).forEach(r => {
      process.stdout.write(`  ERROR body for ${r.url}: ${r.body}\n`);
    });
  }
}

main().catch(e => { process.stderr.write(e.message + '\n'); process.exit(1); });
