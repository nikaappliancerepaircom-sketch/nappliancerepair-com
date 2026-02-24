const fs = require('fs');
const path = require('path');

// ── Configuration ──
const PHONE = '(437) 524-1053';
const PHONE_TEL = '+14375241053';
const BRAND = 'N Appliance Repair';
const BOOKING_URL = 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce';
const DOMAIN = 'https://nappliancerepair.com';

// ── Neighbourhoods ──
const neighbourhoods = [
  {
    slug: 'willowdale',
    name: 'Willowdale',
    parent: 'North York',
    housing: '1980s-2000s condos, townhouses, and detached homes along the Yonge-Sheppard corridor',
    community: 'a large Korean-Canadian community and young professionals',
    brands: 'LG and Samsung',
    brandsList: 'LG, Samsung, Whirlpool, Bosch',
    streets: 'Yonge and Sheppard, Beecroft Road, and Doris Avenue',
    housing_detail: 'Willowdale\'s residential landscape is defined by the Yonge-Sheppard growth centre — a dense cluster of 30-to-50-storey condominium towers built between 2005 and 2020, surrounded by older 1980s low-rise apartments and post-war detached bungalows on quiet streets like Empress Avenue and Church Avenue. The condo towers house compact European-style kitchens where space is at a premium, while the bungalows feature full-size North American appliance layouts.',
    special_note: 'High-rise buildings in Willowdale require elevator-aware service — our technicians coordinate freight elevator bookings and carry compact tool kits that fit passenger elevators when freight access is unavailable.',
    water: 'Willowdale draws from the same Lake Ontario municipal supply as the rest of Toronto, and the calcium content causes mineral buildup inside dishwasher spray arms, washing machine inlet screens, and refrigerator water dispensers within 12-18 months of installation.',
    parking: 'Street parking around Yonge and Sheppard is metered and limited during rush hours. Our vans use the visitor parking garages available in most Willowdale condos — we ask customers to register our plate with concierge ahead of time to avoid delays.',
  },
  {
    slug: 'bayview-village',
    name: 'Bayview Village',
    parent: 'North York',
    housing: '1950s-1980s detached brick homes on generous lots',
    community: 'affluent professionals and retirees who have lived here for decades',
    brands: 'Maytag, Whirlpool, and KitchenAid',
    brandsList: 'Maytag, Whirlpool, KitchenAid, Bosch',
    streets: 'Bayview Avenue, Sheppard Avenue East, and the streets around Bayview Village Shopping Centre',
    housing_detail: 'Bayview Village is one of North York\'s most established residential enclaves, with generous single-family lots laid out in the 1950s through 1970s. The detached brick homes here feature full basements, separate laundry rooms, and spacious kitchens designed for full-size appliances. Many homes have been tastefully renovated over the decades while maintaining their original footprint, meaning the appliance bays and plumbing stacks date to the original construction.',
    special_note: 'Many Bayview Village homes still run appliances that are 15-25 years old — Maytag top-load washers, KitchenAid dishwashers, and Whirlpool side-by-side refrigerators. These homeowners strongly prefer repair over replacement, and we stock legacy parts for these older models.',
    water: 'The mature trees and older plumbing infrastructure in Bayview Village mean water pressure can fluctuate seasonally, which stresses washing machine inlet valves and dishwasher fill cycles. We check water pressure as part of every diagnostic here.',
    parking: 'Most Bayview Village homes have private driveways, making service access straightforward. We can park our van directly in the driveway and bring tools and parts to the door without navigating building lobbies or elevators.',
  },
  {
    slug: 'don-mills',
    name: 'Don Mills',
    parent: 'North York',
    housing: 'a pioneering mix of apartments, townhouses, and detached homes from Canada\'s first master-planned suburb',
    community: 'many long-term residents and seniors who value reliable service',
    brands: 'GE, Whirlpool, and Kenmore',
    brandsList: 'GE, Whirlpool, Kenmore, Frigidaire',
    streets: 'Don Mills Road, Lawrence Avenue East, and the winding crescents of the original Macklin Hancock plan',
    housing_detail: 'Don Mills holds the distinction of being Canada\'s first planned suburban community, designed by Macklin Hancock in the 1950s with a modernist vision of curving streets, cul-de-sacs, and integrated green spaces. The original housing stock includes split-level detached homes, row townhouses, and low-rise apartment buildings, all featuring appliance layouts typical of mid-century Canadian design — dedicated laundry rooms in basements, galley kitchens with built-in dishwashers, and separate utility areas.',
    special_note: 'Many seniors in Don Mills have appliances dating from the 1990s and early 2000s — GE Profile refrigerators, Kenmore Elite washers, and Whirlpool dishwashers that were top-of-the-line when purchased. We carry parts for these older models and understand the value of extending their life rather than forcing an expensive replacement.',
    water: 'Don Mills\' original 1950s plumbing infrastructure has been updated at different rates across the neighbourhood. Some homes still have copper supply lines with decades of mineral accumulation that restricts flow to appliances, causing slow-fill issues in dishwashers and washers.',
    parking: 'The winding crescents and generous setbacks of Don Mills make parking and access easy for service vehicles. We navigate the neighbourhood\'s unique layout daily and know where to find each address without GPS confusion from the curved street grid.',
  },
  {
    slug: 'forest-hill',
    name: 'Forest Hill',
    parent: 'Toronto',
    housing: 'prestigious Victorian and Tudor homes valued at $2M and above',
    community: 'established families and professionals in one of Toronto\'s most desirable residential areas',
    brands: 'Miele, Sub-Zero, Wolf, and Bosch',
    brandsList: 'Miele, Sub-Zero, Wolf, Bosch, Thermador',
    streets: 'Spadina Road, Old Forest Hill Road, Russell Hill Road, and Lonsdale Road',
    housing_detail: 'Forest Hill is defined by stately homes on tree-lined streets — Victorian mansions, Tudor revivals, and Georgian colonials built between the 1910s and 1950s, many of which have undergone multi-million dollar renovations that preserve the heritage exterior while installing contemporary luxury kitchens inside. These kitchens feature integrated panel-ready refrigeration, professional-grade cooking suites, and whisper-quiet dishwashers hidden behind custom cabinetry.',
    special_note: 'Forest Hill homeowners invest heavily in premium appliances and always choose repair over replacement. A Sub-Zero refrigerator costs $12,000-$20,000 to replace; a compressor repair costs a fraction of that. We carry Miele, Sub-Zero, and Wolf diagnostic equipment and genuine OEM parts for same-day repair of these premium brands.',
    water: 'Forest Hill\'s older homes often have original cast-iron drain stacks that develop interior scale over decades. This scale can cause slow drainage that backs up into dishwashers and washing machines, creating fault codes that mimic internal appliance failures. We check drain flow rate before diagnosing the appliance itself.',
    parking: 'Forest Hill\'s residential streets allow free parking during the day. The wide lots and circular driveways in many homes give us excellent access. We take care to protect landscaping and use drop cloths on hardwood and stone flooring throughout the service.',
  },
  {
    slug: 'rosedale',
    name: 'Rosedale',
    parent: 'Toronto',
    housing: 'Toronto\'s most prestigious Victorian and Edwardian mansions on winding ravine-edge streets',
    community: 'long-established families in one of Canada\'s wealthiest residential neighbourhoods',
    brands: 'Miele, Sub-Zero, Wolf, and Gaggenau',
    brandsList: 'Miele, Sub-Zero, Wolf, Gaggenau, Thermador',
    streets: 'Crescent Road, Cluny Drive, Elm Avenue, and the streets winding through the Rosedale Ravine',
    housing_detail: 'Rosedale\'s homes are among the most architecturally significant in Canada — grand Victorian, Edwardian, and Arts and Crafts mansions built between the 1860s and 1930s, set on large lots that back onto the Rosedale Ravine system. Many have been renovated by award-winning architects who blend heritage details with state-of-the-art kitchens featuring fully integrated appliance suites concealed behind period-appropriate millwork.',
    special_note: 'In Rosedale, the value of the home always justifies repairing rather than replacing premium appliances. A Gaggenau cooktop or Wolf range represents a deliberate design choice integrated into custom cabinetry — replacement is not just expensive, it requires kitchen renovation. We provide white-glove service appropriate to these homes, including floor protection, careful handling of custom panels, and thorough cleanup.',
    water: 'Rosedale\'s proximity to the ravine system means some homes experience seasonal groundwater fluctuations that affect basement humidity levels, which can accelerate rust on dryer drum bearings and cause premature failure of washing machine suspension springs in basement laundry rooms.',
    parking: 'Rosedale\'s winding streets have limited parking, but most homes have driveways or garages. We confirm parking arrangements when booking and arrive prepared with all tools and anticipated parts to minimize trips to the van.',
  },
  {
    slug: 'the-annex',
    name: 'The Annex',
    parent: 'Toronto',
    housing: 'Victorian and Edwardian semi-detached homes near the University of Toronto',
    community: 'a vibrant mix of homeowners, university professors, and rental tenants in a walkable urban neighbourhood',
    brands: 'GE, Whirlpool, and Samsung',
    brandsList: 'GE, Whirlpool, Samsung, LG, Frigidaire',
    streets: 'Bloor Street West, Spadina Avenue, Bathurst Street, and the residential streets between Dupont and Bloor',
    housing_detail: 'The Annex is one of Toronto\'s most architecturally distinctive neighbourhoods, with blocks of red-brick Victorian and Edwardian semi-detached homes built between 1880 and 1920. Many have been divided into multi-unit rentals on the upper floors while the owner occupies the main level, creating a unique mix of owner-occupied and rental appliance situations. The narrow kitchens of these century-old homes present installation challenges — appliances must be maneuvered through tight doorways and positioned in galley layouts with minimal clearance.',
    special_note: 'The Annex has a high proportion of landlord-owned rental properties, which means we frequently work with both tenants reporting issues and landlords authorizing repairs. We communicate clearly with both parties, provide written quotes that landlords can approve remotely, and schedule around tenant availability.',
    water: 'Many Annex homes retain original lead service lines from the city main to the house, which Toronto is actively replacing under its lead pipe replacement program. Until replaced, these lines can shed particles that clog washing machine inlet screens and refrigerator water filters more quickly than normal.',
    parking: 'Street parking in the Annex is permit-restricted and heavily used. We typically park on the permit-exempt stretches of Bloor or use Green P lots nearby. Our technicians carry tool bags that allow quick walks from parked vans to the service address.',
  },
  {
    slug: 'leslieville',
    name: 'Leslieville',
    parent: 'East Toronto',
    housing: 'renovated workers\' cottages and new-build townhouses in a trendy family-oriented neighbourhood',
    community: 'young families and creative professionals who have transformed this former industrial area into one of Toronto\'s most desirable communities',
    brands: 'LG, Samsung, and Bosch',
    brandsList: 'LG, Samsung, Bosch, Whirlpool, Miele',
    streets: 'Queen Street East, Carlaw Avenue, Leslie Street, and the residential streets between Eastern Avenue and Gerrard',
    housing_detail: 'Leslieville\'s residential character is a mix of lovingly renovated 1900s-era workers\' cottages — small brick houses originally built for factory workers at the nearby industrial plants — and sleek new-construction townhouses and low-rise condos that have appeared since the neighbourhood\'s gentrification accelerated in the 2010s. The renovated cottages feature updated kitchens with modern appliances squeezed into compact layouts, while the new builds come with smart-home-ready LG ThinQ and Samsung SmartThings appliances.',
    special_note: 'Leslieville\'s young families run their washers and dryers heavily — often two or more loads daily with small children in the house. This accelerated usage means washing machine bearings, dryer drum rollers, and dishwasher spray arms wear out faster than average. We see these high-usage failure patterns regularly in Leslieville and stock the parts accordingly.',
    water: 'Leslieville\'s mix of century-old and brand-new plumbing creates variable water pressure on some blocks. Homes that share a municipal lateral with a newly built condo can experience pressure drops during peak usage that trigger low-water-pressure errors in modern smart washers and dishwashers.',
    parking: 'Queen Street East has metered parking and side streets are permit-only. We use the municipal lots near Carlaw and Queen for reliable parking and walk tools to the address. For new-build townhouse complexes, we coordinate visitor parking passes in advance.',
  },
  {
    slug: 'liberty-village',
    name: 'Liberty Village',
    parent: 'Toronto',
    housing: 'dense condominium towers and converted loft buildings in a compact urban neighbourhood',
    community: 'young tech professionals and entrepreneurs in one of Toronto\'s densest residential areas',
    brands: 'Bosch, Samsung, and LG',
    brandsList: 'Bosch, Samsung, LG, Blomberg, Fisher & Paykel',
    streets: 'Liberty Street, King Street West, Atlantic Avenue, and Hanna Avenue',
    housing_detail: 'Liberty Village transformed from an industrial district to a dense residential neighbourhood in the 2000s and 2010s, with dozens of condominium towers and converted factory loft buildings now housing a young, tech-forward population. The condos feature compact European-style kitchens with space-saving appliances — 24-inch Bosch dishwashers, ventless condenser dryers, stacked washer-dryer combos, and counter-depth refrigerators that maximize every square foot of living space.',
    special_note: 'Liberty Village condos overwhelmingly use compact and combination appliances — stacked washer-dryers, 24-inch dishwashers, and apartment-size refrigerators. These compact units require specialized knowledge because their internal layouts differ significantly from full-size appliances. We carry compact-specific parts and have experience with every major compact brand installed in Liberty Village buildings.',
    water: 'Liberty Village\'s relatively new construction means the plumbing is modern, but the building density creates pressure demands on shared water infrastructure. During peak morning hours, water pressure drops in upper-floor units can cause dishwashers and washers to throw fill-timeout errors that resolve themselves by mid-morning.',
    parking: 'Liberty Village has extremely limited street parking. Most buildings have visitor parking that requires advance registration with the concierge. We handle this logistics daily and arrive with all necessary parts to avoid multiple trips through building security.',
  },
  {
    slug: 'riverdale',
    name: 'Riverdale',
    parent: 'East Toronto',
    housing: 'Victorian and Edwardian semi-detached homes in a family-friendly neighbourhood east of the Don Valley',
    community: 'established families and professionals who value the neighbourhood\'s parks, schools, and walkability',
    brands: 'Whirlpool, Maytag, LG, and Samsung',
    brandsList: 'Whirlpool, Maytag, LG, Samsung, Bosch',
    streets: 'Broadview Avenue, Danforth Avenue, Withrow Avenue, and the streets surrounding Riverdale Park and Withrow Park',
    housing_detail: 'Riverdale is one of Toronto\'s most sought-after family neighbourhoods, centred around Riverdale Park and Withrow Park. The housing stock consists primarily of Victorian and Edwardian semi-detached homes built between 1890 and 1920, many of which have undergone extensive renovations that open up the main floor and install modern kitchens while preserving original exterior character. Basements in these homes typically house the laundry, with washer-dryer pairs navigated down narrow century-old staircases.',
    special_note: 'Riverdale homes are being renovated at a rapid pace, and we frequently service both the original appliances in un-renovated homes and brand-new installations in freshly completed kitchen renovations. We understand the quirks of both scenarios — aging plumbing feeding new appliances, and new plumbing connected to appliances that have been moved during renovation.',
    water: 'Riverdale\'s century-old plumbing infrastructure means many homes have galvanized steel supply pipes that have narrowed with decades of mineral buildup. This restricts water flow to washing machines and dishwashers, causing longer fill times, incomplete rinse cycles, and eventual inlet valve strain.',
    parking: 'Residential streets in Riverdale allow daytime parking without permits on most blocks. We park close to the service address and carry tools directly to the door. For homes with rear-entry basements, we access laundry rooms through the back to avoid tracking through the main living areas.',
  },
  {
    slug: 'danforth-village',
    name: 'Danforth Village',
    parent: 'East Toronto',
    housing: 'older 1940s-1960s detached homes in a close-knit community along the eastern Danforth corridor',
    community: 'a large Greek-Canadian community and multi-generational households who take pride in maintaining their homes',
    brands: 'Whirlpool, GE, and Frigidaire',
    brandsList: 'Whirlpool, GE, Frigidaire, Maytag, Kenmore',
    streets: 'Danforth Avenue east of Pape, Woodbine Avenue, Main Street, and the residential streets between Danforth and the rail corridor',
    housing_detail: 'Danforth Village stretches along the eastern section of the Danforth, anchored by the vibrant Greektown strip and extending eastward past Woodbine Avenue. The residential streets are lined with solid 1940s-1960s detached brick homes — two-storey houses with full basements, separate dining rooms, and kitchens designed for the full-size appliances of that era. Many homes have been passed down through families and have seen incremental updates rather than full renovations.',
    special_note: 'Multi-generational households in Danforth Village run their appliances harder than average — larger family meals mean heavier dishwasher and oven use, and bigger households generate more laundry. We see accelerated wear on dishwasher racks, oven igniter assemblies, and washer bearings in these busy homes and stock the high-wear parts accordingly.',
    water: 'Danforth Village\'s post-war plumbing is generally copper, which holds up well over decades. However, the older water heaters common in these homes can deliver inconsistent hot water temperature to dishwashers, causing cleaning performance issues that are sometimes mistaken for dishwasher malfunctions.',
    parking: 'Most Danforth Village homes have private driveways, often with a separate garage at the back of the lot. Parking and access are rarely an issue. We can bring our full parts inventory to the doorstep without worrying about building protocols or elevator scheduling.',
  },
];

