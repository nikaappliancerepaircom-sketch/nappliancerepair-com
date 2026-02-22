const fs = require('fs');
const path = require('path');

const sites = [
  { dir: 'C:/nappliancerepair', hasOg: false },
  { dir: 'C:/appliancerepairneary', hasOg: true },
  { dir: 'C:/fixlifyservices', hasOg: true },
];

sites.forEach(({ dir, hasOg }) => {
  const blogDir = path.join(dir, 'blog');
  if (!fs.existsSync(blogDir)) return;

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
  let fixed = 0;

  files.forEach(f => {
    const filePath = path.join(blogDir, f);
    let c = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Add meta robots
    if (!c.includes('meta name="robots"') && c.includes('<link rel="canonical"')) {
      c = c.replace('<link rel="canonical"', '<meta name="robots" content="index, follow">\n  <link rel="canonical"');
      changed = true;
    }

    // Add og tags if missing
    if (!hasOg && !c.includes('og:title')) {
      const titleM = c.match(/<title>([^<]+)<\/title>/);
      const descM = c.match(/name="description" content="([^"]+)"/);
      const canonM = c.match(/rel="canonical" href="([^"]+)"/);
      if (titleM && descM && canonM) {
        const ogTags = `  <meta property="og:type" content="article">
  <meta property="og:title" content="${titleM[1]}">
  <meta property="og:description" content="${descM[1].substring(0, 200)}">
  <meta property="og:url" content="${canonM[1]}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${titleM[1]}">
  <meta name="twitter:description" content="${descM[1].substring(0, 200)}">`;
        c = c.replace('</head>', ogTags + '\n</head>');
        changed = true;
      }
    }

    // Add twitter:card if og present but twitter missing
    if (hasOg && !c.includes('twitter:card') && c.includes('og:title')) {
      const titleM = c.match(/property="og:title" content="([^"]+)"/);
      const descM = c.match(/property="og:description" content="([^"]+)"/);
      const title = titleM ? titleM[1] : '';
      const desc = descM ? descM[1] : '';
      const twitterTags = `\n  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">`;
      c = c.replace('</head>', twitterTags + '\n</head>');
      changed = true;
    }

    // Add defer to external scripts
    const newC = c.replace(/<script src="([^"]+)">/g, '<script src="$1" defer>');
    if (newC !== c) { changed = true; c = newC; }

    if (changed) {
      fs.writeFileSync(filePath, c);
      fixed++;
    }
  });

  console.log(path.basename(dir) + '/blog: fixed ' + fixed + '/' + files.length + ' posts');
});
