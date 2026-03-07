#!/usr/bin/env node
/**
 * add-internal-links.js
 * NAR satellite site (nappliancerepair.com) — internal link injection
 *
 * Step 1: Hub pages  → "Services in [City]" grid (all service pages for that city)
 * Step 2: Service pages → breadcrumb + "Related Services in [City]" section
 * Step 3: Brand pages  → brand+city page links grid
 *
 * Usage:
 *   node add-internal-links.js --dry-run   # preview only
 *   node add-internal-links.js             # write files
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const SITE_DIR = __dirname;

// ─── Markers to avoid double-injection ───────────────────────────────────────
const MARKER_HUB_GRID      = '<!-- NAR-HUB-SERVICES-GRID -->';
const MARKER_BREADCRUMB    = '<!-- NAR-BREADCRUMB -->';
const MARKER_RELATED       = '<!-- NAR-RELATED-SERVICES -->';
const MARKER_BRAND_CITIES  = '<!-- NAR-BRAND-CITY-LINKS -->';

// ─── Known city slugs and display names ──────────────────────────────────────
const CITY_MAP = {
  // Toronto area
  'toronto':       'Toronto',
  'north-york':    'North York',
  'scarborough':   'Scarborough',
  'etobicoke':     'Etobicoke',
  'mississauga':   'Mississauga',
  'brampton':      'Brampton',
  'vaughan':       'Vaughan',
  'markham':       'Markham',
  'richmond-hill': 'Richmond Hill',
  'newmarket':     'Newmarket',
  'aurora':        'Aurora',
  'ajax':          'Ajax',
  'pickering':     'Pickering',
  'whitby':        'Whitby',
  'oshawa':        'Oshawa',
  'oakville':      'Oakville',
  'burlington':    'Burlington',
  'hamilton':      'Hamilton',
  'barrie':        'Barrie',
  'bradford':      'Bradford',
  // Alberta
  'calgary':       'Calgary',
  'edmonton':      'Edmonton',
  'airdrie':       'Airdrie',
  'beaumont':      'Beaumont',
  'canmore':       'Canmore',
  'chestermere':   'Chestermere',
  'cochrane':      'Cochrane',
  'devon':         'Devon',
  // Toronto neighbourhoods (these also function as city contexts)
  'bayview-village':     'Bayview Village',
  'birchcliff':          'Birchcliff',
  'bloor-west-village':  'Bloor West Village',
  'cabbagetown':         'Cabbagetown',
  'chinatown':           'Chinatown',
  'corso-italia':        'Corso Italia',
  'danforth-village':    'Danforth Village',
  'davisville-village':  'Davisville Village',
  'don-mills':           'Don Mills',
  'dufferin-grove':      'Dufferin Grove',
  'east-york':           'East York',
  'etobicoke-village':   'Etobicoke Village',
  'forest-hill':         'Forest Hill',
  'greektown':           'Greektown',
  'high-park':           'High Park',
  'humber-valley':       'Humber Valley',
  'islington-village':   'Islington Village',
  'king-west':           'King West',
  'lawrence-park':       'Lawrence Park',
  'leaside':             'Leaside',
  'leslieville':         'Leslieville',
  'liberty-village':     'Liberty Village',
  'little-italy':        'Little Italy',
  'little-portugal':     'Little Portugal',
  'midtown':             'Midtown',
  'ossington':           'Ossington',
  'parkdale':            'Parkdale',
  'riverdale':           'Riverdale',
  'roncesvalles':        'Roncesvalles',
  'rosedale':            'Rosedale',
  'scarborough-village': 'Scarborough Village',
  'st-lawrence':         'St. Lawrence',
  'swansea':             'Swansea',
  'the-annex':           'The Annex',
  'the-beaches':         'The Beaches',
  'the-junction':        'The Junction',
  'thorncliffe-park':    'Thorncliffe Park',
  'trinity-bellwoods':   'Trinity Bellwoods',
  'willowdale':          'Willowdale',
  'wychwood':            'Wychwood',
  'washer-repair-etobicoke': null, // skip - not a pure city hub
};

// ─── Known service slug prefixes and display names ───────────────────────────
const SERVICE_MAP = {
  'fridge-repair':           'Fridge Repair',
  'washer-repair':           'Washer Repair',
  'dryer-repair':            'Dryer Repair',
  'dishwasher-repair':       'Dishwasher Repair',
  'oven-repair':             'Oven Repair',
  'stove-repair':            'Stove Repair',
  'gas-stove-repair':        'Gas Stove Repair',
  'gas-dryer-repair':        'Gas Dryer Repair',
  'gas-oven-repair':         'Gas Oven Repair',
  'gas-appliance-repair':    'Gas Appliance Repair',
  'dishwasher-installation': 'Dishwasher Installation',
  'microwave-repair':        'Microwave Repair',
  'freezer-repair':          'Freezer Repair',
  'range-repair':            'Range Repair',
};

// ─── Known brand slugs ───────────────────────────────────────────────────────
const BRAND_MAP = {
  'samsung-repair':    'Samsung',
  'lg-repair':         'LG',
  'whirlpool-repair':  'Whirlpool',
  'bosch-repair':      'Bosch',
  'frigidaire-repair': 'Frigidaire',
  'ge-repair':         'GE',
  'kenmore-repair':    'Kenmore',
  'maytag-repair':     'Maytag',
  'kitchenaid-repair': 'KitchenAid',
  'miele-repair':      'Miele',
  'electrolux-repair': 'Electrolux',
};

// ─── Stats ────────────────────────────────────────────────────────────────────
let stats = {
  hubGridsAdded: 0,
  breadcrumbsAdded: 0,
  relatedSectionsAdded: 0,
  brandCityLinksAdded: 0,
  totalLinksAdded: 0,
  skippedAlreadyHas: 0,
  filesModified: 0,
};

// ─── Helper: get all HTML files ───────────────────────────────────────────────
function getAllHtmlFiles() {
  return fs.readdirSync(SITE_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace('.html', ''));
}

// ─── Helper: slugify city name for display ─────────────────────────────────────
function getCityName(citySlug) {
  return CITY_MAP[citySlug] || citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Helper: get service name ──────────────────────────────────────────────────
function getServiceName(serviceSlug) {
  return SERVICE_MAP[serviceSlug] || serviceSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Parse filename: returns {type, serviceSlug, citySlug, brandSlug} ──────────
function parseFilename(slug) {
  // Brand+city page: e.g. samsung-repair-toronto, bosch-repair-calgary
  for (const brandSlug of Object.keys(BRAND_MAP)) {
    if (slug.startsWith(brandSlug + '-') && slug !== brandSlug) {
      const city = slug.slice(brandSlug.length + 1);
      if (CITY_MAP[city] !== undefined || city.length > 0) {
        return { type: 'brand-city', brandSlug, citySlug: city };
      }
    }
  }

  // Brand page (no city suffix)
  if (BRAND_MAP[slug]) {
    return { type: 'brand', brandSlug: slug };
  }

  // Service+city page: e.g. dishwasher-repair-toronto, fridge-repair-north-york
  for (const serviceSlug of Object.keys(SERVICE_MAP)) {
    if (slug.startsWith(serviceSlug + '-') && slug !== serviceSlug) {
      const city = slug.slice(serviceSlug.length + 1);
      return { type: 'service-city', serviceSlug, citySlug: city };
    }
  }

  // Pure service page (no city): e.g. dishwasher-repair, fridge-repair
  if (SERVICE_MAP[slug]) {
    return { type: 'service', serviceSlug: slug };
  }

  // City hub: check if it's a known city or looks like one
  if (CITY_MAP[slug] !== undefined) {
    return { type: 'hub', citySlug: slug };
  }

  return { type: 'other' };
}

// ─── Build index of all pages ─────────────────────────────────────────────────
function buildIndex(allSlugs) {
  const index = {
    // citySlug -> list of {serviceSlug, slug} service pages
    servicePagesForCity: {},
    // brandSlug -> list of {citySlug, slug} brand+city pages
    brandCityPages: {},
  };

  for (const slug of allSlugs) {
    const p = parseFilename(slug);
    if (p.type === 'service-city') {
      if (!index.servicePagesForCity[p.citySlug]) {
        index.servicePagesForCity[p.citySlug] = [];
      }
      index.servicePagesForCity[p.citySlug].push({ serviceSlug: p.serviceSlug, slug });
    }
    if (p.type === 'brand-city') {
      if (!index.brandCityPages[p.brandSlug]) {
        index.brandCityPages[p.brandSlug] = [];
      }
      index.brandCityPages[p.brandSlug].push({ citySlug: p.citySlug, slug });
    }
  }

  return index;
}

// ─── HTML generators ──────────────────────────────────────────────────────────

function buildHubServicesGrid(citySlug, cityName, servicePages) {
  const links = servicePages.map(({ serviceSlug, slug }) => {
    const serviceName = getServiceName(serviceSlug);
    return `      <a href="/${slug}" style="display:block;padding:12px 16px;background:white;border-radius:8px;border:1px solid #ddd;color:#2196F3;text-decoration:none;font-weight:500;">${serviceName} in ${cityName}</a>`;
  }).join('\n');

  return `\n${MARKER_HUB_GRID}\n<section style="padding:40px 20px;background:#f0f4ff;">\n  <div style="max-width:860px;margin:0 auto;">\n    <h2 style="font-size:1.25rem;margin-bottom:16px;color:#111;">Our Appliance Repair Services in ${cityName}</h2>\n    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">\n${links}\n    </div>\n  </div>\n</section>\n`;
}

function buildBreadcrumb(citySlug, cityName, serviceName) {
  return `${MARKER_BREADCRUMB}\n<nav aria-label="Breadcrumb" style="padding:12px 20px;background:#f8f9fa;border-bottom:1px solid #e9ecef;font-size:0.875rem;">\n  <ol style="list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px;align-items:center;">\n    <li><a href="/" style="color:#2196F3;text-decoration:none;">Home</a></li>\n    <li style="color:#999;margin:0 4px;">›</li>\n    <li><a href="/${citySlug}" style="color:#2196F3;text-decoration:none;">${cityName}</a></li>\n    <li style="color:#999;margin:0 4px;">›</li>\n    <li style="color:#555;">${serviceName}</li>\n  </ol>\n</nav>\n`;
}

function buildRelatedServices(citySlug, cityName, serviceSlug, allServicePages) {
  // Exclude current service, take up to 6 others
  const others = allServicePages
    .filter(p => p.serviceSlug !== serviceSlug)
    .slice(0, 6);

  if (others.length === 0) return null;

  const links = others.map(({ serviceSlug: sSlug, slug }) => {
    const sName = getServiceName(sSlug);
    return `      <a href="/${slug}" style="display:block;padding:12px 16px;background:white;border-radius:8px;border:1px solid #ddd;color:#2196F3;text-decoration:none;font-weight:500;">${sName} in ${cityName}</a>`;
  }).join('\n');

  return `\n${MARKER_RELATED}\n<section style="padding:40px 20px;background:#f0f4ff;">\n  <div style="max-width:860px;margin:0 auto;">\n    <h2 style="font-size:1.25rem;margin-bottom:16px;color:#111;">More Appliance Repair Services in ${cityName}</h2>\n    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">\n${links}\n    </div>\n  </div>\n</section>\n`;
}

function buildBrandCityLinks(brandSlug, brandName, brandCityPages) {
  const links = brandCityPages.map(({ citySlug, slug }) => {
    const cityName = getCityName(citySlug);
    return `      <a href="/${slug}" style="display:block;padding:12px 16px;background:white;border-radius:8px;border:1px solid #ddd;color:#2196F3;text-decoration:none;font-weight:500;">${brandName} Repair in ${cityName}</a>`;
  }).join('\n');

  return `\n${MARKER_BRAND_CITIES}\n<section style="padding:40px 20px;background:#f0f4ff;">\n  <div style="max-width:860px;margin:0 auto;">\n    <h2 style="font-size:1.25rem;margin-bottom:16px;color:#111;">${brandName} Appliance Repair — Service Locations</h2>\n    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">\n${links}\n    </div>\n  </div>\n</section>\n`;
}

// ─── Injection helpers ────────────────────────────────────────────────────────

/**
 * Insert HTML before the booking section or before </main>
 */
