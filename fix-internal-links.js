'use strict';

const fs = require('fs');
const path = require('path');

const BASE = 'C:/nappliancerepair';

// ─── helpers ─────────────────────────────────────────────────────────────────

function exists(rel) {
  return fs.existsSync(path.join(BASE, rel));
}

// ─── Brand configuration ──────────────────────────────────────────────────────

const BRAND_SLUGS = {
  'Samsung':    'samsung',
  'LG':         'lg',
  'Whirlpool':  'whirlpool',
  'GE':         'ge',
  'Bosch':      'bosch',
  'Frigidaire': 'frigidaire',
  'Kenmore':    'kenmore',
  'Maytag':     'maytag',
  'KitchenAid': 'kitchenaid',
  'Miele':      'miele',
  'Electrolux': 'electrolux',
  'Amana':      'amana',
  'Speed Queen':'speed-queen',
};

// Service slug derived from filename
function serviceFromFilename(filename) {
  const f = filename.toLowerCase();
  if (f.includes('dishwasher'))                return 'dishwasher';
  if (f.includes('fridge') || f.includes('refrigerator')) return 'fridge';
  if (f.includes('washer'))                    return 'washer';
  if (f.includes('dryer'))                     return 'dryer';
  if (f.includes('oven'))                      return 'oven';
  if (f.includes('stove'))                     return 'stove';
  return null;
}

// Best brand href for a given brand + service context
// Priority: brand-service-repair.html > brand-repair.html > null
function bestBrandHref(brandSlug, serviceSlug) {
  if (serviceSlug) {
    const specific = `/${brandSlug}-${serviceSlug}-repair.html`;
    if (exists(specific)) return `/${brandSlug}-${serviceSlug}-repair`;
  }
  const general = `/${brandSlug}-repair.html`;
  if (exists(general)) return `/${brandSlug}-repair`;
  return null;
}

// ─── Location configuration ───────────────────────────────────────────────────

// Normalize city slug: lowercase, spaces→hyphens, remove capitals
function normalizeSlug(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, '-');
}

// Service keyword in link text → service slug for URL lookup
const SERVICE_TEXT_MAP = [
  { pattern: /refrigerator|fridge/i,  slug: 'fridge' },
  { pattern: /washer|washing/i,       slug: 'washer' },
  { pattern: /dryer/i,                slug: 'dryer' },
  { pattern: /dishwasher/i,           slug: 'dishwasher' },
  { pattern: /oven/i,                 slug: 'oven' },
  { pattern: /stove/i,                slug: 'stove' },
];

function serviceFromLinkText(text) {
  for (const { pattern, slug } of SERVICE_TEXT_MAP) {
    if (pattern.test(text)) return slug;
  }
  return null;
}

// For a /locations/{city} link with given link text, compute the best href
function bestLocationHref(citySlug, linkText) {
  const svc = serviceFromLinkText(linkText);
  if (svc) {
    const specific = `/${svc}-repair-${citySlug}.html`;
    if (exists(specific)) return `/${svc}-repair-${citySlug}`;
  }
  // Fallback: city hub page
  const cityHub = `/${citySlug}.html`;
  if (exists(cityHub)) return `/${citySlug}`;
  // Last resort: keep original /locations/{citySlug}
  return null;
}

// ─── Files to process ────────────────────────────────────────────────────────

const SKIP_FILES = new Set([
  '404.html', 'about.html', 'contact.html', 'contacts.html',
  'privacy.html', 'privacy-policy.html',
  'terms.html', 'terms-of-service.html',
  'sitemap.html', 'sitemap-index.html',
  'thank-you.html', 'for-businesses.html',
  'index.html',
]);

function shouldSkip(filename) {
  if (SKIP_FILES.has(filename)) return true;
  const f = filename.toLowerCase();
  // Skip blog pages
  if (f.startsWith('blog') || f.includes('/blog/')) return true;
  // Skip privacy/terms/contact variants
  if (f.startsWith('privacy') || f.startsWith('terms') || f.startsWith('contact')) return true;
  // Skip sitemap variants
  if (f.startsWith('sitemap')) return true;
  return false;
}

