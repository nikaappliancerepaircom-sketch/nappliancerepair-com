/**
 * inject-answer-capsule.js
 * Adds GEO-optimized "Quick Answer" box to all service pages.
 * AI systems (ChatGPT, Perplexity, Google AI Overviews) extract this directly.
 *
 * Format: Business name + service + city + phone + price + warranty + hours
 * Placed: Right after first <section> or <div class="hero"> — top of visible content
 */

const fs = require('fs');
const path = require('path');

// ─── Site configs ─────────────────────────────────────────────────────────────
const SITES = [
  {
    dir: 'C:/nappliancerepair',
    domain: 'nappliancerepair.com',
    bizName: 'N Appliance Repair',
    phone: '(416) 826-3424',
    rating: '4.9',
    reviews: '200+',
    style: 'swiss', // blue #2563EB, white bg
  },
  {
    dir: 'C:/appliancerepairneary',
    domain: 'appliancerepairneary.com',
    bizName: 'Appliance Repair Neary',
    phone: '(437) 524-1053',
    rating: '4.9',
    reviews: '287',
    style: 'white', // #1976D2
  },
  {
    dir: 'C:/fixlifyservices',
    domain: 'fixlifyservices.com',
    bizName: 'Fixlify Appliance Services',
    phone: '(437) 524-1053',
    rating: '4.9',
    reviews: '312',
    style: 'dark', // amber #F59E0B, dark bg
  },
];

// ─── Service metadata ─────────────────────────────────────────────────────────
const SERVICES = {
  'washing-machine': { label: 'Washing Machine Repair', price: '$120–$320', time: '1–2 hours' },
  'washer':          { label: 'Washer Repair',          price: '$120–$320', time: '1–2 hours' },
  'refrigerator':    { label: 'Refrigerator Repair',    price: '$150–$380', time: '1–3 hours' },
  'fridge':          { label: 'Fridge Repair',          price: '$150–$380', time: '1–3 hours' },
  'dryer':           { label: 'Dryer Repair',           price: '$100–$280', time: '1–2 hours' },
  'dishwasher':      { label: 'Dishwasher Repair',      price: '$120–$300', time: '1–2 hours' },
  'stove':           { label: 'Stove Repair',           price: '$100–$260', time: '1–2 hours' },
  'oven':            { label: 'Oven Repair',            price: '$100–$280', time: '1–2 hours' },
  'appliance':       { label: 'Appliance Repair',       price: '$100–$380', time: '1–3 hours' },
};

// ─── City display names ───────────────────────────────────────────────────────
const CITY_NAMES = {
  'toronto': 'Toronto', 'north-york': 'North York', 'etobicoke': 'Etobicoke',
  'scarborough': 'Scarborough', 'mississauga': 'Mississauga', 'brampton': 'Brampton',
  'vaughan': 'Vaughan', 'markham': 'Markham', 'richmond-hill': 'Richmond Hill',
  'ajax': 'Ajax', 'whitby': 'Whitby', 'oakville': 'Oakville',
  'burlington': 'Burlington', 'pickering': 'Pickering', 'oshawa': 'Oshawa',
};

// ─── Parse filename → service + city ─────────────────────────────────────────
function parseFilename(filename) {
  const base = filename.replace('.html', '');
  let service = null, city = null;

  // Find city
  for (const [slug, name] of Object.entries(CITY_NAMES)) {
    if (base.endsWith('-' + slug)) {
      city = name;
      const rest = base.slice(0, base.length - slug.length - 1);
      // Find service from rest
      for (const [key] of Object.entries(SERVICES)) {
        if (rest.includes(key)) { service = key; break; }
      }
      break;
    }
  }

  // No city — check if it's a generic service page
  if (!city) {
    for (const [key] of Object.entries(SERVICES)) {
      if (base.includes(key)) { service = key; break; }
    }
  }

  return { service, city };
}

// ─── Detect phone from page content ──────────────────────────────────────────
function detectPhone(html, fallback) {
  const m = html.match(/\((?:416|437|647|905)\)\s*\d{3}[-.\s]\d{4}/);
  return m ? m[0] : fallback;
}

