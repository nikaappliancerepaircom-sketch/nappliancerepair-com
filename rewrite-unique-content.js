'use strict';
const fs = require('fs');
const path = require('path');

const BASE = 'C:/nappliancerepair';
const PHONE = '(416) 826-3424';

// Load data from JSON files written alongside this script
const CITY_DATA = JSON.parse(fs.readFileSync(path.join(BASE,'cities.json'),'utf8'));
const SERVICE_CITY = JSON.parse(fs.readFileSync(path.join(BASE,'svc-specific.json'),'utf8'));

const SERVICE_META = {
  washer:     { display: 'Washing Machine', short: 'washer',     waterfactor: 'inlet valves, pump housings, and internal components',               cost: '$120–$350' },
  dryer:      { display: 'Dryer',           short: 'dryer',      waterfactor: 'appliance longevity in general',                                     cost: '$100–$300' },
  fridge:     { display: 'Refrigerator',    short: 'fridge',     waterfactor: 'water inlet valves, ice maker assemblies, and dispenser components', cost: '$150–$400' },
  dishwasher: { display: 'Dishwasher',      short: 'dishwasher', waterfactor: 'spray arms, heating elements, and inlet valves',                    cost: '$100–$320' },
  oven:       { display: 'Oven',            short: 'oven',       waterfactor: 'appliance longevity in general',                                     cost: '$100–$350' },
  stove:      { display: 'Stove',           short: 'stove',      waterfactor: 'appliance longevity in general',                                     cost: '$100–$350' },
};

const BRAND_DATA = {
  "samsung": {
    "display": "Samsung",
    "type": "Korean tech brand",
    "notes": "Known for smart features; common issues include ice maker failures, 4E/5E error codes on washers, and control board faults on refrigerators."
  },
  "lg": {
    "display": "LG",
    "type": "Korean tech brand",
    "notes": "Inverter Direct Drive motors are durable, but LE errors on washers, AE errors on dishwashers, and linear compressor faults on refrigerators are the most frequent service calls."
  },
  "whirlpool": {
    "display": "Whirlpool",
    "type": "North American workhorse brand",
    "notes": "Reliable and widely serviced; the most common issues are agitator couplings on top-load washers, bake elements on ovens, and control board failures on newer models."
  },
  "bosch": {
    "display": "Bosch",
    "type": "German precision brand",
    "notes": "E24 drain errors on dishwashers and door seal issues on front-load washing machines are the top service calls; genuine OEM parts are required for correct repair."
  },
  "ge": {
    "display": "GE",
    "type": "classic North American brand",
    "notes": "Ice maker assemblies on refrigerators and bake elements on ranges are the most common GE service calls across the GTA."
  },
  "frigidaire": {
    "display": "Frigidaire",
    "type": "value-tier North American brand",
    "notes": "Compressor relay issues on refrigerators and control board faults on ranges are the most frequent Frigidaire repairs our technicians perform."
  },
  "maytag": {
    "display": "Maytag",
    "type": "durable North American brand",
    "notes": "Transmission and agitator repairs on older top-load washers, and heating element service on dryers, are the most common Maytag calls."
  },
  "kenmore": {
    "display": "Kenmore",
    "type": "retailer brand manufactured by Whirlpool and LG",
    "notes": "Parts availability is excellent for Whirlpool-manufactured Kenmore models; the model number is critical for diagnosis since the Kenmore name covers multiple manufacturers."
  },
  "kitchenaid": {
    "display": "KitchenAid",
    "type": "premium North American brand",
    "notes": "Dishwasher control boards and washing machine pump housings are the most frequent KitchenAid service calls; these appliances are built to last and are worth repairing."
  }
};

// ─── CONTENT GENERATORS ────────────────────────────────────────────────────────



