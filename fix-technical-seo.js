#!/usr/bin/env node
/**
 * fix-technical-seo.js
 * Fixes canonical tags, OG tags, robots meta, and schema domain consistency
 * for all root-level *.html files on nappliancerepair.com (NAR satellite site)
 *
 * Skips: blog/ subdirectory, 404.html (keeps noindex)
 */

const fs = require('fs');
const path = require('path');

const SITE_ROOT = path.resolve(__dirname);
const DOMAIN = 'https://nappliancerepair.com';
const OG_IMAGE = `${DOMAIN}/og-image.jpg`;

// Stats tracking
const stats = {
  filesProcessed: 0,
  canonicalAdded: 0,
  canonicalFixed: 0,
  ogUrlAdded: 0,
  ogUrlFixed: 0,
  ogTitleAdded: 0,
  ogDescriptionAdded: 0,
  ogTypeAdded: 0,
  ogImageAdded: 0,
  noindexRemoved: 0,
  schemaUrlFixed: 0,
  filesChanged: 0,
};

/**
 * Get all root-level HTML files (no subdirectory recursion)
 */
function getRootHtmlFiles() {
  return fs.readdirSync(SITE_ROOT)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(SITE_ROOT, f));
}

/**
 * Compute canonical URL for a given filename
 */
function getCanonicalUrl(filename) {
  const base = path.basename(filename, '.html');
  if (base === 'index') {
    return `${DOMAIN}/`;
  }
  return `${DOMAIN}/${base}`;
}

/**
 * Extract <title> content from HTML
 */
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

/**
 * Extract <meta name="description"> content from HTML
 */
function extractDescription(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  return m ? m[1].trim() : null;
}

/**
 * Check if a property meta tag exists
 */
function hasOgProperty(html, property) {
  const re = new RegExp(`<meta\\s[^>]*property=["']${property}["'][^>]*>`, 'i');
  return re.test(html);
}

/**
 * Get og:url content value if it exists
 */