// ─── Build answer capsule HTML ────────────────────────────────────────────────
function buildCapsule(site, service, city, phone) {
  const svc = SERVICES[service] || SERVICES['appliance'];
  const cityStr = city ? ' in ' + city : ' in Toronto & GTA';
  const cityLabel = city || 'Toronto & GTA';

  const text = `${site.bizName} provides same-day ${svc.label.toLowerCase()}${cityStr}. ` +
    `Call ${phone} — available 7 days a week, including evenings. ` +
    `Typical cost ${svc.price}. All major brands: Samsung, LG, Whirlpool, Bosch, GE, Maytag. ` +
    `Most repairs completed in ${svc.time} on the first visit. 90-day parts & labour warranty.`;

  const schemaFaq = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": `Who does ${svc.label.toLowerCase()} in ${cityLabel}?`,
      "acceptedAnswer": { "@type": "Answer", "text": text }
    }, {
      "@type": "Question",
      "name": `How much does ${svc.label.toLowerCase()} cost in ${cityLabel}?`,
      "acceptedAnswer": { "@type": "Answer", "text": `${svc.label} in ${cityLabel} typically costs ${svc.price} depending on the brand and issue. ${site.bizName} provides upfront pricing before work begins. Call ${phone} for a free estimate.` }
    }]
  });

  if (site.style === 'swiss') {
    return `
<script type="application/ld+json">${schemaFaq}</script>
<div class="answer-capsule" style="background:#EFF6FF;border-left:4px solid #2563EB;padding:1rem 1.25rem;margin:1rem auto;max-width:900px;border-radius:0 8px 8px 0;font-family:'Instrument Sans',sans-serif" itemscope itemtype="https://schema.org/Service">
  <div style="font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#2563EB;text-transform:uppercase;margin-bottom:.4rem">Quick Answer</div>
  <p style="margin:0;color:#1E3A5F;font-size:.9rem;line-height:1.6" itemprop="description">${text}</p>
</div>`;
  }

  if (site.style === 'white') {
    return `
<script type="application/ld+json">${schemaFaq}</script>
<div class="answer-capsule" style="background:#E3F2FD;border-left:4px solid #1976D2;padding:1rem 1.25rem;margin:1rem auto;max-width:920px;border-radius:0 10px 10px 0;font-family:'Rubik',sans-serif" itemscope itemtype="https://schema.org/Service">
  <div style="font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#1565C0;text-transform:uppercase;margin-bottom:.4rem">Quick Answer</div>
  <p style="margin:0;color:#0D3B66;font-size:.9rem;line-height:1.6" itemprop="description">${text}</p>
</div>`;
  }

  // dark
  return `
<script type="application/ld+json">${schemaFaq}</script>
<div class="answer-capsule" style="background:#1A1A2E;border-left:4px solid #F59E0B;padding:1rem 1.25rem;margin:1rem auto;max-width:920px;border-radius:0 10px 10px 0;font-family:'Outfit',sans-serif" itemscope itemtype="https://schema.org/Service">
  <div style="font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#F59E0B;text-transform:uppercase;margin-bottom:.4rem">Quick Answer</div>
  <p style="margin:0;color:#CBD5E1;font-size:.9rem;line-height:1.6" itemprop="description">${text}</p>
</div>`;
}

// ─── Find injection point ─────────────────────────────────────────────────────
function inject(html, capsule) {
  // Try: after first </section> that looks like hero, or after first <main>, or after <h1>
  // Best: after the first big hero/intro block — look for pattern after first <section...>...</section>
  const patterns = [
    // After first closing </section> (hero section)
    { re: /(<\/section>)/, replace: '$1' + capsule },
    // After <main>
    { re: /(<main[^>]*>)/, replace: '$1' + capsule },
    // After first <h1>
    { re: /(<h1[^>]*>[\s\S]*?<\/h1>)/, replace: '$1' + capsule },
    // Before first <section> that is NOT the hero
    { re: /(<section)/, replace: capsule + '$1' },
    // Fallback: after <body>
    { re: /(<body[^>]*>)/, replace: '$1' + capsule },
  ];

  for (const { re, replace } of patterns) {
    if (re.test(html)) {
      return html.replace(re, replace);
    }
  }
  return html;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const EXCLUDE = ['404.html', 'service-template.html', 'index.html', 'about.html',
                 'contact.html', 'pricing.html'];

let totalInjected = 0;

for (const site of SITES) {
  if (!fs.existsSync(site.dir)) { console.log('SKIP:', site.dir); continue; }

  const files = fs.readdirSync(site.dir)
    .filter(f => f.endsWith('.html') && !EXCLUDE.includes(f));

  let injected = 0;
  for (const file of files) {
    const filePath = path.join(site.dir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has capsule
    if (html.includes('answer-capsule')) continue;

    const { service, city } = parseFilename(file);
    if (!service) continue; // skip non-service pages

    const phone = detectPhone(html, site.phone);
    const capsule = buildCapsule(site, service, city, phone);

    html = inject(html, capsule);
    fs.writeFileSync(filePath, html);
    injected++;
  }

  console.log(site.domain + ': injected answer capsule into ' + injected + ' pages');
  totalInjected += injected;
}

console.log('\nTotal: ' + totalInjected + ' pages updated with GEO answer capsules');
