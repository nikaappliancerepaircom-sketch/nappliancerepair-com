#!/usr/bin/env node
/**
 * expand-content.js — Inserts ~1,500 words of unique extended content
 * into nappliancerepair.com service pages, before the FAQ section.
 */
const fs = require('fs');
const path = require('path');

const FILES = [
  'dishwasher-repair-toronto.html',
  'dishwasher-repair-mississauga.html',
  'dryer-repair-toronto.html',
  'dryer-repair-mississauga.html',
  'dryer-repair-brampton.html',
  'dryer-repair-markham.html',
  'fridge-repair-mississauga.html',
  'fridge-repair-north-york.html',
  'fridge-repair-scarborough.html',
  'fridge-repair-vaughan.html',
  'oven-repair-toronto.html',
  'oven-repair-mississauga.html',
  'stove-repair-toronto.html',
  'stove-repair-scarborough.html',
  'washer-repair-brampton.html',
  'washer-repair-etobicoke.html',
  'washer-repair-markham.html',
  'washer-repair-north-york.html',
  'washer-repair-scarborough.html',
  'washer-repair-vaughan.html',
  'dishwasher-repair.html',
  'washer-repair.html',
  'dryer-repair.html',
  'fridge-repair.html',
  'oven-repair.html',
  'stove-repair.html',
  'bosch-dishwasher-repair.html',
  'bosch-fridge-repair.html',
  'bosch-washer-repair.html',
  'lg-dishwasher-repair.html',
  'lg-dryer-repair.html',
  'lg-fridge-repair.html',
  'lg-oven-repair.html',
  'lg-washer-repair.html',
  'samsung-dishwasher-repair.html',
  'samsung-dryer-repair.html',
  'samsung-fridge-repair.html',
  'samsung-washer-repair.html',
  'whirlpool-dishwasher-repair.html',
  'whirlpool-dryer-repair.html',
  'whirlpool-fridge-repair.html',
  'whirlpool-washer-repair.html',
  'frigidaire-dryer-repair.html',
  'frigidaire-fridge-repair.html',
  'frigidaire-washer-repair.html',
  'ge-dishwasher-repair.html',
  'ge-fridge-repair.html',
  'ge-oven-repair.html',
  'ge-washer-repair.html',
  'kenmore-dryer-repair.html',
  'kenmore-fridge-repair.html',
  'kenmore-washer-repair.html',
  'kitchenaid-dishwasher-repair.html',
  'kitchenaid-fridge-repair.html',
  'maytag-dryer-repair.html',
  'maytag-washer-repair.html',
  'bosch-repair-toronto.html',
];

const DIR = __dirname;

// Parse filename to extract appliance, city, brand
function parseFilename(fn) {
  const name = fn.replace('.html', '');
  const brands = ['bosch','lg','samsung','whirlpool','frigidaire','ge','kenmore','kitchenaid','maytag'];
  const cities = ['toronto','mississauga','brampton','markham','north-york','scarborough','vaughan','etobicoke'];
  const appliances = ['dishwasher','washer','dryer','fridge','oven','stove'];

  let brand = null, city = null, appliance = null;

  for (const b of brands) {
    if (name.startsWith(b + '-')) { brand = b; break; }
  }

  for (const c of cities) {
    if (name.endsWith('-' + c)) { city = c; break; }
  }

  // Special case: bosch-repair-toronto — no specific appliance
  if (brand && name === brand + '-repair-toronto') {
    return { brand: capitalize(brand), city: 'Toronto', appliance: 'appliance', appliancePlural: 'appliances', isGenericBrand: true };
  }

  for (const a of appliances) {
    if (name.includes(a + '-repair') || name.includes('-' + a + '-')) { appliance = a; break; }
    if (name.startsWith(a + '-')) { appliance = a; break; }
  }

  // Map appliance names
  const appMap = {
    'fridge': 'refrigerator',
    'washer': 'washing machine',
    'dryer': 'dryer',
    'dishwasher': 'dishwasher',
    'oven': 'oven',
    'stove': 'stove',
  };
  const appPluralMap = {
    'fridge': 'refrigerators',
    'washer': 'washing machines',
    'dryer': 'dryers',
    'dishwasher': 'dishwashers',
    'oven': 'ovens',
    'stove': 'stoves',
  };

  const appDisplay = appMap[appliance] || appliance;
  const appPlural = appPluralMap[appliance] || (appliance + 's');
  const cityDisplay = city ? city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Toronto & GTA';
  const brandDisplay = brand ? capitalize(brand) : null;

  return {
    brand: brandDisplay,
    city: cityDisplay,
    appliance: appDisplay,
    appliancePlural: appPlural,
    rawAppliance: appliance,
    isGenericBrand: false,
  };
}