// ─── Fix #1: Brand links ──────────────────────────────────────────────────────

// Upgrades generic brand links AND fixes any plain-text brand items
// Patterns to match:
//   (a) <li><a href="/brand-repair">BrandName</a></li>  → upgrade to service-specific if available
//   (b) <li>BrandName</li>  → add link if page exists
function fixBrandLinks(html, serviceSlug, filename) {
  let changed = false;

  for (const [brandName, brandSlug] of Object.entries(BRAND_SLUGS)) {
    const href = bestBrandHref(brandSlug, serviceSlug);
    if (!href) continue; // No page found for this brand at all

    const escapedName = brandName.replace(/\s+/g, '\\s+');

    // (a) Plain text: <li>BrandName</li> (no <a href inside)
    const plainRe = new RegExp(
      `(<li>)(?!<a\\b)(${escapedName})(</li>)`,
      'g'
    );
    const after_plain = html.replace(plainRe, (m, open, name, close) => {
      changed = true;
      return `${open}<a href="${href}">${name}</a>${close}`;
    });
    if (after_plain !== html) html = after_plain;

    // (b) Existing generic link: <a href="/brand-repair">BrandName</a>
    //     upgrade to service-specific href when a better one exists
    if (serviceSlug) {
      const specificHref = `/${brandSlug}-${serviceSlug}-repair`;
      if (exists(specificHref + '.html') && href !== `/${brandSlug}-repair`) {
        // Already the specific href (href === specificHref), nothing to do
        // Only upgrade if current href is the generic one
        const genericHref = `/${brandSlug}-repair`;
        const genericRe = new RegExp(
          `(<a\\s+href=")${genericHref.replace(/\//g, '\\/')}("[^>]*>)(${escapedName})(</a>)`,
          'g'
        );
        const after_generic = html.replace(genericRe, (m, pre, post, name, close) => {
          changed = true;
          return `${pre}${specificHref}${post}${name}${close}`;
        });
        if (after_generic !== html) html = after_generic;
      }
    }
  }

  return { html, changed };
}

// ─── Fix #2: /locations/{city} links ─────────────────────────────────────────

function fixLocationLinks(html) {
  let changed = false;

  // Match: href="/locations/{city}" possibly with or without quotes, case-insensitive city slug
  // We do a global replace using a regex that captures city slug
  const re = /href="\/locations\/([^"]+)"/g;

  const result = html.replace(re, (match, rawCity) => {
    const citySlug = normalizeSlug(rawCity);

    // We need the link text to determine service type.
    // Since we're doing a simple replace, find the surrounding link text
    // by searching a small region in the original html around this occurrence.
    // Instead we'll do this differently — use a two-pass approach.
    // For now, return match as-is and handle in two-pass below.
    return match; // placeholder
  });

  // Two-pass: find all <a href="/locations/...">text</a> and replace fully
  const fullLinkRe = /<a(\s+[^>]*?)href="\/locations\/([^"]+)"([^>]*)>([^<]*)<\/a>/g;
  const fixed = html.replace(fullLinkRe, (match, pre, rawCity, post, linkText) => {
    const citySlug = normalizeSlug(rawCity);
    const newHref = bestLocationHref(citySlug, linkText);
    if (newHref && newHref !== `/locations/${citySlug}`) {
      changed = true;
      return `<a${pre}href="${newHref}"${post}>${linkText}</a>`;
    }
    return match;
  });

  return { html: fixed, changed };
}

// ─── Fix #3: Empty/missing href on <a> tags ───────────────────────────────────

