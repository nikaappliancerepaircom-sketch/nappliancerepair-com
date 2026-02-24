const fs = require('fs');
const path = require('path');

const PHONE = '(437) 524-1053';
const PHONE_LINK = '+14375241053';
const BRAND = 'N Appliance Repair';
const BOOKING = 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce';
const DATE = '2026-02-23';

const neighbourhoods = [
  {
    slug: 'parkdale',
    name: 'Parkdale',
    region: 'West Toronto',
    desc: 'Parkdale is a rapidly gentrifying neighbourhood in West Toronto, where Victorian-era homes and early 1900s rooming houses sit alongside newer apartment buildings. The area draws a budget-conscious and growing middle-class demographic. Common appliance brands include Whirlpool and GE, with many older units still running strong in heritage homes.',
    housing: 'Victorian row houses, converted rooming houses, low-rise apartments, and a growing number of renovated detached homes',
    brands: 'Whirlpool, GE, Frigidaire, Kenmore',
    premiumBrands: false,
    demographics: 'Mix of long-time residents, artists, young professionals, and newcomer families',
    parkingNote: 'Street parking on Queen West and King West can be tight; our technicians use Jameson Avenue and side-street parking or nearby Green P lots',
    localLandmarks: 'Queen West strip, Roncesvalles Avenue, Parkdale Library, Sunnyside Pavilion',
    housingAge: '1890s–1930s Victorian, 1950s–1970s apartments, some 2010s renovations',
    waterNote: 'Older Parkdale homes often have original galvanized pipes that add sediment to water, increasing filter clogs',
    kitchenNote: 'Heritage kitchens in Parkdale Victorians are compact, with narrow doorways that require careful appliance maneuvering'
  },
  {
    slug: 'the-junction',
    name: 'The Junction',
    region: 'West Toronto',
    desc: 'The Junction is a vibrant West Toronto neighbourhood centred on Dundas Street West near Keele. Once a working-class rail hub, it has transformed into a family-friendly, hipster-adjacent area with renovated workers\' cottages, Edwardian homes, and an increasing number of new condo developments. Appliance inventories span older Whirlpool and GE units in heritage homes to Samsung and LG in newer builds.',
    housing: 'Renovated workers\' cottages, Edwardian semi-detached homes, new mid-rise condos, and converted industrial lofts',
    brands: 'Samsung, LG, Whirlpool, GE, Bosch',
    premiumBrands: false,
    demographics: 'Young families, creative professionals, first-time homebuyers, and condo investors',
    parkingNote: 'Dundas West has metered parking; our technicians use Pacific Avenue and side streets or the municipal lot near Keele station',
    localLandmarks: 'Dundas West strip, Keele TTC station, Junction Craft Brewing, Heintzman Park',
    housingAge: '1900s–1920s workers\' homes, 1940s semi-detached, 2015+ condo towers',
    waterNote: 'Junction homes on the original 1910s water mains experience periodic sediment flushes that clog washer inlet filters',
    kitchenNote: 'Renovated Junction kitchens often combine modern appliances with heritage-width cabinetry, creating non-standard installation dimensions'
  },
  {
    slug: 'leaside',
    name: 'Leaside',
    region: 'East York',
    desc: 'Leaside is an affluent East York neighbourhood known for its tree-lined streets and well-maintained 1940s to 1960s bungalows and two-storey homes. Many properties have been extensively renovated while keeping their original footprints. Residents tend to maintain quality appliances for years. Common brands include Maytag, Whirlpool, and GE from the 1980s through 2000s, with newer Bosch and KitchenAid in renovated kitchens.',
    housing: 'Post-war bungalows, Cape Cod and Tudor-style homes from the 1940s–1960s, many with modern kitchen renovations',
    brands: 'Maytag, Whirlpool, GE, Bosch, KitchenAid',
    premiumBrands: true,
    demographics: 'Established families, dual-income professionals, retirees aging in place',
    parkingNote: 'Leaside has ample residential driveway parking; our technicians can park on the street or in driveways without restriction in most areas',
    localLandmarks: 'Bayview Avenue shops, Trace Manes Park, Leaside Memorial Gardens, Sunnybrook Park',
    housingAge: '1940s–1960s original construction, many renovated 2000s–2020s',
    waterNote: 'Leaside water infrastructure was upgraded in the 2000s, but older homes with original copper pipes still develop mineral buildup in appliance valves',
    kitchenNote: 'Renovated Leaside kitchens are typically larger than average, with island layouts and built-in appliance panels that require careful disassembly for service access'
  },
  {
    slug: 'lawrence-park',
    name: 'Lawrence Park',
    region: 'North Toronto',
    desc: 'Lawrence Park is one of Toronto\'s most prestigious residential neighbourhoods, located south of Lawrence Avenue between Yonge Street and Bayview Avenue. Homes here are valued at $1.5 million and above, featuring Arts and Crafts and Tudor Revival architecture on large lots. Residents invest in premium appliances — Miele, Sub-Zero, Wolf, and Thermador are standard. This is an old-money neighbourhood where service quality and discretion matter.',
    housing: 'Arts and Crafts, Tudor Revival, and Georgian Colonial homes on large wooded lots, many with coach houses',
    brands: 'Miele, Sub-Zero, Wolf, Thermador, Bosch, Viking',
    premiumBrands: true,
    demographics: 'High-income families, executives, professionals, multi-generational wealth',
    parkingNote: 'Lawrence Park has wide streets with easy residential parking; most homes have long driveways and some have circular drives',
    localLandmarks: 'Lawrence Park Ravine, Sherwood Park, Yonge-Lawrence Village, Alexander Muir Gardens',
    housingAge: '1910s–1950s original construction, meticulously maintained and renovated',
    waterNote: 'Lawrence Park homes often have water softener systems, but sediment from aging municipal connections can still reach appliance inlets',
    kitchenNote: 'Lawrence Park kitchens are large, often with separate butler\'s pantries and built-in Sub-Zero/Wolf configurations that require specialized service knowledge'
  },
  {
    slug: 'davisville-village',
    name: 'Davisville Village',
    region: 'Midtown Toronto',
    desc: 'Davisville Village is a midtown Toronto neighbourhood centred on the Davisville subway station, known for its mix of residential condos and charming detached homes. The area attracts young professionals and young families who value transit access and neighbourhood walkability. Newer condo builds feature Bosch, LG, and Samsung appliances, while the detached homes along Millwood Road and surrounding streets often have a mix of brands.',
    housing: 'Midtown condos (10-30 storeys), 1920s–1940s detached homes, semi-detached houses, and some newer townhome developments',
    brands: 'Bosch, LG, Samsung, Whirlpool, Miele',
    premiumBrands: false,
    demographics: 'Young professionals, young families, condo investors, and established homeowners',
    parkingNote: 'Condo buildings have visitor parking underground; street parking on Davisville and Millwood is metered; side streets have two-hour residential limits',
    localLandmarks: 'Davisville TTC station, June Rowlands Park, Mount Pleasant Cemetery, Midtown shops on Mount Pleasant Road',
    housingAge: '1920s–1940s detached homes, 2000s–2020s condo towers',
    waterNote: 'Davisville condo towers use municipal water directly; detached homes on older connections may have slightly higher mineral content reaching appliances',
    kitchenNote: 'Davisville condo kitchens are typically galley or L-shaped layouts under 100 square feet, requiring compact appliance service approaches'
  },
  {
    slug: 'cabbagetown',
    name: 'Cabbagetown',
    region: 'Downtown East Toronto',
    desc: 'Cabbagetown is a heritage district in downtown east Toronto, famous for its intact collection of Victorian row houses. The neighbourhood has gentrified significantly but retains a mix of renters and homeowners. Heritage kitchens are small, and doorways are narrow. Older appliances — Frigidaire, GE, Kenmore — are common in unrenovated units, while gentrified homes feature newer brands. The compact heritage layouts make appliance service uniquely challenging here.',
    housing: 'Victorian row houses (1870s–1900s), some converted into multi-unit rentals, with select modern infill',
    brands: 'GE, Frigidaire, Kenmore, Samsung, LG',
    premiumBrands: false,
    demographics: 'Mix of heritage homeowners, young professionals, renters, and artists',
    parkingNote: 'Street parking in Cabbagetown is permit-only on most residential streets; our technicians use Green P lots on Parliament or Carlton, or metered spots on Gerrard',
    localLandmarks: 'Riverdale Farm, Cabbagetown Heritage Conservation District, Allan Gardens, Winchester Hotel',
    housingAge: '1870s–1900s Victorian row houses, select 2000s infill',
    waterNote: 'Cabbagetown\'s Victorian-era plumbing — some homes still have sections of original lead service lines — can introduce sediment and mineral deposits to appliance water inlets',
    kitchenNote: 'Cabbagetown heritage kitchens are among the smallest in Toronto, often 60–80 square feet with narrow doorways that cannot accommodate standard 36-inch appliance delivery'
  },
  {
    slug: 'islington-village',
    name: 'Islington Village',
    region: 'Etobicoke',
    desc: 'Islington Village is an Etobicoke neighbourhood centred on the Islington subway station, featuring a mix of 1950s to 1980s detached homes and newer condo tower developments. The area serves suburban families who have lived here for decades alongside newer condo residents. Appliance brands reflect this mix: Kenmore and Whirlpool in established homes, Samsung and LG in newer towers.',
    housing: '1950s–1980s detached homes, bungalows, split-levels, and post-2000 condo towers near the subway',
    brands: 'Kenmore, Whirlpool, Samsung, LG, GE',
    premiumBrands: false,
    demographics: 'Established suburban families, empty nesters, and younger condo residents near the subway',
    parkingNote: 'Residential homes have driveway parking; condo buildings near Islington station have visitor parking underground; Dundas Street has metered parking',
    localLandmarks: 'Islington TTC station, Islington Village shops on Dundas, Montgomery\'s Inn, Etobicoke Civic Centre',
    housingAge: '1950s–1980s suburban homes, 2005+ condo towers',
    waterNote: 'Islington Village homes on 1960s copper pipes experience mineral scale buildup that affects dishwasher and washer performance over time',
    kitchenNote: 'Islington homes from the 1960s–1970s have standard-width kitchens with good appliance access, but some basement laundry rooms have low ceiling clearance'
  },
  {
    slug: 'humber-valley',
    name: 'Humber Valley',
    region: 'Etobicoke',
    desc: 'Humber Valley is a prestigious Etobicoke neighbourhood along the Humber River, known for large wooded lots and custom-built homes from the 1940s to 1960s. This is a high-income area where residents expect premium service and own premium appliances. Homes sit on generous lots with mature trees, and many have been updated with Wolf, Sub-Zero, and Miele kitchen packages. The neighbourhood values discretion and quality workmanship.',
    housing: 'Custom-built 1940s–1960s homes on large wooded lots, many extensively renovated with premium finishes',
    brands: 'Miele, Sub-Zero, Wolf, Bosch, KitchenAid, Thermador',
    premiumBrands: true,
    demographics: 'High-income families, executives, established professionals',
    parkingNote: 'Humber Valley homes have long driveways and generous street frontage; parking is never an issue for service visits',
    localLandmarks: 'Humber River trails, Old Mill Toronto, James Gardens, King\'s Mill Park',
    housingAge: '1940s–1960s custom homes, many renovated 1990s–2020s',
    waterNote: 'Humber Valley homes often have whole-house water filtration, but municipal water entering the system still carries mineral content that affects appliance components over years',
    kitchenNote: 'Humber Valley kitchens are large, often 200+ square feet, with built-in appliance panels and integrated refrigeration that requires specialized panel-removal service access'
  },
  {
    slug: 'birchcliff',
    name: 'Birchcliff',
    region: 'Scarborough',
    desc: 'Birchcliff is a gentrifying Scarborough neighbourhood near the Scarborough Bluffs, characterized by Cape Cod-style bungalows and modest homes built in the 1940s and 1950s. Long-time residents are being joined by young families drawn to the area\'s character and relative affordability. Older Maytag and Whirlpool appliances are gradually being replaced with LG and Samsung as homes change hands and kitchens are updated.',
    housing: 'Cape Cod bungalows, 1940s–1950s detached homes, some newer infill and renovations',
    brands: 'Maytag, Whirlpool, LG, Samsung, GE',
    premiumBrands: false,
    demographics: 'Long-time residents, young families, first-time homebuyers in a gentrifying market',
    parkingNote: 'Birchcliff has residential street parking and most homes have driveways; Kingston Road has metered parking for commercial stops',
    localLandmarks: 'Scarborough Bluffs, Bluffers Park, Birchcliff Public School, Kingston Road shops',
    housingAge: '1940s–1950s bungalows, some 2010s renovations and infill',
    waterNote: 'Birchcliff homes near the Bluffs experience slightly higher water pressure from the Scarborough pumping station, which can stress washer inlet valves and dishwasher fill valves',
    kitchenNote: 'Birchcliff bungalow kitchens are modest, typically 80–100 square feet, with standard appliance openings that accommodate straightforward service access'
  },
  {
    slug: 'scarborough-village',
    name: 'Scarborough Village',
    region: 'Scarborough',
    desc: 'Scarborough Village is a diverse Scarborough neighbourhood with significant South Asian, Caribbean, and East African communities. The housing stock consists primarily of 1960s to 1980s detached homes and townhouses. LG and Samsung are popular brands, reflecting South Asian market preferences, alongside Whirlpool in older installations. Multi-generational families are common, which means appliances run harder and more frequently than in smaller households.',
    housing: '1960s–1980s detached homes, townhouses, and some low-rise apartment buildings',
    brands: 'LG, Samsung, Whirlpool, GE, Kenmore',
    premiumBrands: false,
    demographics: 'South Asian, Caribbean, and East African families; multi-generational households',
    parkingNote: 'Scarborough Village has ample residential driveway parking and wide streets; Kingston Road and Markham Road have commercial parking lots',
    localLandmarks: 'Scarborough Village Recreation Centre, Thomson Memorial Park, Markham Road corridor, Kingston Road',
    housingAge: '1960s–1980s suburban homes',
    waterNote: 'Scarborough Village water comes from the Scarborough water treatment plant and is slightly harder than downtown Toronto water, accelerating scale buildup in appliances',
    kitchenNote: 'Scarborough Village homes have standard 1970s kitchen layouts with adequate appliance access, but multi-generational families often use appliances at higher frequency, accelerating wear'
  }
];

