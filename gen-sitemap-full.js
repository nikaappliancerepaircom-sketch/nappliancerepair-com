/**
 * gen-sitemap-full.js — Full filesystem sitemap for nappliancerepair.com
 * Replaces drip-feed approach: scans ALL HTML files in the directory.
 */
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://nappliancerepair.com';
const DIR = __dirname;
const SITEMAP_FILE = path.join(DIR, 'sitemap.xml');

const SKIP_FILES = new Set(['404.html','service-template.html','ajax.html','book.html','preview.html','sitemap.html']);
const SKIP_DIRS  = new Set(['node_modules','.git','_queue','assets','css','js','images','fonts','components','templates','styles','backups','backup','old','archive','reports','tools']);

function hasNoindex(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8').slice(0, 2000);
    return /noindex/.test(content);
  } catch { return false; }
}

function walk(dir, prefix = '') {
  const out = [];
  let items; try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const item of items) {
    if (item.isDirectory()) {
      if (SKIP_DIRS.has(item.name)) continue;
      out.push(...walk(path.join(dir, item.name), prefix + item.name + '/'));
    } else if (item.name.endsWith('.html') && !item.name.includes('.bak')) {
      if (!SKIP_FILES.has(item.name) && !item.name.startsWith('landing-')) {
        const fullPath = path.join(dir, item.name);
        if (!hasNoindex(fullPath)) {
          out.push(prefix + item.name);
        }
      }
    }
  }
  return out;
}

function mtime(relPath) {
  try { return fs.statSync(path.join(DIR, relPath)).mtime.toISOString().slice(0, 10); }
  catch { return new Date().toISOString().slice(0, 10); }
}

const files = walk(DIR);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map(f => {
  const urlPath = f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '');
  return `  <url>
    <loc>${DOMAIN}${urlPath}</loc>
    <lastmod>${mtime(f)}</lastmod>
    <priority>${f === 'index.html' ? '1.0' : '0.8'}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

fs.writeFileSync(SITEMAP_FILE, xml);
console.log(`Sitemap: ${files.length} URLs → nappliancerepair.com/sitemap.xml`);
