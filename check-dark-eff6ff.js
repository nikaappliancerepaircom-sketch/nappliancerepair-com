'use strict';
const fs = require('fs');
const files = fs.readdirSync('C:/nappliancerepair').filter(f => f.endsWith('.html'));
const darkBgPages = [];
for (const f of files) {
  const c = fs.readFileSync('C:/nappliancerepair/' + f, 'utf8');
  if (!c.includes('EFF6FF')) continue;
  // Check body background
  const bodyBg = c.match(/body\s*\{[^}]*background:\s*([^;}\n]+)/);
  if (bodyBg) {
    const bg = bodyBg[1].trim();
    // Dark backgrounds would start with #0, #1, #2, or contain dark/black
    if (bg.match(/^#[012]|rgb\(0|rgba\(0|#0A|#0B|#0C|#0D|#0E|#0F|#1[0-9A-F]|#2[0-9A-F]|black|dark/i)) {
      darkBgPages.push(f + ' body bg: ' + bg);
    }
  }
}
console.log('Dark bg pages with EFF6FF:', darkBgPages.length);
darkBgPages.forEach(p => console.log(' ', p));
if (darkBgPages.length === 0) {
  console.log('All EFF6FF usage is on light-background pages - no fix needed.');
}