function insertBeforeBookingOrMain(html, injection) {
  // Try before <section class="booking-section
  const bookingIdx = html.indexOf('<section class="booking-section');
  if (bookingIdx !== -1) {
    return html.slice(0, bookingIdx) + injection + html.slice(bookingIdx);
  }
  // Fallback: before </main>
  const mainEndIdx = html.lastIndexOf('</main>');
  if (mainEndIdx !== -1) {
    return html.slice(0, mainEndIdx) + injection + html.slice(mainEndIdx);
  }
  return null;
}

/**
 * Insert breadcrumb right after <main ... > opening tag
 */
function insertAfterMainOpen(html, breadcrumb) {
  // Match <main ...> tag (possibly multiline)
  const mainMatch = html.match(/<main[^>]*>/);
  if (!mainMatch) return null;
  const insertPos = mainMatch.index + mainMatch[0].length;
  return html.slice(0, insertPos) + '\n' + breadcrumb + html.slice(insertPos);
}

/**
 * Insert brand city links before </main>
 */
function insertBeforeMainEnd(html, injection) {
  const mainEndIdx = html.lastIndexOf('</main>');
  if (mainEndIdx === -1) return null;
  return html.slice(0, mainEndIdx) + injection + html.slice(mainEndIdx);
}

// ─── Process hub pages ────────────────────────────────────────────────────────
function processHubPage(slug, citySlug, cityName, servicePages) {
  if (servicePages.length === 0) {
    console.log(`  [HUB] ${slug}.html — no service pages found, skipping`);
    return;
  }

  const filePath = path.join(SITE_DIR, slug + '.html');
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has hub grid
  if (html.includes(MARKER_HUB_GRID)) {
    stats.skippedAlreadyHas++;
    console.log(`  [HUB] ${slug}.html — already has services grid, skipping`);
    return;
  }

  const grid = buildHubServicesGrid(citySlug, cityName, servicePages);
  const newHtml = insertBeforeBookingOrMain(html, grid);

  if (!newHtml) {
    console.log(`  [HUB] ${slug}.html — could not find injection point, skipping`);
    return;
  }

  const linksAdded = servicePages.length;
  console.log(`  [HUB] ${slug}.html — injecting grid with ${linksAdded} service links`);

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    stats.filesModified++;
  }
  stats.hubGridsAdded++;
  stats.totalLinksAdded += linksAdded;
}

