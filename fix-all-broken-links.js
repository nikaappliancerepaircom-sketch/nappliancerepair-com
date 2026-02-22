const fs = require('fs');
const path = require('path');

const brands = ['samsung', 'lg', 'whirlpool', 'ge', 'bosch', 'frigidaire', 'kenmore', 'maytag', 'kitchenaid'];
const services = ['fridge', 'washer', 'dryer', 'dishwasher', 'oven', 'stove', 'freezer', 'microwave', 'refrigerator'];
const cities = ['toronto', 'scarborough', 'north-york', 'etobicoke', 'mississauga', 'brampton', 'vaughan', 'richmond-hill', 'markham', 'oakville', 'burlington', 'pickering', 'ajax', 'whitby', 'oshawa'];

function getExistingSlugs(dir) {
  const slugs = new Set();
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== '404.html');
  files.forEach(f => slugs.add('/' + f.replace('.html', '')));
  slugs.add('/');
  const blogDir = path.join(dir, 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => {
      slugs.add('/blog/' + f.replace('.html', ''));
    });
  }
  return slugs;
}

function getRewrites(dir) {
  const vp = path.join(dir, 'vercel.json');
  if (!fs.existsSync(vp)) return {};
  const vj = JSON.parse(fs.readFileSync(vp, 'utf8'));
  const map = {};
  (vj.rewrites || []).forEach(r => { map[r.source] = r.destination; });
  return map;
}

function urlExists(slug, existingSlugs, rewrites) {
  if (existingSlugs.has(slug)) return true;
  if (rewrites[slug]) return true;
  return false;
}

function findReplacement(brokenUrl, existingSlugs, rewrites) {
  const url = brokenUrl.replace(/\/$/, '') || '/';

  // Handle placeholder links
  if (url === '/locations/city-name' || url === '/services/service-name') return null;

  // Extract components
  let brand = null, service = null, city = null;

  // Identify city (longest first)
  const sortedCities = [...cities].sort((a, b) => b.length - a.length);
  for (const c of sortedCities) {
    if (url.includes(c)) { city = c; break; }
  }

  // Identify brand
  for (const b of brands) {
    if (url.startsWith('/' + b + '-') || url.includes('/' + b + '-') || url.includes('-' + b + '-')) {
      brand = b; break;
    }
  }

  // Identify service
  for (const s of services) {
    if (url.includes(s + '-repair') || url.includes(s + '-repair')) {
      service = s === 'refrigerator' ? 'fridge' : s;
      break;
    }
  }

  // Emergency pages
  if (url.includes('emergency')) {
    if (urlExists('/emergency', existingSlugs, rewrites)) return '/emergency';
    return null;
  }

  // /appliance-repair-city
  if (url.startsWith('/appliance-repair-') && city) {
    if (urlExists('/locations/' + city, existingSlugs, rewrites)) return '/locations/' + city;
    if (urlExists('/' + city, existingSlugs, rewrites)) return '/' + city;
  }

  // /brand-service-repair (no city)
  if (brand && service && !city) {
    const serviceSlug = '/' + service + '-repair';
    if (urlExists(serviceSlug, existingSlugs, rewrites)) return serviceSlug;
    if (urlExists('/services/' + service + '-repair', existingSlugs, rewrites)) return '/services/' + service + '-repair';
    const nearMe = '/' + service + '-repair-near-me';
    if (urlExists(nearMe, existingSlugs, rewrites)) return nearMe;
  }

  // /brand-repair-city
  if (brand && !service && city) {
    if (urlExists('/locations/' + city, existingSlugs, rewrites)) return '/locations/' + city;
    if (urlExists('/areas/' + city, existingSlugs, rewrites)) return '/areas/' + city;
    if (urlExists('/' + city, existingSlugs, rewrites)) return '/' + city;
    const brandSlug = '/' + brand + '-repair';
    if (urlExists(brandSlug, existingSlugs, rewrites)) return brandSlug;
  }

  // /service-repair-city
  if (service && city) {
    const exact = '/' + service + '-repair-' + city;
    if (urlExists(exact, existingSlugs, rewrites)) return exact;
    if (urlExists('/locations/' + city, existingSlugs, rewrites)) return '/locations/' + city;
    if (urlExists('/areas/' + city, existingSlugs, rewrites)) return '/areas/' + city;
    if (urlExists('/' + city, existingSlugs, rewrites)) return '/' + city;
    const serviceSlug = '/' + service + '-repair';
    if (urlExists(serviceSlug, existingSlugs, rewrites)) return serviceSlug;
    const nearMe = '/' + service + '-repair-near-me';
    if (urlExists(nearMe, existingSlugs, rewrites)) return nearMe;
  }

  // Plain city slug
  if (city && url === '/' + city) {
    if (urlExists('/areas/' + city, existingSlugs, rewrites)) return '/areas/' + city;
    if (urlExists('/locations/' + city, existingSlugs, rewrites)) return '/locations/' + city;
  }

  // Plain service slug
  if (service && !city && !brand) {
    const svcRewrite = '/services/' + service + '-repair';
    if (urlExists(svcRewrite, existingSlugs, rewrites)) return svcRewrite;
    if (service === 'fridge') {
      if (urlExists('/services/refrigerator-repair', existingSlugs, rewrites)) return '/services/refrigerator-repair';
    }
  }

  // Last resort
  if (city && urlExists('/' + city, existingSlugs, rewrites)) return '/' + city;
  if (service) {
    const s = '/' + service + '-repair';
    if (urlExists(s, existingSlugs, rewrites)) return s;
  }
  if (brand) {
    const b = '/' + brand + '-repair';
    if (urlExists(b, existingSlugs, rewrites)) return b;
  }

  return null;
}

