'use strict';
const fs = require('fs');
const path = require('path');
const siteDir = 'C:/nappliancerepair';

const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));

// Case 1: Has grid, has Related Services col + Brands col, but no Nearby col
const case1 = []; // dishwasher-installation pages mainly
// Case 2: No grid at all, but has "Brands We Service in X" inline - needs full section
const case2 = [];
// Already fine
const alreadyFine = [];
// Skip/other
const skip = [];

for (const fname of files) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  const hasGrid = content.includes('related-links-grid');
  const hasNA = content.includes('Nearby Areas');
  const hasRepairNearby = /Repair Nearby|Washer Repair Nearby|Washing Machine Repair Nearby|Refrigerator Repair Nearby|Oven Repair Nearby|Dryer Repair Nearby|Dishwasher Repair Nearby|Stove Repair Nearby/.test(content);
  const hasSvcAreas = content.includes('Service Areas');
  const hasInstAreas = content.includes('Installation Areas');

  if (hasNA || hasRepairNearby) {
    alreadyFine.push(fname);
    continue;
  }

  if (hasGrid) {
    // Has grid - check if it has Related Services col that's directly followed by Brands
    const hasRelSvc = content.includes('<h3>Related Services</h3>');
    const hasBrands = content.includes('<h3>Brands We Service</h3>') || content.includes('<h3>Brands We Install</h3>');
    if (hasRelSvc && hasBrands && !hasSvcAreas && !hasInstAreas) {
      case1.push(fname);
    } else {
      // Has grid with Service Areas, Installation Areas - already has nearby equiv
      alreadyFine.push(fname);
    }
  } else {
    // No grid - check if it's a newer-format page with inline links
    const hasBrandsInline = /Brands We Service in /.test(content);
    const hasBrandsGrid = content.includes('<h3>Brands We Service</h3>');
    if (hasBrandsInline || hasBrandsGrid) {
      case2.push(fname);
    } else {
      skip.push(fname);
    }
  }
}

console.log('Already fine (has nearby):', alreadyFine.length);
console.log('Case 1 (grid, needs nearby col inserted):', case1.length);
console.log('Case 2 (no grid, needs full section added):', case2.length);
console.log('Skip:', skip.length);
console.log('\nCase 1 files:', case1.join('\n'));
console.log('\nCase 2 sample (first 10):', case2.slice(0, 10).join('\n'));
console.log('\nCase 2 total list:', case2.length);