// ── Services ──
const services = [
  {
    slug: 'fridge-repair',
    name: 'Fridge',
    fullName: 'Refrigerator',
    breadcrumbParent: '/fridge-repair',
    breadcrumbParentName: 'Fridge Repair',
    costRange: '$150–$400',
    diagnosticFee: '$89',
    problems: [
      { name: 'Not Cooling / Warm Inside', desc: 'Compressor, condenser coils, evaporator fan, and thermostat diagnosis for temperature issues.' },
      { name: 'Ice Buildup / Frost', desc: 'Defrost heater, timer, thermostat, and drain line inspection to eliminate ice accumulation.' },
      { name: 'Water Leaking', desc: 'Drain pan, water line, inlet valve, and door gasket inspection. Leak found and fixed same visit.' },
      { name: 'Strange Noises', desc: 'Evaporator fan, condenser fan, compressor, and ice maker noise isolation and repair.' },
      { name: 'Not Making Ice', desc: 'Ice maker module, water inlet valve, fill tube, and temperature sensor diagnostics.' },
      { name: 'Control Board / Display', desc: 'Main board, temperature display, sensors, and electronic components repaired with OEM parts.' },
    ],
    pricingRows: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — thermostat, fan, defrost system', '$150 – $280'],
      ['Control board / electronic component', '$220 – $380'],
      ['Compressor / sealed system repair', '$350 – $550'],
    ],
    warningSignsIntro: 'Watch for these signs that your fridge needs professional attention',
    warningSigns: [
      'Food spoiling faster than usual or inconsistent temperatures between shelves',
      'Frost or ice buildup on the back wall of the freezer compartment',
      'Water pooling under or behind the refrigerator',
      'Compressor running constantly without cycling off',
      'Unusual buzzing, clicking, or humming sounds from the unit',
      'Higher than normal electricity bills without other explanation',
    ],
    maintenanceTips: [
      'Clean condenser coils every 6 months — pull the fridge out and vacuum the coils at the back or bottom to maintain cooling efficiency',
      'Check door gaskets for cracks or gaps — a dollar bill test (close the door on a bill; if it slides out easily, the gasket needs replacing) takes 10 seconds',
      'Keep the fridge at 37°F (3°C) and the freezer at 0°F (-18°C) — use a thermometer to verify rather than relying on the dial setting',
      'Don\'t overstuff the fridge — air needs to circulate between items for even cooling',
      'Replace the water filter every 6 months if your fridge has a water dispenser or ice maker',
    ],
  },
  {
    slug: 'washer-repair',
    name: 'Washer',
    fullName: 'Washing Machine',
    breadcrumbParent: '/washer-repair',
    breadcrumbParentName: 'Washer Repair',
    costRange: '$120–$350',
    diagnosticFee: '$89',
    problems: [
      { name: 'Not Spinning / Agitating', desc: 'Drive belt, motor coupling, lid switch, and transmission diagnosis for spin failures.' },
      { name: 'Leaking Water', desc: 'Hoses, pump, tub seal, door boot gasket, and inlet valve inspection. Leak repaired same visit.' },
      { name: 'Not Draining', desc: 'Drain pump, filter, hose blockage, and control board diagnostics for drainage failures.' },
      { name: 'Excessive Vibration', desc: 'Shock absorbers, suspension springs, balance ring, and leveling inspection to stop shaking.' },
      { name: 'Error Codes / Won\'t Start', desc: 'Full diagnostic scan for all major brands — door lock, control board, sensor, and wiring faults.' },
      { name: 'Odour / Mould Issues', desc: 'Door gasket cleaning, drain pump flush, and tub sanitization to eliminate washer smell.' },
    ],
    pricingRows: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — pump, belt, lid switch, inlet valve', '$120 – $260'],
      ['Control board / motor repair', '$200 – $350'],
      ['Bearing / tub seal replacement', '$280 – $450'],
    ],
    warningSignsIntro: 'These symptoms indicate your washing machine needs professional service',
    warningSigns: [
      'Clothes coming out still soaking wet after the spin cycle',
      'Washer not filling with water or filling very slowly',
      'Loud banging, grinding, or squealing during the wash or spin cycle',
      'Water leaking from under or behind the machine',
      'Musty or mouldy smell that persists even after cleaning the drum',
      'Error codes appearing on the display panel',
    ],
    maintenanceTips: [
      'Run a monthly cleaning cycle with hot water and white vinegar or a washing machine cleaner tablet to prevent mould and odour buildup',
      'Leave the door open after each wash to allow the drum and gasket to dry — this is especially important for front-load washers',
      'Clean the lint filter and drain pump filter every month — a clogged filter is the number one cause of drainage failures',
      'Check hoses every 6 months for bulges, cracks, or stiffness — rubber hoses should be replaced every 5 years',
      'Don\'t overload — washing machines have weight limits, and exceeding them damages bearings and suspension systems over time',
    ],
  },
  {
    slug: 'dryer-repair',
    name: 'Dryer',
    fullName: 'Dryer',
    breadcrumbParent: '/dryer-repair',
    breadcrumbParentName: 'Dryer Repair',
    costRange: '$100–$320',
    diagnosticFee: '$89',
    problems: [
      { name: 'Not Heating', desc: 'Heating element, thermal fuse, thermostat, gas igniter, and flame sensor diagnosis.' },
      { name: 'Not Tumbling / Spinning', desc: 'Drive belt, drum rollers, motor, and idler pulley inspection and replacement.' },
      { name: 'Taking Too Long to Dry', desc: 'Vent blockage, heating element degradation, moisture sensor, and airflow restriction diagnosis.' },
      { name: 'Making Loud Noises', desc: 'Drum rollers, glides, bearing, belt, and blower wheel inspection to eliminate noise.' },
      { name: 'Shutting Off Early', desc: 'Thermal fuse, thermostat, moisture sensor, and vent restriction causing premature shutoff.' },
      { name: 'Not Starting / No Power', desc: 'Door switch, start switch, thermal fuse, control board, and power supply diagnostics.' },
    ],
    pricingRows: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — belt, rollers, thermostat, element', '$100 – $250'],
      ['Control board / motor repair', '$180 – $320'],
      ['Gas valve / igniter replacement', '$150 – $280'],
    ],
    warningSignsIntro: 'These warning signs mean your dryer needs professional attention',
    warningSigns: [
      'Clothes taking two or more cycles to dry completely',
      'Dryer exterior or laundry room feels unusually hot during operation',
      'Burning smell coming from the dryer during use',
      'Loud thumping, squealing, or grinding sounds when the drum turns',
      'Dryer starts but stops after a few minutes without completing the cycle',
      'Lint accumulating on clothes even after cleaning the lint trap',
    ],
    maintenanceTips: [
      'Clean the lint trap before every single load — a clogged lint screen reduces efficiency by 30% and is a fire hazard',
      'Have the dryer vent duct professionally cleaned once a year — lint buildup in the vent is the leading cause of dryer fires in Canada',
      'Check the exterior vent flap to make sure it opens when the dryer runs and closes when it stops — a stuck flap lets cold air and pests into the vent line',
      'Don\'t overload the dryer — clothes need room to tumble for even drying, and overloading strains the belt and motor',
      'Wipe down the moisture sensor bars inside the drum monthly with rubbing alcohol — fabric softener residue coats these sensors and causes inaccurate cycle times',
    ],
  },
  {
    slug: 'dishwasher-repair',
    name: 'Dishwasher',
    fullName: 'Dishwasher',
    breadcrumbParent: '/dishwasher-repair',
    breadcrumbParentName: 'Dishwasher Repair',
    costRange: '$120–$350',
    diagnosticFee: '$89',
    problems: [
      { name: 'Not Cleaning Dishes', desc: 'Spray arm, water inlet valve, wash motor, and detergent dispenser diagnosis for poor cleaning.' },
      { name: 'Not Draining', desc: 'Drain pump, check valve, hose blockage, and garbage disposal connection inspection.' },
      { name: 'Leaking Water', desc: 'Door gasket, tub seal, spray arm, hose, and pump inspection. Leak repaired same visit.' },
      { name: 'Not Starting / No Power', desc: 'Door latch, control board, thermal fuse, and power supply diagnostics.' },
      { name: 'Not Drying Dishes', desc: 'Heating element, vent, rinse aid dispenser, and fan motor inspection for drying failures.' },
      { name: 'Unusual Noises', desc: 'Wash motor, drain pump, spray arm bearing, and chopper blade inspection to eliminate noise.' },
    ],
    pricingRows: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — pump, valve, spray arm, gasket', '$120 – $260'],
      ['Control board / electronic component', '$200 – $350'],
      ['Motor / major component replacement', '$250 – $400'],
    ],
    warningSignsIntro: 'These signs indicate your dishwasher needs professional service',
    warningSigns: [
      'Dishes coming out cloudy, gritty, or still dirty after a full cycle',
      'Standing water remaining in the bottom of the tub after the cycle ends',
      'Water leaking from under the dishwasher door or pooling on the kitchen floor',
      'Dishwasher not starting when you press the start button or select a cycle',
      'Unusual grinding, humming, or banging sounds during operation',
      'Foul odour coming from inside the dishwasher even after cleaning',
    ],
    maintenanceTips: [
      'Clean the filter at the bottom of the tub every two weeks — food debris trapped in the filter is the top cause of poor cleaning and bad odours',
      'Run a monthly hot cycle with a cup of white vinegar on the top rack to dissolve grease and mineral buildup',
      'Check and clean the spray arm nozzles every few months — toothpick out any debris blocking the small holes',
      'Make sure the water temperature entering the dishwasher is at least 120°F (49°C) — run the kitchen hot tap until it\'s hot before starting a cycle',
      'Use rinse aid — it dramatically improves drying performance and prevents water spots, especially in hard water areas like Toronto',
    ],
  },
  {
    slug: 'oven-repair',
    name: 'Oven',
    fullName: 'Oven',
    breadcrumbParent: '/oven-repair',
    breadcrumbParentName: 'Oven Repair',
    costRange: '$130–$380',
    diagnosticFee: '$89',
    problems: [
      { name: 'Not Heating / Uneven Heat', desc: 'Bake element, broil element, igniter, and temperature sensor diagnosis for heating failures.' },
      { name: 'Gas Ignition Issues', desc: 'Gas igniter, safety valve, spark electrode, and gas line inspection for ignition failures.' },
      { name: 'Temperature Inaccuracy', desc: 'Temperature sensor, calibration, control board, and thermostat diagnosis for wrong temperatures.' },
      { name: 'Self-Clean Lock Stuck', desc: 'Door lock motor, latch assembly, control board, and thermal switch repair for stuck doors.' },
      { name: 'Control Panel / Display', desc: 'Touchpad, control board, display, and wiring diagnosis for unresponsive or erratic controls.' },
      { name: 'Door Not Closing Properly', desc: 'Hinge, spring, gasket, and latch inspection for doors that won\'t seal or close flush.' },
    ],
    pricingRows: [
      ['Diagnostic visit (applied to repair)', '$89'],
      ['Standard repair — igniter, element, thermostat, gasket', '$130 – $280'],
      ['Control board / electronic component', '$220 – $380'],
      ['Gas valve / safety component replacement', '$180 – $320'],
    ],
    warningSignsIntro: 'Watch for these signs that your oven needs professional service',
    warningSigns: [
      'Food cooking unevenly — burnt on one side, raw on the other',
      'Oven taking much longer than normal to preheat',
      'Gas smell when the oven is running (turn off gas and call immediately)',
      'Oven door not closing completely or sealing properly',
      'Self-cleaning cycle failing to complete or door remaining locked afterward',
      'Control panel buttons not responding or display showing error codes',
    ],
    maintenanceTips: [
      'Clean spills promptly to prevent them from baking onto the oven floor — carbonized food debris can damage the bake element and cause smoke',
      'Test oven temperature accuracy every 6 months with an oven thermometer — if it\'s off by more than 25°F, the temperature sensor likely needs calibration or replacement',
      'Check the door gasket seal by closing the door on a piece of paper — if the paper slides out easily at any point, the gasket needs replacement to maintain even heating',
      'For gas ovens, keep the igniter area clean — a dirty igniter takes longer to glow hot enough to open the gas valve, causing delayed ignition',
      'Avoid using the self-clean feature more than twice a year — the extreme heat (900°F) stresses the door lock mechanism and thermal fuse',
    ],
  },
];

