'use strict';
const fs = require('fs');
const files = fs.readdirSync('C:/nappliancerepair').filter(f => f.endsWith('.html'));
const counts = {};
const samples = {};
for (const f of files) {
  const c = fs.readFileSync('C:/nappliancerepair/' + f, 'utf8');
  if (c.includes('related-links-grid')) continue;
  let type = 'other';
  if (c.includes('related-list')) type = 'has related-list (no grid)';
  else if (c.includes('Related Services')) type = 'has Related Services text';
  else if (c.includes('Brands We Service')) type = 'has Brands text';
  counts[type] = (counts[type] || 0) + 1;
  if (counts[type] <= 3) {
    if (!samples[type]) samples[type] = [];
    samples[type].push(f);
  }
}
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(v, k);
  if (samples[k]) console.log('  ex:', samples[k].join(', '));
});
