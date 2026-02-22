/**
 * spread-dates.js
 * Spread publication dates across 3 months to avoid Google spam signals.
 * Strategy:
 *   - Core pages (index, about, contact, service hubs): 2025-11-01 to 2025-11-20 (site launch)
 *   - Service+city pages: 2025-11-15 to 2026-01-15 (ongoing content build)
 *   - Blog posts: 2025-11-22 to 2026-02-10 (1 post ~every 9 days = natural cadence)
 *   - Sitemap lastmod: matches page dates
 *
 * Run: node spread-dates.js
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  { dir: 'C:/nappliancerepair', domain: 'nappliancerepair.com' },
  { dir: 'C:/appliancerepairneary', domain: 'appliancerepairneary.com' },
  { dir: 'C:/fixlifyservices', domain: 'fixlifyservices.com' },
];

// Date helpers
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function randomBetween(start, end) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const t = s + Math.random() * (e - s);
  return new Date(t).toISOString().slice(0, 10);
}

// Deterministic: spread N items evenly between start and end
function evenSpread(start, end, count) {
  const dates = [];
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  for (let i = 0; i < count; i++) {
    const t = s + (i / Math.max(count - 1, 1)) * (e - s);
    dates.push(new Date(t).toISOString().slice(0, 10));
  }
  return dates;
}

const EXCLUDE = ['404.html', 'service-template.html'];

// Core/hub pages
const CORE_PAGES = ['index.html', 'about.html', 'contact.html', 'pricing.html', 'sitemap.xml'];
const SERVICE_HUBS = ['washer-repair.html', 'dryer-repair.html', 'fridge-repair.html',
  'dishwasher-repair.html', 'stove-repair.html', 'oven-repair.html',
  'washing-machine-repair.html', 'refrigerator-repair.html', 'appliance-repair.html'];

// Date ranges
const CORE_LAUNCH = { start: '2025-11-01', end: '2025-11-20' };
const SERVICE_CITY_RANGE = { start: '2025-11-15', end: '2026-01-20' };
const BLOG_RANGE = { start: '2025-11-25', end: '2026-02-10' };

// Page date map: filename → date (built per site)
function buildDateMap(dir) {
  const map = {};
  if (!fs.existsSync(dir)) return map;

  const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !EXCLUDE.includes(f));
  const blogDir = path.join(dir, 'blog');
  const blogFiles = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html'))
    : [];

  // Core pages
  CORE_PAGES.forEach((f, i) => {
    if (allFiles.includes(f)) {
      // Space 5 days apart starting from CORE_LAUNCH.start
      const d = new Date(CORE_LAUNCH.start);
      d.setDate(d.getDate() + i * 3);
      map[f] = d.toISOString().slice(0, 10);
    }
  });

  // Service hub pages (no city)
  const CITIES = ['toronto','north-york','etobicoke','scarborough','mississauga',
                  'brampton','vaughan','markham','richmond-hill','ajax','whitby',
                  'oakville','burlington','pickering','oshawa'];
  const cityPages = allFiles.filter(f =>
    !CORE_PAGES.includes(f) && CITIES.some(city => f.includes('-' + city))
  );
  const hubPages = allFiles.filter(f =>
    !CORE_PAGES.includes(f) && !CITIES.some(city => f.includes('-' + city))
  );

  // Hub pages: Nov 1–20
  const hubDates = evenSpread(CORE_LAUNCH.start, CORE_LAUNCH.end, Math.max(hubPages.length, 1));
  hubPages.forEach((f, i) => { map[f] = hubDates[Math.min(i, hubDates.length - 1)]; });

  // City+service pages: Nov 15 – Jan 20
  const cityDates = evenSpread(SERVICE_CITY_RANGE.start, SERVICE_CITY_RANGE.end, Math.max(cityPages.length, 1));
  cityPages.forEach((f, i) => { map[f] = cityDates[Math.min(i, cityDates.length - 1)]; });

  // Blog posts: Nov 25 – Feb 10
  const blogDates = evenSpread(BLOG_RANGE.start, BLOG_RANGE.end, Math.max(blogFiles.length, 1));
  blogFiles.forEach((f, i) => { map['blog/' + f] = blogDates[Math.min(i, blogDates.length - 1)]; });

  return map;
}

function updateHtmlDate(filePath, date) {
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Update datePublished in JSON-LD
  const before = html;
  html = html.replace(/"datePublished":\s*"[\d-]+"/g, `"datePublished": "${date}"`);
  // Update dateModified to same or +1 day
  html = html.replace(/"dateModified":\s*"[\d-]+"/g, `"dateModified": "${date}"`);
  // Update og:published_time
  html = html.replace(/property="og:published_time" content="[\d-]+"/g,
    `property="og:published_time" content="${date}"`);
  html = html.replace(/property="article:published_time" content="[\d-T:+Z]+"/g,
    `property="article:published_time" content="${date}T10:00:00+05:00"`);

  if (html !== before) {
    fs.writeFileSync(filePath, html);
    return true;
  }
  return false;
}

// Update sitemap lastmod
function updateSitemap(sitemapPath, dateMap) {
  if (!fs.existsSync(sitemapPath)) return 0;
  let xml = fs.readFileSync(sitemapPath, 'utf8');

  let count = 0;
  // Replace each <loc>...</loc> + <lastmod>...</lastmod> pair
  xml = xml.replace(/<loc>([^<]+)<\/loc>\s*<lastmod>[\d-]+<\/lastmod>/g, (match, loc) => {
    // Extract filename from loc
    const urlParts = loc.split('/');
    let file = urlParts.slice(-1)[0];
    // Check if it's a blog post
    const isBlog = loc.includes('/blog/');
    const key = isBlog ? 'blog/' + file : file;

    const date = dateMap[key] || dateMap[file] || '2025-11-15';
    count++;
    return `<loc>${loc}</loc>\n    <lastmod>${date}</lastmod>`;
  });

  fs.writeFileSync(sitemapPath, xml);
  return count;
}

// Main
let totalFiles = 0;
let totalChanged = 0;

for (const { dir, domain } of SITES) {
  if (!fs.existsSync(dir)) { console.log('SKIP:', dir); continue; }

  const dateMap = buildDateMap(dir);
  let siteChanged = 0;

  for (const [relPath, date] of Object.entries(dateMap)) {
    const filePath = path.join(dir, relPath);
    if (relPath.endsWith('.html') && updateHtmlDate(filePath, date)) {
      siteChanged++;
    }
  }

  // Update sitemap
  const sitemapPath = path.join(dir, 'sitemap.xml');
  const sitemapCount = updateSitemap(sitemapPath, dateMap);

  totalFiles += Object.keys(dateMap).length;
  totalChanged += siteChanged;

  console.log(`\n${domain}:`);
  console.log(`  Pages dated: ${Object.keys(dateMap).length}`);
  console.log(`  HTML files updated: ${siteChanged}`);
  console.log(`  Sitemap entries updated: ${sitemapCount}`);
  console.log(`  Date range: ${Object.values(dateMap).sort()[0]} → ${Object.values(dateMap).sort().slice(-1)[0]}`);
}

console.log(`\n✅ Total: ${totalChanged} files updated with natural date spread`);
console.log('Date strategy:');
console.log('  Core pages:       2025-11-01 → 2025-11-20  (site launch)');
console.log('  Service hub pages: 2025-11-01 → 2025-11-20');
console.log('  City+service pages: 2025-11-15 → 2026-01-20  (content build)');
console.log('  Blog posts:        2025-11-25 → 2026-02-10  (~1 post/9 days)');
