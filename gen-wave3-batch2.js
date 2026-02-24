#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// ─── Neighbourhood data ────────────────────────────────────────────────────
const hoods = {
  'trinity-bellwoods': {
    label: 'Trinity-Bellwoods',
    region: 'West Toronto',
    demo: 'hipster/young professionals, condos and Victorian houses',
    brands: ['LG', 'Samsung', 'Bosch'],
    secondary_brands: 'LG and Samsung',
    housing: 'Victorian row houses, recent condos along Dundas and Queen West',
    streets: 'Queen Street West, Dundas Street West, and Ossington Avenue',
    unique1: 'Trinity Bellwoods Park anchors the neighbourhood and draws a steady flow of young professionals who cook at home daily and rely on modern appliances.',
    unique2: 'Victorian homes here have narrow galley kitchens that challenge appliance access — our compact tool kits and slim-profile equipment handle tight corridors without damaging original millwork.',
    unique3: 'The Queen West condo corridor houses compact European-style kitchen setups with integrated Bosch and LG fridges built into cabinetry, requiring careful removal of cabinet panels before diagnostics can begin.',
  },
  'chinatown': {
    label: 'Chinatown',
    region: 'Downtown Toronto',
    demo: 'dense urban Chinese-Canadian community, small apartments and businesses',
    brands: ['LG', 'Samsung'],
    secondary_brands: 'LG and Samsung compact models',
    housing: 'older low-rise apartments, mixed commercial-residential buildings on Spadina and Dundas',
    streets: 'Spadina Avenue, Dundas Street West, and Baldwin Street',
    unique1: 'Chinatown\'s dense commercial-residential blocks house a mix of small-unit apartments above restaurants and retail, where high cooking intensity and limited kitchen ventilation accelerate appliance wear.',
    unique2: 'Cooking in Chinatown homes is frequent and intense — wok cooking produces high heat and grease vapour that coats appliance interiors faster than average, shortening component life and requiring more frequent maintenance.',
    unique3: 'Many units here share utility risers and have compact appliance niches — fridges are often 24-inch counter-depth models and washers are stacked or all-in-one units requiring specialized handling.',
  },
  'ossington': {
    label: 'Ossington',
    region: 'West Toronto',
    demo: 'trendy young professionals, artists, newer condos and updated semis',
    brands: ['Bosch', 'LG', 'Samsung'],
    secondary_brands: 'Bosch and LG',
    housing: 'renovated Victorian semis, newer low-rise condos along Ossington Avenue',
    streets: 'Ossington Avenue, Dundas Street West, and Argyle Street',
    unique1: 'Ossington is undergoing rapid renovation — older semis are being gutted and fitted with premium European appliances, while new condos arrive with integrated Bosch and LG packages that need expert servicing.',
    unique2: 'The strip of restaurants and bars on Ossington creates a lively neighbourhood identity, and residents here expect service that\'s fast and professional — they know quality and won\'t accept vague diagnostics.',
    unique3: 'Renovated semis in Ossington often have mixed-era wiring — modern appliances plugged into circuits not designed for them, leading to voltage fluctuations that can damage control boards over time.',
  },
  'roncesvalles': {
    label: 'Roncesvalles',
    region: 'West Toronto',
    demo: 'Polish-Canadian families, long-term residents, semi-detached homes',
    brands: ['Whirlpool', 'Maytag', 'LG'],
    secondary_brands: 'Whirlpool and Maytag',
    housing: 'Edwardian and inter-war semi-detached homes, some post-war bungalows south of Dundas',
    streets: 'Roncesvalles Avenue, Howard Park Avenue, and Boustead Avenue',
    unique1: 'Roncesvalles has one of Toronto\'s most stable Polish-Canadian communities with multi-generational homeowners who cook traditional dishes regularly — heavy baking and stovetop use means oven and range components wear faster here.',
    unique2: 'The semi-detached Edwardian housing stock means most appliances are 10-15 years old — Whirlpool and Maytag units approaching the end of their service life but still repairable with proper parts.',
    unique3: 'Families in Roncesvalles run large-capacity washers multiple times per week for full households — front-load bearing failures and drain pump issues are more common here than in single-occupant neighbourhoods.',
  },
  'wychwood': {
    label: 'Wychwood',
    region: 'Midtown Toronto',
    demo: 'artistic community, heritage conservation area, mix of homeowners and renters',
    brands: ['Whirlpool', 'LG', 'GE'],
    secondary_brands: 'Whirlpool and GE',
    housing: 'heritage detached homes along Wychwood Avenue, Edwardian semis, the Wychwood Barns arts hub nearby',
    streets: 'Wychwood Avenue, St. Clair Avenue West, and Christie Street',
    unique1: 'Wychwood is a Heritage Conservation District — homes here are older than in most Toronto neighbourhoods, with kitchens that retain original character while housing modern appliances in spaces not designed for them.',
    unique2: 'The Wychwood Barns arts hub brings creative professionals to the neighbourhood who value sustainability — many Wychwood residents specifically want repairs rather than replacements for environmental reasons.',
    unique3: 'Older homes in Wychwood frequently have 30-amp dryer circuits instead of modern 40-amp service, and older fuse boxes rather than breakers — we always check electrical supply before diagnosing appliance faults.',
  },
  'thorncliffe-park': {
    label: 'Thorncliffe Park',
    region: 'East York',
    demo: 'dense South Asian and Middle Eastern community, large families, intense cooking',
    brands: ['LG', 'Samsung'],
    secondary_brands: 'LG and Samsung',
    housing: 'post-war apartment towers from the 1960s–1970s, one of Toronto\'s densest residential areas',
    streets: 'Overlea Boulevard, Thorncliffe Park Drive, and Flemingdon Park adjacent',
    unique1: 'Thorncliffe Park is one of Toronto\'s most densely populated neighbourhoods — large families cook three full meals daily with heavy spice use and high-BTU stovetop burners, stressing oven, range, and ventilation components significantly.',
    unique2: 'The 1960s-era towers have original plumbing and electrical infrastructure being asked to serve modern appliances — washer standpipes and electrical panels were not designed for today\'s high-draw machines.',
    unique3: 'Grease and spice particulate from intensive South Asian cooking gets drawn into appliance vents and fan motors faster than in low-cooking households — dishwasher spray arms clog, dryer exhaust ducts accumulate grease, and fridge condenser coils need more frequent cleaning.',
  },
  'st-lawrence': {
    label: 'St. Lawrence',
    region: 'Downtown East Toronto',
    demo: 'young professionals, downtown condo residents, upscale mixed community',
    brands: ['Miele', 'Bosch', 'LG'],
    secondary_brands: 'Miele and Bosch',
    housing: 'modern high-rise condos, loft conversions, heritage commercial buildings repurposed as residential',
    streets: 'Front Street East, King Street East, and the St. Lawrence Market neighbourhood',
    unique1: 'St. Lawrence is one of Toronto\'s original neighbourhoods, now home to a dense cluster of upscale condominiums and converted loft buildings where premium European appliances — Miele and Bosch — are the norm rather than the exception.',
    unique2: 'The St. Lawrence Market draws food-oriented residents who cook seriously and expect restaurant-grade performance from their home appliances — when a Miele dishwasher or Bosch range fails, they want a certified technician, not a generalist.',
    unique3: 'High-rise buildings in St. Lawrence require elevator coordination and secured building access — we call ahead to building management and have resident contact numbers ready to ensure access without delays.',
  },
  'king-west': {
    label: 'King West',
    region: 'Downtown West Toronto',
    demo: 'tech workers, young professionals, luxury condo residents',
    brands: ['Bosch', 'Miele', 'LG'],
    secondary_brands: 'Bosch and Miele',
    housing: 'luxury condominiums, converted loft buildings, King-Spadina Entertainment District adjacent',
    streets: 'King Street West, Spadina Avenue, and Wellington Street West',
    unique1: 'King West is Toronto\'s tech and entertainment hub — residents are time-poor, earn well, and expect appliance repair to be as frictionless as ordering delivery. Fast response and clear communication matter here.',
    unique2: 'Luxury condominium buildings in King West feature building concierge, controlled access, and strict visitor parking rules — our technicians call building management ahead of arrival and carry proper ID to move through security efficiently.',
    unique3: 'High-end integrated appliances in King West condos — panel-ready Bosch dishwashers, built-in Miele ovens — require specialized tools and manufacturer training to remove and service without damaging the surrounding cabinetry.',
  },
  'swansea': {
    label: 'Swansea',
    region: 'West Toronto / Lakefront',
    demo: 'families, established professionals, lakefront upscale neighbourhood',
    brands: ['Bosch', 'KitchenAid', 'LG'],
    secondary_brands: 'Bosch and KitchenAid',
    housing: 'upscale detached homes near Bloor West Village, lakefront properties, mature-tree streets',
    streets: 'Windermere Avenue, Morningside Drive, and Ellis Avenue near High Park',
    unique1: 'Swansea sits between High Park and Lake Ontario — a quiet, family-oriented enclave with larger detached homes and higher-end appliance installations including KitchenAid refrigeration suites and Bosch dishwasher-in-drawer configurations.',
    unique2: 'Proximity to the lake means slightly higher humidity levels indoors, which can accelerate corrosion on appliance electrical contacts and door hinges — we inspect and treat contact points during every service call in this area.',
    unique3: 'Swansea homeowners tend to keep appliances longer than average — 15-to-20-year-old KitchenAid and Bosch units are common, and sourcing parts for discontinued models requires our wider OEM supplier network.',
  },
  'etobicoke-village': {
    label: 'Etobicoke Village',
    region: 'Etobicoke',
    demo: 'suburban families, long-term Etobicoke residents, mixed ages',
    brands: ['Whirlpool', 'GE', 'Frigidaire'],
    secondary_brands: 'Whirlpool and GE',
    housing: 'post-war and 1960s–1970s bungalows, split-levels, and detached homes along Islington and Bloor',
    streets: 'Islington Avenue, Bloor Street West (Etobicoke), and Burnhamthorpe Road',
    unique1: 'Etobicoke Village retains a classic suburban Toronto character — large lots, mature trees, and homes with dedicated laundry rooms and full-size appliance setups in original kitchen layouts.',
    unique2: 'The bungalow and split-level housing stock means washers and dryers are often in basement laundry rooms with limited ceiling clearance — our technicians are trained to work in confined spaces without compromising repair quality.',
    unique3: 'Whirlpool and GE appliances in this area skew toward the 10-15-year mark — old enough to need attention, young enough to be well worth repairing rather than replacing. Parts availability is excellent for these brands.',
  },
};

