const fs = require('fs');
const path = require('path');
const dir = 'C:/nappliancerepair/blog';
let fixed = 0;
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  const updated = content.replace(
    /(<link rel="canonical" href="https:\/\/nappliancerepair\.com\/blog\/[^"]+)\.html"/g,
    '$1"'
  );
  if (updated !== content) {
    fs.writeFileSync(fp, updated);
    fixed++;
    console.log('Fixed:', file);
  }
}
console.log(`Fixed ${fixed} files`);
