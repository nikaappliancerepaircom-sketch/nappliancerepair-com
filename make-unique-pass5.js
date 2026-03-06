#!/usr/bin/env node
/**
 * make-unique-pass5.js — Deep FAQ and extended-content rewriting
 *
 * Strategy: For each city page, rewrite FAQ answers and extended-content
 * paragraphs with city-specific sentence variations selected by hash.
 * This ensures different cities get different text even for the same service.
 *
 * Marker: <!-- PASS5-DONE --> to prevent re-runs.
 */

const fs = require('fs');
const path = require('path');

const ROOT = 'C:/nappliancerepair';

// Simple hash function for deterministic but varied selection
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// City data for unique sentence fragments
const CITY_DATA = {
  'toronto': { region: 'downtown Toronto', homes: 'pre-war brick homes and modern condos', water: 'Lake Ontario municipal', demo: 'diverse urban households', arrival: '30-45 minutes in the GTA core' },
  'north-york': { region: 'North York', homes: 'split-level bungalows and high-rise towers', water: 'municipal treated', demo: 'established families and young professionals', arrival: '25-40 minutes across North York' },
  'scarborough': { region: 'Scarborough', homes: 'detached homes built in the 1960s-80s', water: 'Highland Creek watershed municipal', demo: 'multicultural families', arrival: '30-50 minutes in eastern Toronto' },
  'etobicoke': { region: 'Etobicoke', homes: 'post-war bungalows and newer townhomes', water: 'Lake Ontario supply via Humber treatment', demo: 'families in established neighbourhoods', arrival: '25-45 minutes in western Toronto' },
  'mississauga': { region: 'Mississauga', homes: 'suburban detached homes and Square One condos', water: 'Peel Region treated water', demo: 'growing suburban families', arrival: '35-55 minutes across Peel Region' },
  'brampton': { region: 'Brampton', homes: 'newer subdivision homes with open-concept layouts', water: 'Peel Region hard water supply', demo: 'young families in new developments', arrival: '40-60 minutes in Brampton' },
  'markham': { region: 'Markham', homes: 'executive detached homes and heritage properties', water: 'York Region municipal', demo: 'tech professionals and established families', arrival: '35-50 minutes in York Region' },
  'vaughan': { region: 'Vaughan', homes: 'newer estates and Kleinburg heritage homes', water: 'York Region municipal supply', demo: 'families in premium developments', arrival: '30-50 minutes from our Vaughan base' },
  'richmond-hill': { region: 'Richmond Hill', homes: 'large detached homes on generous lots', water: 'York Region treated water', demo: 'established suburban families', arrival: '30-45 minutes in central York Region' },
  'oakville': { region: 'Oakville', homes: 'upscale detached homes and waterfront properties', water: 'Halton Region municipal', demo: 'affluent families and retirees', arrival: '40-55 minutes in Halton Region' },
  'burlington': { region: 'Burlington', homes: 'mid-century homes and newer lakeside condos', water: 'Halton Region treated', demo: 'families and professionals along the lakeshore', arrival: '45-60 minutes in Burlington' },
  'ajax': { region: 'Ajax', homes: 'suburban homes built since the 1990s', water: 'Durham Region municipal', demo: 'commuter families', arrival: '35-50 minutes in Durham Region' },
  'pickering': { region: 'Pickering', homes: 'diverse mix of older and newer developments', water: 'Durham Region treated water', demo: 'families across established and new communities', arrival: '30-45 minutes in western Durham' },
  'oshawa': { region: 'Oshawa', homes: 'affordable detached homes and wartime housing', water: 'Durham Region supply from Lake Ontario', demo: 'blue-collar families and students', arrival: '40-55 minutes in Oshawa' },
  'whitby': { region: 'Whitby', homes: 'family-oriented subdivisions and heritage downtown', water: 'Durham Region municipal', demo: 'young families in growing communities', arrival: '35-50 minutes in central Durham' },
  'newmarket': { region: 'Newmarket', homes: 'heritage Main Street homes and modern subdivisions', water: 'York Region well-supplemented municipal', demo: 'families in a growing town centre', arrival: '40-55 minutes in northern York Region' },
  'bradford': { region: 'Bradford', homes: 'rural properties and newer tract housing', water: 'local well water and municipal blend', demo: 'growing families on the urban fringe', arrival: '45-65 minutes north of Toronto' },
  'east-york': { region: 'East York', homes: 'classic Toronto bungalows and semi-detached homes', water: 'Toronto municipal', demo: 'long-time residents and new homeowners', arrival: '20-35 minutes in east-central Toronto' },
  'calgary': { region: 'Calgary', homes: 'modern infills and established bungalows', water: 'Bow River treated municipal', demo: 'Alberta families and professionals', arrival: '30-50 minutes across Calgary' },
  'edmonton': { region: 'Edmonton', homes: 'wartime bungalows and newer suburban builds', water: 'North Saskatchewan River treated', demo: 'diverse Alberta households', arrival: '30-55 minutes across Edmonton' },
  'airdrie': { region: 'Airdrie', homes: 'newer suburban developments north of Calgary', water: 'Calgary-supplied treated water', demo: 'young families in a growing bedroom community', arrival: '45-65 minutes from our Calgary base' },
  'beaumont': { region: 'Beaumont', homes: 'newer family homes south of Edmonton', water: 'Edmonton-supplied municipal', demo: 'commuter families near Edmonton', arrival: '40-55 minutes from our Edmonton base' },
  // Neighbourhoods
  'bayview-village': { region: 'Bayview Village', homes: 'luxury condos and established bungalows', water: 'Toronto municipal', demo: 'affluent professionals near Bayview subway', arrival: '20-35 minutes in north-central Toronto' },
  'birchcliff': { region: 'Birchcliff', homes: 'charming cottages and updated bungalows near the Bluffs', water: 'Toronto municipal', demo: 'families enjoying Scarborough Bluffs lifestyle', arrival: '25-40 minutes in southeast Toronto' },
  'cabbagetown': { region: 'Cabbagetown', homes: 'restored Victorian row houses', water: 'Toronto municipal', demo: 'heritage home enthusiasts and young professionals', arrival: '15-25 minutes in central Toronto' },
  'danforth-village': { region: 'Danforth Village', homes: 'Edwardian semis and updated detached homes', water: 'Toronto municipal', demo: 'families along the Danforth corridor', arrival: '20-30 minutes in east-central Toronto' },
  'davisville-village': { region: 'Davisville Village', homes: 'mid-rise condos and period homes near the subway', water: 'Toronto municipal', demo: 'professionals with easy midtown transit access', arrival: '15-25 minutes in midtown Toronto' },
  'don-mills': { region: 'Don Mills', homes: 'planned community homes from the 1950s-60s and modern towers', water: 'Toronto municipal', demo: 'diverse residents in Canada\'s first planned suburb', arrival: '20-35 minutes in north Toronto' },
  'forest-hill': { region: 'Forest Hill', homes: 'grand Tudor and Georgian estate homes', water: 'Toronto municipal', demo: 'affluent families in one of Toronto\'s premier neighbourhoods', arrival: '15-30 minutes in central Toronto' },
  'humber-valley': { region: 'Humber Valley', homes: 'spacious post-war homes along the Humber River', water: 'Toronto municipal', demo: 'established families near green ravine spaces', arrival: '25-40 minutes in west Toronto' },
  'islington-village': { region: 'Islington Village', homes: 'quaint village homes and modern low-rises', water: 'Toronto municipal', demo: 'residents who appreciate small-town feel in the city', arrival: '25-40 minutes in west Etobicoke' },
  'lawrence-park': { region: 'Lawrence Park', homes: 'stately homes on tree-lined streets', water: 'Toronto municipal', demo: 'established families in a prestigious enclave', arrival: '20-30 minutes in north-central Toronto' },
  'leaside': { region: 'Leaside', homes: 'well-maintained brick homes from the 1930s-50s', water: 'Toronto municipal', demo: 'families in a walkable east-end community', arrival: '20-30 minutes in midtown Toronto' },
  'leslieville': { region: 'Leslieville', homes: 'Victorian row houses and converted lofts', water: 'Toronto municipal', demo: 'creative professionals and young families', arrival: '15-25 minutes in east-end Toronto' },
  'liberty-village': { region: 'Liberty Village', homes: 'converted industrial lofts and modern condos', water: 'Toronto municipal', demo: 'young professionals in a trendy urban village', arrival: '15-25 minutes near downtown Toronto' },
  'parkdale': { region: 'Parkdale', homes: 'grand Victorian homes divided into apartments and restored houses', water: 'Toronto municipal', demo: 'an eclectic mix of artists, families, and newcomers', arrival: '15-25 minutes in west-end Toronto' },
  'riverdale': { region: 'Riverdale', homes: 'Victorian and Edwardian semis with deep lots', water: 'Toronto municipal', demo: 'families near the Don Valley and Broadview', arrival: '15-25 minutes in east Toronto' },
  'rosedale': { region: 'Rosedale', homes: 'grand heritage mansions and exclusive estates', water: 'Toronto municipal', demo: 'Toronto\'s most prestigious residential enclave', arrival: '15-25 minutes in central Toronto' },
  'scarborough-village': { region: 'Scarborough Village', homes: 'modest bungalows and townhomes near the bluffs', water: 'Toronto municipal', demo: 'diverse working families', arrival: '25-40 minutes in southeast Scarborough' },
  'annex': { region: 'the Annex', homes: 'grand Victorian homes and low-rise apartments near U of T', water: 'Toronto municipal', demo: 'students, professors, and long-time residents', arrival: '15-25 minutes in central Toronto' },
  'junction': { region: 'the Junction', homes: 'renovated workers\' cottages and new infills', water: 'Toronto municipal', demo: 'trendy families in a revitalized west-end neighbourhood', arrival: '20-30 minutes in west Toronto' },
};