// ─── Service data ──────────────────────────────────────────────────────────
const services = {
  'fridge-repair': {
    label: 'Refrigerator Repair',
    short: 'fridge',
    appliance: 'refrigerator',
    Appliance: 'Refrigerator',
    problems: [
      ['Not Cooling / Warm Inside', 'Compressor, condenser coils, evaporator fan, and thermostat diagnosis for temperature issues.'],
      ['Ice Buildup / Frost', 'Defrost heater, timer, thermostat, and drain line inspection to eliminate ice accumulation.'],
      ['Water Leaking', 'Drain pan, water line, inlet valve, and door gasket inspection. Leak found and fixed same visit.'],
      ['Strange Noises', 'Evaporator fan, condenser fan, compressor, and ice maker noise isolation and repair.'],
      ['Not Making Ice', 'Ice maker module, water inlet valve, fill tube, and temperature sensor diagnostics.'],
      ['Control Board / Display', 'Main board, temperature display, sensors, and electronic components repaired with OEM parts.'],
    ],
    pricing: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — thermostat, fan, defrost system', '$150 – $280'],
      ['Control board / electronic component', '$220 – $380'],
      ['Compressor / sealed system repair', '$350 – $550'],
    ],
    otherServices: ['washer-repair', 'dryer-repair', 'dishwasher-repair', 'oven-repair', 'stove-repair'],
    nearbyService: 'fridge-repair',
    nearbyLabel: 'Refrigerator Repair',
    maintenanceTips: [
      'Clean condenser coils every 6 months — vacuum the coils at the back or bottom to maintain cooling efficiency',
      'Check door gaskets for cracks or gaps — close the door on a dollar bill; if it slides out easily, the gasket needs replacing',
      'Keep the fridge at 37°F (3°C) and the freezer at 0°F (-18°C) — use a thermometer to verify settings',
      'Do not overfill the fridge — air must circulate freely between items for consistent temperatures',
      'Replace the water filter every 6 months if your fridge has a dispenser or ice maker',
    ],
    warningSignsLabel: 'Warning Signs Your Refrigerator Needs Repair',
    warningSigns: [
      'Food spoiling faster than usual or inconsistent temperatures between shelves',
      'Frost or ice accumulation on the back wall of the freezer compartment',
      'Water pooling under or behind the refrigerator',
      'Compressor running constantly without cycling off',
      'Unusual buzzing, clicking, or humming from the unit',
      'Higher than normal electricity bills without other explanation',
    ],
  },
  'washer-repair': {
    label: 'Washing Machine Repair',
    short: 'washer',
    appliance: 'washing machine',
    Appliance: 'Washing Machine',
    problems: [
      ['Not Spinning / Agitating', 'Drive motor, belt, clutch assembly, and lid switch diagnosis for spin and agitation failures.'],
      ['Not Draining', 'Drain pump, filter, hose blockage, and lid switch inspection to restore drainage.'],
      ['Leaking Water', 'Door boot seal, hoses, pump housing, and inlet valve inspection. Leak source identified same visit.'],
      ['Loud Noise / Vibration', 'Drum bearings, shock absorbers, spider arm, and cabinet levelling assessed and repaired.'],
      ['Error Codes', 'Control board, sensor, motor, and wiring harness diagnostics for all front-load and top-load error codes.'],
      ['Door Lock / Won\'t Start', 'Door latch, lock solenoid, control board, and thermal fuse diagnosis for machines that won\'t begin a cycle.'],
    ],
    pricing: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — pump, lid switch, belt', '$150 – $260'],
      ['Drum bearings / spider arm', '$220 – $380'],
      ['Control board / electronic component', '$200 – $360'],
    ],
    otherServices: ['fridge-repair', 'dryer-repair', 'dishwasher-repair', 'oven-repair', 'stove-repair'],
    nearbyService: 'washer-repair',
    nearbyLabel: 'Washing Machine Repair',
    maintenanceTips: [
      'Run a monthly hot wash cycle with washer cleaner to remove mould, detergent residue, and mineral deposits',
      'Leave the door ajar after each wash to dry the drum interior and prevent mould on the door boot seal',
      'Clean the lint trap or filter every 3 months — blocked filters strain the drain pump',
      'Use the correct HE (high-efficiency) detergent for front-load machines — too much suds causes premature bearing wear',
      'Level the machine precisely — even 2mm of tilt causes drum imbalance that damages bearings over time',
    ],
    warningSignsLabel: 'Warning Signs Your Washing Machine Needs Repair',
    warningSigns: [
      'Machine stops mid-cycle or displays error codes',
      'Loud banging or grinding during the spin cycle',
      'Water remaining in the drum after a completed cycle',
      'Musty smell from the drum that doesn\'t clear with cleaning',
      'Visible water pooling under or around the machine',
      'Machine walking or vibrating excessively during spin',
    ],
  },
  'dryer-repair': {
    label: 'Dryer Repair',
    short: 'dryer',
    appliance: 'dryer',
    Appliance: 'Dryer',
    problems: [
      ['Not Heating', 'Heating element, thermal fuse, high-limit thermostat, and gas valve solenoid diagnosis for heat failures.'],
      ['Not Tumbling', 'Drive belt, idler pulley, drum bearing, and drive motor inspection to restore drum rotation.'],
      ['Takes Too Long to Dry', 'Exhaust duct blockage, moisture sensor, thermostat, and airflow pathway inspection.'],
      ['Overheating / Shutting Off', 'Clogged vent, thermal fuse, high-limit thermostat, and element grounding checked and repaired.'],
      ['Loud Noise / Squealing', 'Drum bearing, felt seal, idler pulley, and blower wheel noise isolation and repair.'],
      ['Won\'t Start', 'Door switch, start switch, thermal fuse, and control board diagnosis for machines that won\'t begin a cycle.'],
    ],
    pricing: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — heating element, fuse, belt', '$140 – $260'],
      ['Drum bearing / felt seal / idler pulley', '$160 – $300'],
      ['Control board / electronic component', '$200 – $360'],
    ],
    otherServices: ['fridge-repair', 'washer-repair', 'dishwasher-repair', 'oven-repair', 'stove-repair'],
    nearbyService: 'dryer-repair',
    nearbyLabel: 'Dryer Repair',
    maintenanceTips: [
      'Clean the lint screen before or after every load — a blocked screen is the leading cause of dryer fires and overheating',
      'Inspect and clean the exhaust duct annually — lint accumulates inside the duct and can cause fires',
      'Check the external vent cap for bird nests and debris blockages each spring',
      'Don\'t overload the dryer — oversized loads strain the drive belt and motor and extend drying time significantly',
      'Dry synthetics on medium heat rather than high to reduce static buildup and sensor contamination',
    ],
    warningSignsLabel: 'Warning Signs Your Dryer Needs Repair',
    warningSigns: [
      'Clothes still damp after a full drying cycle',
      'Burning smell or visible scorch marks on clothes or housing',
      'Dryer runs but produces no heat',
      'Loud squealing, banging, or grinding during operation',
      'Dryer shuts off before the cycle completes',
      'The exterior of the dryer becomes very hot to the touch',
    ],
  },
  'dishwasher-repair': {
    label: 'Dishwasher Repair',
    short: 'dishwasher',
    appliance: 'dishwasher',
    Appliance: 'Dishwasher',
    problems: [
      ['Not Cleaning Dishes', 'Spray arm blockage, wash pump, water temperature, and detergent dispenser diagnosis.'],
      ['Not Draining', 'Drain pump, filter, drain hose, and air gap inspection to eliminate standing water after cycles.'],
      ['Leaking Water', 'Door gasket, door latch, spray arm seal, and pump housing inspection — leak found same visit.'],
      ['Not Starting / No Power', 'Door latch, control board, thermal fuse, and wiring harness diagnosis for machines that won\'t begin.'],
      ['Loud Noise During Cycle', 'Wash pump motor, spray arm, drain pump, and chopper blade noise isolation and repair.'],
      ['Not Drying Dishes', 'Heating element, rinse aid dispenser, and thermostat inspection for drying failures.'],
    ],
    pricing: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — pump, door latch, spray arm', '$140 – $250'],
      ['Wash motor / drain pump assembly', '$180 – $320'],
      ['Control board / electronic component', '$200 – $360'],
    ],
    otherServices: ['fridge-repair', 'washer-repair', 'dryer-repair', 'oven-repair', 'stove-repair'],
    nearbyService: 'dishwasher-repair',
    nearbyLabel: 'Dishwasher Repair',
    maintenanceTips: [
      'Clean the filter assembly monthly — remove the cylindrical filter from the tub floor and rinse under running water',
      'Wipe the door gasket weekly to prevent mould and ensure a watertight seal',
      'Run a hot cycle with dishwasher cleaner monthly to descale the interior and spray arms',
      'Keep rinse aid topped up — it prevents water spots and helps the drying cycle work efficiently',
      'Inspect spray arm holes quarterly and clear blockages with a toothpick — blocked holes reduce cleaning performance',
    ],
    warningSignsLabel: 'Warning Signs Your Dishwasher Needs Repair',
    warningSigns: [
      'Standing water remaining in the tub after a completed cycle',
      'Dishes coming out with food residue or white film',
      'Rust spots appearing inside the tub or on the door',
      'Water leaking from the door or underneath the unit',
      'Unusual grinding, rattling, or humming during cycles',
      'Machine not starting or stopping partway through a cycle',
    ],
  },
  'oven-repair': {
    label: 'Oven Repair',
    short: 'oven',
    appliance: 'oven',
    Appliance: 'Oven',
    problems: [
      ['Not Heating / Baking Unevenly', 'Bake element, broil element, gas igniter, and temperature sensor diagnosis for heat failures.'],
      ['Temperature Off / Inaccurate', 'Temperature sensor, control board, and calibration adjustment for ovens running hot or cold.'],
      ['Self-Clean Issues', 'Door lock motor, thermal fuse, and control board diagnosis for self-clean cycle failures.'],
      ['Won\'t Turn On / Control Board', 'Electronic control board, relay board, keypad, and display diagnosis and replacement.'],
      ['Broiler Not Working', 'Broil element, igniter, and broil burner valve inspection for gas and electric units.'],
      ['Door Hinge / Seal', 'Door hinge, gasket, and inner glass panel repair to restore proper heat retention.'],
    ],
    pricing: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — element, igniter, sensor', '$140 – $270'],
      ['Control board / electronic component', '$200 – $380'],
      ['Self-clean lock / thermal assembly', '$160 – $300'],
    ],
    otherServices: ['fridge-repair', 'washer-repair', 'dryer-repair', 'dishwasher-repair', 'stove-repair'],
    nearbyService: 'oven-repair',
    nearbyLabel: 'Oven Repair',
    maintenanceTips: [
      'Use the self-clean cycle sparingly — excessive use can burn out the thermal fuse and damage the control board',
      'Wipe up spills promptly before they bake on and become difficult to remove without harsh chemicals',
      'Verify oven temperature with an oven thermometer annually — factory calibration drifts over time',
      'Inspect door gaskets for cracks or tears that allow heat to escape and increase cooking times',
      'Keep the oven vent clear of obstructions — blocked vents cause heat to build up and trigger thermal protection cutoffs',
    ],
    warningSignsLabel: 'Warning Signs Your Oven Needs Repair',
    warningSigns: [
      'Food consistently undercooked or overcooked at standard temperatures',
      'Oven not reaching set temperature or heating unevenly',
      'Error codes or flashing displays on the control panel',
      'Gas burner not igniting or igniting with a delay',
      'Door not closing fully or heat escaping around the door frame',
      'Burning smell not explained by food spills',
    ],
  },
  'stove-repair': {
    label: 'Stove Repair',
    short: 'stove',
    appliance: 'stove',
    Appliance: 'Stove',
    problems: [
      ['Burner Not Igniting', 'Igniter, spark module, spark switch, and burner cap alignment diagnosis for gas stovetops.'],
      ['Electric Element Not Heating', 'Coil element, radiant element, infinite switch, and wiring harness repair for electric ranges.'],
      ['Gas Smell / Safety Concern', 'Gas valve, burner orifice, regulator, and supply line inspection — safety-first approach.'],
      ['Control Knob / Switch Failure', 'Infinite switch, rotary encoder, and control knob shaft repair for all range types.'],
      ['Induction Cooktop Issues', 'Induction coil, relay, control board, and temperature sensor diagnosis for induction units.'],
      ['Range Hood / Vent Fan', 'Fan motor, filter, damper, and lighting diagnosis for integrated range hood assemblies.'],
    ],
    pricing: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — igniter, element, switch', '$130 – $260'],
      ['Gas valve / sealed burner assembly', '$180 – $340'],
      ['Control board / electronic component', '$200 – $380'],
    ],
    otherServices: ['fridge-repair', 'washer-repair', 'dryer-repair', 'dishwasher-repair', 'oven-repair'],
    nearbyService: 'stove-repair',
    nearbyLabel: 'Stove Repair',
    maintenanceTips: [
      'Clean burner caps and grates after each heavy cooking session — grease buildup blocks igniter tips and ports',
      'Check gas burner ports for blockage monthly — use a toothpick, never a metal object, to clear blocked igniter orifices',
      'Verify igniter tips are dry after cleaning — moisture prevents reliable spark ignition',
      'Test all burners monthly to catch intermittent ignition problems before they become failures',
      'Inspect the power cord and plug for heat damage annually on electric ranges',
    ],
    warningSignsLabel: 'Warning Signs Your Stove Needs Repair',
    warningSigns: [
      'One or more burners not igniting or heating',
      'Burner clicking continuously even after it has lit',
      'Gas smell near the stove when burners are off',
      'Uneven flame or yellow/orange flame instead of blue',
      'Control knobs that are cracked, stiff, or no longer turn correctly',
      'Sparking or visible scorch marks on electric elements',
    ],
  },
};

