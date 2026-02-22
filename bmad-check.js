const fs = require('fs');
const path = require('path');

const sites = [
  { dir: 'C:/nappliancerepair', domain: 'nappliancerepair.com' },
  { dir: 'C:/appliancerepairneary', domain: 'appliancerepairneary.com' },
  { dir: 'C:/fixlifyservices', domain: 'fixlifyservices.com' },
];

const CHECKS = [
  { name: 'title present', fn: c => c.includes('<title>') },
  { name: 'title length OK (30-70)', fn: c => { const m = c.match(/<title>([^<]+)<\/title>/); return m && m[1].length >= 30 && m[1].length <= 70; } },
  { name: 'meta description', fn: c => c.includes('name="description"') },
  { name: 'meta desc length OK (100-165)', fn: c => { const m = c.match(/name="description" content="([^"]+)"/); return m && m[1].length >= 100 && m[1].length <= 165; } },
  { name: 'canonical tag', fn: c => c.includes('<link rel="canonical"') },
  { name: 'meta robots index', fn: c => c.includes('meta name="robots"') && !c.includes('noindex') },
  { name: 'viewport meta', fn: c => c.includes('viewport') },
  { name: 'og:title', fn: c => c.includes('og:title') },
  { name: 'og:description', fn: c => c.includes('og:description') },
  { name: 'twitter:card', fn: c => c.includes('twitter:card') },
  { name: 'LocalBusiness schema', fn: c => c.includes('LocalBusiness') },
  { name: 'AggregateRating schema', fn: c => c.includes('AggregateRating') },
  { name: 'FAQPage or Article schema', fn: c => c.includes('FAQPage') || c.includes('"Article"') },
  { name: 'BreadcrumbList schema', fn: c => c.includes('BreadcrumbList') },
  { name: 'phone clickable tel:', fn: c => c.includes('href="tel:') },
  { name: 'Fixlify iframe', fn: c => c.includes('fixlify.app') },
  { name: 'font-display:swap', fn: c => c.includes('display=swap') },
  { name: 'defer on scripts', fn: c => { const scripts = c.match(/<script src=[^>]+>/g) || []; return scripts.every(s => s.includes('defer') || s.includes('async')); } },
  { name: 'no unfilled {{}}', fn: c => !c.includes('{{') },
];

let globalTotal = 0, globalPass = 0;

const EXCLUDE = ['service-template.html', '404.html'];

sites.forEach(({ dir, domain }) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !EXCLUDE.includes(f));

  let siteTotal = 0, sitePass = 0;
  const failsByCheck = {};

  files.forEach(f => {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    CHECKS.forEach(check => {
      siteTotal++;
      if (check.fn(c)) {
        sitePass++;
      } else {
        failsByCheck[check.name] = (failsByCheck[check.name] || 0) + 1;
      }
    });
  });

  const pct = Math.round((sitePass / siteTotal) * 100);
  console.log('\n=== ' + domain + ' (' + files.length + ' pages) ===');
  console.log('BMAD Score: ' + sitePass + '/' + siteTotal + ' = ' + pct + '%');

  const failures = Object.entries(failsByCheck).sort((a, b) => b[1] - a[1]);
  if (failures.length === 0) {
    console.log('  ALL CHECKS PASS');
  } else {
    console.log('  Failures:');
    failures.forEach(([name, count]) => {
      console.log('    ' + name + ': ' + count + ' pages');
    });
  }

  globalTotal += siteTotal;
  globalPass += sitePass;
});

const globalPct = Math.round((globalPass / globalTotal) * 100);
console.log('\n=== OVERALL BMAD SCORE ===');
console.log(globalPass + '/' + globalTotal + ' = ' + globalPct + '%');
console.log(globalPct >= 95 ? 'EXCELLENT' : globalPct >= 85 ? 'GOOD - some fixes needed' : 'NEEDS WORK');
