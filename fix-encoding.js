/**
 * fix-encoding.js
 * Fixes double-UTF-8-encoded characters in all HTML files across all 3 sites.
 * Cause: content generator used curly quotes/em dashes which were saved as
 * Latin-1 then re-encoded as UTF-8 (double encoding).
 *
 * Run: node fix-encoding.js
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  'C:/nappliancerepair',
  'C:/appliancerepairneary',
  'C:/fixlifyservices',
];

// Map of double-encoded UTF-8 sequences → correct character
// Each key is the garbled 3-char Unicode sequence (when file read as UTF-8)
const REPLACEMENTS = [
  // em dash — (U+2014)
  [/\u00e2\u0080\u0094/g, '\u2014'],
  // en dash – (U+2013)
  [/\u00e2\u0080\u0093/g, '\u2013'],
  // right single quote ' (U+2019)
  [/\u00e2\u0080\u0099/g, '\u2019'],
  // left single quote ' (U+2018)
  [/\u00e2\u0080\u0098/g, '\u2018'],
  // left double quote " (U+201C)
  [/\u00e2\u0080\u009c/g, '\u201c'],
  // right double quote " (U+201D)
  [/\u00e2\u0080\u009d/g, '\u201d'],
  // ellipsis … (U+2026)
  [/\u00e2\u0080\u00a6/g, '\u2026'],
  // bullet • (U+2022)
  [/\u00e2\u0080\u00a2/g, '\u2022'],
  // non-breaking space (U+00A0) double-encoded: C2 A0 → \u00c2\u00a0
  [/\u00c2\u00a0/g, ' '],
  // registered ® (U+00AE) double-encoded: C2 AE
  [/\u00c2\u00ae/g, '\u00ae'],
  // trademark ™ (U+2122): E2 84 A2
  [/\u00e2\u0084\u00a2/g, '\u2122'],
  // degree ° (U+00B0): C2 B0
  [/\u00c2\u00b0/g, '\u00b0'],
];

let globalFixed = 0;
let globalFiles = 0;

for (const dir of SITES) {
  if (!fs.existsSync(dir)) { console.log('SKIP:', dir); continue; }

  // Collect all HTML files
  const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  const blogDir = path.join(dir, 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => htmlFiles.push('blog/' + f));
  }

  let siteFixed = 0;
  for (const file of htmlFiles) {
    const fp = path.join(dir, file);
    let text = fs.readFileSync(fp, 'utf8');
    const before = text;

    for (const [pattern, replacement] of REPLACEMENTS) {
      text = text.replace(pattern, replacement);
    }

    if (text !== before) {
      fs.writeFileSync(fp, text);
      siteFixed++;
    }
  }

  console.log(`${path.basename(dir)}: fixed encoding in ${siteFixed}/${htmlFiles.length} files`);
  globalFixed += siteFixed;
  globalFiles += htmlFiles.length;
}

console.log(`\n✅ Done. ${globalFixed}/${globalFiles} files updated`);
console.log('All â€" → — em dashes fixed, curly quotes restored, etc.');
