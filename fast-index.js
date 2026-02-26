/**
 * Google Indexing API — Fast submission for priority pages (~70 URLs/site)
 *
 * PREREQUISITES:
 * 1. DNS must be pointing to Vercel (A record: 76.76.21.21)
 * 2. Sites must be verified in Google Search Console
 * 3. Service account must be added as owner in GSC for each property
 * 4. GOOGLE_INDEXING_SA environment variable must contain service account JSON
 *
 * Usage:
 *   GOOGLE_INDEXING_SA="$(cat service-account.json)" node fast-index.js
 *   GOOGLE_INDEXING_SA="$(cat service-account.json)" node fast-index.js --site nar
 */

const https = require('https');

const SITES = [
  {
    domain: 'https://nappliancerepair.com',
    name: 'nappliancerepair',
    urls: [
      // Homepage
      '/',
      // Core service pages
      '/fridge-repair',
      '/washer-repair',
      '/dryer-repair',
      '/dishwasher-repair',
      '/oven-repair',
      '/stove-repair',
      '/dishwasher-installation',
      '/gas-appliance-repair',
      '/gas-stove-repair',
      '/gas-dryer-repair',
      '/gas-oven-repair',
      // City hub pages
      '/toronto',
      '/mississauga',
      '/brampton',
      '/scarborough',
      '/north-york',
      '/etobicoke',
      '/markham',
      '/richmond-hill',
      '/vaughan',
      '/oakville',
      '/burlington',
      '/ajax',
      '/whitby',
      '/pickering',
      '/oshawa',
      // Fridge repair × top cities
      '/fridge-repair-mississauga',
      '/fridge-repair-north-york',
      '/fridge-repair-scarborough',
      '/fridge-repair-vaughan',
      '/fridge-repair-etobicoke-village',
      // Washer repair × top cities
      '/washer-repair-north-york',
      '/washer-repair-scarborough',
      '/washer-repair-etobicoke',
      '/washer-repair-markham',
      '/washer-repair-mississauga',
      // Dryer repair × top cities
      '/dryer-repair-toronto',
      '/dryer-repair-mississauga',
      '/dryer-repair-brampton',
      '/dryer-repair-markham',
      '/dryer-repair-east-york',
      // Oven repair × top areas
      '/oven-repair-toronto',
      '/oven-repair-mississauga',
      '/oven-repair-willowdale',
      '/oven-repair-midtown',
      '/oven-repair-the-annex',
      // Dishwasher repair × top areas
      '/dishwasher-repair-toronto',
      '/dishwasher-repair-mississauga',
      '/dishwasher-repair-midtown',
      '/dishwasher-repair-scarborough-village',
      '/dishwasher-repair-willowdale',
      // Brand pages
      '/lg-repair',
      '/samsung-repair',
      '/whirlpool-repair',
      '/bosch-repair',
      '/ge-repair',
      '/miele-repair',
      '/frigidaire-repair',
      '/kenmore-repair',
      '/kitchenaid-repair',
      '/maytag-repair',
      // Utility
      '/about',
      '/book',
      '/blog/index',
      // Top blog posts
      '/blog/washer-wont-drain',
      '/blog/dryer-not-heating',
      '/blog/fridge-not-cooling-fix',
      '/blog/whirlpool-washer-problems',
      '/blog/whirlpool-washer-f21-error-code',
    ],
  },
  {
    domain: 'https://appliancerepairneary.com',
    name: 'appliancerepairneary',
    urls: [
      // Homepage
      '/',
      // Core near-me service pages
      '/fridge-repair-near-me',
      '/washer-repair-near-me',
      '/dryer-repair-near-me',
      '/dishwasher-repair-near-me',
      '/oven-repair-near-me',
      '/stove-repair-near-me',
      // Symptom-based near-me pages
      '/fridge-not-cooling-near-me',
      '/dryer-not-heating-near-me',
      '/dishwasher-not-draining-near-me',
      '/freezer-not-working-near-me',
      '/fridge-leaking-near-me',
      '/washer-not-draining-near-me',
      '/washer-making-noise-near-me',
      '/washer-dryer-repair-near-me',
      '/oven-not-heating-near-me',
      // Fridge repair × top cities
      '/fridge-repair-toronto',
      '/fridge-repair-mississauga',
      '/fridge-repair-brampton',
      '/fridge-repair-scarborough',
      '/fridge-repair-north-york',
      // Washer repair × top cities
      '/washer-repair-toronto',
      '/washer-repair-mississauga',
      '/washer-repair-brampton',
      '/washer-repair-scarborough',
      '/washer-repair-north-york',
      // Dryer repair × top cities
      '/dryer-repair-toronto',
      '/dryer-repair-mississauga',
      '/dryer-repair-brampton',
      '/dryer-repair-scarborough',
      '/dryer-repair-north-york',
      // Oven repair × top cities
      '/oven-repair-toronto',
      '/oven-repair-mississauga',
      '/oven-repair-brampton',
      '/oven-repair-scarborough',
      '/oven-repair-north-york',
      // Dishwasher repair × top cities
      '/dishwasher-repair-toronto',
      '/dishwasher-repair-mississauga',
      '/dishwasher-repair-brampton',
      '/dishwasher-repair-scarborough',
      '/dishwasher-repair-north-york',
      // Brand pages
      '/lg-repair',
      '/samsung-repair',
      '/whirlpool-repair',
      '/bosch-repair',
      '/ge-repair',
      '/miele-repair',
      '/frigidaire-repair',
      '/kenmore-repair',
      '/kitchenaid-repair',
      '/maytag-repair',
      // Gas pages
      '/gas-appliance-repair',
      '/gas-stove-repair',
      '/gas-dryer-repair',
      '/gas-oven-repair',
      '/gas-appliance-repair-toronto',
      '/gas-appliance-repair-mississauga',
      '/gas-appliance-repair-scarborough',
      '/gas-appliance-repair-north-york',
      '/gas-appliance-repair-etobicoke',
      '/gas-dryer-repair-toronto',
      // Utility
      '/about',
      '/book',
      '/areas',
      '/blog/index',
      // Top blog posts
      '/blog/find-appliance-repair-near-me',
      '/blog/same-day-repair-worth-it',
      '/blog/appliance-repair-cost-gta-2026',
      '/blog/dryer-not-heating-near-me',
      '/blog/fridge-not-cooling-near-me',
    ],
  },
  {
    domain: 'https://fixlifyservices.com',
    name: 'fixlifyservices',
    urls: [
      // Homepage
      '/',
      // Core service pages
      '/fridge-repair',
      '/washer-repair',
      '/dryer-repair',
      '/dishwasher-repair',
      '/oven-repair',
      '/stove-repair',
      '/dishwasher-installation',
      '/emergency',
      '/appliance-repair-cost-toronto',
      '/gas-appliance-repair',
      // City hub pages
      '/toronto',
      '/mississauga',
      '/brampton',
      '/scarborough',
      '/north-york',
      '/etobicoke',
      '/markham',
      '/richmond-hill',
      '/vaughan',
      '/oakville',
      '/burlington',
      '/whitby',
      '/pickering',
      '/oshawa',
      '/ajax',
      // Fridge repair × top cities
      '/fridge-repair-toronto',
      '/fridge-repair-mississauga',
      '/fridge-repair-brampton',
      '/fridge-repair-scarborough',
      '/fridge-repair-north-york',
      // Washer repair × top cities
      '/washer-repair-toronto',
      '/washer-repair-mississauga',
      '/washer-repair-brampton',
      '/washer-repair-scarborough',
      '/washer-repair-north-york',
      // Dryer repair × top cities
      '/dryer-repair-toronto',
      '/dryer-repair-mississauga',
      '/dryer-repair-brampton',
      '/dryer-repair-scarborough',
      '/dryer-repair-north-york',
      // Oven repair × top cities
      '/oven-repair-toronto',
      '/oven-repair-mississauga',
      '/oven-repair-brampton',
      '/oven-repair-scarborough',
      '/oven-repair-north-york',
      // Dishwasher repair × top cities
      '/dishwasher-repair-toronto',
      '/dishwasher-repair-mississauga',
      '/dishwasher-repair-brampton',
      '/dishwasher-repair-scarborough',
      '/dishwasher-repair-north-york',
      // Brand pages
      '/lg-repair',
      '/samsung-repair',
      '/whirlpool-repair',
      '/bosch-appliance-repair',
      '/ge-repair',
      '/miele-repair',
      '/frigidaire-repair',
      '/kenmore-appliance-repair',
      '/kitchenaid-repair',
      '/maytag-repair',
      // Utility
      '/about',
      '/book',
      '/blog/index',
      // Top blog posts
      '/blog/fridge-repair-cost-toronto-2026',
      '/blog/samsung-fridge-problems-toronto',
      '/blog/oven-repair-cost-toronto',
      '/blog/washer-repair-replace-calculator',
      '/blog/online-appliance-repair-booking-guide',
    ],
  },
];

async function getAccessToken(saJson) {
  // Simple JWT-based service account auth
  const { createSign } = require('crypto');
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000) - 3600; // subtract 1h for local clock skew
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
    console.log('Filter to one site: GOOGLE_INDEXING_SA="..." node fast-index.js --site nar');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const siteFilter = args.includes('--site') ? args[args.indexOf('--site') + 1] : null;

  let token;
  try {
    token = await getAccessToken(saJson);
    console.log('Auth OK\n');
  } catch (e) {
    console.error('Auth failed:', e.message);
    process.exit(1);
  }

  const sitesToProcess = siteFilter
    ? SITES.filter(s => s.name.includes(siteFilter))
    : SITES;

  for (const site of sitesToProcess) {
    console.log(`=== ${site.name} (${site.urls.length} URLs) ===`);
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
