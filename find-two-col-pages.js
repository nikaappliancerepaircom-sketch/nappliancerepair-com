'use strict';
const fs = require('fs');
const path = require('path');

const siteDir = 'C:/nappliancerepair';
const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));

const twoColPages = [];
const threeColPages = [];

for (const fname of files) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  if (!content.includes('related-links-grid')) continue;

  // Count related-col divs in the grid
  const gridStart = content.indexOf('<div class="related-links-grid">');
  if (gridStart === -1) continue;
  const gridEnd = content.indexOf('</div>\n  </section>', gridStart);
  const gridSection = gridEnd !== -1 ? content.slice(gridStart, gridEnd + 50) : content.slice(gridStart, gridStart + 3000);

  const colCount = (gridSection.match(/<div class="related-col">/g) || []).length;

  if (colCount === 2) {
    twoColPages.push({ fname, colCount });
  } else if (colCount >= 3) {
    threeColPages.push({ fname, colCount });
  }
}

console.log('2-col pages (missing middle section):', twoColPages.length);
console.log('3+ col pages:', threeColPages.length);
console.log('\nSample 2-col pages:');
twoColPages.slice(0, 10).forEach(p => console.log(' ', p.fname));

// Check headings of 2-col pages
console.log('\nHeadings in 2-col pages:');
const hCounts = {};
for (const { fname } of twoColPages) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  const matches = content.match(/<h3>[^<]+<\/h3>/g) || [];
  // Only get h3s in the grid section
  const gridStart = content.indexOf('<div class="related-links-grid">');
  const gridSection = content.slice(gridStart, gridStart + 2000);
  const gridH3s = gridSection.match(/<h3>[^<]+<\/h3>/g) || [];
  gridH3s.forEach(h => { hCounts[h] = (hCounts[h] || 0) + 1; });
}
Object.entries(hCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(' ', v, k));
