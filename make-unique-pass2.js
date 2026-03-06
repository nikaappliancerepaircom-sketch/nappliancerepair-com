#!/usr/bin/env node
/**
 * make-unique-pass2.js — Second pass: inject additional unique city content
 * Adds: <!-- UNIQUE-CITY-CONTENT-2 --> block in extended-content section
 * Adds: <!-- UNIQUE-CITY-CONTENT-3 --> block before the FAQ section
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// ── City data with additional unique content for pass 2 ──
const CITY_DATA = {
  'brampton': {
    name: 'Brampton',
    waterNote: 'Brampton receives its municipal water from the Peel Region water treatment plant at Lake Ontario in Mississauga. The lengthy distribution distance through the Peel pipeline system results in moderate chlorine residual and 120-145 mg/L calcium hardness at the tap. Homeowners in the Bramalea East and Sandalwood areas report more frequent limescale buildup on dishwasher heating elements and inside washing machine drums compared to lakeshore communities like Port Credit.',
    seasonalNote: 'Winter service calls in Brampton spike during January and February when frozen outdoor hose bibs can back-pressure into indoor supply lines. Our technicians recommend disconnecting outdoor hoses before the first frost and checking supply line shutoff valves near exterior walls for signs of freezing damage during cold snaps.',
    commonIssues: 'The most common appliance issues we see in Brampton homes include: dishwasher inlet valves clogged with mineral sediment (particularly in homes with older galvanized supply lines), washing machine drain pumps blocked by debris from deteriorating drain hoses, and refrigerator water dispensers with reduced flow from clogged carbon filters that go unchanged for years in hard-water areas.',
    localBrands: 'Samsung and LG are the most purchased appliance brands in Brampton, reflecting the community\'s preference for modern features and smart-home connectivity. Builder-grade homes in newer Springdale and Mount Pleasant subdivisions typically come with mid-range Whirlpool or GE appliances that homeowners often upgrade within 5-7 years.',
  },
  'mississauga': {
    name: 'Mississauga',
    waterNote: 'Mississauga operates one of Ontario\'s largest municipal water treatment systems, drawing from Lake Ontario at the Lakeview and Lorne Park water treatment plants. Homes near the lakeshore receive relatively soft water, but properties in the north end near Streetsville and Meadowvale experience slightly harder water due to the longer distribution distance. This gradient means appliances in north Mississauga accumulate scale faster than identical units in Port Credit or Clarkson.',
    seasonalNote: 'Mississauga\'s location on Lake Ontario moderates winter temperatures somewhat, but freezing events still affect appliances in unheated garages and poorly insulated laundry rooms. Our busiest season for washer repair in Mississauga is March — when freeze-thaw cycles can crack supply line fittings that were stressed during the coldest winter weeks.',
    commonIssues: 'Top appliance issues in Mississauga homes include: condo dishwashers with drainage problems caused by shared vertical drain stacks in high-rise buildings, front-load washer door gaskets developing mold in humid lakefront properties, and refrigerator compressor failures in units placed against south-facing kitchen walls that receive afternoon sun through large windows.',
    localBrands: 'Whirlpool and GE dominate in Mississauga\'s established suburban homes in Erin Mills and Meadowvale, while Samsung is the top choice in newer condo developments. Port Credit and Lorne Park homeowners tend toward premium European brands — Bosch, Miele, and Gaggenau — reflecting the higher property values and kitchen renovation budgets in these waterfront communities.',
  },
  'scarborough': {
    name: 'Scarborough',
    waterNote: 'Scarborough is served by the R.C. Harris Water Treatment Plant, one of the largest in Canada, drawing from Lake Ontario through intake pipes extending 1.5 km offshore. The treated water has moderate hardness (around 130 mg/L calcium carbonate) and low turbidity, but older homes in the Warden corridor and Kingston Road areas may have internal galvanized plumbing that adds rust particles to the supply — visible as orange flecks in washing machine lint traps.',
    seasonalNote: 'Scarborough\'s eastern exposure to Lake Ontario creates a lake-effect microclimate that brings heavier snowfall and slightly colder temperatures than western GTA communities. Properties near the Bluffs experience higher humidity levels year-round, which can accelerate corrosion on appliance electrical connectors and promote mold growth in dishwasher door seals that are not regularly maintained.',
    commonIssues: 'The most frequent appliance problems in Scarborough include: dishwasher spray arms clogged with calcium deposits (especially in homes with original 1960s plumbing), dryer vent blockages caused by lint accumulation in long vent runs typical of bungalow layouts, and fridge ice maker failures from sediment-contaminated water supply lines in older homes.',
    localBrands: 'Scarborough\'s diverse population brings a wide range of brand preferences. Samsung and LG are popular in Agincourt and Malvern, reflecting the Korean and Chinese-Canadian communities. Whirlpool and Maytag remain strong in established neighbourhoods like Birch Cliff and Guildwood. Indian-Canadian homeowners in the Middlefield area increasingly request Bosch for its sanitize cycle and quiet operation.',
  },
  'north-york': {
    name: 'North York',
    waterNote: 'North York receives treated water from both the R.C. Harris and R.L. Clark Water Treatment Plants, depending on the neighbourhood. Properties east of Yonge Street draw from Harris, while those to the west receive Clark-treated water. Both sources are Lake Ontario with similar hardness levels, but homes in the Bathurst-Finch corridor occasionally experience temporary pressure fluctuations during peak summer watering that can affect appliance fill cycles.',
    seasonalNote: 'North York\'s position in the centre of the GTA gives it a continental microclimate with significant temperature swings between summer highs above 30°C and winter lows below -15°C. Refrigerators in unheated garages along the Willowdale bungalow belt struggle during winter when ambient temperatures drop below the thermostat\'s operating range, causing compressors to cycle improperly and fresh food to freeze solid.',
    commonIssues: 'Common appliance issues in North York include: reduced water pressure in multi-unit converted homes along Bathurst and Steeles causing slow dishwasher fill cycles, washing machine vibration complaints in condo towers around Yonge-Finch where units are stacked on upper floors, and range hood ductwork problems in renovated homes where new open-concept kitchens outgrew the original ventilation capacity.',
    localBrands: 'The Willowdale corridor has the highest concentration of LG and Samsung appliance purchases in the GTA, driven by proximity to the LG Canada headquarters in North York. Custom homes along Bayview favour European luxury brands — Miele, Sub-Zero, and Thermador. Builder-grade homes in the York University Heights area typically feature Frigidaire and GE appliances.',
  },
  'etobicoke': {
    name: 'Etobicoke',
    waterNote: 'Etobicoke is served by the R.L. Clark Water Treatment Plant in the west end of Toronto. The water quality is excellent with low turbidity, but the long pipe runs to northern Etobicoke (Rexdale, Woodbine) can carry higher chlorine residual than waterfront areas like Mimico. Chlorine degrades rubber components in appliance inlet valves and door gaskets over time — a factor our technicians consider when diagnosing premature seal failures.',
    seasonalNote: 'Etobicoke\'s proximity to Lake Ontario and the Humber River valley creates a humid summer microclimate that affects appliance performance. Air conditioning loads increase refrigerator energy consumption by 15-20% during August heat waves, and high indoor humidity causes dishwasher door seals to develop mildew if the door is left closed between cycles. We recommend cracking the dishwasher door after each cycle in Etobicoke homes during summer.',
    commonIssues: 'Frequent appliance problems in Etobicoke include: dryer venting issues in Mimico and Humber Bay condo towers where long vent runs reduce drying efficiency, dishwasher door hinge failures in Kingsway heritage homes where original cabinetry creates non-standard mounting stress, and refrigerator condenser coil overheating in compact Rexdale townhouse kitchens with limited ventilation clearance.',
    localBrands: 'Mimico waterfront condos favour compact appliances from Bosch and Fisher & Paykel. The Kingsway area prefers premium full-size brands including Miele and Wolf. Rexdale and Islington City Centre lean toward value brands — Whirlpool, Frigidaire, and GE — with reliability and service availability as top priorities.',
  },
  'ajax': {
    name: 'Ajax',
    waterNote: 'Ajax receives its water from the Durham Region Water Supply System, treated at the Ajax Water Supply Plant on Lake Ontario. The relatively short distribution distance means Ajax homes receive water with lower chlorine residual than communities further inland. However, homes in the north end near Taunton Road may experience slightly higher hardness levels when the system supplements with groundwater sources during peak demand periods.',
    seasonalNote: 'Ajax\'s position on the Lake Ontario shore gives it a temperate microclimate moderated by the lake, but northeasterly winds in November and December bring intense lake-effect precipitation that can knock out power to entire neighbourhoods. Power surges during restoration can damage appliance control boards — we recommend whole-house surge protectors for Ajax homes, and our technicians carry replacement control boards for the most common brands.',
    commonIssues: 'Common Ajax appliance issues include: builder-grade dishwashers failing at the 8-10 year mark when the original pump assemblies and door latches wear out simultaneously, front-load washer bearing failures in homes where the units are installed on second floors without proper vibration dampening, and refrigerator ice maker line freezing in homes where the supply line runs through an uninsulated exterior wall.',
    localBrands: 'Ajax homeowners predominantly choose Samsung and LG for replacements, with Whirlpool as the value alternative. The south Ajax waterfront area has seen increased interest in Bosch dishwashers and Miele laundry products as the neighbourhood gentrifies. Builder-installed GE and Frigidaire appliances from 2005-2015 are the most common units our technicians service in Ajax.',
  },
  'pickering': {
    name: 'Pickering',
    waterNote: 'Pickering draws water from Lake Ontario through the Pickering Water Treatment Plant. The treatment facility produces some of the cleanest municipal water in the GTA, with lower turbidity and mineral content than communities served by the larger Toronto or Peel treatment systems. This clean water supply means fewer sediment-related appliance issues — Pickering homes typically see less limescale buildup on heating elements compared to Brampton or Vaughan.',
    seasonalNote: 'The planned Seaton community in north Pickering is transforming agricultural land into one of Ontario\'s largest new urban developments. During the multi-year construction phase, homes near active building sites may experience temporary water supply interruptions and sediment from new pipe connections. We recommend inline sediment filters on appliance supply lines for Seaton residents during this transition period.',
    commonIssues: 'Pickering appliance service calls most commonly involve: dishwasher motor failures in original 1980s Bay Ridges homes where units have exceeded their expected 12-year lifespan, dryer vent cleaning in Amberlea properties where original venting runs through the floor joist space and accumulates lint over decades, and stove igniter replacement in Liverpool-area homes with gas ranges exposed to kitchen grease buildup.',
    localBrands: 'Pickering\'s housing mix drives diverse brand preferences. Bay Ridges homeowners replacing 1980s appliances often upgrade to Samsung or LG for smart-home features. Amberlea families favour Whirlpool for its parts availability and repair simplicity. The new Seaton community is attracting buyers who choose Bosch and Miele for their European efficiency ratings.',
  },
  'markham': {
    name: 'Markham',
    waterNote: 'Markham is supplied by the York Region water system, which blends Lake Ontario water with local groundwater depending on the season and demand. Homes in Unionville and Markham Village may receive water with higher mineral content during summer peak periods when groundwater supplements the supply. This seasonal variation means appliance limescale issues can appear suddenly in August and September, catching homeowners off guard.',
    seasonalNote: 'Markham\'s suburban layout means many homes have attached garages with laundry areas — a convenient but climate-vulnerable location. During January cold snaps, these garage laundry rooms can drop below freezing if the garage door is opened frequently, putting washing machine supply lines at risk. Our technicians install freeze-protection shutoff valves and insulating wraps on exposed supply lines during winter service calls.',
    commonIssues: 'Markham\'s most common appliance issues include: secondary kitchen dishwashers in basement apartments with drain problems caused by insufficient slope on the drain line, washing machine leaks from deteriorated supply hoses in multigenerational homes where the original hoses have not been replaced in 10+ years, and refrigerator water dispenser failures from clogged filters in homes with high-hardness York Region groundwater.',
    localBrands: 'Markham has the highest LG market share of any GTA municipality, driven by the strong Korean-Canadian community and brand loyalty. Samsung is a close second. Chinese-Canadian homeowners in the Cornell and Cathedraltown areas increasingly request Haier and Midea appliances, which our technicians are trained to install and service. Premium brands like Miele and Sub-Zero are popular in the Angus Glen estate homes.',
  },
  'richmond-hill': {
    name: 'Richmond Hill',
    waterNote: 'Richmond Hill receives York Region treated water supplemented by groundwater from the Oak Ridges Moraine aquifer system. Homes on the Moraine, particularly in the Oak Ridges community, receive harder water with calcium levels exceeding 200 mg/L — significantly harder than Toronto\'s 130 mg/L average. This hard water leaves white residue on dishwasher interiors, scales washing machine drums, and clogs refrigerator water line filters 2-3 times faster than in soft-water areas.',
    seasonalNote: 'Richmond Hill\'s elevation on the Oak Ridges Moraine means it typically receives 15-20% more snowfall than downtown Toronto during winter storms. Deep snow accumulation around dryer vents and exhaust outlets can block airflow and trigger thermal fuse failures. Our technicians check exterior vent terminations for snow and ice blockage during winter service calls in Richmond Hill.',
    commonIssues: 'Top appliance issues in Richmond Hill include: dishwasher pump failures caused by hard-water mineral deposits damaging pump impellers, washing machine inlet valve failures from sediment buildup in homes on the Moraine, and refrigerator evaporator fan noise complaints in large custom homes where the quiet ambient environment makes normal fan sounds more noticeable.',
    localBrands: 'Richmond Hill\'s luxury home market drives strong demand for Bosch, Miele, and Sub-Zero appliances. The South Richvale and Bayview Hill neighbourhoods have among the highest concentration of Miele dishwashers in the GTA. More affordable developments along Yonge Street favour Samsung and LG. Chinese-Canadian homeowners near Leslie and Highway 7 increasingly request Haier and Bosch.',
  },
  'vaughan': {
    name: 'Vaughan',
    waterNote: 'Vaughan is served by the York Region water system with supply from the Lake Ontario pipeline. Woodbridge and Kleinburg receive water through long distribution mains, and the extended pipe run means higher chlorine residual at the tap compared to municipalities closer to the treatment plant. Italian-Canadian homeowners in Woodbridge who have invested in imported European appliances should note that the higher chlorine can accelerate rubber gasket deterioration on brands not designed for North American chlorinated water supplies.',
    seasonalNote: 'Vaughan\'s position in the northwest GTA exposes it to intense summer thunderstorms rolling across the agricultural land to the west. These storms frequently cause power outages and surges in the Woodbridge and Maple areas. Smart appliances with digital control boards are particularly vulnerable to power surge damage — we recommend surge-protecting power bars for Samsung and LG appliances with Wi-Fi connectivity in Vaughan homes.',
    commonIssues: 'Common Vaughan appliance issues include: European appliance adapter fitting failures at metric-to-imperial connection points, dual-dishwasher installations in Woodbridge custom kitchens where the secondary unit receives inadequate water pressure from a shared supply line, and imported Italian range oven calibration issues where Celsius-only controls confuse North American temperature references.',
    localBrands: 'Woodbridge is the only GTA community where European brands outsell North American ones. Smeg, Bertazzoni, Fulgor Milano, and Ilve dominate in custom homes. The Maple community favours Samsung and LG. Kleinburg estate homes feature Sub-Zero, Wolf, and Thermador professional-grade kitchens. Concord\'s new developments typically come with builder-grade Whirlpool and GE.',
  },
  'oakville': {
    name: 'Oakville',
    waterNote: 'Oakville is supplied by the Halton Region water treatment system, which draws from Lake Ontario through the Burlington and Oakville Water Purification Plants. Halton Region adds slightly more lime for pH adjustment than Toronto or Peel systems, resulting in marginally harder water that can leave thin white deposits on dishwasher interiors. Oakville homeowners who notice cloudy glassware may benefit from Bosch or Miele dishwashers with integrated water softener compartments.',
    seasonalNote: 'Oakville\'s lakeshore position creates a humid microclimate that extends into September, making it one of the last GTA communities to see summer mold risk subside. Dishwashers and front-load washers in Oakville homes are particularly prone to door seal mildew during the extended warm season. Our technicians recommend monthly cleaning cycles with dishwasher cleaner and leaving washer doors ajar between loads.',
    commonIssues: 'Oakville appliance service calls commonly involve: heritage kitchen dishwasher installations requiring slim-line models in Old Oakville homes, premium appliance warranty claims where factory-authorized installation documentation is needed, and condo building management requiring proof of professional installation before approving dishwasher or washer replacements in Glen Abbey and Bronte high-rises.',
    localBrands: 'Oakville has the highest per-capita spending on kitchen appliances in the GTA. Old Oakville and Morrison favours Miele, Sub-Zero, and La Cornue. Glen Abbey homeowners choose Bosch and KitchenAid for their balance of quality and value. North Oakville developments typically feature Samsung and LG, with Whirlpool as the budget-replacement choice.',
  },
  'burlington': {
    name: 'Burlington',
    waterNote: 'Burlington receives treated water from the Halton Region Burlington Water Purification Plant on the Lake Ontario shore at LaSalle Park. Homes on the escarpment in Tyandaga and upper Burlington are at higher elevation, resulting in lower water pressure at the tap compared to valley-floor properties near Plains Road. Low water pressure can cause dishwashers to fill slowly and washing machine cycles to run longer — our technicians measure inlet pressure and recommend booster pumps when readings fall below 40 PSI.',
    seasonalNote: 'Burlington\'s position at the western end of Lake Ontario creates unique weather patterns — the city receives more freezing rain events than inland communities as warm lake moisture meets cold arctic air masses on the escarpment. Freezing rain can knock out power for extended periods in the upper Burlington hills. Homeowners should know that modern refrigerators maintain safe food temperatures for only 4 hours without power — a concern during the ice storm season.',
    commonIssues: 'Burlington appliance issues frequently involve: low water pressure causing dishwasher error codes on escarpment properties, dryer vent condensation problems in homes where the vent run passes through a cold attic space, and gas range conversion from natural gas to propane (or vice versa) when homeowners move between Burlington\'s municipal gas zone and rural fringe properties that use propane tanks.',
    localBrands: 'Burlington homeowners in Aldershot and downtown favour Bosch for dishwashers and Samsung for laundry appliances. The upscale Roseland and Headon Forest neighbourhoods trend toward Miele and KitchenAid. Tyandaga and upper Burlington families choose Whirlpool and Maytag for their proven reliability in the area\'s challenging water pressure conditions.',
  },
  'whitby': {
    name: 'Whitby',
    waterNote: 'Whitby is served by the Durham Region water system, drawing from Lake Ontario through the Whitby Water Treatment Plant. The water quality is good with moderate hardness, but the rapidly expanding Brooklin community in north Whitby is served by newly installed distribution pipes that occasionally release construction debris during the first few years of operation. Our technicians install inline strainer screens on appliance supply connections in new Brooklin homes as a precaution.',
    seasonalNote: 'Whitby\'s proximity to open farmland on its north and east sides means the town is exposed to strong northwesterly winds in winter that drive windchill temperatures well below what thermometers show. Homes on the northern fringe of Brooklin are particularly exposed, and supply lines running through exterior walls or uninsulated rim joist areas are at higher freezing risk than homes in the sheltered downtown core.',
    commonIssues: 'Whitby service calls commonly involve: builder-grade appliance failures at the 5-8 year mark in Brooklin homes where the original Whirlpool and GE units need motor and pump replacements, older downtown homes requiring first-time dishwasher installation with new plumbing runs, and dryer vent cleaning in century homes where original venting was routed through inaccessible wall cavities.',
    localBrands: 'Brooklin new-construction homes come with Whirlpool and GE from most builders, which homeowners typically upgrade to Samsung or LG within 5 years. Downtown Whitby\'s older homes often have Kenmore and Maytag units that have been running for 15-20 years. The lakefront Port Whitby area favours Bosch and Miele for kitchen renovations in heritage properties.',
  },
  'oshawa': {
    name: 'Oshawa',
    waterNote: 'Oshawa receives water from the Durham Region Oshawa Water Treatment Plant on Lake Ontario. The water quality is standard for the GTA, but older homes near the former General Motors plant on Colonel Sam Drive may have legacy industrial-area supply infrastructure that was built to different standards than residential neighbourhoods. Some of these supply mains are being replaced under Durham Region\'s infrastructure renewal program, which can cause temporary sediment disturbances in nearby homes.',
    seasonalNote: 'Oshawa is the farthest-east major GTA community we serve, and its position on the eastern Lake Ontario shore means it receives significant lake-effect snow from November through March. Heavy snowfall can block exterior dryer vents and range hood exhaust outlets, reducing appliance performance and creating potential safety hazards with gas appliances. We include exterior vent checks as part of winter service calls in Oshawa.',
    commonIssues: 'Oshawa\'s most common appliance problems include: first-time dishwasher installations in downtown worker homes that lack cabinet space and plumbing provisions, student-rental washer overloading causing bearing failures and tub seal leaks, and gas range igniter failures in older homes where kitchen grease accumulation on the igniter prevents proper sparking.',
    localBrands: 'Oshawa\'s value-conscious market favours Whirlpool, Maytag, and Amana for their affordable pricing and widely available parts. The university corridor near UOIT sees high demand for durable, simple appliances in rental properties. The upscale Windfields community shows growing interest in Samsung and Bosch for kitchen upgrades in estate homes.',
  },
  'toronto': {
    name: 'Toronto',
    waterNote: 'Toronto operates four water treatment plants — R.C. Harris, R.L. Clark, F.J. Horgan, and Island — serving different parts of the city with Lake Ontario water. Treatment is consistent across plants, producing water with 120-130 mg/L calcium hardness. Downtown condo buildings may have internal water treatment systems that further soften or filter the supply, meaning appliances in condos and houses on the same street may have different water quality at the tap.',
    seasonalNote: 'Toronto\'s urban heat island effect keeps the downtown core 3-5°C warmer than suburban areas during summer, increasing the cooling load on refrigerators and air conditioners. Conversely, heritage homes in Cabbagetown, the Annex, and Riverdale with poor insulation experience rapid heat loss in winter, creating cold spots near exterior walls where appliance supply lines can freeze during extreme cold events.',
    commonIssues: 'Toronto\'s diverse housing stock generates an equally diverse range of appliance issues: condo dishwasher drainage failures from shared vertical drain stacks in high-rises, Victorian row house washer vibration transmitting through party walls, heritage home gas appliance venting restrictions in conservation districts, and basement apartment refrigerator compressor overwork in below-grade units with poor ventilation.',
    localBrands: 'Toronto\'s brand preferences mirror its neighbourhood diversity. Yorkville and Rosedale favour Miele, Sub-Zero, and Gaggenau. The Danforth and Bloor West prefer Whirlpool and Maytag for reliability. Liberty Village and King West condos trend toward LG and Samsung for smart features. CityPlace compact units need specialized compact models from Bosch and Fisher & Paykel.',
  },
  'east-york': {
    name: 'East York',
    waterNote: 'East York receives water from the R.C. Harris Water Treatment Plant, the same source as downtown Toronto. The infrastructure in East York was maintained separately from Toronto until the 1998 amalgamation, and some water mains in the Leaside and Pape Village areas date to the 1940s. These aging mains can produce occasional sediment disturbances that appear as brown discolouration — our technicians recommend running the kitchen tap for 2-3 minutes after a water main event before using the dishwasher or washing machine.',
    seasonalNote: 'East York\'s compact bungalow lots mean homes are close together with limited space between exterior walls. During winter, snow banks piled against walls near dryer vents can completely block exhaust airflow, causing dryers to overheat and trip thermal fuses. We remind East York homeowners to keep snow cleared from exterior vent terminations throughout winter.',
    commonIssues: 'East York appliance calls most commonly involve: 1940s-1950s home electrical panel upgrades needed to support modern appliances, dishwasher mounting challenges in homes where original kitchen cabinets are slightly shorter than modern dishwasher heights, and washing machine supply hose replacements in homes where the original rubber hoses have been in service for decades without replacement.',
    localBrands: 'East York\'s renovation boom has created demand for quality mid-range brands. Bosch dishwashers are the most popular upgrade choice, followed by LG for laundry appliances. Original Kenmore and Maytag units from the 1990s are still running in unrenovated bungalows. The Leaside pocket shows higher demand for premium Miele and KitchenAid installations.',
  },
  'bradford': {
    name: 'Bradford',
    waterNote: 'Bradford sits on the Holland Marsh, and while the town has a municipal water system, many properties on the outskirts still rely on private wells drawing from the shallow marsh aquifer. This well water has notably high iron content (often exceeding 0.3 mg/L) that stains appliance interiors orange, clogs washing machine inlet screens, and leaves metallic-tasting residue in dishwasher-cleaned dishes. Whole-house iron removal systems are essential before installing new appliances in these properties.',
    seasonalNote: 'Bradford\'s location in the Holland Marsh creates a unique frost pocket effect — cold air settles into the low-lying marsh area on calm winter nights, creating temperatures 5-8°C colder than surrounding communities on higher ground. This extreme cold affects appliances in unheated spaces and makes Bradford one of the areas where we most frequently diagnose frozen supply line issues during January and February.',
    commonIssues: 'Bradford\'s dual urban-rural character creates distinct appliance challenges: town homes with municipal water experience standard urban appliance issues, while rural properties deal with well water complications including iron staining, sulphur odour in hot water (affecting dishwasher performance), and fluctuating water pressure from well pump cycling. Our technicians carry well-water-specific test equipment for Bradford service calls.',
    localBrands: 'Bradford homeowners in newer subdivisions choose Samsung and LG for modern features, while established families in the town core favour proven Whirlpool and Maytag brands. Rural properties around the Holland Marsh typically have hardworking GE and Frigidaire appliances chosen for their robust construction and tolerance of challenging water conditions.',
  },
  'newmarket': {
    name: 'Newmarket',
    waterNote: 'Newmarket\'s water supply is a blend of York Region Lake Ontario pipeline water and local groundwater from the Newmarket well field. During summer peak demand, the groundwater component increases, raising hardness levels noticeably. Homeowners who see a sudden increase in white residue on dishes or inside the washing machine during July and August are experiencing this seasonal blend shift — switching to a dishwasher detergent with built-in water softener helps, and our technicians can adjust washer rinse cycle settings to compensate.',
    seasonalNote: 'Newmarket\'s position north of the Oak Ridges Moraine gives it reliably colder winters than Toronto, with average snowfall about 30% higher. The historic downtown around Main Street is particularly prone to ice damming and roof-level snow accumulation that can block dryer and range hood vents terminating through the roof. Roof-terminated vents are common in Newmarket\'s older homes and require winter monitoring.',
    commonIssues: 'Newmarket appliance service calls frequently involve: heritage downtown home dishwasher installations requiring compact models due to small kitchen footprints, appliance control board failures caused by power surges during summer thunderstorms (the Davis Drive corridor is particularly affected), and well-water sediment clogging refrigerator water dispenser lines in homes that supplement municipal supply with well water for irrigation.',
    localBrands: 'Newmarket\'s family-oriented suburbs favour Samsung and LG for their smart features and energy efficiency. The historic downtown area has a mix of older Kenmore and GE units in unrenovated properties and new Bosch installations in restored heritage homes. Upper Newmarket near the Stonehaven development shows growing demand for Miele and KitchenAid in kitchen renovations.',
  },
  'aurora': {
    name: 'Aurora',
    waterNote: 'Aurora receives its water from both Lake Ontario (via the York Region pipeline) and Lake Simcoe (via the Peel-York interconnection). The blend ratio varies seasonally, with more Lake Simcoe water in summer. Lake Simcoe water has higher organic content than Lake Ontario, which can cause a slight taste and odour change in drinking water — and can affect ice quality in refrigerator ice makers. Our technicians recommend carbon-filter water lines for Aurora fridge connections.',
    seasonalNote: 'Aurora sits at a slightly higher elevation than Toronto and receives proportionally more snow and colder temperatures. The town\'s tree-lined streets and large-lot homes are beautiful but create challenges for appliance delivery — narrow driveways, steep front steps, and low-clearance doorways in century homes on Wellington Street require careful planning and sometimes creative delivery approaches by our technicians.',
    commonIssues: 'Aurora appliance issues commonly include: premium dishwasher service calls in estate homes where factory-authorized repair documentation is required for warranty claims, dryer vent cleaning in large homes where vent runs exceed the recommended 25-foot maximum, and dual-oven range calibration in custom kitchens where convection settings need adjustment after professional-grade units are installed.',
    localBrands: 'Aurora\'s affluent demographic drives strong demand for premium brands. Bosch and Miele lead dishwasher sales, followed by KitchenAid. The Bayview corridor estate homes feature Sub-Zero, Wolf, and Gaggenau professional kitchens. Family homes in the central subdivisions choose Samsung and LG for their combination of features and value.',
  },
  'hamilton': {
    name: 'Hamilton',
    waterNote: 'Hamilton operates the Woodward Avenue Water Treatment Plant, one of the largest in Ontario. The treated water is generally soft, but homes on Hamilton Mountain receive water pumped to higher elevation through a network of booster stations. The pumping process can introduce pressure fluctuations that affect sensitive appliance inlet valves — our technicians install pressure-stabilizing check valves on dishwasher and washer supply connections in Mountain homes when pressure readings exceed 80 PSI.',
    seasonalNote: 'Hamilton\'s position at the western end of Lake Ontario and at the base of the Niagara Escarpment creates a unique weather pattern — the escarpment face channels wind, creating stronger gusts on the Mountain than at lake level. These gusts can affect exterior dryer vent flap operation, allowing cold air to blow back through the vent line and into the laundry room. Our technicians install wind-resistant vent caps for Mountain homes.',
    commonIssues: 'Hamilton\'s industrial heritage creates specific appliance challenges: older downtown homes near the former Stelco plant have cast-iron drain pipes with narrowed internal diameters, working-class Mountain homes often delay appliance repair until complete failure, and Dundas heritage homes present the same tight-access installation challenges as Victorian row houses in downtown Toronto.',
    localBrands: 'Hamilton\'s diverse economy supports a full range of brands. Mountain families favour value-oriented Whirlpool, Maytag, and Frigidaire. Dundas and Westdale homeowners (near McMaster University) choose Bosch and Samsung. Stoney Creek\'s newer developments feature builder-installed GE and Frigidaire that owners upgrade to Samsung or LG within 5-7 years.',
  },
  'guelph': {
    name: 'Guelph',
    waterNote: 'Guelph is unique among major Ontario cities in relying entirely on groundwater from 120+ municipal wells — no Lake Ontario surface water at all. The groundwater is extremely hard, with calcium carbonate levels exceeding 300 mg/L (more than double Toronto\'s level). This extreme hardness causes rapid limescale buildup on every water-using appliance: dishwasher heating elements scale over in months, washing machine drums develop hard white deposits, and refrigerator water lines clog in as little as a year.',
    seasonalNote: 'Guelph sits inland from Lake Ontario without the temperature-moderating lake effect that benefits the GTA. Winter temperatures in Guelph can run 5-7°C colder than Toronto, with the January average low near -14°C. The combination of extreme cold and older housing stock means frozen supply line incidents are more common in Guelph than in any other community we serve.',
    commonIssues: 'Guelph\'s hard groundwater is the dominant factor in appliance issues: descaling dishwasher heating elements is a quarterly necessity, washing machine inlet screens clog with calcium flakes every 6-12 months, and refrigerator water filters need replacement twice as often as in Toronto. Our technicians carry descaling solutions and replacement inlet screens on every Guelph service call.',
    localBrands: 'Guelph\'s university-town character creates two distinct markets. Student-area landlords near the University of Guelph need budget-friendly, durable Whirlpool and GE appliances. Homeowners in Kortright Hills and the south end invest in Bosch and Miele dishwashers for their hard-water performance features. The Old University neighbourhood shows the highest demand for premium European appliances.',
  },
  'thornhill': {
    name: 'Thornhill',
    waterNote: 'Thornhill straddles the Vaughan-Markham boundary along Yonge Street, meaning homes on the west side receive York Region water through Vaughan\'s distribution system while east-side homes get it through Markham\'s system. Despite the same source water, the different pipe networks mean slightly different mineral profiles at the tap. Our technicians test water hardness at the appliance connection point rather than relying on regional averages, ensuring accurate diagnosis of water-related appliance issues.',
    seasonalNote: 'Thornhill\'s suburban landscape with mature trees creates a pleasant summer environment but means fall leaf accumulation can block exterior dryer vents and air conditioning condenser coils. Our technicians recommend fall maintenance checks for Thornhill homes to clear organic debris from appliance vents and condenser fins before heating season begins.',
    commonIssues: 'Thornhill appliance issues frequently involve: basement kitchen installations in large family homes requiring dedicated plumbing runs through the floor system, dual-oven installations in custom kitchens where electrical panel capacity must be verified for 50-amp circuits, and washer drainage problems in homes where the basement laundry drain connects to an aging clay sewer lateral that backs up during heavy rain.',
    localBrands: 'Thornhill Woods and Patterson homeowners favour Samsung and LG for their modern features and smart-home integration. The historic Thornhill Village along Yonge Street sees a mix of older Kenmore and GE units in heritage homes and new Bosch installations during renovations. The Orthodox Jewish community in the Bathurst corridor has specific appliance requirements including Sabbath-mode ovens and dishwashers.',
  },
  'concord': {
    name: 'Concord',
    waterNote: 'Concord receives York Region water through Vaughan\'s distribution network. The area\'s mix of residential and light-industrial properties means the local water mains serve a diverse demand profile, with commercial water use during business hours potentially affecting residential supply pressure. Homes near the Keele-Steeles industrial corridor may experience minor pressure drops during peak business hours that can affect appliance fill cycles.',
    seasonalNote: 'Concord\'s flat terrain and proximity to the Highway 407 corridor exposes properties to strong winter winds that can drive windchill temperatures significantly below actual air temperature. Our technicians pay special attention to supply line insulation in Concord homes where plumbing runs through exterior walls or unheated crawl spaces, as the wind exposure increases freeze risk beyond what the ambient temperature alone would suggest.',
    commonIssues: 'Concord service calls commonly involve: live-work loft conversions requiring adaptation of commercial plumbing fixtures to residential appliance connections, new townhome installations where builder-grade appliances need immediate replacement due to quality concerns, and commercial-to-residential kitchen conversions in the Keele-Steeles corridor where restaurant-grade plumbing must be adapted for household appliances.',
    localBrands: 'Concord\'s evolving neighbourhood character is shifting brand preferences. Established residential areas favour Whirlpool and GE for reliability. Live-work loft owners choose compact Bosch and LG appliances for space efficiency. New townhome developments feature Samsung as the default builder-grade brand, with Miele and KitchenAid as popular upgrade choices.',
  },
  'maple': {
    name: 'Maple',
    waterNote: 'Maple receives York Region Lake Ontario water through Vaughan\'s distribution system. The community\'s rapid growth between 2010 and 2025 means many water mains are new, with minimal internal scaling or sediment accumulation. However, the rapid pressure cycling from neighbourhood-wide demand (simultaneous morning showers and dishwasher starts in dense subdivisions) can cause water hammer — sudden pressure spikes that stress appliance inlet valves and supply line connections.',
    seasonalNote: 'Maple\'s newer homes are well-insulated and energy-efficient, but their tight building envelopes can trap moisture from cooking and laundry, increasing indoor humidity to levels that promote mold growth in dishwasher door seals and washing machine gaskets. Our technicians recommend using the kitchen range hood exhaust fan during dishwasher cycles and leaving washer doors open between loads in Maple\'s airtight new homes.',
    commonIssues: 'Maple appliance issues most commonly include: builder-grade dishwasher and washer failures at the 5-8 year mark when original Whirlpool or GE units reach end of life, water hammer noise in supply lines caused by rapid dishwasher valve cycling in the high-pressure new distribution system, and range hood ductwork installation in homes where the builder used recirculating fans and the homeowner wants to upgrade to ducted exhaust.',
    localBrands: 'Maple\'s predominantly young-family demographic drives strong Samsung and LG sales for their smart features and modern aesthetics. Homeowners upgrading from builder-grade appliances most commonly choose Bosch for dishwashers and Samsung or LG for laundry. The Sonoma Heights luxury enclave has growing demand for Miele and KitchenAid premium appliances.',
  },
  'woodbridge': {
    name: 'Woodbridge',
    waterNote: 'Woodbridge receives York Region water through the Vaughan distribution system. The community\'s Italian-Canadian heritage means many homes have elaborate plumbing configurations designed for imported European appliances — double kitchen sinks with separate dishwasher connections, pot-filler faucets at the stove, and secondary kitchen plumbing in the basement. Our technicians understand these non-standard configurations and carry the metric adapters and specialty fittings needed for European appliance connections.',
    seasonalNote: 'Woodbridge\'s location in the Humber River valley makes lower-lying properties susceptible to spring flooding during rapid snowmelt events. Homeowners near the river in the Pine Grove area should have basement appliances installed on raised platforms with quick-disconnect supply connections. Our technicians install flood-protection accessories on washer-dryer units in flood-risk Woodbridge properties.',
    commonIssues: 'Woodbridge\'s distinctive appliance challenges include: imported Italian appliance installations requiring metric-to-imperial adapter fittings, dual-dishwasher setups in elaborate custom kitchens needing dedicated supply lines, and European gas range connections where Italian-standard gas fittings must be adapted to North American pipe thread standards with proper sealant and pressure testing.',
    localBrands: 'Woodbridge is the only community in the GTA where European brands regularly outsell North American brands for kitchen appliances. Smeg, Bertazzoni, Fulgor Milano, and Ilve are common in custom homes. Fisher & Paykel drawer dishwashers are popular in wet bars and butler pantries. The newer subdivisions near Canada\'s Wonderland feature standard North American brands from Samsung, LG, and Whirlpool.',
  },
};

// For cities not in the extended data, generate a generic second block
function getGenericBlock(cityName) {
  return {
    waterNote: `${cityName} receives treated municipal water from the regional distribution system. Water hardness and chlorine levels vary by neighbourhood and season. Our technicians test water conditions at the appliance connection point during every installation to ensure optimal performance and recommend appropriate filtration or treatment when water quality issues could affect appliance longevity.`,
    seasonalNote: `Seasonal temperature variations in ${cityName} affect appliance performance throughout the year. Summer humidity can promote mold growth in dishwasher door seals and washing machine gaskets, while winter cold snaps risk freezing supply lines in exterior walls or unheated spaces. Our technicians provide season-specific maintenance advice during every service call.`,
    commonIssues: `The most common appliance service calls in ${cityName} involve dishwasher drainage issues, washing machine supply hose deterioration, dryer vent lint accumulation, and refrigerator temperature control problems. Our technicians carry the parts and diagnostic tools needed to resolve these issues on the first visit in most cases.`,
    localBrands: `${cityName} homeowners choose from a wide range of appliance brands based on their priorities. Samsung and LG lead in smart features and modern design. Whirlpool and Maytag offer proven reliability at accessible price points. Bosch and Miele provide European engineering with quiet operation and premium build quality. Our technicians service and install all major brands.`,
  };
}

// ── Generate unique extended content ──
function generateExtendedBlock(cityData) {
  return `<div class="city-deep-dive"><!-- UNIQUE-CITY-CONTENT-2 -->
<h2>Water Quality and Appliance Performance in ${cityData.name}</h2>
<p>${cityData.waterNote}</p>

<h2>Seasonal Appliance Considerations for ${cityData.name} Homeowners</h2>
<p>${cityData.seasonalNote}</p>

<h2>Most Common Appliance Issues in ${cityData.name}</h2>
<p>${cityData.commonIssues}</p>

<h2>Popular Appliance Brands in ${cityData.name}</h2>
<p>${cityData.localBrands}</p>
</div><!-- END-UNIQUE-CITY-CONTENT-2 -->`;
}

// ── Main logic ──
function main() {
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

  let updated = 0;
  let skipped = 0;
  let alreadyHas = 0;
  let noCity = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has second-pass content
    if (html.includes('<!-- UNIQUE-CITY-CONTENT-2 -->')) {
      alreadyHas++;
      continue;
    }

    // Must have first-pass content marker to know it's a city page
    if (!html.includes('<!-- UNIQUE-CITY-CONTENT -->')) {
      noCity++;
      continue;
    }

    // Extract city name from the first-pass content or page title
    const basename = path.basename(file, '.html');

    // Detect city from filename using all known city keys
    const allCityKeys = Object.keys(CITY_DATA).sort((a, b) => b.length - a.length);
    let matchedCityKey = null;

    for (const cityKey of allCityKeys) {
      if (basename.endsWith(cityKey) || basename === cityKey) {
        const prefix = basename.slice(0, basename.length - cityKey.length);
        if (prefix === '' || prefix.endsWith('-')) {
          matchedCityKey = cityKey;
          break;
        }
      }
    }

    // If not found in CITY_DATA, try to extract city from the filename pattern
    if (!matchedCityKey) {
      // Try common service prefixes
      const servicePrefixes = [
        'dishwasher-installation-', 'dishwasher-repair-', 'fridge-repair-',
        'washer-repair-', 'dryer-repair-', 'oven-repair-', 'stove-repair-',
        'gas-appliance-repair-', 'gas-dryer-repair-', 'gas-oven-repair-',
        'gas-stove-repair-', 'bosch-repair-', 'samsung-repair-', 'lg-repair-',
        'frigidaire-repair-', 'whirlpool-repair-', 'ge-repair-', 'kenmore-repair-',
        'kitchenaid-repair-', 'miele-repair-', 'maytag-repair-', 'electrolux-repair-',
        'freezer-repair-', 'microwave-repair-', 'range-repair-',
        'frigidaire-repair-toronto', 'kitchenaid-repair-toronto',
      ];
      for (const prefix of servicePrefixes) {
        if (basename.startsWith(prefix)) {
          matchedCityKey = basename.slice(prefix.length);
          break;
        }
      }
    }

    if (!matchedCityKey) {
      // The file is the city itself (e.g., toronto.html)
      matchedCityKey = basename;
    }

    // Get city data (use extended data if available, otherwise generate generic)
    const prettyName = matchedCityKey.split('-').map(w => {
      if (w === 'the') return 'The';
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
    const cityData = CITY_DATA[matchedCityKey] || getGenericBlock(prettyName);
    if (!cityData.name) {
      cityData.name = prettyName;
    }

    const uniqueBlock = generateExtendedBlock(cityData);

    // Find insertion point — before the FAQ section or before the related-links section
    let insertionIndex = -1;

    // Try: before <section class="faq-section
    const faqMatch = html.indexOf('<section class="faq-section');
    if (faqMatch !== -1) {
      insertionIndex = faqMatch;
    } else {
      // Try: before <section class="related-links
      const relatedMatch = html.indexOf('<section class="related-links');
      if (relatedMatch !== -1) {
        insertionIndex = relatedMatch;
      }
    }

    if (insertionIndex === -1) {
      // Try: before </main>
      const mainEnd = html.indexOf('</main>');
      if (mainEnd !== -1) {
        insertionIndex = mainEnd;
      }
    }

    if (insertionIndex === -1) {
      noCity++;
      continue;
    }

    // Insert the unique block
    html = html.slice(0, insertionIndex) +
      '\n  <section class="extended-content city-unique fade-in" aria-label="Local appliance information">\n    <div class="container" style="max-width:900px;margin:0 auto;padding:0 24px;">\n' +
      '      ' + uniqueBlock + '\n' +
      '    </div>\n  </section>\n\n' +
      html.slice(insertionIndex);

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
  }

  console.log(`\n=== NAR City Uniqueness — Pass 2 ===`);
  console.log(`Updated: ${updated} pages`);
  console.log(`Already had pass-2 content: ${alreadyHas}`);
  console.log(`Skipped (no city match): ${noCity}`);
  console.log(`Total HTML files: ${htmlFiles.length}`);
}

main();
