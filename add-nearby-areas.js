'use strict';

const fs = require('fs');
const path = require('path');

const SITE_DIR = 'C:/nappliancerepair';

// Patterns that mean "already has a nearby section"
const NEARBY_ALREADY_PATTERNS = [
  'Nearby Areas',
  'Repair Nearby',
  'Washer Repair Nearby',
  'Washing Machine Repair Nearby',
  'Refrigerator Repair Nearby',
  'Oven Repair Nearby',
  'Dryer Repair Nearby',
  'Dishwasher Repair Nearby',
  'Stove Repair Nearby',
  'Fridge Repair Nearby',
  'Service Areas',
  'Installation Areas',
];

// Service slug → display name
const SERVICE_DISPLAY = {
  'appliance-repair': 'Appliance Repair',
  'fridge-repair': 'Fridge Repair',
  'refrigerator-repair': 'Refrigerator Repair',
  'washer-repair': 'Washer Repair',
  'dryer-repair': 'Dryer Repair',
  'dishwasher-repair': 'Dishwasher Repair',
  'dishwasher-installation': 'Dishwasher Installation',
  'oven-repair': 'Oven Repair',
  'stove-repair': 'Stove Repair',
  'range-repair': 'Range Repair',
  'microwave-repair': 'Microwave Repair',
  'gas-appliance-repair': 'Gas Appliance Repair',
  'gas-dryer-repair': 'Gas Dryer Repair',
  'gas-oven-repair': 'Gas Oven Repair',
  'gas-stove-repair': 'Gas Stove Repair',
  'freezer-repair': 'Freezer Repair',
};

// Location slug → display name
const LOCATION_DISPLAY = {
  'birchcliff': 'Birchcliff',
  'bayview-village': 'Bayview Village',
  'leaside': 'Leaside',
  'davisville-village': 'Davisville Village',
  'lawrence-park': 'Lawrence Park',
  'don-mills': 'Don Mills',
  'forest-hill': 'Forest Hill',
  'north-york': 'North York',
  'willowdale': 'Willowdale',
  'thorncliffe-park': 'Thorncliffe Park',
  'east-york': 'East York',
  'cabbagetown': 'Cabbagetown',
  'rosedale': 'Rosedale',
  'the-annex': 'The Annex',
  'midtown': 'Midtown',
  'the-junction': 'The Junction',
  'high-park': 'High Park',
  'bloor-west-village': 'Bloor West Village',
  'humber-valley': 'Humber Valley',
  'islington-village': 'Islington Village',
  'etobicoke-village': 'Etobicoke Village',
  'swansea': 'Swansea',
  'roncesvalles': 'Roncesvalles',
  'parkdale': 'Parkdale',
  'liberty-village': 'Liberty Village',
  'king-west': 'King West',
  'ossington': 'Ossington',
  'dufferin-grove': 'Dufferin Grove',
  'trinity-bellwoods': 'Trinity Bellwoods',
  'little-italy': 'Little Italy',
  'little-portugal': 'Little Portugal',
  'corso-italia': 'Corso Italia',
  'chinatown': 'Chinatown',
  'leslieville': 'Leslieville',
  'riverdale': 'Riverdale',
  'danforth-village': 'Danforth Village',
  'greektown': 'Greektown',
  'the-beaches': 'The Beaches',
  'scarborough-village': 'Scarborough Village',
  'st-lawrence': 'St. Lawrence',
  'wychwood': 'Wychwood',
  'scarborough': 'Scarborough',
  'toronto': 'Toronto',
  'etobicoke': 'Etobicoke',
  'richmond-hill': 'Richmond Hill',
  'markham': 'Markham',
  'vaughan': 'Vaughan',
  'newmarket': 'Newmarket',
  'aurora': 'Aurora',
  'bradford': 'Bradford',
  'king-city': 'King City',
  'thornhill': 'Thornhill',
  'mississauga': 'Mississauga',
  'brampton': 'Brampton',
  'oakville': 'Oakville',
  'burlington': 'Burlington',
  'pickering': 'Pickering',
  'ajax': 'Ajax',
  'oshawa': 'Oshawa',
  'whitby': 'Whitby',
  'calgary': 'Calgary',
  'edmonton': 'Edmonton',
  'airdrie': 'Airdrie',
  'beaumont': 'Beaumont',
  'canmore': 'Canmore',
  'chestermere': 'Chestermere',
  'cochrane': 'Cochrane',
  'devon': 'Devon',
  'leduc': 'Leduc',
  'sherwood-park': 'Sherwood Park',
  'spruce-grove': 'Spruce Grove',
  'st-albert': 'St. Albert',
  'stony-plain': 'Stony Plain',
  'fort-saskatchewan': 'Fort Saskatchewan',
  'high-river': 'High River',
  'langdon': 'Langdon',
  'okotoks': 'Okotoks',
  'strathmore': 'Strathmore',
};

