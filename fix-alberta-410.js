#!/usr/bin/env node
/**
 * fix-alberta-410.js
 * Converts all Alberta city pages on NAR to 410 Gone stubs,
 * adds X-Robots-Tag: noindex headers in vercel.json,
 * and removes those URLs from sitemap.xml.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);

// Alberta city suffixes / standalone filenames
const ALBERTA_CITIES = [
  'calgary', 'edmonton',
  'airdrie', 'beaumont', 'canmore', 'chestermere',
  'cochrane', 'devon', 'fort-saskatchewan', 'high-river',
  'langdon', 'leduc', 'okotoks', 'sherwood-park',
  'spruce-grove', 'st-albert', 'strathmore', 'stony-plain',
];

// Minimal 410 stub
const STUB_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Page Not Found</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=/"></head><body><p>This page has moved. <a href="/">Return home</a>.</p></body></html>`;

// ── 1. Find all Alberta HTML files ──────────────────────────────────────────
const allHtml = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const albertaFiles = [];

for (const file of allHtml) {
  const slug = file.replace(/\.html$/, ''); // e.g. "bosch-repair-calgary"
  const isAlberta = ALBERTA_CITIES.some(city => {
    // Match standalone city page (city.html) or service-city page (*-city.html)
    return slug === city || slug.endsWith('-' + city);
  });
  if (isAlberta) albertaFiles.push(file);
}

albertaFiles.sort();
console.log(`\nFound ${albertaFiles.length} Alberta HTML files:`);
albertaFiles.forEach(f => console.log('  ' + f));

// ── 2. Replace each file with the 410 stub ──────────────────────────────────
let convertedCount = 0;
for (const file of albertaFiles) {
  const filePath = path.join(ROOT, file);
  fs.writeFileSync(filePath, STUB_HTML, 'utf8');
  convertedCount++;
}
console.log(`\nConverted ${convertedCount} files to 410 stub.`);

// ── 3. Update vercel.json — add X-Robots-Tag: noindex for each Alberta path ─
const vercelPath = path.join(ROOT, 'vercel.json');
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

// Build the set of paths to noindex (without .html — cleanUrls is true)
const noindexPaths = albertaFiles.map(f => '/' + f.replace(/\.html$/, ''));

// Check what's already in headers to avoid duplication
const existingNoindexSources = new Set(
  (vercel.headers || [])
    .filter(h => h.headers && h.headers.some(hh => hh.key === 'X-Robots-Tag'))
    .map(h => h.source)
);

const newHeaderEntries = noindexPaths
  .filter(p => !existingNoindexSources.has(p))
  .map(urlPath => ({
    source: urlPath,
    headers: [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ],
  }));

vercel.headers = [...(vercel.headers || []), ...newHeaderEntries];
fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2), 'utf8');
console.log(`Added ${newHeaderEntries.length} X-Robots-Tag entries to vercel.json (${existingNoindexSources.size} already existed).`);

// ── 4. Remove Alberta URLs from sitemap.xml ──────────────────────────────────
const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemapXml = fs.readFileSync(sitemapPath, 'utf8');

// Build regex patterns matching any Alberta URL
// Sitemap contains full URLs like https://nappliancerepair.com/bosch-repair-calgary
// Match <url>...</url> blocks containing an Alberta city
const albertaPatterns = ALBERTA_CITIES.map(city =>
  new RegExp(`\\s*<url>\\s*<loc>[^<]*/[^<]*(?:^|[-/])${city}(?=$|[/<])[^<]*</loc>[\\s\\S]*?</url>`, 'gim')
);

// More reliable: remove <url>…</url> blocks where <loc> ends with an Alberta city (with or without .html)
let removedCount = 0;
const urlBlockRegex = /<url>[\s\S]*?<\/url>/g;
sitemapXml = sitemapXml.replace(urlBlockRegex, (block) => {
  const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
  if (!locMatch) return block;
  const locUrl = locMatch[1];
  // Extract the path slug after the last /
  const slug = locUrl.replace(/\.html$/, '').split('/').pop();
  const isAlberta = ALBERTA_CITIES.some(city => {
    return slug === city || slug.endsWith('-' + city);
  });
  if (isAlberta) {
    removedCount++;
    return ''; // remove this <url> block
  }
  return block;
});

// Clean up any extra blank lines left behind
sitemapXml = sitemapXml.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`Removed ${removedCount} Alberta URLs from sitemap.xml.`);

// ── 5. Summary ────────────────────────────────────────────────────────────────
console.log('\n=== SUMMARY ===');
console.log(`Files converted to 410 stub : ${convertedCount}`);
console.log(`vercel.json header entries  : ${newHeaderEntries.length} added`);
console.log(`sitemap.xml entries removed : ${removedCount}`);
console.log('\nDone. Now commit and push.');