// ─── Nearby pages mapping ─────────────────────────────────────────────────
const hoodSlugs = Object.keys(hoods);
const serviceSlugs = Object.keys(services);

function getNearbyHoods(currentHood) {
  const idx = hoodSlugs.indexOf(currentHood);
  const nearby = [];
  for (let i = 0; i < hoodSlugs.length; i++) {
    if (i !== idx) nearby.push(hoodSlugs[i]);
  }
  return nearby.slice(0, 6);
}

// ─── FAQ generation ───────────────────────────────────────────────────────
function makeFAQs(svc, hood) {
  const h = hoods[hood];
  const s = services[svc];
  return [
    {
      q: `How much does ${s.appliance} repair cost in ${h.label}?`,
      a: `${s.Appliance} repair in ${h.label} typically costs $150–$400 depending on the fault. Our flat $89 diagnostic fee is credited toward the repair if you proceed — so the diagnostic visit costs nothing extra when work is done. We provide a firm written quote before any work begins. Residents in ${h.label} get the same transparent pricing as all our Toronto-area customers.`,
    },
    {
      q: `How quickly can you reach ${h.label} for ${s.appliance} repair?`,
      a: `We dispatch to ${h.label} daily and typically arrive within 2–4 hours of your call. Call before 2 PM for same-day service Monday through Saturday. Sunday service is available 9 AM–6 PM. Our technicians are familiar with ${h.label}'s building access procedures, parking options on ${h.streets.split(',')[0]}, and typical appointment logistics in the area.`,
    },
    {
      q: `What ${s.appliance} brands do you repair in ${h.label}?`,
      a: `We repair all major brands in ${h.label} — ${h.brands.join(', ')}, and more. Our vans stock parts for ${h.secondary_brands} models specifically because those are the most common brands we encounter in ${h.label}'s ${h.housing}. For less common models we can source OEM parts within 24–48 hours.`,
    },
    {
      q: `Do you offer a warranty on ${s.appliance} repairs in ${h.label}?`,
      a: `Yes — every ${s.appliance} repair in ${h.label} includes our 90-day parts and labour warranty. If the same issue recurs within 90 days, we return at no charge. This warranty applies to all brands, all repair types, and all components — from simple switches to full control board replacements.`,
    },
    {
      q: `Do your technicians have experience in ${h.label}'s ${h.housing.split(',')[0]}?`,
      a: `Absolutely. We regularly serve ${h.label} and understand the practical access and logistics in ${h.housing.split(',')[0]}. ${h.unique2} Our technicians arrive prepared for the specific building and appliance configurations common in this neighbourhood.`,
    },
    {
      q: `Is it worth repairing my ${s.appliance} in ${h.label} or should I replace it?`,
      a: `If your ${s.appliance} is under 8–10 years old and the repair cost is under 50% of replacement price, repair almost always makes better financial sense — especially in ${h.label}, where delivery and installation of a new unit involves additional logistics and cost. We give you an honest assessment after the diagnostic and will tell you plainly if replacement is the better option.`,
    },
  ];
}