// Process sites
const sites = [
  { dir: 'C:/nappliancerepair', name: 'nappliancerepair.com' },
  { dir: 'C:/appliancerepairneary', name: 'appliancerepairneary.com' },
  { dir: 'C:/fixlifyservices', name: 'fixlifyservices.com' },
];

let totalFixed = 0;
let totalUnfixed = 0;

sites.forEach(({ dir, name }) => {
  console.log('\n=== ' + name + ' ===');
  const existingSlugs = getExistingSlugs(dir);
  const rewrites = getRewrites(dir);
  const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  let siteFixed = 0;
  const unfixable = new Set();

  allFiles.forEach(f => {
    const filePath = path.join(dir, f);
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const linkRegex = /href="(\/[^"#]*?)"/g;
    let m;
    const replacements = [];

    while ((m = linkRegex.exec(html)) !== null) {
      const href = m[1];
      const cleanHref = href.replace(/\/$/, '') || '/';

      if (cleanHref.startsWith('/includes/')) continue;
      if (cleanHref === '/sitemap.xml') continue;
      if (cleanHref.includes('.') && !cleanHref.endsWith('/')) continue;

      if (!urlExists(cleanHref, existingSlugs, rewrites)) {
        const replacement = findReplacement(cleanHref, existingSlugs, rewrites);
        if (replacement) {
          replacements.push({ from: href, to: replacement });
        } else {
          unfixable.add(cleanHref);
        }
      }
    }

    const seen = new Set();
    replacements.forEach(({ from, to }) => {
      const key = from + '>' + to;
      if (seen.has(key)) return;
      seen.add(key);
      const oldStr = 'href="' + from + '"';
      const newStr = 'href="' + to + '"';
      const before = html;
      html = html.split(oldStr).join(newStr);
      if (html !== before) {
        changed = true;
        siteFixed++;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, html);
    }
  });

  console.log('Fixed: ' + siteFixed + ' link patterns');
  if (unfixable.size > 0) {
    console.log('Unfixable (' + unfixable.size + '):');
    [...unfixable].sort().forEach(u => console.log('  ? ' + u));
  }
  totalFixed += siteFixed;
  totalUnfixed += unfixable.size;
});

console.log('\n=== TOTAL ===');
console.log('Fixed: ' + totalFixed);
console.log('Unfixable: ' + totalUnfixed);
