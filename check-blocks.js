const fs = require('fs'), path = require('path');
const sites = ['C:/nappliancerepair', 'C:/appliancerepairneary', 'C:/fixlifyservices'];
sites.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  const withBlock = files.filter(f => {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    return c.includes('local-content') || c.includes('local-expertise') || c.includes('city-expertise');
  });
  console.log(path.basename(dir) + ': ' + withBlock.length + ' pages with added blocks');
  withBlock.slice(0,5).forEach(f => console.log('  ' + f));
});
