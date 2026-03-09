'use strict';
const fs = require('fs');
const path = require('path');
const dir = 'C:/nappliancerepair';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let withNA = 0, withOtherNearby = 0, noNearby = 0;
const noNearbyList = [];

for (const f of files) {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  if (c.includes('Nearby Areas')) { withNA++; }
  else if (/Repair Nearby|Service Areas|Installation Areas/.test(c)) { withOtherNearby++; }
  else {
    noNearby++;
    if (noNearbyList.length < 20) noNearbyList.push(f);
  }
}

console.log('=== FINAL STATE ===');
console.log('Pages with "Nearby Areas" heading:', withNA);
console.log('Pages with other nearby heading (Service Areas, Repair Nearby, etc.):', withOtherNearby);
console.log('Pages with no nearby section:', noNearby);
console.log('Total pages:', files.length);
console.log('\nPages without any nearby section (first 20):');
noNearbyList.forEach(f => console.log(' ', f));