const services = [
  {
    slug: 'fridge-repair',
    name: 'Refrigerator Repair',
    appliance: 'Refrigerator',
    applianceLower: 'refrigerator',
    shortName: 'Fridge',
    costRange: '$150–$400',
    costLow: '$150',
    costHigh: '$400',
    problems: [
      { name: 'Not Cooling Properly', desc: 'Compressor, condenser fan, evaporator coil, and thermostat diagnostics for temperature issues.' },
      { name: 'Ice Buildup / Frost', desc: 'Defrost heater, timer, thermostat, and drain line inspection to eliminate frost accumulation.' },
      { name: 'Water Leaking', desc: 'Drain pan, water line, inlet valve, and defrost drain inspection and repair.' },
      { name: 'Strange Noises', desc: 'Fan motor, compressor mount, condenser coil, and evaporator fan noise isolation and repair.' },
      { name: 'Not Running / No Power', desc: 'Start relay, overload protector, control board, and power supply diagnostics.' },
      { name: 'Temperature Fluctuations', desc: 'Thermistor, damper control, air flow path, and sealed system diagnostics for inconsistent cooling.' }
    ],
    pricingRows: [
      ['Diagnostic visit (waived with repair)', '$80'],
      ['Standard repair — thermostat, fan, defrost system', '$150 – $300'],
      ['Control board / main electronic component', '$220 – $380'],
      ['Compressor / sealed system repair', '$300 – $500']
    ],
    warningSignsIntro: 'Call for refrigerator repair if you notice',
    warningSigns: [
      'Food spoiling faster than normal or inconsistent internal temperature',
      'Frost or ice buildup on the back wall or around the freezer compartment',
      'Water pooling under or inside the refrigerator',
      'The compressor runs continuously without cycling off',
      'Unusual humming, clicking, or buzzing sounds from behind or below the unit',
      'The refrigerator feels warm to the touch on the exterior sides'
    ],
    maintenanceTips: [
      'Clean condenser coils every 6–12 months (behind or beneath the unit) to maintain cooling efficiency',
      'Check and replace door gaskets if you can slide a piece of paper through a closed door — a failed seal wastes energy and causes temperature problems',
      'Keep the refrigerator at 37°F (3°C) and freezer at 0°F (-18°C) for optimal food safety',
      'Avoid overloading shelves, which blocks airflow and forces the compressor to work harder',
      'Clean the drain pan and defrost drain annually to prevent water leaks and odours'
    ],
    diagnosticSteps: [
      'Visual and auditory inspection of compressor operation, fan function, and temperature settings',
      'Electronic diagnostic scan of control board, thermistors, and sensor readings',
      'Sealed system pressure test if compressor or refrigerant issues are suspected',
      'Component-level testing of defrost heater, evaporator fan, condenser fan, and start relay'
    ]
  },
  {
    slug: 'washer-repair',
    name: 'Washer Repair',
    appliance: 'Washer',
    applianceLower: 'washer',
    shortName: 'Washer',
    costRange: '$120–$350',
    costLow: '$120',
    costHigh: '$350',
    problems: [
      { name: 'Not Starting / No Power', desc: 'Control board, door switch, thermal fuse, or power supply diagnostics and repair.' },
      { name: 'Error Codes / Faults', desc: 'Full diagnostic scan for all major brands — Samsung, LG, Whirlpool, Bosch and more.' },
      { name: 'Unusual Noises', desc: 'Bearing, motor, pump, and drum inspection to identify and eliminate noise at the source.' },
      { name: 'Leaking / Water Issues', desc: 'Hose, pump, seal, and valve inspection. Leak located and repaired in a single visit.' },
      { name: 'Won\'t Drain / Spin', desc: 'Drain pump, lid switch, motor coupling, and belt diagnostics for drainage and spin failures.' },
      { name: 'Control Board / Electronic', desc: 'Main board, display, sensors, and electronic component repair or replacement with OEM parts.' }
    ],
    pricingRows: [
      ['Diagnostic visit (waived with repair)', '$80'],
      ['Standard repair — motor, pump, element, valve', '$150 – $280'],
      ['Control board / main electronic component', '$220 – $380'],
      ['Complex repair — bearing, drum, transmission', '$280 – $450']
    ],
    warningSignsIntro: 'Call for washer repair if you notice',
    warningSigns: [
      'The washer won\'t start or stops mid-cycle with an error code',
      'Water pools under or around the machine during operation',
      'Loud banging, grinding, or squealing during the spin cycle',
      'Clothes come out excessively wet — the spin cycle isn\'t extracting water',
      'The drum won\'t agitate or spins in only one direction',
      'A burning or electrical smell during operation'
    ],
    maintenanceTips: [
      'Run a hot-water cleaning cycle monthly with washer cleaner or white vinegar to prevent mould and odour',
      'Leave the door open between loads on front-load machines to let the drum and gasket dry',
      'Check and clean the drain pump filter every 3 months (front-load) to prevent clogs',
      'Inspect inlet hoses annually and replace rubber hoses with braided stainless steel to prevent burst flooding',
      'Don\'t overload — follow the manufacturer\'s capacity guidelines to protect bearings and suspension'
    ],
    diagnosticSteps: [
      'Visual inspection of hoses, connections, and external components for obvious damage',
      'Electronic error code scan and control board diagnostic for digital fault detection',
      'Mechanical inspection of drum bearings, motor coupling, belt, and suspension system',
      'Water system test — inlet valves, drain pump, and pressure switch operation verification'
    ]
  },
  {
    slug: 'dryer-repair',
    name: 'Dryer Repair',
    appliance: 'Dryer',
    applianceLower: 'dryer',
    shortName: 'Dryer',
    costRange: '$130–$370',
    costLow: '$130',
    costHigh: '$370',
    problems: [
      { name: 'Not Heating', desc: 'Heating element, thermal fuse, thermostat, and gas igniter diagnostics for no-heat conditions.' },
      { name: 'Not Starting / No Power', desc: 'Door switch, start switch, thermal fuse, and control board diagnostics.' },
      { name: 'Takes Too Long to Dry', desc: 'Vent blockage, heating element, moisture sensor, and airflow restriction diagnostics.' },
      { name: 'Unusual Noises', desc: 'Drum roller, belt, idler pulley, and bearing inspection to isolate and repair noise sources.' },
      { name: 'Drum Not Turning', desc: 'Belt, motor, roller, and idler pulley diagnostics for drum rotation failures.' },
      { name: 'Overheating / Burning Smell', desc: 'Vent obstruction, thermostat, heating element, and lint buildup inspection — a fire safety priority.' }
    ],
    pricingRows: [
      ['Diagnostic visit (waived with repair)', '$80'],
      ['Standard repair — element, belt, thermostat, fuse', '$150 – $290'],
      ['Control board / main electronic component', '$220 – $380'],
      ['Complex repair — motor, gas valve, drum bearing', '$280 – $450']
    ],
    warningSignsIntro: 'Call for dryer repair if you notice',
    warningSigns: [
      'Clothes take more than one cycle to dry completely',
      'The dryer runs but produces no heat at all',
      'A burning smell during operation — this is a fire hazard that needs immediate attention',
      'Loud thumping, squealing, or grinding noises during tumbling',
      'The drum does not turn when the motor is running',
      'The dryer shuts off mid-cycle before clothes are dry'
    ],
    maintenanceTips: [
      'Clean the lint trap after every single load — this is the most important dryer maintenance step',
      'Have the dryer vent professionally cleaned annually to prevent fire hazards and improve drying efficiency',
      'Check the exterior vent flap to ensure it opens freely and isn\'t blocked by debris or ice in winter',
      'Don\'t overload the dryer — overloading strains the motor, belt, and bearings and causes uneven drying',
      'For gas dryers, ensure the gas line connection is checked during annual service visits'
    ],
    diagnosticSteps: [
      'Lint trap and exhaust vent airflow test to rule out blockage as the cause of heating or drying issues',
      'Heating system diagnostic — element continuity, thermal fuse, cycling thermostat, and high-limit thermostat testing',
      'Mechanical inspection of drum rollers, belt tension, idler pulley, and motor operation',
      'Electronic control board and moisture sensor diagnostic for cycle and timing issues'
    ]
  },
  {
    slug: 'dishwasher-repair',
    name: 'Dishwasher Repair',
    appliance: 'Dishwasher',
    applianceLower: 'dishwasher',
    shortName: 'Dishwasher',
    costRange: '$130–$350',
    costLow: '$130',
    costHigh: '$350',
    problems: [
      { name: 'Not Cleaning Properly', desc: 'Spray arm, wash motor, water inlet valve, and detergent dispenser diagnostics for poor cleaning results.' },
      { name: 'Not Draining', desc: 'Drain pump, drain hose, air gap, and garbage disposal connection diagnostics for standing water.' },
      { name: 'Leaking Water', desc: 'Door gasket, tub seal, spray arm, and water inlet valve inspection for leak sources.' },
      { name: 'Not Starting / No Power', desc: 'Door latch, control board, thermal fuse, and power supply diagnostics.' },
      { name: 'Strange Noises', desc: 'Wash motor, drain pump, spray arm bearing, and chopper blade inspection for noise sources.' },
      { name: 'Not Drying Dishes', desc: 'Heating element, vent, rinse aid dispenser, and fan motor diagnostics for drying failures.' }
    ],
    pricingRows: [
      ['Diagnostic visit (waived with repair)', '$80'],
      ['Standard repair — pump, valve, gasket, latch', '$140 – $270'],
      ['Control board / main electronic component', '$220 – $370'],
      ['Complex repair — motor, tub seal, spray system', '$260 – $420']
    ],
    warningSignsIntro: 'Call for dishwasher repair if you notice',
    warningSigns: [
      'Standing water in the bottom of the tub after a completed cycle',
      'Dishes come out dirty, filmy, or with food residue after washing',
      'Water leaking from the door seal or pooling under the unit',
      'The dishwasher won\'t start or stops mid-cycle with an error light',
      'A foul odour from inside the dishwasher even after cleaning',
      'The heating element doesn\'t warm during the dry cycle'
    ],
    maintenanceTips: [
      'Clean the filter at the bottom of the tub monthly to prevent food buildup and drainage issues',
      'Run an empty hot cycle with dishwasher cleaner or white vinegar monthly to remove grease and mineral deposits',
      'Check and clean the spray arm nozzles — mineral deposits from Toronto\'s hard water clog them over time',
      'Inspect the door gasket for food debris, mould, or damage that could cause leaks',
      'Use rinse aid consistently to improve drying performance and reduce water spots'
    ],
    diagnosticSteps: [
      'Visual inspection of spray arms, filter, gaskets, and tub interior for obvious obstructions or damage',
      'Electronic control board and cycle diagnostic to verify proper cycle sequencing and error codes',
      'Water system test — inlet valve flow rate, drain pump operation, and water level verification',
      'Mechanical inspection of wash motor, chopper blade, and door latch mechanism'
    ]
  },
  {
    slug: 'oven-repair',
    name: 'Oven Repair',
    appliance: 'Oven',
    applianceLower: 'oven',
    shortName: 'Oven',
    costRange: '$140–$400',
    costLow: '$140',
    costHigh: '$400',
    problems: [
      { name: 'Not Heating / Won\'t Reach Temperature', desc: 'Heating element, igniter, thermostat, and temperature sensor diagnostics for heating failures.' },
      { name: 'Uneven Cooking', desc: 'Convection fan, element, thermostat calibration, and door seal inspection for hot and cold spots.' },
      { name: 'Self-Clean Failure', desc: 'Door lock mechanism, thermal fuse, control board, and high-limit thermostat diagnostics.' },
      { name: 'Door Won\'t Open or Close', desc: 'Hinge, spring, door lock solenoid, and latch mechanism repair for door operation issues.' },
      { name: 'Control Panel / Display Issues', desc: 'Touchpad, control board, ribbon cable, and membrane switch diagnostics and replacement.' },
      { name: 'Gas Oven Ignition Problems', desc: 'Igniter, gas valve, flame sensor, and spark module diagnostics for gas ovens that won\'t light.' }
    ],
    pricingRows: [
      ['Diagnostic visit (waived with repair)', '$80'],
      ['Standard repair — element, igniter, thermostat, sensor', '$150 – $300'],
      ['Control board / touchpad replacement', '$230 – $400'],
      ['Complex repair — gas valve, door mechanism, convection motor', '$280 – $480']
    ],
    warningSignsIntro: 'Call for oven repair if you notice',
    warningSigns: [
      'The oven doesn\'t heat at all or takes much longer than normal to preheat',
      'Food cooks unevenly — burned on one side, raw on the other',
      'The oven temperature doesn\'t match the setting on the dial or display',
      'The self-clean cycle won\'t start or the door locks and won\'t unlock afterward',
      'A gas smell when the oven is on — turn off the gas and call immediately',
      'The control panel is unresponsive, flickering, or displaying error codes'
    ],
    maintenanceTips: [
      'Clean spills promptly to prevent baked-on residue that can damage the oven interior and cause smoke',
      'Test oven temperature accuracy annually with an oven thermometer — recalibration may be needed',
      'Inspect the door gasket seal for tears or gaps that allow heat to escape and cause uneven cooking',
      'For gas ovens, have the igniter and burner inspected annually as part of routine safety maintenance',
      'Avoid using the self-clean cycle more than 2-3 times per year, as the extreme heat stresses thermal fuses and door locks'
    ],
    diagnosticSteps: [
      'Visual inspection of heating elements, igniters, and interior components for visible damage or wear',
      'Temperature accuracy test using a calibrated thermometer to verify the oven reaches and maintains the set temperature',
      'Electronic control board diagnostic — error code scan, sensor readings, and relay operation verification',
      'Gas system inspection (gas ovens) — igniter glow test, gas valve operation, and flame pattern analysis'
    ]
  }
];

