/**
 * Google Indexing API — Fast submission for priority pages
 *
 * PREREQUISITES:
 * 1. DNS must be pointing to Vercel (A record: 76.76.21.21)
 * 2. Sites must be verified in Google Search Console
 * 3. Service account must be added as owner in GSC for each property
 * 4. GOOGLE_INDEXING_SA environment variable must contain service account JSON
 *
 * Usage:
 *   GOOGLE_INDEXING_SA="$(cat service-account.json)" node fast-index.js
 */

const https = require('https');

const SITES = [
  {
    domain: 'https://nappliancerepair.com',
    name: 'nappliancerepair',
    urls: [
      '/',
      '/washing-machine-repair.html',
      '/refrigerator-repair.html',
      '/dryer-repair.html',
      '/dishwasher-repair.html',
      '/stove-repair.html',
      '/near-me.html',
      '/toronto.html',
      '/emergency.html',
      '/lg-appliance-repair.html',
      '/samsung-appliance-repair.html',
      '/bosch-appliance-repair.html',
      '/about.html',
      '/blog/fridge-not-cooling-fix.html',
      '/blog/washer-wont-drain.html',
    ],
  },
  {
    domain: 'https://appliancerepairneary.com',
    name: 'appliancerepairneary',
    urls: [
      '/',
      '/appliance-repair-near-me.html',
      '/fridge-repair-near-me.html',
      '/washer-repair-near-me.html',
      '/dryer-repair-near-me.html',
      '/dishwasher-repair-near-me.html',
      '/stove-repair-near-me.html',
      '/emergency-appliance-repair-near-me.html',
      '/appliance-repair-toronto.html',
      '/washer-not-draining-near-me.html',
      '/fridge-not-cooling-near-me.html',
      '/about.html',
      '/blog/find-appliance-repair-near-me.html',
      '/blog/same-day-repair-worth-it.html',
      '/blog/appliance-repair-cost-gta-2026.html',
    ],
  },
  {
    domain: 'https://fixlifyservices.com',
    name: 'fixlifyservices',
    urls: [
      '/',
      '/appliance-repair-toronto.html',
      '/fridge-repair-toronto.html',
      '/washer-repair-toronto.html',
      '/dryer-repair-toronto.html',
      '/dishwasher-repair-toronto.html',
      '/oven-repair-toronto.html',
      '/emergency-appliance-repair-toronto.html',
      '/samsung-appliance-repair.html',
      '/lg-appliance-repair.html',
      '/bosch-appliance-repair.html',
      '/about.html',
      '/blog/fridge-repair-cost-toronto-2026.html',
      '/blog/online-appliance-repair-booking-guide.html',
      '/blog/washer-repair-replace-calculator.html',
    ],
  },
];

async function getAccessToken(saJson) {
  // Simple JWT-based service account auth
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
      res.on('end', () => resolve({ status: res.statusCode, url }));
    });
    req.on('error', e => resolve({ status: 'ERR', url, err: e.message }));
    req.write(body);
    req.end();
  });
}

async function main() {
  const saJson = process.env.GOOGLE_INDEXING_SA;
  if (!saJson) {
    console.error('ERROR: Set GOOGLE_INDEXING_SA env var with service account JSON');
    console.log('\nTo use: GOOGLE_INDEXING_SA="$(cat service-account.json)" node fast-index.js');
    process.exit(1);
  }

  let token;
  try {
    token = await getAccessToken(saJson);
    console.log('Auth OK\n');
  } catch (e) {
    console.error('Auth failed:', e.message);
    process.exit(1);
  }

  for (const site of SITES) {
    console.log(`=== ${site.name} ===`);
    for (const path of site.urls) {
      const url = site.domain + path;
      const result = await submitUrl(token, url);
      const ok = result.status === 200;
      console.log(`  ${ok ? '✓' : '✗'} [${result.status}] ${url}`);
      await new Promise(r => setTimeout(r, 200)); // rate limit
    }
    console.log('');
  }
  console.log('Done! URLs submitted to Google Indexing API.');
}

main().catch(e => { console.error(e); process.exit(1); });