function generateServiceCityContent(service, city) {
  var c = CITY_DATA[city];
  var s = SERVICE_META[service];
  if (!c || !s) return null;
  var specific = (SERVICE_CITY[service] || {})[city] || (s.display + " repair is a common service need in " + c.display + ".");
  var cost = "<strong>" + s.cost + "</strong>";
  var intro = c.display + " " + s.short + " repair â same-day service across " + c.region + ". Certified technicians, 90-day warranty, upfront pricing. Typical cost: " + cost + ".";
  var h2 = s.display + " Repair in " + c.display + " â What You Need to Know";
  var p1 = "When your " + s.short + " breaks down in " + c.display + ", you need a technician who understands the local context. " + c.display + " is a " + c.angle + ", and the " + s.short + " problems that arise here reflect that reality. Homes span " + c.homes + ", and brand mix and fault patterns vary significantly across the city. N Appliance Repair has served " + c.display + " and the broader " + c.region + " area long enough to know what to expect before we open the door.";
  var p2 = specific + " The typical " + c.display + " home runs " + c.brands + ". The " + c.water + " â a factor that directly affects " + s.waterfactor + ".";
  var landmarks = c.landmarks ? " â from " + c.landmarks : "";
  var p3 = "Our " + c.display + " " + s.short + " repair service offers same-day and next-day appointments across " + c.display + landmarks + ". Every repair comes with a firm written quote before work begins, a 90-day parts and labour warranty, and a diagnostic fee waived when you proceed. For most " + s.display.toLowerCase() + " faults, total cost falls between " + cost + ". Call N Appliance Repair at (416) 826-3424 to book your " + c.display + " " + s.short + " repair today.";
  var tip = c.tip ? "<p class=\"local-tip\"><strong>Local tip for " + c.display + " homeowners:</strong> " + c.tip + "</p>" : "";
  var sep = String.fromCharCode(10);
  var html = "<p>" + intro + "</p>" + sep + "<h2>" + h2 + "</h2>" + sep + "<p>" + p1 + "</p>" + sep + "<p>" + p2 + "</p>" + sep + "<p>" + p3 + "</p>";
  if (tip) html += sep + tip;
  return html;
}

function generateCityHubContent(city) {
  var c = CITY_DATA[city];
  if (!c) return null;
  var intro = "Appliance repair in " + c.display + ", " + c.region + ". Same-day service for washing machines, dryers, fridges, dishwashers, ovens &amp; stoves. 90-day warranty. Call (416) 826-3424.";
  var h2 = "Appliance Repair in " + c.display + " â Local Knowledge Matters";
  var landmarks = c.landmarks ? " â from " + c.landmarks : "";
  var p1 = "N Appliance Repair serves " + c.display + " with same-day and next-day appliance repair across the full " + c.region + " service area. " + c.display + " is a " + c.angle + ", and that context shapes the appliance repair needs we see every day here. Homes span " + c.homes + ", and the brand mix and fault patterns in " + c.display + " are distinct from other GTA communities.";
  var p2 = "The typical " + c.display + " household runs " + c.brands + ". The " + c.water + ". This combination of home age, brand profile, and water quality produces a recognizable service call pattern. When you call us, you get a technician who has worked across " + c.display + landmarks + " â and understands the local context.";
  var p3 = "We repair all major appliances in " + c.display + ": washing machines, dryers, refrigerators, dishwashers, ovens, and stoves. Every repair is backed by a 90-day parts and labour warranty, a written quote before work begins, and a diagnostic fee waived when you proceed with the repair. Same-day bookings available Monday through Saturday. Call (416) 826-3424 or use the booking widget below.";
  var tip = c.tip ? "<p class=\"local-tip\"><strong>" + c.display + " homeowner tip:</strong> " + c.tip + "</p>" : "";
  var sep = String.fromCharCode(10);
  var html = "<p>" + intro + "</p>" + sep + "<h2>" + h2 + "</h2>" + sep + "<p>" + p1 + "</p>" + sep + "<p>" + p2 + "</p>" + sep + "<p>" + p3 + "</p>";
  if (tip) html += sep + tip;
  return html;
}

function generateBrandCityContent(brand, city) {
  var c = CITY_DATA[city];
  var b = BRAND_DATA[brand];
  if (!c || !b) return null;
  var intro = b.display + " appliance repair in " + c.display + ". Certified technicians, OEM parts, same-day service. 90-day warranty. Call (416) 826-3424.";
  var h2 = b.display + " Appliance Repair in " + c.display;
  var p1 = "N Appliance Repair provides " + b.display + " appliance repair throughout " + c.display + " and the broader " + c.region + " area. " + b.display + " is a " + b.type + ", and its appliances have a distinct service profile. " + b.notes + " Our technicians carry " + b.display + "-compatible OEM parts and arrive prepared for the most common faults.";
  var landmarks = c.landmarks ? " â from " + c.landmarks : "";
  var p2 = c.display + " is a " + c.angle + ". The typical household here runs " + c.brands + ". The " + c.water + ". Our technicians serve " + c.display + landmarks + " â and understand how local conditions affect " + b.display + " appliance performance.";
  var p3 = "Every " + b.display + " repair in " + c.display + " includes a written quote before work begins, a 90-day parts and labour warranty, and a diagnostic fee waived when you proceed. We use genuine OEM " + b.display + " parts or manufacturer-approved equivalents. Call (416) 826-3424 to book your " + c.display + " " + b.display + " appliance repair today.";
  var sep = String.fromCharCode(10);
  return "<p>" + intro + "</p>" + sep + "<h2>" + h2 + "</h2>" + sep + "<p>" + p1 + "</p>" + sep + "<p>" + p2 + "</p>" + sep + "<p>" + p3 + "</p>";
}

