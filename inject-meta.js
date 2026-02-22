const fs = require('fs');
const path = require('path');

// For each site, patch HTML files to add missing meta tags
const sites = [
  { dir: 'C:/nappliancerepair', hasOg: false },
  { dir: 'C:/appliancerepairneary', hasOg: true },
  { dir: 'C:/fixlifyservices', hasOg: true },
];

sites.forEach(({ dir, hasOg }) => {
  const name = path.basename(dir);
  const files = fs.readdirSync(dir).filter(f =>
    f.endsWith('.html') && f !== 'service-template.html'
  );
  let patched = 0;

  files.forEach(f => {
    const filePath = path.join(dir, f);
    let c = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Add meta robots if missing
    if (!c.includes('meta name="robots"')) {
      c = c.replace(
        '<link rel="canonical"',
        '<meta name="robots" content="index, follow">\n  <link rel="canonical"'
      );
      changed = true;
    }

    // 2. Add og:title/og:description/og:url if site is missing og tags
    if (!hasOg && !c.includes('og:title')) {
      const titleM = c.match(/<title>([^<]+)<\/title>/);
      const descM = c.match(/name="description" content="([^"]+)"/);
      const canonM = c.match(/rel="canonical" href="([^"]+)"/);
      if (titleM && descM && canonM) {
        const ogTags = `  <meta property="og:type" content="website">
  <meta property="og:title" content="${titleM[1]}">
  <meta property="og:description" content="${descM[1].substring(0, 200)}">
  <meta property="og:url" content="${canonM[1]}">
  <meta property="og:site_name" content="N Appliance Repair">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${titleM[1]}">
  <meta name="twitter:description" content="${descM[1].substring(0, 200)}">`;
        c = c.replace('</head>', ogTags + '\n</head>');
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, c);
      patched++;
    }
  });

  console.log(name + ': patched ' + patched + '/' + files.length + ' files');
});