// ─── Schema generation ────────────────────────────────────────────────────
function makeSchema(svc, hood) {
  const h = hoods[hood];
  const s = services[svc];
  const faqs = makeFAQs(svc, hood);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "name": "N Appliance Repair",
        "telephone": "+14375241053",
        "url": "https://nappliancerepair.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": h.label,
          "addressRegion": "Ontario",
          "addressCountry": "CA"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "5200"
        },
        "openingHours": ["Mo-Sa 08:00-20:00", "Su 09:00-18:00"]
      },
      {
        "@type": "Service",
        "name": `${s.Appliance} Repair in ${h.label}`,
        "provider": { "@type": "LocalBusiness", "name": "N Appliance Repair" },
        "areaServed": h.label,
        "description": `Professional ${s.appliance} repair service in ${h.label}, ${h.region}`
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }
    ]
  }, null, 2);
}

// ─── Content blocks per neighbourhood+service ─────────────────────────────
function makeContent(svc, hood) {
  const h = hoods[hood];
  const s = services[svc];
  const slug = `${svc}-${hood}`;
  const canonical = `https://nappliancerepair.com/${slug}`;
  const otherServicesLinks = s.otherServices.map(os => {
    const osl = services[os];
    return `<li><a href="/${os}-${hood}">${osl.label} in ${h.label}</a></li>`;
  }).join('\n');
  const nearbyLinks = getNearbyHoods(hood).map(nh => {
    return `<li><a href="/${s.nearbyService}-${nh}">${s.nearbyLabel} in ${hoods[nh].label}</a></li>`;
  }).join('\n');
  const problemCards = s.problems.map(([name, desc]) => `
      <div class="problem-card">
        <div class="problem-name">${name}</div>
        <div class="problem-desc">${desc}</div>
      </div>`).join('');
  const pricingRows = s.pricing.map(([type, cost]) => `
        <tr>
          <td>${type}</td>
          <td>${cost}</td>
        </tr>`).join('');
  const faqs = makeFAQs(svc, hood);
  const faqHTML = faqs.map(f => `
        <details class="faq-item">
          <summary class="faq-question">
            <span class="faq-q-text">${f.q}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-answer"><p>${f.a}</p></div>
        </details>`).join('');
  const maintTips = s.maintenanceTips.map(t => `<li>${t}</li>`).join('\n');
  const warningSigns = s.warningSigns.map(w => `<li>${w}</li>`).join('\n');

  // Neighbourhood-specific intro paragraphs
  const introBlocks = {
    'fridge-repair': `
<h2>${s.Appliance} Repair in ${h.label} — Reliable Cold Storage for ${h.region}</h2>
<p>${h.label} is a ${h.demo}. The neighbourhood's ${h.housing} creates a specific appliance landscape dominated by ${h.secondary_brands} refrigerators. When a fridge fails here, families face immediate food spoilage — within 4 hours in summer, sooner if the door is opened frequently. Fast, professional repair service is essential.</p>
<p>${h.unique1}</p>

<h2>Why ${h.label} Homes Need Specialized Refrigerator Service</h2>
<p>${h.unique2}</p>
<p>Refrigerators in ${h.label} face specific challenges tied to the neighbourhood's character. The most frequent issue we diagnose is defrost system failure — the heater, timer, or thermostat stops working, ice builds up behind the evaporator cover, and the fridge gradually loses cooling. Food on upper shelves warms first while the freezer still appears functional, creating a misleading symptom picture that delays action.</p>

<h2>Common Refrigerator Failures in ${h.label}</h2>
<p>The fridge problems we encounter most in ${h.label} reflect the specific appliance mix and usage patterns here. Condenser coil contamination is our leading call — dust, cooking grease, and in some units pet hair build up on the coils faster than most homeowners realize, forcing the compressor to run hotter and harder until it eventually fails. We clean and inspect coils as part of every diagnostic visit.</p>
<p>${h.unique3}</p>
<p>Water inlet valve failures are the third most common issue — the valve either sticks open, causing a slow drip that pools under the fridge, or fails to open, leaving the ice maker and dispenser dry. Toronto's municipal water supply has sufficient calcium content to build up mineral deposits inside inlet valves within 12–18 months of installation, particularly in areas with older plumbing infrastructure.</p>

<h2>How We Serve ${h.label}</h2>
<p>Our technicians arrive at ${h.label} addresses with a fully stocked van carrying the parts most commonly needed for ${h.secondary_brands} refrigerators — compressor start relays, defrost heaters, thermostats, evaporator fan motors, water inlet valves, and door gaskets. Most refrigerator repairs in ${h.label} complete in a single visit of 45 minutes to 2 hours. For specialty or less common parts, we return within 24–48 hours with genuine OEM components.</p>
<p>Parking and access in ${h.label} can require preparation — our technicians know the specific logistics of ${h.streets} and plan accordingly. We communicate arrival windows clearly and call 15 minutes ahead so you're ready when we arrive.</p>

<h2>Why Choose N Appliance Repair for Refrigerator Repair in ${h.label}</h2>
<p>We've built our reputation across ${h.region} and greater Toronto on showing up on time, diagnosing honestly, pricing fairly, and fixing it right the first time. Every refrigerator repair includes a 90-day parts and labour warranty — if the same issue returns, we come back at no charge. Our technicians are licensed, insured, and trained on the specific brands and models found in ${h.label}.</p>
<ul>
<li>Same-day service available Monday through Saturday — call before 2 PM</li>
<li>$89 diagnostic fee applied to the repair cost if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians with brand-specific training</li>
<li>OEM and manufacturer-equivalent parts stocked on every van</li>
<li>Written quote provided before any work begins — no hidden fees</li>
</ul>

<h2>Refrigerator Maintenance Tips for ${h.label} Residents</h2>
<p>Preventive care extends fridge life significantly. Here are the most important maintenance steps for homeowners in ${h.label}:</p>
<ul>
${maintTips}
</ul>
<p>These steps can add years to your refrigerator's service life. If you're unsure about any maintenance task, call us at (437) 524-1053 — we're happy to walk you through it.</p>

    <h2>${s.warningSignsLabel}</h2>
    <p>Watch for these signs that your refrigerator needs professional attention:</p>
    <ul>
${warningSigns}
    </ul>`,

    'washer-repair': `
<h2>Washing Machine Repair in ${h.label} — Keeping Laundry Moving in ${h.region}</h2>
<p>${h.label} is a ${h.demo}. The area's ${h.housing} means washing machines here handle diverse loads — from delicate professional garments to large family laundry volumes. ${h.secondary_brands} washers dominate the appliance mix. When a washer fails, the disruption to daily life is immediate and the cost of laundromats adds up quickly.</p>
<p>${h.unique1}</p>

<h2>Why ${h.label} Homes Present Unique Washer Repair Challenges</h2>
<p>${h.unique2}</p>
<p>Washing machines in ${h.label} encounter specific problems tied to local water quality and usage intensity. Toronto's municipal water is moderately hard — calcium deposits accumulate inside inlet screens, drum perforations, and pump impellers over time, reducing performance before causing outright failure. We descale key components during every diagnostic visit.</p>

<h2>Common Washing Machine Failures in ${h.label}</h2>
<p>The washer issues we see most in ${h.label} reflect the specific appliance brands and household patterns here. Drum bearing failure is the leading call — bearings wear gradually, producing a roaring sound during spin that grows louder over months until the machine vibrates severely. Catching bearing wear early means a straightforward replacement; waiting until failure risks damaging the drum shaft and rear drum assembly as well.</p>
<p>${h.unique3}</p>
<p>Drain pump blockages are the second most frequent issue — items left in pockets, lint, and small clothing items clog the pump impeller, causing the machine to stop draining and display an error code. We carry replacement pumps for all common brands but first check whether the pump can be cleared and saved — many blockages are resolved without part replacement.</p>

<h2>How We Serve ${h.label}</h2>
<p>Our technicians arrive at ${h.label} with a stocked van carrying the washer parts most needed for ${h.secondary_brands} machines — drum bearings, door boot seals, drain pumps, lid switches, inlet valves, and drive belts. Most washer repairs in ${h.label} complete in a single 1–2 hour visit. For less common parts, we return within 24–48 hours with genuine OEM components.</p>
<p>We know the parking and building access situation in ${h.label} — ${h.streets} areas require advance planning, and our technicians handle this routinely. We call 15 minutes before arrival so you're ready when we get there.</p>

<h2>Why Choose N Appliance Repair for Washer Repair in ${h.label}</h2>
<p>Our reputation across ${h.region} is built on honest diagnostics, transparent pricing, and repairs that last. Every washing machine repair includes our 90-day parts and labour warranty. If the same fault recurs within 90 days, we return at no charge. Technicians are licensed and insured with specific training on ${h.secondary_brands} platform models.</p>
<ul>
<li>Same-day service available Monday through Saturday — call before 2 PM</li>
<li>$89 diagnostic fee credited toward the repair if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians with brand-specific training</li>
<li>OEM and manufacturer-equivalent parts stocked on every van</li>
<li>Written quote before work begins — no surprises</li>
</ul>

<h2>Washing Machine Maintenance Tips for ${h.label} Residents</h2>
<p>Regular maintenance prevents most common washer failures and extends machine life significantly:</p>
<ul>
${maintTips}
</ul>
<p>Questions about washer maintenance? Call us at (437) 524-1053 — we'll walk you through it.</p>

    <h2>${s.warningSignsLabel}</h2>
    <p>Watch for these signs that your washing machine needs professional attention:</p>
    <ul>
${warningSigns}
    </ul>`,

    'dryer-repair': `
<h2>Dryer Repair in ${h.label} — Fast Service in ${h.region}</h2>
<p>${h.label} is a ${h.demo}. The neighbourhood's ${h.housing} means dryers here range from stacked apartment units to standalone laundry room setups in larger homes. ${h.secondary_brands} dryers are the most common models we service in this area. A failed dryer means wet laundry, laundromat trips, and real inconvenience — fast repair is the priority.</p>
<p>${h.unique1}</p>

<h2>Why ${h.label} Homes Need Specialized Dryer Service</h2>
<p>${h.unique2}</p>
<p>Dryers in ${h.label} face specific challenges based on the housing stock and installation configurations here. The most critical issue we encounter is clogged exhaust ducting — lint accumulates in the duct over time, restricting airflow, increasing drying times, and in severe cases creating a fire hazard. We inspect and clear exhaust ducts as part of every dryer service call.</p>

<h2>Common Dryer Failures in ${h.label}</h2>
<p>The dryer faults we encounter most in ${h.label} reflect the specific appliance brands and building types here. Heating element failure is the number-one call in electric dryers — the element burns out, usually due to sustained operation with a partially blocked vent that caused overheating. We replace the element and check the full exhaust pathway before the repair is complete.</p>
<p>${h.unique3}</p>
<p>Drum bearing and felt seal wear is the second most common failure — the drum loses its smooth rotation surface, producing a loud squealing or thumping sound during operation. Catching bearing wear early means a clean replacement; delayed repair can score the drum shaft and require significantly more extensive work.</p>

<h2>How We Serve ${h.label}</h2>
<p>Our vans arrive at ${h.label} addresses stocked with parts for ${h.secondary_brands} dryers — heating elements, thermal fuses, thermostats, drum bearings, felt seals, idler pulleys, and drive belts. Most dryer repairs in ${h.label} complete in a single 1–2 hour visit. For specialty or gas dryer components, we can source OEM parts and return within 24 hours.</p>
<p>Parking and building access in ${h.label} requires advance planning in some locations. Our technicians know the area and plan accordingly — we call ahead so access is ready when we arrive on ${h.streets.split(',')[0]} and surrounding streets.</p>

<h2>Why Choose N Appliance Repair for Dryer Repair in ${h.label}</h2>
<p>We bring the same standards to every ${h.label} dryer repair: arrive on time, diagnose accurately, quote transparently, and back the work with our 90-day parts and labour warranty. Our technicians are licensed, insured, and experienced with the specific dryer models common in ${h.label}'s ${h.housing.split(',')[0]}.</p>
<ul>
<li>Same-day service Monday through Saturday — call before 2 PM</li>
<li>$89 diagnostic fee applied to the repair cost if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians with brand-specific training</li>
<li>OEM-quality parts stocked on every van</li>
<li>Written quote before work begins — no hidden fees</li>
</ul>

<h2>Dryer Maintenance Tips for ${h.label} Residents</h2>
<p>Consistent maintenance prevents the most common dryer failures and eliminates fire risk from lint accumulation:</p>
<ul>
${maintTips}
</ul>
<p>Questions about dryer maintenance or duct cleaning? Call (437) 524-1053 anytime.</p>

    <h2>${s.warningSignsLabel}</h2>
    <p>Watch for these signs that your dryer needs professional attention:</p>
    <ul>
${warningSigns}
    </ul>`,

    'dishwasher-repair': `
<h2>Dishwasher Repair in ${h.label} — Professional Service in ${h.region}</h2>
<p>${h.label} is a ${h.demo}. The neighbourhood's ${h.housing} brings a specific mix of dishwasher models — ${h.secondary_brands} units are most common, though older and premium brands appear regularly. A broken dishwasher means hand-washing every meal, standing water in the tub, or water damage to cabinetry if a leak goes unnoticed. Fast repair protects both convenience and your kitchen.</p>
<p>${h.unique1}</p>

<h2>Why ${h.label} Kitchens Need Specialized Dishwasher Service</h2>
<p>${h.unique2}</p>
<p>Dishwashers in ${h.label} encounter specific issues tied to local water quality and cooking habits. Toronto's water supply has sufficient mineral content to cause limescale buildup in spray arm jets, heating elements, and wash pumps within 12–18 months — particularly noticeable in households that don't use rinse aid regularly. We inspect and descale key components during every diagnostic visit.</p>

<h2>Common Dishwasher Failures in ${h.label}</h2>
<p>The dishwasher problems we encounter most in ${h.label} reflect the area's specific brands and usage intensity. Drain pump failure is the leading cause of service calls — food particles and broken glass clog the pump impeller or burn out the motor, leaving standing water in the tub after cycles complete. We carry drain pumps for all common brands on every van.</p>
<p>${h.unique3}</p>
<p>Door gasket deterioration is the second most common issue — the rubber seal loses elasticity over time, allowing water to seep under the door and pool on the kitchen floor. Gasket failure is often missed until the water damage becomes visible. We check the door seal on every service visit and can replace it quickly with OEM-matched gaskets.</p>

<h2>How We Serve ${h.label}</h2>
<p>Our technicians arrive at ${h.label} addresses with parts most needed for ${h.secondary_brands} dishwashers — drain pumps, wash pumps, door gaskets, control boards, door latches, spray arms, and heating elements. Most dishwasher repairs complete in a single 45-minute to 90-minute visit. For specialty components, we can source and return within 24–48 hours.</p>
<p>We understand the access logistics in ${h.label} — whether that means parking on ${h.streets.split(',')[0]}, coordinating with building concierge, or managing tight kitchen layouts. Our technicians plan for the specifics of every service call in this neighbourhood.</p>

<h2>Why Choose N Appliance Repair for Dishwasher Repair in ${h.label}</h2>
<p>Every dishwasher repair we complete in ${h.label} comes with our 90-day parts and labour warranty, OEM-quality components, and a written quote before work begins. Our technicians are licensed, insured, and experienced with the brands and installation types common in ${h.label}'s ${h.housing.split(',')[0]}.</p>
<ul>
<li>Same-day service Monday through Saturday — call before 2 PM</li>
<li>$89 diagnostic fee credited toward the repair if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians</li>
<li>OEM-quality parts stocked on every van</li>
<li>Written quote before work begins — no surprises</li>
</ul>

<h2>Dishwasher Maintenance Tips for ${h.label} Residents</h2>
<p>Regular maintenance prevents the most common dishwasher failures and keeps wash quality high:</p>
<ul>
${maintTips}
</ul>
<p>Need help with dishwasher maintenance in ${h.label}? Call (437) 524-1053 and we'll walk you through it.</p>

    <h2>${s.warningSignsLabel}</h2>
    <p>Watch for these signs that your dishwasher needs professional attention:</p>
    <ul>
${warningSigns}
    </ul>`,

    'oven-repair': `
<h2>Oven Repair in ${h.label} — Professional Service for ${h.region} Kitchens</h2>
<p>${h.label} is a ${h.demo}. The neighbourhood's ${h.housing} brings a diverse oven mix — from entry-level electric ranges to premium ${h.secondary_brands} built-in wall ovens. A broken oven disrupts meal preparation entirely, and in homes where cooking is a daily priority, fast professional repair is essential.</p>
<p>${h.unique1}</p>

<h2>Why ${h.label} Kitchens Need Specialized Oven Repair</h2>
<p>${h.unique2}</p>
<p>Ovens in ${h.label} encounter specific failure modes tied to usage intensity and housing stock age. High-frequency baking and roasting accelerates wear on bake elements, temperature sensors, and control boards. In older homes with original wiring, voltage fluctuations can damage electronic oven controls over time — a subtler cause of control board failure that requires a proper electrical assessment before repair.</p>

<h2>Common Oven Failures in ${h.label}</h2>
<p>The oven faults we see most in ${h.label} reflect the specific appliance brands and cooking habits in the neighbourhood. Bake element failure is the most common call — the element develops a visible break or blisters, losing continuity and leaving the oven cold or heating only from the broil element above. Replacement is straightforward when caught early.</p>
<p>${h.unique3}</p>
<p>Temperature sensor drift is the second most frequent issue — the oven reads and heats correctly but the actual temperature is off by 15–50°F, causing baked goods to come out wrong or cooking times to be unpredictable. Calibration adjustment fixes minor drift; sensor replacement corrects larger deviations.</p>

<h2>How We Serve ${h.label}</h2>
<p>Our technicians arrive at ${h.label} with parts for ${h.secondary_brands} ovens — bake elements, broil elements, temperature sensors, igniters, control boards, and door gaskets. Most oven repairs in ${h.label} complete in a single 1–2 hour visit. For specialty wall oven or range components, we can source and return within 24–48 hours with OEM parts.</p>
<p>We handle the logistics of ${h.label} access — parking on ${h.streets.split(',')[0]}, building entry coordination, and tight kitchen layouts. Our technicians call 15 minutes before arrival and plan access in advance.</p>

<h2>Why Choose N Appliance Repair for Oven Repair in ${h.label}</h2>
<p>Every oven repair in ${h.label} includes our 90-day parts and labour warranty, OEM-quality components, and a clear written quote before any work begins. Our technicians are licensed and insured with specific training on the oven brands common in ${h.label}.</p>
<ul>
<li>Same-day service Monday through Saturday — call before 2 PM</li>
<li>$89 diagnostic fee credited toward the repair if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians</li>
<li>OEM-quality parts stocked on every van</li>
<li>Written quote before work begins — no hidden fees</li>
</ul>

<h2>Oven Maintenance Tips for ${h.label} Residents</h2>
<p>Consistent maintenance prevents most oven failures and keeps cooking performance reliable:</p>
<ul>
${maintTips}
</ul>
<p>Questions about oven care in ${h.label}? Call (437) 524-1053 — we're happy to help.</p>

    <h2>${s.warningSignsLabel}</h2>
    <p>Watch for these signs that your oven needs professional attention:</p>
    <ul>
${warningSigns}
    </ul>`,

    'stove-repair': `
<h2>Stove Repair in ${h.label} — Fast, Reliable Service in ${h.region}</h2>
<p>${h.label} is a ${h.demo}. The neighbourhood's ${h.housing} brings a diverse range of cooking equipment — from classic coil-element electric stoves to ${h.secondary_brands} gas ranges. A broken stove means no meals cooked at home, and in a neighbourhood where home cooking is a daily priority, repair speed matters.</p>
<p>${h.unique1}</p>

<h2>Why ${h.label} Kitchens Need Specialized Stove Repair</h2>
<p>${h.unique2}</p>
<p>Stoves in ${h.label} encounter specific failure patterns tied to cooking intensity and housing type. High-frequency use of gas burners — particularly in homes where cooking is central to daily life — accelerates wear on igniter tips, burner caps, and igniter electrode assemblies. Grease and food spill contamination of igniter components is the leading cause of burner ignition failure we see in this neighbourhood.</p>

<h2>Common Stove Failures in ${h.label}</h2>
<p>The stove problems we encounter most in ${h.label} reflect the specific brands and cooking habits of this community. Gas burner ignition failure is the top call — the spark igniter fires continuously without lighting the burner, or doesn't fire at all. The cause is usually a contaminated or cracked igniter tip, a faulty spark module, or a misaligned burner cap after cleaning. We resolve most ignition issues in a single visit.</p>
<p>${h.unique3}</p>
<p>Infinite switch failure is the second most common stove fault — the switch that controls electric burner heat level sticks at maximum, minimum, or off, making precise temperature control impossible. Switch replacement is a straightforward part swap that restores full function. We carry switches for all common brands on every service van.</p>

<h2>How We Serve ${h.label}</h2>
<p>Our technicians arrive at ${h.label} addresses with parts for ${h.secondary_brands} stoves and ranges — igniters, spark modules, infinite switches, gas valves, bake elements, and control boards. Most stove repairs in ${h.label} complete in a single 45-minute to 90-minute visit. For specialty or induction cooktop components, we source OEM parts and return within 24–48 hours.</p>
<p>Access and parking in ${h.label} requires advance planning in many locations. We know ${h.streets} well and plan every service call to arrive efficiently. We call 15 minutes before arrival so you're ready when our technician gets there.</p>

<h2>Why Choose N Appliance Repair for Stove Repair in ${h.label}</h2>
<p>Every stove repair in ${h.label} includes our 90-day parts and labour warranty, genuine OEM or equivalent parts, and a written quote before work begins. Our technicians are licensed, insured, and trained on gas and electric stove platforms common in ${h.label}.</p>
<ul>
<li>Same-day service Monday through Saturday — call before 2 PM</li>
<li>$89 diagnostic fee credited toward the repair if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians — certified for gas appliances</li>
<li>OEM-quality parts stocked on every van</li>
<li>Written quote before work begins — no surprises</li>
</ul>

<h2>Stove Maintenance Tips for ${h.label} Residents</h2>
<p>Consistent care prevents ignition failures and extends stove life significantly:</p>
<ul>
${maintTips}
</ul>
<p>Questions about stove maintenance in ${h.label}? Call (437) 524-1053 anytime.</p>

    <h2>${s.warningSignsLabel}</h2>
    <p>Watch for these signs that your stove needs professional attention:</p>
    <ul>
${warningSigns}
    </ul>`,
  };

  return `
  <!-- Content Intro -->
  <div class="content-intro fade-in">
${introBlocks[svc]}
  </div>

  <!-- Service Details -->
  <section class="service-details fade-in" aria-label="Common problems and pricing">
    <div class="section-label">Common issues</div>
    <h2 class="section-title">Common ${s.Appliance} Problems We Fix in ${h.label}</h2>
    <div class="problems-grid">${problemCards}
    </div>

    <div class="section-label" style="margin-top: 48px;">Pricing</div>
    <h2 class="section-title">${s.Appliance} Repair Cost in ${h.label}</h2>
    <table class="pricing-table" aria-label="Repair pricing">
      <thead>
        <tr>
          <th>Repair Type</th>
          <th>Typical Cost</th>
        </tr>
      </thead>
      <tbody>${pricingRows}
      </tbody>
    </table>
    <p class="pricing-note">All prices include OEM parts and labour. Firm written quote provided before any work begins.</p>
  </section>

  <!-- Booking Section -->
  <section class="booking-section fade-in" aria-label="Book your repair">
    <div class="section-label">Online booking</div>
    <h2>Book ${s.Appliance} Repair in ${h.label}</h2>
    <p>Choose a convenient time &mdash; real-time availability, instant confirmation, no commitment required.</p>
    <iframe
      src="https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce?embed=true"
      title="Book ${s.Appliance} Repair in ${h.label}"
      loading="lazy"
    ></iframe>
    <p class="booking-alt">Prefer to call? <a href="tel:+14375241053">(437) 524-1053</a> &mdash; Mon&ndash;Sat 8am&ndash;8pm, Sun 9am&ndash;6pm</p>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section fade-in" aria-label="Frequently asked questions">
    <div class="container" style="padding:0;">
      <h2>Frequently Asked Questions About ${s.Appliance} Repair in ${h.label}</h2>
      <div class="faq-list">${faqHTML}
      </div>
    </div>
  </section>

  <!-- Related Links -->
  <section class="related-links fade-in" aria-label="Related pages">
    <div class="related-links-grid">
      <div class="related-col">
        <h3>Other Services in ${h.label}</h3>
        <ul class="related-list">
${otherServicesLinks}
        </ul>
      </div>
      <div class="related-col">
        <h3>${s.nearbyLabel} Nearby</h3>
        <ul class="related-list">
${nearbyLinks}
        </ul>
      </div>
      <div class="related-col">
        <h3>Brands We Service</h3>
        <ul class="related-list">
<li><a href="/samsung-repair">Samsung</a></li>
<li><a href="/lg-repair">LG</a></li>
<li><a href="/whirlpool-repair">Whirlpool</a></li>
<li><a href="/ge-repair">GE</a></li>
<li><a href="/bosch-repair">Bosch</a></li>
<li><a href="/frigidaire-repair">Frigidaire</a></li>
<li><a href="/kenmore-repair">Kenmore</a></li>
<li><a href="/maytag-repair">Maytag</a></li>
<li><a href="/kitchenaid-repair">KitchenAid</a></li>
        </ul>
      </div>
    </div>
  </section>`;
}