// Variation pools — each FAQ/section gets multiple rewrites, selected by hash
const FAQ_COST_VARIANTS = [
  (city, price) => `For ${city.region} homeowners, standard installation with existing plumbing runs ${price}. If we need to remove your old unit first, that adds $50-$80 to the total. We quote a fixed price before starting — no surprises.`,
  (city, price) => `Installation pricing for ${city.homes} is typically ${price} for a straightforward swap. Old unit removal adds $50-$80. We always confirm the exact cost on-site before beginning work.`,
  (city, price) => `In ${city.region}, a standard unit swap costs ${price}, which covers all hardware and labour. Removing and disposing of the old appliance is $50-$80 extra. We give you the final number before any work begins.`,
  (city, price) => `Homeowners in ${city.region} pay ${price} for basic installation into existing hookups. Factor in $50-$80 if we are hauling away the old unit. Every job gets a written quote up front.`,
  (city, price) => `The going rate for ${city.region} installations is ${price} when plumbing is already in place. Add $50-$80 for old-unit haul-away. We lock in pricing before we start, so there are never unexpected charges.`,
];

const FAQ_SAMEDAY_VARIANTS = [
  (city) => `Absolutely. Ring us at (437) 524-1053 before 2 PM and we will try to reach you within ${city.arrival}. Our van carries all standard fittings, supply lines, and drain connectors for most brands.`,
  (city) => `Yes — call (437) 524-1053 by early afternoon for same-day bookings. We aim to be at your door within ${city.arrival}, fully stocked with hoses, clamps, and mounting kits.`,
  (city) => `Same-day service is available for ${city.region} — just call (437) 524-1053 before 2 PM. Our technician can typically arrive within ${city.arrival}, tools and hardware ready.`,
  (city) => `We offer same-day in ${city.region} when you call (437) 524-1053 before midday. Expect arrival within ${city.arrival}. The van is pre-loaded with everything needed for standard installations.`,
  (city) => `Call (437) 524-1053 before 2 PM for same-day availability in ${city.region}. Typical response time is ${city.arrival}. We bring all necessary connectors and hardware — no extra trips needed.`,
];

