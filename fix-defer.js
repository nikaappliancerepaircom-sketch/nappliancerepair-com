const fs = require('fs');
const path = require('path');

const sites = [
  'C:/nappliancerepair',
  'C:/fixlifyservices',
];

sites.forEach(dir => {
  const name = path.basename(dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'service-template.html');
  let fixed = 0;
  files.forEach(f => {
    const filePath = path.join(dir, f);
    let c = fs.readFileSync(filePath, 'utf8');
    const orig = c;
    // Add defer to external script tags that don't have defer or async
    c = c.replace(/<script src="([^"]+)">/g, function(match, src) {
      return '<script src="' + src + '" defer>';
    });
    c = c.replace(/<script src='([^']+)'>/g, function(match, src) {
      return '<script src=\'' + src + '\' defer>';
    });
    if (c !== orig) {
      fs.writeFileSync(filePath, c);
      fixed++;
    }
  });
  console.log(name + ': fixed defer on ' + fixed + ' files');
});