function fixEmptyHrefs(html) {
  let changed = false;

  // <a href=""> with no URL — remove href entirely or skip
  // We won't touch these as we don't know the intended URL
  // But report them.
  const emptyHrefRe = /<a\s+href=""\s*/g;
  const count = (html.match(emptyHrefRe) || []).length;

  return { html, changed, emptyHrefCount: count };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const files = fs.readdirSync(BASE).filter(f => f.endsWith('.html'));

  let totalBrandFixes = 0;
  let totalLocationFixes = 0;
  let filesModified = 0;
  const report = [];

  for (const filename of files) {
    if (shouldSkip(filename)) continue;

    const filepath = path.join(BASE, filename);
    let html = fs.readFileSync(filepath, 'utf8');
    const original = html;

    const serviceSlug = serviceFromFilename(filename);
    let fileChanged = false;
    let brandCount = 0;
    let locationCount = 0;

    // Fix 1: Brand links
    {
      const before = html;
      const res = fixBrandLinks(html, serviceSlug, filename);
      html = res.html;
      if (res.changed) {
        // Count how many replacements
        brandCount = countDiffs(before, html);
        totalBrandFixes += brandCount;
        fileChanged = true;
      }
    }

    // Fix 2: /locations/ links
    {
      const before = html;
      const res = fixLocationLinks(html);
      html = res.html;
      if (res.changed) {
        locationCount = countLocationDiffs(before, html);
        totalLocationFixes += locationCount;
        fileChanged = true;
      }
    }

    if (fileChanged) {
      fs.writeFileSync(filepath, html, 'utf8');
      filesModified++;
      report.push({
        file: filename,
        service: serviceSlug || '(none)',
        brandFixes: brandCount,
        locationFixes: locationCount,
      });
    }
  }

  console.log('\n=== fix-internal-links.js Results ===\n');
  console.log(`Files scanned:   ${files.filter(f => !shouldSkip(f)).length}`);
  console.log(`Files modified:  ${filesModified}`);
  console.log(`Brand fixes:     ${totalBrandFixes}`);
  console.log(`Location fixes:  ${totalLocationFixes}`);
  console.log('\nModified files:');
  for (const r of report) {
    const parts = [];
    if (r.brandFixes)    parts.push(`${r.brandFixes} brand link(s) upgraded`);
    if (r.locationFixes) parts.push(`${r.locationFixes} /locations/ link(s) fixed`);
    console.log(`  ${r.file} [${r.service}]: ${parts.join(', ')}`);
  }
  console.log('\nDone.\n');
}

// Simple diff counters
function countDiffs(before, after) {
  // Count number of changed href occurrences (rough estimate)
  const beforeMatches = (before.match(/<li><a href=/g) || []).length;
  const afterMatches  = (after.match(/<li><a href=/g) || []).length;
  // Count plain text upgrades
  const plainBefore = countPlainBrands(before);
  const plainAfter  = countPlainBrands(after);
  return Math.abs(afterMatches - beforeMatches) + Math.abs(plainBefore - plainAfter) +
         countUpgrades(before, after);
}

function countPlainBrands(html) {
  let count = 0;
  for (const name of Object.keys(BRAND_SLUGS)) {
    const re = new RegExp(`<li>${name}</li>`, 'g');
    count += (html.match(re) || []).length;
  }
  return count;
}

function countUpgrades(before, after) {
  // Count how many generic brand-repair links became specific
  let count = 0;
  for (const brandSlug of Object.values(BRAND_SLUGS)) {
    const beforeCount = (before.match(new RegExp(`href="/${brandSlug}-repair"`, 'g')) || []).length;
    const afterCount  = (after.match(new RegExp(`href="/${brandSlug}-repair"`, 'g')) || []).length;
    if (afterCount < beforeCount) count += beforeCount - afterCount;
  }
  return count;
}

function countLocationDiffs(before, after) {
  const beforeCount = (before.match(/href="\/locations\//g) || []).length;
  const afterCount  = (after.match(/href="\/locations\//g) || []).length;
  return beforeCount - afterCount;
}

main();