// ─── Process service+city pages ───────────────────────────────────────────────
function processServiceCityPage(slug, serviceSlug, citySlug, allServicePagesForCity) {
  const filePath = path.join(SITE_DIR, slug + '.html');
  let html = fs.readFileSync(filePath, 'utf8');

  const cityName = getCityName(citySlug);
  const serviceName = getServiceName(serviceSlug);
  let modified = false;
  let linksAdded = 0;

  // Check if city hub page exists
  const hubExists = fs.existsSync(path.join(SITE_DIR, citySlug + '.html'));

  // --- Breadcrumb ---
  const hasBreadcrumb = html.includes(MARKER_BREADCRUMB);
  // Also check if there's already a styled breadcrumb <nav> with city+service
  const hasExistingBreadcrumb = html.includes('<nav class="breadcrumb"') ||
                                 html.includes('<nav aria-label="Breadcrumb"');

  if (!hasBreadcrumb && !hasExistingBreadcrumb) {
    const breadcrumb = buildBreadcrumb(citySlug, cityName, serviceName);
    const newHtml = insertAfterMainOpen(html, breadcrumb);
    if (newHtml) {
      html = newHtml;
      modified = true;
      stats.breadcrumbsAdded++;
      // Breadcrumb links: Home, city hub (if exists), current (no link)
      linksAdded += hubExists ? 2 : 1;
      console.log(`  [SVC] ${slug}.html — breadcrumb added`);
    }
  } else {
    console.log(`  [SVC] ${slug}.html — breadcrumb already exists, skipping breadcrumb`);
  }

  // --- Related services ---
  const hasRelated = html.includes(MARKER_RELATED);
  // Also check for existing related-links section with actual service links to same city
  const hasExistingRelated = html.includes('class="related-links') ||
                              html.includes(MARKER_RELATED);

  if (!hasRelated && !hasExistingRelated) {
    const relatedHtml = buildRelatedServices(citySlug, cityName, serviceSlug, allServicePagesForCity);
    if (relatedHtml) {
      const newHtml = insertBeforeBookingOrMain(html, relatedHtml);
      if (newHtml) {
        html = newHtml;
        modified = true;
        const relatedCount = allServicePagesForCity.filter(p => p.serviceSlug !== serviceSlug).slice(0, 6).length;
        linksAdded += relatedCount;
        stats.relatedSectionsAdded++;
        console.log(`  [SVC] ${slug}.html — related services added (${relatedCount} links)`);
      }
    }
  } else {
    console.log(`  [SVC] ${slug}.html — related section already exists, skipping`);
  }

  if (modified) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, html, 'utf8');
      stats.filesModified++;
    }
    stats.totalLinksAdded += linksAdded;
  }
}

