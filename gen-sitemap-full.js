// Preserve the published URL set, including only indexable canonical pages.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const DOMAIN = 'https://nappliancerepair.com';
const root = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const sitemapFile = path.join(root, 'sitemap.xml');
const previous = fs.readFileSync(sitemapFile, 'utf8');
function cleanUrl(value) {
  const url = new URL(value.replace(/&amp;/g, '&'));
  let route = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
  return 'https://' + url.hostname.replace(/^www\./, '') + route;
}
// Publish scripts add their selected pages to sitemap.xml before this final cleanup.
const published = new Set([...previous.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => cleanUrl(m[1].trim())));
for (const rule of config.redirects || []) {
  if (!rule.has && !rule.source.includes(':') && published.has(DOMAIN + rule.source)) {
    const destination = cleanUrl(new URL(rule.destination, DOMAIN).href);
    if (new URL(destination).origin === DOMAIN) published.add(destination);
  }
}
const redirects = new Set((config.redirects || []).filter(r => !r.has && !r.source.includes(':')).map(r => r.source));
const skipDirs = new Set(['node_modules', '.git', '.github', '.claude', '_queue', '_drafts', 'assets', 'css', 'js', 'images', 'img', 'fonts', 'includes', 'components', 'templates', 'styles', 'backups', 'backup', 'old', 'archive', 'reports', 'tools', 'tests', 'test-components', 'preview', 'premium-blog', 'src']);
const skipFiles = new Set(['404.html', 'service-template.html', 'preview.html']);
const urls = new Set();
const skipped = {};
function skip(reason) { skipped[reason] = (skipped[reason] || 0) + 1; }
function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)) result[match[1].toLowerCase()] = match[3];
  return result;
}
function walk(dir, prefix = '') {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name) && !entry.name.startsWith('.')) walk(path.join(dir, entry.name), prefix + entry.name + '/');
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html') || skipFiles.has(entry.name) || /\.bak\.|^landing[-.]/.test(entry.name)) continue;
    const rel = prefix + entry.name;
    let route = '/' + rel.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
    route = route.replace(/\/$/, '') || '/';
    if (!published.has(DOMAIN + route)) { skip('not_in_published_sitemap'); continue; }
    if (redirects.has(route)) { skip('redirect'); continue; }
    const text = fs.readFileSync(path.join(dir, entry.name), 'utf8');
    const head = text.split(/<\/head\s*>/i)[0];
    const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]));
    if (metas.some(m => /^(robots|googlebot)$/i.test(m.name || '') && /\bnoindex\b/i.test(m.content || ''))) { skip('noindex'); continue; }
    const canonical = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => (a.rel || '').toLowerCase() === 'canonical');
    if (canonical.length !== 1) { skip('missing_or_multiple_canonical'); continue; }
    const expected = DOMAIN + route;
    if ((canonical[0].href || '').replace(/\/$/, '') !== expected.replace(/\/$/, '')) { skip('alternate_or_invalid_canonical'); continue; }
    urls.add(expected);
  }
}
walk(root);
const escapeXml = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
// Checkout mtimes do not establish when content changed; omit optional lastmod.
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + [...urls].sort().map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')
  + '\n</urlset>\n';
fs.writeFileSync(sitemapFile, xml);
console.log(JSON.stringify({domain: DOMAIN, urls: urls.size, skipped}));