// Nearby map: location slug → array of nearby location slugs
const NEARBY_MAP = {
  'birchcliff':         ['leaside', 'danforth-village', 'leslieville', 'the-beaches', 'east-york'],
  'the-beaches':        ['leslieville', 'birchcliff', 'danforth-village', 'east-york', 'riverdale'],
  'leslieville':        ['riverdale', 'danforth-village', 'the-beaches', 'birchcliff', 'greektown'],
  'danforth-village':   ['leslieville', 'riverdale', 'greektown', 'east-york', 'thorncliffe-park'],
  'greektown':          ['danforth-village', 'riverdale', 'leslieville', 'cabbagetown', 'st-lawrence'],
  'riverdale':          ['cabbagetown', 'danforth-village', 'greektown', 'leslieville', 'st-lawrence'],
  'east-york':          ['danforth-village', 'birchcliff', 'thorncliffe-park', 'don-mills', 'north-york'],
  'scarborough-village': ['scarborough', 'birchcliff', 'east-york', 'the-beaches', 'leslieville'],
  'thorncliffe-park':   ['don-mills', 'east-york', 'danforth-village', 'flemingdon-park', 'north-york'],
  'leaside':            ['davisville-village', 'bayview-village', 'lawrence-park', 'birchcliff', 'don-mills'],
  'davisville-village': ['leaside', 'midtown', 'forest-hill', 'lawrence-park', 'bayview-village'],
  'midtown':            ['davisville-village', 'forest-hill', 'the-annex', 'rosedale', 'lawrence-park'],
  'bayview-village':    ['leaside', 'davisville-village', 'don-mills', 'willowdale', 'north-york'],
  'forest-hill':        ['davisville-village', 'midtown', 'lawrence-park', 'rosedale', 'the-annex'],
  'rosedale':           ['the-annex', 'midtown', 'cabbagetown', 'forest-hill', 'davisville-village'],
  'the-annex':          ['rosedale', 'midtown', 'forest-hill', 'little-italy', 'wychwood'],
  'lawrence-park':      ['davisville-village', 'forest-hill', 'north-york', 'leaside', 'bayview-village'],
  'north-york':         ['willowdale', 'don-mills', 'thorncliffe-park', 'bayview-village', 'leaside'],
  'willowdale':         ['north-york', 'bayview-village', 'don-mills', 'thorncliffe-park', 'leaside'],
  'don-mills':          ['north-york', 'thorncliffe-park', 'bayview-village', 'willowdale', 'leaside'],
  'cabbagetown':        ['rosedale', 'riverdale', 'st-lawrence', 'the-annex', 'midtown'],
  'st-lawrence':        ['cabbagetown', 'riverdale', 'leslieville', 'rosedale', 'the-annex'],
  'king-west':          ['liberty-village', 'trinity-bellwoods', 'ossington', 'parkdale', 'little-portugal'],
  'liberty-village':    ['king-west', 'parkdale', 'trinity-bellwoods', 'the-junction', 'roncesvalles'],
  'trinity-bellwoods':  ['little-italy', 'ossington', 'little-portugal', 'king-west', 'roncesvalles'],
  'ossington':          ['dufferin-grove', 'trinity-bellwoods', 'little-portugal', 'corso-italia', 'wychwood'],
  'dufferin-grove':     ['ossington', 'corso-italia', 'little-italy', 'parkdale', 'roncesvalles'],
  'little-italy':       ['ossington', 'dufferin-grove', 'corso-italia', 'the-annex', 'wychwood'],
  'little-portugal':    ['ossington', 'trinity-bellwoods', 'parkdale', 'dufferin-grove', 'roncesvalles'],
  'corso-italia':       ['dufferin-grove', 'ossington', 'little-italy', 'wychwood', 'parkdale'],
  'chinatown':          ['the-annex', 'little-italy', 'rosedale', 'midtown', 'ossington'],
  'wychwood':           ['corso-italia', 'the-annex', 'forest-hill', 'ossington', 'little-italy'],
  'parkdale':           ['roncesvalles', 'swansea', 'liberty-village', 'king-west', 'dufferin-grove'],
  'roncesvalles':       ['parkdale', 'swansea', 'high-park', 'the-junction', 'liberty-village'],
  'high-park':          ['roncesvalles', 'swansea', 'bloor-west-village', 'the-junction', 'humber-valley'],
  'swansea':            ['high-park', 'roncesvalles', 'parkdale', 'humber-valley', 'bloor-west-village'],
  'bloor-west-village': ['high-park', 'the-junction', 'humber-valley', 'swansea', 'islington-village'],
  'humber-valley':      ['bloor-west-village', 'islington-village', 'etobicoke-village', 'the-junction', 'swansea'],
  'the-junction':       ['bloor-west-village', 'high-park', 'roncesvalles', 'humber-valley', 'liberty-village'],
  'islington-village':  ['humber-valley', 'etobicoke-village', 'bloor-west-village', 'the-junction', 'swansea'],
  'etobicoke-village':  ['islington-village', 'humber-valley', 'etobicoke', 'bloor-west-village', 'the-junction'],
  'toronto':            ['north-york', 'scarborough', 'etobicoke', 'mississauga', 'vaughan'],
  'scarborough':        ['north-york', 'toronto', 'pickering', 'markham', 'ajax'],
  'etobicoke':          ['toronto', 'mississauga', 'north-york', 'brampton', 'humber-valley'],
  'richmond-hill':      ['markham', 'vaughan', 'newmarket', 'aurora', 'thornhill'],
  'markham':            ['richmond-hill', 'vaughan', 'scarborough', 'pickering', 'aurora'],
  'vaughan':            ['richmond-hill', 'markham', 'newmarket', 'king-city', 'north-york'],
  'newmarket':          ['aurora', 'richmond-hill', 'bradford', 'vaughan', 'king-city'],
  'aurora':             ['newmarket', 'richmond-hill', 'vaughan', 'bradford', 'king-city'],
  'bradford':           ['newmarket', 'aurora', 'vaughan', 'king-city', 'richmond-hill'],
  'king-city':          ['vaughan', 'newmarket', 'aurora', 'bradford', 'richmond-hill'],
  'thornhill':          ['vaughan', 'richmond-hill', 'north-york', 'markham', 'newmarket'],
  'mississauga':        ['brampton', 'oakville', 'toronto', 'etobicoke', 'burlington'],
  'brampton':           ['mississauga', 'vaughan', 'toronto', 'oakville', 'etobicoke'],
  'oakville':           ['mississauga', 'burlington', 'brampton', 'etobicoke', 'toronto'],
  'burlington':         ['oakville', 'mississauga', 'brampton', 'etobicoke', 'toronto'],
  'pickering':          ['ajax', 'scarborough', 'whitby', 'markham', 'oshawa'],
  'ajax':               ['pickering', 'whitby', 'scarborough', 'oshawa', 'markham'],
  'whitby':             ['oshawa', 'ajax', 'pickering', 'scarborough', 'markham'],
  'oshawa':             ['whitby', 'ajax', 'pickering', 'scarborough', 'markham'],
  'calgary':            ['airdrie', 'chestermere', 'cochrane', 'okotoks', 'high-river'],
  'airdrie':            ['calgary', 'cochrane', 'chestermere', 'high-river', 'okotoks'],
  'chestermere':        ['calgary', 'airdrie', 'cochrane', 'strathmore', 'high-river'],
  'cochrane':           ['calgary', 'airdrie', 'chestermere', 'canmore', 'okotoks'],
  'canmore':            ['cochrane', 'calgary', 'airdrie', 'okotoks', 'high-river'],
  'okotoks':            ['calgary', 'high-river', 'airdrie', 'chestermere', 'langdon'],
  'high-river':         ['okotoks', 'calgary', 'airdrie', 'chestermere', 'langdon'],
  'langdon':            ['chestermere', 'calgary', 'okotoks', 'airdrie', 'high-river'],
  'strathmore':         ['chestermere', 'calgary', 'airdrie', 'okotoks', 'langdon'],
  'edmonton':           ['sherwood-park', 'st-albert', 'spruce-grove', 'leduc', 'beaumont'],
  'sherwood-park':      ['edmonton', 'fort-saskatchewan', 'st-albert', 'leduc', 'beaumont'],
  'st-albert':          ['edmonton', 'spruce-grove', 'stony-plain', 'sherwood-park', 'leduc'],
  'spruce-grove':       ['st-albert', 'stony-plain', 'edmonton', 'leduc', 'beaumont'],
  'stony-plain':        ['spruce-grove', 'st-albert', 'edmonton', 'sherwood-park', 'leduc'],
  'leduc':              ['edmonton', 'beaumont', 'spruce-grove', 'st-albert', 'sherwood-park'],
  'beaumont':           ['leduc', 'edmonton', 'fort-saskatchewan', 'sherwood-park', 'st-albert'],
  'fort-saskatchewan':  ['edmonton', 'sherwood-park', 'st-albert', 'beaumont', 'leduc'],
  'devon':              ['edmonton', 'leduc', 'spruce-grove', 'st-albert', 'beaumont'],
};

