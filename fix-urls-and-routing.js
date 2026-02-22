/**
 * fix-urls-and-routing.js
 *
 * Fixes across all 3 sites:
 * 1. vercel.json: cleanUrls:true + rewrites for /services/* /brands/* /locations/* /areas/*
 * 2. All HTML canonical tags: remove .html (canonical must match the URL users see)
 * 3. All sitemaps: remove .html from <loc> URLs
 * 4. All og:url meta tags: remove .html
 * 5. Internal links in HTML: remove .html from internal href links
 * 6. Creates book.html on each site with on-site booking form
 *
 * Run: node fix-urls-and-routing.js
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  {
    dir: 'C:/nappliancerepair',
    domain: 'nappliancerepair.com',
    phone: '(437) 524-1053',
    phoneHref: '+14375241053',
    bookingUrl: 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce',
    name: 'N Appliance Repair',
    color: '#2563EB',
  },
  {
    dir: 'C:/appliancerepairneary',
    domain: 'appliancerepairneary.com',
    phone: '(437) 524-1053',
    phoneHref: '+14375241053',
    bookingUrl: 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce',
    name: 'Appliance Repair Neary',
    color: '#16A34A',
  },
  {
    dir: 'C:/fixlifyservices',
    domain: 'fixlifyservices.com',
    phone: '(437) 524-1053',
    phoneHref: '+14375241053',
    bookingUrl: 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce',
    name: 'Fixlify Services',
    color: '#7C3AED',
  },
];

// ─── 1. vercel.json rewrites ───────────────────────────────────────────────

function buildVercelJson(site) {
  return {
    cleanUrls: true,
    trailingSlash: false,
    rewrites: [
      // Service clean URL variants
      { source: '/services/fridge-repair',       destination: '/fridge-repair.html' },
      { source: '/services/refrigerator-repair', destination: '/fridge-repair.html' },
      { source: '/services/washer-repair',        destination: '/washer-repair.html' },
      { source: '/services/dryer-repair',         destination: '/dryer-repair.html' },
      { source: '/services/dishwasher-repair',    destination: '/dishwasher-repair.html' },
      { source: '/services/oven-repair',          destination: '/oven-repair.html' },
      { source: '/services/stove-repair',         destination: '/stove-repair.html' },
      { source: '/services/freezer-repair',       destination: '/fridge-repair.html' },
      { source: '/services/microwave-repair',     destination: '/oven-repair.html' },

      // Brand clean URL variants
      { source: '/brands/samsung',    destination: '/samsung-repair.html' },
      { source: '/brands/lg',         destination: '/lg-repair.html' },
      { source: '/brands/whirlpool',  destination: '/whirlpool-repair.html' },
      { source: '/brands/ge',         destination: '/ge-repair.html' },
      { source: '/brands/bosch',      destination: '/bosch-repair.html' },
      { source: '/brands/frigidaire', destination: '/frigidaire-repair.html' },
      { source: '/brands/kenmore',    destination: '/kenmore-repair.html' },
      { source: '/brands/maytag',     destination: '/maytag-repair.html' },
      { source: '/brands/kitchenaid', destination: '/kitchenaid-repair.html' },

      // Location clean URLs (both /locations/* and /areas/*)
      { source: '/locations/toronto',       destination: '/toronto.html' },
      { source: '/locations/scarborough',   destination: '/scarborough.html' },
      { source: '/locations/north-york',    destination: '/north-york.html' },
      { source: '/locations/etobicoke',     destination: '/etobicoke.html' },
      { source: '/locations/mississauga',   destination: '/mississauga.html' },
      { source: '/locations/brampton',      destination: '/brampton.html' },
      { source: '/locations/vaughan',       destination: '/vaughan.html' },
      { source: '/locations/richmond-hill', destination: '/richmond-hill.html' },
      { source: '/locations/markham',       destination: '/markham.html' },
      { source: '/locations/oakville',      destination: '/oakville.html' },
      { source: '/locations/burlington',    destination: '/burlington.html' },
      { source: '/locations/pickering',     destination: '/pickering.html' },
      { source: '/locations/ajax',          destination: '/ajax.html' },
      { source: '/locations/whitby',        destination: '/whitby.html' },
      { source: '/locations/oshawa',        destination: '/oshawa.html' },

      { source: '/areas/toronto',       destination: '/toronto.html' },
      { source: '/areas/scarborough',   destination: '/scarborough.html' },
      { source: '/areas/north-york',    destination: '/north-york.html' },
      { source: '/areas/etobicoke',     destination: '/etobicoke.html' },
      { source: '/areas/mississauga',   destination: '/mississauga.html' },
      { source: '/areas/brampton',      destination: '/brampton.html' },
      { source: '/areas/vaughan',       destination: '/vaughan.html' },
      { source: '/areas/richmond-hill', destination: '/richmond-hill.html' },
      { source: '/areas/markham',       destination: '/markham.html' },
      { source: '/areas/oakville',      destination: '/oakville.html' },
      { source: '/areas/burlington',    destination: '/burlington.html' },
      { source: '/areas/pickering',     destination: '/pickering.html' },
      { source: '/areas/ajax',          destination: '/ajax.html' },
      { source: '/areas/whitby',        destination: '/whitby.html' },
      { source: '/areas/oshawa',        destination: '/oshawa.html' },

      // Blog
      { source: '/blog', destination: '/blog/index.html' },
    ],
    redirects: [
      { source: '/home', destination: '/', permanent: true },
      // Legacy .html URLs → clean URLs (belt-and-suspenders, cleanUrls handles most)
    ],
    headers: [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/(.*)\\.(js|css|woff|woff2|ttf|eot|svg|png|jpg|jpeg|webp|ico)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)\\.html',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }],
      },
    ],
  };
}

// ─── 2. Strip .html from canonical, og:url, sitemap ───────────────────────

function stripHtmlFromUrl(url) {
  // Only strip .html from same-domain canonical URLs
  return url.replace(/\.html(\?[^"]*)?(")/g, (m, qs, q) => (qs || '') + q);
}

function fixHtmlUrls(html, domain) {
  // canonical href
  html = html.replace(
    /(rel="canonical"\s+href="|href="\s*(?:https:\/\/)?(https:\/\/)?[^"]*\.html)(\s*")/g,
    (m) => m.replace(/\.html(\s*")/, '"')
  );

  // More targeted: any attribute href/content pointing to domain or relative .html
  // Canonical tag
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")([^"]+)(")/g,
    (_, pre, url, post) => pre + url.replace(/\.html$/, '') + post
  );

  // og:url
  html = html.replace(
    /(<meta\s+property="og:url"\s+content=")([^"]+)(")/g,
    (_, pre, url, post) => pre + url.replace(/\.html$/, '') + post
  );

  // og:published_time / article: dates - keep as is

  // Internal links: href="/something.html" → href="/something"
  // Only for same-site relative links, not external
  html = html.replace(
    /href="(\/[^"#?]*?)\.html([#?][^"]*)?" /g,
    (_, path, suffix) => `href="${path}${suffix || ''}" `
  );

  return html;
}

function fixSitemap(xml) {
  // Remove .html from <loc> URLs in sitemap
  return xml.replace(
    /(<loc>)(https?:\/\/[^<]+)\.html(<\/loc>)/g,
    (_, open, url, close) => open + url + close
  );
}

// ─── 3. book.html ─────────────────────────────────────────────────────────

function buildBookHtml(site) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Book Appliance Repair | Same-Day Service | ${site.name}</title>
<meta name="description" content="Book appliance repair online — instant confirmation, same-day slots available. Dryer, fridge, washer, dishwasher repair across GTA. Call ${site.phone}.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://${site.domain}/book">
<meta property="og:title" content="Book Appliance Repair | ${site.name}">
<meta property="og:description" content="Same-day appliance repair in Toronto & GTA. Book online, instant confirmation.">
<meta property="og:url" content="https://${site.domain}/book">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">

<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${site.name}",
  "telephone": "${site.phoneHref}",
  "url": "https://${site.domain}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Toronto",
    "addressRegion": "Ontario",
    "addressCountry": "CA"
  }
}</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">

<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;scroll-behavior:smooth}
body{font-family:'Instrument Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F9FAFB;color:#111827;line-height:1.5}

/* TOP BAR */
.top-bar{background:${site.color};color:#fff;text-align:center;padding:8px 16px;font-size:0.875rem;font-weight:600}
.top-bar a{color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.5)}