const FAQ_INCLUDES_VARIANTS = [
  (city) => `Every installation covers the full scope: old unit removal, new unit positioning, water supply hookup, drain connection, electrical wiring, leak testing, and a complete wash cycle test. In ${city.region}, we also check your ${city.water} connection pressure to make sure everything flows properly.`,
  (city) => `Our service in ${city.region} includes removing the old appliance, setting the new one, connecting water and drain lines, handling electrical, testing for leaks, and running a full cycle. We also verify adequate water pressure from your ${city.water} supply.`,
  (city) => `The complete package for ${city.region}: haul-away of the old unit, precise levelling of the new one, all plumbing and electrical connections, leak check, and a test cycle. For ${city.homes}, we pay special attention to ensuring cabinetry alignment.`,
  (city) => `For ${city.demo} in ${city.region}, installation includes everything from start to finish: disconnecting the old unit, placing the new one, hooking up water and drainage, connecting power, checking for leaks, and a verification cycle. No shortcuts.`,
  (city) => `In ${city.region}, our standard installation covers old-unit disposal, positioning and levelling, plumbing and drain connections, power hookup, a thorough leak test, and a complete test wash. We treat every ${city.homes.split(' and ')[0]} kitchen with care.`,
];

const FAQ_FIRSTTIME_VARIANTS = [
  (city) => `Yes — first-time installations are a specialty. In ${city.region}, many of ${city.homes} lack a pre-existing dishwasher cutout. We handle the cabinet modification, run new water and drain lines, and ensure the electrical meets code. The result looks factory-finished.`,
  (city) => `First-time installs are no problem. We routinely work with ${city.homes} in ${city.region} that have never had a dishwasher. That means creating the cabinet opening, running supply and drain plumbing, and adding a dedicated circuit if needed.`,
  (city) => `Definitely. Many homes in ${city.region} — particularly ${city.homes} — were built without a dishwasher. We cut and finish the cabinet, install all plumbing from scratch, and connect the electrical. Full code compliance guaranteed.`,
  (city) => `Yes, and it is one of our most common jobs in ${city.region}. For ${city.homes}, we measure the cabinet, create the opening, run water and drain lines, and ensure proper electrical. Everything is left clean and fully functional.`,
  (city) => `We handle plenty of first-time installs across ${city.region}. The process includes cabinet modification, new water supply and drain plumbing, electrical connection, and a test cycle. Particularly for ${city.homes}, we ensure a seamless fit.`,
];

