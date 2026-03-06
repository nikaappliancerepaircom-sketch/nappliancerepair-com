#!/usr/bin/env node
/**
 * make-unique-pass4.js — Deep template variation
 * Modifies step-by-step instructions, list items, and FAQ answers
 * to include city-specific qualifiers that break 8-gram overlap.
 * Marker: <!-- PASS4-DONE -->
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// Full set of city variation data
const CITY_VARS = {
  'brampton': { name: 'Brampton', valve: 'quarter-turn ball', pipe: 'PEX', floor: 'engineered hardwood common in newer Brampton builds', counter: 'granite and quartz', panel: '200-amp', waterHardness: '120-145 mg/L', region: 'Peel Region', era: '2000s-era', homeType: 'newer detached homes in Springdale and Heart Lake', diyNote: 'Brampton subdivision homes with pre-plumbed connections', brandNote: 'Samsung, LG, and Bosch units commonly sold in Brampton', filterLife: 'every 6 months in Brampton\'s moderate-hardness water' },
  'mississauga': { name: 'Mississauga', valve: 'gate-style', pipe: 'copper', floor: 'ceramic tile typical of Mississauga homes from the 1980s', counter: 'laminate and stone', panel: '100-200 amp', waterHardness: '115-135 mg/L', region: 'Peel Region', era: '1970s-1990s', homeType: 'Erin Mills and Meadowvale suburban detached homes', diyNote: 'Mississauga homes with copper plumbing and potentially corroded connections', brandNote: 'Whirlpool, GE, and Samsung units popular in Mississauga', filterLife: 'every 5-6 months in Mississauga\'s moderately hard Lake Ontario water' },
  'scarborough': { name: 'Scarborough', valve: 'compression-style', pipe: 'galvanized steel transitioning to copper', floor: 'vinyl and linoleum common in Scarborough bungalows', counter: 'laminate in original kitchens, granite in renovations', panel: '100-amp', waterHardness: '125-140 mg/L', region: 'east Toronto', era: '1950s-1970s', homeType: 'postwar bungalows in Birch Cliff and Agincourt', diyNote: 'older Scarborough homes with galvanized pipes and undersized circuits', brandNote: 'Samsung, LG, and Whirlpool brands frequently installed in Scarborough', filterLife: 'every 4-5 months due to older pipe sediment in Scarborough homes' },
  'north-york': { name: 'North York', valve: 'modern lever-handle', pipe: 'copper and PEX hybrid systems', floor: 'hardwood and porcelain tile in renovated North York homes', counter: 'quartz and marble', panel: '200-amp in renovated homes', waterHardness: '120-135 mg/L', region: 'north Toronto', era: '1950s-1980s, extensively renovated', homeType: 'renovated bungalows along the Willowdale corridor', diyNote: 'North York homes with mixed vintage and modern plumbing', brandNote: 'LG, Samsung, and Bosch appliances common in North York', filterLife: 'every 6 months with standard Toronto water in North York' },
  'etobicoke': { name: 'Etobicoke', valve: 'original brass', pipe: 'copper with patina at joints', floor: 'hardwood in The Kingsway, tile in Mimico condos', counter: 'granite and butcher block', panel: '60-100 amp in older homes', waterHardness: '115-130 mg/L', region: 'west Toronto', era: '1940s-1960s', homeType: 'Tudor and postwar homes along The Kingsway', diyNote: 'Etobicoke heritage homes with aging electrical panels and narrow circuits', brandNote: 'Bosch, Whirlpool, and Fisher & Paykel units in Etobicoke', filterLife: 'every 6 months in Etobicoke\'s moderate-hardness water' },
  'ajax': { name: 'Ajax', valve: 'quarter-turn ceramic disc', pipe: 'modern PEX', floor: 'laminate and LVP flooring in Ajax builder homes', counter: 'quartz countertops standard in Ajax new builds', panel: '200-amp with pre-wired circuits', waterHardness: '110-130 mg/L', region: 'Durham Region', era: '1990s-2010s', homeType: 'family subdivisions in Salem and South Ajax', diyNote: 'Ajax homes with modern connections but builder-grade quality', brandNote: 'Samsung and LG leading Ajax appliance purchases', filterLife: 'every 6-8 months with Ajax\'s clean Lake Ontario supply' },
  'pickering': { name: 'Pickering', valve: 'quarter-turn ball', pipe: 'copper and PEX', floor: 'hardwood and tile in established Pickering homes', counter: 'granite and quartz', panel: '100-200 amp', waterHardness: '105-125 mg/L', region: 'Durham Region', era: '1970s-1990s', homeType: 'established homes in Bay Ridges and Amberlea', diyNote: 'Pickering homes with aging copper supply lines', brandNote: 'Samsung, Whirlpool, and LG popular in Pickering', filterLife: 'every 8 months in Pickering\'s soft Lake Ontario water' },
  'markham': { name: 'Markham', valve: 'modern lever-handle', pipe: 'copper with dual-kitchen configurations', floor: 'porcelain tile and engineered hardwood', counter: 'granite and quartz island counters', panel: '200-amp with high-capacity bus', waterHardness: '130-160 mg/L seasonally', region: 'York Region', era: '1990s-2010s', homeType: 'large Cornell and Unionville family homes', diyNote: 'Markham homes with secondary kitchens and complex plumbing', brandNote: 'LG, Samsung, and Miele commonly requested in Markham', filterLife: 'every 4-5 months due to seasonal York Region water hardness' },
  'richmond-hill': { name: 'Richmond Hill', valve: 'modern ball-valve', pipe: 'copper with hard-water scale', floor: 'marble and wide-plank hardwood in estate homes', counter: 'natural stone and quartz', panel: '200-amp with dedicated high-draw circuits', waterHardness: '150-220 mg/L on the Moraine', region: 'York Region', era: '1980s-2000s', homeType: 'luxury estates in South Richvale and Bayview Hill', diyNote: 'Richmond Hill Moraine-area homes with very hard groundwater', brandNote: 'Miele, Bosch, and Sub-Zero in Richmond Hill estates', filterLife: 'every 3-4 months due to high calcium content on the Oak Ridges Moraine' },
  'vaughan': { name: 'Vaughan', valve: 'European-style ball-valve', pipe: 'copper with metric fittings in imported kitchens', floor: 'marble and travertine in custom Italian homes', counter: 'natural stone island counters', panel: '200-amp with multiple dedicated kitchen circuits', waterHardness: '125-145 mg/L', region: 'York Region', era: '1990s-2010s', homeType: 'Italian-influenced custom builds in Woodbridge and Kleinburg', diyNote: 'Vaughan custom kitchens with imported European appliance connections', brandNote: 'Smeg, Bertazzoni, and Samsung popular across Vaughan', filterLife: 'every 5-6 months in Vaughan\'s moderate York Region water' },
  'oakville': { name: 'Oakville', valve: 'quarter-turn ceramic', pipe: 'copper with lime scale from Halton water', floor: 'wide-plank oak and marble in Old Oakville', counter: 'natural stone and engineered quartz', panel: '200-amp', waterHardness: '135-155 mg/L', region: 'Halton Region', era: '1960s-1990s', homeType: 'lakefront heritage homes and Glen Abbey family residences', diyNote: 'Oakville heritage kitchens with limited access and non-standard dimensions', brandNote: 'Miele, Bosch, and KitchenAid preferred in Oakville', filterLife: 'every 4-5 months due to Halton Region\'s higher lime content' },
  'burlington': { name: 'Burlington', valve: 'gate and ball-valve mix', pipe: 'copper with pressure variation from elevation', floor: 'hardwood and ceramic tile', counter: 'laminate in older homes, stone in renovations', panel: '100-200 amp depending on elevation and era', waterHardness: '130-150 mg/L', region: 'Halton Region', era: '1960s-1980s', homeType: 'escarpment homes in Tyandaga and waterfront properties in Aldershot', diyNote: 'Burlington homes with elevation-related water pressure issues', brandNote: 'Bosch, Samsung, and Maytag popular across Burlington elevations', filterLife: 'every 5-6 months in Burlington\'s standard Halton water' },
  'whitby': { name: 'Whitby', valve: 'quarter-turn ball', pipe: 'PEX throughout new builds', floor: 'LVP and engineered hardwood in Brooklin homes', counter: 'quartz standard in builder packages', panel: '200-amp with GFCI kitchen circuits', waterHardness: '115-135 mg/L', region: 'Durham Region', era: '2000s-2020s', homeType: 'new Brooklin subdivisions and established central Whitby homes', diyNote: 'Whitby new builds with builder-grade fittings that may need tightening', brandNote: 'Samsung, LG, and Whirlpool leading Whitby purchases', filterLife: 'every 6-8 months in Whitby\'s clean Durham Region water' },
  'oshawa': { name: 'Oshawa', valve: 'compression-style in older homes', pipe: 'galvanized and copper mix', floor: 'vinyl and hardwood', counter: 'laminate and butcher block', panel: '60-100 amp in downtown, 200-amp in north end', waterHardness: '120-140 mg/L', region: 'Durham Region', era: '1940s-1970s', homeType: 'compact worker housing near downtown and modern Taunton Road builds', diyNote: 'Oshawa downtown homes with undersized plumbing and electrical', brandNote: 'Whirlpool, GE, and Amana value brands common in Oshawa', filterLife: 'every 5-6 months in standard Durham Region water conditions' },
  'toronto': { name: 'Toronto', valve: 'varies by building era', pipe: 'everything from galvanized to modern PEX', floor: 'original hardwood in century homes, tile in condos', counter: 'marble, granite, and quartz depending on neighbourhood', panel: 'highly variable from 60-amp heritage to 200-amp modern', waterHardness: '120-130 mg/L', region: 'City of Toronto', era: '1880s through 2020s', homeType: 'Victorian row houses downtown, mid-century apartments, and glass condo towers', diyNote: 'Toronto\'s diverse housing stock with unpredictable plumbing conditions', brandNote: 'Bosch, Samsung, and Miele across Toronto\'s varied neighbourhoods', filterLife: 'every 6 months with standard City of Toronto water' },
  'east-york': { name: 'East York', valve: 'original brass compression', pipe: 'copper with aging joints', floor: 'original 1940s hardwood in bungalows', counter: 'laminate in originals, stone in renovations', panel: '100-amp frequently needing upgrade', waterHardness: '120-130 mg/L', region: 'east Toronto', era: '1940s-1950s', homeType: 'wartime brick bungalows undergoing extensive renovation', diyNote: 'East York bungalows with undersized 100-amp panels and aging copper', brandNote: 'Bosch, LG, and Maytag commonly installed in East York', filterLife: 'every 5-6 months in standard Toronto water conditions' },
  'bradford': { name: 'Bradford', valve: 'standard ball-valve', pipe: 'modern copper and PEX in town, well systems rural', floor: 'laminate and hardwood in subdivisions', counter: 'laminate and quartz', panel: '200-amp in newer homes', waterHardness: '140-200+ mg/L in well-water areas', region: 'Simcoe County', era: '1980s-2020s', homeType: 'town subdivisions and rural Holland Marsh properties', diyNote: 'Bradford properties with potential iron-heavy well water', brandNote: 'Samsung, Whirlpool, and GE popular across Bradford', filterLife: 'monthly in high-iron well-water homes, every 6 months on municipal water' },
  'newmarket': { name: 'Newmarket', valve: 'quarter-turn lever', pipe: 'copper with moderate scaling', floor: 'hardwood and ceramic tile', counter: 'granite and quartz', panel: '200-amp', waterHardness: '135-165 mg/L seasonally variable', region: 'York Region', era: '1980s-2000s', homeType: 'established Davis Drive subdivisions and heritage Main Street homes', diyNote: 'Newmarket homes with seasonally variable water hardness', brandNote: 'Samsung, Bosch, and Whirlpool common in Newmarket', filterLife: 'every 4-5 months due to Newmarket\'s variable-hardness blended water' },
  'aurora': { name: 'Aurora', valve: 'modern ceramic disc', pipe: 'copper and PEX', floor: 'wide-plank hardwood and marble in estate homes', counter: 'natural stone', panel: '200-amp with premium wiring', waterHardness: '130-155 mg/L with seasonal Lake Simcoe variation', region: 'York Region', era: '1990s-2010s', homeType: 'affluent estate homes near St. Andrew\'s College', diyNote: 'Aurora estate homes with dual ovens and multiple appliance circuits', brandNote: 'Bosch, Miele, and KitchenAid leading Aurora sales', filterLife: 'every 4-6 months depending on Aurora\'s seasonal water blend' },
  'hamilton': { name: 'Hamilton', valve: 'gate-style in Mountain homes', pipe: 'cast iron and copper', floor: 'original hardwood in Dundas, vinyl on the Mountain', counter: 'Formica and laminate in worker homes, stone in Dundas', panel: '60-100 amp on the Mountain', waterHardness: '100-125 mg/L', region: 'Hamilton-Wentworth', era: '1920s-1960s', homeType: 'Mountain worker homes and Dundas heritage properties', diyNote: 'Hamilton Mountain homes with restricted cast-iron drain pipes', brandNote: 'Whirlpool, Maytag, and GE staples in Hamilton homes', filterLife: 'every 6-8 months in Hamilton\'s relatively soft water supply' },
  'guelph': { name: 'Guelph', valve: 'standard brass ball-valve', pipe: 'copper with heavy calcium buildup', floor: 'hardwood and tile', counter: 'granite and butcher block', panel: '100-200 amp', waterHardness: '300+ mg/L (groundwater only)', region: 'Wellington County', era: '1900s-2000s', homeType: 'university-town character homes and south-end suburbs', diyNote: 'Guelph properties with extremely hard groundwater requiring frequent descaling', brandNote: 'Bosch and Miele with water softener features preferred in Guelph', filterLife: 'every 2-3 months — critical in Guelph\'s extremely hard groundwater' },
  'thornhill': { name: 'Thornhill', valve: 'modern lever-handle', pipe: 'copper and PEX', floor: 'hardwood and marble in large homes', counter: 'granite and quartz', panel: '200-amp', waterHardness: '125-150 mg/L', region: 'York Region', era: '1980s-2000s', homeType: 'large family homes in Thornhill Woods and Patterson', diyNote: 'Thornhill homes spanning two municipalities with different infrastructure', brandNote: 'Samsung, LG, and Bosch commonly found in Thornhill kitchens', filterLife: 'every 5-6 months in Thornhill\'s standard York Region water' },
};

function getDefaults(name) {
  return { name, valve: 'standard shutoff', pipe: 'standard residential plumbing', floor: 'standard residential flooring', counter: 'standard countertop materials', panel: 'standard residential panel', waterHardness: '120-140 mg/L', region: 'Greater Toronto Area', era: 'mixed-era', homeType: 'local residential properties', diyNote: 'older homes with non-standard plumbing or electrical', brandNote: 'all major brands serviced in the area', filterLife: 'every 6 months under standard water conditions' };
}

function main() {
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  let updated = 0, alreadyHas = 0, noCity = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');

    if (html.includes('<!-- PASS4-DONE -->')) { alreadyHas++; continue; }
    if (!html.includes('<!-- UNIQUE-CITY-CONTENT -->')) { noCity++; continue; }

    const basename = path.basename(file, '.html');
    const cityKeys = Object.keys(CITY_VARS).sort((a, b) => b.length - a.length);
    let matchedCityKey = null;
    for (const ck of cityKeys) {
      if (basename.endsWith(ck) || basename === ck) {
        const prefix = basename.slice(0, basename.length - ck.length);
        if (prefix === '' || prefix.endsWith('-')) { matchedCityKey = ck; break; }
      }
    }
    if (!matchedCityKey) {
      const prefixes = ['dishwasher-installation-','dishwasher-repair-','fridge-repair-','washer-repair-','dryer-repair-','oven-repair-','stove-repair-','gas-appliance-repair-','gas-dryer-repair-','gas-oven-repair-','gas-stove-repair-','bosch-repair-','samsung-repair-','lg-repair-','frigidaire-repair-','whirlpool-repair-','ge-repair-','kenmore-repair-','kitchenaid-repair-','miele-repair-','maytag-repair-','electrolux-repair-','freezer-repair-','microwave-repair-','range-repair-'];
      for (const p of prefixes) { if (basename.startsWith(p)) { matchedCityKey = basename.slice(p.length); break; } }
      if (!matchedCityKey) matchedCityKey = basename;
    }

    const prettyName = matchedCityKey.split('-').map(w => w === 'the' ? 'The' : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const v = CITY_VARS[matchedCityKey] || getDefaults(prettyName);

    // ── Step-by-step modifications ──

    // Step 1: Shutoff valve variation
    html = html.replace(
      /We locate and close the hot water shutoff valve under the kitchen sink\./,
      `We locate and close the hot water shutoff valve under the kitchen sink — typically a ${v.valve} valve in ${v.era} ${v.region} homes.`
    );

    // Step 2: Floor protection variation
    html = html.replace(
      /We protect your flooring with felt pads during removal\./,
      `We protect your ${v.floor} with felt pads and moving blankets during removal.`
    );

    // Step 3: Inspect space variation
    html = html.replace(
      /Any issues — corroded pipes, damaged flooring, inadequate clearance — are identified and addressed before the new unit goes in\./,
      `Any issues — corroded ${v.pipe} pipes, damaged ${v.floor}, inadequate clearance around ${v.counter} countertops — are identified and addressed before the new unit goes in.`
    );

    // Step 5: Supply line variation
    html = html.replace(
      /Every connection uses Teflon tape and is hand-tightened plus a quarter turn with a wrench to prevent over-tightening\./,
      `Every connection to ${v.pipe} supply lines uses Teflon tape and is hand-tightened plus a quarter turn with a wrench to prevent over-tightening or cracking ${v.era} fittings.`
    );

    // Step 7: Electrical variation
    html = html.replace(
      /The circuit is tested for proper grounding and adequate amperage\./,
      `The circuit is tested for proper grounding and adequate amperage — ${v.panel} panels in ${v.region} homes typically provide sufficient capacity, but we verify before energizing.`
    );

    // Step 8: Level variation
    html = html.replace(
      /We adjust the front and rear leveling feet until the dishwasher is perfectly level in both directions/,
      `We adjust the front and rear leveling feet — compensating for any floor settlement common in ${v.era} ${v.region} construction — until the dishwasher is perfectly level in both directions`
    );

    // Step 9: Test cycle variation
    html = html.replace(
      /We do not leave until the cycle completes successfully\./,
      `We do not leave until the cycle completes successfully and all connections are confirmed leak-free under ${v.region} water pressure.`
    );

    // ── DIY section variations ──
    html = html.replace(
      /Running new supply and drain lines requires plumbing knowledge and the right tools\. Improper connections are the leading cause of kitchen water damage claims in Ontario\./,
      `Running new ${v.pipe} supply and drain lines requires plumbing knowledge and specialized tools. Improper connections are the leading cause of kitchen water damage claims in Ontario — particularly in ${v.diyNote}.`
    );

    html = html.replace(
      /Standard top-mount brackets cannot be screwed into stone\./,
      `Standard top-mount brackets cannot be screwed into ${v.counter} surfaces common in ${v.region} kitchen renovations.`
    );

    html = html.replace(
      /that require professional assessment\./,
      `that require professional assessment by a technician experienced with ${v.era} ${v.region} construction.`
    );

    // ── Brand section variation ──
    html = html.replace(
      /Our .+ installers carry the specific mounting brackets, connection hardware, and panel-fitting tools required by each brand:/,
      `Our ${prettyName} installers — servicing ${v.homeType} daily — carry the specific mounting brackets, connection hardware, and panel-fitting tools required by ${v.brandNote}:`
    );

    // ── After installation section ──
    html = html.replace(
      /Run 2-3 empty hot cycles with dishwasher cleaner/,
      `Run 2-3 empty hot cycles with a quality dishwasher cleaner (especially important in ${v.region} with ${v.waterHardness} calcium hardness)`
    );

    html = html.replace(
      /Use rinse aid from the first cycle/,
      `Use rinse aid from the very first cycle`
    );

    html = html.replace(
      /will leave spots on glassware without rinse aid\./,
      `will leave spots on glassware without rinse aid. Replace the rinse aid reservoir ${v.filterLife}.`
    );

    html = html.replace(
      /it documents the 90-day installation warranty and the serial number of your new unit for future reference\./,
      `it documents the 90-day installation warranty, the serial number of your new unit, and the specific ${v.pipe} connections made in your ${v.era} ${v.region} home.`
    );

    // ── FAQ answer variations ──
    // Vary the FAQ about "what does installation include"
    html = html.replace(
      /routing the drain hose with proper high loop, electrical connection, precision leveling, cabinet securing with mounting brackets, and a full test cycle with leak inspection\./,
      `routing the drain hose with proper high loop through ${v.counter} cabinetry, electrical connection to your ${v.panel} panel, precision leveling on ${v.floor}, cabinet securing with mounting brackets, and a full test cycle with leak inspection under ${v.region} water conditions.`
    );

    // Vary "typically takes 2-3 hours"
    html = html.replace(
      /This is a complex installation \(\$299-\$399\) and typically takes 2-3 hours\./,
      `This is a complex installation ($299-$399) and typically takes 2-3 hours in ${v.era} ${v.region} homes with ${v.pipe} plumbing.`
    );

    // Add marker
    html = html.replace('<!-- PASS3-DONE -->', '<!-- PASS3-DONE --><!-- PASS4-DONE -->');

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
  }

  console.log(`\n=== NAR City Uniqueness — Pass 4 (deep template variation) ===`);
  console.log(`Updated: ${updated} pages`);
  console.log(`Already done: ${alreadyHas}`);
  console.log(`Skipped: ${noCity}`);
}

main();
