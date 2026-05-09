/**
 * noindex-alberta.js
 * Adds <meta name="robots" content="noindex, follow"> to all Alberta pages.
 * Replaces any existing robots meta if present.
 */

const fs = require('fs');
const path = require('path');

const DIR = 'C:/nappliancerepair';

// Alberta city suffixes for service pages (slug endings)
const ALBERTA_SUFFIXES = [
  'calgary', 'edmonton', 'airdrie', 'beaumont', 'canmore', 'chestermere',
  'cochrane', 'devon', 'leduc', 'okotoks', 'fort-saskatchewan', 'strathmore',
  'high-river', 'banff', 'spruce-grove', 'stony-plain', 'st-albert',
  'sherwood-park', 'morinville'
];

function isAlbertaFile(filename) {
  const base = filename.replace(/\.html$/, '');
  // Bare city hubs: e.g. calgary.html
  if (ALBERTA_SUFFIXES.includes(base)) return true;
  // Service pages: e.g. dishwasher-repair-calgary.html
  for (const city of ALBERTA_SUFFIXES) {
    if (base.endsWith('-' + city)) return true;
  }
  return false;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html') && isAlbertaFile(f));

console.log(`Found ${files.length} Alberta files to noindex.`);

const LIST_PATH = '/tmp/nar-alberta-pages.txt';
// Write the list (use a local tmp within the project if /tmp unavailable)
try {
  fs.writeFileSync(LIST_PATH, files.map(f => path.join(DIR, f)).join('\n') + '\n');
  console.log(`File list written to ${LIST_PATH}`);
} catch (e) {
  const alt = path.join(DIR, 'tmp-alberta-pages.txt');
  fs.writeFileSync(alt, files.map(f => path.join(DIR, f)).join('\n') + '\n');
  console.log(`/tmp not writable — list written to ${alt}`);
}

let modified = 0;
let alreadyNoindex = 0;

for (const filename of files) {
  const filepath = path.join(DIR, filename);
  let html = fs.readFileSync(filepath, 'utf8');

  // Check if there's already a robots meta tag
  const existingRobotsMeta = html.match(/<meta\s+name=["']robots["'][^>]*>/i);

  if (existingRobotsMeta) {
    const tag = existingRobotsMeta[0];
    if (tag.includes('noindex')) {
      alreadyNoindex++;
      continue; // Already noindexed — skip
    }
    // Replace existing robots meta with noindex version
    const newTag = '<meta name="robots" content="noindex, follow">';
    html = html.replace(tag, newTag);
  } else {
    // Insert after <meta charset or <meta name="viewport"
    // Find a safe insertion point: after the last meta tag before </head>
    const viewportMatch = html.match(/(<meta\s+name=["']viewport["'][^>]*>)/i);
    if (viewportMatch) {
      html = html.replace(
        viewportMatch[0],
        viewportMatch[0] + '\n<meta name="robots" content="noindex, follow">'
      );
    } else {
      // Fallback: insert after <head>
      html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex, follow">');
    }
  }

  fs.writeFileSync(filepath, html, 'utf8');
  modified++;
}

console.log(`Modified: ${modified} files`);
console.log(`Already noindex: ${alreadyNoindex} files`);
console.log(`Total processed: ${files.length} Alberta files`);