function generateContent(hood, svc) {
  const h = hood;
  const s = svc;

  // Build unique body content per neighbourhood+service combination
  const contentBlocks = [];

  // Neighbourhood intro paragraph
  contentBlocks.push(`<h2>${s.appliance} Repair in ${h.name} — ${h.housing}</h2>`);
  contentBlocks.push(`<p>${h.desc} When ${s.applianceLower} problems arise in ${h.name}, residents need a technician who understands both the appliance and the home it sits in. N Appliance Repair provides same-day ${s.applianceLower} repair across ${h.name} and the surrounding ${h.region} area, with technicians who carry parts for ${h.brands} and other brands commonly found in this neighbourhood.</p>`);

  // Why this neighbourhood needs specific attention
  contentBlocks.push(`<h2>Why ${h.name} Homes Need Specialized ${s.appliance} Service</h2>`);
  contentBlocks.push(`<p>${h.name} housing stock — ${h.housingAge} — creates specific conditions that affect ${s.applianceLower} performance and longevity. ${h.kitchenNote}. ${h.waterNote}. Our technicians who service ${h.name} regularly understand these local conditions and arrive prepared with the right parts and approach for ${h.region} homes.</p>`);

  // Common failures - unique per appliance+neighbourhood
  contentBlocks.push(`<h2>Common ${s.appliance} Failures in ${h.name}</h2>`);

  if (s.slug === 'fridge-repair') {
    if (h.premiumBrands) {
      contentBlocks.push(`<p>Premium refrigerators in ${h.name} — including Sub-Zero, Miele, and Thermador models common in ${h.region} homes — develop specific failure patterns as they age. Sub-Zero compressor relay failures cause the unit to stop cooling without warning, a critical issue when these built-in units contain hundreds of dollars in perishable food. Miele refrigerators in ${h.name} often develop electronic control board faults after 7-10 years, causing temperature fluctuations that spoil food gradually before the owner notices. Thermador column refrigerators can develop sealed system leaks that require specialized recovery equipment. Our technicians carry diagnostic tools calibrated for these premium brands and stock common replacement parts for faster service in ${h.name}.</p>`);
      contentBlocks.push(`<p>Beyond premium brands, ${h.name} also has Bosch and KitchenAid refrigerators in renovated kitchens. Bosch counter-depth models develop evaporator fan motor failures that cause the freezer to ice up while the fresh food section warms. KitchenAid French door refrigerators experience ice maker failures and water dispenser leaks, particularly in homes where the water line connection uses the original 1/4-inch copper tubing that has developed micro-cracks over years of use. We diagnose and repair all of these in ${h.name} homes on the first visit whenever possible.</p>`);
    } else {
      contentBlocks.push(`<p>The ${s.applianceLower} brands most common in ${h.name} — ${h.brands} — each have characteristic failure patterns that our technicians encounter regularly in ${h.region}. Samsung refrigerators develop ice buildup behind the rear panel of the freezer section, a defrost system failure that causes the fridge section to warm gradually. LG refrigerators experience compressor failures covered under a manufacturer recall, and our technicians can determine if your unit qualifies. Whirlpool and GE models in older ${h.name} homes often have condenser coil efficiency problems caused by years of dust accumulation in basement or kitchen installations where airflow is restricted.</p>`);
      contentBlocks.push(`<p>In ${h.name}'s ${h.housingAge} housing, refrigerator placement and installation conditions vary significantly. Older homes may have the refrigerator in a tight kitchen alcove with minimal clearance for condenser airflow, which accelerates compressor wear. Newer condos have built-in refrigerator cavities with specified clearances, but poor ventilation in galley kitchens can still cause overheating. ${h.waterNote}, which affects refrigerators with water dispensers and ice makers by causing inlet valve deposits and reduced water flow over time.</p>`);
    }
  } else if (s.slug === 'washer-repair') {
    if (h.premiumBrands) {
      contentBlocks.push(`<p>Washing machines in ${h.name}'s premium homes range from high-end Miele and Bosch units in renovated laundry rooms to legacy Whirlpool and Maytag machines that have served these homes for decades. Miele front-load washers in ${h.name} develop drain pump failures and control board faults after extensive use — these are durable machines, but they are also complex, and repair requires Miele-specific diagnostic software that our technicians carry. Bosch 500 and 800 series washers, popular in ${h.name} renovations, experience E04 drain errors and bearing noise after 6-8 years of heavy family use.</p>`);
      contentBlocks.push(`<p>Legacy washers in unrenovated sections of ${h.name} homes — Whirlpool top-loaders and Maytag Centennial models from the 2000s — are simpler machines with simpler failures. Lid switch replacement, pump motor service, and belt changes are common and economical repairs that keep these workhorses running. ${h.waterNote}, which is particularly relevant for washers as mineral buildup affects drain pump efficiency and detergent dissolving performance. Our technicians service both premium and legacy washers in ${h.name} with equal expertise.</p>`);
    } else {
      contentBlocks.push(`<p>The most common washer failures in ${h.name} reflect the neighbourhood's mix of ${h.brands} machines in ${h.housingAge} housing. Samsung front-load washers — the WF series that's standard in many ${h.name} homes and condos — develop drum bearing failure between years five and eight, announced by a grinding noise during spin cycles that gets progressively louder. LG washers trigger OE drain errors when the drain pump accumulates debris, a frequent issue in households with children. Whirlpool top-load washers in older ${h.name} homes experience lid switch failures and pump motor burnout, both repairable in a single visit.</p>`);
      contentBlocks.push(`<p>${h.name}'s housing conditions affect washer performance in specific ways. ${h.kitchenNote}. ${h.waterNote}. In multi-level homes, basement laundry installations can experience drain issues from long horizontal drain runs, while upper-floor laundry closets in newer ${h.name} builds sometimes develop vibration problems from insufficient floor reinforcement. Our ${h.region} technicians understand these installation variables and diagnose accordingly.</p>`);
    }
  } else if (s.slug === 'dryer-repair') {
    if (h.premiumBrands) {
      contentBlocks.push(`<p>Dryers in ${h.name}'s premium homes include Miele heat-pump dryers, Bosch condensation dryers, and traditional vented units from Whirlpool and Maytag. Miele heat-pump dryers in ${h.name} are energy-efficient but develop condenser blockages and heat-pump refrigerant issues that require specialized service. Bosch condensation dryers — popular in ${h.name} renovations where external venting is impractical — experience water tank sensor failures and condenser cleaning alerts that indicate internal blockage.</p>`);
      contentBlocks.push(`<p>Traditional vented dryers in ${h.name} homes face the universal challenge of vent maintenance. ${h.name}'s older homes often have long, multi-bend dryer vent runs that accumulate lint faster than short, straight runs. A partially blocked vent forces the dryer to work harder, overheats the thermal fuse, and in serious cases creates a fire hazard. We inspect the vent system as part of every dryer repair call in ${h.name} and recommend professional vent cleaning if lint accumulation exceeds safe levels. ${h.kitchenNote}, which can affect dryer placement and vent routing.</p>`);
    } else {
      contentBlocks.push(`<p>Dryer repairs in ${h.name} most commonly involve ${h.brands} machines in the neighbourhood's ${h.housingAge} housing stock. The most frequent dryer failure across all brands is a blown thermal fuse — a safety device that cuts power to the heating element when the dryer overheats. In ${h.name} homes, thermal fuse failures are often caused by lint-clogged exhaust vents rather than a defective dryer. Samsung dryers in ${h.name} display HE error codes when the heating system fails. LG dryers trigger d80/d90 vent blockage warnings. Whirlpool and GE dryers simply stop heating without a diagnostic code, requiring manual testing.</p>`);
      contentBlocks.push(`<p>${h.name}'s ${h.housingAge} homes present specific dryer installation conditions. Older homes often have long vent runs through walls and up through the roof, accumulating lint over years. Condo units have shorter vent runs but shared vent systems in some buildings that reduce airflow efficiency. ${h.waterNote} — while this primarily affects washers and dishwashers, humidity from water-heavy appliances in enclosed laundry spaces also affects dryer performance by increasing the moisture load. We assess the complete dryer environment in every ${h.name} service call.</p>`);
    }
  } else if (s.slug === 'dishwasher-repair') {
    if (h.premiumBrands) {
      contentBlocks.push(`<p>Dishwashers in ${h.name} homes lean heavily toward premium European brands — Miele, Bosch, and Thermador panel-ready models are standard in this neighbourhood's renovated kitchens. Miele dishwashers in ${h.name} develop intake valve failures and circulation pump issues after 8-12 years, and their integrated panel designs require careful disassembly to access internal components. Bosch 800 series and Benchmark dishwashers experience E15 water leak sensor errors when even a small amount of moisture reaches the base pan — a sensitive safety feature that sometimes triggers from condensation rather than actual leaks.</p>`);
      contentBlocks.push(`<p>Thermador Star Sapphire and Emerald dishwashers in ${h.name}'s premium kitchens share the Bosch platform but have additional features — like the Star Speed wash system — that introduce additional failure points. ${h.waterNote}. Toronto's water hardness is a significant factor for dishwasher performance in ${h.name}: mineral deposits clog spray arm nozzles, coat the interior tub surface, and reduce cleaning effectiveness gradually. Premium dishwashers are more sensitive to water quality than budget models, and regular maintenance is essential.</p>`);
    } else {
      contentBlocks.push(`<p>Dishwasher repairs in ${h.name} typically involve ${h.brands} models in the neighbourhood's ${h.housingAge} homes. The most common failure across all brands is a clogged drain pump or blocked drain hose, which leaves standing water in the bottom of the tub after a cycle completes. Samsung dishwashers in ${h.name} display OC or 0C error codes for drain failures. Bosch models trigger E24 and E25 drain errors. Whirlpool dishwashers simply leave water without a diagnostic code. In all cases, the repair involves accessing the drain pump through the lower panel, clearing the obstruction, and testing the pump motor.</p>`);
      contentBlocks.push(`<p>${h.name}'s housing conditions create specific dishwasher challenges. ${h.kitchenNote}. Older homes in ${h.name} may have the dishwasher connected to an aging drain system that doesn't flow as quickly as modern plumbing, contributing to drain-back issues. ${h.waterNote}. Toronto's water hardness means ${h.name} dishwashers accumulate mineral deposits on spray arms, heating elements, and interior surfaces faster than in cities with softer water. Using rinse aid and running monthly cleaning cycles helps, but professional descaling is sometimes necessary.</p>`);
    }
  } else if (s.slug === 'oven-repair') {
    if (h.premiumBrands) {
      contentBlocks.push(`<p>Ovens in ${h.name} kitchens include professional-grade Wolf, Thermador, and Miele units alongside high-end Bosch and KitchenAid models. Wolf dual-fuel ranges in ${h.name} develop igniter failures on individual burners and oven igniter degradation that causes slow preheating — a carbon-silicon igniter that glows but can no longer draw enough current to open the gas valve. Thermador Pro Grand and Pro Harmony ranges experience similar igniter issues plus convection fan motor failures in the oven cavity. Miele ovens in ${h.name} develop electronic control board faults and moisture sensor errors in their steam-assisted models.</p>`);
      contentBlocks.push(`<p>Premium ovens in ${h.name} homes are often built into custom cabinetry with integrated ventilation systems, making service access more complex than freestanding units. ${h.kitchenNote}. Our technicians who service ${h.name} are experienced with panel-ready and built-in oven configurations and carry the specialized tools required for Wolf, Thermador, and Miele service access. We also carry common igniters, thermal fuses, and control board components for these premium brands to enable first-visit resolution whenever possible.</p>`);
    } else {
      contentBlocks.push(`<p>Oven repairs in ${h.name} cover the range of ${h.brands} models found in the neighbourhood's ${h.housingAge} homes. Electric ovens — the majority in ${h.name} — most commonly fail due to a burned-out bake or broil element, which is visible as a break or blister in the element when you look inside the oven. Samsung electric ranges in ${h.name} also experience touch-panel control board failures that make the oven unresponsive. Gas ovens, common in older ${h.name} homes, develop weak igniters that glow orange but can't open the gas valve, causing the oven to fail to light or take 15+ minutes to preheat.</p>`);
      contentBlocks.push(`<p>${h.name}'s ${h.housingAge} housing stock affects oven installations in specific ways. ${h.kitchenNote}. Older homes may have 30-inch oven cutouts that limit replacement options, making repair more economical than replacement. Gas oven installations in older ${h.name} homes sometimes have aging flex connectors that should be inspected during service calls. ${h.waterNote} — while this doesn't directly affect oven operation, steam ovens and combination units that use water lines are affected by mineral buildup. Our technicians assess the complete oven environment in ${h.name} to provide accurate diagnoses.</p>`);
    }
  }

  // How we serve this neighbourhood
  contentBlocks.push(`<h2>How We Serve ${h.name}</h2>`);
  contentBlocks.push(`<p>${h.parkingNote}. We service all of ${h.name} and the surrounding ${h.region} area with same-day availability Monday through Saturday when you call before 2 PM. Our technicians know ${h.name}'s streets, landmarks (${h.localLandmarks}), and building types. Whether your ${s.applianceLower} is in a ${h.housing.split(',')[0].toLowerCase()} or a ${h.housing.split(',').pop().trim().toLowerCase()}, we arrive with the tools, parts, and experience to complete the repair efficiently.</p>`);

  // Diagnostic process
  contentBlocks.push(`<h2>Our ${s.appliance} Diagnostic Process</h2>`);
  contentBlocks.push(`<p>Every ${s.applianceLower} repair in ${h.name} begins with a systematic four-step diagnostic that identifies the root cause before any work begins:</p>`);
  contentBlocks.push('<ul>');
  s.diagnosticSteps.forEach((step, i) => {
    contentBlocks.push(`<li><strong>Step ${i + 1}:</strong> ${step}</li>`);
  });
  contentBlocks.push('</ul>');
  contentBlocks.push(`<p>Once we identify the problem, we provide a firm written quote before any repair work begins. The $80 diagnostic fee is waived when you proceed with the repair. Most ${s.applianceLower} repairs in ${h.name} are completed in one to two hours on the first visit.</p>`);

  // Cost guide
  // (handled in pricing table section)

  // Warning signs
  contentBlocks.push(`<h2>Warning Signs Your ${s.appliance} Needs Repair</h2>`);
  contentBlocks.push(`<p>${s.warningSignsIntro} any of these symptoms in your ${h.name} home:</p>`);
  contentBlocks.push('<ul>');
  s.warningSigns.forEach(sign => {
    contentBlocks.push(`<li>${sign}</li>`);
  });
  contentBlocks.push('</ul>');
  contentBlocks.push(`<p>If you notice any of these warning signs, call ${PHONE} for same-day ${s.applianceLower} repair in ${h.name}. Early diagnosis often prevents more expensive failures down the road.</p>`);

  // Why choose us
  contentBlocks.push(`<h2>Why ${h.name} Residents Choose N Appliance Repair</h2>`);
  contentBlocks.push(`<p>N Appliance Repair has built a reputation in ${h.name} and across ${h.region} for reliable, transparent ${s.applianceLower} repair service. Our technicians are licensed, insured, and experienced with the specific brands and housing types found in ${h.name}. We provide upfront pricing with no hidden fees, use OEM parts for lasting repairs, and back every job with a 90-day warranty on parts and labour. With 4.9 stars across 5,200+ reviews, we're the top-rated appliance repair service in the GTA.</p>`);
  contentBlocks.push(`<p>We understand that a broken ${s.applianceLower} disrupts your daily routine. That's why we offer same-day service throughout ${h.name}, carry common parts for ${h.brands} on our service vehicles, and aim to complete repairs on the first visit. Our ${h.demographics.toLowerCase()} customers appreciate our punctuality, clean work habits, and honest assessments — if a repair doesn't make economic sense, we'll tell you.</p>`);

  // Maintenance tips
  contentBlocks.push(`<h2>${s.appliance} Maintenance Tips for ${h.name} Homeowners</h2>`);
  contentBlocks.push(`<p>Proper maintenance extends the life of your ${s.applianceLower} and prevents many common failures. Here are our top recommendations for ${h.name} residents:</p>`);
  contentBlocks.push('<ul>');
  s.maintenanceTips.forEach(tip => {
    contentBlocks.push(`<li>${tip}</li>`);
  });
  contentBlocks.push('</ul>');
  contentBlocks.push(`<p class="local-tip"><strong>Local tip for ${h.name} residents:</strong> ${h.waterNote}. Consider using a water softener or descaling your ${s.applianceLower} periodically to counteract Toronto's mineral-heavy municipal water supply.</p>`);

  return contentBlocks.join('\n');
}

