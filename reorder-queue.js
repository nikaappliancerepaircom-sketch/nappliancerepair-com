/**
 * Reorder drip queues: put priority URLs first (in exact priority order), then remaining.
 * Runs for all 3 satellite sites.
 */
const fs = require('fs');

const SITES = [
  {
    name: 'NAR',
    domain: 'https://nappliancerepair.com',
    queueFile: 'C:/nappliancerepair/url-drip-queue.json',
    isObject: true, // { site, generated, total, urls: [] }
    priority: [
      // Homepage
      '/',
      // Core services
      '/fridge-repair', '/washer-repair', '/dryer-repair', '/dishwasher-repair',
      '/oven-repair', '/stove-repair', '/dishwasher-installation',
      '/gas-appliance-repair', '/gas-stove-repair', '/gas-dryer-repair', '/gas-oven-repair',
      // City hubs
      '/toronto', '/mississauga', '/brampton', '/scarborough', '/north-york',
      '/etobicoke', '/markham', '/richmond-hill', '/vaughan', '/oakville',
      '/burlington', '/ajax', '/whitby', '/pickering', '/oshawa',
      // Fridge × cities
      '/fridge-repair-mississauga', '/fridge-repair-north-york', '/fridge-repair-scarborough',
      '/fridge-repair-vaughan', '/fridge-repair-etobicoke-village',
      // Washer × cities
      '/washer-repair-north-york', '/washer-repair-scarborough', '/washer-repair-etobicoke',
      '/washer-repair-markham', '/washer-repair-mississauga',
      // Dryer × cities
      '/dryer-repair-toronto', '/dryer-repair-mississauga', '/dryer-repair-brampton',
      '/dryer-repair-markham', '/dryer-repair-east-york',
      // Oven × cities
      '/oven-repair-toronto', '/oven-repair-mississauga', '/oven-repair-willowdale',
      '/oven-repair-midtown', '/oven-repair-the-annex',
      // Dishwasher × cities
      '/dishwasher-repair-toronto', '/dishwasher-repair-mississauga', '/dishwasher-repair-midtown',
      '/dishwasher-repair-scarborough-village', '/dishwasher-repair-willowdale',
      // Brands
      '/lg-repair', '/samsung-repair', '/whirlpool-repair', '/bosch-repair', '/ge-repair',
      '/miele-repair', '/frigidaire-repair', '/kenmore-repair', '/kitchenaid-repair', '/maytag-repair',
      // Utility + blog
      '/about', '/book', '/blog/index',
      '/blog/washer-wont-drain', '/blog/dryer-not-heating', '/blog/fridge-not-cooling-fix',
      '/blog/whirlpool-washer-problems', '/blog/whirlpool-washer-f21-error-code',
    ],
  },
  {
    name: 'NEARY',
    domain: 'https://appliancerepairneary.com',
    queueFile: 'C:/appliancerepairneary/url-drip-queue.json',
    isObject: false,
    priority: [
      '/',
      // Core near-me
      '/fridge-repair-near-me', '/washer-repair-near-me', '/dryer-repair-near-me',
      '/dishwasher-repair-near-me', '/oven-repair-near-me', '/stove-repair-near-me',
      // Symptom near-me
      '/fridge-not-cooling-near-me', '/dryer-not-heating-near-me', '/dishwasher-not-draining-near-me',
      '/freezer-not-working-near-me', '/fridge-leaking-near-me', '/washer-not-draining-near-me',
      '/washer-making-noise-near-me', '/washer-dryer-repair-near-me', '/oven-not-heating-near-me',
      // Fridge × top cities
      '/fridge-repair-toronto', '/fridge-repair-mississauga', '/fridge-repair-brampton',
      '/fridge-repair-scarborough', '/fridge-repair-north-york',
      // Washer × top cities
      '/washer-repair-toronto', '/washer-repair-mississauga', '/washer-repair-brampton',
      '/washer-repair-scarborough', '/washer-repair-north-york',
      // Dryer × top cities
      '/dryer-repair-toronto', '/dryer-repair-mississauga', '/dryer-repair-brampton',
      '/dryer-repair-scarborough', '/dryer-repair-north-york',
      // Oven × top cities
      '/oven-repair-toronto', '/oven-repair-mississauga', '/oven-repair-brampton',
      '/oven-repair-scarborough', '/oven-repair-north-york',
      // Dishwasher × top cities
      '/dishwasher-repair-toronto', '/dishwasher-repair-mississauga', '/dishwasher-repair-brampton',
      '/dishwasher-repair-scarborough', '/dishwasher-repair-north-york',
      // Brands
      '/lg-repair', '/samsung-repair', '/whirlpool-repair', '/bosch-repair', '/ge-repair',
      '/miele-repair', '/frigidaire-repair', '/kenmore-repair', '/kitchenaid-repair', '/maytag-repair',
      // Gas
      '/gas-appliance-repair', '/gas-stove-repair', '/gas-dryer-repair', '/gas-oven-repair',
      '/gas-appliance-repair-toronto', '/gas-appliance-repair-mississauga',
      '/gas-appliance-repair-scarborough', '/gas-appliance-repair-north-york',
      '/gas-appliance-repair-etobicoke', '/gas-dryer-repair-toronto',
      // Utility + blog
      '/about', '/book', '/areas', '/blog/index',
      '/blog/find-appliance-repair-near-me', '/blog/same-day-repair-worth-it',
      '/blog/appliance-repair-cost-gta-2026', '/blog/dryer-not-heating-near-me',
      '/blog/fridge-not-cooling-near-me',
    ],
  },
  {
    name: 'FIXLIFY',
    domain: 'https://fixlifyservices.com',
    queueFile: 'C:/fixlifyservices/url-drip-queue.json',
    isObject: false,
    priority: [
      '/',
      // Core services
      '/fridge-repair', '/washer-repair', '/dryer-repair', '/dishwasher-repair',
      '/oven-repair', '/stove-repair', '/dishwasher-installation',
      '/emergency', '/appliance-repair-cost-toronto', '/gas-appliance-repair',
      // City hubs
      '/toronto', '/mississauga', '/brampton', '/scarborough', '/north-york',
      '/etobicoke', '/markham', '/richmond-hill', '/vaughan', '/oakville',
      '/burlington', '/whitby', '/pickering', '/oshawa', '/ajax',
      // Fridge × top cities
      '/fridge-repair-toronto', '/fridge-repair-mississauga', '/fridge-repair-brampton',
      '/fridge-repair-scarborough', '/fridge-repair-north-york',
      // Washer × top cities
      '/washer-repair-toronto', '/washer-repair-mississauga', '/washer-repair-brampton',
      '/washer-repair-scarborough', '/washer-repair-north-york',
      // Dryer × top cities
      '/dryer-repair-toronto', '/dryer-repair-mississauga', '/dryer-repair-brampton',
      '/dryer-repair-scarborough', '/dryer-repair-north-york',
      // Oven × top cities
      '/oven-repair-toronto', '/oven-repair-mississauga', '/oven-repair-brampton',
      '/oven-repair-scarborough', '/oven-repair-north-york',
      // Dishwasher × top cities
      '/dishwasher-repair-toronto', '/dishwasher-repair-mississauga', '/dishwasher-repair-brampton',
      '/dishwasher-repair-scarborough', '/dishwasher-repair-north-york',
      // Brands
      '/lg-repair', '/samsung-repair', '/whirlpool-repair', '/bosch-appliance-repair', '/ge-repair',
      '/miele-repair', '/frigidaire-repair', '/kenmore-appliance-repair', '/kitchenaid-repair', '/maytag-repair',
      // Utility + blog
      '/about', '/book', '/blog/index',
      '/blog/fridge-repair-cost-toronto-2026', '/blog/samsung-fridge-problems-toronto',
      '/blog/oven-repair-cost-toronto', '/blog/washer-repair-replace-calculator',
      '/blog/online-appliance-repair-booking-guide',
    ],
  },
];