const FAQ_OWNUNIT_VARIANTS = [
  (city) => `Yes — bring your own unit from any retailer (Home Depot, Lowe\'s, Best Buy, Costco, or independent dealers) and we install it. In ${city.region}, we see a wide mix of brands in ${city.homes}. Our technicians are trained on every major manufacturer.`,
  (city) => `Absolutely. Purchase wherever you get the best deal and call us for the install. We work with every brand commonly sold in ${city.region} — from budget-friendly options to premium European units found in ${city.homes}.`,
  (city) => `Yes. Many ${city.demo} shop around for deals. Buy your dishwasher anywhere and book us for installation. We handle all makes and models that ${city.region} homeowners bring in.`,
  (city) => `Of course. Buy from any store — big box, independent, or online — and we will install it in your ${city.region} home. Our team is experienced with every brand, from entry-level to high-end units popular in ${city.homes}.`,
  (city) => `Yes, we install customer-supplied units every day in ${city.region}. Get the best price wherever you shop, then call us. Our techs handle all brands and are familiar with the cabinetry layouts common in ${city.homes}.`,
];

const FAQ_WARRANTY_VARIANTS = [
  (city) => `Every job in ${city.region} includes our 90-day workmanship warranty covering all plumbing, electrical, and mounting. If anything we installed fails within 90 days, we come back at no charge. Your manufacturer warranty stays fully intact.`,
  (city) => `Yes — 90-day warranty on all our work, including plumbing connections, electrical, and hardware. For ${city.demo}, this means peace of mind. If a connection leaks or a fitting loosens within 90 days, one call fixes it free.`,
  (city) => `All installations in ${city.region} carry a 90-day warranty on our workmanship. That covers supply lines, drain connections, electrical, and mounting. The appliance manufacturer warranty is separate and unaffected by our service.`,
  (city) => `We back our work with a 90-day guarantee for all ${city.region} customers. Plumbing, electrical, and mounting — if any connection we made has an issue within 90 days, we return and fix it at no cost. Your factory warranty remains valid.`,
  (city) => `Yes. Our 90-day workmanship warranty applies to every installation across ${city.region}. It covers all connections and hardware we install. For ${city.homes}, where plumbing configurations vary, this warranty provides valuable protection.`,
];

// Extended content variations
const STEP_INTRO_VARIANTS = [
  (city, service) => `Here is exactly how our ${service} service works in ${city.region}, from the moment our technician arrives at your door:`,
  (city, service) => `When you book ${service} in ${city.region}, our certified technician follows a precise process tailored to ${city.homes}:`,
  (city, service) => `Our ${service} process for ${city.region} homes is methodical and thorough. Here is what ${city.demo} can expect:`,
  (city, service) => `For ${city.homes} in ${city.region}, our ${service} procedure covers every detail from arrival to cleanup:`,
  (city, service) => `${city.region} homeowners get a streamlined ${service} experience. Our technician handles everything step by step:`,
];

