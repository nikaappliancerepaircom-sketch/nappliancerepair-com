const fs = require('fs');
const path = require('path');

const sites = [
  'C:/nappliancerepair',
  'C:/appliancerepairneary',
  'C:/fixlifyservices',
];

sites.forEach(dir => {
  const name = path.basename(dir);
  if (!fs.existsSync(dir)) { console.log(name + ': NOT FOUND'); return; }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'service-template.html');
  let noSwap = 0, hasImgNoLazy = 0, scriptNoDefer = 0;
  files.forEach(f => {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    if (c.includes('fonts.googleapis.com') && c.indexOf('display=swap') === -1) noSwap++;
    if (c.includes('<img ') && c.indexOf('loading=') === -1) hasImgNoLazy++;
    // Check if external scripts lack defer/async
    const scriptTags = c.match(/<script src=[^>]+>/g) || [];
    scriptTags.forEach(tag => {
      if (tag.indexOf('defer') === -1 && tag.indexOf('async') === -1) scriptNoDefer++;
    });
  });
  console.log(name + ': ' + files.length + ' pages | font-swap missing: ' + noSwap + ' | img no-lazy: ' + hasImgNoLazy + ' | script no-defer: ' + scriptNoDefer);
});