// Brand links per service (for Brands We Service column)
const BRAND_LINKS = {
  'fridge-repair': [
    ['samsung-fridge-repair', 'Samsung'],
    ['lg-fridge-repair', 'LG'],
    ['whirlpool-fridge-repair', 'Whirlpool'],
    ['ge-fridge-repair', 'GE'],
    ['frigidaire-fridge-repair', 'Frigidaire'],
    ['kenmore-fridge-repair', 'Kenmore'],
    ['kitchenaid-fridge-repair', 'KitchenAid'],
    ['maytag-fridge-repair', 'Maytag'],
    ['miele-fridge-repair', 'Miele'],
    ['bosch-fridge-repair', 'Bosch'],
  ],
  'washer-repair': [
    ['samsung-washer-repair', 'Samsung'],
    ['lg-washer-repair', 'LG'],
    ['whirlpool-washer-repair', 'Whirlpool'],
    ['ge-washer-repair', 'GE'],
    ['frigidaire-washer-repair', 'Frigidaire'],
    ['kenmore-washer-repair', 'Kenmore'],
    ['kitchenaid-washer-repair', 'KitchenAid'],
    ['maytag-washer-repair', 'Maytag'],
    ['miele-washer-repair', 'Miele'],
    ['bosch-washer-repair', 'Bosch'],
  ],
  'dryer-repair': [
    ['samsung-dryer-repair', 'Samsung'],
    ['lg-dryer-repair', 'LG'],
    ['whirlpool-dryer-repair', 'Whirlpool'],
    ['kenmore-dryer-repair', 'Kenmore'],
    ['frigidaire-dryer-repair', 'Frigidaire'],
    ['maytag-dryer-repair', 'Maytag'],
    ['ge-repair', 'GE'],
    ['whirlpool-dryer-repair', 'Maytag'],
  ],
  'dishwasher-repair': [
    ['samsung-dishwasher-repair', 'Samsung'],
    ['lg-dishwasher-repair', 'LG'],
    ['whirlpool-dishwasher-repair', 'Whirlpool'],
    ['ge-dishwasher-repair', 'GE'],
    ['bosch-dishwasher-repair', 'Bosch'],
    ['frigidaire-dishwasher-repair', 'Frigidaire'],
    ['kenmore-repair', 'Kenmore'],
    ['maytag-dishwasher-repair', 'Maytag'],
    ['kitchenaid-dishwasher-repair', 'KitchenAid'],
    ['miele-dishwasher-repair', 'Miele'],
  ],
  'oven-repair': [
    ['samsung-repair', 'Samsung'],
    ['lg-oven-repair', 'LG'],
    ['ge-oven-repair', 'GE'],
    ['whirlpool-repair', 'Whirlpool'],
    ['frigidaire-repair', 'Frigidaire'],
    ['bosch-repair', 'Bosch'],
    ['kenmore-repair', 'Kenmore'],
    ['maytag-repair', 'Maytag'],
    ['kitchenaid-repair', 'KitchenAid'],
  ],
  'stove-repair': [
    ['samsung-repair', 'Samsung'],
    ['lg-repair', 'LG'],
    ['ge-repair', 'GE'],
    ['whirlpool-repair', 'Whirlpool'],
    ['frigidaire-repair', 'Frigidaire'],
    ['bosch-repair', 'Bosch'],
    ['kenmore-repair', 'Kenmore'],
    ['maytag-repair', 'Maytag'],
  ],
  'appliance-repair': [
    ['samsung-repair', 'Samsung'],
    ['lg-repair', 'LG'],
    ['whirlpool-repair', 'Whirlpool'],
    ['bosch-repair', 'Bosch'],
    ['ge-repair', 'GE'],
    ['frigidaire-repair', 'Frigidaire'],
    ['kenmore-repair', 'Kenmore'],
    ['maytag-repair', 'Maytag'],
    ['miele-repair', 'Miele'],
  ],
};

