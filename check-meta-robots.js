const fs = require('fs');
const path = require('path');

const sites = [
  'C:/nappliancerepair',
  'C:/appliancerepairneary',
  'C:/fixlifyservices',
];

sites.forEach(dir => {
  const name = path.basename(dir);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'service-template.html');
  let noRobots = 0, noindex = 0, noOgTitle = 0, noViewport = 0;
  files.forEach(f => {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    if (!c.includes('meta name="robots"') && !c.includes("meta name='robots'")) noRobots++;
    if (c.includes('noindex')) noindex++;
    if (!c.includes('og:title')) noOgTitle++;
    if (!c.includes('viewport')) noViewport++;
  });
  console.log(name + ' (' + files.length + ' pages):');
  console.log('  no meta robots: ' + noRobots);
  console.log('  noindex found: ' + noindex + (noindex ? ' WARNING' : ' OK'));
  console.log('  no og:title: ' + noOgTitle);
  console.log('  no viewport: ' + noViewport);
});