function capitalize(s) {
  if (s === 'lg') return 'LG';
  if (s === 'ge') return 'GE';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- CONTENT DATA ---

const DIAGNOSE = {
  dishwasher: {
    visual: 'We examine the door seal, spray arms, and interior tub for cracks, mineral buildup, or food debris blocking rotation. Visible rust on the rack tines or door hinge corrosion often signals problems before error codes appear.',
    error: 'Modern dishwashers display alphanumeric fault codes on the control panel. We cross-reference codes against manufacturer databases — Samsung 5E drainage faults, Bosch E24 errors, LG AE leakage alerts — to pinpoint the failing subsystem within minutes.',
    component: 'Using a multimeter, we test the wash motor, drain pump, water inlet valve, heating element, and float switch. Capacitor testing on the main motor reveals intermittent failures that visual inspection alone cannot catch.',
    parts: 'After diagnosing the root cause, we check parts availability and compare the repair cost against the unit\'s remaining service life. If a repair exceeds 50 percent of replacement value, we recommend upgrading and help you choose a reliable model.',
  },
  washer: {
    visual: 'We inspect the door boot seal for tears or mould, check the drum spider for cracks, and look for water stains beneath the unit that indicate slow leaks. Rust streaks on clothing often point to a deteriorating drum bearing.',
    error: 'Front-load washers display codes like Samsung UE (unbalanced load), LG OE (drain error), and Whirlpool F21 (long drain). We decode these using manufacturer service manuals, saving diagnostic time and getting to the fix faster.',
    component: 'We test the drain pump, pressure switch, door latch assembly, motor control board, and shock absorbers. Bearing noise tests under load reveal early failures that prevent costly drum replacements if caught early enough.',
    parts: 'We carry common washer parts — drain pumps, door boot seals, inlet valves, and belt kits — on our service van. If a specialty part is needed, we source it from authorized distributors with delivery within one to three business days.',
  },
  dryer: {
    visual: 'We inspect the lint trap housing, exhaust vent connection, and drum felt seals for wear. Scorch marks near the heating element housing or discoloured lint are safety red flags we address immediately before proceeding.',
    error: 'Modern dryers use sensor-driven fault codes — Samsung HE (heating error), LG D80-D95 (vent restriction levels), Whirlpool F01 (control board fault). We interpret these codes on-site and verify them with component-level testing.',
    component: 'We test the thermal fuse, cycling thermostat, heating element continuity, gas igniter (gas models), idler pulley tension, and drum rollers. A dryer that tumbles but won\'t heat often comes down to a $15 thermal fuse rather than an expensive element.',
    parts: 'Common dryer parts — thermal fuses, heating elements, belt kits, drum rollers — travel with us on every call. This lets us complete most dryer repairs in a single visit without scheduling a return trip for parts.',
  },
  fridge: {
    visual: 'We check the condenser coils for dust accumulation, inspect door gaskets for air leaks using the dollar-bill test, and look for frost patterns inside the freezer that indicate defrost system failures or airflow obstructions.',
    error: 'Refrigerators display codes like Samsung 22E (fan error), LG ER FF (freezer fan fault), and GE FF (evaporator fan). We decode these and cross-reference with temperature sensor readings to confirm the failing component.',
    component: 'We test the compressor relay, start capacitor, defrost heater, evaporator and condenser fan motors, thermistor sensors, and the main control board. Compressor amp-draw tests reveal efficiency loss before a total failure.',
    parts: 'Refrigerator repairs are time-sensitive — food spoilage costs money. We stock common parts like defrost heaters, fan motors, thermistors, and start relays on our van for same-visit completion on most refrigerator calls.',
  },
  oven: {
    visual: 'We inspect the bake and broil elements for visible breaks, hot spots, or blistering. The door gasket is checked for gaps that let heat escape, and we look at the igniter glow bar colour on gas models — orange means it is weakening.',
    error: 'Ovens display codes like F1 (temperature sensor), F3 (open sensor circuit), and F9 (door lock fault). We test the actual sensor resistance with a multimeter to confirm whether the sensor or the control board is the true culprit.',
    component: 'We test the bake element, broil element, temperature sensor, oven igniter (gas), safety valve, convection fan motor, and control board relays. A weak igniter that takes more than 90 seconds to glow is the number-one gas oven failure.',
    parts: 'Oven heating elements, igniters, and temperature sensors are among the most commonly replaced parts. We carry standard elements for popular brands and can source exact replacements for specialty or commercial-grade ovens within two days.',
  },
  stove: {
    visual: 'We inspect each burner element or gas port for uneven heating, check the control knob switches for arcing damage, and examine the cooktop surface for cracks that could pose electrical or gas hazards during use.',
    error: 'Induction and electric stoves display fault codes — Samsung SE (touch panel short), LG F1 (surface sensor fault). Gas stoves lack codes but show symptoms: clicking igniter, yellow flame, or delayed ignition that we diagnose by component testing.',
    component: 'We test infinite switches (electric), surface element receptacles, spark modules (gas), and the main glass-top surface sensors. Induction stoves require specialized testing of the inverter board and coil resistance values.',
    parts: 'Surface elements, infinite switches, spark igniters, and control knobs are stocked on our van for same-day completion. Glass cooktop replacements and induction coils may require a one-to-two day parts order from the manufacturer.',
  },
  appliance: {
    visual: 'We perform a thorough visual inspection of the entire unit — checking seals, connections, exterior condition, and any obvious signs of wear, corrosion, or damage that could indicate the source of the problem.',
    error: 'Every modern appliance communicates through fault codes. We carry manufacturer service manuals and diagnostic tools that decode error messages from all major brands, pinpointing the exact subsystem that needs attention.',
    component: 'Using professional-grade multimeters and diagnostic equipment, we test electrical components, motors, heating elements, sensors, and control boards to identify the precise point of failure with certainty.',
    parts: 'Our service van carries a comprehensive inventory of common parts for all major appliance brands. When specialty parts are needed, we source them from authorized distributors with typical delivery in one to three business days.',
  },
};

const CITY_INTROS = {
  'Toronto': 'Toronto homes range from Victorian-era houses in the Annex and Leslieville to sleek glass condos along the waterfront and in Liberty Village. Each building type presents unique appliance challenges — from navigating narrow Victorian-era kitchens to working with condo management protocols in high-rise towers along the Gardiner corridor.',
  'Mississauga': 'Mississauga\'s suburban landscape features spacious homes built between 2000 and 2020, many with full-size appliance suites that handle the demands of large multicultural families. Developments in Erin Mills, Meadowvale, and Churchill Meadows typically come equipped with matching Whirlpool, LG, or Samsung sets.',
  'Brampton': 'Brampton is one of Canada\'s fastest-growing cities, with large single-family homes that often house multi-generational families. Heavy daily appliance use in neighbourhoods like Springdale, Heart Lake, and Castlemore means washers, dryers, and dishwashers see significantly more cycles than average.',
  'North York': 'North York blends high-rise condo living along the Yonge-Sheppard corridor with established residential streets in Willowdale and Bayview Village. The area\'s large Korean-Canadian community means LG and Samsung appliances are especially common here.',
  'Scarborough': 'Scarborough\'s housing stock spans the 1960s through 1990s, with many homes in Agincourt, Malvern, and West Hill still running original or second-generation appliances. Diverse Caribbean, South Asian, and East Asian communities rely on brands like Maytag, GE, and Whirlpool that have served faithfully for decades.',
  'Vaughan': 'Vaughan features upscale newer builds in Kleinburg, Woodbridge, and Maple, often with luxury appliance suites. The area\'s Italian-Canadian community appreciates quality brands like Bosch, KitchenAid, and Miele, and expects the same quality in repair service.',
  'Etobicoke': 'Etobicoke offers a unique mix of 1950s bungalows in established areas like Long Branch and New Toronto alongside modern condo towers near the Humber Bay waterfront. Lake Ontario proximity means higher humidity levels that accelerate seal deterioration and corrosion.',
  'Markham': 'Markham is a tech-industry hub home to IBM, AMD, and numerous tech companies, with diverse Asian communities in neighbourhoods like Unionville and Cornell. Homes built between the 1990s and 2010s typically feature Samsung and LG appliances that integrate with smart home systems.',
  'Toronto & GTA': 'Across the Greater Toronto Area, every neighbourhood presents its own appliance challenges — from downtown condo towers to suburban family homes. Our technicians serve the entire GTA with the same commitment to fast, reliable repair service.',
};

const CITY_WHY = {
  'Toronto': 'Living in Toronto means your schedule is packed. Between commuting on the TTC, managing work deadlines, and keeping up with city life, a broken appliance is the last thing you need slowing you down. That is why Toronto homeowners and renters choose N Appliance Repair — we offer same-day dispatch across all Toronto neighbourhoods so you are never waiting days for a fix.',
  'Mississauga': 'Mississauga families depend on their appliances to keep large households running smoothly. With busy schedules that include school drop-offs, commuting to Toronto or the airport corridor, and weekend errands, you need a repair service that works around your timeline. We serve all Mississauga communities from Port Credit to Malton with same-day availability.',
  'Brampton': 'Brampton\'s large, active households put serious demands on home appliances. Multi-generational families in Brampton cannot afford to wait days for a washer or dryer repair. N Appliance Repair provides same-day service to every Brampton neighbourhood, from Gore Road to downtown Brampton, because we understand that appliance downtime here affects the whole family.',
  'North York': 'North York residents juggle busy professional and family lives along the Yonge corridor and in surrounding residential communities. Whether you live in a Sheppard Centre condo or a detached home in Bayview Village, our technicians arrive prepared with parts for the LG, Samsung, Bosch, and Whirlpool models common in this area.',
  'Scarborough': 'Scarborough is a community built on hard work and reliability — and those are exactly the values we bring to every repair call. Many Scarborough homes have appliances that have served well for years, and with the right repair, they can keep going. We serve Scarborough from the Bluffs to Malvern, keeping your household running without the cost of unnecessary replacements.',
  'Vaughan': 'Vaughan homeowners invest in quality appliances and expect service that matches. From Kleinburg estates to Woodbridge townhomes, we treat every home and every appliance with the care it deserves. Our technicians are experienced with the premium brands — Bosch, KitchenAid, Miele, Sub-Zero — that are standard in Vaughan\'s newer builds.',
  'Etobicoke': 'Etobicoke residents value reliable, no-nonsense service. Whether your vintage bungalow in Mimico has a 20-year-old Kenmore or your new Humber Bay condo came with a Samsung suite, we arrive same-day with the right parts and the experience to get it done right the first time.',
  'Markham': 'Markham\'s tech-savvy residents expect efficient, professional service. We understand the smart-connected appliances common in Markham homes and can troubleshoot Wi-Fi-enabled diagnostics, firmware-related issues, and sensor calibration alongside traditional mechanical repairs.',
  'Toronto & GTA': 'Homeowners across the GTA trust N Appliance Repair because we combine fast response times with honest, transparent pricing. Our flat-rate diagnostic fee means you know exactly what you are paying before any work begins, and our 90-day warranty ensures your repair lasts.',
};

// Appliance-specific common issues
const ISSUES = {
  dishwasher: [
    ['Not draining properly', 'Standing water after a cycle usually indicates a blocked drain hose, a failing drain pump, or food debris clogging the filter basket. In areas with hard water, mineral deposits can restrict drain flow over time.'],
    ['Dishes coming out dirty', 'Poor cleaning results stem from clogged spray arms, a worn wash motor, low water temperature, or a faulty detergent dispenser. We test water temperature at the inlet — it should reach at least 120 degrees Fahrenheit.'],
    ['Leaking from the door', 'Door seal deterioration, a warped door latch, or excessive suds from the wrong detergent cause leaks. In condos, even a small leak can become a major problem if water reaches the unit below.'],
    ['Strange noises during cycle', 'Grinding or buzzing sounds point to a failing wash motor bearing, debris caught in the drain pump impeller, or a spray arm hitting the racks due to improper loading or a broken rack clip.'],
    ['Not starting or powering on', 'A dishwasher that will not start may have a blown thermal fuse, a defective door latch switch, a tripped control board, or a wiring issue at the junction box beneath the unit.'],
  ],
  washer: [
    ['Not spinning or agitating', 'A washer that fills but will not spin typically has a worn drive belt, a failed motor coupling, a lid switch issue (top-load), or a faulty motor control board (front-load). Heavy loads accelerate these failures.'],
    ['Leaking water on the floor', 'Leaks come from a torn door boot seal (front-load), cracked tub, worn tub-to-pump hose, or a loose inlet valve connection. We check all water paths to find the exact source before recommending the repair.'],
    ['Excessive vibration or walking', 'Violent shaking during spin indicates worn shock absorbers or suspension springs, an unbalanced drum, or an unlevel installation. In upper-floor laundry rooms, this can cause structural vibration throughout the home.'],
    ['Not draining after cycle', 'Standing water in the drum points to a clogged drain pump filter, a kinked drain hose, a failed drain pump, or a control board issue that is not sending the drain signal at the right cycle stage.'],
    ['Foul odour from the drum', 'Mould and mildew thrive in front-load washer door boot seals and detergent dispensers, especially when the door stays closed between loads. We deep-clean affected components and show you prevention steps.'],
  ],
  dryer: [
    ['Not heating up', 'A dryer that tumbles but produces no heat is typically caused by a blown thermal fuse, a failed heating element, a defective gas igniter (gas models), or a cycling thermostat that has tripped and will not reset.'],
    ['Taking too long to dry', 'Extended drying times are almost always a vent restriction issue. Lint buildup in the vent duct, a crushed transition hose, or a blocked exterior vent cap reduces airflow and forces the dryer to run multiple cycles.'],
    ['Loud squealing or thumping', 'Squealing points to a worn drum belt or idler pulley, while thumping indicates flat spots on the drum rollers. These are wear parts that degrade with use and are straightforward to replace during a single visit.'],
    ['Stopping mid-cycle', 'Mid-cycle shutdowns result from an overheating thermostat, a faulty door switch, a broken belt (drum stops immediately), or a control board failure. We test each component in sequence to identify the root cause.'],
    ['Burning smell during operation', 'A burning odour is a safety concern that could indicate lint trapped near the heating element, a seized drum bearing, a worn belt slipping on the motor pulley, or an electrical short in the wiring harness.'],
  ],
  fridge: [
    ['Not cooling properly', 'When a refrigerator runs but does not keep food cold, the cause is usually dirty condenser coils, a failed evaporator fan, a stuck defrost heater, or a sealed system issue like low refrigerant from a pinhole leak.'],
    ['Freezer frosting up', 'Excessive frost in the freezer compartment indicates a defrost system failure — the defrost heater, defrost timer, or defrost thermostat has failed, preventing the automatic defrost cycle from melting ice off the evaporator coils.'],
    ['Water leaking on the floor', 'A puddle under the fridge typically comes from a clogged defrost drain line, a cracked drain pan, or a leaking water inlet valve connected to the ice maker or water dispenser.'],
    ['Making loud humming or clicking', 'A refrigerator that clicks repeatedly is trying and failing to start its compressor — often a bad start relay or compressor overload protector. Continuous humming may indicate a condenser fan obstruction.'],
    ['Ice maker not producing ice', 'Ice maker failures stem from a frozen water fill tube, a faulty water inlet valve, a failed ice maker module, or water pressure below the 20 psi minimum required for proper fill. We check each component systematically.'],
  ],
  oven: [
    ['Not heating to correct temperature', 'An oven that underheats or overheats typically has a failing temperature sensor, a worn bake element with hot spots, or a control board that is not regulating power correctly. We verify actual temperature with a calibrated thermometer.'],
    ['Uneven cooking or baking', 'Hot spots and uneven results come from a burned-out bake or broil element, a non-functional convection fan, blocked air vents, or a temperature sensor that sends inconsistent readings to the control board.'],
    ['Oven not turning on', 'An oven that will not power up may have a tripped thermal fuse, a blown control board fuse, a faulty oven igniter (gas models) that draws insufficient amps to open the safety valve, or a wiring fault.'],
    ['Self-clean function not working', 'Self-clean failures are often caused by a faulty door lock motor, a broken door latch switch, or a control board issue. Running self-clean at maximum heat also stresses components, so repeated failures indicate an underlying problem.'],
    ['Gas smell when oven is on', 'A slight gas smell when a gas oven first ignites is normal, but persistent gas odour indicates a cracked safety valve, a weak igniter that delays ignition, or a loose gas connection that needs immediate professional attention.'],
  ],
  stove: [
    ['Burner not igniting', 'A gas burner that clicks but will not light usually has a clogged burner port from food spills, a misaligned spark electrode, or a faulty spark module. We clean and realign the ignition system for reliable starts.'],
    ['Electric element not heating', 'An electric stove element that does not heat has a burned-out element coil, a failed infinite switch (the knob control), or a bad element receptacle. We test continuity across each to identify the exact failure point.'],
    ['Uneven heat across burners', 'Inconsistent heating across burners can result from a failing infinite switch, a warped element that does not sit flat, or internal wiring damage from a spill that reached the electrical connections beneath the cooktop.'],
    ['Glass cooktop cracked', 'Cracks in a glass ceramic cooktop typically occur from thermal shock, impact, or running a burner with nothing on it. A cracked cooktop is both a safety and performance issue — we can source and install a replacement panel.'],
    ['Indicator lights staying on', 'Hot surface indicator lights that stay on when all burners are off indicate a surface temperature sensor failure or a control board issue. While not immediately dangerous, it should be repaired to ensure accurate safety indication.'],
  ],
  appliance: [
    ['Not powering on', 'When an appliance will not start, the cause is typically a blown fuse, a tripped safety switch, a faulty control board, or a wiring issue. We systematically test each possibility to find the root cause.'],
    ['Unusual noises during operation', 'Grinding, buzzing, or thumping sounds indicate worn mechanical components like bearings, motors, or fan blades. Addressing noise early prevents more costly failures down the line.'],
    ['Leaking water', 'Water leaks from any appliance should be addressed immediately to prevent floor damage and mould growth. We trace the leak to its source — inlet valve, hose, seal, or internal component — and fix it.'],
    ['Error codes on display', 'Modern appliances communicate through error codes. We decode fault codes for all major brands and verify them with hands-on component testing rather than guessing at the problem.'],
    ['Poor performance', 'When an appliance runs but does not perform well — a fridge that does not cool, a dryer that does not heat, a washer that does not clean — the issue is almost always a single failing component we can replace.'],
  ],
};

// Cost ranges by appliance
const COSTS = {
  dishwasher: { low: 120, high: 350, parts: '$40–$180 for common components like drain pumps, door latches, and control boards' },
  washer: { low: 150, high: 400, parts: '$50–$200 for common components like drain pumps, door boot seals, and motor couplings' },
  dryer: { low: 120, high: 350, parts: '$30–$180 for common components like heating elements, thermal fuses, and drum rollers' },
  fridge: { low: 150, high: 450, parts: '$50–$250 for common components like defrost heaters, fan motors, and start relays' },
  oven: { low: 130, high: 400, parts: '$40–$200 for common components like heating elements, igniters, and temperature sensors' },
  stove: { low: 120, high: 380, parts: '$35–$190 for common components like surface elements, switches, and spark modules' },
  appliance: { low: 120, high: 400, parts: '$30–$250 depending on the appliance type and the specific component needed' },
};

// Warning signs by appliance
const WARNINGS = {
  dishwasher: [
    'Water pooling at the base of the unit after each cycle',
    'A burning or electrical smell when the dishwasher runs',
    'The door latch feels loose or does not click firmly closed',
    'Dishes come out gritty, cloudy, or still have food residue',
    'The control panel flashes error codes or becomes unresponsive',
  ],
  washer: [
    'The drum makes grinding or banging sounds during spin',
    'You find water on the floor after running a load',
    'Clothes come out smelling musty or still soapy',
    'The machine shakes violently or walks across the floor',
    'Error codes appear on the display or the cycle will not complete',
  ],
  dryer: [
    'Clothes take two or more cycles to dry completely',
    'The outside of the dryer feels unusually hot to the touch',
    'You smell burning, scorching, or an electrical odour',
    'The drum makes squealing, thumping, or scraping noises',
    'Lint is appearing in places other than the lint trap',
  ],
  fridge: [
    'Food in the refrigerator compartment is not staying cold',
    'Excessive frost or ice buildup in the freezer section',
    'The compressor runs constantly without cycling off',
    'Water pools on the floor in front of or underneath the unit',
    'You hear repeated clicking sounds coming from the back',
  ],
  oven: [
    'The oven takes much longer than usual to preheat',
    'Food burns on one side while staying raw on the other',
    'You smell gas when the oven is off (gas models — call immediately)',
    'The oven door does not seal tightly when closed',
    'The temperature display or control panel behaves erratically',
  ],
  stove: [
    'A gas burner produces yellow or orange flame instead of blue',
    'An electric element glows unevenly or has visible dark spots',
    'You smell gas near the stove even when all burners are off',
    'A burner takes more than a few seconds to ignite',
    'The glass cooktop has a visible crack, chip, or discolouration',
  ],
  appliance: [
    'The appliance makes new or unusual sounds during operation',
    'You notice water, ice, or moisture where it should not be',
    'Error codes appear on the display panel',
    'The appliance runs constantly without cycling off',
    'Performance has noticeably declined over the past few weeks',
  ],
};

// Maintenance tips by appliance
const TIPS = {
  dishwasher: [
    ['Clean the filter monthly', 'Remove the bottom rack and twist out the filter basket. Rinse it under running water and scrub away food buildup with a soft brush. A clogged filter is the most common cause of poor dishwasher performance.'],
    ['Run a vinegar cycle every 2 months', 'Place a cup of white vinegar on the top rack and run an empty hot cycle. This dissolves mineral deposits from hard water and keeps spray arm nozzles clear for maximum cleaning pressure.'],
    ['Check the spray arms for blockages', 'Inspect the spray arm holes for food particles or mineral deposits. Use a toothpick to clear any blocked nozzles. Restricted spray arms mean water cannot reach all your dishes properly.'],
    ['Do not pre-rinse excessively', 'Modern dishwasher detergent is designed to work with some food residue. Scrape off large pieces but do not pre-wash — the enzymes in detergent need something to bond with to clean effectively.'],
    ['Inspect the door gasket seasonally', 'Wipe the rubber door gasket with a damp cloth and check for cracks, tears, or mould. A damaged gasket lets steam escape and can cause water leaks on your kitchen floor during a cycle.'],
  ],
  washer: [
    ['Leave the door open after each load', 'After every wash, leave the door ajar for a few hours to let the drum and gasket dry out. This is the single most effective way to prevent mould and musty odours in front-load washers.'],
    ['Clean the detergent dispenser monthly', 'Remove the dispenser tray and soak it in warm water to dissolve detergent and fabric softener residue. Built-up residue can clog the dispenser and cause poor wash results.'],
    ['Use the correct amount of detergent', 'More detergent does not mean cleaner clothes. Excess suds leave residue on fabrics, stress the drain pump, and promote mould growth inside the drum and gasket.'],
    ['Run a cleaning cycle monthly', 'Most modern washers have a dedicated tub clean cycle. Run it monthly with a washing machine cleaner tablet or a cup of baking soda to dissolve buildup and sanitize the interior.'],
    ['Check pockets before loading', 'Coins, keys, and small objects that slip through the drum holes can jam the drain pump impeller, causing expensive repairs. A quick pocket check before each load prevents this entirely.'],
  ],
  dryer: [
    ['Clean the lint trap before every load', 'A full lint trap restricts airflow, forcing the dryer to run longer and hotter. This wastes energy, shortens the dryer\'s life, and increases the risk of a lint fire.'],
    ['Have the vent duct cleaned annually', 'Professional vent cleaning removes lint buildup that accumulates in the exhaust duct over the year. A clogged vent is the leading cause of dryer fires in Canadian homes.'],
    ['Check the exterior vent cap', 'Go outside and verify that the vent flap opens freely when the dryer runs. Bird nests, snow buildup, and lint accumulation can block the cap and restrict airflow dramatically.'],
    ['Do not overload the drum', 'Overloading prevents clothes from tumbling freely, resulting in uneven drying and excessive strain on the motor, belt, and drum rollers. Leave room for air to circulate around the load.'],
    ['Inspect the transition hose', 'The flexible hose connecting the dryer to the wall vent should be rigid or semi-rigid aluminum, not plastic. Plastic hoses sag, collect lint, and are a fire hazard. Replace any plastic duct immediately.'],
  ],
  fridge: [
    ['Clean condenser coils every 6 months', 'Dust-clogged coils make the compressor work harder and run hotter, reducing efficiency and shortening its life. Pull the fridge out, vacuum the coils underneath or at the back, and push it back.'],
    ['Check door gaskets for air leaks', 'Close the door on a dollar bill — if it slides out easily, the gasket is not sealing properly. Worn gaskets force the compressor to run more, raising your electricity bill and causing temperature fluctuations.'],
    ['Keep the fridge at the right temperature', 'Set the refrigerator to 3 to 4 degrees Celsius and the freezer to minus 18 degrees Celsius. Use a thermometer to verify — the built-in dial is often inaccurate, especially on older models.'],
    ['Do not block internal air vents', 'Every refrigerator has air vents between the freezer and fridge compartments. Packing food too tightly blocks airflow and creates warm spots where food spoils faster.'],
    ['Replace the water filter on schedule', 'If your fridge has a water dispenser or ice maker, change the filter every 6 months. A clogged filter reduces water flow, causes small or hollow ice cubes, and can introduce contaminants.'],
  ],
  oven: [
    ['Avoid using the self-clean feature too often', 'Self-clean cycles reach extremely high temperatures that stress the door lock motor, thermal fuse, and control board. Limit use to once or twice a year and clean spills manually when possible.'],
    ['Test oven temperature with a thermometer', 'Place an oven thermometer in the centre of the rack and compare it to the set temperature. If it is off by more than 25 degrees, the temperature sensor may need calibration or replacement.'],
    ['Clean spills promptly', 'Baked-on food residue on the oven floor can smoke, cause odours, and even catch fire during high-heat cooking. Wipe up spills after the oven cools to prevent carbonized buildup.'],
    ['Inspect the door seal annually', 'Run your hand along the outside of the closed oven door while it is heated. If you feel significant heat escaping, the door gasket needs replacement — this also wastes energy and causes uneven cooking.'],
    ['Do not line the oven floor with foil', 'Aluminum foil on the oven floor blocks airflow, reflects heat unevenly, and can melt onto the enamel surface in self-clean mode. Use a baking sheet on a lower rack to catch drips instead.'],
  ],
  stove: [
    ['Clean burner grates and drip pans weekly', 'Food spills that carbonize on burner grates and drip pans can clog gas ports and cause uneven flame distribution. Soak removable parts in warm soapy water and scrub with a non-abrasive pad.'],
    ['Check gas connections annually', 'Apply a soapy water solution to gas line connections and watch for bubbles when the gas is on. Bubbling indicates a leak that needs immediate professional repair — do not attempt to tighten gas fittings yourself.'],
    ['Use flat-bottomed cookware on glass tops', 'Warped or round-bottomed pots on a glass cooktop cause hot spots, reduce efficiency, and can scratch or crack the surface. Use flat, smooth-bottomed cookware that matches the burner diameter.'],
    ['Do not slide pots across glass cooktops', 'Dragging cast iron or stoneware across a glass surface causes scratches that weaken the glass over time. Always lift cookware when repositioning it on the cooktop.'],
    ['Keep the area around the stove clear', 'Flammable items like dish towels, paper towels, and cooking oil containers should be kept at least 30 centimetres away from the stove. This is the most common cause of kitchen fires in Canadian homes.'],
  ],
  appliance: [
    ['Follow the manufacturer maintenance schedule', 'Every appliance comes with recommended maintenance intervals in the owner\'s manual. Following these guidelines prevents premature failures and may be required to maintain warranty coverage.'],
    ['Clean filters and vents regularly', 'Whether it is a dryer lint trap, a fridge condenser coil, or a dishwasher filter basket, keeping filtration and ventilation paths clear is the single most impactful maintenance step for any appliance.'],
    ['Address unusual sounds immediately', 'New or changing sounds from an appliance almost always indicate a developing problem. Catching a worn bearing, loose belt, or failing motor early can prevent a complete breakdown and a more expensive repair.'],
    ['Use the correct detergents and supplies', 'Using the wrong detergent type, incorrect amounts, or off-brand supplies that do not meet manufacturer specifications can cause buildup, poor performance, and premature component failure.'],
    ['Schedule annual professional checkups', 'A yearly inspection by a qualified technician can catch developing issues before they become emergencies. This is especially important for gas appliances where safety is a concern.'],
  ],
};

function generateSection(filename) {
  const p = parseFilename(filename);
  const app = p.rawAppliance || 'appliance';
  const appDisplay = p.appliance;
  const appCap = appDisplay.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const city = p.city;
  const brand = p.brand;

  // Build appliance label for headings
  let headingAppliance = appCap;
  if (brand) headingAppliance = brand + ' ' + appCap;

  // City intro — use city-specific or GTA default
  const cityIntro = CITY_INTROS[city] || CITY_INTROS['Toronto & GTA'];
  const cityWhy = CITY_WHY[city] || CITY_WHY['Toronto & GTA'];

  // Get data arrays
  const diag = DIAGNOSE[app] || DIAGNOSE['appliance'];
  const issues = ISSUES[app] || ISSUES['appliance'];
  const cost = COSTS[app] || COSTS['appliance'];
  const warnings = WARNINGS[app] || WARNINGS['appliance'];
  const tips = TIPS[app] || TIPS['appliance'];

  // Customize issues intro with city context
  let issueIntro = cityIntro;
  if (brand) {
    issueIntro += ` ${brand} ${p.appliancePlural} in these homes face specific wear patterns that our certified technicians encounter regularly.`;
  } else {
    issueIntro += ` Here are the ${appDisplay} problems our technicians encounter most frequently in ${city} service calls.`;
  }

  // Brand-specific additions
  let brandNote = '';
  if (brand) {
    brandNote = ` As ${brand} specialists, we maintain current training on all ${brand} model lines and stock genuine ${brand} replacement parts for the most common repairs. Whether your ${brand} ${appDisplay} was installed last year or has been running faithfully for a decade, we have the expertise to diagnose and repair it.`;
  }

  const html = `
  <section class="extended-content fade-in" aria-label="Detailed service information" style="padding:40px 0;background:#F9FAFB;">
    <div class="container" style="max-width:900px;margin:0 auto;padding:0 24px;">

      <h2>How We Diagnose ${headingAppliance} Problems in ${city}</h2>
      <p>When you call N Appliance Repair at <a href="tel:+14375241053">(437) 524-1053</a>, we dispatch a licensed technician to your ${city} home with a fully stocked service van. Our diagnostic process is systematic and thorough — we never guess at the problem.${brandNote}</p>
      <ol>
        <li><strong>Visual Inspection:</strong> ${diag.visual}</li>
        <li><strong>Error Code Analysis:</strong> ${diag.error}</li>
        <li><strong>Component Testing:</strong> ${diag.component}</li>
        <li><strong>Parts Assessment:</strong> ${diag.parts}</li>
      </ol>
      <p>Every diagnosis concludes with a firm written quote. You approve the price before any repair work begins — no surprise charges, no hidden fees. Our flat $89 diagnostic fee is credited toward the repair if you choose to proceed.</p>

      <h2>Common ${headingAppliance} Issues in ${city} Homes</h2>
      <p>${issueIntro}</p>
      <ul>
${issues.map(([title, desc]) => `        <li><strong>${title}:</strong> ${desc}</li>`).join('\n')}
      </ul>

      <h2>${headingAppliance} Repair Cost Guide for ${city} Residents</h2>
      <p>We believe in transparent pricing. Here is what ${city} homeowners can expect when calling N Appliance Repair for ${brand ? brand + ' ' : ''}${appDisplay} service:</p>
      <ul>
        <li><strong>Diagnostic fee:</strong> $89 (credited toward repair)</li>
        <li><strong>Common repair range:</strong> $${cost.low}\u2013$${cost.high} depending on the issue</li>
        <li><strong>Parts:</strong> ${cost.parts}</li>
        <li><strong>Labour:</strong> included in flat-rate pricing</li>
      </ul>
      <p>As a general rule, if the repair cost exceeds 50 percent of what a comparable new ${appDisplay} would cost, we will tell you honestly that replacement makes more sense. We would rather earn your trust with honest advice than sell an unnecessary repair.${brand ? ' Genuine ' + brand + ' parts may cost slightly more than aftermarket alternatives, but they fit precisely and come with manufacturer warranty coverage.' : ''}</p>

      <h2>Warning Signs \u2014 When to Call Right Away</h2>
      <p>Do not wait until your ${brand ? brand + ' ' : ''}${appDisplay} fails completely. Call N Appliance Repair at <a href="tel:+14375241053">(437) 524-1053</a> if you notice:</p>
      <ul>
${warnings.map(w => `        <li>${w}</li>`).join('\n')}
      </ul>

      <h2>Why ${city} Homeowners Trust N Appliance Repair</h2>
      <p>${cityWhy}</p>
      <ul>
        <li><strong>Same-day service</strong> available across ${city}</li>
        <li><strong>Flat $89 diagnostic fee</strong> \u2014 no surprise charges</li>
        <li><strong>90-day parts &amp; labour warranty</strong> on all repairs</li>
        <li><strong>Licensed &amp; insured</strong> technicians</li>
        <li><strong>Most repairs completed same visit</strong> \u2014 we carry common parts</li>
      </ul>

      <h2>Maintenance Tips to Prevent Future ${headingAppliance} Repairs</h2>
      <p>Preventive maintenance costs nothing but a few minutes of your time, and it can save you hundreds of dollars in avoidable repairs. Here are our top recommendations for keeping your ${brand ? brand + ' ' : ''}${appDisplay} running smoothly:</p>
      <ul>
${tips.map(([title, desc]) => `        <li><strong>${title}:</strong> ${desc}</li>`).join('\n')}
      </ul>
      <p>Regular maintenance extends the average ${appDisplay} lifespan by 5 to 10 years. If you would like a professional annual maintenance checkup for any of your home appliances, call us at <a href="tel:+14375241053">(437) 524-1053</a> — we offer maintenance visits across ${city}.</p>

    </div>
  </section>

`;

  return html;
}

// Main
let processed = 0;
let skipped = 0;
let errors = [];

for (const file of FILES) {
  const fpath = path.join(DIR, file);
  if (!fs.existsSync(fpath)) {
    console.log(`SKIP (not found): ${file}`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(fpath, 'utf8');

  // Check if already processed
  if (html.includes('class="extended-content')) {
    console.log(`SKIP (already has extended-content): ${file}`);
    skipped++;
    continue;
  }

  // Find insertion point — before FAQ section comment or tag
  const faqMarkers = [
    '  <!-- FAQ Section -->',
    '<section class="faq-section',
  ];

  let insertIdx = -1;
  for (const marker of faqMarkers) {
    const idx = html.indexOf(marker);
    if (idx !== -1) {
      insertIdx = idx;
      break;
    }
  }

  if (insertIdx === -1) {
    console.log(`ERROR (no FAQ section found): ${file}`);
    errors.push(file);
    continue;
  }

  const section = generateSection(file);
  html = html.slice(0, insertIdx) + section + html.slice(insertIdx);

  fs.writeFileSync(fpath, html, 'utf8');
  processed++;
  console.log(`OK: ${file}`);
}

console.log(`\nDone. Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors.length}`);
if (errors.length) console.log('Error files:', errors.join(', '));
