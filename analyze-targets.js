'use strict';
const fs = require('fs');
const path = require('path');
const siteDir = 'C:/nappliancerepair';

// Pages that need Nearby Areas:
// Has grid + (Related Services OR Brands We Service heading) + no Nearby Areas
const targets = [];
const alreadyHas = [];
const noGrid = [];
const gasOrOther = [];

const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));
for (const fname of files) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');

  const hasGrid = content.includes('related-links-grid');
  const hasNA = content.includes('Nearby Areas');
  const hasRelSvc = content.includes('>Related Services<') || content.includes('"Related Services"');
  const hasBrands = content.includes('>Brands We Service<') || content.includes('"Brands We Service"') ||
                    content.includes('>Brands We Install<');

  if (!hasGrid) { noGrid.push(fname); continue; }
  if (hasNA) { alreadyHas.push(fname); continue; }

  // Has grid but no Nearby Areas
  if (hasRelSvc || hasBrands) {
    targets.push(fname);
  } else {
    gasOrOther.push(fname);
  }
}

console.log('Already has Nearby Areas:', alreadyHas.length);
console.log('No grid:', noGrid.length);
console.log('Target (needs Nearby Areas):', targets.length);
console.log('Gas/other (Service Areas only):', gasOrOther.length);
console.log('\nTarget files:', targets.join('\n'));
