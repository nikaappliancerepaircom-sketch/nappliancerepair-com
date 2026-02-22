/**
 * fix-service-schema.js
 * Adds hasOfferCatalog (services list) to LocalBusiness schema on all pages
 * that don't already have Service or hasOfferCatalog.
 * This is GEO best practice: AI crawlers can enumerate services from any page.
 *
 * Run: node fix-service-schema.js
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  { dir: 'C:/nappliancerepair', name: 'N Appliance Repair' },
  { dir: 'C:/appliancerepairneary', name: 'Appliance Repair Neary' },
  { dir: 'C:/fixlifyservices', name: 'Fixlify Appliance Services' },
];

const OFFER_CATALOG = `"hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Appliance Repair Services",
        "itemListElement": [
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Refrigerator Repair"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Washer Repair"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Dryer Repair"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Dishwasher Repair"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Oven Repair"}},
          {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Stove Repair"}}
        ]
      }`;

let globalFixed = 0;

for (const site of SITES) {
  if (!fs.existsSync(site.dir)) { console.log('SKIP:', site.dir); continue; }

  const EXCLUDE = ['service-template.html', '404.html'];
  const htmlFiles = fs.readdirSync(site.dir)
    .filter(f => f.endsWith('.html') && !EXCLUDE.includes(f));
  const blogDir = path.join(site.dir, 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => htmlFiles.push('blog/' + f));
  }

  let fixed = 0;
  for (const file of htmlFiles) {
    const fp = path.join(site.dir, file);
    let html = fs.readFileSync(fp, 'utf8');

    // Skip if already has Service or hasOfferCatalog
    if (html.includes('"Service"') || html.includes('hasOfferCatalog') || html.includes('"Offer"')) continue;

    // Skip if no LocalBusiness (unlikely but safe)
    if (!html.includes('"LocalBusiness"')) continue;

    const before = html;

    // Inject after the aggregateRating block (or after openingHours block)
    html = html.replace(
      /("aggregateRating"[\s\S]*?"reviewCount":\s*"[^"]*"\s*\})/,
      (match) => match + `,\n      ${OFFER_CATALOG}`
    );

    if (html === before) {
      // Fallback: inject after openingHours closing bracket
      html = html.replace(
        /("openingHours":\s*\[[^\]]+\])/,
        (match) => match + `,\n      ${OFFER_CATALOG}`
      );
    }

    if (html !== before) {
      fs.writeFileSync(fp, html);
      fixed++;
    }
  }

  console.log(`${path.basename(site.dir)}: fixed ${fixed}/${htmlFiles.length} pages`);
  globalFixed += fixed;
}

console.log(`\nTotal: ${globalFixed} pages updated with hasOfferCatalog`);