const DIY_INTRO_VARIANTS = [
  (city) => `While some handy homeowners in ${city.region} tackle this themselves, professional installation ensures code compliance and protects your warranty. For ${city.homes}, the complexity often exceeds typical DIY scope.`,
  (city) => `DIY is tempting, but in ${city.region} there are good reasons to go professional. Many of ${city.homes} have unique plumbing or electrical layouts that require expertise. A botched install can void your warranty and cause water damage.`,
  (city) => `We respect the DIY spirit among ${city.demo}, but professional installation is strongly recommended. The plumbing and electrical in ${city.homes} throughout ${city.region} can be tricky — especially in older builds.`,
  (city) => `Some ${city.region} residents prefer doing it themselves. However, given the ${city.water} supply characteristics and the typical plumbing in ${city.homes}, a professional install avoids costly mistakes.`,
  (city) => `For ${city.demo} in ${city.region} considering DIY: professional installation protects your manufacturer warranty, ensures proper drainage slope, and guarantees leak-free connections. With ${city.homes}, the margin for error is slim.`,
];

const BRANDS_INTRO_VARIANTS = [
  (city) => `N Appliance Repair installs and services every major brand found in ${city.region} homes. Whether your ${city.homes} came with a builder-grade unit or you are upgrading to premium, we have the expertise.`,
  (city) => `From budget-friendly to high-end, we handle all brands popular with ${city.demo}. In ${city.region}, we see everything from basic models to European imports in ${city.homes}.`,
  (city) => `Our technicians are factory-trained on every major brand sold in ${city.region}. The variety in ${city.homes} means we work with Samsung, LG, Bosch, Whirlpool, KitchenAid, and more every week.`,
  (city) => `Whatever brand you choose for your ${city.region} home, we install it. ${city.demo} tend to favour a mix of Korean, European, and North American brands — and we are certified for all of them.`,
  (city) => `Every brand, every model — that is our promise to ${city.region} homeowners. In ${city.homes}, we regularly install Samsung, LG, Bosch, Whirlpool, Frigidaire, Miele, and more.`,
];

const AFTER_INSTALL_VARIANTS = [
  (city) => `After we finish in your ${city.region} home, here is what to keep in mind. Run an empty hot cycle first to clear any manufacturing residue. With the ${city.water} supply in your area, we recommend using a rinse aid from day one to prevent mineral spots on glassware.`,
  (city) => `Once installation is complete at your ${city.region} property, a few tips for ${city.demo}: run a hot-water test cycle before loading dishes, check under the unit for drips after 24 hours, and consider a water softener if you notice hard-water buildup — common with ${city.water} in this area.`,
  (city) => `Your new dishwasher is installed and tested. For ${city.homes} in ${city.region}, we recommend: run one empty cycle on the hottest setting, inspect the supply line connection after a day, and clean the filter monthly. The ${city.water} in your area can leave mineral deposits if you skip rinse aid.`,
  (city) => `Installation is done — here is your care checklist for ${city.region}: first empty cycle on hot, inspect all connections after 24 hours, and use quality detergent suited to your ${city.water}. For ${city.homes}, also check that cabinet doors clear the unit properly.`,
  (city) => `Now that your ${city.region} dishwasher is running, a few things ${city.demo} should know: the first load may have a slight plastic smell — that is normal. Check for any drips after 24 hours. With ${city.water}, descaling every 3-4 months keeps performance optimal.`,
];

function getServiceType(filename) {
  const base = path.basename(filename, '.html');
  if (base.includes('dishwasher-installation')) return 'dishwasher installation';
  if (base.includes('dishwasher-repair')) return 'dishwasher repair';
  if (base.includes('fridge-repair')) return 'fridge repair';
  if (base.includes('washer-repair')) return 'washer repair';
  if (base.includes('dryer-repair')) return 'dryer repair';
  if (base.includes('oven-repair')) return 'oven repair';
  if (base.includes('stove-repair')) return 'stove repair';
  if (base.includes('gas-')) return 'gas appliance repair';
  if (base.includes('freezer-repair')) return 'freezer repair';
  if (base.includes('microwave-repair')) return 'microwave repair';
  if (base.includes('range-repair')) return 'range repair';
  return 'appliance service';
}

function detectCity(filename) {
  const base = path.basename(filename, '.html');
  // Try exact match first
  if (CITY_DATA[base]) return base;
  // Try suffix match (service-city pattern)
  const sortedKeys = Object.keys(CITY_DATA).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (base.endsWith('-' + key)) return key;
  }
  // Try contains match for neighbourhoods
  for (const key of sortedKeys) {
    if (base.includes(key)) return key;
  }
  return null;
}

function selectVariant(variants, cityKey, filename) {
  const h = hashStr(cityKey + '|' + filename);
  return variants[h % variants.length];
}