// ─── Process brand pages ──────────────────────────────────────────────────────
function processBrandPage(slug, brandSlug, brandName, brandCityPages) {
  if (brandCityPages.length === 0) {
    console.log(`  [BRAND] ${slug}.html — no brand+city pages found, skipping`);
    return;
  }

  const filePath = path.join(SITE_DIR, slug + '.html');
  let html = fs.readFileSync(filePath, 'utf8');

  // Skip if already has brand city links
  if (html.includes(MARKER_BRAND_CITIES)) {
    stats.skippedAlreadyHas++;
    console.log(`  [BRAND] ${slug}.html — already has brand city links, skipping`);
    return;
  }

  // Check for existing "Service Areas" section in related-links
  if (html.includes('Service Areas') && html.includes(brandSlug + '-repair-')) {
    console.log(`  [BRAND] ${slug}.html — already has brand city links in related section, skipping`);
    stats.skippedAlreadyHas++;
    return;
  }

  const brandLinksHtml = buildBrandCityLinks(brandSlug, brandName, brandCityPages);
  const newHtml = insertBeforeMainEnd(html, brandLinksHtml);

  if (!newHtml) {
    console.log(`  [BRAND] ${slug}.html — could not find injection point, skipping`);
    return;
  }

  console.log(`  [BRAND] ${slug}.html — injecting ${brandCityPages.length} city links`);

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    stats.filesModified++;
  }
  stats.brandCityLinksAdded++;
  stats.totalLinksAdded += brandCityPages.length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
  console.log(`\n=== NAR Internal Link Injector ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no files written)' : 'LIVE (writing files)'}`);
  console.log(`Site: ${SITE_DIR}\n`);

  const allSlugs = getAllHtmlFiles();
  console.log(`Found ${allSlugs.length} HTML files\n`);

  const index = buildIndex(allSlugs);

  // ── Step 1: Hub pages → services grid ──────────────────────────────────────
  console.log('--- Step 1: Hub pages → services grid ---');
  let hubCount = 0;
  for (const slug of allSlugs) {
    const p = parseFilename(slug);
    if (p.type !== 'hub') continue;
    if (CITY_MAP[p.citySlug] === null) continue; // explicitly excluded
    if (!fs.existsSync(path.join(SITE_DIR, slug + '.html'))) continue;

    const cityName = getCityName(p.citySlug);
    const servicePages = index.servicePagesForCity[p.citySlug] || [];
    hubCount++;
    processHubPage(slug, p.citySlug, cityName, servicePages);
  }
  console.log(`Hub pages found: ${hubCount}\n`);

  // ── Step 2: Service+city pages → breadcrumb + related services ──────────────
  console.log('--- Step 2: Service pages → breadcrumb + related services ---');
  let svcCount = 0;
  for (const slug of allSlugs) {
    const p = parseFilename(slug);
    if (p.type !== 'service-city') continue;
    if (!fs.existsSync(path.join(SITE_DIR, slug + '.html'))) continue;

    const allServicePagesForCity = index.servicePagesForCity[p.citySlug] || [];
    svcCount++;
    processServiceCityPage(slug, p.serviceSlug, p.citySlug, allServicePagesForCity);
  }
  console.log(`Service+city pages found: ${svcCount}\n`);

  // ── Step 3: Brand pages → brand+city links ──────────────────────────────────
  console.log('--- Step 3: Brand pages → brand+city links ---');
  let brandCount = 0;
  for (const slug of allSlugs) {
    const p = parseFilename(slug);
    if (p.type !== 'brand') continue;
    if (!fs.existsSync(path.join(SITE_DIR, slug + '.html'))) continue;

    const brandName = BRAND_MAP[p.brandSlug];
    const brandCityPages = index.brandCityPages[p.brandSlug] || [];
    brandCount++;
    processBrandPage(slug, p.brandSlug, brandName, brandCityPages);
  }
  console.log(`Brand pages found: ${brandCount}\n`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('=== SUMMARY ===');
  console.log(`Hub grids added:          ${stats.hubGridsAdded}`);
  console.log(`Breadcrumbs added:        ${stats.breadcrumbsAdded}`);
  console.log(`Related sections added:   ${stats.relatedSectionsAdded}`);
  console.log(`Brand city grids added:   ${stats.brandCityLinksAdded}`);
  console.log(`Total links added:        ${stats.totalLinksAdded}`);
  console.log(`Pages already up-to-date: ${stats.skippedAlreadyHas}`);
  if (!DRY_RUN) {
    console.log(`Files modified:           ${stats.filesModified}`);
  }
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN — no changes written' : 'LIVE — files written'}`);
}

main();
