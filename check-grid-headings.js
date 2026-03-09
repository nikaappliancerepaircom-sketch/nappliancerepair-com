'use strict';
const fs = require('fs');
const siteDir = 'C:/nappliancerepair';
const counts = {};
const sampleFiles = {};
const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));
for (const fname of files) {
  const content = fs.readFileSync('C:/nappliancerepair/' + fname, 'utf8');
  const hasGrid = content.includes('related-links-grid');
  const hasNA = content.includes('Nearby Areas');
  if (!hasGrid || hasNA) continue;
  // Find h3 headings in grid
  const gridStart = content.indexOf('related-links-grid');
  const gridEnd = content.indexOf('</section>', gridStart);
  const gridSection = content.slice(gridStart, gridEnd);
  const matches = gridSection.match(/<h3>[^<]+<\/h3>/g) || [];
  matches.forEach(m => {
    counts[m] = (counts[m] || 0) + 1;
    if (!sampleFiles[m]) sampleFiles[m] = fname;
  });
}
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(v, k, '  ex:', sampleFiles[k]));