/* HEADER */
header{background:#fff;border-bottom:1px solid #E5E7EB;padding:0 24px}
.header-inner{max-width:900px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{font-size:1rem;font-weight:700;color:#111827;text-decoration:none}
.logo span{color:${site.color}}
.header-phone{display:flex;align-items:center;gap:6px;font-weight:700;color:${site.color};text-decoration:none;font-size:0.9rem}

/* HERO */
.book-hero{background:#fff;border-bottom:1px solid #E5E7EB;padding:32px 24px 0}
.book-hero-inner{max-width:900px;margin:0 auto}
.book-hero h1{font-size:clamp(1.5rem,4vw,2.25rem);font-weight:700;letter-spacing:-0.02em;margin-bottom:8px}
.book-hero h1 em{color:${site.color};font-style:normal}
.book-hero p{color:#6B7280;font-size:1rem;margin-bottom:20px}

/* TRUST BADGES */
.trust-row{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px}
.trust-badge{display:inline-flex;align-items:center;gap:6px;background:#F0FDF4;color:#15803D;font-size:0.8125rem;font-weight:600;padding:6px 12px;border-radius:20px;border:1px solid #BBF7D0}
.trust-badge.blue{background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE}

/* LAYOUT */
.book-layout{max-width:900px;margin:32px auto;padding:0 24px;display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:start}
@media(max-width:768px){.book-layout{grid-template-columns:1fr;padding:0 16px}}

/* BOOKING IFRAME */
.booking-card{background:#fff;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.booking-card-header{background:${site.color};color:#fff;padding:16px 20px}
.booking-card-header h2{font-size:1rem;font-weight:700;margin-bottom:2px}
.booking-card-header p{font-size:0.8125rem;opacity:0.85}
.booking-frame{width:100%;height:680px;border:none;display:block}

/* SIDEBAR */
.sidebar{display:flex;flex-direction:column;gap:16px}
.info-card{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px}
.info-card h3{font-size:0.9375rem;font-weight:700;margin-bottom:12px;color:#111827}
.info-list{list-style:none;display:flex;flex-direction:column;gap:8px}
.info-list li{display:flex;align-items:flex-start;gap:8px;font-size:0.875rem;color:#374151}
.info-list li::before{content:'✓';color:${site.color};font-weight:700;flex-shrink:0;margin-top:1px}

.call-card{background:${site.color};color:#fff;border-radius:10px;padding:20px;text-align:center}
.call-card p{font-size:0.875rem;opacity:0.9;margin-bottom:12px}
.call-card a{display:block;background:#fff;color:${site.color};font-size:1.0625rem;font-weight:700;padding:12px 20px;border-radius:6px;text-decoration:none;letter-spacing:-0.01em}
.call-card a:hover{background:rgba(255,255,255,0.9)}
.call-card small{display:block;margin-top:8px;font-size:0.75rem;opacity:0.8}

.service-pills{display:flex;flex-wrap:wrap;gap:6px}
.service-pill{font-size:0.8125rem;font-weight:600;color:#374151;background:#F3F4F6;border:1px solid #E5E7EB;padding:5px 10px;border-radius:4px;text-decoration:none;transition:background 0.15s,color 0.15s}
.service-pill:hover{background:${site.color};color:#fff;border-color:${site.color}}

/* FOOTER */
.simple-footer{text-align:center;padding:32px 24px;font-size:0.8125rem;color:#9CA3AF;border-top:1px solid #E5E7EB;margin-top:48px}
.simple-footer a{color:${site.color};text-decoration:none}
</style>
</head>
<body>

<div class="top-bar">Same-day slots available — <a href="tel:${site.phoneHref}">${site.phone}</a> · Mon–Sat 8am–8pm · Sun 9am–6pm</div>

<header>
  <div class="header-inner">
    <a href="/" class="logo"><span>★</span> ${site.name}</a>
    <a href="tel:${site.phoneHref}" class="header-phone">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      ${site.phone}
    </a>
  </div>
</header>

<div class="book-hero">
  <div class="book-hero-inner">
    <h1>Book <em>Same-Day</em> Appliance Repair</h1>
    <p>Choose your time — a certified technician arrives within hours. Serving Toronto, Mississauga, Brampton & GTA.</p>
    <div class="trust-row">
      <span class="trust-badge">✓ Same-day service</span>
      <span class="trust-badge">✓ 90-day warranty</span>
      <span class="trust-badge blue">⭐ 4.9 rated (5,000+ reviews)</span>
      <span class="trust-badge">✓ Upfront pricing</span>
    </div>
  </div>
</div>

<div class="book-layout">
  <div class="booking-card">
    <div class="booking-card-header">
      <h2>Select Your Time Slot</h2>
      <p>Instant confirmation — no waiting for callbacks</p>
    </div>
    <iframe
      class="booking-frame"
      src="${site.bookingUrl}?embed=true"
      title="Book appliance repair"
      loading="lazy"
      allow="payment">
    </iframe>
  </div>

  <div class="sidebar">
    <div class="call-card">
      <p>Prefer to talk first?</p>
      <a href="tel:${site.phoneHref}">${site.phone}</a>
      <small>Mon–Sat 8am–8pm · Sun 9am–6pm</small>
    </div>

    <div class="info-card">
      <h3>What to Expect</h3>
      <ul class="info-list">
        <li>Technician arrives in 1–3 hours after booking</li>
        <li>Diagnosis fee applied to repair cost</li>
        <li>Upfront quote before any work begins</li>
        <li>90-day warranty on all parts &amp; labor</li>
        <li>All major brands serviced</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>Services We Repair</h3>
      <div class="service-pills">
        <a href="/fridge-repair" class="service-pill">Refrigerator</a>
        <a href="/washer-repair" class="service-pill">Washer</a>
        <a href="/dryer-repair" class="service-pill">Dryer</a>
        <a href="/dishwasher-repair" class="service-pill">Dishwasher</a>
        <a href="/oven-repair" class="service-pill">Oven</a>
        <a href="/stove-repair" class="service-pill">Stove</a>
      </div>
    </div>

    <div class="info-card">
      <h3>Coverage Areas</h3>
      <div class="service-pills">
        <a href="/toronto" class="service-pill">Toronto</a>
        <a href="/mississauga" class="service-pill">Mississauga</a>
        <a href="/brampton" class="service-pill">Brampton</a>
        <a href="/scarborough" class="service-pill">Scarborough</a>
        <a href="/vaughan" class="service-pill">Vaughan</a>
        <a href="/markham" class="service-pill">Markham</a>
        <a href="/north-york" class="service-pill">North York</a>
        <a href="/etobicoke" class="service-pill">Etobicoke</a>
      </div>
    </div>
  </div>
</div>

<footer class="simple-footer">
  <p>&copy; 2026 ${site.name} · <a href="/">Home</a> · <a href="/contact">Contact</a> · All appliance repairs come with a 90-day warranty</p>
</footer>

<script src="/includes/header-loader.js" defer></script>
</body>
</html>`;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────

let totalFixed = 0;

for (const site of SITES) {
  if (!fs.existsSync(site.dir)) { console.log(`SKIP: ${site.dir}`); continue; }

  console.log(`\n=== ${site.domain} ===`);
  let fixed = 0;

  // 1. Write vercel.json
  const vercelPath = path.join(site.dir, 'vercel.json');
  const existingVercel = fs.existsSync(vercelPath) ? JSON.parse(fs.readFileSync(vercelPath, 'utf8')) : {};
  const newVercel = { ...existingVercel, ...buildVercelJson(site) };
  fs.writeFileSync(vercelPath, JSON.stringify(newVercel, null, 2));
  console.log('  ✓ vercel.json updated (cleanUrls: true + rewrites)');
  fixed++;

  // 2. Fix all HTML files: canonical, og:url, internal links
  const htmlFiles = [
    ...fs.readdirSync(site.dir).filter(f => f.endsWith('.html')),
  ];
  const blogDir = path.join(site.dir, 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => htmlFiles.push('blog/' + f));
  }

  let htmlFixed = 0;
  for (const file of htmlFiles) {
    const fp = path.join(site.dir, file);
    const before = fs.readFileSync(fp, 'utf8');
    const after = fixHtmlUrls(before, site.domain);
    if (after !== before) {
      fs.writeFileSync(fp, after);
      htmlFixed++;
    }
  }
  console.log(`  ✓ ${htmlFixed}/${htmlFiles.length} HTML files updated (canonicals + internal links)`);
  fixed += htmlFixed;

  // 3. Fix sitemap
  const sitemapPath = path.join(site.dir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const before = fs.readFileSync(sitemapPath, 'utf8');
    const after = fixSitemap(before);
    if (after !== before) {
      fs.writeFileSync(sitemapPath, after);
      console.log('  ✓ sitemap.xml updated (removed .html from URLs)');
      fixed++;
    }
  }

  // 4. Create book.html
  const bookPath = path.join(site.dir, 'book.html');
  fs.writeFileSync(bookPath, buildBookHtml(site));
  console.log('  ✓ book.html created (on-site booking page)');
  fixed++;

  console.log(`  Total: ${fixed} changes`);
  totalFixed += fixed;
}

console.log(`\n✅ Done. ${totalFixed} total changes across ${SITES.length} sites`);
console.log('\nNext: commit + push each site, then Vercel will serve clean URLs');
console.log('  /dryer-repair-toronto (no .html needed)');
console.log('  /services/fridge-repair → /fridge-repair');
console.log('  /brands/samsung → /samsung-repair');
console.log('  /locations/toronto → /toronto');