for (const site of SITES) {
  // Build full priority URLs in exact priority order
  const priorityFull = site.priority.map(p => site.domain + (p === '/' ? '/' : p));
  const prioritySet = new Set(priorityFull);

  // Read existing queue
  const raw = fs.readFileSync(site.queueFile, 'utf8');
  let existingUrls;
  let queueObj = null;

  if (site.isObject) {
    queueObj = JSON.parse(raw);
    existingUrls = queueObj.urls;
  } else {
    existingUrls = JSON.parse(raw);
  }

  // Remaining: existing URLs NOT in priority list (preserve their original order)
  const remaining = existingUrls.filter(u => !prioritySet.has(u));

  // Final order: ALL priority URLs first (exact priority order), then remaining
  const reordered = [...priorityFull, ...remaining];

  if (site.isObject) {
    queueObj.urls = reordered;
    queueObj.total = reordered.length;
    queueObj.reordered = new Date().toISOString().split('T')[0];
    fs.writeFileSync(site.queueFile, JSON.stringify(queueObj, null, 2), 'utf8');
  } else {
    fs.writeFileSync(site.queueFile, JSON.stringify(reordered, null, 2), 'utf8');
  }

  console.log(`${site.name}: ${priorityFull.length} priority first, ${remaining.length} remaining — total ${reordered.length}`);
  console.log(`  Positions 1-5:  ${reordered.slice(0, 5).map(u => u.replace(site.domain, '') || '/').join(', ')}`);
  console.log(`  Position 10-14: ${reordered.slice(9, 14).map(u => u.replace(site.domain, '') || '/').join(', ')}`);
  console.log(`  Position 68-72: ${reordered.slice(67, 72).map(u => u.replace(site.domain, '') || '/').join(', ')}`);
  console.log('');
}
