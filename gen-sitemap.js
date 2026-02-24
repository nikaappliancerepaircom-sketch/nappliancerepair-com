const fs = require('fs');
const path = require('path');

const sites = [
  { dir: 'C:/nappliancerepair', domain: 'https://nappliancerepair.com' },
  { dir: 'C:/appliancerepairneary', domain: 'https://appliancerepairneary.com' },
  { dir: 'C:/fixlifyservices', domain: 'https://fixlifyservices.com' },
];

// Spread dates naturally over past 4 months to look organic
function getLastmod(filename) {
  // Homepage and top service pages — oldest (established)
  if (filename === 'index.html') return '2025-10-15';
  if (filename.match(/^(fridge-repair|washer-repair|dryer-repair|dishwasher-repair|oven-repair|stove-repair)\.html$/)) return '2025-11-03';
  if (filename.match(/^(toronto|mississauga|brampton)\.html$/)) return '2025-11-18';
  if (filename.match(/^(samsung|lg|whirlpool|ge|bosch|frigidaire|kenmore|maytag|kitchenaid)-appliance-repair\.html$/)) return '2025-12-05';
  if (filename.match(/^(scarborough|north-york|etobicoke|vaughan|markham|richmond-hill)\.html$/)) return '2025-12-20';
  if (filename.match(/^(ajax|pickering|whitby|oshawa|oakville|burlington)\.html$/)) return '2026-01-08';
  if (filename.match(/-(toronto|mississauga|brampton|scarborough|north-york|etobicoke)\.html$/)) return '2026-01-20';
  if (filename.match(/-(ajax|pickering|whitby|oshawa|oakville|burlington|vaughan|markham|richmond-hill)\.html$/)) return '2026-02-05';
  if (filename.match(/^blog\//)) return '2026-02-10';
  if (filename.match(/^(about|contact|book|pricing|services|locations|brands|areas|emergency)\.html$/)) return '2025-11-25';
  // Everything else
  return '2026-01-15';
}

function getPriority(filename) {
  if (filename === 'index.html') return '1.0';
  if (filename.includes('emergency') || filename.includes('same-day')) return '0.9';
  if (filename.includes('-near-me')) return '0.9';
  if (filename.match(/repair-(toronto|mississauga|brampton|vaughan|markham|richmond-hill)/)) return '0.8';
  if (filename.match(/repair-(scarborough|north-york|etobicoke|ajax|pickering|oakville)/)) return '0.8';
  if (filename.match(/appliance-repair|fridge-repair|washer-repair|dryer-repair|oven-repair|dishwasher-repair/)) return '0.8';
  if (filename.match(/samsung|lg|whirlpool|bosch|frigidaire|kenmore|maytag|kitchenaid|ge-appliance/)) return '0.7';
  if (filename.match(/about|contact|pricing/)) return '0.6';
  if (filename.startsWith('blog/') || filename.includes('blog-')) return '0.5';
  return '0.7';
}

function getChangefreq(filename) {
  if (filename === 'index.html') return 'weekly';
  if (filename.match(/about|contact|pricing/)) return 'monthly';
  if (filename.startsWith('blog/')) return 'monthly';
  return 'weekly';
}

sites.forEach(({ dir, domain }) => {
  const name = path.basename(dir);
  if (!fs.existsSync(dir)) { console.log(name + ': NOT FOUND'); return; }

  // Get all HTML files recursively (root + blog/)
  const exclude = ['service-template.html', '404.html'];
  let files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.html') && !exclude.includes(f))
    .map(f => f);

  // Also check blog/ subfolder
  const blogDir = path.join(dir, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.html'))
      .map(f => 'blog/' + f);
    files = files.concat(blogFiles);
  }

  const urls = files.map(f => {
    // Clean URLs: strip .html, index.html → parent dir
    let urlPath = f.replace(/\.html$/, '');
    if (urlPath === 'index' || urlPath.endsWith('/index')) {
      urlPath = urlPath.replace(/\/?index$/, '');
    }
    const url = domain + '/' + urlPath;
    const priority = getPriority(f);
    const changefreq = getChangefreq(f);
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${getLastmod(f)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  const sitemapPath = path.join(dir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);
  console.log(name + ': sitemap.xml with ' + files.length + ' URLs');
});
