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
  // Content quality (Google 2025-2026 Helpful Content)
  { name: 'body word count 400+', fn: c => {
    const text = c.replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ').trim();
    return text.split(' ').length >= 400;
  }},
  // GEO — AI Search (ChatGPT, Perplexity, Google AI Overviews) 2026
  { name: 'GEO: answer capsule (tel+location in first 600 chars)', fn: c => {
    const body = c.replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/\s+/g, ' ').trim();
    const first600 = body.slice(0, 600).toLowerCase();
    const hasPhone = first600.includes('416') || first600.includes('437') || first600.includes('647') || first600.includes('905');
    const GTA_CITIES = ['toronto','gta','ontario','mississauga','brampton','etobicoke',
      'north york','scarborough','vaughan','markham','richmond hill','ajax','whitby',
      'oakville','burlington','pickering','oshawa'];
    const hasCity = GTA_CITIES.some(city => first600.includes(city));
    return hasPhone && hasCity;
  }},
  { name: 'GEO: FAQ visible on page (not just schema)', fn: c => {
    return c.includes('faq') || c.includes('FAQ') || c.includes('frequently') || c.includes('Frequently');
  }},
];

let globalTotal = 0, globalPass = 0;

const EXCLUDE = ['service-template.html', '404.html'];

// ─── Per-site uniqueness check (service+city pages) ───────────────────────────
function checkUniqueness(dir, domain, files) {
  // Find service+city pages: contain a dash-city pattern
  const CITIES = ['toronto','north-york','etobicoke','scarborough','mississauga',
                  'brampton','vaughan','markham','richmond-hill','ajax','whitby',
                  'oakville','burlington','pickering','oshawa'];
  const cityPages = files.filter(f => CITIES.some(city => f.includes('-' + city)));
  if (cityPages.length < 2) return;

  // Extract visible text from each page
  function getText(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, '')
               .replace(/<style[\s\S]*?<\/style>/gi, '')
               .replace(/<[^>]+>/g, ' ')
               .replace(/\s+/g, ' ').trim();
  }

  // 8-gram similarity between two texts
  function similarity(a, b) {
    const ngs = (t, n) => {
      const words = t.split(' ').filter(w => w.length > 3);
      const s = new Set();
      for (let i = 0; i <= words.length - n; i++) s.add(words.slice(i, i+n).join(' '));
      return s;
    };
    const A = ngs(a, 8), B = ngs(b, 8);
    let shared = 0;
    for (const ng of B) { if (A.has(ng)) shared++; }
    return shared / Math.max(A.size, B.size, 1);
  }

  const texts = cityPages.map(f => getText(fs.readFileSync(path.join(dir, f), 'utf8')));

  // Sample: compare first 10 pairs
  let totalSim = 0, pairs = 0;
  const highDupPages = [];
  for (let i = 0; i < Math.min(cityPages.length, 8); i++) {
    for (let j = i + 1; j < Math.min(cityPages.length, 8); j++) {
      const sim = similarity(texts[i], texts[j]);
      totalSim += sim;
      pairs++;
      if (sim > 0.65) highDupPages.push(cityPages[i] + ' ↔ ' + cityPages[j] + ' (' + Math.round(sim*100) + '% dup)');
    }
  }

  const avgSim = totalSim / pairs;
  const avgUniq = Math.round((1 - avgSim) * 100);
  const status = avgUniq >= 80 ? '✅ GOOD' : avgUniq >= 50 ? '⚠️  MODERATE' : '❌ LOW';

  console.log('\n  Content Uniqueness (' + cityPages.length + ' city pages sampled):');
  console.log('  Avg uniqueness: ' + avgUniq + '% ' + status + ' (target: 80%+)');
  if (highDupPages.length > 0 && avgUniq < 80) {
    console.log('  High duplication examples:');
    highDupPages.slice(0, 3).forEach(p => console.log('    ' + p));
    console.log('  → Fix: rewrite body text per page, not just city name swap');
    console.log('  → Strategy 2026: fewer cities (4-5) with 800+ words each beats');
    console.log('    many thin city pages — Google HCU penalises doorway pages');
  }
}

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

  // Run uniqueness audit
  checkUniqueness(dir, domain, files);

  globalTotal += siteTotal;
  globalPass += sitePass;
});

const globalPct = Math.round((globalPass / globalTotal) * 100);
console.log('\n=== OVERALL BMAD SCORE ===');
console.log(globalPass + '/' + globalTotal + ' = ' + globalPct + '%');
console.log(globalPct >= 95 ? 'EXCELLENT' : globalPct >= 85 ? 'GOOD - some fixes needed' : 'NEEDS WORK');
console.log('\n─── BMAD v5 — Google + AI Search Rules (2026) ───────────────');
console.log('✓ Uniqueness 80%+ between service+city pages');
console.log('✓ Body text 400+ words (not counting nav/footer/schema)');
console.log('✓ No doorway pages (same template, only city name changes)');
console.log('✓ Strategy: 4-5 strong city pages > 15 thin city pages');
console.log('✓ Blog posts 700+ words, truly unique, E-E-A-T signals');
console.log('✓ GEO: answer capsule in first 500 chars (phone + city + service)');
console.log('✓ GEO: FAQ visible on page — AI pulls direct Q&A answers');
console.log('✓ GEO: llms.txt with Quick Answer section per site');
console.log('✓ GEO: robots.txt allows GPTBot, ClaudeBot, PerplexityBot');
console.log('──────────────────────────────────────────────────────────────');