// ─── Full page template ───────────────────────────────────────────────────
function makePage(svc, hood) {
  const h = hoods[hood];
  const s = services[svc];
  const slug = `${svc}-${hood}`;
  const canonical = `https://nappliancerepair.com/${slug}`;
  const title = `${s.Appliance} Repair ${h.label} | N Appliance Repair`;
  const metaDesc = `Expert ${s.appliance} repair in ${h.label}, ${h.region}. Same-day service. Licensed technicians. Call (437) 524-1053. $89 diagnostic fee.`;
  const breadcrumbServiceLabel = s.label;
  const breadcrumbServiceHref = `/${svc}`;
  const schema = makeSchema(svc, hood);
  const content = makeContent(svc, hood);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${metaDesc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">

<script type="application/ld+json">${schema}</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #FFFFFF;
  color: #0A0A0A;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; }
button, input, select, textarea { font-family: inherit; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { padding: 14px 0; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; }
.breadcrumb .container { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.breadcrumb a { font-size: 0.8125rem; font-weight: 500; color: #6B7280; transition: color 0.15s; }
.breadcrumb a:hover { color: #2563EB; }
.breadcrumb-sep { font-size: 0.8125rem; color: #D1D5DB; }
.breadcrumb-current { font-size: 0.8125rem; font-weight: 600; color: #0A0A0A; }
.page-hero { padding: 56px 0 48px; background: #FFFFFF; border-bottom: 1px solid #E5E7EB; }
.page-hero .container { max-width: 800px; }
.page-hero-eyebrow { display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #2563EB; margin-bottom: 16px; }
.page-hero-eyebrow::before { content: ''; display: block; width: 16px; height: 2px; background: #2563EB; }
h1.page-h1 { font-size: clamp(1.875rem, 4vw, 2.75rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; color: #0A0A0A; margin-bottom: 24px; }
.answer-box { background: #F0F9FF; border-left: 3px solid #2563EB; border-radius: 0 6px 6px 0; padding: 20px 24px; margin-bottom: 32px; font-size: 1rem; color: #1E40AF; line-height: 1.7; font-weight: 500; }
.page-hero-ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #2563EB; color: #FFFFFF; font-size: 1rem; font-weight: 700; padding: 14px 24px; border-radius: 4px; text-decoration: none; letter-spacing: -0.01em; transition: background 0.15s ease; white-space: nowrap; }
.btn-primary:hover { background: #1D4ED8; }
.btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: #FFFFFF; color: #2563EB; font-size: 1rem; font-weight: 700; padding: 13px 22px; border-radius: 4px; border: 1.5px solid #2563EB; text-decoration: none; letter-spacing: -0.01em; transition: background 0.15s ease; white-space: nowrap; }
.btn-secondary:hover { background: #EFF6FF; }
.trust-bar { background: #0A0A0A; padding: 14px 0; }
.trust-bar-inner { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0; }
.trust-item { display: flex; align-items: center; gap: 8px; padding: 4px 24px; border-right: 1px solid rgba(255,255,255,0.1); font-size: 0.8125rem; font-weight: 600; color: rgba(255,255,255,0.9); white-space: nowrap; }
.trust-item:last-child { border-right: none; }
.trust-item-icon { font-size: 1rem; }
.section-label { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #2563EB; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.section-label::after { content: ''; flex: 1; height: 1px; background: #E5E7EB; max-width: 40px; }
.section-title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; letter-spacing: -0.03em; color: #0A0A0A; line-height: 1.15; margin-bottom: 16px; }
.section-sub { font-size: 1rem; color: #6B7280; line-height: 1.65; max-width: 560px; }
main.page-main { padding: 56px 0 0; }
.content-intro { max-width: 760px; font-size: 1.0625rem; color: #374151; line-height: 1.75; margin-bottom: 56px; }
.content-intro h2 { font-size: 1.375rem; font-weight: 700; color: #0A0A0A; letter-spacing: -0.02em; margin-top: 32px; margin-bottom: 12px; }
.content-intro p { margin-bottom: 16px; }
.content-intro ul { margin: 16px 0; padding-left: 0; list-style: none; }
.content-intro ul li { padding: 6px 0 6px 20px; position: relative; font-size: 1rem; color: #374151; }
.content-intro ul li::before { content: '\\2014'; position: absolute; left: 0; color: #2563EB; font-weight: 700; }
.service-details { padding: 48px 0; border-top: 1px solid #E5E7EB; }
.problems-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: #E5E7EB; border: 1px solid #E5E7EB; border-radius: 4px; overflow: hidden; margin-top: 32px; max-width: 760px; }
.problem-card { background: #FFFFFF; padding: 20px 20px; transition: background 0.15s; }
.problem-card:hover { background: #F8FAFF; }
.problem-name { font-size: 0.9375rem; font-weight: 700; color: #0A0A0A; margin-bottom: 4px; letter-spacing: -0.01em; }
.problem-desc { font-size: 0.8125rem; color: #6B7280; line-height: 1.5; }
.pricing-table { width: 100%; max-width: 640px; border-collapse: collapse; margin-top: 32px; border: 1px solid #E5E7EB; border-radius: 4px; overflow: hidden; }
.pricing-table th { background: #F9FAFB; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6B7280; padding: 12px 16px; text-align: left; border-bottom: 1px solid #E5E7EB; }
.pricing-table td { font-size: 0.9rem; color: #374151; padding: 14px 16px; border-bottom: 1px solid #F3F4F6; line-height: 1.5; }
.pricing-table tr:last-child td { border-bottom: none; }
.pricing-table td:last-child { font-weight: 700; color: #0A0A0A; white-space: nowrap; }
.pricing-note { font-size: 0.875rem; color: #9CA3AF; margin-top: 12px; }
.booking-section { padding: 56px 0; border-top: 1px solid #E5E7EB; }
.booking-section h2 { font-size: clamp(1.375rem, 2.5vw, 1.875rem); font-weight: 700; letter-spacing: -0.03em; color: #0A0A0A; margin-bottom: 8px; }
.booking-section p { font-size: 0.9375rem; color: #6B7280; margin-bottom: 28px; line-height: 1.65; }
.booking-section iframe { width: 100%; min-height: 620px; border: none; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
.booking-alt { margin-top: 14px; font-size: 0.875rem; color: #9CA3AF; text-align: center; }
.booking-alt a { color: #2563EB; font-weight: 700; }
.faq-section { padding: 56px 0; border-top: 1px solid #E5E7EB; background: #FAFAFA; }
.faq-section h2 { font-size: clamp(1.375rem, 2.5vw, 1.875rem); font-weight: 700; letter-spacing: -0.03em; color: #0A0A0A; margin-bottom: 32px; }
.faq-list { max-width: 760px; }
.faq-item { border-bottom: 1px solid #E5E7EB; }
.faq-question { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; cursor: pointer; gap: 16px; list-style: none; user-select: none; }
.faq-question::-webkit-details-marker { display: none; }
.faq-q-text { font-size: 0.9375rem; font-weight: 600; color: #0A0A0A; line-height: 1.5; letter-spacing: -0.01em; }
.faq-icon { width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #2563EB; font-size: 1.25rem; font-weight: 400; transition: transform 0.2s ease; line-height: 1; }
details[open] .faq-icon { transform: rotate(45deg); }
.faq-answer { padding: 0 0 20px; font-size: 0.9rem; color: #4B5563; line-height: 1.7; }
.related-links { padding: 56px 0; border-top: 1px solid #E5E7EB; }
.related-links-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 48px; }
.related-col h3 { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #9CA3AF; margin-bottom: 16px; }
.related-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.related-list a { display: inline-flex; font-size: 0.875rem; font-weight: 600; color: #2563EB; border: 1px solid #BFDBFE; border-radius: 4px; padding: 5px 12px; background: #EFF6FF; text-decoration: none; transition: background 0.15s, border-color 0.15s; }
.related-list a:hover { background: #DBEAFE; border-color: #93C5FD; }
#sticky-bottom { position: fixed; bottom: -80px; left: 0; right: 0; z-index: 999; background: #0A0A0A; padding: 14px 24px; display: flex; align-items: center; justify-content: center; gap: 16px; transition: bottom 0.3s ease; }
#sticky-bottom.visible { bottom: 0; }
.sticky-label { font-size: 0.875rem; color: rgba(255,255,255,0.7); }
.sticky-phone { display: inline-flex; align-items: center; gap: 8px; background: #2563EB; color: #FFFFFF; font-size: 0.9375rem; font-weight: 700; padding: 10px 20px; border-radius: 4px; text-decoration: none; transition: background 0.15s; }
.sticky-phone:hover { background: #1D4ED8; }
.fade-in { opacity: 0; transition: opacity 0.35s ease; }
.fade-in.visible { opacity: 1; }
@media (max-width: 1024px) { .related-links-grid { grid-template-columns: 1fr; gap: 32px; } }
@media (max-width: 768px) { .trust-item { padding: 4px 14px; } .problems-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .page-hero { padding: 40px 0 36px; } h1.page-h1 { font-size: 1.75rem; } .page-hero-ctas { flex-direction: column; align-items: flex-start; } .trust-bar-inner { justify-content: flex-start; overflow-x: auto; padding: 0 24px; } .trust-item { border-right: none; padding: 4px 20px 4px 0; } .sticky-label { display: none; } }
</style>
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="N Appliance Repair">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${metaDesc}">
</head>
<body>

<!-- Header -->
<div id="header-placeholder"></div>
<script src="/includes/header-loader.js" defer></script>

<!-- Breadcrumb -->
<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container"><ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList" style="display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0;">
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a href="/" itemprop="item"><span itemprop="name">Home</span></a>
    <meta itemprop="position" content="1">
  </li>
  <span class="breadcrumb-sep" aria-hidden="true">/</span>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a href="${breadcrumbServiceHref}" itemprop="item"><span itemprop="name">${breadcrumbServiceLabel}</span></a>
    <meta itemprop="position" content="2">
  </li>
  <span class="breadcrumb-sep" aria-hidden="true">/</span>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span class="breadcrumb-current" itemprop="name">${h.label}</span>
    <meta itemprop="position" content="3">
  </li>
</ol></div>
</nav>

<!-- Page Hero -->
<section class="page-hero" aria-label="Page header">
  <div class="container">
    <div class="page-hero-eyebrow">N Appliance Repair &middot; ${h.label}, ${h.region}</div>
    <h1 class="page-h1">${s.Appliance} Repair in ${h.label}</h1>
    <div class="answer-box">Need ${s.appliance} repair in ${h.label}? N Appliance Repair serves ${h.label} with same-day service &mdash; call (437) 524-1053, available Mon&ndash;Sat 8am&ndash;8pm, Sun 9am&ndash;6pm. Flat $89 diagnostic fee.</div>
    <div class="page-hero-ctas">
      <a href="tel:+14375241053" class="btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Call (437) 524-1053
      </a>
      <a href="https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce" class="btn-secondary" target="_blank" rel="noopener">
        Book Online &rarr;
      </a>
    </div>
  </div>
</section>

<!-- Trust Bar -->
<div class="trust-bar" role="complementary" aria-label="Trust signals">
  <div class="trust-bar-inner">
    <div class="trust-item"><span class="trust-item-icon">&#11088;</span> 4.9/5 Rating &middot; 5,200+ Reviews</div>
    <div class="trust-item">&#10003; 90-Day Warranty</div>
    <div class="trust-item">&#9873; Same-Day Available</div>
    <div class="trust-item">&#128737; Licensed &amp; Insured</div>
  </div>
</div>

<!-- Main Content -->
<main class="page-main container" id="main-content">
${content}

</main>

<!-- Sticky Bottom Bar -->
<div id="sticky-bottom" role="complementary" aria-label="Quick call bar">
  <span class="sticky-label">${s.Appliance} repair in ${h.label} &mdash;</span>
  <a href="tel:+14375241053" class="sticky-phone" aria-label="Call N Appliance Repair">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    (437) 524-1053
  </a>
</div>

<!-- Footer -->
<div id="footer-placeholder"></div>
<script src="/includes/footer-loader.js" defer></script>

<!-- Page JS -->
<script defer>
(function () {
  'use strict';
  var hero = document.querySelector('.page-hero');
  var stickyBar = document.getElementById('sticky-bottom');
  function onScroll() {
    if (!hero || !stickyBar) return;
    var rect = hero.getBoundingClientRect();
    if (rect.bottom < 0) { stickyBar.classList.add('visible'); }
    else { stickyBar.classList.remove('visible'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }
}());
</script>

</body>
</html>`;
}

// ─── Generate all 60 files ────────────────────────────────────────────────
const outDir = path.resolve(__dirname);
let count = 0;
const created = [];

for (const svc of serviceSlugs) {
  for (const hood of hoodSlugs) {
    const filename = `${svc}-${hood}.html`;
    const filepath = path.join(outDir, filename);
    const html = makePage(svc, hood);
    fs.writeFileSync(filepath, html, 'utf8');
    count++;
    created.push(filename);
    process.stdout.write(`[${count}/60] Created: ${filename}\n`);
  }
}

console.log(`\nDone. ${count} files created in ${outDir}`);
