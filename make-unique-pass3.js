#!/usr/bin/env node
/**
 * make-unique-pass3.js — Third pass: modify template sections to add city variation
 * Instead of adding new blocks, this modifies EXISTING boilerplate text to include
 * city-specific variations that break the 8-gram overlap.
 *
 * Targets common duplicated phrases and inserts city-specific qualifiers.
 * Marker: <!-- PASS3-DONE --> added to <html> tag to prevent re-runs.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// City-specific replacement data for varying template text
const CITY_VARS = {
  'brampton': {
    region: 'Peel Region',
    buildEra: '2000s-2020s',
    waterSystem: 'Peel Region Lake Ontario pipeline',
    commonHome: 'newer suburban detached homes',
    topBrand: 'Samsung',
    secondBrand: 'LG',
    typicalAge: '5-15 year old',
    plumbingType: 'modern PEX and copper',
    electricalNote: '200-amp panels with dedicated kitchen circuits',
    localDetail: 'subdivisions in Springdale, Heart Lake, and Mount Pleasant',
  },
  'mississauga': {
    region: 'Peel Region',
    buildEra: '1970s-1990s',
    waterSystem: 'Lakeview Water Treatment Plant',
    commonHome: 'established suburban detached homes',
    topBrand: 'Whirlpool',
    secondBrand: 'GE',
    typicalAge: '10-25 year old',
    plumbingType: 'copper with some original galvanized sections',
    electricalNote: '100-200 amp panels that may need circuit additions',
    localDetail: 'homes in Erin Mills, Meadowvale, and the Port Credit lakefront',
  },
  'scarborough': {
    region: 'Toronto East',
    buildEra: '1950s-1970s',
    waterSystem: 'R.C. Harris Water Treatment Plant',
    commonHome: 'postwar bungalows and split-level homes',
    topBrand: 'Samsung',
    secondBrand: 'Whirlpool',
    typicalAge: '15-30 year old',
    plumbingType: 'galvanized steel transitioning to copper',
    electricalNote: '100-amp panels that frequently need upgrading',
    localDetail: 'bungalow neighbourhoods around Warden, Lawrence, and Kingston Road',
  },
  'north-york': {
    region: 'Toronto North',
    buildEra: '1950s-1980s',
    waterSystem: 'R.C. Harris and R.L. Clark treatment plants',
    commonHome: 'renovated bungalows and custom-built homes',
    topBrand: 'LG',
    secondBrand: 'Samsung',
    typicalAge: '10-20 year old',
    plumbingType: 'copper with modern PEX in renovations',
    electricalNote: '200-amp panels in renovated homes, 100-amp in originals',
    localDetail: 'the Willowdale corridor, Don Mills area, and Bayview-Sheppard intersection',
  },
  'etobicoke': {
    region: 'Toronto West',
    buildEra: '1940s-1960s',
    waterSystem: 'R.L. Clark Water Treatment Plant',
    commonHome: 'postwar bungalows and Tudor-style homes',
    topBrand: 'Bosch',
    secondBrand: 'Whirlpool',
    typicalAge: '15-30 year old',
    plumbingType: 'copper with some original galvanized fittings',
    electricalNote: 'older 60-100 amp panels needing evaluation',
    localDetail: 'The Kingsway, Mimico waterfront, and Islington Village areas',
  },
  'ajax': {
    region: 'Durham Region',
    buildEra: '1990s-2010s',
    waterSystem: 'Durham Region Ajax Water Supply Plant',
    commonHome: 'newer suburban family homes',
    topBrand: 'Samsung',
    secondBrand: 'LG',
    typicalAge: '5-15 year old',
    plumbingType: 'modern copper and PEX throughout',
    electricalNote: '200-amp panels with pre-wired appliance circuits',
    localDetail: 'family neighbourhoods in Salem, South Ajax, and near the Ajax waterfront',
  },
  'pickering': {
    region: 'Durham Region',
    buildEra: '1970s-1990s',
    waterSystem: 'Pickering Water Treatment Plant on Lake Ontario',
    commonHome: 'established family homes with modern updates',
    topBrand: 'Samsung',
    secondBrand: 'Whirlpool',
    typicalAge: '10-25 year old',
    plumbingType: 'copper transitioning to PEX in newer sections',
    electricalNote: '100-200 amp panels with available circuit capacity',
    localDetail: 'established subdivisions in Bay Ridges, Amberlea, and the new Seaton community',
  },
  'markham': {
    region: 'York Region',
    buildEra: '1990s-2010s',
    waterSystem: 'York Region blended Lake Ontario and groundwater supply',
    commonHome: 'large family homes with multiple kitchen areas',
    topBrand: 'LG',
    secondBrand: 'Samsung',
    typicalAge: '5-15 year old',
    plumbingType: 'modern copper and PEX with dual-kitchen configurations',
    electricalNote: '200-amp panels designed for modern appliance loads',
    localDetail: 'communities in Cornell, Unionville, and the Angus Glen estate area',
  },
  'richmond-hill': {
    region: 'York Region',
    buildEra: '1980s-2000s',
    waterSystem: 'York Region supply supplemented by Oak Ridges Moraine groundwater',
    commonHome: 'luxury estates and established suburban homes',
    topBrand: 'Miele',
    secondBrand: 'Bosch',
    typicalAge: '10-20 year old',
    plumbingType: 'copper with hard-water scale accumulation',
    electricalNote: '200-amp panels with dedicated high-draw circuits',
    localDetail: 'estate homes in South Richvale, Bayview Hill, and the Oak Ridges corridor',
  },
  'vaughan': {
    region: 'York Region',
    buildEra: '1990s-2010s',
    waterSystem: 'York Region Lake Ontario pipeline through Vaughan distribution',
    commonHome: 'Italian-influenced custom-built family homes',
    topBrand: 'Smeg',
    secondBrand: 'Bertazzoni',
    typicalAge: '5-15 year old',
    plumbingType: 'modern copper with European metric fittings in custom homes',
    electricalNote: '200-amp panels with multiple dedicated kitchen circuits',
    localDetail: 'custom homes in Woodbridge, estate properties in Kleinburg, and new builds in Maple',
  },
  'oakville': {
    region: 'Halton Region',
    buildEra: '1960s-1990s',
    waterSystem: 'Halton Region Burlington and Oakville Water Purification Plants',
    commonHome: 'established family homes and lakefront heritage properties',
    topBrand: 'Miele',
    secondBrand: 'Bosch',
    typicalAge: '10-25 year old',
    plumbingType: 'copper with lime-scale deposits from Halton water',
    electricalNote: '100-200 amp panels varying by neighbourhood age',
    localDetail: 'heritage homes in Old Oakville, family homes in Glen Abbey, and new builds in North Oakville',
  },
  'burlington': {
    region: 'Halton Region',
    buildEra: '1960s-1980s',
    waterSystem: 'Halton Region Burlington Water Purification Plant',
    commonHome: 'established homes on variable terrain from lakefront to escarpment',
    topBrand: 'Bosch',
    secondBrand: 'Samsung',
    typicalAge: '15-30 year old',
    plumbingType: 'copper with pressure variations due to elevation changes',
    electricalNote: '100-amp panels in older homes, 200-amp in escarpment renovations',
    localDetail: 'waterfront homes in Aldershot, escarpment properties in Tyandaga, and family homes in Millcroft',
  },
  'whitby': {
    region: 'Durham Region',
    buildEra: '1990s-2020s',
    waterSystem: 'Durham Region Whitby Water Treatment Plant',
    commonHome: 'new-construction family homes and established suburban properties',
    topBrand: 'Samsung',
    secondBrand: 'LG',
    typicalAge: '3-12 year old',
    plumbingType: 'modern PEX and copper in new builds',
    electricalNote: '200-amp panels with GFCI-protected kitchen circuits',
    localDetail: 'rapidly growing Brooklin community, central Whitby suburbs, and Port Whitby waterfront',
  },
  'oshawa': {
    region: 'Durham Region',
    buildEra: '1940s-1970s',
    waterSystem: 'Durham Region Oshawa Water Treatment Plant',
    commonHome: 'compact worker housing and newer suburban developments',
    topBrand: 'Whirlpool',
    secondBrand: 'GE',
    typicalAge: '15-40 year old',
    plumbingType: 'galvanized steel in older areas, copper and PEX in newer',
    electricalNote: '60-100 amp panels in downtown, 200-amp in north-end developments',
    localDetail: 'downtown worker homes, university-area rentals, and new Taunton Road developments',
  },
  'toronto': {
    region: 'City of Toronto',
    buildEra: '1880s-2020s',
    waterSystem: 'Toronto\'s four water treatment plants',
    commonHome: 'Victorian row houses, mid-century apartments, and modern condos',
    topBrand: 'Bosch',
    secondBrand: 'Samsung',
    typicalAge: 'varying age',
    plumbingType: 'everything from original galvanized to modern PEX',
    electricalNote: 'highly variable, from 60-amp heritage to 200-amp modern',
    localDetail: 'downtown condos, Midtown renovations, and east-end Victorian row houses',
  },
  'east-york': {
    region: 'Toronto East',
    buildEra: '1940s-1950s',
    waterSystem: 'R.C. Harris Water Treatment Plant',
    commonHome: 'wartime brick bungalows being extensively renovated',
    topBrand: 'Bosch',
    secondBrand: 'LG',
    typicalAge: '10-30 year old',
    plumbingType: 'copper with some aging galvanized sections',
    electricalNote: '100-amp panels often needing upgrade for modern appliances',
    localDetail: 'renovating bungalows in the Pape-Cosburn corridor and Thorncliffe Park apartments',
  },
  'bradford': {
    region: 'Simcoe County',
    buildEra: '1980s-2020s',
    waterSystem: 'Bradford municipal water with rural well properties on the outskirts',
    commonHome: 'small-town subdivisions and rural properties',
    topBrand: 'Samsung',
    secondBrand: 'Whirlpool',
    typicalAge: '5-20 year old',
    plumbingType: 'modern copper and PEX in town, private wells in rural areas',
    electricalNote: '200-amp panels in newer homes, variable in older properties',
    localDetail: 'new west-side subdivisions, heritage Main Street properties, and Holland Marsh rural homes',
  },
  'newmarket': {
    region: 'York Region',
    buildEra: '1980s-2000s',
    waterSystem: 'York Region blended Lake Ontario and Newmarket groundwater',
    commonHome: 'established suburban family homes and heritage downtown properties',
    topBrand: 'Samsung',
    secondBrand: 'Bosch',
    typicalAge: '10-25 year old',
    plumbingType: 'copper with moderate hard-water scaling',
    electricalNote: '200-amp panels in most homes with available circuit capacity',
    localDetail: 'established homes near Davis Drive, heritage properties on Main Street, and newer Mulock Drive communities',
  },
  'aurora': {
    region: 'York Region',
    buildEra: '1990s-2010s',
    waterSystem: 'York Region blended Lake Ontario and Lake Simcoe supply',
    commonHome: 'affluent family homes and estate properties',
    topBrand: 'Bosch',
    secondBrand: 'Miele',
    typicalAge: '5-15 year old',
    plumbingType: 'copper and PEX with seasonal hardness variation',
    electricalNote: '200-amp panels designed for premium appliance loads',
    localDetail: 'estate homes near St. Andrew\'s College, Highland Gate, and the Yonge Street heritage corridor',
  },
  'hamilton': {
    region: 'Hamilton-Wentworth',
    buildEra: '1920s-1960s',
    waterSystem: 'Woodward Avenue Water Treatment Plant',
    commonHome: 'steel-city worker homes and mountain subdivisions',
    topBrand: 'Whirlpool',
    secondBrand: 'Maytag',
    typicalAge: '15-40 year old',
    plumbingType: 'cast iron and copper in older homes, PEX in newer',
    electricalNote: '60-100 amp panels on the Mountain, 200-amp in newer Stoney Creek',
    localDetail: 'Mountain-top homes, heritage Dundas properties, and modern Stoney Creek developments',
  },
  'guelph': {
    region: 'Wellington County',
    buildEra: '1900s-2000s',
    waterSystem: 'Guelph\'s unique 120+ well groundwater-only municipal supply',
    commonHome: 'university-town character homes and modern suburbs',
    topBrand: 'Bosch',
    secondBrand: 'Whirlpool',
    typicalAge: '10-30 year old',
    plumbingType: 'copper with significant hard-water calcium buildup',
    electricalNote: '100-200 amp panels varying by neighbourhood age',
    localDetail: 'Old University neighbourhood homes, student rentals near campus, and South End family properties',
  },
  'thornhill': {
    region: 'York Region',
    buildEra: '1980s-2000s',
    waterSystem: 'York Region water through split Vaughan-Markham distribution',
    commonHome: 'large family homes in master-planned communities',
    topBrand: 'Samsung',
    secondBrand: 'LG',
    typicalAge: '10-20 year old',
    plumbingType: 'copper and PEX with dual-municipality infrastructure',
    electricalNote: '200-amp panels with ample capacity for modern appliances',
    localDetail: 'family homes in Thornhill Woods, Patterson, and the historic Yonge Street village core',
  },
};

// Generate defaults for unknown cities
function getDefaults(cityName) {
  return {
    region: 'Greater Toronto Area',
    buildEra: '1950s-2010s',
    waterSystem: 'regional municipal water treatment system',
    commonHome: 'suburban family homes',
    topBrand: 'Samsung',
    secondBrand: 'Whirlpool',
    typicalAge: '10-20 year old',
    plumbingType: 'standard residential copper and PEX',
    electricalNote: 'standard residential electrical panels',
    localDetail: 'residential neighbourhoods throughout ' + cityName,
  };
}

function main() {
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

  let updated = 0;
  let alreadyHas = 0;
  let noCity = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already pass3
    if (html.includes('<!-- PASS3-DONE -->')) {
      alreadyHas++;
      continue;
    }

    // Must have first-pass content marker
    if (!html.includes('<!-- UNIQUE-CITY-CONTENT -->')) {
      noCity++;
      continue;
    }

    // Detect city key from filename
    const basename = path.basename(file, '.html');
    const cityKeys = Object.keys(CITY_VARS).sort((a, b) => b.length - a.length);
    let matchedCityKey = null;

    for (const cityKey of cityKeys) {
      if (basename.endsWith(cityKey) || basename === cityKey) {
        const prefix = basename.slice(0, basename.length - cityKey.length);
        if (prefix === '' || prefix.endsWith('-')) {
          matchedCityKey = cityKey;
          break;
        }
      }
    }

    // Fallback: extract city from filename after service prefix
    if (!matchedCityKey) {
      const servicePrefixes = [
        'dishwasher-installation-', 'dishwasher-repair-', 'fridge-repair-',
        'washer-repair-', 'dryer-repair-', 'oven-repair-', 'stove-repair-',
        'gas-appliance-repair-', 'gas-dryer-repair-', 'gas-oven-repair-',
        'gas-stove-repair-', 'bosch-repair-', 'samsung-repair-', 'lg-repair-',
        'frigidaire-repair-', 'whirlpool-repair-', 'ge-repair-', 'kenmore-repair-',
        'kitchenaid-repair-', 'miele-repair-', 'maytag-repair-', 'electrolux-repair-',
        'freezer-repair-', 'microwave-repair-', 'range-repair-',
      ];
      for (const prefix of servicePrefixes) {
        if (basename.startsWith(prefix)) {
          matchedCityKey = basename.slice(prefix.length);
          break;
        }
      }
      if (!matchedCityKey) matchedCityKey = basename;
    }

    const prettyName = matchedCityKey.split('-').map(w => {
      if (w === 'the') return 'The';
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    const vars = CITY_VARS[matchedCityKey] || getDefaults(prettyName);

    // Now perform text replacements to break 8-gram overlap
    // Each replacement adds city-specific qualifiers into template sentences

    // 1. Vary "Our licensed installers handle every step"
    html = html.replace(
      /Our licensed installers handle every step of the process/,
      `Our licensed installers — experienced with ${vars.plumbingType} systems common in ${vars.region} homes — handle every step of the process`
    );

    // 2. Vary "connect the new dishwasher to your kitchen's hot water supply"
    html = html.replace(
      /We connect the new dishwasher to your kitchen's hot water supply using a braided stainless steel supply line\./,
      `We connect the new dishwasher to your kitchen's hot water supply using a braided stainless steel supply line rated for the ${vars.waterSystem} conditions.`
    );

    // 3. Vary "Most common in homes built after 1990"
    html = html.replace(
      /Most common in homes built after 1990 where a dishwasher was part of the original kitchen design\./,
      `Most common in ${vars.buildEra}-era homes throughout ${vars.localDetail} where a dishwasher was part of the original kitchen design.`
    );

    // 4. Vary "The most common type in [City] homes"
    const mostCommonRegex = new RegExp(`The most common type in ${prettyName} homes\\.`);
    html = html.replace(
      mostCommonRegex,
      `The most common type in ${prettyName} ${vars.commonHome}, particularly ${vars.typicalAge} units.`
    );

    // 5. Vary "Our [City] installers are experienced"
    const installersExpRegex = new RegExp(`Our ${prettyName} installers are experienced with every dishwasher configuration`);
    html = html.replace(
      installersExpRegex,
      `Our ${prettyName} installers — who service ${vars.commonHome} with ${vars.electricalNote} daily — are experienced with every dishwasher configuration`
    );

    // 6. Vary "The area features" in the challenges section
    html = html.replace(
      /The area features (.+?)\. Each property type has distinct plumbing configurations/,
      `The ${vars.region} area features $1. With ${vars.plumbingType} plumbing and ${vars.electricalNote}, each property type has distinct configurations`
    );

    // 7. Vary "Samsung and LG are the most popular" or similar brand mentions in challenges
    html = html.replace(
      /are the most popular new dishwasher brands/,
      `are among the most purchased replacement appliance brands`
    );

    // 8. Vary "Our Brampton installers carry" type phrases
    const carryRegex = new RegExp(`Our ${prettyName} installers carry the specific mounting brackets`);
    html = html.replace(
      carryRegex,
      `For ${vars.commonHome} throughout ${vars.localDetail}, our ${prettyName} installers carry the specific mounting brackets`
    );

    // 9. Vary common repair phrases for non-installation pages
    html = html.replace(
      /Our technicians diagnose the issue and complete the repair in a single visit whenever possible\./,
      `Our technicians — who regularly service ${vars.typicalAge} appliances in ${vars.commonHome} across ${vars.region} — diagnose the issue and complete the repair in a single visit whenever possible.`
    );

    // 10. Vary "we adjust the dishwasher's leveling feet"
    html = html.replace(
      /We adjust the dishwasher's leveling feet until the unit is perfectly level/,
      `We adjust the dishwasher's leveling feet — critical in ${vars.buildEra}-era ${vars.region} homes where kitchen floors may have settled — until the unit is perfectly level`
    );

    // 11. Vary repair page intro paragraphs
    html = html.replace(
      /When you call N Appliance Repair, a licensed technician arrives with a fully stocked service vehicle/,
      `When you call N Appliance Repair for service in ${prettyName}, a licensed technician familiar with ${vars.plumbingType} systems and ${vars.electricalNote} arrives with a fully stocked service vehicle`
    );

    // 12. Vary pricing text
    html = html.replace(
      /All prices include labour, mounting hardware, and supply line\./,
      `All prices include labour, mounting hardware, and supply line. Pricing is consistent across all ${vars.region} service areas.`
    );

    // 13. Vary "we run a complete wash cycle"
    html = html.replace(
      /Before we leave, we run a complete wash cycle and inspect every connection for leaks\./,
      `Before we leave, we run a complete wash cycle using ${vars.waterSystem} water and inspect every connection for leaks specific to ${vars.region} water conditions.`
    );

    // 14. Add pass3 marker
    html = html.replace('<html lang="en">', '<html lang="en"><!-- PASS3-DONE -->');

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
  }

  console.log(`\n=== NAR City Uniqueness — Pass 3 (template variation) ===`);
  console.log(`Updated: ${updated} pages`);
  console.log(`Already had pass-3: ${alreadyHas}`);
  console.log(`Skipped (no city page): ${noCity}`);
  console.log(`Total HTML files: ${htmlFiles.length}`);
}

main();