function generateFAQs(hood, svc) {
  const h = hood;
  const s = svc;
  const brandList = h.brands;

  return [
    {
      q: `How much does ${s.applianceLower} repair cost in ${h.name}?`,
      a: `${s.appliance} repair in ${h.name} typically costs ${s.costRange}. The exact price depends on the brand, model, and specific issue. ${brandList.split(',')[0].trim()} and ${brandList.split(',')[1].trim()} repairs in ${h.name}'s ${h.housingAge.split(',')[0]} homes are among our most common calls. The $80 diagnostic fee is waived when you proceed with the repair. We provide a firm written quote before any work begins.`
    },
    {
      q: `What ${s.applianceLower} brands do you repair in ${h.name}?`,
      a: `We repair all major ${s.applianceLower} brands in ${h.name}, including ${brandList}. ${h.name}'s housing stock — ${h.housingAge} — contains a characteristic mix of these brands, and our technicians carry common parts for all of them on our service vehicles for same-day resolution.`
    },
    {
      q: `Is same-day ${s.applianceLower} repair available in ${h.name}?`,
      a: `Yes. We offer same-day ${s.applianceLower} repair throughout ${h.name} and the surrounding ${h.region} area. Call ${PHONE} before 2 PM Monday through Saturday to confirm a same-day appointment. Sunday service is available from 9 AM to 6 PM.`
    },
    {
      q: `How long does a typical ${s.applianceLower} repair take in ${h.name}?`,
      a: `Most ${s.applianceLower} repairs in ${h.name} are completed in one to two hours on the first visit. Complex repairs involving sealed systems, control board replacements, or hard-to-source parts may require a follow-up visit. Our technician will give you an accurate time estimate after completing the diagnostic.`
    },
    {
      q: `Do you offer a warranty on ${s.applianceLower} repairs in ${h.name}?`,
      a: `Yes. Every ${s.applianceLower} repair we perform in ${h.name} carries a 90-day warranty on both parts and labour. If the same issue returns within 90 days, we fix it at no additional charge. We use OEM parts for reliable, durable repairs.`
    },
    {
      q: `Is it worth repairing my ${s.applianceLower} in ${h.name} or should I replace it?`,
      a: `For most ${s.applianceLower}s under 10-12 years old, repair is significantly more cost-effective than replacement. A typical repair at ${s.costRange} versus a new unit at $700-$1,500+ makes clear economic sense. Our technician provides an honest assessment during the diagnostic — if repair costs exceed 50% of replacement value, we'll recommend replacing.`
    }
  ];
}