function getOgUrlValue(html) {
  const m = html.match(/<meta\s[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s[^>]*content=["']([^"']*)["'][^>]*property=["']og:url["'][^>]*>/i);
  return m ? m[1].trim() : null;
}

/**
 * Get canonical href value if it exists
 */
function getCanonicalValue(html) {
  const m = html.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
    || html.match(/<link\s[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  return m ? m[1].trim() : null;
}

/**
 * Replace a canonical tag's href value
 */
function fixCanonicalHref(html, newHref) {
  // Handle both attribute orderings
  return html
    .replace(
      /(<link\s[^>]*rel=["']canonical["'][^>]*href=["'])([^"']*)["']/i,
      `$1${newHref}"`
    )
    .replace(
      /(<link\s[^>]*href=["'])([^"']*)["']([^>]*rel=["']canonical["'])/i,
      `$1${newHref}"$3`
    );
}

/**
 * Replace og:url content value
 */
function fixOgUrl(html, newUrl) {
  return html
    .replace(
      /(<meta\s[^>]*property=["']og:url["'][^>]*content=["'])([^"']*)["']/i,
      `$1${newUrl}"`
    )
    .replace(
      /(<meta\s[^>]*content=["'])([^"']*)["']([^>]*property=["']og:url["'])/i,
      `$1${newUrl}"$3`
    );
}

/**
 * Build a block of missing OG meta tags to insert
 */
function buildMissingOgTags(html, canonicalUrl, filename) {
  const lines = [];

  if (!hasOgProperty(html, 'og:url')) {
    lines.push(`  <meta property="og:url" content="${canonicalUrl}">`);
  }

  if (!hasOgProperty(html, 'og:type')) {
    lines.push(`  <meta property="og:type" content="website">`);
  }

  if (!hasOgProperty(html, 'og:title')) {
    const title = extractTitle(html) || 'N Appliance Repair';
    lines.push(`  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`);
  }

  if (!hasOgProperty(html, 'og:description')) {
    const desc = extractDescription(html) || 'Professional appliance repair services.';
    lines.push(`  <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">`);
  }

  if (!hasOgProperty(html, 'og:image')) {
    lines.push(`  <meta property="og:image" content="${OG_IMAGE}">`);
  }

  return lines;
}

/**
 * Fix schema.org JSON-LD blocks: replace wrong domain URLs
 */
function fixSchemaDomains(html) {
  let changed = false;
  let count = 0;

  // Match all JSON-LD script blocks
  const result = html.replace(
    /(<script\s+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (match, open, jsonContent, close) => {
      // Replace any "url": "http(s)://wrong-domain/..." patterns
      // Keep nappliancerepair.com as-is, fix anything else that looks like a URL value for "url" key
      const fixed = jsonContent.replace(
        /"url"\s*:\s*"(https?:\/\/(?!nappliancerepair\.com)[^"]+)"/g,
        (urlMatch, wrongUrl) => {
          // Extract path from wrong URL
          try {
            const parsed = new URL(wrongUrl);
            const correctUrl = `${DOMAIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
            count++;
            changed = true;
            return `"url": "${correctUrl}"`;
          } catch (e) {
            return urlMatch; // leave unparseable URLs alone
          }
        }
      );
      return `${open}${fixed}${close}`;
    }
  );

  return { html: result, count };
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  const filename = path.basename(filePath);
  const is404 = filename === '404.html';
  const changes = [];

  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // ── 1. CANONICAL TAG ──────────────────────────────────────────────────────
  const canonicalUrl = getCanonicalUrl(filePath);
  const existingCanonical = getCanonicalValue(html);

  if (!existingCanonical) {
    // No canonical: insert right after <meta charset
    const canonicalTag = `\n<link rel="canonical" href="${canonicalUrl}">`;
    html = html.replace(
      /(<meta\s[^>]*charset[^>]*>)/i,
      `$1${canonicalTag}`
    );
    changes.push('canonical:added');
    stats.canonicalAdded++;
  } else if (existingCanonical !== canonicalUrl) {
    // Wrong canonical: check if it's just a domain issue or truly wrong
    // Only fix if the domain is wrong (not nappliancerepair.com)
    try {
      const existingParsed = new URL(existingCanonical);
      if (existingParsed.hostname !== 'nappliancerepair.com') {
        html = fixCanonicalHref(html, canonicalUrl);
        changes.push(`canonical:fixed(was:${existingCanonical})`);
        stats.canonicalFixed++;
      }
      // If domain is correct but path differs, leave it — might be intentional
    } catch (e) {
      // Not a valid URL — replace it
      html = fixCanonicalHref(html, canonicalUrl);
      changes.push(`canonical:fixed(invalid:${existingCanonical})`);
      stats.canonicalFixed++;
    }
  }

  // ── 2. OG TAGS ────────────────────────────────────────────────────────────
  // Skip 404 for OG tags (not critical, and noindex page)
  if (!is404) {
    // Fix og:url if it exists but has wrong domain
    const existingOgUrl = getOgUrlValue(html);
    if (existingOgUrl) {
      try {
        const parsed = new URL(existingOgUrl);
        if (parsed.hostname !== 'nappliancerepair.com') {
          html = fixOgUrl(html, canonicalUrl);
          changes.push(`og:url:fixed(was:${existingOgUrl})`);
          stats.ogUrlFixed++;
        }
      } catch (e) {
        html = fixOgUrl(html, canonicalUrl);
        changes.push(`og:url:fixed(invalid)`);
        stats.ogUrlFixed++;
      }
    }

    // Build list of missing OG tags to add
    const missingOgLines = buildMissingOgTags(html, canonicalUrl, filePath);

    if (missingOgLines.length > 0) {
      // Count what we're adding for stats
      missingOgLines.forEach(line => {
        if (line.includes('og:url')) { stats.ogUrlAdded++; changes.push('og:url:added'); }
        if (line.includes('og:type')) { stats.ogTypeAdded++; changes.push('og:type:added'); }
        if (line.includes('og:title')) { stats.ogTitleAdded++; changes.push('og:title:added'); }
        if (line.includes('og:description')) { stats.ogDescriptionAdded++; changes.push('og:description:added'); }
        if (line.includes('og:image')) { stats.ogImageAdded++; changes.push('og:image:added'); }
      });

      // Insert before </head>
      const ogBlock = missingOgLines.join('\n');
      html = html.replace('</head>', `${ogBlock}\n</head>`);
    }
  }

  // ── 3. ROBOTS META ────────────────────────────────────────────────────────
  // Remove noindex from all pages except 404.html
  if (!is404) {
    const noindexRe = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*["'][^>]*>\s*/gi;
    const noindexRe2 = /<meta\s+content=["'][^"']*noindex[^"']*["']\s+name=["']robots["'][^>]*>\s*/gi;

    if (noindexRe.test(html) || noindexRe2.test(html)) {
      // Reset lastIndex after test
      html = html
        .replace(/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex[^"']*["'][^>]*>\s*/gi, '')
        .replace(/<meta\s+content=["'][^"']*noindex[^"']*["']\s+name=["']robots["'][^>]*>\s*/gi, '');
      changes.push('noindex:removed');
      stats.noindexRemoved++;
    }
  }

  // ── 4. SCHEMA DOMAIN FIX ──────────────────────────────────────────────────
  const { html: schemaFixed, count: schemaCount } = fixSchemaDomains(html);
  if (schemaCount > 0) {
    html = schemaFixed;
    changes.push(`schema:${schemaCount}urls:fixed`);
    stats.schemaUrlFixed += schemaCount;
  }

  // ── WRITE & REPORT ─────────────────────────────────────────────────────────
  stats.filesProcessed++;

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    stats.filesChanged++;
    console.log(`[FIXED] ${filename} | ${changes.join(', ')}`);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('NAR Technical SEO Fix — nappliancerepair.com');
  console.log('='.repeat(60));
  console.log(`Site root: ${SITE_ROOT}`);
  console.log(`Domain:    ${DOMAIN}`);
  console.log('');

  const files = getRootHtmlFiles();
  console.log(`Found ${files.length} root-level HTML files\n`);

  // Process all files (sync for simplicity, fast enough for 463 files)
  for (const file of files) {
    processFile(file);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed:       ${stats.filesProcessed}`);
  console.log(`Files changed:         ${stats.filesChanged}`);
  console.log('');
  console.log(`Canonical added:       ${stats.canonicalAdded}`);
  console.log(`Canonical fixed:       ${stats.canonicalFixed}`);
  console.log('');
  console.log(`og:url added:          ${stats.ogUrlAdded}`);
  console.log(`og:url fixed:          ${stats.ogUrlFixed}`);
  console.log(`og:title added:        ${stats.ogTitleAdded}`);
  console.log(`og:description added:  ${stats.ogDescriptionAdded}`);
  console.log(`og:type added:         ${stats.ogTypeAdded}`);
  console.log(`og:image added:        ${stats.ogImageAdded}`);
  console.log('');
  console.log(`noindex removed:       ${stats.noindexRemoved}`);
  console.log(`schema URLs fixed:     ${stats.schemaUrlFixed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