// ── Unique content generators ──

function generateIntroContent(neighbourhood, service) {
  const n = neighbourhood;
  const s = service;

  const intros = {
    'fridge-repair': `<h2>${s.fullName} Repair in ${n.name} — Keeping ${n.parent} Kitchens Running Cold</h2>
<p>${n.name} is home to ${n.community}, and the residential landscape features ${n.housing}. Along ${n.streets}, kitchens rely on refrigerators from brands like ${n.brands} to keep groceries fresh through Toronto's humid summers and dry winters. When a fridge fails in ${n.name}, it's an emergency — food spoilage starts within hours, and families need fast, reliable repair from a technician who knows the neighbourhood.</p>
<p>${n.housing_detail}</p>

<h2>Why ${n.name} Homes Need Specialized Refrigerator Service</h2>
<p>${n.special_note}</p>
<p>Refrigerators in ${n.name} face specific challenges tied to the neighbourhood's housing stock and lifestyle patterns. The most common issue we encounter is condenser coil contamination — dust, pet hair, and cooking grease accumulate on the coils faster in busy kitchens, forcing the compressor to work harder and eventually overheat. In ${n.name}'s older homes, where kitchens may lack modern ventilation, this problem accelerates. We clean and inspect condenser coils as part of every refrigerator diagnostic visit.</p>

<h2>Common Refrigerator Failures in ${n.name}</h2>
<p>The refrigerator failures we see most often in ${n.name} reflect the neighbourhood's specific housing and appliance mix. Defrost system failures are our number-one call — the defrost heater, timer, or thermostat stops working, ice builds up on the evaporator coils behind the back panel, and the fridge gradually loses cooling power. Homeowners notice food not staying cold enough or ice cream softening in the freezer before the problem becomes obvious.</p>
<p>Compressor relay failures are the second most common issue, particularly in older refrigerators common in ${n.name}. The relay that starts the compressor clicks repeatedly but fails to engage, producing a distinctive click-buzz-click pattern that homeowners often describe as "the fridge is clicking." This is a straightforward repair when caught early but can damage the compressor itself if ignored for weeks.</p>
<p>Water inlet valve failures affect refrigerators with ice makers and water dispensers — the valve either fails to open, producing no ice and no water, or fails to close completely, causing a slow leak that puddles under the fridge. ${n.water}</p>

<h2>How We Serve ${n.name}</h2>
<p>${n.parking}</p>
<p>Our technicians arrive at ${n.name} addresses with a fully stocked van carrying the most common refrigerator parts for ${n.brandsList} — compressor relays, defrost heaters, thermostats, evaporator fan motors, water inlet valves, and door gaskets. For less common parts, we can source genuine OEM components and return within 24-48 hours. Most refrigerator repairs in ${n.name} are completed in a single visit lasting 45 minutes to 2 hours depending on the complexity of the issue.</p>`,

    'washer-repair': `<h2>${s.fullName} Repair in ${n.name} — Fast Service for ${n.parent} Laundry Emergencies</h2>
<p>A broken washing machine disrupts daily life fast, especially in ${n.name} where ${n.community} depend on functioning laundry to keep households running. The homes here — ${n.housing} — along ${n.streets} feature laundry setups ranging from basement installations in older homes to in-unit stacked pairs in newer condos. Common brands include ${n.brands}, and when any of them fail, ${n.name} residents need same-day repair they can trust.</p>
<p>${n.housing_detail}</p>

<h2>Why ${n.name} Homes Need Specialized Washer Service</h2>
<p>${n.special_note}</p>
<p>Washing machines in ${n.name} face wear patterns tied directly to the neighbourhood's demographics and housing characteristics. Large families and multi-generational households run more loads per week, accelerating bearing wear and pump strain. Basement laundry rooms in older homes may have floor drains that back up during heavy rain, sending standing water back into the washer's drain system. In-unit installations in newer builds may share drain stacks with neighbouring units, creating back-pressure events that trigger drainage error codes. We diagnose all of these scenarios routinely in ${n.name}.</p>

<h2>Common Washing Machine Failures in ${n.name}</h2>
<p>Drain pump failures lead our washer repair calls in ${n.name}. Small objects — coins, hair pins, pet hair clumps — accumulate in the pump filter and eventually jam the impeller or burn out the pump motor. The washer fills and agitates normally but won't drain, leaving clothes sitting in dirty water. We clear the pump, clean the filter, and replace the pump if the motor has burned out — most drain pump repairs in ${n.name} take under an hour.</p>
<p>Bearing failures are the second most common issue, particularly in front-load washers that are 5-8 years old. The main tub bearing wears down over time, producing a rumbling or grinding sound that gets progressively louder with each wash cycle. In ${n.name}, where heavy usage is common, bearings can fail earlier than the 8-10 year average. Bearing replacement is a major repair but costs significantly less than a new washer.</p>
<p>Door boot gasket tears and mould in front-load washers rank third. The rubber gasket around the front-load door traps moisture, lint, and detergent residue, creating a breeding ground for mould. Eventually the gasket tears, causing leaks. We replace gaskets with OEM parts and show customers how to prevent recurrence. ${n.water}</p>

<h2>How We Serve ${n.name}</h2>
<p>${n.parking}</p>
<p>For washer repairs in ${n.name}, our technicians carry the most frequently needed parts for ${n.brandsList} — drain pumps, inlet valves, door boot gaskets, lid switches, drive belts, and shock absorbers. For basement laundry rooms in ${n.name}'s older homes, we bring drop cloths and portable work lights to manage the tight, often dimly lit spaces. Most washer repairs are completed in one visit within 1-2 hours.</p>`,

    'dryer-repair': `<h2>${s.fullName} Repair in ${n.name} — Restoring Heat and Tumble Across ${n.parent}</h2>
<p>When a dryer stops heating or tumbling in ${n.name}, laundry piles up fast. This neighbourhood — characterized by ${n.housing} along ${n.streets} — is home to ${n.community} who rely on functioning dryers daily. Common brands in ${n.name} include ${n.brands}, and whether the issue is a dead heating element, a broken belt, or a blocked vent, N Appliance Repair provides same-day dryer service throughout the area.</p>
<p>${n.housing_detail}</p>

<h2>Why ${n.name} Homes Need Specialized Dryer Service</h2>
<p>${n.special_note}</p>
<p>Dryers in ${n.name} encounter issues closely tied to the neighbourhood's housing types. In older homes with long dryer vent runs through basements and up exterior walls, lint accumulation in the ductwork reduces airflow and forces the dryer to work harder, shortening the life of heating elements and thermal fuses. In newer condos with interior venting, condensation dryers and heat pump dryers require different maintenance and repair approaches than traditional vented units. We service both configurations daily in ${n.name} and carry parts for all vent types.</p>

<h2>Common Dryer Failures in ${n.name}</h2>
<p>Heating element failure is the most common dryer repair we perform in ${n.name}. Electric dryers use a coiled wire element that glows red-hot during operation, and over time the wire fatigues and breaks, leaving the dryer tumbling but producing no heat. Clothes tumble for a full cycle and come out damp. In gas dryers — still common in ${n.name}'s older homes — the equivalent failure is a worn igniter that can no longer reach the temperature needed to open the gas valve. Both are straightforward repairs completed in under an hour.</p>
<p>Drum roller and bearing wear produce loud thumping or squealing sounds that ${n.name} homeowners often describe as "the dryer sounds like it's falling apart." The felt drum seal and support rollers degrade after 6-8 years of regular use, and the drum begins to wobble during rotation. We replace rollers, bearings, and seals as a set to ensure the repair lasts rather than addressing one component at a time.</p>
<p>Thermal fuse failures cause dryers to stop running entirely with no warning — one load works fine, and the next load the dryer is completely dead. The thermal fuse is a safety device that blows when the dryer overheats, typically due to restricted vent airflow. We replace the fuse and inspect the entire vent path to identify and clear the restriction that caused the overheating. ${n.water}</p>

<h2>How We Serve ${n.name}</h2>
<p>${n.parking}</p>
<p>Our vans arrive in ${n.name} stocked with the most common dryer parts for ${n.brandsList} — heating elements, thermal fuses, thermostats, drum rollers, belts, igniters, and door switches. For ${n.name} homes where the dryer is in a tight basement or closet, our technicians bring portable work lights and flexible tools designed for confined-space repairs. Most dryer repairs in ${n.name} are completed in a single visit within 45 minutes to 90 minutes.</p>`,

    'dishwasher-repair': `<h2>${s.fullName} Repair in ${n.name} — Expert Service for ${n.parent} Kitchens</h2>
<p>A malfunctioning dishwasher turns every meal into a hand-washing marathon, and in ${n.name} where ${n.community} keep kitchens busy, downtime is not an option. The homes here — ${n.housing} — along ${n.streets} feature dishwasher installations ranging from built-in units under granite countertops to compact models in condo kitchens. Popular brands include ${n.brands}, and N Appliance Repair services every one of them with same-day availability throughout ${n.name}.</p>
<p>${n.housing_detail}</p>

<h2>Why ${n.name} Homes Need Specialized Dishwasher Service</h2>
<p>${n.special_note}</p>
<p>Dishwashers in ${n.name} encounter problems influenced by the neighbourhood's water quality, housing age, and usage patterns. Toronto's Lake Ontario water supply carries enough dissolved calcium to scale up spray arm nozzles, clog water inlet valves, and leave film on glassware. In ${n.name}'s older homes, the plumbing infrastructure adds another variable — shared drain lines, aging supply pipes, and inconsistent water pressure all affect dishwasher performance in ways that standard troubleshooting guides don't cover. Our technicians understand these local factors and account for them in every diagnosis.</p>

<h2>Common Dishwasher Failures in ${n.name}</h2>
<p>Spray arm clogging from hard water mineral deposits is our most frequent dishwasher repair in ${n.name}. The small nozzle holes in the spray arms gradually narrow as calcium builds up, reducing water pressure and spray coverage until dishes on the bottom rack come out dirty. We disassemble, descale, and clear all spray arms during the service, and replace them if the deposits have caused permanent damage to the nozzle geometry.</p>
<p>Drain pump failures rank second, often caused by food debris, broken glass fragments, or small objects that slip past the filter and jam the pump impeller. The dishwasher fills and washes but won't drain, leaving standing water in the bottom of the tub. We clear the blockage, clean the pump housing, and replace the pump motor if it has burned out from the strain.</p>
<p>Door latch and gasket failures are the third most common issue we see in ${n.name}. An improperly latching door prevents the cycle from starting — the dishwasher appears completely dead even though the control board is fine. Gasket wear causes slow leaks that damage kitchen flooring before homeowners notice. We carry replacement latches and gaskets for all major brands. ${n.water}</p>

<h2>How We Serve ${n.name}</h2>
<p>${n.parking}</p>
<p>Our technicians arrive in ${n.name} with a comprehensive parts inventory for ${n.brandsList} — spray arms, drain pumps, water inlet valves, door latches, gaskets, heating elements, and control boards. Dishwasher repairs in ${n.name} typically take 45 minutes to 90 minutes, and most are completed in a single visit without the need for follow-up parts ordering.</p>`,

    'oven-repair': `<h2>${s.fullName} Repair in ${n.name} — Professional Service for ${n.parent} Home Cooking</h2>
<p>An oven that won't heat, heats unevenly, or throws error codes disrupts meal preparation and holiday planning in equal measure. In ${n.name}, where ${n.community} rely on their ovens for daily cooking and family gatherings, timely repair matters. The homes here — ${n.housing} — along ${n.streets} feature both gas and electric ovens from brands like ${n.brands}. N Appliance Repair provides same-day oven service throughout ${n.name} with licensed gas-certified technicians.</p>
<p>${n.housing_detail}</p>

<h2>Why ${n.name} Homes Need Specialized Oven Service</h2>
<p>${n.special_note}</p>
<p>Ovens in ${n.name} face issues tied to the neighbourhood's mix of gas and electric installations, housing age, and cooking habits. Gas ovens in older homes may have aging gas lines and connections that require careful inspection alongside the appliance repair itself. Electric ovens in newer constructions rely on precise electronic controls that can be disrupted by power fluctuations. In multi-generational and family-heavy households common in ${n.name}, heavy oven use — daily cooking, holiday baking, large-batch meal preparation — accelerates wear on igniters, elements, and thermostats. We see these usage-driven failures regularly and carry the parts to fix them on the first visit.</p>

<h2>Common Oven Failures in ${n.name}</h2>
<p>Gas igniter degradation is our most common oven repair in ${n.name}'s gas-equipped homes. The igniter — a silicon carbide or silicon nitride element that glows hot to open the gas safety valve — weakens over time until it can no longer reach the threshold temperature to release gas. The symptom is an oven that clicks and glows but never ignites, or takes 10-15 minutes to finally light. Igniter replacement is one of the most common and straightforward oven repairs, completed in under an hour.</p>
<p>Bake element failure is the electric oven equivalent — the element at the bottom of the oven develops a visible break or burn-through spot and stops producing heat. Sometimes the element visibly arcs or sparks before failing completely. We replace bake and broil elements with OEM-equivalent parts and test the full heating cycle before completing the repair.</p>
<p>Temperature sensor drift causes ovens to run too hot or too cold relative to the set temperature. Food burns at normal settings, or baking takes twice as long as recipes specify. The oven temperature sensor — a thin probe inside the oven cavity — develops resistance drift over years of thermal cycling. We test sensor resistance against manufacturer specifications and replace it when readings fall outside tolerance. ${n.water}</p>

<h2>How We Serve ${n.name}</h2>
<p>${n.parking}</p>
<p>Our technicians arrive in ${n.name} equipped with the most common oven parts for ${n.brandsList} — igniters, bake and broil elements, temperature sensors, thermostats, control boards, and door hinges. All our oven technicians carry TSSA gas certification for safe work on gas appliances. Most oven repairs in ${n.name} are completed in a single visit within 45 minutes to 90 minutes.</p>`,
  };

  return intros[s.slug];
}

