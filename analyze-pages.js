'use strict';
const fs = require('fs');
const files = fs.readdirSync('C:/nappliancerepair').filter(f => f.endsWith('.html'));
const byType = {};
const sampleByType = {};
for (const f of files) {
  const c = fs.readFileSync('C:/nappliancerepair/' + f, 'utf8');
  const hasGrid = c.includes('related-links-grid');
  const hasNA = c.includes('Nearby Areas');
  if (hasGrid && !hasNA) {
    let type = 'other';
    if (c.includes('Service Areas')) type = 'Service Areas';
    else if (c.includes('Installation Areas')) type = 'Installation Areas';
    else if (c.includes('Repair Nearby')) type = 'Repair Nearby';
    byType[type] = (byType[type] || 0) + 1;
    if (!sampleByType[type]) sampleByType[type] = f;
  }
}
Object.entries(byType).forEach(([k, v]) => console.log(v, k, '  ex:', sampleByType[k]));
