'use strict';

const fs   = require('fs');
const path = require('path');

// ─── DATA ───────────────────────────────────────────────────────────────────

const CITIES = [
  {name:"Toronto",       slug:"toronto",        region:"GTA"},
  {name:"Scarborough",   slug:"scarborough",    region:"East Toronto"},
  {name:"North York",    slug:"north-york",     region:"North Toronto"},
  {name:"Etobicoke",     slug:"etobicoke",      region:"West Toronto"},
  {name:"Mississauga",   slug:"mississauga",    region:"Peel Region"},
  {name:"Brampton",      slug:"brampton",       region:"Peel Region"},
  {name:"Vaughan",       slug:"vaughan",        region:"York Region"},
  {name:"Richmond Hill", slug:"richmond-hill",  region:"York Region"},
  {name:"Markham",       slug:"markham",        region:"York Region"},
  {name:"Oakville",      slug:"oakville",       region:"Halton Region"},
  {name:"Burlington",    slug:"burlington",     region:"Halton Region"},
  {name:"Pickering",     slug:"pickering",      region:"Durham Region"},
  {name:"Ajax",          slug:"ajax",           region:"Durham Region"},
  {name:"Whitby",        slug:"whitby",         region:"Durham Region"},
  {name:"Oshawa",        slug:"oshawa",         region:"Durham Region"}
];

const SERVICES = [
  {name:"Refrigerator", slug:"fridge",      display:"Fridge",          commonIssues:["not cooling","water leaking","ice maker broken","making noise","freezer not working"],     priceRange:"$150\u2013$400"},
  {name:"Washer",       slug:"washer",      display:"Washing Machine",  commonIssues:["not spinning","not draining","leaking","making noise","not starting"],                    priceRange:"$120\u2013$350"},
  {name:"Dryer",        slug:"dryer",       display:"Dryer",            commonIssues:["not heating","not spinning","taking too long","making noise","not starting"],              priceRange:"$100\u2013$300"},
  {name:"Dishwasher",   slug:"dishwasher",  display:"Dishwasher",       commonIssues:["not cleaning","not draining","leaking","not starting","making noise"],                    priceRange:"$120\u2013$350"},
  {name:"Oven",         slug:"oven",        display:"Oven",             commonIssues:["not heating","uneven heating","door not closing","not turning on","self-clean not working"], priceRange:"$130\u2013$380"},
  {name:"Stove",        slug:"stove",       display:"Stove",            commonIssues:["burner not lighting","burner not heating","control knob broken","not turning on","gas smell"], priceRange:"$100\u2013$350"}
];

const BRANDS = [
  {name:"Samsung",    slug:"samsung",    desc:"South Korean electronics giant. Most common issues: ice maker failures, cooling problems."},
  {name:"LG",         slug:"lg",         desc:"Premium Korean brand. Common repairs: inverter motor, smart diagnosis issues."},
  {name:"Whirlpool",  slug:"whirlpool",  desc:"Most trusted North American brand. Durable machines with straightforward repairs."},
  {name:"GE",         slug:"ge",         desc:"General Electric \u2014 long-standing American brand, widely serviced."},
  {name:"Bosch",      slug:"bosch",      desc:"German engineering, quiet dishwashers. Common: door latch, control board."},
  {name:"Frigidaire", slug:"frigidaire", desc:"Reliable American brand owned by Electrolux. Great value appliances."},
  {name:"Kenmore",    slug:"kenmore",    desc:"Sears house brand. Made by Whirlpool/LG \u2014 parts widely available."},
  {name:"Maytag",     slug:"maytag",     desc:"Built tough. Known for washers/dryers. Now owned by Whirlpool."},
  {name:"KitchenAid", slug:"kitchenaid", desc:"Premium Whirlpool-owned brand. Popular dishwashers and refrigerators."}
];

// ─── INTRO TEMPLATES ────────────────────────────────────────────────────────

