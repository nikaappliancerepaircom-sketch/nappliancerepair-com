'use strict';
const fs = require('fs');
const path = require('path');
const siteDir = 'C:/nappliancerepair';

// Find pages that have the 3-col grid BUT the middle col is missing
// (i.e., only 2 actual content cols) OR have "Related Services" + "Brands" but no middle nearby col
// Also: pages that have "Related Services" col followed directly by "Brands We Service" col (no nearby in between)

const truly_need = [];
const already3col = [];

const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));
for (const fname of files) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  if (!content.includes('related-links-grid')) continue;
  if (content.includes('Nearby Areas')) { already3col.push(fname); continue; }

  // Check grid col count
  const gridStart = content.indexOf('<div class="related-links-grid">');
  if (gridStart === -1) continue;
  const gridSection = content.slice(gridStart, gridStart + 3000);
  const colCount = (gridSection.match(/<div class="related-col">/g) || []).length;
  const h3Texts = (gridSection.match(/<h3>([^<]+)<\/h3>/g) || []).map(m => m.replace(/<\/?h3>/g, ''));

  // Truly need = 3 cols but none of the cols is a "nearby" col
  const nearbyWords = ['Nearby', 'Areas', 'Installation Areas', 'Service Areas'];
  const hasAnyNearby = h3Texts.some(h => nearbyWords.some(w => h.includes(w)));

  if (!hasAnyNearby) {
    truly_need.push({ fname, colCount, h3Texts });
  } else {
    already3col.push(fname);
  }
}

console.log('Truly need Nearby Areas col:', truly_need.length);
console.log('Already has some nearby col:', already3col.length);
console.log('\nFiles that truly need it:');
truly_need.forEach(p => console.log(' ', p.fname, '|', p.colCount, 'cols |', p.h3Texts.join(' / ')));