function replaceContentIntro(html, newContent) {
  var startTag = "<div class=\"content-intro fade-in\">";
  var startIdx = html.indexOf(startTag);
  if (startIdx === -1) return null;
  var depth = 1;
  var idx = startIdx + startTag.length;
  while (idx < html.length && depth > 0) {
    if (html.startsWith("<div", idx)) { depth++; idx += 4; }
    else if (html.startsWith("</div>", idx)) { depth--; if (depth === 0) break; idx += 6; }
    else { idx++; }
  }
  if (depth !== 0) return null;
  return html.slice(0, startIdx) + startTag + String.fromCharCode(10) + newContent + String.fromCharCode(10) + "</div>" + html.slice(idx + 6);
}

function parseFilename(filename) {
  var base = filename.replace(".html", "");
  var cities = Object.keys(CITY_DATA);
  var services = Object.keys(SERVICE_META);
  var brands = Object.keys(BRAND_DATA);
  var foundCity = null;
  for (var i=0; i<cities.length; i++) {
    if (base.endsWith("-" + cities[i]) || base === cities[i]) { foundCity = cities[i]; break; }
  }
  if (!foundCity) return null;
  if (base === foundCity) return { type: "city-hub", city: foundCity };
  var without = base.slice(0, base.length - foundCity.length - 1);
  for (var j=0; j<services.length; j++) {
    var svc = services[j];
    if (without === svc + "-repair" || without === svc || (svc === "fridge" && (without === "fridge-repair" || without === "refrigerator-repair"))) {
      return { type: "service-city", service: svc, city: foundCity };
    }
  }
  for (var k=0; k<brands.length; k++) {
    if (without === brands[k] + "-repair" || without === brands[k]) {
      return { type: "brand-city", brand: brands[k], city: foundCity };
    }
  }
  return null;
}

var EXCLUDE = new Set(["index.html","about.html","contact.html","404.html","pricing.html","service-template.html"]);
var allFiles = fs.readdirSync(BASE).filter(function(f) { return f.endsWith(".html") && !EXCLUDE.has(f); });

var updated = 0, skipped = 0, errors = 0;
var log = [];

for (var fi=0; fi<allFiles.length; fi++) {
  var filename = allFiles[fi];
  var parsed = parseFilename(filename);
  if (!parsed) { skipped++; log.push("SKIP (unrecognized): " + filename); continue; }
  var newContent = null;
  if (parsed.type === "service-city") newContent = generateServiceCityContent(parsed.service, parsed.city);
  else if (parsed.type === "city-hub") newContent = generateCityHubContent(parsed.city);
  else if (parsed.type === "brand-city") newContent = generateBrandCityContent(parsed.brand, parsed.city);
  if (!newContent) { skipped++; log.push("SKIP (no generator): " + filename + " " + JSON.stringify(parsed)); continue; }
  var filepath = path.join(BASE, filename);
  var html = fs.readFileSync(filepath, "utf8");
  var newHtml = replaceContentIntro(html, newContent);
  if (!newHtml) { errors++; log.push("ERROR (content-intro not found): " + filename); continue; }
  if (newHtml === html) { skipped++; log.push("SKIP (unchanged): " + filename); continue; }
  fs.writeFileSync(filepath, newHtml, "utf8");
  updated++;
  log.push("OK [" + parsed.type + "]: " + filename);
}

console.log("=== REWRITE COMPLETE ===");
console.log("Updated : " + updated);
console.log("Skipped : " + skipped);
console.log("Errors  : " + errors);
console.log("Details:");
log.forEach(function(l) { console.log("  " + l); });