const INTRO_TEMPLATES = {
  service: [
    (s) => `<p>When your ${s.name.toLowerCase()} breaks down, you need fast and reliable repair from a technician who knows the brand. Our certified appliance repair technicians have serviced thousands of ${s.name.toLowerCase()}s across Toronto and GTA. We carry common parts in our trucks, so most repairs are completed in a single visit. Upfront pricing, 90-day warranty on all parts and labor.</p>
<h2>Common ${s.name} Issues We Repair</h2>
<ul>${s.commonIssues.map(i => `<li>${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join('')}</ul>
<p>Typical repair cost: <strong>${s.priceRange}</strong>. Diagnostic fee ($80) is waived when you proceed with the repair.</p>`,
    (s) => `<p>A broken ${s.name.toLowerCase()} disrupts your whole household. N Appliance Repair provides expert ${s.name.toLowerCase()} repair across the GTA with same-day availability. Our licensed technicians diagnose the problem quickly and fix it right &mdash; with a 90-day warranty included on every repair.</p>
<h2>Why Choose Us for ${s.name} Repair?</h2>
<ul><li>Same-day scheduling available Monday through Saturday</li><li>90-day warranty on all parts and labour</li><li>Transparent pricing &mdash; written quote before any work begins</li><li>4.9&#9733; rated with over 5,200 GTA repairs completed</li><li>Licensed and insured technicians</li></ul>
<p>We repair all major brands and models. Typical ${s.name.toLowerCase()} repair cost: <strong>${s.priceRange}</strong>.</p>`,
    (s) => `<p>Our technicians specialize in ${s.name.toLowerCase()} repair for all major brands including Samsung, LG, Whirlpool, GE, and Bosch. With 5,200+ repairs completed and a 4.9&#9733; rating, we're the GTA's trusted choice. Most ${s.name.toLowerCase()} repairs are done same-day with parts on hand.</p>
<h2>${s.name} Repair &mdash; What We Fix</h2>
<ul>${s.commonIssues.map(i => `<li>${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join('')}<li>Error codes and control board faults</li><li>Door seal and gasket replacement</li></ul>
<p>Serving all of Toronto, Scarborough, North York, Etobicoke, Mississauga, Brampton, Vaughan, Markham and surrounding GTA communities. Cost estimate: <strong>${s.priceRange}</strong>.</p>`,
  ],

  city: [
    (c) => `<p>N Appliance Repair provides appliance repair throughout ${c.name} and the surrounding ${c.region} area. Our technicians are familiar with ${c.name} neighbourhoods and offer same-day scheduling. We service all major brands and appliance types &mdash; refrigerators, washers, dryers, dishwashers, ovens, and stoves.</p>
<h2>Appliances We Repair in ${c.name}</h2>
<ul><li>Refrigerator &amp; freezer repair</li><li>Washing machine repair</li><li>Dryer repair</li><li>Dishwasher repair</li><li>Oven &amp; range repair</li><li>Stove &amp; cooktop repair</li></ul>
<p>We repair all brands: Samsung, LG, Whirlpool, GE, Bosch, Frigidaire, Kenmore, Maytag, KitchenAid, and more. 90-day warranty on all work completed in ${c.name}.</p>`,
    (c) => `<p>Serving ${c.name} residents with fast, reliable appliance repair. Our licensed technicians cover all of ${c.region} with same-day availability Monday through Saturday. 4.9&#9733; rated with 5,200+ GTA repairs completed. 90-day warranty on all work.</p>
<h2>Why ${c.name} Residents Choose N Appliance Repair</h2>
<ul><li>Local technicians familiar with ${c.name} neighbourhoods</li><li>Same-day and next-day appointments available</li><li>All major brands serviced</li><li>Transparent upfront pricing, no hidden fees</li><li>Licensed, insured, and background-checked technicians</li></ul>
<p>Call us at (437) 524-1053 or book online to schedule your ${c.name} appliance repair today.</p>`,
  ],

  serviceCity: [
    (s, c) => `<p>Need ${s.name.toLowerCase()} repair in ${c.name}? Our technicians serve ${c.name} and all of ${c.region} with same-day availability. We repair all brands &mdash; Samsung, LG, Whirlpool, GE, Bosch and more. Typical ${s.name.toLowerCase()} repair cost in ${c.name}: <strong>${s.priceRange}</strong>. 90-day warranty included.</p>
<h2>${s.name} Problems We Fix in ${c.name}</h2>
<ul>${s.commonIssues.map(i => `<li>${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join('')}</ul>
<p>Our ${c.name} technicians arrive with common ${s.name.toLowerCase()} parts on board, so most repairs are completed in one visit.</p>`,
    (s, c) => `<p>Fast ${s.name.toLowerCase()} repair in ${c.name}, ${c.region}. When your ${s.name.toLowerCase()} stops working, call us for same-day service. Our certified technicians diagnose and fix ${s.commonIssues.slice(0,3).join(', ')}, and more. Upfront pricing, no hidden fees. <strong>${s.priceRange}</strong> typical repair cost.</p>
<h2>Same-Day ${s.name} Repair &mdash; ${c.name}</h2>
<ul><li>Same-day service in ${c.name} and ${c.region}</li><li>All ${s.name.toLowerCase()} brands repaired</li><li>90-day warranty on parts and labour</li><li>Transparent written estimates before work begins</li><li>4.9&#9733; rated GTA appliance repair service</li></ul>
<p>Call (437) 524-1053 to book your ${c.name} ${s.name.toLowerCase()} repair now.</p>`,
    (s, c) => `<p>${c.name} residents trust N Appliance Repair for ${s.name.toLowerCase()} service. We offer same-day appointments across ${c.region}, with technicians who carry common ${s.name.toLowerCase()} parts. Fix your ${s.name.toLowerCase()} today &mdash; 4.9&#9733; rated, 90-day warranty, licensed and insured.</p>
<h2>About Our ${c.name} ${s.name} Repair Service</h2>
<ul>${s.commonIssues.map(i => `<li>We fix: ${i}</li>`).join('')}<li>All major brands including Samsung, LG, Whirlpool</li><li>Parts carried on every service vehicle</li></ul>
<p>Serving ${c.name} and all of ${c.region}. Typical cost: <strong>${s.priceRange}</strong>. Diagnostic fee waived with repair.</p>`,
  ],

  brandAppliance: [
    (b, s) => `<p>Expert ${b.name} ${s.name.toLowerCase()} repair across Toronto and GTA. ${b.desc} Our technicians are factory-trained on ${b.name} appliances and carry genuine compatible parts. Common ${b.name} ${s.name.toLowerCase()} issues we fix: ${s.commonIssues.slice(0,3).join(', ')}. Same-day service available, 90-day warranty.</p>
<h2>Common ${b.name} ${s.name} Problems</h2>
<ul>${s.commonIssues.map(i => `<li>${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join('')}<li>Error codes specific to ${b.name} models</li><li>Control board and electronic failures</li></ul>
<p>We service all ${b.name} ${s.name.toLowerCase()} models throughout Toronto, Scarborough, North York, Mississauga, Brampton, Vaughan, Markham, and the GTA. Typical repair cost: <strong>${s.priceRange}</strong>.</p>`,
    (b, s) => `<p>Your ${b.name} ${s.name.toLowerCase()} needs specialized care. Our GTA technicians have extensive experience with ${b.name} models and common failure points. We stock ${b.name}-compatible parts for fast same-day repairs. 4.9&#9733; rated, licensed, 90-day warranty on all ${b.name} repairs.</p>
<h2>Why Trust Us With Your ${b.name} ${s.name}?</h2>
<ul><li>Extensive experience with ${b.name} ${s.name.toLowerCase()} models</li><li>${b.name}-compatible parts stocked on service vehicles</li><li>Same-day availability across the GTA</li><li>90-day parts and labour warranty</li><li>Upfront pricing &mdash; no surprises</li></ul>
<p>${b.desc} Call (437) 524-1053 or book online for fast, professional ${b.name} ${s.name.toLowerCase()} repair.</p>`,
  ],

  brand: [
    (b) => `<p>N Appliance Repair specializes in ${b.name} appliance repair across Toronto and GTA. ${b.desc} Our technicians are experienced with all ${b.name} models &mdash; refrigerators, washers, dryers, dishwashers, ovens, and stoves. Same-day service, 90-day warranty, 4.9&#9733; rated.</p>
<h2>${b.name} Appliances We Repair</h2>
<ul><li>${b.name} refrigerator &amp; freezer repair</li><li>${b.name} washing machine repair</li><li>${b.name} dryer repair</li><li>${b.name} dishwasher repair</li><li>${b.name} oven &amp; stove repair</li></ul>
<p>We carry ${b.name}-compatible parts on every service vehicle for same-day repairs across Toronto, Mississauga, Brampton, Vaughan, Markham, Scarborough, North York, and surrounding GTA communities.</p>`,
    (b) => `<p>${b.name} appliances are built to last, but even the best machines need repair. Our certified technicians serve all of GTA with same-day ${b.name} repair. We carry common ${b.name}-compatible parts for efficient on-site repairs. Upfront pricing, 90-day warranty.</p>
<h2>Why Choose N Appliance Repair for ${b.name}?</h2>
<ul><li>Experienced with all ${b.name} models and error codes</li><li>${b.name}-compatible OEM parts on hand</li><li>Same-day and next-day service available</li><li>90-day warranty on all parts and labour</li><li>4.9&#9733; rated with 5,200+ GTA repairs</li></ul>
<p>${b.desc} Call (437) 524-1053 to schedule your ${b.name} repair today.</p>`,
  ],

  brandCity: [
    (b, c) => `<p>N Appliance Repair provides ${b.name} appliance repair throughout ${c.name} and the surrounding ${c.region} area. ${b.desc} Our technicians serve ${c.name} with same-day availability and carry ${b.name}-compatible parts for fast, efficient repairs.</p>
<h2>${b.name} Appliances We Repair in ${c.name}</h2>
<ul><li>${b.name} refrigerator repair in ${c.name}</li><li>${b.name} washer repair in ${c.name}</li><li>${b.name} dryer repair in ${c.name}</li><li>${b.name} dishwasher repair in ${c.name}</li><li>${b.name} oven &amp; stove repair in ${c.name}</li></ul>
<p>90-day warranty on all ${b.name} repairs in ${c.name}. Call (437) 524-1053 or book online.</p>`,
    (b, c) => `<p>Same-day ${b.name} repair in ${c.name}, ${c.region}. Our licensed technicians are experienced with all ${b.name} models and carry common parts for on-site repairs. 4.9&#9733; rated, upfront pricing, 90-day warranty included.</p>
<h2>Why ${c.name} Residents Choose Us for ${b.name} Repair</h2>
<ul><li>Local ${c.name} technicians familiar with the area</li><li>${b.name}-compatible parts stocked on service vehicles</li><li>Same-day scheduling available</li><li>Transparent pricing &mdash; written estimate before work</li><li>Licensed and insured service professionals</li></ul>
<p>${b.desc} Book your ${c.name} ${b.name} repair at (437) 524-1053.</p>`,
  ],
};

// ─── HELPERS ────────────────────────────────────────────────────────────────

function generateBreadcrumb(items) {
  const lis = items.map((item, idx) => {
    const pos = idx + 1;
    if (idx < items.length - 1) {
      return `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <a href="${item.url}" itemprop="item"><span itemprop="name">${item.name}</span></a>
    <meta itemprop="position" content="${pos}">
  </li>
  <span class="breadcrumb-sep" aria-hidden="true">/</span>`;
    } else {
      return `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
    <span class="breadcrumb-current" itemprop="name">${item.name}</span>
    <meta itemprop="position" content="${pos}">
  </li>`;
    }
  });
  return `<ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList" style="display:flex;align-items:center;gap:6px;list-style:none;margin:0;padding:0;">
  ${lis.join('\n  ')}
</ol>`;
}

function faqItem(question, answer) {
  return `<details class="faq-item">
  <summary class="faq-question">
    <span class="faq-q-text">${question}</span>
    <span class="faq-icon" aria-hidden="true">+</span>
  </summary>
  <div class="faq-answer"><p>${answer}</p></div>
</details>`;
}

function generateFAQ(type, data) {
  const { service, city, brand } = data;
  let items = [];

  if (type === 'service') {
    const s = service;
    items = [
      faqItem(`How much does ${s.name.toLowerCase()} repair cost in Toronto?`,
        `${s.name} repair in Toronto and the GTA typically costs ${s.priceRange}. The exact price depends on the fault, brand, and parts required. We charge an $80 diagnostic fee, which is waived when you proceed with the repair. You receive a firm written quote before any work begins.`),
      faqItem(`How long does ${s.name.toLowerCase()} repair take?`,
        `Most ${s.name.toLowerCase()} repairs are completed in a single visit of 1\u20132 hours. Our technicians carry common parts on their service vehicles. If a specialty part is required, we typically complete the repair the next business day.`),
      faqItem(`Do you offer same-day ${s.name.toLowerCase()} repair in the GTA?`,
        `Yes. We offer same-day ${s.name.toLowerCase()} repair Monday through Saturday across Toronto, Mississauga, Brampton, Vaughan, Markham, Scarborough, North York, Etobicoke, and surrounding GTA communities. Call (437) 524-1053 to check availability.`),
      faqItem(`What brands of ${s.name.toLowerCase()} do you repair?`,
        `We repair all major brands including Samsung, LG, Whirlpool, GE, Bosch, Frigidaire, Kenmore, Maytag, KitchenAid, Electrolux, Miele, Amana, and many others. Our technicians are trained on current and older model ${s.name.toLowerCase()}s.`),
      faqItem(`Is there a warranty on ${s.name.toLowerCase()} repairs?`,
        `Yes. Every ${s.name.toLowerCase()} repair comes with a 90-day warranty covering all parts and labour. If the same fault recurs within 90 days of your repair, we return and fix it at no additional charge.`),
      faqItem(`Is it worth repairing a ${s.name.toLowerCase()} instead of replacing it?`,
        `Generally, if the repair cost is less than 50% of the replacement cost and the ${s.name.toLowerCase()} is under 10\u201312 years old, repair is the better value. Our technician will give you an honest assessment and transparent quote so you can make the right decision.`),
      faqItem(`Do you repair both electric and gas ${s.name.toLowerCase()}s?`,
        `Yes, our technicians are certified to repair both electric and gas ${s.name.toLowerCase()} models. Safety inspections are included with all gas appliance repairs.`),
      faqItem(`How do I book a ${s.name.toLowerCase()} repair?`,
        `You can book online using our booking widget on this page, or call (437) 524-1053. We offer real-time availability with instant confirmation. No commitment is required to schedule a diagnostic visit.`),
    ];
  } else if (type === 'city') {
    const c = city;
    items = [
      faqItem(`Do you service ${c.name}?`,
        `Yes, we provide full appliance repair coverage throughout ${c.name} and the surrounding ${c.region} area. Our technicians know the local neighbourhoods and offer same-day appointments.`),
      faqItem(`How quickly can you send a technician to ${c.name}?`,
        `We offer same-day service in ${c.name} Monday through Saturday. For most calls received before noon, we can dispatch a technician the same day. Call (437) 524-1053 to check availability.`),
      faqItem(`What appliances do you repair in ${c.name}?`,
        `We repair all household appliances in ${c.name} including refrigerators, washing machines, dryers, dishwashers, ovens, ranges, and stoves. All major brands are serviced.`),
      faqItem(`What are your service hours in ${c.name}?`,
        `We operate Monday through Saturday 8am\u20138pm and Sunday 9am\u20136pm in ${c.name}. Same-day appointments are available during business hours.`),
      faqItem(`How much does appliance repair cost in ${c.name}?`,
        `Repair costs in ${c.name} range from $100 for simple fixes to $450 for complex repairs like compressor replacement. An $80 diagnostic fee applies but is waived when you proceed with the repair. You receive a written quote before any work begins.`),
      faqItem(`Do you offer a warranty on repairs in ${c.name}?`,
        `Yes. All appliance repairs in ${c.name} are backed by our 90-day parts and labour warranty. If a covered issue recurs within 90 days, we return and fix it at no cost.`),
      faqItem(`What brands do you repair in ${c.name}?`,
        `We repair all major appliance brands in ${c.name}: Samsung, LG, Whirlpool, GE, Bosch, Frigidaire, Kenmore, Maytag, KitchenAid, Electrolux, Miele, and more.`),
      faqItem(`How do I book an appliance repair in ${c.name}?`,
        `Call (437) 524-1053 or book online using the booking widget on this page. We offer real-time availability and instant confirmation for ${c.name} service appointments.`),
    ];
  } else if (type === 'serviceCity') {
    const s = service;
    const c = city;
    items = [
      faqItem(`How much does ${s.name.toLowerCase()} repair cost in ${c.name}?`,
        `${s.name} repair in ${c.name} typically costs ${s.priceRange}. The price depends on the fault and parts needed. Our $80 diagnostic fee is waived when you proceed with the repair. You receive a firm written quote before any work starts.`),
      faqItem(`Do you offer same-day ${s.name.toLowerCase()} repair in ${c.name}?`,
        `Yes. We offer same-day ${s.name.toLowerCase()} repair in ${c.name} and across ${c.region}, Monday through Saturday. Call (437) 524-1053 to check availability for today.`),
      faqItem(`What ${s.name.toLowerCase()} brands do you repair in ${c.name}?`,
        `We repair all ${s.name.toLowerCase()} brands in ${c.name} including Samsung, LG, Whirlpool, GE, Bosch, Frigidaire, Kenmore, Maytag, KitchenAid, and more.`),
      faqItem(`How long does ${s.name.toLowerCase()} repair take in ${c.name}?`,
        `Most ${s.name.toLowerCase()} repairs in ${c.name} are completed in 1\u20132 hours in a single visit. Our technicians carry common ${s.name.toLowerCase()} parts, so same-day completion is the norm.`),
      faqItem(`Is there a warranty on ${s.name.toLowerCase()} repairs in ${c.name}?`,
        `Yes. All ${s.name.toLowerCase()} repairs in ${c.name} include a 90-day warranty on all parts and labour. If the same issue recurs within 90 days, we fix it at no charge.`),
      faqItem(`What ${s.name.toLowerCase()} problems do you fix in ${c.name}?`,
        `We fix all common ${s.name.toLowerCase()} issues in ${c.name}: ${s.commonIssues.join(', ')}, error codes, control board failures, and more.`),
      faqItem(`Is it better to repair or replace my ${s.name.toLowerCase()} in ${c.name}?`,
        `If your ${s.name.toLowerCase()} is under 10\u201312 years old and the repair cost is under 50% of replacement, repair is usually the better value. Our ${c.name} technician will give you an honest assessment.`),
      faqItem(`How do I book a ${s.name.toLowerCase()} repair in ${c.name}?`,
        `Book online using the widget on this page or call (437) 524-1053. We serve ${c.name} with same-day and next-day availability, real-time scheduling, and instant confirmation.`),
    ];
  } else if (type === 'brandAppliance') {
    const b = brand;
    const s = service;
    items = [
      faqItem(`How much does ${b.name} ${s.name.toLowerCase()} repair cost in the GTA?`,
        `${b.name} ${s.name.toLowerCase()} repair in the GTA typically costs ${s.priceRange}. The exact cost depends on the model, fault, and parts required. Diagnostic fee ($80) is waived with repair.`),
      faqItem(`Do you repair all ${b.name} ${s.name.toLowerCase()} models?`,
        `Yes. We repair all current and older ${b.name} ${s.name.toLowerCase()} models throughout the GTA. Our technicians carry ${b.name}-compatible parts and are up to date on the latest model error codes and repair procedures.`),
      faqItem(`How quickly can you fix my ${b.name} ${s.name.toLowerCase()}?`,
        `Most ${b.name} ${s.name.toLowerCase()} repairs are completed same-day. We offer same-day service across the GTA Monday through Saturday. Call (437) 524-1053 to schedule.`),
      faqItem(`What are the most common ${b.name} ${s.name.toLowerCase()} problems?`,
        `Common ${b.name} ${s.name.toLowerCase()} issues include: ${s.commonIssues.join(', ')}. ${b.desc}`),
      faqItem(`Is there a warranty on ${b.name} ${s.name.toLowerCase()} repairs?`,
        `Yes. All ${b.name} ${s.name.toLowerCase()} repairs include a 90-day warranty covering all parts and labour. Same fault returning within 90 days is fixed at no charge.`),
      faqItem(`Do you use genuine ${b.name} parts?`,
        `We use ${b.name}-compatible OEM-quality parts that meet manufacturer specifications. In some cases genuine ${b.name} parts are available and used. We always disclose what parts are being used and their warranty.`),
      faqItem(`Can you fix my ${b.name} ${s.name.toLowerCase()} the same day?`,
        `Yes, same-day ${b.name} ${s.name.toLowerCase()} repair is available across the GTA Monday through Saturday. Our technicians carry common ${b.name} ${s.name.toLowerCase()} parts to complete most repairs in one visit.`),
      faqItem(`How do I book ${b.name} ${s.name.toLowerCase()} repair?`,
        `Use the booking widget on this page or call (437) 524-1053. Real-time availability, instant confirmation, no commitment to schedule.`),
    ];
  } else if (type === 'brand') {
    const b = brand;
    items = [
      faqItem(`What ${b.name} appliances do you repair?`,
        `We repair all ${b.name} household appliances: refrigerators, washing machines, dryers, dishwashers, ovens, ranges, and stoves. All models are covered throughout the GTA.`),
      faqItem(`How much does ${b.name} appliance repair cost in Toronto?`,
        `${b.name} appliance repair cost depends on the appliance type and fault. Typical ranges: washers/dryers $100\u2013$350, refrigerators $150\u2013$400, dishwashers $120\u2013$350. The $80 diagnostic fee is waived with repair.`),
      faqItem(`Do you repair all ${b.name} models?`,
        `Yes. We repair all current and discontinued ${b.name} models. Our technicians are up to date on ${b.name} error codes, common failure points, and parts availability across the GTA.`),
      faqItem(`Is there a warranty on ${b.name} repairs?`,
        `Yes. Every ${b.name} repair includes a 90-day warranty on all parts and labour. If the same fault recurs within 90 days, we return and fix it at no additional charge.`),
      faqItem(`How quickly can you fix my ${b.name} appliance?`,
        `Most ${b.name} repairs are completed same-day. We offer same-day service across the GTA Monday through Saturday. Call (437) 524-1053 for today\u2019s availability.`),
      faqItem(`Do you use genuine ${b.name} parts?`,
        `We use ${b.name}-compatible OEM-quality parts that meet manufacturer specifications. Genuine ${b.name} parts are used when available and cost-effective. Full transparency on parts and pricing before any work begins.`),
      faqItem(`Are your technicians certified to repair ${b.name} appliances?`,
        `Yes. Our technicians are licensed and trained on all major brands including ${b.name}. They are familiar with ${b.name}\u2019s common failure patterns, diagnostic codes, and repair procedures.`),
      faqItem(`How do I book a ${b.name} repair in Toronto or GTA?`,
        `Call (437) 524-1053 or use the online booking widget. We offer real-time scheduling with instant confirmation for all ${b.name} repair appointments across the GTA.`),
    ];
  } else if (type === 'brandCity') {
    const b = brand;
    const c = city;
    items = [
      faqItem(`Do you repair ${b.name} appliances in ${c.name}?`,
        `Yes. We provide ${b.name} appliance repair throughout ${c.name} and ${c.region} with same-day availability. Our technicians carry ${b.name}-compatible parts for efficient on-site repairs.`),
      faqItem(`How much does ${b.name} repair cost in ${c.name}?`,
        `${b.name} appliance repair in ${c.name} costs $100\u2013$450 depending on the appliance and fault. Diagnostic fee ($80) is waived when you proceed with the repair. Written quote provided before any work begins.`),
      faqItem(`How quickly can you come to ${c.name} for ${b.name} repair?`,
        `Same-day ${b.name} repair is available in ${c.name} Monday through Saturday. Call (437) 524-1053 before noon for the best chance of same-day service.`),
      faqItem(`What ${b.name} appliances do you fix in ${c.name}?`,
        `We repair all ${b.name} appliances in ${c.name}: refrigerators, washing machines, dryers, dishwashers, ovens, and stoves. All ${b.name} models covered.`),
      faqItem(`Is there a warranty on ${b.name} repairs in ${c.name}?`,
        `Yes. All ${b.name} repairs in ${c.name} are covered by our 90-day parts and labour warranty.`),
      faqItem(`Do you use genuine ${b.name} parts in ${c.name}?`,
        `We use ${b.name}-compatible OEM-quality parts. Genuine ${b.name} parts are used when available. Full transparency before work begins.`),
      faqItem(`Are your ${c.name} technicians experienced with ${b.name}?`,
        `Yes. Our ${c.name} technicians are trained on ${b.name} appliances and up to date on common ${b.name} failure patterns and diagnostic codes.`),
      faqItem(`How do I book ${b.name} repair in ${c.name}?`,
        `Call (437) 524-1053 or use the online booking widget on this page. Real-time availability for ${c.name} service appointments, instant confirmation.`),
    ];
  }

  return items.join('\n');
}

function generateSchema(type, data) {
  const { service, city, brand } = data;
  const cityName = city ? city.name : 'Toronto';
  const serviceName = service
    ? `${service.name} Repair${city ? ' in ' + city.name : ''}`
    : brand
      ? `${brand.name} Appliance Repair${city ? ' in ' + city.name : ''}`
      : 'Appliance Repair';
  const description = service
    ? `Professional ${service.name.toLowerCase()} repair service${city ? ' in ' + city.name : ' in Toronto & GTA'}`
    : brand
      ? `Professional ${brand.name} appliance repair${city ? ' in ' + city.name : ' in Toronto & GTA'}`
      : 'Professional appliance repair in Toronto & GTA';

  const faqEntities = [];
  if (service) {
    faqEntities.push(
      {"@type":"Question","name":`How much does ${service.name.toLowerCase()} repair cost${city ? ' in ' + city.name : ' in Toronto'}?`,"acceptedAnswer":{"@type":"Answer","text":`${service.name} repair typically costs ${service.priceRange}${city ? ' in ' + city.name : ' in Toronto & GTA'}. Price includes parts and labor. 90-day warranty on all repairs.`}},
      {"@type":"Question","name":`Is same-day ${service.name.toLowerCase()} repair available${city ? ' in ' + city.name : ''}?`,"acceptedAnswer":{"@type":"Answer","text":`Yes, same-day ${service.name.toLowerCase()} repair is available${city ? ' in ' + city.name : ' across Toronto & GTA'} when you book before 2 PM. Call (437) 524-1053.`}},
      {"@type":"Question","name":`What brands do you repair?`,"acceptedAnswer":{"@type":"Answer","text":`We repair all major brands including Samsung, LG, Whirlpool, GE, Bosch, Frigidaire, Kenmore, Maytag, and KitchenAid.`}},
      {"@type":"Question","name":`Is there a warranty on repairs?`,"acceptedAnswer":{"@type":"Answer","text":`All repairs come with a 90-day warranty on parts and labor. If the same issue recurs within 90 days, we fix it at no extra charge.`}}
    );
  } else if (brand) {
    faqEntities.push(
      {"@type":"Question","name":`Do you repair ${brand.name} appliances?`,"acceptedAnswer":{"@type":"Answer","text":`Yes, we specialize in ${brand.name} appliance repair across Toronto and GTA. Same-day service, 90-day warranty.`}},
      {"@type":"Question","name":`How much does ${brand.name} appliance repair cost?`,"acceptedAnswer":{"@type":"Answer","text":`${brand.name} appliance repair costs $100–$400 depending on the appliance type and problem. We provide upfront pricing before any work begins.`}}
    );
  }

  const base = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "name": "N Appliance Repair",
        "telephone": "+14375241053",
        "url": "https://nappliancerepair.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName,
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
        "name": serviceName,
        "provider": {"@type": "LocalBusiness", "name": "N Appliance Repair"},
        "areaServed": city ? city.name : "Toronto & GTA",
        "description": description
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqEntities
      }
    ]
  };
  return JSON.stringify(base, null, 2);
}

function generateRelatedServices(currentService, city) {
  const citySlug  = city ? city.slug : null;
  const cityLabel = city ? ` in ${city.name}` : ' in Toronto & GTA';
  const links = SERVICES
    .filter(s => !currentService || s.slug !== currentService.slug)
    .map(s => {
      const href = citySlug ? `/${s.slug}-repair-${citySlug}.html` : `/${s.slug}-repair.html`;
      return `<li><a href="${href}">${s.name} Repair${cityLabel}</a></li>`;
    });
  return links.join('\n');
}

function generateRelatedCities(service, currentCity) {
  const serviceSlug  = service ? service.slug : null;
  const serviceLabel = service ? `${service.name} Repair` : 'Appliance Repair';
  const links = CITIES
    .filter(c => !currentCity || c.slug !== currentCity.slug)
    .slice(0, 10)
    .map(c => {
      const href = serviceSlug ? `/${serviceSlug}-repair-${c.slug}.html` : `/${c.slug}.html`;
      return `<li><a href="${href}">${serviceLabel} in ${c.name}</a></li>`;
    });
  return links.join('\n');
}

function generatePage(template, vars) {
  let html = template;
  for (const [key, value] of Object.entries(vars)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

const OUT_DIR  = __dirname;
const TEMPLATE = fs.readFileSync(path.join(OUT_DIR, 'service-template.html'), 'utf8');

let totalWritten = 0;

function write(filename, vars) {
  const html = generatePage(TEMPLATE, vars);
  // Safety check — warn if any unreplaced vars remain
  const remaining = html.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) {
    console.warn(`  ! Unreplaced vars in ${filename}: ${[...new Set(remaining)].join(', ')}`);
  }
  fs.writeFileSync(path.join(OUT_DIR, filename), html, 'utf8');
  console.log(`  ${filename}`);
  totalWritten++;
}

// ── 1. SERVICE PAGES (6) ─────────────────────────────────────────────────────
console.log('\n[1] Service pages');
SERVICES.forEach((service, i) => {
  write(`${service.slug}-repair.html`, {
    META_TITLE:     `${service.name} Repair Toronto & GTA | Same-Day | N Appliance Repair`,
    META_DESC:      `Expert ${service.name.toLowerCase()} repair in Toronto & GTA. ${service.priceRange} typical cost. Same-day service, 90-day warranty, 4.9\u2605 rated. Call (437) 524-1053.`,
    CANONICAL:      `${service.slug}-repair.html`,
    H1:             `${service.name} Repair Toronto & GTA`,
    ANSWER_BOX:     `Professional ${service.name.toLowerCase()} repair across Toronto and GTA. We fix all brands including Samsung, LG, Whirlpool, GE, and Bosch. Same-day service available, ${service.priceRange} typical cost, 90-day warranty on all parts and labor. Call (437)\u00a0524-1053.`,
    BREADCRUMB:     generateBreadcrumb([{name:'Home',url:'/'},{name:`${service.name} Repair`,url:`/${service.slug}-repair.html`}]),
    CONTENT_INTRO:  INTRO_TEMPLATES.service[i % 3](service),
    SERVICE_NAME:   service.name,
    CITY_NAME:      'Toronto & GTA',
    FAQ_ITEMS:      generateFAQ('service', {service}),
    RELATED_SERVICES: generateRelatedServices(service, null),
    RELATED_CITIES:   generateRelatedCities(service, null),
    SCHEMA_JSON:    generateSchema('service', {service}),
  });
});

// ── 2. BRAND PAGES (9) ───────────────────────────────────────────────────────
console.log('\n[2] Brand pages');
BRANDS.forEach((brand, i) => {
  write(`${brand.slug}-repair.html`, {
    META_TITLE:     `${brand.name} Appliance Repair Toronto & GTA | All Models | N Appliance Repair`,
    META_DESC:      `Expert ${brand.name} appliance repair in Toronto & GTA. Same-day service, 90-day warranty, 4.9\u2605 rated. We fix all ${brand.name} models. Call (437) 524-1053.`,
    CANONICAL:      `${brand.slug}-repair.html`,
    H1:             `${brand.name} Appliance Repair Toronto & GTA`,
    ANSWER_BOX:     `${brand.name} appliance repair across Toronto and GTA. ${brand.desc} Same-day service available, 90-day warranty on all parts and labor. Call (437)\u00a0524-1053.`,
    BREADCRUMB:     generateBreadcrumb([{name:'Home',url:'/'},{name:`${brand.name} Repair`,url:`/${brand.slug}-repair.html`}]),
    CONTENT_INTRO:  INTRO_TEMPLATES.brand[i % 2](brand),
    SERVICE_NAME:   brand.name,
    CITY_NAME:      'Toronto & GTA',
    FAQ_ITEMS:      generateFAQ('brand', {brand}),
    RELATED_SERVICES: SERVICES.map(s => `<li><a href="/${brand.slug}-${s.slug}-repair.html">${brand.name} ${s.name} Repair</a></li>`).join('\n'),
    RELATED_CITIES:   CITIES.slice(0,8).map(c => `<li><a href="/${brand.slug}-repair-${c.slug}.html">${brand.name} Repair in ${c.name}</a></li>`).join('\n'),
    SCHEMA_JSON:    generateSchema('brand', {brand}),
  });
});

// ── 3. CITY PAGES (15) ───────────────────────────────────────────────────────
console.log('\n[3] City pages');
CITIES.forEach((city, i) => {
  write(`${city.slug}.html`, {
    META_TITLE:     `Appliance Repair ${city.name} | Same-Day Service | N Appliance Repair`,
    META_DESC:      `Appliance repair in ${city.name}, ${city.region}. Same-day service, 90-day warranty, 4.9\u2605 rated. We fix all brands & appliances. Call (437) 524-1053.`,
    CANONICAL:      `${city.slug}.html`,
    H1:             `Appliance Repair in ${city.name}`,
    ANSWER_BOX:     `Professional appliance repair throughout ${city.name} and ${city.region}. We fix refrigerators, washers, dryers, dishwashers, ovens, and stoves \u2014 all major brands. Same-day service available, 90-day warranty, 4.9\u2605 rated. Call (437)\u00a0524-1053.`,
    BREADCRUMB:     generateBreadcrumb([{name:'Home',url:'/'},{name:`Appliance Repair ${city.name}`,url:`/${city.slug}.html`}]),
    CONTENT_INTRO:  INTRO_TEMPLATES.city[i % 2](city),
    SERVICE_NAME:   'Appliance',
    CITY_NAME:      city.name,
    FAQ_ITEMS:      generateFAQ('city', {city}),
    RELATED_SERVICES: SERVICES.map(s => `<li><a href="/${s.slug}-repair-${city.slug}.html">${s.name} Repair in ${city.name}</a></li>`).join('\n'),
    RELATED_CITIES:   CITIES.filter(c => c.slug !== city.slug).slice(0,8).map(c => `<li><a href="/${c.slug}.html">Appliance Repair in ${c.name}</a></li>`).join('\n'),
    SCHEMA_JSON:    generateSchema('city', {city}),
  });
});

// ── 4. SERVICE × CITY PAGES (20) ─────────────────────────────────────────────
console.log('\n[4] Service x City pages');

const SERVICE_CITY_COMBOS = [
  ['washer',      'markham'],
  ['washer',      'scarborough'],
  ['washer',      'north-york'],
  ['washer',      'etobicoke'],
  ['washer',      'brampton'],
  ['washer',      'vaughan'],
  ['fridge',      'mississauga'],
  ['fridge',      'scarborough'],
  ['fridge',      'north-york'],
  ['fridge',      'vaughan'],
  ['dryer',       'toronto'],
  ['dryer',       'mississauga'],
  ['dryer',       'brampton'],
  ['dryer',       'markham'],
  ['dishwasher',  'toronto'],
  ['dishwasher',  'mississauga'],
  ['oven',        'toronto'],
  ['oven',        'mississauga'],
  ['stove',       'toronto'],
  ['stove',       'scarborough'],
];

SERVICE_CITY_COMBOS.forEach(([sSlug, cSlug], i) => {
  const service = SERVICES.find(s => s.slug === sSlug);
  const city    = CITIES.find(c => c.slug === cSlug);
  write(`${sSlug}-repair-${cSlug}.html`, {
    META_TITLE:     `${service.name} Repair ${city.name} | Same-Day | N Appliance Repair`,
    META_DESC:      `${service.name} repair in ${city.name}, ${city.region}. ${service.priceRange} typical cost. Same-day service, 90-day warranty, 4.9\u2605 rated. Call (437) 524-1053.`,
    CANONICAL:      `${sSlug}-repair-${cSlug}.html`,
    H1:             `${service.name} Repair in ${city.name}`,
    ANSWER_BOX:     `Professional ${service.name.toLowerCase()} repair in ${city.name} and across ${city.region}. We fix all brands \u2014 Samsung, LG, Whirlpool, GE, Bosch and more. Same-day service, ${service.priceRange} typical cost, 90-day warranty. Call (437)\u00a0524-1053.`,
    BREADCRUMB:     generateBreadcrumb([{name:'Home',url:'/'},{name:`${service.name} Repair`,url:`/${sSlug}-repair.html`},{name:city.name,url:`/${sSlug}-repair-${cSlug}.html`}]),
    CONTENT_INTRO:  INTRO_TEMPLATES.serviceCity[i % 3](service, city),
    SERVICE_NAME:   service.name,
    CITY_NAME:      city.name,
    FAQ_ITEMS:      generateFAQ('serviceCity', {service, city}),
    RELATED_SERVICES: generateRelatedServices(service, city),
    RELATED_CITIES:   generateRelatedCities(service, city),
    SCHEMA_JSON:    generateSchema('serviceCity', {service, city}),
  });
});

// ── 5. BRAND × APPLIANCE PAGES (30) ──────────────────────────────────────────
console.log('\n[5] Brand x Appliance pages');

const BRAND_APPLIANCE_COMBOS = [
  ['lg',          'fridge'],
  ['lg',          'washer'],
  ['lg',          'dryer'],
  ['lg',          'dishwasher'],
  ['lg',          'oven'],
  ['samsung',     'fridge'],
  ['samsung',     'washer'],
  ['samsung',     'dryer'],
  ['samsung',     'dishwasher'],
  ['bosch',       'dishwasher'],
  ['bosch',       'fridge'],
  ['bosch',       'washer'],
  ['whirlpool',   'fridge'],
  ['whirlpool',   'washer'],
  ['whirlpool',   'dryer'],
  ['whirlpool',   'dishwasher'],
  ['ge',          'fridge'],
  ['ge',          'washer'],
  ['ge',          'dishwasher'],
  ['ge',          'oven'],
  ['frigidaire',  'fridge'],
  ['frigidaire',  'washer'],
  ['frigidaire',  'dryer'],
  ['kenmore',     'washer'],
  ['kenmore',     'dryer'],
  ['kenmore',     'fridge'],
  ['maytag',      'washer'],
  ['maytag',      'dryer'],
  ['kitchenaid',  'dishwasher'],
  ['kitchenaid',  'fridge'],
];

BRAND_APPLIANCE_COMBOS.forEach(([bSlug, sSlug], i) => {
  const brand   = BRANDS.find(b => b.slug === bSlug);
  const service = SERVICES.find(s => s.slug === sSlug);
  write(`${bSlug}-${sSlug}-repair.html`, {
    META_TITLE:     `${brand.name} ${service.name} Repair Toronto & GTA | N Appliance Repair`,
    META_DESC:      `Expert ${brand.name} ${service.name.toLowerCase()} repair in Toronto & GTA. Same-day service, ${service.priceRange} typical cost, 90-day warranty, 4.9\u2605 rated. Call (437) 524-1053.`,
    CANONICAL:      `${bSlug}-${sSlug}-repair.html`,
    H1:             `${brand.name} ${service.name} Repair Toronto & GTA`,
    ANSWER_BOX:     `Professional ${brand.name} ${service.name.toLowerCase()} repair across Toronto and GTA. ${brand.desc} Same-day service, ${service.priceRange} typical cost, 90-day warranty. Call (437)\u00a0524-1053.`,
    BREADCRUMB:     generateBreadcrumb([{name:'Home',url:'/'},{name:`${brand.name} Repair`,url:`/${bSlug}-repair.html`},{name:`${service.name} Repair`,url:`/${bSlug}-${sSlug}-repair.html`}]),
    CONTENT_INTRO:  INTRO_TEMPLATES.brandAppliance[i % 2](brand, service),
    SERVICE_NAME:   `${brand.name} ${service.name}`,
    CITY_NAME:      'Toronto & GTA',
    FAQ_ITEMS:      generateFAQ('brandAppliance', {brand, service}),
    RELATED_SERVICES: SERVICES.filter(s => s.slug !== sSlug).map(s => `<li><a href="/${bSlug}-${s.slug}-repair.html">${brand.name} ${s.name} Repair</a></li>`).join('\n'),
    RELATED_CITIES:   CITIES.slice(0,8).map(c => `<li><a href="/${sSlug}-repair-${c.slug}.html">${service.name} Repair in ${c.name}</a></li>`).join('\n'),
    SCHEMA_JSON:    generateSchema('brandAppliance', {brand, service}),
  });
});

// ── 6. BRAND × CITY PAGES (5) ────────────────────────────────────────────────
console.log('\n[6] Brand x City pages');

const BRAND_CITY_COMBOS = [
  ['lg',      'toronto'],
  ['samsung', 'toronto'],
  ['lg',      'mississauga'],
  ['samsung', 'mississauga'],
  ['bosch',   'toronto'],
];

BRAND_CITY_COMBOS.forEach(([bSlug, cSlug], i) => {
  const brand = BRANDS.find(b => b.slug === bSlug);
  const city  = CITIES.find(c => c.slug === cSlug);
  write(`${bSlug}-repair-${cSlug}.html`, {
    META_TITLE:     `${brand.name} Appliance Repair ${city.name} | Same-Day | N Appliance Repair`,
    META_DESC:      `${brand.name} appliance repair in ${city.name}, ${city.region}. Same-day service, 90-day warranty, 4.9\u2605 rated. All ${brand.name} models serviced. Call (437) 524-1053.`,
    CANONICAL:      `${bSlug}-repair-${cSlug}.html`,
    H1:             `${brand.name} Appliance Repair in ${city.name}`,
    ANSWER_BOX:     `Professional ${brand.name} appliance repair in ${city.name} and across ${city.region}. ${brand.desc} Same-day service, 90-day warranty on all parts and labor. Call (437)\u00a0524-1053.`,
    BREADCRUMB:     generateBreadcrumb([{name:'Home',url:'/'},{name:`${brand.name} Repair`,url:`/${bSlug}-repair.html`},{name:city.name,url:`/${bSlug}-repair-${cSlug}.html`}]),
    CONTENT_INTRO:  INTRO_TEMPLATES.brandCity[i % 2](brand, city),
    SERVICE_NAME:   `${brand.name} Appliance`,
    CITY_NAME:      city.name,
    FAQ_ITEMS:      generateFAQ('brandCity', {brand, city}),
    RELATED_SERVICES: SERVICES.map(s => `<li><a href="/${bSlug}-${s.slug}-repair.html">${brand.name} ${s.name} Repair</a></li>`).join('\n'),
    RELATED_CITIES:   CITIES.filter(c => c.slug !== cSlug).slice(0,8).map(c => `<li><a href="/${bSlug}-repair-${c.slug}.html">${brand.name} Repair in ${c.name}</a></li>`).join('\n'),
    SCHEMA_JSON:    generateSchema('brandCity', {brand, city}),
  });
});

// ─── SUMMARY ─────────────────────────────────────────────────────────────────
console.log(`\nDone. ${totalWritten} pages written to ${OUT_DIR}\n`);
