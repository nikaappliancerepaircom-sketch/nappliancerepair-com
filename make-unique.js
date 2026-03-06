#!/usr/bin/env node
/**
 * make-unique.js — Inject unique city-specific content into NAR city pages
 * Targets: <div class="content-intro fade-in"> section
 * Injects a unique paragraph after the first <p> inside content-intro
 * Marker: <!-- UNIQUE-CITY-CONTENT --> ... <!-- END-UNIQUE-CITY-CONTENT -->
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ── City data: unique content per city ──
const CITY_DATA = {
  'brampton': {
    name: 'Brampton',
    neighborhoods: ['Springdale', 'Heart Lake', 'Bramalea'],
    housing: 'rapidly expanding subdivisions built between 2005 and 2022, alongside established 1970s split-level homes in Bramalea and Brampton East',
    fact: 'Brampton draws its water from Lake Ontario via the Peel Region treatment system, and the long distribution distance means higher chlorine levels that can degrade dishwasher door gaskets and rubber inlet valves faster than in lakeshore communities. Hard water mineral buildup is also common in older Bramalea-area pipes, accelerating scale deposits on fridge water filters and dishwasher heating elements.',
    area: 'Northwest GTA',
    tip: 'Newer Brampton subdivisions in Springdale and Mount Pleasant often have open-concept kitchens with islands — running a dishwasher supply line to an island requires drilling through the subfloor and routing around floor joists, which adds complexity our technicians plan for during the initial site assessment.'
  },
  'mississauga': {
    name: 'Mississauga',
    neighborhoods: ['Port Credit', 'Erin Mills', 'Clarkson'],
    housing: '1970s-1990s detached homes in Erin Mills and Meadowvale, mixed with lakefront heritage properties in Port Credit and modern high-rise condos along Hurontario',
    fact: 'Port Credit and Lorne Park homes built before 1985 frequently have original copper supply lines with pinhole corrosion — our technicians carry braided stainless steel replacement lines for these situations. Mississauga condo towers along Burnhamthorpe and Hurontario require service elevator booking and have stacked plumbing that complicates drain routing for dishwashers and washers.',
    area: 'West GTA',
    tip: 'Mississauga townhouse complexes in Streetsville and Churchill Meadows often share walls with neighbour units, meaning vibration from an unbalanced washer or improperly secured dishwasher can transmit noise through the shared structure — proper leveling and anti-vibration pad installation is critical in these builds.'
  },
  'scarborough': {
    name: 'Scarborough',
    neighborhoods: ['Agincourt', 'Guildwood', 'Morningside'],
    housing: '1950s-1970s wartime bungalows and postwar side-splits in Birch Cliff and Scarborough Village, plus newer townhouse clusters near Scarborough Town Centre',
    fact: 'Many older Scarborough homes in the Warden and Lawrence corridor were built with galvanized steel plumbing that corrodes internally over decades. When installing or replacing appliances, our technicians check supply line connections for restricted flow caused by corroded galvanized fittings and replace them with modern brass or PEX connections.',
    area: 'East Toronto',
    tip: 'Scarborough bungalows from the 1960s often have kitchens that were not designed for a dishwasher — the original cabinet layout lacks a standard 24-inch opening. Our technicians can modify the cabinetry and create a proper cutout with mounting rails, which falls under our complex installation category.'
  },
  'north-york': {
    name: 'North York',
    neighborhoods: ['Willowdale', 'Don Mills', 'Bayview Village'],
    housing: 'diverse housing from 1950s brick bungalows in Don Mills to luxury custom homes along Bayview and Sheppard, plus dense condo clusters around Yonge and Finch',
    fact: 'North York homes in the Bathurst and Steeles corridor often have basements that were converted to separate living units, adding extra appliances on the same water supply line. Reduced water pressure from shared supply lines can cause dishwashers to fill slowly and washing machines to extend cycle times — our technicians check inlet water pressure as part of every installation.',
    area: 'North Toronto',
    tip: 'The Willowdale and Bayview Village areas have seen a surge in kitchen renovations where homeowners upgrade to panel-ready integrated dishwashers that disappear behind custom cabinetry. These installations require precise door panel alignment and specialized mounting brackets that differ by brand — Bosch, Miele, and KitchenAid each have proprietary systems.'
  },
  'etobicoke': {
    name: 'Etobicoke',
    neighborhoods: ['Mimico', 'Long Branch', 'Islington Village'],
    housing: 'postwar bungalows and Tudor-style homes along the Kingsway, waterfront condos in Mimico and Humber Bay, and suburban developments in Rexdale',
    fact: 'Etobicoke waterfront condos in Mimico and Humber Bay Shores are among the newest high-rises in the GTA, but their compact kitchen layouts often have non-standard dishwasher openings that are 1-2 inches narrower than the standard 24-inch width. Slim-line 18-inch dishwashers from Bosch and Miele are the go-to solution for these units.',
    area: 'West Toronto',
    tip: 'Heritage homes along The Kingsway and in the Royal York Road area may have original 1940s electrical panels that lack a dedicated dishwasher circuit. Our installers verify the panel capacity before proceeding and can coordinate with a licensed electrician if a new circuit is required for safe operation.'
  },
  'ajax': {
    name: 'Ajax',
    neighborhoods: ['Pickering Beach', 'South Ajax', 'Salem'],
    housing: 'primarily 1990s-2010s suburban homes in planned communities, with newer infill developments along Kingston Road and waterfront revitalization near Ajax Harbour',
    fact: 'Ajax sits on the Pickering aquifer border, and homes in the north end draw from different water sources than lakefront properties — the resulting mineral content variation means appliances in north Ajax accumulate limescale deposits noticeably faster, requiring more frequent descaling of dishwasher spray arms and washer drum interiors.',
    area: 'East GTA — Durham Region',
    tip: 'Ajax homes built during the 2000s housing boom often have builder-grade appliances that are now reaching end of life simultaneously. Our technicians frequently handle multiple appliance installations in a single visit for Ajax homeowners replacing their entire kitchen appliance suite.'
  },
  'pickering': {
    name: 'Pickering',
    neighborhoods: ['Bay Ridges', 'Amberlea', 'Liverpool'],
    housing: 'established 1970s-1980s subdivisions in Amberlea and Bay Ridges, newer developments in Seaton, and heritage properties along Kingston Road',
    fact: 'Pickering is unique in the GTA because of its proximity to the Pickering Nuclear Generating Station — the local water treatment uses Lake Ontario water drawn from intake pipes near the plant, resulting in some of the cleanest municipal water in Ontario. While this is excellent for drinking, the lower mineral content means less scale buildup on appliance heating elements compared to communities served by groundwater wells.',
    area: 'East GTA — Durham Region',
    tip: 'The new Seaton community in north Pickering features energy-efficient homes with pre-plumbed connections designed for modern appliances — installations here are typically straightforward, but the longer distance from our Toronto base means scheduling morning appointments for Pickering to ensure same-day service.'
  },
  'markham': {
    name: 'Markham',
    neighborhoods: ['Unionville', 'Cornell', 'Markham Village'],
    housing: 'historic Unionville main street homes from the 1860s alongside massive modern subdivisions in Cornell and Cathay communities, plus prestige estates in Angus Glen',
    fact: 'Markham has one of the highest concentrations of multigenerational households in the GTA, and many homes have secondary kitchens in the basement or on the upper floor. These secondary kitchen installations require dedicated water supply lines run from the main stack, proper drain line routing to avoid backflow, and often a separate electrical circuit.',
    area: 'North GTA — York Region',
    tip: 'Unionville heritage homes built in the 19th century present unique challenges for appliance installation — narrow doorways, non-standard cabinet sizes, and original plumbing that may include lead service connections that should be replaced when a new appliance is installed.'
  },
  'richmond-hill': {
    name: 'Richmond Hill',
    neighborhoods: ['Oak Ridges', 'Jefferson', 'Elgin Mills'],
    housing: 'luxury estate homes in South Richvale and Bayview Hill, established 1980s-1990s subdivisions near Yonge and Major Mackenzie, and newer developments on the Oak Ridges Moraine',
    fact: 'Richmond Hill homes on the Oak Ridges Moraine are supplied by groundwater wells rather than Lake Ontario — the resulting hard water with elevated calcium and magnesium levels causes accelerated mineral buildup inside dishwashers, washing machines, and refrigerator water dispensers. Annual descaling and filter replacement is essential for appliance longevity in these areas.',
    area: 'North GTA — York Region',
    tip: 'Large custom homes in South Richvale and Bayview Hill often have commercial-grade kitchen appliances from brands like Sub-Zero, Wolf, and Thermador that require specialized installation procedures and factory-trained technicians — our team includes certified installers for these premium brands.'
  },
  'vaughan': {
    name: 'Vaughan',
    neighborhoods: ['Woodbridge', 'Kleinburg', 'Maple'],
    housing: 'Italian-influenced custom builds in Woodbridge, estate properties on Kleinburg acreages, and modern family homes in the Vellore and Maple communities',
    fact: 'Woodbridge and Kleinburg homes frequently feature imported Italian appliances — Smeg, Bertazzoni, and Fulgor Milano units that require metric connection fittings and specialized installation brackets not stocked by standard hardware stores. Our technicians carry metric adapters and brand-specific mounting hardware for these European appliance installations.',
    area: 'North GTA — York Region',
    tip: 'Many Vaughan homes have elaborate custom kitchens with integrated appliance panels, pot-filler faucets, and multiple dishwashers — one for everyday use and a secondary unit in a butler pantry. Installing dual dishwashers requires dedicated supply lines and separate drain connections to prevent cross-contamination between units.'
  },
  'oakville': {
    name: 'Oakville',
    neighborhoods: ['Bronte Village', 'Glen Abbey', 'Old Oakville'],
    housing: 'heritage lakefront estates in Old Oakville, established 1980s communities in Glen Abbey, and newer family homes in North Oakville and Joshua Creek',
    fact: 'Oakville is served by Halton Region water treatment, which draws from Lake Ontario but adds slightly more lime for pH balancing than Toronto or Peel systems. This results in thin white mineral deposits on dishwasher interiors and glass cookware over time. Oakville homeowners benefit from installing dishwashers with built-in water softener compartments, available from Bosch and Miele.',
    area: 'West GTA — Halton Region',
    tip: 'Old Oakville heritage homes near Lakeshore Road often have original 1920s-1940s kitchens with non-standard cabinet depths and widths — slim-line 18-inch dishwashers or countertop models are frequently the only option without major cabinetry renovation in these charming but compact kitchens.'
  },
  'burlington': {
    name: 'Burlington',
    neighborhoods: ['Aldershot', 'Roseland', 'Tyandaga'],
    housing: 'established 1960s-1980s homes in Aldershot and Roseland, waterfront properties along Lakeshore, and newer developments in the Millcroft and Orchard communities',
    fact: 'Burlington straddles the Niagara Escarpment, and homes built on the escarpment ridge in Tyandaga and upper Burlington experience slightly lower water pressure than valley-floor homes due to elevation. Low inlet water pressure can cause dishwashers to fill insufficiently and washing machines to extend cycle times — our technicians measure inlet pressure and install booster valves when needed.',
    area: 'West GTA — Halton Region',
    tip: 'Burlington homes near the Aldershot GO station are popular with Toronto commuters who invest in kitchen upgrades — panel-ready dishwashers and smart washer-dryer stacks are the most common installation requests in this neighbourhood.'
  },
  'whitby': {
    name: 'Whitby',
    neighborhoods: ['Brooklin', 'Blue Grass Meadows', 'Port Whitby'],
    housing: 'rapidly growing bedroom community with new subdivisions in Brooklin and established 1980s-1990s homes in central Whitby, plus waterfront townhomes near Port Whitby',
    fact: 'Whitby is one of Durham Region\'s fastest-growing communities, and the new Brooklin developments are built to current Ontario Building Code standards with pre-plumbed appliance connections, GFCI-protected circuits for kitchen appliances, and modern PEX water lines. These modern installations are straightforward, but the rapid construction pace means some builder-grade connections may need tightening or re-routing during appliance installation.',
    area: 'East GTA — Durham Region',
    tip: 'Whitby\'s Brooklin neighbourhood is predominantly new construction where builders install base-model appliances — many homeowners upgrade to premium brands within 2-3 years of moving in, making replacement installation our most common service call in this area.'
  },
  'oshawa': {
    name: 'Oshawa',
    neighborhoods: ['Taunton', 'Windfields', 'Samac'],
    housing: 'post-industrial city with older 1940s-1960s worker housing near downtown, modern family subdivisions in the north end along Taunton Road, and university-area rentals near UOIT',
    fact: 'Oshawa\'s older downtown homes near the former General Motors plant were built for autoworkers in the 1940s-1960s with compact, utilitarian kitchens that often lack dishwasher provisions. First-time dishwasher installation in these homes requires cabinet modification, new plumbing runs from the kitchen sink, and sometimes electrical panel upgrades to add a dedicated 15-amp circuit.',
    area: 'East GTA — Durham Region',
    tip: 'Rental properties near UOIT and Durham College in north Oshawa often need durable, basic appliances that can withstand heavy use by student tenants — our technicians recommend commercial-grade models from GE and Whirlpool for landlords installing appliances in student rental units.'
  },
  'toronto': {
    name: 'Toronto',
    neighborhoods: ['Downtown Core', 'Midtown', 'East End'],
    housing: 'Victorian and Edwardian row houses in the core, mid-century apartments in Midtown, and modern glass condo towers throughout the city',
    fact: 'Toronto\'s downtown condo buildings often restrict appliance deliveries to specific hours and require service elevator booking 48 hours in advance. Our scheduling team coordinates directly with building management to secure elevator access and ensure our technicians arrive during the approved service window, eliminating delays and wasted trips.',
    area: 'Central GTA',
    tip: 'Toronto\'s century-old row houses in Cabbagetown, the Annex, and Riverdale frequently have original galvanized plumbing, knob-and-tube wiring, and kitchens that predate built-in dishwashers entirely. First-time installations in these homes require a comprehensive plumbing and electrical assessment before work begins.'
  },
  'east-york': {
    name: 'East York',
    neighborhoods: ['Thorncliffe Park', 'Leaside', 'Pape Village'],
    housing: 'modest 1940s-1950s brick bungalows and wartime homes, now increasingly renovated with modern kitchens and second-storey additions',
    fact: 'East York was historically a separate municipality with its own building codes until 1998 amalgamation. Many homes built before the 1970s have undersized 100-amp electrical panels that may not support a modern dishwasher alongside other kitchen appliances. Our installers check panel capacity and identify whether a dedicated circuit can be added or if a panel upgrade is needed.',
    area: 'East Toronto',
    tip: 'The wave of renovations in East York\'s bungalow belt has created high demand for appliance installation in newly expanded kitchens — homeowners often gut the original kitchen during a second-storey addition, requiring fresh plumbing runs, new electrical circuits, and appliance connections built from scratch.'
  },
  'bradford': {
    name: 'Bradford',
    neighborhoods: ['Bradford West Gwillimbury', 'Bond Head', 'Newton Robinson'],
    housing: 'small-town Ontario charm with heritage Main Street buildings, established 1980s subdivisions, and a surge of new development on the town\'s west side',
    fact: 'Bradford sits on the Holland Marsh — one of Ontario\'s most important agricultural areas — and many rural properties on the town\'s outskirts rely on private wells rather than municipal water. Well water in the Holland Marsh area has notably high iron content that stains appliance interiors and clogs inlet screens on dishwashers and washing machines. A whole-house iron filter is recommended before installing new appliances.',
    area: 'North of GTA — Simcoe County',
    tip: 'Bradford\'s distance from major urban centres means same-day service requires early morning scheduling. Our technicians serving Bradford depart from our North York base before 8 AM to ensure arrival by mid-morning, so calling before noon is essential for same-day appointments.'
  },
  'newmarket': {
    name: 'Newmarket',
    neighborhoods: ['Upper Canada Mall area', 'Stonehaven', 'Bristol-London'],
    housing: 'historic downtown core with 19th-century buildings along Main Street, established 1980s-1990s subdivisions in the south, and newer communities near Mulock Drive',
    fact: 'Newmarket is served by York Region water, which is a blend of Lake Ontario surface water and local groundwater. The blended supply has moderate hardness levels that cause gradual limescale buildup on dishwasher heating elements and washing machine drums. Homes in the older south end near Davis Drive often have original copper plumbing with green patina at joints, indicating potential for pinhole leaks when new appliances create pressure fluctuations.',
    area: 'North GTA — York Region',
    tip: 'Newmarket\'s heritage downtown homes on Main Street and Prospect Avenue were built before indoor plumbing was standard — retrofit kitchens in these properties often have non-standard drain routing and limited space for full-size appliances, making compact and countertop models the practical choice.'
  },
  'aurora': {
    name: 'Aurora',
    neighborhoods: ['Bayview Northeast', 'Aurora Highlands', 'Town Park'],
    housing: 'affluent bedroom community with custom estate homes near St. Andrew\'s College, established 1990s subdivisions, and protected heritage buildings on Yonge Street',
    fact: 'Aurora\'s water supply comes from both Lake Simcoe and Lake Ontario, creating slight seasonal variation in mineral content. During summer months when Lake Simcoe water comprises a larger share of the blend, hardness levels increase slightly, which can accelerate scale deposits on dishwasher heating elements. Aurora homeowners who notice white film on glassware during summer may benefit from dishwasher models with adjustable water softener settings.',
    area: 'North GTA — York Region',
    tip: 'Aurora estate homes frequently feature luxury kitchen designs with two dishwashers — one in the main kitchen and a secondary unit in the pantry or wet bar. Dual installations require separate hot water supply runs from the water heater to prevent temperature drops when both units fill simultaneously.'
  },
  'hamilton': {
    name: 'Hamilton',
    neighborhoods: ['Dundas', 'Westdale', 'Stoney Creek'],
    housing: 'steel-city heritage with rugged 1920s-1950s worker homes on the Mountain, charming century homes in Dundas and Westdale, and modern developments in Stoney Creek',
    fact: 'Hamilton\'s industrial heritage means older homes near the Stelco and Dofasco corridor may have original cast-iron drain pipes that have narrowed internally from decades of mineral deposits. When installing a dishwasher or washing machine that drains at high volume, these restricted drain pipes can cause slow drainage, backups, or standing water — our technicians scope the drain condition before connecting new appliances.',
    area: 'West GTA — Hamilton-Wentworth',
    tip: 'Hamilton Mountain homes experience higher water pressure than lower-city properties due to the elevation of the escarpment pumping stations. Excess pressure above 80 PSI can damage appliance inlet valves and solenoids — our installers measure supply pressure and install pressure-reducing valves when readings exceed safe limits.'
  },
  'guelph': {
    name: 'Guelph',
    neighborhoods: ['Old University', 'Kortright Hills', 'South End'],
    housing: 'university town with Victorian limestone buildings downtown, student-dense neighbourhoods near the University of Guelph, and modern family suburbs in the south end',
    fact: 'Guelph is one of the few major Ontario cities that relies entirely on groundwater for its municipal water supply — 120+ wells draw from the local aquifer. This groundwater is significantly harder than Lake Ontario surface water used by most GTA cities, with calcium carbonate levels exceeding 300 mg/L. Guelph appliances require more frequent descaling, and water softeners are strongly recommended to protect dishwasher and washing machine components.',
    area: 'West of GTA — Wellington County',
    tip: 'Student rental properties near the University of Guelph need robust, low-maintenance appliances that can handle heavy daily use across multiple tenants. Landlords in this area frequently request commercial-duty Whirlpool and GE models designed for multi-family use, which have reinforced drums, heavy-duty bearings, and simplified controls.'
  },
  'thornhill': {
    name: 'Thornhill',
    neighborhoods: ['Thornhill Woods', 'Patterson', 'Langstaff'],
    housing: 'large family homes in Thornhill Woods and Patterson, established 1980s communities near Bathurst and Centre Streets, and older homes in historic Thornhill Village along Yonge',
    fact: 'Thornhill spans both Vaughan and Markham, meaning homes on the west side of Yonge Street are in Vaughan and served by York Region water, while homes on the east side are in Markham. This jurisdictional split means different water pressures and pipe standards on either side of the same street. Our technicians verify the municipal zone before quoting to ensure accurate assessment of plumbing compatibility.',
    area: 'North GTA — York Region',
    tip: 'Thornhill\'s large family homes in Thornhill Woods often have finished basements with secondary kitchens or wet bars that require separate appliance installations. Running supply and drain lines from the main floor to the basement requires careful routing through floor joists and ensuring proper drain slope for gravity-fed drainage.'
  },
  'concord': {
    name: 'Concord',
    neighborhoods: ['Concord West', 'Thornhill Industrial Park area', 'Riverview'],
    housing: 'mix of 1980s residential subdivisions, newer townhome developments, and commercial-industrial areas with live-work loft conversions',
    fact: 'Concord is located in the City of Vaughan\'s industrial corridor, and several residential developments were built on former industrial land that required environmental remediation. These properties occasionally have non-standard utility configurations, including water meters in unusual locations and supply lines that run longer distances from the street to the home, which can affect water pressure at appliance connections.',
    area: 'North GTA — York Region',
    tip: 'Live-work loft conversions in Concord\'s commercial areas often have open-concept layouts with plumbing originally designed for light commercial use. Installing residential appliances in these spaces may require adapter fittings to transition from commercial pipe diameters to standard residential connections.'
  },
  'maple': {
    name: 'Maple',
    neighborhoods: ['Eagle Landing', 'Sonoma Heights', 'Historic Maple Village'],
    housing: 'one of Vaughan\'s fastest-growing communities with large new subdivisions on the north side, established 1990s homes near Major Mackenzie, and the quaint historic village core along Keele Street',
    fact: 'Maple\'s newer subdivisions were built during the 2010s construction boom with modern PEX plumbing, GFCI outlets in kitchens, and pre-plumbed dishwasher connections. However, the rapid development pace means some homes were built with supply lines that are slightly undersized for the number of fixtures — when multiple appliances run simultaneously, water pressure can drop below the minimum required for proper dishwasher fill cycles.',
    area: 'North GTA — York Region',
    tip: 'Maple homeowners in newer builds often upgrade from builder-basic appliances to premium brands within the first 3-5 years. Our most common Maple service call is removing a builder-grade dishwasher and installing a Bosch or Miele panel-ready unit that integrates with upgraded custom cabinetry.'
  },
  'woodbridge': {
    name: 'Woodbridge',
    neighborhoods: ['Islington Woods', 'Pine Grove', 'Market Lane'],
    housing: 'Italian-Canadian community with elaborate custom-built homes featuring imported stone and tile, mature 1980s subdivisions, and new infill townhome developments',
    fact: 'Woodbridge is known for its Italian-Canadian heritage, and many homes feature imported European kitchen appliances from brands like Smeg, Fulgor Milano, and Ilve. These appliances often use metric plumbing connections (3/4" BSP vs. North American 3/4" NPT) and may require adapter fittings. Our technicians carry a full set of metric-to-imperial adapters for European appliance installations.',
    area: 'North GTA — York Region',
    tip: 'Custom homes in Woodbridge frequently have multiple ovens, oversized refrigerators, and professional-grade range hoods alongside their dishwashers — when installing or replacing appliances in these elaborate kitchens, our technicians verify that the electrical panel can support the combined load without tripping breakers during peak usage.'
  },
  'bayview-village': {
    name: 'Bayview Village',
    neighborhoods: ['Bayview Village', 'Newtonbrook', 'Willowdale East'],
    housing: 'affluent enclave of custom homes and renovated 1960s bungalows near Bayview Village Shopping Centre, with modern condo developments along Sheppard Avenue',
    fact: 'Bayview Village homes are among the most renovated in North York, with many original 1960s bungalows gut-renovated into modern two-storey homes with high-end kitchens. These renovations often relocate the kitchen plumbing to accommodate open-concept designs and island layouts, meaning appliance connections are run through the concrete slab or floor joists rather than along existing walls.',
    area: 'North Toronto — North York',
    tip: 'Condo residents at Bayview Village and the Sheppard corridor high-rises frequently need compact 18-inch dishwashers due to space constraints in galley-style kitchens. Our technicians stock the mounting brackets specific to compact units from Bosch, Miele, and GE Profile.'
  },
  'birchcliff': {
    name: 'Birchcliff',
    neighborhoods: ['Birchcliff Heights', 'Cliffside', 'Scarborough Bluffs'],
    housing: 'charming 1920s-1950s cottage-style homes perched along the Scarborough Bluffs, with tree-lined streets and lake views that make this one of east Toronto\'s most desirable pockets',
    fact: 'Birchcliff\'s bluffs-top location means homes are built on clay-heavy soil that can shift seasonally. This ground movement occasionally affects plumbing connections in basements and crawl spaces, causing joints to loosen over years. When installing appliances in Birchcliff homes, our technicians inspect existing supply connections for signs of movement-related stress and use flexible braided lines that accommodate minor shifting.',
    area: 'East Toronto — Scarborough',
    tip: 'Many Birchcliff homes were originally summer cottages converted to year-round residences — their kitchens are often smaller than modern standards, and doorways may be too narrow for a standard 24-inch dishwasher to pass through. Our team measures access points during the quoting visit to determine if door removal or a compact model is needed.'
  },
  'cabbagetown': {
    name: 'Cabbagetown',
    neighborhoods: ['Cabbagetown', 'Regent Park', 'St. James Town'],
    housing: 'one of Toronto\'s finest collections of Victorian row houses, with meticulously restored 1880s homes alongside the redeveloped Regent Park mixed-income community',
    fact: 'Cabbagetown\'s Victorian row houses are typically 14-18 feet wide with narrow galley kitchens at the rear of the home. The original homes had no provisions for dishwashers, and many renovated kitchens have dishwashers installed in non-standard locations — under a prep counter, beside a pantry cabinet, or even in a hallway adjacent to the kitchen. These creative placements require custom plumbing runs and careful drain routing.',
    area: 'Downtown Toronto',
    tip: 'Parking is extremely limited in Cabbagetown — our technicians use company vans with on-street parking permits and carry all tools and parts in a single trip to minimize time at the curb. If a permit spot is unavailable, we coordinate with homeowners to use their rear laneway access for loading and delivery.'
  },
  'danforth-village': {
    name: 'Danforth Village',
    neighborhoods: ['Danforth Village', 'East Danforth', 'Woodbine Corridor'],
    housing: 'compact early-20th-century semi-detached homes and row houses along the Danforth, with basement apartments and above-shop flats in the commercial strip',
    fact: 'Danforth Village homes were built between 1910 and 1940, and many still have original clay or cast-iron drain stacks that are narrower than modern ABS standards. High-efficiency dishwashers and front-load washers that pump water at higher velocities can overwhelm these older drains, causing slow drainage or gurgling in nearby fixtures. Our technicians test drain flow rate before connecting new appliances and recommend drain remediation if the existing system cannot handle modern pump volumes.',
    area: 'East Toronto',
    tip: 'Semi-detached homes on the Danforth share a party wall, and plumbing often runs along or through this wall. When installing appliances, our technicians are careful to avoid drilling into the shared wall to prevent damaging the neighbour\'s plumbing or creating pathways for sound transmission.'
  },
  'davisville-village': {
    name: 'Davisville Village',
    neighborhoods: ['Davisville Village', 'Yonge-Eglinton', 'Mount Pleasant'],
    housing: 'family-friendly Midtown neighbourhood with 1930s-1950s brick homes, mature tree-lined streets, and a growing number of mid-rise condos along Eglinton during the Crosstown LRT construction era',
    fact: 'The Eglinton Crosstown LRT construction disrupted water mains along Eglinton Avenue for several years, and homes in the immediate vicinity experienced temporary pressure fluctuations and sediment disturbances. While construction is winding down, some older supply lines in the area accumulated sediment that can clog appliance inlet screens. Our technicians flush supply lines and install inline sediment filters when connecting new appliances in the Davisville and Eglinton corridor.',
    area: 'Midtown Toronto',
    tip: 'Davisville Village homes are popular with young families who renovate dated kitchens and add modern appliances. The 1940s homes in this area often have limited countertop space, making integrated dishwashers and stackable washer-dryer units the most requested installation types.'
  },
  'don-mills': {
    name: 'Don Mills',
    neighborhoods: ['Don Mills', 'Parkway Forest', 'Henry Farm'],
    housing: 'Canada\'s first master-planned community, with original 1950s-1960s modernist homes, renovated properties with second-storey additions, and the redeveloped Shops at Don Mills area',
    fact: 'Don Mills was designed in the 1950s by Macklin Hancock as a self-contained community with its own planning standards. Many original homes have unique electrical panel configurations and plumbing layouts that differ from standard Toronto building practices of the era. Our technicians are familiar with the Don Mills-specific building patterns and carry adapters for the non-standard junction box sizes occasionally found in these homes.',
    area: 'North Toronto — North York',
    tip: 'The original Don Mills homes have generous kitchen layouts by 1950s standards, but the countertop heights and cabinet depths may not match modern appliance dimensions. When replacing a 1950s-era dishwasher or installing one for the first time, our technicians verify that the cabinet opening height accommodates current models, which are typically 1-2 inches taller than units from that era.'
  },
  'forest-hill': {
    name: 'Forest Hill',
    neighborhoods: ['Forest Hill South', 'Forest Hill North', 'Upper Village'],
    housing: 'one of Toronto\'s most affluent neighbourhoods with grand Tudor, Georgian, and contemporary estate homes on large lots, many with carriage houses and coach house conversions',
    fact: 'Forest Hill kitchens frequently feature professional-grade appliances from brands like Sub-Zero, Wolf, Thermador, and La Cornue. These premium units require specialized installation procedures — Sub-Zero refrigerators need precisely leveled floors and specific clearances for built-in models, while Wolf ranges require dedicated gas lines with higher BTU capacity than standard residential connections.',
    area: 'Central Toronto',
    tip: 'Forest Hill homes undergoing renovation often have temporary kitchen setups in secondary rooms while the main kitchen is gutted. Our technicians coordinate with general contractors to install appliances in the final stages of renovation, ensuring connections are made to finished plumbing and electrical that has passed municipal inspection.'
  },
  'humber-valley': {
    name: 'Humber Valley',
    neighborhoods: ['Humber Valley Village', 'Old Mill', 'Kingsway South'],
    housing: 'upscale Etobicoke enclave with 1940s-1960s estate homes on large wooded lots along the Humber River, known for custom architecture and mature landscaping',
    fact: 'Humber Valley homes near the river are in a designated flood plain area, and basements are more susceptible to moisture issues than homes on higher ground. Appliances installed in basement kitchens or laundry rooms in this area benefit from elevated installation on platforms and moisture-resistant connections to prevent damage during spring thaw flooding that occasionally affects the Humber River valley.',
    area: 'West Toronto — Etobicoke',
    tip: 'The large estate homes in Humber Valley and The Kingsway area often have multiple laundry areas — a main-floor laundry near the kitchen and a secondary set in the basement. Our technicians install washer-dryer stacks on both levels and ensure each has independent water supply shutoffs and drain connections for safety and convenience.'
  },
  'islington-village': {
    name: 'Islington Village',
    neighborhoods: ['Islington Village', 'Dundas West Corridor', 'Markland Wood'],
    housing: 'village-like community in central Etobicoke with 1950s-1960s bungalows and split-levels near Islington Avenue, plus larger homes in the Markland Wood enclave',
    fact: 'Islington Village sits at the confluence of several Etobicoke neighbourhoods with different build eras — 1950s bungalows to the north, 1970s townhouses to the south, and modern infill homes throughout. This mix means our technicians encounter a wide variety of plumbing standards, electrical panel types, and cabinet configurations within a small geographic area, requiring adaptability and a fully stocked service vehicle.',
    area: 'West Toronto — Etobicoke',
    tip: 'Islington Village bungalows from the 1950s-1960s are popular renovation targets, with many homeowners adding second stories and completely rebuilding the kitchen. During these renovations, we work with contractors to pre-plan appliance locations and rough-in connections before cabinetry is installed, ensuring perfect fit for the homeowner\'s chosen appliances.'
  },
  'lawrence-park': {
    name: 'Lawrence Park',
    neighborhoods: ['Lawrence Park South', 'Lawrence Park North', 'Bedford Park'],
    housing: 'prestigious tree-lined streets with 1920s-1950s Tudor and Georgian revival homes, known as one of Toronto\'s wealthiest neighbourhoods with meticulously maintained properties',
    fact: 'Lawrence Park homes often retain original 1930s-1940s plumbing with lead service lines from the street to the house. Toronto\'s Lead Pipe Replacement Program has been addressing this, but some homes still have lead pipes that should be replaced before installing new appliances. Our technicians can identify lead supply lines during installation and recommend testing if the pipes have not been updated.',
    area: 'Midtown Toronto — North York',
    tip: 'Kitchen renovations in Lawrence Park typically involve premium European appliances — Gaggenau, Miele, and Sub-Zero are the most common brands. These units have longer lead times for parts and accessories, so we recommend scheduling installation 2-3 weeks after appliance delivery to ensure all custom panels, trim kits, and connection accessories have arrived.'
  },
  'leaside': {
    name: 'Leaside',
    neighborhoods: ['Leaside', 'Bennington Heights', 'Sunnybrook'],
    housing: 'affluent family neighbourhood with well-maintained 1930s-1950s brick homes, known for top-rated schools and a strong sense of community along Bayview Avenue',
    fact: 'Leaside was originally a company town built by the Canadian Northern Railway, and many homes were constructed with above-average materials for the era, including copper plumbing throughout and heavier-gauge electrical wiring. While the copper plumbing has held up remarkably well, homes approaching 80-90 years old may have joints that have weakened over time — our technicians test connection integrity before attaching new appliance supply lines to decades-old copper fittings.',
    area: 'East Midtown Toronto',
    tip: 'Leaside homeowners typically maintain their homes to a high standard and prefer premium appliances. The most common installation request in Leaside is replacing a functioning but dated dishwasher with a quieter, more energy-efficient model from Bosch or Miele — noise reduction is a top priority in these close-quartered neighbourhoods.'
  },
  'leslieville': {
    name: 'Leslieville',
    neighborhoods: ['Leslieville', 'Riverside', 'South Riverdale'],
    housing: 'rapidly gentrifying east-end neighbourhood with narrow Victorian and Edwardian row houses, converted industrial lofts, and new mid-rise developments along Queen Street East',
    fact: 'Leslieville\'s row houses are typically only 15-16 feet wide with compact kitchens at the rear. The narrow floor plans mean appliance deliveries often require removing the front or back door from its hinges to fit a standard 24-inch dishwasher through. Our technicians carry door-removal tools and protective padding to navigate these tight access points without damaging door frames or freshly renovated interiors.',
    area: 'East Toronto',
    tip: 'Many Leslieville homes have been converted from single-family to multi-unit dwellings, with separate kitchens on each floor. When installing appliances in upper-floor units, our technicians use appliance dollies designed for stairwell navigation and install vibration-dampening pads to reduce noise transmission to lower units.'
  },
  'liberty-village': {
    name: 'Liberty Village',
    neighborhoods: ['Liberty Village', 'King West', 'Niagara'],
    housing: 'converted industrial lofts and modern condo towers in the former Liberty Street industrial area, known for exposed brick, high ceilings, and young professional residents',
    fact: 'Liberty Village\'s converted industrial lofts often have exposed plumbing running along ceilings and walls — aesthetic appeal but practical challenges for appliance connections. Supply lines may need to run longer distances from exposed risers to kitchen locations, requiring additional fittings and supports. The original industrial buildings also have concrete floors that can complicate drain routing for dishwashers and washing machines.',
    area: 'Downtown Toronto — West End',
    tip: 'Liberty Village condo units frequently have combined washer-dryer units due to space limitations. Our technicians install and maintain ventless condensation dryers and all-in-one washer-dryer combos from LG, Samsung, and Bosch that are designed specifically for condo living without external venting requirements.'
  },
  'midtown': {
    name: 'Midtown',
    neighborhoods: ['Midtown', 'Yonge-St. Clair', 'Deer Park'],
    housing: 'dense urban neighbourhood with a mix of 1930s apartment buildings, postwar low-rises, and modern glass condo towers, centred around the Yonge and St. Clair intersection',
    fact: 'Midtown Toronto\'s older apartment buildings from the 1930s-1960s were built before dishwashers were standard kitchen appliances. Tenants in these units who receive landlord approval for dishwasher installation face challenges including limited counter space, no dedicated circuit, and drain lines that were designed only for a kitchen sink. Our technicians specialize in retrofitting appliance connections into these vintage apartment kitchens.',
    area: 'Central Toronto',
    tip: 'The Yonge and St. Clair area has a high concentration of rental apartment buildings where property managers need efficient, reliable appliance installation across multiple units. We offer building-wide service contracts for property managers who need consistent appliance maintenance and replacement across their portfolio.'
  },
  'rosedale': {
    name: 'Rosedale',
    neighborhoods: ['North Rosedale', 'South Rosedale', 'Moore Park'],
    housing: 'Toronto\'s most prestigious neighbourhood with grand 1900s-1930s mansions on ravine lots, many designated heritage properties with strict renovation guidelines',
    fact: 'Rosedale heritage properties are subject to Toronto\'s Heritage Conservation District guidelines, which can restrict exterior modifications including ventilation outlets for dryers and range hoods. When installing appliances that require external venting in heritage homes, our technicians work with heritage consultants to identify approved venting locations — typically at the rear of the property — that satisfy both building code and heritage preservation requirements.',
    area: 'Central Toronto',
    tip: 'Rosedale mansions often have butler\'s pantries and secondary prep kitchens that were original to the home\'s design. When restoring these spaces, we install period-appropriate compact appliances that fit the historical proportions while providing modern functionality — Fisher & Paykel drawer dishwashers and under-counter refrigerators are popular choices.'
  },
  'parkdale': {
    name: 'Parkdale',
    neighborhoods: ['Parkdale', 'South Parkdale', 'Roncesvalles'],
    housing: 'eclectic neighbourhood with grand Victorian mansions converted to multi-unit dwellings, classic Toronto semi-detached homes, and lakefront condos south of King Street',
    fact: 'Parkdale\'s Victorian mansions were predominantly built in the 1880s-1900s as single-family homes for Toronto\'s wealthy class, then subdivided into rooming houses and apartments during the mid-20th century. Many of these converted units have shared plumbing stacks serving multiple kitchens, meaning appliance installation in one unit can affect water pressure in adjacent units. Our technicians coordinate with building owners to minimize disruption during installation.',
    area: 'West Toronto',
    tip: 'The gentrification of Parkdale has brought many of these subdivided homes back to single-family use, with gut renovations that modernize the plumbing and electrical systems. We frequently partner with Parkdale renovation contractors to handle the appliance rough-in during construction and return for final installation when the kitchen is complete.'
  },
  'the-beaches': {
    name: 'The Beaches',
    neighborhoods: ['The Beaches', 'Upper Beach', 'Balmy Beach'],
    housing: 'charming lakefront community with early-1900s cottages converted to permanent homes, 1920s-1940s brick houses, and a walkable commercial strip along Queen Street East',
    fact: 'The Beaches\' proximity to Lake Ontario creates a higher-humidity microclimate than inland Toronto neighbourhoods, especially in summer. This elevated humidity can affect appliances stored in basements or poorly ventilated kitchens — refrigerator compressors work harder, and mold can develop inside rarely-used dishwashers. Our technicians recommend anti-mold dishwasher treatments and proper ventilation assessments for Beaches properties.',
    area: 'East Toronto',
    tip: 'Beach houses south of Queen Street were originally summer cottages with minimal kitchens. Modern renovations in these homes often create open-concept layouts that relocate the kitchen away from original plumbing locations, requiring longer supply and drain runs that our technicians plan during the site assessment.'
  },
  'the-annex': {
    name: 'The Annex',
    neighborhoods: ['The Annex', 'Seaton Village', 'Koreatown'],
    housing: 'grand Victorian and Edwardian homes near the University of Toronto, many converted to student housing or divided into apartments, with a vibrant street life along Bloor Street',
    fact: 'The Annex is home to some of Toronto\'s grandest Victorian houses, many now divided into multi-unit student rentals near the University of Toronto. These converted homes often have makeshift kitchens added in basements and upper floors with improvised plumbing connections. When installing appliances in these units, our technicians inspect existing connections for code compliance and upgrade them to current standards — improperly installed flexible gas lines, missing backflow preventers, and absent GFCI protection are common findings.',
    area: 'Central Toronto',
    tip: 'Student turnover in Annex rental properties means appliances get heavy use and need replacement more frequently. We maintain a priority service list for Annex landlords who need fast turnaround on dishwasher and washer installations between tenant move-out and move-in — typically requiring same-day or next-day service during September and May.'
  },
  'yorkville': {
    name: 'Yorkville',
    neighborhoods: ['Yorkville', 'Cumberland', 'Hazelton Lanes'],
    housing: 'Toronto\'s luxury shopping and dining district with ultra-premium condos in the Four Seasons and Yorkville towers, heritage Victorian homes on Hazelton Avenue, and boutique commercial properties',
    fact: 'Yorkville\'s luxury condominiums feature premium kitchen finishes and professional-grade appliances that require factory-authorized installation to maintain warranty coverage. Brands like Sub-Zero, Wolf, Gaggenau, and La Cornue specify exact clearances, ventilation requirements, and connection specifications that must be followed precisely — a task that requires technicians trained in each manufacturer\'s requirements.',
    area: 'Central Toronto',
    tip: 'Yorkville condo buildings have strict renovation guidelines and noise bylaws that limit installation work to weekday business hours. Our scheduling team coordinates with building management to ensure all work is completed within permitted hours, and our technicians use noise-reducing installation techniques including pre-assembly of connections outside the unit.'
  },
  'greektown': {
    name: 'Greektown',
    neighborhoods: ['Greektown', 'The Danforth', 'Playter Estates'],
    housing: 'vibrant cultural corridor along Danforth Avenue with 1920s-1940s brick semi-detached homes, above-shop apartments, and family-sized detached houses on side streets',
    fact: 'Greektown homes along the Danforth were built primarily in the 1920s-1930s when kitchen design standards were much different from today. Original kitchens in these homes are typically located at the rear of the main floor with access to a back porch or yard. Many homeowners have expanded these kitchens into former porches, creating larger but irregularly shaped cooking spaces where standard appliance placement requires creative solutions for plumbing and electrical connections.',
    area: 'East Toronto',
    tip: 'The Danforth commercial strip has restaurant and food-service businesses that also need appliance installation and repair. Our technicians handle both residential and light commercial dishwasher installations, including high-temperature sanitizing commercial units that require 208V power connections and floor drains.'
  },
  'chinatown': {
    name: 'Chinatown',
    neighborhoods: ['Chinatown', 'Kensington Market', 'Alexandra Park'],
    housing: 'dense urban neighbourhood with narrow Victorian row houses, mixed-use commercial buildings, and the Spadina Avenue corridor of traditional Chinese businesses and restaurants',
    fact: 'Chinatown\'s row houses along Dundas and Spadina are among the most densely built in Toronto, with zero lot-line construction and shared walls on both sides. Interior access is often limited to narrow hallways and steep staircases, making large appliance delivery extremely challenging. Our technicians use specialized narrow-profile appliance dollies and may need to hoist units through windows or rear access points for upper-floor installations.',
    area: 'Downtown Toronto',
    tip: 'Many Chinatown homes have been used as mixed residential-commercial properties for decades, with a ground-floor business and living quarters above. Installing residential appliances in these properties may require separating water supply from the commercial space below and ensuring the residential kitchen has its own dedicated circuit and drain connection.'
  },
  'riverdale': {
    name: 'Riverdale',
    neighborhoods: ['Riverdale', 'Broadview North', 'Chester Village'],
    housing: 'popular east-end neighbourhood with 1890s-1920s Victorian and Edwardian homes, a growing number of modern infill properties, and the scenic Don Valley ravine as a backdrop',
    fact: 'Riverdale\'s proximity to the Don Valley means some homes on the ravine edge experience shifting soil conditions that can affect foundation alignment over decades. This gradual movement can cause plumbing joints to loosen and drain pipes to develop slight misalignment. Our technicians use flexible connections and check for foundation-related plumbing stress before installing appliances that rely on tight, leak-free connections.',
    area: 'East Toronto',
    tip: 'Riverdale has become one of Toronto\'s most popular renovation neighbourhoods, with many homeowners undertaking full kitchen gut renovations. We coordinate with Riverdale renovation contractors to schedule appliance installation during the final construction phase, ensuring connections are made to freshly installed plumbing and electrical that meet current Ontario Building Code requirements.'
  },
  'bloor-west': {
    name: 'Bloor West',
    neighborhoods: ['Bloor West Village', 'Baby Point', 'Swansea'],
    housing: 'family-oriented neighbourhood with 1920s-1940s detached and semi-detached homes, the charming Bloor West Village commercial strip, and stately homes in the Baby Point enclave',
    fact: 'Baby Point homes were built in the 1930s-1940s on the high bluffs above the Humber River with premium materials and generous proportions. These homes often have original copper plumbing that has developed a distinctive green patina but remains structurally sound. When connecting modern appliances, our technicians test these vintage copper lines for flow rate and pressure to ensure they can support today\'s high-efficiency dishwashers and washing machines that demand consistent water pressure.',
    area: 'West Toronto',
    tip: 'Bloor West Village homeowners are particularly quality-conscious and often request premium European dishwashers from Bosch and Miele for their quiet operation — noise levels matter in these close-quartered semi-detached neighbourhoods where kitchen walls are shared with neighbours.'
  },
  'high-park': {
    name: 'High Park',
    neighborhoods: ['High Park', 'Roncesvalles Village', 'Swansea'],
    housing: 'coveted neighbourhood surrounding Toronto\'s largest urban park, with a mix of 1910s-1940s homes, charming Roncesvalles strip, and newer townhome developments',
    fact: 'High Park area homes near the Grenadier Pond side of the park occasionally experience moisture issues in basements due to the high water table in the former lakefront area. Basement laundry rooms in these homes benefit from elevated appliance installation on pedestals and moisture-barrier installation to protect washer and dryer electrical components from ambient humidity.',
    area: 'West Toronto',
    tip: 'The Roncesvalles Village strip within the High Park area has a strong Polish-Canadian community with a preference for practical, durable appliances. Whirlpool, Maytag, and GE are the most requested brands for installations in this neighbourhood, with reliability and repair-ability valued over luxury features.'
  },
  'little-italy': {
    name: 'Little Italy',
    neighborhoods: ['Little Italy', 'College West', 'Palmerston'],
    housing: 'bohemian neighbourhood with narrow Victorian row houses along College Street, character homes on Palmerston and Euclid Avenues, and a thriving restaurant scene',
    fact: 'Little Italy\'s row houses on Palmerston and Clinton Streets are among Toronto\'s narrowest residential properties, some as little as 12 feet wide. Kitchens in these homes are correspondingly compact, and full-size 24-inch dishwashers often cannot fit through interior doorways without removing door trim. Our technicians measure all access points during the quoting visit and recommend 18-inch compact models when the standard width is not feasible.',
    area: 'Central-West Toronto',
    tip: 'Restaurant owners along College Street in Little Italy also rely on our team for commercial dishwasher installation and repair. We maintain separate commercial service capabilities for the high-temperature sanitizing dishwashers used in food-service establishments, which have different power, water, and drainage requirements than residential units.'
  },
  'the-junction': {
    name: 'The Junction',
    neighborhoods: ['The Junction', 'Junction Triangle', 'Heintzman'],
    housing: 'former railway and meatpacking district now revitalized with Victorian workers\' homes, new condo developments, and a thriving independent retail strip along Dundas West',
    fact: 'The Junction was historically a "dry" area (no alcohol sales) due to its proximity to the rail yards and stockyards, and this working-class heritage is reflected in the modest, practical homes built in the 1890s-1920s. These narrow, deep-lot houses have compact kitchens with original pantry closets that can sometimes be converted to accommodate a dishwasher — our technicians assess whether the pantry structure can support the weight and vibration of a modern unit.',
    area: 'West Toronto',
    tip: 'The Junction Triangle area has seen significant condo development in recent years, with new mid-rise buildings offering modern kitchen layouts pre-wired for all standard appliances. Installations in these new builds are typically straightforward, making The Junction Triangle one of our fastest service areas for standard dishwasher and washer installations.'
  },
  'weston': {
    name: 'Weston',
    neighborhoods: ['Weston Village', 'Mount Dennis', 'Pelmo Park'],
    housing: 'historically working-class neighbourhood with 1920s-1950s homes along the Humber River, now undergoing revitalization with the Eglinton Crosstown and new transit infrastructure',
    fact: 'Weston\'s older homes along the Humber River corridor are in a flood-prone area that has experienced significant flooding events. Homeowners in these areas should have appliances in basements and ground-floor laundry rooms installed on raised platforms with quick-disconnect water supply connections that can be shut off rapidly during flood warnings. Our technicians install flood-protection accessories as part of standard appliance installation in Weston\'s flood zone properties.',
    area: 'Northwest Toronto',
    tip: 'The Eglinton Crosstown LRT extension through Mount Dennis is transforming this area, and new housing construction is bringing modern appliance requirements. We serve both the heritage homes requiring retrofit installations and the new builds needing standard appliance hookups throughout the Weston-Mount Dennis corridor.'
  },
  'eglinton': {
    name: 'Eglinton',
    neighborhoods: ['Yonge-Eglinton', 'Chaplin Estates', 'North Toronto'],
    housing: 'booming Midtown corridor with a mix of 1930s-1950s homes in Chaplin Estates, high-rise condos along Eglinton Avenue, and ongoing redevelopment from the Crosstown LRT',
    fact: 'The Eglinton Crosstown LRT construction has disrupted underground utilities along the Eglinton corridor for years, and some homes near the construction zone experienced temporary water service interruptions and sediment flushes that deposited fine particles in supply lines. New appliance installations in this area should include inline sediment filter installation on supply connections to prevent clogging of dishwasher inlet valves and washing machine fill screens.',
    area: 'Midtown Toronto',
    tip: 'The Yonge-Eglinton condo boom has created a high-density residential area where compact and integrated appliances are in highest demand. Our technicians install more 18-inch dishwashers, ventless dryers, and combination washer-dryer units in this area than anywhere else in the GTA.'
  },
  'downtown': {
    name: 'Downtown Toronto',
    neighborhoods: ['Financial District', 'Entertainment District', 'CityPlace'],
    housing: 'high-rise condo towers with compact units, converted warehouse lofts in King West, and heritage buildings in St. Lawrence Market and Distillery District',
    fact: 'Downtown Toronto condos in CityPlace, ICE District, and Harbour Plaza have some of the most compact kitchen layouts in the GTA — many units under 600 square feet have combination kitchenettes where space for a full dishwasher does not exist. We specialize in countertop dishwasher installation and portable dishwasher setup that connects to the kitchen faucet, providing dishwashing capability without permanent plumbing modification in these micro-kitchens.',
    area: 'Downtown Toronto',
    tip: 'Downtown condo buildings require advance booking of service elevators, often 48-72 hours ahead. Our scheduling team handles elevator booking directly with concierge services to streamline the process and ensure our technicians can access your unit at the scheduled time without delays.'
  },
  'scarborough-village': {
    name: 'Scarborough Village',
    neighborhoods: ['Scarborough Village', 'Cliffcrest', 'Midland Park'],
    housing: 'established 1950s-1960s suburban neighbourhood near the Scarborough Bluffs with bungalows and split-level homes on generous lots, now seeing teardown-rebuild activity',
    fact: 'Scarborough Village is one of the earliest suburban developments in Scarborough, and homes built in the 1950s often have original cast-iron waste pipes and galvanized supply lines that are approaching 70+ years of age. These aging pipes can have internal corrosion that restricts water flow — when our technicians install new high-efficiency appliances that require consistent water pressure, they test flow rates and recommend targeted pipe replacement if the existing plumbing cannot support modern appliance demands.',
    area: 'East Toronto — Scarborough',
    tip: 'The teardown-rebuild trend in Scarborough Village means our technicians often install complete appliance suites in newly built custom homes on previously existing lots. We coordinate with builders to schedule all appliance installations in a single visit — dishwasher, washer, dryer, and any other units — to minimize disruption and ensure all connections are tested together.'
  },
  'etobicoke-village': {
    name: 'Etobicoke Village',
    neighborhoods: ['Etobicoke Village', 'Islington-City Centre West', 'Eatonville'],
    housing: 'suburban Etobicoke neighbourhood centred around Kipling and Dundas, with 1960s-1970s homes, townhouse complexes, and access to the Kipling GO/TTC interchange',
    fact: 'Etobicoke Village homes were largely built during the 1960s suburban expansion and feature standardized kitchen layouts with 24-inch dishwasher cutouts that accommodate all modern brands. However, many of these homes still have their original 60-amp electrical panels, which may not support additional kitchen appliances like dishwashers that were not part of the original home design. Our technicians check panel capacity before every installation and advise on upgrade requirements.',
    area: 'West Toronto — Etobicoke',
    tip: 'The proximity of Etobicoke Village to the Kipling GO/TTC transit hub has attracted young professionals who are upgrading dated kitchens in these affordable starter homes. Our most common installation request here is removing a standalone portable dishwasher and installing a permanent built-in unit with proper plumbing connections.'
  },
  'king-west': {
    name: 'King West',
    neighborhoods: ['King West', 'Fashion District', 'Wellington Place'],
    housing: 'trendy downtown corridor with converted industrial lofts, modern glass condo towers, and a vibrant nightlife and restaurant scene along King Street West',
    fact: 'King West loft conversions in former garment factories retain original industrial features like exposed brick, concrete floors, and steel columns. These aesthetic elements create practical challenges for appliance installation — concrete floors require specialized anchoring for dishwasher mounting brackets, and supply lines often need to run longer distances from utility risers located along exterior walls to kitchen islands positioned in the centre of open-plan lofts.',
    area: 'Downtown Toronto — West',
    tip: 'King West condo units typically come with builder-grade stacked washer-dryer units and compact dishwashers. Residents upgrading to full-size or premium appliances need to verify that the electrical panel and plumbing supply in their unit can handle the increased capacity — our technicians perform a pre-installation assessment to identify any infrastructure upgrades needed before the new appliance arrives.'
  },
  'corso-italia': {
    name: 'Corso Italia',
    neighborhoods: ['Corso Italia', 'Davenport Village', 'St. Clair West'],
    housing: 'Italian-Canadian neighbourhood along St. Clair West with 1920s-1940s brick homes, family-run businesses, and a strong cultural identity reflected in home design preferences',
    fact: 'Corso Italia homeowners frequently import Italian kitchen appliances from brands not commonly distributed in Canada — Bertazzoni, Fulgor Milano, Ilve, and Tecnogas are popular choices. These European appliances may use 220V power instead of the North American standard 240V, and gas connections may use metric thread sizes that require adapter fittings. Our technicians carry European-to-North American adapter kits for these specialty installations.',
    area: 'Central-West Toronto',
    tip: 'Corso Italia homes are often multi-generational, with separate kitchen facilities on the main floor and in the basement. Our technicians regularly install dishwashers and laundry appliances on both levels, ensuring each kitchen has independent water supply shutoffs and properly sloped drain lines that prevent cross-unit drainage issues.'
  },
  'dufferin-grove': {
    name: 'Dufferin Grove',
    neighborhoods: ['Dufferin Grove', 'Brockton Village', 'Wallace Emerson'],
    housing: 'diverse neighbourhood near Dufferin Mall with a mix of Victorian homes, 1960s apartment buildings, and new townhome developments replacing former industrial sites',
    fact: 'Dufferin Grove sits at the intersection of several different build eras — Victorian homes from the 1890s on the east side, postwar apartment blocks along Dufferin Street, and modern infill townhomes on former industrial lots. This architectural diversity means no two installations are the same — one block may have 130-year-old galvanized plumbing while the next has brand-new PEX, requiring our technicians to carry a comprehensive range of fittings and adapters.',
    area: 'Central-West Toronto',
    tip: 'The dense apartment buildings along Dufferin Street house many rental units where landlords need efficient, no-frills appliance installations. We offer landlord service packages for property managers in the Dufferin Grove area that include priority scheduling, standardized appliance recommendations, and bulk pricing for multiple-unit installations.'
  },
  'little-portugal': {
    name: 'Little Portugal',
    neighborhoods: ['Little Portugal', 'Trinity Bellwoods', 'Beaconsfield Village'],
    housing: 'trendy west-end neighbourhood with narrow Victorian row houses, converted duplex homes, and a thriving arts and restaurant scene along Dundas West and Ossington',
    fact: 'Little Portugal\'s Victorian row houses are among the narrowest in Toronto — many are just 14 feet wide with kitchens that are barely 8 feet across. Standard 24-inch dishwashers fit but leave minimal clearance on either side, and the installation path from the front door through narrow hallways requires careful navigation. Our technicians use protective floor runners and wall corner guards to prevent damage during delivery through these tight residential spaces.',
    area: 'West Toronto',
    tip: 'The renovation boom in Little Portugal has created demand for slim European appliances that maximize space in compact kitchens. Bosch 18-inch dishwashers and LG compact washer-dryer combos are our most installed appliances in this neighbourhood, chosen for their space efficiency without compromising performance.'
  },
  'swansea': {
    name: 'Swansea',
    neighborhoods: ['Swansea', 'Windermere', 'Bloor-Jane'],
    housing: 'quiet residential village within west Toronto with 1920s-1940s homes near Grenadier Pond, larger properties on Windermere Avenue, and new townhome developments near Bloor and Jane',
    fact: 'Swansea\'s location adjacent to High Park and Grenadier Pond means homes on the south and west sides of the neighbourhood experience higher ambient humidity than inland areas. Basements in Swansea homes are particularly susceptible to moisture, and appliances installed at or below grade level benefit from moisture-barrier accessories and elevated installation to protect electrical components from seasonal dampness.',
    area: 'West Toronto',
    tip: 'Swansea homeowners value the neighbourhood\'s quiet, village-like atmosphere and tend to invest in high-quality appliances with low noise ratings. Our most requested dishwasher brands in Swansea are Bosch and Miele — both known for operating below 44 decibels, which is quieter than a library conversation.'
  },
  'ossington': {
    name: 'Ossington',
    neighborhoods: ['Ossington', 'Trinity Bellwoods', 'Dovercourt Park'],
    housing: 'one of Toronto\'s hottest neighbourhoods with Victorian homes converted to trendy restaurants and bars along Ossington Avenue, surrounded by family homes on quiet residential side streets',
    fact: 'Ossington\'s rapid commercial development has put pressure on the neighbourhood\'s Victorian-era infrastructure. Homes near the commercial strip may experience water pressure fluctuations during peak business hours when nearby restaurants draw heavily from the same water mains. Our technicians install pressure-stabilizing check valves on appliance supply lines in this area to ensure consistent water delivery regardless of local demand variations.',
    area: 'Central-West Toronto',
    tip: 'The residential side streets off Ossington Avenue have well-maintained Victorian homes where kitchen renovations are increasingly common. Our technicians often install new dishwashers and appliances as part of larger kitchen remodels, coordinating with local contractors to ensure appliance connections align with the renovation timeline.'
  },
  'roncesvalles': {
    name: 'Roncesvalles',
    neighborhoods: ['Roncesvalles Village', 'South Parkdale', 'Garden District'],
    housing: 'family-friendly neighbourhood with 1910s-1930s brick homes, a European-style village commercial strip, and strong community identity rooted in Polish-Canadian heritage',
    fact: 'Roncesvalles homes from the 1910s-1920s are known for their solid construction with thick brick walls and hardwood framing that has stood for over a century. However, original plumbing in these homes is often galvanized steel that has corroded internally, reducing pipe diameter and flow capacity. When installing modern high-flow appliances, our technicians test existing supply lines and replace corroded sections with modern copper or PEX to ensure adequate water delivery.',
    area: 'West Toronto',
    tip: 'Roncesvalles\' strong sense of community means word-of-mouth referrals are particularly important in this neighbourhood. Many of our Roncesvalles clients have been referred by neighbours, and we maintain a neighbourhood-specific service record that helps us anticipate common plumbing configurations found in the area\'s consistent housing stock.'
  },
  'st-lawrence': {
    name: 'St. Lawrence',
    neighborhoods: ['St. Lawrence Market', 'Distillery District', 'Corktown'],
    housing: 'historic neighbourhood near downtown Toronto with a mix of renovated heritage buildings, the upscale Distillery District lofts, and modern condo towers along Front Street',
    fact: 'The St. Lawrence neighbourhood includes some of Toronto\'s oldest residential buildings, dating to the early 1800s. Renovated heritage units in this area may have original stone or brick walls that prohibit drilling for mounting brackets. Our technicians use free-standing and countertop appliance solutions, or adhesive-mounted hardware when permanent wall mounting is not possible due to heritage preservation requirements.',
    area: 'Downtown Toronto',
    tip: 'The Distillery District\'s converted Victorian industrial buildings feature exposed beam ceilings and original brick walls that create stunning living spaces but complicate appliance installation. Supply lines must be routed along walls with minimal visible hardware, and our technicians use colour-matched conduit covers that blend with the industrial aesthetic.'
  },
  'thorncliffe-park': {
    name: 'Thorncliffe Park',
    neighborhoods: ['Thorncliffe Park', 'Flemingdon Park', 'Don Valley'],
    housing: 'diverse high-density community with 1960s-1970s apartment towers, accessible rental housing, and a vibrant multicultural commercial area along Overlea Boulevard',
    fact: 'Thorncliffe Park\'s apartment towers were built in the 1960s with centralized mechanical systems and standardized unit layouts. The kitchens in these buildings have pre-set plumbing rough-ins that accommodate specific appliance sizes — typically 24-inch dishwashers and top-load washers. Replacing appliances in these units requires matching the existing plumbing layout, as modifications to the centralized building systems are generally not permitted by property management.',
    area: 'East Midtown Toronto',
    tip: 'Property managers in Thorncliffe Park\'s rental towers need efficient appliance installation across dozens of identically configured units. Our technicians are familiar with the standard layouts in buildings like the Thorncliffe Park Drive towers and can complete installations quickly based on pre-existing knowledge of each building\'s plumbing and electrical configuration.'
  },
  'trinity-bellwoods': {
    name: 'Trinity Bellwoods',
    neighborhoods: ['Trinity Bellwoods', 'Queen West', 'Bellwoods Park'],
    housing: 'trendy neighbourhood surrounding Trinity Bellwoods Park with Victorian row houses, converted lofts, and new boutique condo developments along Queen Street West',
    fact: 'Trinity Bellwoods row houses are some of the most sought-after properties in Toronto, and renovated units in this area often feature high-end European kitchen packages. The narrow lot widths (typically 16-18 feet) mean kitchens are compact but well-designed, with every inch optimized for storage and appliance placement. Our technicians are experienced with precision installations where clearances are measured in millimeters rather than inches.',
    area: 'Central-West Toronto',
    tip: 'Queen West condo developments near Trinity Bellwoods Park attract young professionals who prioritize modern, efficient appliances. Our most common installation in this area is upgrading builder-grade dishwashers and washer-dryer stacks to premium Bosch or Miele units — a swap that typically takes under two hours per appliance.'
  },
  'willowdale': {
    name: 'Willowdale',
    neighborhoods: ['Willowdale', 'Yonge-Sheppard', 'Spring Garden'],
    housing: 'rapidly densifying North York neighbourhood with the Yonge-Sheppard condo corridor, established 1950s-1960s bungalows being replaced by modern custom homes, and new townhouse infill developments',
    fact: 'Willowdale is experiencing the most dramatic transformation in North York — original 1950s bungalows are being demolished and replaced with two-storey custom homes at an unprecedented rate. These new builds have modern plumbing and electrical designed for today\'s appliances, but the transition period means many blocks have a mix of vintage and new infrastructure. Our technicians adapt their approach based on whether they are servicing an original bungalow with 1950s copper plumbing or a brand-new custom home with PEX and smart home integration.',
    area: 'North Toronto — North York',
    tip: 'The Yonge-Sheppard condo corridor has one of the highest concentrations of compact kitchen layouts in the GTA. Our technicians install more 18-inch dishwashers and ventless dryer units in Willowdale condos than in any other area, and we stock the specialized mounting hardware for compact appliances from all major brands.'
  },
  'wychwood': {
    name: 'Wychwood',
    neighborhoods: ['Wychwood Park', 'Wychwood Barns', 'Hillcrest'],
    housing: 'hidden gem neighbourhood with the artistic Wychwood Barns community, heritage homes in the private Wychwood Park enclave, and character homes along St. Clair West',
    fact: 'Wychwood Park is one of Toronto\'s most unique neighbourhoods — a gated, private community with heritage homes dating to the 1870s-1910s, surrounded by mature trees and winding paths. The original homes in the enclave have preserved heritage kitchens with non-standard dimensions, original plumbing, and electrical systems that require specialized knowledge for any appliance work. Our technicians approach these installations with the care and heritage sensitivity that these designated properties require.',
    area: 'Central Toronto',
    tip: 'The Wychwood Barns art community hosts regular markets and cultural events that bring foot traffic and parking challenges to the area. Our technicians schedule Wychwood service calls for weekday mornings to avoid event days and ensure reliable parking near the service address.'
  },
  'bloor-west-village': {
    name: 'Bloor West Village',
    neighborhoods: ['Bloor West Village', 'Baby Point', 'Runnymede'],
    housing: 'family-friendly shopping village with 1930s-1950s brick homes, independent shops along Bloor Street, and the exclusive Baby Point enclave with ravine-view properties',
    fact: 'Bloor West Village homes were predominantly built between 1930 and 1950, during an era when kitchens were designed as utility rooms rather than living spaces. The original layouts feature separate, enclosed kitchens with limited counter space and single-window lighting. Modern renovations in this area typically involve opening the kitchen to the dining room and adding an island — changes that often require relocating plumbing connections to accommodate dishwashers and other appliances in their new positions.',
    area: 'West Toronto',
    tip: 'Bloor West Village is home to many multigenerational Ukrainian and Polish-Canadian families who maintain their homes meticulously. Our technicians in this area frequently install heavy-duty appliances from Maytag and Whirlpool that are chosen for durability and simple, reliable operation — function over fashion is the priority in this practical neighbourhood.'
  },
  'airdrie': {
    name: 'Airdrie',
    neighborhoods: ['Coopers Crossing', 'Bayside', 'Sagewood'],
    housing: 'rapidly growing Alberta bedroom community north of Calgary with predominantly new-construction homes built between 2005 and 2025, featuring modern layouts designed for today\'s appliances',
    fact: 'Airdrie sits on the Alberta prairies where winter temperatures regularly drop below -30°C. These extreme cold spells can freeze water supply lines in poorly insulated exterior walls, particularly in newer homes where fast-track construction may have left gaps in insulation around plumbing penetrations. Our technicians check supply line insulation during installation and recommend heat tracing for vulnerable sections that could freeze during Alberta winters.',
    area: 'Southern Alberta',
    tip: 'Airdrie\'s new developments are built to current Alberta Building Code with pre-plumbed appliance connections, making most installations straightforward. However, the distance from Calgary means scheduling morning appointments is essential for same-day service — our technicians depart early to reach Airdrie locations by mid-morning.'
  },
  'calgary': {
    name: 'Calgary',
    neighborhoods: ['Beltline', 'Kensington', 'Bowness'],
    housing: 'diverse Alberta city with downtown high-rises in the Beltline, character homes in Kensington and Mount Pleasant, and sprawling suburban developments in the south and northwest',
    fact: 'Calgary\'s water comes from the Bow and Elbow Rivers and is treated at the Bearspaw and Glenmore water treatment plants. The Bow River source produces moderately hard water that causes limescale buildup on appliance heating elements, dishwasher spray arms, and washing machine drums. Calgary homeowners who notice white residue on dishes or reduced appliance performance should consider water softener integration alongside new appliance installation.',
    area: 'Southern Alberta',
    tip: 'Calgary\'s extreme temperature swings — from -35°C winter lows to +35°C summer highs — put unusual stress on appliance components, particularly refrigerator compressors in garages and outdoor kitchens. Our technicians advise on proper appliance placement and climate considerations specific to Alberta\'s continental climate.'
  },
  'edmonton': {
    name: 'Edmonton',
    neighborhoods: ['Strathcona', 'Oliver', 'Windermere'],
    housing: 'Alberta\'s capital with historic Strathcona neighbourhood homes, downtown high-rise living in Oliver, and sprawling new suburbs in Windermere and Heritage Valley',
    fact: 'Edmonton experiences some of the coldest sustained winter temperatures in Canada, with average January lows around -20°C and cold snaps reaching -40°C. These extreme conditions mean water supply lines in exterior walls or unheated garages are at high risk of freezing. Our technicians install heat-trace cable on exposed supply lines and recommend freeze-protection shutoff valves for appliances located near exterior walls as part of standard Edmonton installation service.',
    area: 'Central Alberta',
    tip: 'Edmonton\'s older homes in Strathcona and Bonnie Doon have character and charm but often lack modern plumbing infrastructure. Many of these 1910s-1940s homes were built before dishwashers existed, and retrofitting requires creating new plumbing connections from the kitchen sink, adding a dedicated electrical circuit, and modifying cabinetry to create a dishwasher opening.'
  },
  'york': {
    name: 'York',
    neighborhoods: ['Weston', 'Silverthorn', 'Rockcliffe-Smythe'],
    housing: 'working-class Toronto neighbourhood with 1930s-1950s brick homes, multi-generational family properties, and ongoing revitalization along the Weston Road corridor',
    fact: 'York\'s housing stock consists primarily of modest homes built between 1930 and 1950 for factory workers. These homes were designed with minimal kitchens and often lack space for modern appliances. Many York homeowners have enclosed their rear porches to create additional kitchen space for a dishwasher or laundry area — installations in these converted spaces require careful waterproofing and proper drainage to prevent water damage to the original structure.',
    area: 'West Toronto',
    tip: 'York is one of the most affordable areas in Toronto for homebuyers, attracting first-time homeowners who often need to upgrade outdated appliances and plumbing. Our technicians frequently handle full kitchen appliance installations in York — removing 30-40 year old appliances and installing modern replacements with updated plumbing connections.'
  },
  'west-hill': {
    name: 'West Hill',
    neighborhoods: ['West Hill', 'Centennial', 'Port Union'],
    housing: 'eastern Scarborough neighbourhood with 1960s-1970s ranch-style homes, newer townhouse developments, and waterfront access along the Rouge River and Lake Ontario',
    fact: 'West Hill is adjacent to the Rouge National Urban Park, and homes near the Rouge River may have private well water rather than City of Toronto municipal supply. Well water in the Rouge Valley area tends to have high iron and sulphur content that can stain appliance interiors, clog inlet screens, and produce odour in washing machines. Our technicians recommend whole-house water filtration systems for well-water properties before installing new appliances.',
    area: 'East Toronto — Scarborough',
    tip: 'West Hill ranch-style homes from the 1960s have spacious single-floor layouts with large kitchens that easily accommodate multiple appliances. These homes are popular with retirees who prefer the accessibility of single-floor living, and our technicians can install appliances at ergonomic heights with raised pedestals and extended hose connections for easier loading and unloading.'
  },
  'agincourt': {
    name: 'Agincourt',
    neighborhoods: ['Agincourt', 'L\'Amoreaux', 'Milliken'],
    housing: 'diverse Scarborough neighbourhood with 1960s-1970s suburban homes, a large Chinese-Canadian community, and the Agincourt Mall area serving as the commercial hub',
    fact: 'Agincourt has one of the highest concentrations of multigenerational households in Scarborough, and many homes have been modified to accommodate extended family living with secondary kitchens in basements or on upper floors. These secondary kitchen installations require dedicated water supply lines, separate drain connections, and their own electrical circuits — a full-service installation that our technicians complete regularly in the Agincourt area.',
    area: 'East Toronto — Scarborough',
    tip: 'The L\'Amoreaux area in north Agincourt has newer homes with open-concept kitchens where homeowners prefer premium stainless steel appliance suites. Our most common Agincourt service call is multi-appliance installation — dishwasher, over-the-range microwave, and washer-dryer set installed in a single visit to minimize disruption.'
  },
  'malvern': {
    name: 'Malvern',
    neighborhoods: ['Malvern', 'Rouge', 'Neilson Park'],
    housing: 'northeast Scarborough community with 1970s-1980s townhouses and low-rise apartments, growing immigrant community, and proximity to the Rouge Valley trail system',
    fact: 'Malvern\'s housing stock includes a high proportion of 1970s-1980s townhouses with standardized layouts built by Ontario Housing Corporation. These units have uniform plumbing configurations with specific appliance locations that cannot be easily modified due to shared walls and stacked plumbing between units. Our technicians are familiar with the standard Malvern townhouse layouts and carry the specific fittings and brackets that match these uniform configurations.',
    area: 'Northeast Scarborough',
    tip: 'Townhouse complexes in Malvern are managed by various condo corporations with different renovation policies. Before scheduling appliance installation in a Malvern townhouse, our team recommends checking with the condo corporation about any restrictions on plumbing or electrical modifications to avoid delays or compliance issues.'
  },
  'highland-creek': {
    name: 'Highland Creek',
    neighborhoods: ['Highland Creek', 'Centennial', 'University of Toronto Scarborough'],
    housing: 'charming village community in eastern Scarborough with heritage homes along the Highland Creek ravine, 1960s-1970s family homes, and student housing near UTSC',
    fact: 'Highland Creek village has heritage properties dating to the 1850s that are among the oldest surviving homes in Scarborough. These pre-Confederation buildings have stone foundations, hand-hewn beam structures, and plumbing systems that have been retrofitted multiple times over 170 years. Installing modern appliances in these homes requires a thorough assessment of the existing plumbing and electrical infrastructure, as layers of historical modifications may not meet current code standards.',
    area: 'East Scarborough',
    tip: 'The proximity of Highland Creek to the University of Toronto Scarborough campus means a significant number of rental properties serving student tenants. Landlords in this area need durable, low-maintenance appliances that can withstand heavy use — we recommend commercial-duty models from GE and Whirlpool for student rental installations.'
  },
};

// ── Service types and their unique content angle ──
// Each service type gets a slightly different framing for the city paragraph
const SERVICE_ANGLES = {
  'dishwasher-installation': (city) => `When it comes to dishwasher installation in ${city.name}, the local housing characteristics directly affect the complexity and approach. ${city.housing.charAt(0).toUpperCase() + city.housing.slice(1)} define the landscape in areas like ${city.neighborhoods.join(', ')}. ${city.fact} ${city.tip}`,
  'dishwasher-repair': (city) => `Dishwasher repair needs in ${city.name} are shaped by the area's housing and water conditions. The ${city.area} neighbourhood features ${city.housing}. ${city.fact} Our technicians serving ${city.neighborhoods.join(', ')} carry parts for all major brands and understand the specific plumbing configurations common in ${city.name} homes.`,
  'fridge-repair': (city) => `Refrigerator repair in ${city.name} requires understanding the local conditions that affect how these appliances perform. Homes across ${city.neighborhoods.join(', ')} feature ${city.housing}. ${city.fact} Our ${city.name} technicians carry compressor parts, thermistors, ice maker components, and water filter assemblies for all brands commonly found in ${city.area} homes.`,
  'washer-repair': (city) => `Washing machine repair in ${city.name} is influenced by the area's water quality and housing types. The ${city.area} area includes ${city.housing}. ${city.fact} Our technicians serving ${city.neighborhoods.join(', ')} carry drum bearings, pump assemblies, control boards, and inlet valves to handle the most common washer failures in ${city.name} homes.`,
  'dryer-repair': (city) => `Dryer repair in ${city.name} depends on factors specific to the local housing and ventilation conditions. Properties in ${city.neighborhoods.join(', ')} include ${city.housing}. ${city.fact} Proper dryer venting is critical in ${city.name} — our technicians inspect vent runs for blockages, kinks, and code compliance during every dryer repair visit in the ${city.area} area.`,
  'oven-repair': (city) => `Oven and range repair in ${city.name} requires understanding the specific appliance types and kitchen configurations found in ${city.area} homes. The area features ${city.housing}. ${city.fact} Our ${city.name} technicians carry igniters, bake elements, control boards, and temperature sensors for gas and electric ovens found throughout ${city.neighborhoods.join(', ')}.`,
  'stove-repair': (city) => `Stove repair needs in ${city.name} vary based on the housing stock and fuel types common in the ${city.area} area. Local homes include ${city.housing}. ${city.fact} Whether your ${city.name} home has a gas or electric stove, our technicians serving ${city.neighborhoods.join(', ')} carry the igniters, burner caps, elements, and control components needed for on-the-spot repairs.`,
  'gas-appliance-repair': (city) => `Gas appliance repair in ${city.name} demands licensed technicians who understand the local building codes and gas line configurations in ${city.area} homes. The neighbourhood features ${city.housing}. ${city.fact} Our TSSA-certified technicians serving ${city.neighborhoods.join(', ')} handle gas stove, oven, dryer, and furnace repairs with full safety testing after every service call.`,
  'gas-dryer-repair': (city) => `Gas dryer repair in ${city.name} requires TSSA-certified technicians familiar with the gas line configurations common in ${city.area} properties. Homes in ${city.neighborhoods.join(', ')} include ${city.housing}. ${city.fact} Our technicians perform gas leak testing with electronic sniffers before and after every gas dryer repair in ${city.name}.`,
  'gas-oven-repair': (city) => `Gas oven repair in ${city.name} requires TSSA-certified technicians who understand the gas infrastructure in ${city.area} homes. The area features ${city.housing}. ${city.fact} Our technicians serving ${city.neighborhoods.join(', ')} carry gas igniters, safety valves, and thermocouples for all major brands commonly installed in ${city.name} kitchens.`,
  'gas-stove-repair': (city) => `Gas stove repair in ${city.name} demands technicians certified by the Technical Standards and Safety Authority (TSSA) who know the gas configurations in ${city.area} properties. Local homes include ${city.housing}. ${city.fact} Our certified technicians serving ${city.neighborhoods.join(', ')} test gas pressure, inspect connections, and verify safe operation after every repair.`,
};

// Default service angle for any service type not explicitly listed
const DEFAULT_ANGLE = (serviceType, city) => {
  const serviceName = serviceType.replace(/-/g, ' ');
  return `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} in ${city.name} is shaped by the local housing characteristics and conditions in the ${city.area} area. Properties in ${city.neighborhoods.join(', ')} feature ${city.housing}. ${city.fact} Our technicians are experienced with the specific plumbing, electrical, and appliance configurations found throughout ${city.name}.`;
};

// ── Main logic ──
function main() {
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

  let updated = 0;
  let skipped = 0;
  let noCity = 0;
  let alreadyHas = 0;
  const results = [];

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has unique content
    if (html.includes('<!-- UNIQUE-CITY-CONTENT -->')) {
      alreadyHas++;
      continue;
    }

    // Skip non-city pages (no content-intro section or base service pages)
    if (!html.includes('class="content-intro')) {
      noCity++;
      continue;
    }

    // Detect city from filename
    const basename = path.basename(file, '.html');

    // Try to match city from filename
    let matchedCity = null;
    let matchedCityKey = null;
    let serviceType = null;

    // Sort city keys by length (longest first) to match most specific city first
    const sortedCityKeys = Object.keys(CITY_DATA).sort((a, b) => b.length - a.length);

    for (const cityKey of sortedCityKeys) {
      // Check if filename ends with the city key (after service type prefix)
      if (basename.endsWith(cityKey) || basename === cityKey) {
        // Extract service type (everything before the city name)
        const prefix = basename.slice(0, basename.length - cityKey.length);
        if (prefix === '' || prefix.endsWith('-')) {
          matchedCity = CITY_DATA[cityKey];
          matchedCityKey = cityKey;
          serviceType = prefix ? prefix.slice(0, -1) : null; // Remove trailing dash
          break;
        }
      }
    }

    if (!matchedCity) {
      noCity++;
      continue;
    }

    // Generate unique content based on service type
    let uniqueContent;
    if (serviceType && SERVICE_ANGLES[serviceType]) {
      uniqueContent = SERVICE_ANGLES[serviceType](matchedCity);
    } else if (serviceType) {
      uniqueContent = DEFAULT_ANGLE(serviceType, matchedCity);
    } else {
      // City hub page (e.g., brampton.html, toronto.html)
      uniqueContent = `As a ${matchedCity.area} community, ${matchedCity.name} presents unique conditions for appliance service. The area features ${matchedCity.housing}. ${matchedCity.fact} Our technicians are familiar with the specific needs of homes in ${matchedCity.neighborhoods.join(', ')} and carry the parts, adapters, and tools needed for efficient same-day service throughout ${matchedCity.name}.`;
    }

    // Build the injection HTML
    const injection = `<p class="city-context"><!-- UNIQUE-CITY-CONTENT -->\n${uniqueContent}\n</p><!-- END-UNIQUE-CITY-CONTENT -->`;

    // Find the insertion point: after the first <p>...</p> inside content-intro
    const contentIntroMatch = html.match(/<div class="content-intro[^"]*">/);
    if (!contentIntroMatch) {
      noCity++;
      continue;
    }

    const contentIntroStart = html.indexOf(contentIntroMatch[0]);
    const afterContentIntro = html.slice(contentIntroStart);

    // Find the first <p> tag and its closing </p>
    const firstPMatch = afterContentIntro.match(/<p>[\s\S]*?<\/p>/);
    if (!firstPMatch) {
      // Try to find first <h2> + <p> pattern
      const h2PMatch = afterContentIntro.match(/<h2>[^<]*<\/h2>\s*<p>[\s\S]*?<\/p>/);
      if (!h2PMatch) {
        noCity++;
        continue;
      }
      // Insert after the first h2+p block
      const insertPos = contentIntroStart + afterContentIntro.indexOf(h2PMatch[0]) + h2PMatch[0].length;
      html = html.slice(0, insertPos) + '\n\n    ' + injection + '\n' + html.slice(insertPos);
    } else {
      // Insert after the first <p>
      const insertPos = contentIntroStart + afterContentIntro.indexOf(firstPMatch[0]) + firstPMatch[0].length;
      html = html.slice(0, insertPos) + '\n\n    ' + injection + '\n' + html.slice(insertPos);
    }

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    results.push(`  + ${file} (${matchedCityKey}${serviceType ? ' / ' + serviceType : ' / hub'})`);
  }

  console.log(`\n=== NAR City Uniqueness Injection ===`);
  console.log(`Updated: ${updated} pages`);
  console.log(`Already had unique content: ${alreadyHas}`);
  console.log(`Skipped (no city match): ${noCity}`);
  console.log(`Total HTML files: ${htmlFiles.length}`);
  console.log(`\nUpdated files:`);
  results.forEach(r => console.log(r));
}

main();