function main() {
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  let updated = 0, skipped = 0, noCity = 0, noFaq = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');

    if (html.includes('<!-- PASS5-DONE -->')) { skipped++; continue; }
    if (!html.includes('<main')) { noCity++; continue; }

    const cityKey = detectCity(file);
    if (!cityKey || !CITY_DATA[cityKey]) { noCity++; continue; }

    const city = CITY_DATA[cityKey];
    const service = getServiceType(file);
    let changed = false;

    // 1. Rewrite FAQ answers
    const faqAnswers = html.match(/<div class="faq-answer">\s*<p[^>]*>[\s\S]*?<\/p>\s*<\/div>/g);
    if (faqAnswers && faqAnswers.length >= 4) {
      const faqVariantSets = [FAQ_COST_VARIANTS, FAQ_SAMEDAY_VARIANTS, FAQ_INCLUDES_VARIANTS, FAQ_FIRSTTIME_VARIANTS, FAQ_OWNUNIT_VARIANTS, FAQ_WARRANTY_VARIANTS];

      for (let i = 0; i < Math.min(faqAnswers.length, faqVariantSets.length); i++) {
        const variants = faqVariantSets[i];
        const variantFn = selectVariant(variants, cityKey, file + '-faq-' + i);
        let newText;
        if (i === 0) {
          newText = variantFn(city, '$149\u2013$199');
        } else {
          newText = variantFn(city);
        }
        const newFaq = '<div class="faq-answer">\n            <p>' + newText + '</p>\n          </div>';
        html = html.replace(faqAnswers[i], newFaq);
        changed = true;
      }
    }

    // 2. Rewrite extended-content intro paragraphs
    // Find step-by-step section intro
    const stepIntroRe = /<p[^>]*>(?:When you book|Here is exactly how|Our (?:installation|repair) process)[^<]*(?:<[^>]+>[^<]*)*<\/p>/i;
    const stepMatch = html.match(stepIntroRe);
    if (stepMatch) {
      const variantFn = selectVariant(STEP_INTRO_VARIANTS, cityKey, file + '-step');
      html = html.replace(stepMatch[0], '<p>' + variantFn(city, service) + '</p>');
      changed = true;
    }

    // Find DIY section intro
    const diyIntroRe = /<p[^>]*>(?:While some handy|DIY is tempting|Some .* residents prefer)[^<]*(?:<[^>]+>[^<]*)*<\/p>/i;
    const diyMatch = html.match(diyIntroRe);
    if (diyMatch) {
      const variantFn = selectVariant(DIY_INTRO_VARIANTS, cityKey, file + '-diy');
      html = html.replace(diyMatch[0], '<p>' + variantFn(city) + '</p>');
      changed = true;
    }

    // Find brands section intro
    const brandsIntroRe = /<p[^>]*>(?:N Appliance Repair installs|From budget-friendly|Our technicians are factory)[^<]*(?:<[^>]+>[^<]*)*<\/p>/i;
    const brandsMatch = html.match(brandsIntroRe);
    if (brandsMatch) {
      const variantFn = selectVariant(BRANDS_INTRO_VARIANTS, cityKey, file + '-brands');
      html = html.replace(brandsMatch[0], '<p>' + variantFn(city) + '</p>');
      changed = true;
    }

    // Find after-install section intro
    const afterIntroRe = /<p[^>]*>(?:Once your new|After we finish|Your new (?:dishwasher|washer|dryer|fridge|oven|stove) is installed)[^<]*(?:<[^>]+>[^<]*)*<\/p>/i;
    const afterMatch = html.match(afterIntroRe);
    if (afterMatch) {
      const variantFn = selectVariant(AFTER_INSTALL_VARIANTS, cityKey, file + '-after');
      html = html.replace(afterMatch[0], '<p>' + variantFn(city) + '</p>');
      changed = true;
    }

    if (changed) {
      // Add marker
      html = html.replace('</main>', '<!-- PASS5-DONE -->\n</main>');
      fs.writeFileSync(filePath, html, 'utf8');
      updated++;
      if (updated <= 5) console.log('  + ' + file + ' (' + cityKey + ')');
    } else {
      noFaq++;
    }
  }

  console.log('\n=== Pass 5: FAQ + Extended Content Rewriting ===');
  console.log('Updated: ' + updated);
  console.log('Skipped (already done): ' + skipped);
  console.log('Skipped (no city match): ' + noCity);
  console.log('Skipped (no FAQ/sections found): ' + noFaq);
  console.log('Total HTML files: ' + htmlFiles.length);
}

main();
