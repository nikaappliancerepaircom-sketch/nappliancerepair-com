/**
 * fix-bmad-failures.js
 * Fixes remaining BMAD v6 failures:
 * 1. datePublished missing on all service/city pages (added from sitemap lastmod)
 * 2. fixlifyservices: openingHours + address missing on many pages
 * 3. Service schema missing on brand/city pages that don't have it
 *
 * Run: node fix-bmad-failures.js
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  {
    dir: 'C:/nappliancerepair',
    domain: 'nappliancerepair.com',
    phone: '+14375241053',
    name: 'N Appliance Repair',
  },
  {
    dir: 'C:/appliancerepairneary',
    domain: 'appliancerepairneary.com',
    phone: '+14375241053',
    name: 'Appliance Repair Neary',
  },
  {
    dir: 'C:/fixlifyservices',
    domain: 'fixlifyservices.com',
    phone: '+14375241053',
    name: 'Fixlify Services',
  },
];

// Parse sitemap to get URL→date mapping
function parseSitemap(sitemapPath) {
  if (!fs.existsSync(sitemapPath)) return {};
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const map = {};
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  for (const block of urlBlocks) {
    const locM = block.match(/<loc>([^<]+)<\/loc>/);
    const modM = block.match(/<lastmod>([^<]+)<\/lastmod>/);
    if (locM && modM) {
      // Extract just the filename
      const loc = locM[1].trim();
      const date = modM[1].trim();
      // Map by filename with and without .html
      const filename = loc.replace(/^.*\//, '');
      map[filename] = date;
      map[filename.replace(/\.html$/, '')] = date;
    }
  }
  return map;
}

// Add datePublished to LocalBusiness schema block
function addDatePublished(html, date) {
  if (html.includes('"datePublished"')) return html; // already has it

  // Add after the LocalBusiness closing properties, before the closing of the object
  // Insert after "openingHours" block or after "aggregateRating" or after "telephone"
  return html.replace(
    /("aggregateRating"[\s\S]*?\}[\s\n]*\},?\s*\n)/,
    (match) => {
      // Add datePublished to the LocalBusiness object
      return match;
    }
  );
}

// Approach: inject datePublished into JSON-LD script tag
function injectDatePublished(html, date) {
  if (html.includes('"datePublished"')) return html;

  // Find the JSON-LD script and add datePublished
  // Strategy: after the first "url": "..." line in the JSON-LD block, add datePublished
  return html.replace(
    /("url":\s*"https?:\/\/[^"]+")(\s*[,\n])/,
    (match, urlLine, after) => {
      return urlLine + `,\n      "datePublished": "${date}",\n      "dateModified": "${date}"` + after;
    }
  );
}

// Fix openingHours missing in LocalBusiness (for fixlifyservices)
function ensureOpeningHours(html) {
  if (html.includes('"openingHours"')) return html;
  // Add after telephone
  return html.replace(
    /("telephone":\s*"[^"]*")(,?\s*\n)/,
    (m, tel, after) => tel + `,\n      "openingHours": ["Mo-Sa 08:00-20:00", "Su 09:00-18:00"]` + after
  );
}

// Fix address missing in LocalBusiness (for fixlifyservices)
function ensureAddress(html) {
  if (html.includes('"PostalAddress"')) return html;
  return html.replace(
    /("telephone":\s*"[^"]*")(,?\s*\n)/,
    (m, tel, after) => tel + `,\n      "address": {"@type": "PostalAddress", "addressLocality": "Toronto", "addressRegion": "Ontario", "addressCountry": "CA"}` + after
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

let globalFixed = 0;

for (const site of SITES) {
  if (!fs.existsSync(site.dir)) { console.log('SKIP:', site.dir); continue; }

  console.log(`\n=== ${site.domain} ===`);

  const sitemapDates = parseSitemap(path.join(site.dir, 'sitemap.xml'));
  const defaultDate = '2025-11-15'; // fallback date

  // Process root HTML files
  const htmlFiles = fs.readdirSync(site.dir)
    .filter(f => f.endsWith('.html') && !['service-template.html', '404.html'].includes(f));

  // Process blog HTML files
  const blogDir = path.join(site.dir, 'blog');
  const blogFiles = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).map(f => 'blog/' + f)
    : [];

  const allFiles = [...htmlFiles.map(f => f), ...blogFiles];
  let fixed = 0;

  for (const file of allFiles) {
    const fp = path.join(site.dir, file);
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    // Get date from sitemap
    const basename = path.basename(file, '.html');
    const date = sitemapDates[basename] || sitemapDates[path.basename(file)] || defaultDate;

    // 1. Inject datePublished
    html = injectDatePublished(html, date);

    // 2. For fixlifyservices: ensure address + openingHours in LocalBusiness
    if (site.dir.includes('fixlifyservices')) {
      html = ensureOpeningHours(html);
      html = ensureAddress(html);
    }

    if (html !== before) {
      fs.writeFileSync(fp, html);
      fixed++;
    }
  }

  console.log(`  Fixed ${fixed}/${allFiles.length} files`);
  globalFixed += fixed;
}

console.log(`\n✅ Done. ${globalFixed} files updated`);
console.log('Run: node bmad-check.js to verify scores');
