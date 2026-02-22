const fs = require('fs');
const path = require('path');

const sites = [
  { dir: 'C:/nappliancerepair', domain: 'nappliancerepair.com' },
  { dir: 'C:/appliancerepairneary', domain: 'appliancerepairneary.com' },
  { dir: 'C:/fixlifyservices', domain: 'fixlifyservices.com' },
];

sites.forEach(({ dir, domain }) => {
  console.log('\n=== ' + domain + ' ===');
  const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  const existingSlugs = new Set(allFiles.map(f => '/' + f.replace('.html', '')));
  existingSlugs.add('/'); // homepage

  // Also add blog files
  const blogDir = path.join(dir, 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => {
      existingSlugs.add('/blog/' + f.replace('.html', ''));
    });
  }

  let totalBroken = 0;
  const brokenMap = {};

  allFiles.forEach(f => {
    const html = fs.readFileSync(path.join(dir, f), 'utf8');
    // Find all internal href links (starting with /)
    const links = html.match(/href="(\/[^"#]*?)"/g) || [];
    links.forEach(m => {
      const href = m.match(/href="([^"]+)"/)[1];
      // Skip external, assets, tel, mailto, includes, sitemap
      if (href.includes('.') && !href.endsWith('/')) return; // skip files with extensions
      if (href.startsWith('/includes/')) return;
      if (href === '/sitemap.xml') return;

      // Normalize: remove trailing slash
      let slug = href.replace(/\/$/, '') || '/';

      // Check if slug exists as a file OR has a rewrite in vercel.json
      if (!existingSlugs.has(slug)) {
        // Check rewrites
        const vercelPath = path.join(dir, 'vercel.json');
        let hasRewrite = false;
        if (fs.existsSync(vercelPath)) {
          const vj = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
          hasRewrite = (vj.rewrites || []).some(r => r.source === slug);
        }
        if (!hasRewrite) {
          if (!brokenMap[slug]) brokenMap[slug] = [];
          brokenMap[slug].push(f);
          totalBroken++;
        }
      }
    });
  });

  const uniqueBroken = Object.keys(brokenMap);
  console.log('Broken unique URLs: ' + uniqueBroken.length + ' (total refs: ' + totalBroken + ')');
  uniqueBroken.sort().forEach(url => {
    console.log('  ' + url + ' (' + brokenMap[url].length + ' pages)');
  });
});
