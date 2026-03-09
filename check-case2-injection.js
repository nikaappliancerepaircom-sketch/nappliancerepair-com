'use strict';
const fs = require('fs');
const path = require('path');
const siteDir = 'C:/nappliancerepair';

const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html'));
const case2 = [];

for (const fname of files) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  if (content.includes('related-links-grid')) continue;
  if (content.includes('Nearby Areas')) continue;
  if (/Repair Nearby|Washer Repair Nearby|Washing Machine Repair Nearby|Refrigerator Repair Nearby|Oven Repair Nearby|Dryer Repair Nearby|Dishwasher Repair Nearby|Stove Repair Nearby/.test(content)) continue;
  const hasBrandsInline = /Brands We Service in /.test(content);
  const hasBrandsGrid = content.includes('<h3>Brands We Service</h3>');
  if (!hasBrandsInline && !hasBrandsGrid) continue;
  case2.push(fname);
}

// Check injection points
const patterns = {
  hasChipSection: 0, // padding:28px 0;border-top
  hasBookingSection: 0, // id="booking"
  hasFooter: 0,
  hasNoneKnown: 0,
};

for (const fname of case2) {
  const content = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  const hasChip = content.includes('border-top:1px solid rgba(0,0,0,.08)');
  const hasBooking = content.includes('id="booking"');
  const hasFooter = content.includes('<footer>');
  if (hasChip) patterns.hasChipSection++;
  else if (hasBooking) patterns.hasBookingSection++;
  else if (hasFooter) patterns.hasFooter++;
  else patterns.hasNoneKnown++;
}

console.log('Case 2 total:', case2.length);
console.log('Has chip section:', patterns.hasChipSection);
console.log('Has booking (no chip):', patterns.hasBookingSection);
console.log('Has footer only:', patterns.hasFooter);
console.log('Has none of known:', patterns.hasNoneKnown);

// Check if 'booking' and 'chip' distinction is consistent
const noChipNoBooking = case2.filter(fname => {
  const c = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  return !c.includes('border-top:1px solid rgba(0,0,0,.08)') && !c.includes('id="booking"');
});
if (noChipNoBooking.length > 0) {
  console.log('\nFiles with no chip and no booking:');
  noChipNoBooking.forEach(f => console.log(' ', f));
}
