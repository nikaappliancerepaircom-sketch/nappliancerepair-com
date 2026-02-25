/**
 * Generate sitemap.xml for nappliancerepair.com
 * Reads from sitemap-published.json (grows gradually with drip)
 */
const fs = require('fs');
const path = require('path');

const PUBLISHED_FILE = path.join(__dirname, 'sitemap-published.json');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');

const published = JSON.parse(fs.readFileSync(PUBLISHED_FILE, 'utf8'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${published.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(SITEMAP_FILE, xml);
console.log(`Sitemap: ${published.length} URLs → nappliancerepair.com/sitemap.xml`);