function generateFAQs(neighbourhood, service) {
  const n = neighbourhood;
  const s = service;

  return [
    {
      q: `How much does ${s.name.toLowerCase()} repair cost in ${n.name}?`,
      a: `${s.fullName} repair in ${n.name} typically costs ${s.costRange}. Our diagnostic fee is ${s.diagnosticFee}, which is applied to the repair cost if you proceed. We provide a firm written quote before any work begins — no surprises. ${n.name} residents receive the same transparent pricing as all our Toronto-area customers.`
    },
    {
      q: `How quickly can you get to ${n.name} for ${s.name.toLowerCase()} repair?`,
      a: `We dispatch technicians to ${n.name} daily and typically arrive within 2-4 hours of your call. Call before 2 PM for same-day service Monday through Saturday. We also offer Sunday service from 9 AM to 6 PM. Our technicians know ${n.name}'s streets and building layouts well, so there are no delays finding your address.`
    },
    {
      q: `What ${s.name.toLowerCase()} brands do you repair in ${n.name}?`,
      a: `We repair all major ${s.name.toLowerCase()} brands in ${n.name}, including ${n.brandsList}, and more. Our van carries the most common parts for these brands, and we can source specialty or OEM parts for less common models within 24-48 hours. Whatever brand is in your ${n.name} kitchen or laundry room, we can fix it.`
    },
    {
      q: `Do you offer a warranty on ${s.name.toLowerCase()} repairs in ${n.name}?`,
      a: `Yes — every ${s.name.toLowerCase()} repair in ${n.name} comes with our 90-day parts and labour warranty. If the same issue returns within 90 days, we come back at no charge. This applies to all brands and all repair types, from simple part replacements to control board repairs.`
    },
    {
      q: `Is it worth repairing my ${s.name.toLowerCase()} or should I buy a new one?`,
      a: `As a general rule, if your ${s.name.toLowerCase()} is under 8-10 years old and the repair cost is under 50% of replacement price, repair is usually the better value. We give you an honest assessment — if the repair doesn't make financial sense, we'll tell you. In ${n.name}, where ${n.housing.includes('condo') || n.housing.includes('apartment') ? 'replacing built-in appliances involves additional installation costs' : 'many homes have appliances integrated into custom cabinetry'}, repair often saves significantly more than the sticker price of a new unit.`
    },
    {
      q: `What should I do while waiting for ${s.name.toLowerCase()} repair in ${n.name}?`,
      a: s.slug === 'fridge-repair'
        ? `Keep the refrigerator door closed as much as possible — an unopened fridge can maintain safe temperatures for about 4 hours. Move highly perishable items to a cooler with ice if the repair appointment is more than a few hours away. Don't adjust temperature settings, as this can confuse our diagnostic readings when we arrive.`
        : s.slug === 'washer-repair'
        ? `If the washer stopped mid-cycle with water inside, don't try to force-drain it — our technician will handle the water safely during the repair visit. Check if there's a drain filter accessible from the front of the machine (many front-loaders have one behind a small panel at the bottom) and have towels ready. Avoid running additional loads in case the issue is electrical.`
        : s.slug === 'dryer-repair'
        ? `Unplug the dryer if you noticed any burning smell or unusual heat. Don't attempt to use the dryer again until it's been inspected — running a dryer with a blocked vent or failed thermostat is a fire risk. You can hang-dry essential items until our technician arrives. If your dryer is gas-powered and you smell gas, leave the house and call your gas utility immediately.`
        : s.slug === 'dishwasher-repair'
        ? `If there's standing water in the dishwasher, leave it — our technician will drain it during the repair. Don't run the dishwasher again, as this could worsen a leak or pump issue. Check under the sink to make sure the drain hose connection isn't kinked or disconnected. Place towels around the base if there's any sign of leaking.`
        : `If the oven is gas and you smell gas, turn off the gas supply at the shutoff valve and open windows — do not use the oven or any open flame. For electric ovens, turn off the oven at the breaker if you saw sparking or arcing from an element. Don't use the self-clean feature to try to fix a temperature issue — the extreme heat can damage additional components. Our technician will handle the diagnosis safely.`
    },
  ];
}

