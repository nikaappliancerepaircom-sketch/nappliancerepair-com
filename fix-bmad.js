const fs = require('fs');
const path = require('path');

// Fix twitter:card on sites that have og: but no twitter:
const twitterSites = [
  'C:/appliancerepairneary',
  'C:/fixlifyservices',
];

twitterSites.forEach(dir => {
  const name = path.basename(dir);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'service-template.html');
  let fixed = 0;

  files.forEach(f => {
    const filePath = path.join(dir, f);
    let c = fs.readFileSync(filePath, 'utf8');
    if (!c.includes('twitter:card')) {
      // Extract og:title and og:description for twitter tags
      const titleM = c.match(/property="og:title" content="([^"]+)"/);
      const descM = c.match(/property="og:description" content="([^"]+)"/);
      const title = titleM ? titleM[1] : '';
      const desc = descM ? descM[1] : '';
      const twitterTags = `\n  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">`;
      c = c.replace('</head>', twitterTags + '\n</head>');
      fs.writeFileSync(filePath, c);
      fixed++;
    }
  });
  console.log(name + ': added twitter:card to ' + fixed + ' files');
});

// Also fix meta robots missing on 1 fixlifyservices page
const fixDir = 'C:/fixlifyservices';
const fixFiles = fs.readdirSync(fixDir).filter(f => f.endsWith('.html') && f !== 'service-template.html');
let robotsFixed = 0, deferFixed = 0;
fixFiles.forEach(f => {
  const filePath = path.join(fixDir, f);
  let c = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (!c.includes('meta name="robots"')) {
    c = c.replace('<link rel="canonical"', '<meta name="robots" content="index, follow">\n  <link rel="canonical"');
    changed = true;
    robotsFixed++;
  }

  // Fix any remaining scripts without defer
  const newC = c.replace(/<script src="([^"]+)">/g, '<script src="$1" defer>');
  if (newC !== c) { deferFixed++; changed = true; }
  if (changed) fs.writeFileSync(filePath, newC || c);
});
console.log('fixlifyservices: fixed robots=' + robotsFixed + ' defer=' + deferFixed);
