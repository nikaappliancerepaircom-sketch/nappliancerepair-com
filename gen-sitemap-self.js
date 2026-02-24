/**
 * Generate sitemap.xml for nappliancerepair.com (CI-safe, cross-platform)
 * Uses __dirname so it works on both Windows and Ubuntu (GitHub Actions)
 */
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://nappliancerepair.com';
const SITE_DIR = __dirname;

function getLastmod(filename) {
  if (filename === 'index.html') return '2025-10-15';
  if (filename.match(/^(fridge-repair|washer-repair|dryer-repair|dishwasher-repair|oven-repair|stove-repair)\.html$/)) return '2025-11-03';
  if (filename.match(/^(toronto|mississauga|brampton)\.html$/)) return '2025-11-18';
  if (filename.match(/^(scarborough|north-york|etobicoke|vaughan|markham|richmond-hill)\.html$/)) return '2025-12-20';
  if (filename.match(/^(ajax|pickering|whitby|oshawa|oakville|burlington)\.html$/)) return '2026-01-08';
  if (filename.match(/-(toronto|mississauga|brampton|scarborough|north-york|etobicoke)\.html$/)) return '2026-01-20';
  if (filename.match(/-(ajax|pickering|whitby|oshawa|oakville|burlington|vaughan|markham|richmond-hill)\.html$/)) return '2026-02-05';
  if (filename.match(/^blog\//)) return '2026-02-10';
  if (filename.match(/^(about|contact|book|pricing|services|locations|brands|areas|emergency)\.html$/)) return '2025-11-25';
  return '2026-01-15';
}

function getPriority(filename) {
  if (filename === 'index.html') return '1.0';
  if (filename.includes('emergency') || filename.includes('same-day')) return '0.9';
  if (filename.match(/^(fridge-repair|washer-repair|dryer-repair|dishwasher-repair|oven-repair|stove-repair)\.html$/)) return '0.9';
  if (filename.match(/^(toronto|mississauga|brampton|scarborough|north-york)\.html$/)) return '0.8';
  if (filename.match(/-(toronto|mississauga|brampton)\.html$/)) return '0.8';
  if (filename.match(/^blog\//)) return '0.7';
  return '0.6';
}

function buildUrls(dir, prefix) {
  const urls = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('_') && !item.name.startsWith('.') && item.name !== 'node_modules') {
      urls.push(...buildUrls(path.join(dir, item.name), prefix + item.name + '/'));
    } else if (item.isFile() && item.name.endsWith('.html') && !item.name.startsWith('_')) {
      const skip = ['404.html', 'service-template.html'];
      if (skip.includes(item.name)) continue;
      const rel = prefix + item.name;
      const loc = item.name === 'index.html' && prefix === ''
        ? DOMAIN + '/'
        : DOMAIN + '/' + rel.replace(/\.html$/, '');
      urls.push({ loc, lastmod: getLastmod(rel), priority: getPriority(rel) });
    }
  }
  return urls;
}

const urls = buildUrls(SITE_DIR, '');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(SITE_DIR, 'sitemap.xml'), xml);
console.log(`Sitemap generated: ${urls.length} URLs → nappliancerepair.com/sitemap.xml`);
