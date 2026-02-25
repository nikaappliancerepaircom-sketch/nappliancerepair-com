/**
 * One-time setup: creates sitemap-published.json for all 3 satellite sites.
 * Run once: node setup-sitemap-published.js
 * Also converts NAR url-drip-queue.json from object format to plain array.
 */
const fs = require('fs');

function getLastmod(urlPath, type) {
  const p = urlPath === '/' ? 'index' : urlPath.replace(/^\//, '');
  if (p === 'index') return '2025-10-15';
  if (type === 'neary') {
    if (p.match(/^(fridge-repair|washer-repair|dryer-repair|dishwasher-repair|oven-repair|stove-repair)-near-me$/)) return '2025-11-03';
    if (p.match(/-near-me$/)) return '2025-11-25';
    if (p.match(/^(about|book|areas|brands)$/)) return '2025-11-25';
    if (p.match(/-(toronto|mississauga|brampton|scarborough|north-york|etobicoke)$/)) return '2026-01-20';
    if (p.match(/-(ajax|pickering|whitby|oshawa|oakville|burlington|vaughan|markham|richmond-hill)$/)) return '2026-02-05';
    if (p.startsWith('blog/')) return '2026-02-10';
    return '2026-01-15';
  }
  // nar + fixlify
  if (p.match(/^(fridge-repair|washer-repair|dryer-repair|dishwasher-repair|oven-repair|stove-repair)$/)) return '2025-11-03';
  if (p.match(/^(toronto|mississauga|brampton)$/)) return '2025-11-18';
  if (p.match(/^(scarborough|north-york|etobicoke|vaughan|markham|richmond-hill)$/)) return '2025-12-20';
  if (p.match(/^(ajax|pickering|whitby|oshawa|oakville|burlington)$/)) return '2026-01-08';
  if (p.match(/^(about|book|contact|locations|brands|areas|emergency|appliance-repair-cost-toronto|dishwasher-installation|gas-appliance-repair|gas-stove-repair|gas-dryer-repair|gas-oven-repair)$/)) return '2025-11-25';
  if (p.match(/-(toronto|mississauga|brampton|scarborough|north-york|etobicoke)$/)) return '2026-01-20';
  if (p.match(/-(ajax|pickering|whitby|oshawa|oakville|burlington|vaughan|markham|richmond-hill)$/)) return '2026-02-05';
  if (p.startsWith('blog/')) return '2026-02-10';
  return '2026-01-15';
}

function getPriority(urlPath, type) {
  const p = urlPath === '/' ? 'index' : urlPath.replace(/^\//, '');
  if (p === 'index') return '1.0';
  if (p.includes('emergency') || p.includes('same-day')) return '0.9';
  if (type === 'neary') {
    if (p.match(/-near-me$/) && !p.includes('-near-me-')) return '0.9';
    if (p.match(/-(toronto|mississauga|brampton)$/)) return '0.8';
    if (p.startsWith('blog/')) return '0.7';
    return '0.6';
  }
  if (p.match(/^(fridge-repair|washer-repair|dryer-repair|dishwasher-repair|oven-repair|stove-repair)$/)) return '0.9';
  if (p.match(/^(toronto|mississauga|brampton|scarborough|north-york)$/)) return '0.8';
  if (p.match(/-(toronto|mississauga|brampton)$/)) return '0.8';
  if (p.startsWith('blog/')) return '0.7';
  return '0.6';
}

const SITES = [
  {
    name: 'NAR',
    type: 'nar',
    domain: 'https://nappliancerepair.com',
    outFile: 'C:/nappliancerepair/sitemap-published.json',
    queueFile: 'C:/nappliancerepair/url-drip-queue.json',
    paths: [
      '/', '/fridge-repair', '/washer-repair', '/dryer-repair', '/dishwasher-repair',
      '/oven-repair', '/stove-repair', '/dishwasher-installation',
      '/gas-appliance-repair', '/gas-stove-repair', '/gas-dryer-repair', '/gas-oven-repair',
      '/toronto', '/mississauga', '/brampton', '/scarborough', '/north-york',
      '/etobicoke', '/markham', '/richmond-hill', '/vaughan', '/oakville',
      '/burlington', '/ajax', '/whitby', '/pickering', '/oshawa',
      '/fridge-repair-mississauga', '/fridge-repair-north-york', '/fridge-repair-scarborough',
      '/fridge-repair-vaughan', '/fridge-repair-etobicoke-village',
      '/washer-repair-north-york', '/washer-repair-scarborough', '/washer-repair-etobicoke',
      '/washer-repair-markham', '/washer-repair-mississauga',
      '/dryer-repair-toronto', '/dryer-repair-mississauga', '/dryer-repair-brampton',
      '/dryer-repair-markham', '/dryer-repair-east-york',
      '/oven-repair-toronto', '/oven-repair-mississauga', '/oven-repair-willowdale',
      '/oven-repair-midtown', '/oven-repair-the-annex',
      '/dishwasher-repair-toronto', '/dishwasher-repair-mississauga', '/dishwasher-repair-midtown',
      '/dishwasher-repair-scarborough-village', '/dishwasher-repair-willowdale',
      '/lg-repair', '/samsung-repair', '/whirlpool-repair', '/bosch-repair', '/ge-repair',
      '/miele-repair', '/frigidaire-repair', '/kenmore-repair', '/kitchenaid-repair', '/maytag-repair',
      '/about', '/book', '/blog/index',
      '/blog/washer-wont-drain', '/blog/dryer-not-heating', '/blog/fridge-not-cooling-fix',
      '/blog/whirlpool-washer-problems', '/blog/whirlpool-washer-f21-error-code',
    ],
  },
  {
    name: 'NEARY',
    type: 'neary',
    domain: 'https://appliancerepairneary.com',
    outFile: 'C:/appliancerepairneary/sitemap-published.json',
    queueFile: null,
    paths: [
      '/', '/fridge-repair-near-me', '/washer-repair-near-me', '/dryer-repair-near-me',
      '/dishwasher-repair-near-me', '/oven-repair-near-me', '/stove-repair-near-me',
      '/fridge-not-cooling-near-me', '/dryer-not-heating-near-me', '/dishwasher-not-draining-near-me',
      '/freezer-not-working-near-me', '/fridge-leaking-near-me', '/washer-not-draining-near-me',
      '/washer-making-noise-near-me', '/washer-dryer-repair-near-me', '/oven-not-heating-near-me',
      '/fridge-repair-toronto', '/fridge-repair-mississauga', '/fridge-repair-brampton',
      '/fridge-repair-scarborough', '/fridge-repair-north-york',
      '/washer-repair-toronto', '/washer-repair-mississauga', '/washer-repair-brampton',
      '/washer-repair-scarborough', '/washer-repair-north-york',
      '/dryer-repair-toronto', '/dryer-repair-mississauga', '/dryer-repair-brampton',
      '/dryer-repair-scarborough', '/dryer-repair-north-york',
      '/oven-repair-toronto', '/oven-repair-mississauga', '/oven-repair-brampton',
      '/oven-repair-scarborough', '/oven-repair-north-york',
      '/dishwasher-repair-toronto', '/dishwasher-repair-mississauga', '/dishwasher-repair-brampton',
      '/dishwasher-repair-scarborough', '/dishwasher-repair-north-york',
      '/lg-repair', '/samsung-repair', '/whirlpool-repair', '/bosch-repair', '/ge-repair',
      '/miele-repair', '/frigidaire-repair', '/kenmore-repair', '/kitchenaid-repair', '/maytag-repair',
      '/gas-appliance-repair', '/gas-stove-repair', '/gas-dryer-repair', '/gas-oven-repair',
      '/gas-appliance-repair-toronto', '/gas-appliance-repair-mississauga',
      '/gas-appliance-repair-scarborough', '/gas-appliance-repair-north-york',
      '/gas-appliance-repair-etobicoke', '/gas-dryer-repair-toronto',
      '/about', '/book', '/areas', '/blog/index',
      '/blog/find-appliance-repair-near-me', '/blog/same-day-repair-worth-it',
      '/blog/appliance-repair-cost-gta-2026', '/blog/dryer-not-heating-near-me',
      '/blog/fridge-not-cooling-near-me',
    ],
  },
  {
    name: 'FIXLIFY',
    type: 'fixlify',
    domain: 'https://fixlifyservices.com',
    outFile: 'C:/fixlifyservices/sitemap-published.json',
    queueFile: null,
    paths: [
      '/', '/fridge-repair', '/washer-repair', '/dryer-repair', '/dishwasher-repair',
      '/oven-repair', '/stove-repair', '/dishwasher-installation',
      '/emergency', '/appliance-repair-cost-toronto', '/gas-appliance-repair',
      '/toronto', '/mississauga', '/brampton', '/scarborough', '/north-york',
      '/etobicoke', '/markham', '/richmond-hill', '/vaughan', '/oakville',
      '/burlington', '/whitby', '/pickering', '/oshawa', '/ajax',
      '/fridge-repair-toronto', '/fridge-repair-mississauga', '/fridge-repair-brampton',
      '/fridge-repair-scarborough', '/fridge-repair-north-york',
      '/washer-repair-toronto', '/washer-repair-mississauga', '/washer-repair-brampton',
      '/washer-repair-scarborough', '/washer-repair-north-york',
      '/dryer-repair-toronto', '/dryer-repair-mississauga', '/dryer-repair-brampton',
      '/dryer-repair-scarborough', '/dryer-repair-north-york',
      '/oven-repair-toronto', '/oven-repair-mississauga', '/oven-repair-brampton',
      '/oven-repair-scarborough', '/oven-repair-north-york',
      '/dishwasher-repair-toronto', '/dishwasher-repair-mississauga', '/dishwasher-repair-brampton',
      '/dishwasher-repair-scarborough', '/dishwasher-repair-north-york',
      '/lg-repair', '/samsung-repair', '/whirlpool-repair', '/bosch-appliance-repair', '/ge-repair',
      '/miele-repair', '/frigidaire-repair', '/kenmore-appliance-repair', '/kitchenaid-repair', '/maytag-repair',
      '/about', '/book', '/blog/index',
      '/blog/fridge-repair-cost-toronto-2026', '/blog/samsung-fridge-problems-toronto',
      '/blog/oven-repair-cost-toronto', '/blog/washer-repair-replace-calculator',
      '/blog/online-appliance-repair-booking-guide',
    ],
  },
];

for (const site of SITES) {
  const entries = site.paths.map(p => ({
    url: site.domain + p,
    lastmod: getLastmod(p, site.type),
    priority: getPriority(p, site.type),
  }));
  fs.writeFileSync(site.outFile, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`${site.name}: ${entries.length} URLs → sitemap-published.json`);
  console.log(`  First: ${entries[0].url} (${entries[0].lastmod})`);
  console.log(`  Last:  ${entries[entries.length-1].url} (${entries[entries.length-1].lastmod})`);

  // Fix NAR url-drip-queue.json (convert from object to plain array)
  if (site.queueFile) {
    const raw = JSON.parse(fs.readFileSync(site.queueFile, 'utf8'));
    if (raw.urls) {
      fs.writeFileSync(site.queueFile, JSON.stringify(raw.urls, null, 2), 'utf8');
      console.log(`  Fixed queue: converted object → plain array (${raw.urls.length} URLs)`);
    }
  }
  console.log('');
}
console.log('Done! Run gen-sitemap scripts next.');