function generateWhyChoose(neighbourhood, service) {
  const n = neighbourhood;
  const s = service;
  return `<h2>Why Choose ${BRAND} for ${s.fullName} Repair in ${n.name}</h2>
<p>We've built our reputation in ${n.name} and across ${n.parent} on straightforward principles: show up on time, diagnose honestly, price fairly, and fix it right the first time. Every ${s.name.toLowerCase()} repair comes with our 90-day parts and labour warranty, and we use OEM or equivalent parts to ensure the repair lasts. Our technicians are licensed, insured, and experienced with the specific appliance brands and housing configurations found throughout ${n.name}.</p>
<ul>
<li>Same-day service available Monday through Saturday — call before 2 PM</li>
<li>${s.diagnosticFee} diagnostic fee applied to the repair if you proceed</li>
<li>90-day parts and labour warranty on every repair</li>
<li>Licensed and insured technicians with ${s.slug === 'oven-repair' ? 'TSSA gas certification' : 'brand-specific training'}</li>
<li>OEM and manufacturer-equivalent parts stocked on every van</li>
<li>Transparent written quotes before any work begins — no hidden fees</li>
</ul>`;
}

function generateMaintenanceSection(neighbourhood, service) {
  const n = neighbourhood;
  const s = service;
  return `<h2>${s.fullName} Maintenance Tips for ${n.name} Residents</h2>
<p>Preventive maintenance extends the life of your ${s.name.toLowerCase()} and reduces the likelihood of emergency repair calls. Here are the most important maintenance practices for ${n.name} homeowners:</p>
<ul>
${s.maintenanceTips.map(tip => `<li>${tip}</li>`).join('\n')}
</ul>
<p>Following these maintenance steps can add years to your ${s.name.toLowerCase()}'s lifespan and help you avoid the most common repair issues we see in ${n.name}. If you're unsure about any maintenance procedure, call us at ${PHONE} — we're happy to walk you through it over the phone.</p>`;
}