// Other services at a location (for Related Services column)
const ALL_SERVICES = [
  ['fridge-repair', 'Fridge Repair'],
  ['washer-repair', 'Washer Repair'],
  ['dryer-repair', 'Dryer Repair'],
  ['dishwasher-repair', 'Dishwasher Repair'],
  ['oven-repair', 'Oven Repair'],
  ['stove-repair', 'Stove Repair'],
];

function toTitleCase(slug) {
  if (LOCATION_DISPLAY[slug]) return LOCATION_DISPLAY[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function parseFilename(fname) {
  const base = fname.replace('.html', '');
  const services = [
    'dishwasher-installation', 'gas-appliance-repair', 'gas-dryer-repair',
    'gas-oven-repair', 'gas-stove-repair', 'washing-machine-repair',
    'refrigerator-repair', 'dishwasher-repair', 'fridge-repair', 'washer-repair',
    'dryer-repair', 'oven-repair', 'stove-repair', 'range-repair',
    'microwave-repair', 'freezer-repair', 'appliance-repair',
  ];

  for (const svc of services) {
    if (base === svc) return { service: svc, location: null };
    if (base.startsWith(svc + '-')) {
      const loc = base.slice(svc.length + 1);
      return { service: svc, location: loc };
    }
  }

  if (LOCATION_DISPLAY[base] || NEARBY_MAP[base]) {
    return { service: 'appliance-repair', location: base };
  }

  return { service: null, location: null };
}

function buildRelatedServicesLinks(service, location) {
  if (!location) return [];
  const locDisplay = toTitleCase(location);
  return ALL_SERVICES
    .filter(([svcSlug]) => svcSlug !== service)
    .slice(0, 5)
    .map(([svcSlug, svcDisplay]) =>
      `<li><a href="/${svcSlug}-${location}">${svcDisplay} in ${locDisplay}</a></li>`
    );
}

function buildNearbyLinks(service, location) {
  if (!location) return [];
  const nearbyLocs = NEARBY_MAP[location];
  if (!nearbyLocs || nearbyLocs.length === 0) return [];

  const serviceDisplay = SERVICE_DISPLAY[service] || service
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return nearbyLocs.slice(0, 5).map(loc => {
    const locDisplay = toTitleCase(loc);
    return `<li><a href="/${service}-${loc}">${serviceDisplay} in ${locDisplay}</a></li>`;
  });
}

function buildBrandLinks(service) {
  const brands = BRAND_LINKS[service] || BRAND_LINKS['appliance-repair'];
  // Deduplicate by slug
  const seen = new Set();
  const unique = brands.filter(([slug]) => {
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
  return unique.slice(0, 9).map(([slug, name]) =>
    `<li><a href="/${slug}">${name}</a></li>`
  );
}

function buildFullRelatedSection(service, location) {
  const relatedLinks = buildRelatedServicesLinks(service, location);
  const nearbyLinks = buildNearbyLinks(service, location);
  const brandLinks = buildBrandLinks(service);

  if (nearbyLinks.length === 0) return null;

  const locDisplay = location ? toTitleCase(location) : '';
  const svcDisplay = SERVICE_DISPLAY[service] || service
    .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const relColH3 = location ? `Related Services` : `Related Services`;

  return `
  <!-- Related Links -->
  <section class="related-links fade-in" aria-label="Related pages">
    <div class="related-links-grid">
      <div class="related-col">
        <h3>Related Services</h3>
        <ul class="related-list">${relatedLinks.join('\n')}</ul>
      </div>
      <div class="related-col">
        <h3>Nearby Areas</h3>
        <ul class="related-list">${nearbyLinks.join('\n')}</ul>
      </div>
      <div class="related-col">
        <h3>Brands We Service</h3>
        <ul class="related-list">${brandLinks.join('\n')}</ul>
      </div>
    </div>
  </section>`;
}

function buildNearbyColOnly(service, location) {
  const nearbyLinks = buildNearbyLinks(service, location);
  if (nearbyLinks.length === 0) return null;
  return `      <div class="related-col">
        <h3>Nearby Areas</h3>
        <ul class="related-list">${nearbyLinks.join('\n')}</ul>
      </div>`;
}

// CHIP SECTION INJECTION MARKER
const CHIP_MARKER = '<section style="padding:28px 0;border-top:1px solid rgba(0,0,0,.08)">';

// Main execution
const files = fs.readdirSync(SITE_DIR)
  .filter(f => f.endsWith('.html'))
  .sort();

// Skip these files entirely
const SKIP_FILES = new Set([
  '404.html', 'about.html', 'book.html', 'brands.html', 'contact.html',
  'for-businesses.html', 'index.html', 'locations.html', 'pricing.html',
  'service-template.html', 'gas-appliance-repair.html', 'gas-appliance-repair-toronto.html',
  'gas-appliance-repair-north-york.html', 'gas-appliance-repair-scarborough.html',
  'gas-appliance-repair-mississauga.html', 'gas-appliance-repair-etobicoke.html',
]);

let added = 0;
let skippedAlreadyHas = 0;
let skippedNoGrid = 0;
let skippedNoParse = 0;
let skippedNoNearbyData = 0;
let skippedOther = 0;
let errors = 0;
const errorList = [];
const addedList = [];

for (const fname of files) {
  if (SKIP_FILES.has(fname)) { skippedOther++; continue; }

  const filePath = path.join(SITE_DIR, fname);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    errors++;
    errorList.push('Read error: ' + fname + ': ' + e.message);
    continue;
  }

  // Check if already has nearby section
  const hasNearby = NEARBY_ALREADY_PATTERNS.some(p => content.includes(p));
  if (hasNearby) { skippedAlreadyHas++; continue; }

  // Parse filename
  const { service, location } = parseFilename(fname);
  if (!service || !location) { skippedNoParse++; continue; }

  const hasGrid = content.includes('<div class="related-links-grid">');

  let newContent = null;

  if (hasGrid) {
    // Case 1: Has grid but missing Nearby Areas col (insert between Related and Brands)
    // Find "Brands We Service" col start
    let brandsColMarker = null;
    if (content.includes('<h3>Brands We Service</h3>')) brandsColMarker = '<h3>Brands We Service</h3>';
    else if (content.includes('<h3>Brands We Install</h3>')) brandsColMarker = '<h3>Brands We Install</h3>';

    if (!brandsColMarker) { skippedNoGrid++; continue; }

    const brandsIdx = content.indexOf(brandsColMarker);
    const divBefore = content.lastIndexOf('<div class="related-col">', brandsIdx);
    if (divBefore === -1) { skippedNoGrid++; continue; }

    const nearbyCol = buildNearbyColOnly(service, location);
    if (!nearbyCol) { skippedNoNearbyData++; continue; }

    newContent = content.slice(0, divBefore) +
      nearbyCol + '\n' +
      content.slice(divBefore);

  } else {
    // Case 2: No grid at all - insert full related-links section before chip section
    const chipIdx = content.indexOf(CHIP_MARKER);
    if (chipIdx === -1) { skippedNoGrid++; continue; }

    const fullSection = buildFullRelatedSection(service, location);
    if (!fullSection) { skippedNoNearbyData++; continue; }

    newContent = content.slice(0, chipIdx) +
      fullSection + '\n\n' +
      content.slice(chipIdx);
  }

  if (!newContent) { skippedOther++; continue; }

  try {
    fs.writeFileSync(filePath, newContent, 'utf8');
    added++;
    addedList.push(fname);
    if (added <= 15) console.log('  Added: ' + fname);
  } catch (e) {
    errors++;
    errorList.push('Write error: ' + fname + ': ' + e.message);
  }
}

if (added > 15) console.log('  ... and ' + (added - 15) + ' more');

console.log('\n=== RESULTS ===');
console.log('Added Nearby Areas: ' + added);
console.log('Skipped (already has nearby): ' + skippedAlreadyHas);
console.log('Skipped (no grid/not applicable): ' + skippedNoGrid);
console.log('Skipped (filename not parseable): ' + skippedNoParse);
console.log('Skipped (no nearby data for location): ' + skippedNoNearbyData);
console.log('Skipped (other/not target): ' + skippedOther);
console.log('Errors: ' + errors);

if (errorList.length > 0) {
  console.log('\nErrors:');
  errorList.forEach(function(e) { console.log('  ' + e); });
}
