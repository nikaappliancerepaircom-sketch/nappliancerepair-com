/**
 * fix-wrong-brands.js
 * Fixes the 12 appliancerepairneary files where "Brands We Service"
 * was injected into the wrong section (reviews instead of related-section).
 * Removes the wrong injection, then re-injects correctly.
 *
 * Run: node fix-wrong-brands.js
 */

const fs = require('fs');
const path = require('path');

const dir = 'C:/appliancerepairneary';

// The brands col HTML to remove (pattern to match)
const BRANDS_START = '      <div class="related-col">\n        <h3>Brands We Service</h3>';
const BRANDS_END = '      </div>';

// The brands col to inject (for appliancerepairneary)
const BRANDS_COL = `      <div class="related-col">
        <h3>Brands We Service</h3>
        <ul class="related-links" style="list-style:none;padding-left:0"><li>Samsung</li>
<li>LG</li>
<li>Whirlpool</li>
<li>GE</li>
<li>Bosch</li>
<li>Frigidaire</li>
<li>Kenmore</li>
<li>Maytag</li>
<li>KitchenAid</li></ul>
      </div>`;

// Related section end pattern (after last col close, before grid close)
// After CRLF normalization: grid close (4sp) + container close (2sp) + section (0sp)
const END_AFTER_LAST_COL = '\n    </div>\n  </div>\n</section>';

let fixed = 0;
let checked = 0;

fs.readdirSync(dir).filter(f => f.endsWith('.html')).forEach(filename => {
  const fp = path.join(dir, filename);
  let html = fs.readFileSync(fp, 'utf8');

  if (!html.includes('Brands We Service')) return;
  checked++;

  // Normalize CRLF first
  html = html.replace(/\r\n/g, '\n');

  // Check if brands col is in the right place (inside related section)
  const relIdx = html.indexOf('class="related-section"');
  const brandsIdx = html.indexOf('Brands We Service');

  if (relIdx === -1 || brandsIdx === -1) return;

  const relEnd = html.indexOf('</section>', relIdx);

  if (brandsIdx < relEnd) {
    // Already correct location
    // console.log('OK:', filename);
    return;
  }

  // Wrong location - need to remove and re-inject
  console.log('Fixing:', filename);

  // Step 1: Remove the wrong brands col
  // Find the start of the wrong brands col
  const wrongStart = html.indexOf('\n' + BRANDS_START);
  if (wrongStart === -1) {
    console.log('  Could not find wrong brands start in:', filename);
    return;
  }
  // Find its closing </div>
  const wrongEnd = html.indexOf(BRANDS_END, wrongStart + BRANDS_START.length);
  if (wrongEnd === -1) {
    console.log('  Could not find wrong brands end in:', filename);
    return;
  }
  const wrongEndFull = wrongEnd + BRANDS_END.length;

  // Remove the wrong injection
  html = html.slice(0, wrongStart) + html.slice(wrongEndFull);

  // Step 2: Re-inject into the correct location
  const secIdx = html.indexOf('class="related-section"');
  if (secIdx === -1) {
    console.log('  Related section marker not found in:', filename);
    return;
  }

  const afterIdx = html.indexOf(END_AFTER_LAST_COL, secIdx);
  if (afterIdx === -1) {
    console.log('  END pattern not found after related section in:', filename);
    return;
  }

  // Inject brands col before the grid close
  html = html.slice(0, afterIdx) + '\n' + BRANDS_COL + END_AFTER_LAST_COL + html.slice(afterIdx + END_AFTER_LAST_COL.length);

  // Verify
  const newBrandsIdx = html.indexOf('Brands We Service');
  const newRelEnd = html.indexOf('</section>', html.indexOf('class="related-section"'));
  if (newBrandsIdx < newRelEnd) {
    fs.writeFileSync(fp, html);
    fixed++;
    console.log('  Fixed!');
  } else {
    console.log('  Re-injection failed for:', filename);
  }
});

console.log(`\nFixed ${fixed}/${checked} files with wrong brands injection`);