function generatePage(hood, svc) {
  const h = hood;
  const s = svc;
  const title = `${s.appliance} Repair ${h.name} | Same-Day | ${BRAND}`;
  const metaDesc = `Expert ${s.applianceLower} repair in ${h.name}. ${s.costRange} typical cost. Same-day service, 90-day warranty, 4.9★ rated. Call ${PHONE}.`;
  const canonical = `https://nappliancerepair.com/${s.slug}-${h.slug}`;
  const faqs = generateFAQs(h, s);
  const bodyContent = generateContent(h, s);

  const faqSchemaEntities = faqs.map(f => `        {
          "@type": "Question",
          "name": ${JSON.stringify(f.q)},
          "acceptedAnswer": {
            "@type": "Answer",
            "text": ${JSON.stringify(f.a)}
          }
        }`).join(',\n');

  const faqHTML = faqs.map(f => `        <details class="faq-item">
  <summary class="faq-question">
    <span class="faq-q-text">${f.q}</span>
    <span class="faq-icon" aria-hidden="true">+</span>
  </summary>
  <div class="faq-answer"><p>${f.a}</p></div>
</details>`).join('\n');

  // Related services for this neighbourhood
  const otherServices = services.filter(x => x.slug !== s.slug);
  const relatedServicesHTML = otherServices.map(x =>
    `<li><a href="/${x.slug}-${h.slug}">${x.appliance} Repair in ${h.name}</a></li>`
  ).join('\n');

  // Related areas for this service
  const otherHoods = neighbourhoods.filter(x => x.slug !== h.slug).slice(0, 5);
  const relatedAreasHTML = otherHoods.map(x =>
    `<li><a href="/${s.slug}-${x.slug}">${s.appliance} Repair in ${x.name}</a></li>`
  ).join('\n');

  const brandLinks = ['Samsung', 'LG', 'Whirlpool', 'GE', 'Bosch', 'Frigidaire', 'Kenmore', 'Maytag', 'KitchenAid'].map(b =>
    `<li><a href="/${b.toLowerCase().replace(/ /g,'-')}-repair">${b}</a></li>`
  ).join('\n');

  // Determine breadcrumb service name and link
  const breadcrumbService = s.name;
  const breadcrumbServiceLink = `/${s.slug}`;

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

<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "name": "${BRAND}",
      "telephone": "${PHONE_LINK}",
      "url": "https://nappliancerepair.com",
      "datePublished": "${DATE}",
      "dateModified": "${DATE}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${h.name}",
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
      "name": "${s.appliance} Repair in ${h.name}",
      "provider": {
        "@type": "LocalBusiness",
        "name": "${BRAND}"
      },
      "areaServed": "${h.name}",
      "description": "Professional ${s.applianceLower} repair service in ${h.name}"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
${faqSchemaEntities}
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
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${BRAND}">
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
    <a href="${breadcrumbServiceLink}" itemprop="item"><span itemprop="name">${breadcrumbService}</span></a>
    <meta itemprop="position" content="2">
  </li>
  <span class="breadcrumb-sep" aria-hidden="true">/</span>
  <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span class="breadcrumb-current" itemprop="name">${h.name}</span>
    <meta itemprop="position" content="3">
  </li>
</ol></div>
</nav>

<!-- Page Hero -->
<section class="page-hero" aria-label="Page header">
  <div class="container">
    <div class="page-hero-eyebrow">${BRAND} &middot; Toronto &amp; GTA</div>
    <h1 class="page-h1">${s.appliance} Repair in ${h.name}</h1>
    <div class="answer-box">Professional ${s.applianceLower} repair in ${h.name} and across ${h.region}. We fix all brands — ${h.brands} and more. Same-day service, ${s.costRange} typical cost, 90-day warranty. Call ${PHONE}.</div>
    <div class="page-hero-ctas">
      <a href="tel:${PHONE_LINK}" class="btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Call ${PHONE}
      </a>
      <a href="${BOOKING}" class="btn-secondary" target="_blank" rel="noopener">
        Book Online &rarr;
      </a>
    </div>
  </div>
</section>

<div class="answer-capsule" style="background:#EFF6FF;border-left:4px solid #2563EB;padding:1rem 1.25rem;margin:1rem auto;max-width:900px;border-radius:0 8px 8px 0;font-family:'Instrument Sans',sans-serif" itemscope itemtype="https://schema.org/Service">
  <div style="font-size:.7rem;font-weight:700;letter-spacing:.08em;color:#2563EB;text-transform:uppercase;margin-bottom:.4rem">Quick Answer</div>
  <p style="margin:0;color:#1E3A5F;font-size:.9rem;line-height:1.6" itemprop="description">${BRAND} provides same-day ${s.applianceLower} repair in ${h.name}. Call ${PHONE} — available 7 days a week, including evenings. Typical cost ${s.costRange}. All major brands: ${h.brands}. Most repairs completed in 1-2 hours on the first visit. 90-day parts &amp; labour warranty.</p>
</div>

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
${bodyContent}
</div>

  <!-- Service Details -->
  <section class="service-details fade-in" aria-label="Common problems and pricing">
    <div class="section-label">Common issues</div>
    <h2 class="section-title">Common ${s.appliance} Problems We Fix</h2>
    <div class="problems-grid">
${s.problems.map(p => `      <div class="problem-card">
        <div class="problem-name">${p.name}</div>
        <div class="problem-desc">${p.desc}</div>
      </div>`).join('\n')}
    </div>

    <div class="section-label" style="margin-top: 48px;">Pricing</div>
    <h2 class="section-title">${s.appliance} Repair Cost in ${h.name}</h2>
    <table class="pricing-table" aria-label="Repair pricing">
      <thead>
        <tr>
          <th>Repair Type</th>
          <th>Typical Cost</th>
        </tr>
      </thead>
      <tbody>
${s.pricingRows.map(r => `        <tr>
          <td>${r[0]}</td>
          <td>${r[1]}</td>
        </tr>`).join('\n')}
      </tbody>
    </table>
    <p class="pricing-note">All prices include OEM parts and labour. Firm written quote provided before any work begins.</p>
  </section>

  <!-- Booking Section -->
  <section class="booking-section fade-in" aria-label="Book your repair">
    <div class="section-label">Online booking</div>
    <h2>Book ${s.appliance} Repair in ${h.name}</h2>
    <p>Choose a convenient time &mdash; real-time availability, instant confirmation, no commitment required.</p>
    <iframe
      src="${BOOKING}?embed=true"
      title="Book ${s.appliance} Repair in ${h.name}"
      loading="lazy"
    ></iframe>
    <p class="booking-alt">Prefer to call? <a href="tel:${PHONE_LINK}">${PHONE}</a> &mdash; Mon&ndash;Sat 8am&ndash;8pm, Sun 9am&ndash;6pm</p>
  </section>

  <!-- FAQ Section -->
  <section class="faq-section fade-in" aria-label="Frequently asked questions">
    <div class="container" style="padding:0;">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
${faqHTML}
      </div>
    </div>
  </section>

  <!-- Related Links -->
  <section class="related-links fade-in" aria-label="Related pages">
    <div class="related-links-grid">
      <div class="related-col">
        <h3>Related Services</h3>
        <ul class="related-list">${relatedServicesHTML}</ul>
      </div>
      <div class="related-col">
        <h3>Nearby Areas</h3>
        <ul class="related-list">${relatedAreasHTML}</ul>
      </div>
      <div class="related-col">
        <h3>Brands We Service</h3>
        <ul class="related-list">${brandLinks}</ul>
      </div>
    </div>
  </section>

</main>

<!-- Sticky Bottom Bar -->
<div id="sticky-bottom" role="complementary" aria-label="Quick call bar">
  <span class="sticky-label">${s.appliance} repair in ${h.name} &mdash;</span>
  <a href="tel:${PHONE_LINK}" class="sticky-phone" aria-label="Call ${BRAND}">
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

// Generate all 50 pages
const created = [];
for (const hood of neighbourhoods) {
  for (const svc of services) {
    const filename = `${svc.slug}-${hood.slug}.html`;
    const filepath = path.join('C:/nappliancerepair', filename);
    const html = generatePage(hood, svc);
    fs.writeFileSync(filepath, html, 'utf8');
    created.push(filename);
    console.log(`Created: ${filename}`);
  }
}

console.log(`\nTotal files created: ${created.length}`);