// ── HTML Page Generator ──
function generatePage(neighbourhood, service) {
  const n = neighbourhood;
  const s = service;
  const pageTitle = `${s.fullName} Repair ${n.name} | ${BRAND}`;
  const metaDesc = `Expert ${s.name.toLowerCase()} repair in ${n.name}, ${n.parent}. Same-day service. Licensed technicians. Call ${PHONE}. ${s.diagnosticFee} diagnostic fee.`;
  const canonical = `${DOMAIN}/${s.slug}-${n.slug}`;
  const h1 = `${s.fullName} Repair in ${n.name}`;
  const answerBox = `Need ${s.name.toLowerCase()} repair in ${n.name}? ${BRAND} serves ${n.name} with same-day service — call ${PHONE}, available Mon\u2013Sat 8am\u20138pm, Sun 9am\u20136pm. Flat ${s.diagnosticFee} diagnostic fee.`;

  const faqs = generateFAQs(n, s);
  const introContent = generateIntroContent(n, s);
  const whyChoose = generateWhyChoose(n, s);
  const maintenanceSection = generateMaintenanceSection(n, s);

  const faqSchema = faqs.map(f => `        {
          "@type": "Question",
          "name": "${f.q.replace(/"/g, '\\"')}",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${f.a.replace(/"/g, '\\"')}"
          }
        }`).join(',\n');

  const faqHtml = faqs.map(f => `        <details class="faq-item">
          <summary class="faq-question">
            <span class="faq-q-text">${f.q}</span>
            <span class="faq-icon" aria-hidden="true">+</span>
          </summary>
          <div class="faq-answer"><p>${f.a}</p></div>
        </details>`).join('\n');

  const problemCards = s.problems.map(p => `      <div class="problem-card">
        <div class="problem-name">${p.name}</div>
        <div class="problem-desc">${p.desc}</div>
      </div>`).join('\n');

  const pricingRows = s.pricingRows.map(r => `        <tr>
          <td>${r[0]}</td>
          <td>${r[1]}</td>
        </tr>`).join('\n');

  const warningSignsList = s.warningSigns.map(w => `<li>${w}</li>`).join('\n');

  // Related services (other services for same neighbourhood)
  const relatedServices = services.filter(svc => svc.slug !== s.slug).map(svc =>
    `<li><a href="/${svc.slug}-${n.slug}">${svc.fullName} Repair in ${n.name}</a></li>`
  ).join('\n');

  // Related areas (same service in other neighbourhoods)
  const relatedAreas = neighbourhoods.filter(nb => nb.slug !== n.slug).slice(0, 6).map(nb =>
    `<li><a href="/${s.slug}-${nb.slug}">${s.fullName} Repair in ${nb.name}</a></li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pageTitle}</title>
<meta name="description" content="${metaDesc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">

<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "name": "${BRAND}",
      "telephone": "${PHONE_TEL}",
      "url": "${DOMAIN}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${n.name}",
        "addressRegion": "Ontario",
        "addressCountry": "CA"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "5200"
      },
      "openingHours": [
        "Mo-Sa 08:00-20:00",
        "Su 09:00-18:00"
      ]
    },
    {
      "@type": "Service",
      "name": "${s.fullName} Repair in ${n.name}",
      "provider": {
        "@type": "LocalBusiness",
        "name": "${BRAND}"
      },
      "areaServed": "${n.name}",
      "description": "Professional ${s.name.toLowerCase()} repair service in ${n.name}, ${n.parent}"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
${faqSchema}
      ]
    }
  ]
}</script>

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
.btn-secondary { display: inline-flex; align-items: center; gap: 6px; background: #FFFFFF; color: #2563EB; font-size: 1rem; font-weight: 700; padding: 13px 22px; border-radius: 4px; border: 1.5px solid #2563EB; text-decoration: none; letter-spacing: -0.01em; transition: background 0.15s ease; white-space: nowrap; }
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
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="${BRAND}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${pageTitle}">
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
    <a href="${s.breadcrumbParent}" itemprop="item"><span itemprop="name">${s.breadcrumbParentName}</span></a>
    <meta itemprop="position" content="2">
  </li>
  <span class="breadcrumb-sep" aria-hidden="true">/</span>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span class="breadcrumb-current" itemprop="name">${n.name}</span>
    <meta itemprop="position" content="3">
  </li>
</ol></div>
</nav>

<!-- Page Hero -->
<section class="page-hero" aria-label="Page header">
  <div class="container">
    <div class="page-hero-eyebrow">${BRAND} &middot; ${n.name}, ${n.parent}</div>
    <h1 class="page-h1">${h1}</h1>
    <div class="answer-box">${answerBox}</div>
    <div class="page-hero-ctas">
      <a href="tel:${PHONE_TEL}" class="btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Call ${PHONE}
      </a>
      <a href="${BOOKING_URL}" class="btn-secondary" target="_blank" rel="noopener">
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

  <!-- Content Intro -->
  <div class="content-intro fade-in">
${introContent}

${whyChoose}

${maintenanceSection}

    <h2>Warning Signs Your ${s.fullName} Needs Repair</h2>
    <p>${s.warningSignsIntro}:</p>
    <ul>
${warningSignsList}
    </ul>
  </div>

  <!-- Service Details -->
  <section class="service-details fade-in" aria-label="Common problems and pricing">
    <div class="section-label">Common issues</div>
    <h2 class="section-title">Common ${s.fullName} Problems We Fix in ${n.name}</h2>
    <div class="problems-grid">
${problemCards}
    </div>

    <div class="section-label" style="margin-top: 48px;">Pricing</div>
    <h2 class="section-title">${s.fullName} Repair Cost in ${n.name}</h2>
    <table class="pricing-table" aria-label="Repair pricing">
      <thead>
        <tr>
          <th>Repair Type</th>
          <th>Typical Cost</th>
        </tr>
      </thead>
      <tbody>
${pricingRows}
      </tbody>
    </table>
    <p class="pricing-note">All prices include OEM parts and labour. Firm written quote provided before any work begins.</p>
  </section>

  <!-- Booking Section -->
  <section class="booking-section fade-in" aria-label="Book your repair">
    <div class="section-label">Online booking</div>
    <h2>Book ${s.fullName} Repair in ${n.name}</h2>
    <p>Choose a convenient time &mdash; real-time availability, instant confirmation, no commitment required.</p>
    <iframe
      src="${BOOKING_URL}?embed=true"
      title="Book ${s.fullName} Repair in ${n.name}"
      loading="lazy"
    ></iframe>
    <p class="booking-alt">Prefer to call? <a href="tel:${PHONE_TEL}">${PHONE}</a> &mdash; Mon&ndash;Sat 8am&ndash;8pm, Sun 9am&ndash;6pm</p>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section fade-in" aria-label="Frequently asked questions">
    <div class="container" style="padding:0;">
      <h2>Frequently Asked Questions About ${s.fullName} Repair in ${n.name}</h2>
      <div class="faq-list">
${faqHtml}
      </div>
    </div>
  </section>

  <!-- Related Links -->
  <section class="related-links fade-in" aria-label="Related pages">
    <div class="related-links-grid">
      <div class="related-col">
        <h3>Other Services in ${n.name}</h3>
        <ul class="related-list">
${relatedServices}
        </ul>
      </div>
      <div class="related-col">
        <h3>${s.fullName} Repair Nearby</h3>
        <ul class="related-list">
${relatedAreas}
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
  </section>

</main>

<!-- Sticky Bottom Bar -->
<div id="sticky-bottom" role="complementary" aria-label="Quick call bar">
  <span class="sticky-label">${s.fullName} repair in ${n.name} &mdash;</span>
  <a href="tel:${PHONE_TEL}" class="sticky-phone" aria-label="Call ${BRAND}">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ${PHONE}
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

// ── Main execution ──
let created = [];
for (const n of neighbourhoods) {
  for (const s of services) {
    const filename = `${s.slug}-${n.slug}.html`;
    const filepath = path.join(__dirname, filename);
    const html = generatePage(n, s);
    fs.writeFileSync(filepath, html, 'utf8');
    created.push(filename);
    process.stdout.write('.');
  }
}

console.log(`\n\nCreated ${created.length} files:`);
created.forEach(f => console.log(`  ${f}`));
