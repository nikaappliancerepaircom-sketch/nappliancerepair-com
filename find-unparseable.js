'use strict';
const fs = require('fs');
const path = require('path');
const siteDir = 'C:/nappliancerepair';

const SKIP_FILES = new Set([
  '404.html', 'about.html', 'book.html', 'brands.html', 'contact.html',
  'for-businesses.html', 'index.html', 'locations.html', 'pricing.html',
  'service-template.html', 'gas-appliance-repair.html', 'gas-appliance-repair-toronto.html',
  'gas-appliance-repair-north-york.html', 'gas-appliance-repair-scarborough.html',
  'gas-appliance-repair-mississauga.html', 'gas-appliance-repair-etobicoke.html',
]);

const LOCATION_DISPLAY = {
  'birchcliff': 'Birchcliff', 'bayview-village': 'Bayview Village', 'leaside': 'Leaside',
  'davisville-village': 'Davisville Village', 'lawrence-park': 'Lawrence Park',
  'don-mills': 'Don Mills', 'forest-hill': 'Forest Hill', 'north-york': 'North York',
  'willowdale': 'Willowdale', 'toronto': 'Toronto', 'etobicoke': 'Etobicoke',
  'scarborough': 'Scarborough', 'richmond-hill': 'Richmond Hill', 'markham': 'Markham',
  'vaughan': 'Vaughan', 'newmarket': 'Newmarket', 'aurora': 'Aurora', 'bradford': 'Bradford',
  'mississauga': 'Mississauga', 'brampton': 'Brampton', 'oakville': 'Oakville',
  'pickering': 'Pickering', 'ajax': 'Ajax', 'oshawa': 'Oshawa', 'whitby': 'Whitby',
  'calgary': 'Calgary', 'edmonton': 'Edmonton', 'airdrie': 'Airdrie', 'beaumont': 'Beaumont',
  'canmore': 'Canmore', 'chestermere': 'Chestermere', 'cochrane': 'Cochrane', 'devon': 'Devon',
};

const NEARBY_MAP_KEYS = new Set([
  'birchcliff', 'the-beaches', 'leslieville', 'danforth-village', 'greektown', 'riverdale',
  'east-york', 'scarborough-village', 'thorncliffe-park', 'leaside', 'davisville-village',
  'midtown', 'bayview-village', 'forest-hill', 'rosedale', 'the-annex', 'lawrence-park',
  'north-york', 'willowdale', 'don-mills', 'cabbagetown', 'st-lawrence', 'king-west',
  'liberty-village', 'trinity-bellwoods', 'ossington', 'dufferin-grove', 'little-italy',
  'little-portugal', 'corso-italia', 'chinatown', 'wychwood', 'parkdale', 'roncesvalles',
  'high-park', 'swansea', 'bloor-west-village', 'humber-valley', 'the-junction',
  'islington-village', 'etobicoke-village', 'toronto', 'scarborough', 'etobicoke',
  'richmond-hill', 'markham', 'vaughan', 'newmarket', 'aurora', 'bradford', 'king-city',
  'thornhill', 'mississauga', 'brampton', 'oakville', 'burlington', 'pickering', 'ajax',
  'whitby', 'oshawa', 'calgary', 'airdrie', 'chestermere', 'cochrane', 'canmore', 'okotoks',
  'high-river', 'langdon', 'strathmore', 'edmonton', 'sherwood-park', 'st-albert',
  'spruce-grove', 'stony-plain', 'leduc', 'beaumont', 'fort-saskatchewan', 'devon',
]);

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
    if (base.startsWith(svc + '-')) return { service: svc, location: base.slice(svc.length + 1) };
  }
  if (LOCATION_DISPLAY[base] || NEARBY_MAP_KEYS.has(base)) return { service: 'appliance-repair', location: base };
  return { service: null, location: null };
}

const NEARBY_ALREADY_PATTERNS = [
  'Nearby Areas', 'Repair Nearby', 'Service Areas', 'Installation Areas',
];

const files = fs.readdirSync(siteDir).filter(f => f.endsWith('.html')).sort();
const unparseable = [];
for (const fname of files) {
  if (SKIP_FILES.has(fname)) continue;
  const c = fs.readFileSync(path.join(siteDir, fname), 'utf8');
  const hasNearby = NEARBY_ALREADY_PATTERNS.some(p => c.includes(p));
  if (hasNearby) continue;
  const { service, location } = parseFilename(fname);
  if (!service || !location) {
    unparseable.push({ fname, service, location });
  }
}
console.log('Unparseable files:', unparseable.length);
unparseable.forEach(p => console.log(' ', p.fname, '| svc:', p.service, '| loc:', p.location));
