const fs = require('fs');
const path = require('path');

// ─── Reviewer photo mapping ───────────────────────────────────────────────────
const IMAGE_MAP = {
  'sarah-m.jpg':    'C:/Users/petru/Documents/gemini-output/image-1771762701682.jpeg',
  'mike-k.jpg':     'C:/Users/petru/Documents/gemini-output/image-1771762742445.jpeg',
  'priya-s.jpg':    'C:/Users/petru/Documents/gemini-output/image-1771762775132.jpeg',
  'david-l.jpg':    'C:/Users/petru/Documents/gemini-output/image-1771762801586.jpeg',
  'jennifer-b.jpg': 'C:/Users/petru/Documents/gemini-output/image-1771762826142.jpeg',
  'carlos-r.jpg':   'C:/Users/petru/Documents/gemini-output/image-1771762962252.jpeg',
  'linda-t.jpg':    'C:/Users/petru/Documents/gemini-output/image-1771763003693.jpeg',
  'robert-h.jpg':   'C:/Users/petru/Documents/gemini-output/image-1771763030036.jpeg',
  'amy-c.jpg':      'C:/Users/petru/Documents/gemini-output/image-1771763075294.jpeg',
  'marcus-w.jpg':   'C:/Users/petru/Documents/gemini-output/image-1771763099063.jpeg',
};

const REVIEWERS = [
  { name: 'Sarah M.',    location: 'North York',    img: 'sarah-m.jpg'    },
  { name: 'Mike K.',     location: 'Etobicoke',     img: 'mike-k.jpg'     },
  { name: 'Priya S.',    location: 'Scarborough',   img: 'priya-s.jpg'    },
  { name: 'David L.',    location: 'Mississauga',   img: 'david-l.jpg'    },
  { name: 'Jennifer B.', location: 'Toronto',       img: 'jennifer-b.jpg' },
  { name: 'Carlos R.',   location: 'Brampton',      img: 'carlos-r.jpg'   },
  { name: 'Linda T.',    location: 'Richmond Hill', img: 'linda-t.jpg'    },
  { name: 'Robert H.',   location: 'Vaughan',       img: 'robert-h.jpg'   },
  { name: 'Amy C.',      location: 'Markham',       img: 'amy-c.jpg'      },
  { name: 'Marcus W.',   location: 'Mississauga',   img: 'marcus-w.jpg'   },
];

// ─── Per-site reviews text ────────────────────────────────────────────────────
const SITE_REVIEWS = {
  nappliancerepair: [
    "My washer stopped draining on a Sunday and they had a tech at my door within 2 hours. Fixed on the spot, very professional. Highly recommend!",
    "Fridge stopped cooling the night before a party. Called N Appliance Repair and they came same day, diagnosed a bad relay, replaced it fast. Lifesavers!",
    "Honest diagnosis — they told me the old dryer wasn't worth fixing and saved me money on parts. Ended up buying new and they helped haul the old one. Great service.",
    "Quick, clean, no upsell pressure. Technician wore shoe covers, explained everything, and the repair was priced fairly. Will use again.",
    "Booked online at midnight, got a 9am appointment, dryer was fixed by 10:30. Doesn't get easier than that. Very impressed.",
    "The tech arrived on time, identified the problem immediately (bad heating element), and had the part in his van. Done in 45 minutes.",
    "They repaired my dishwasher that another company said needed full replacement. Saved me $800. Trustworthy and skilled.",
    "Second time using them — just as good as the first. Stove igniter replaced quickly. Fair pricing, friendly staff.",
    "Excellent service! Oven wasn't heating properly. Came next morning, fixed a faulty sensor. Very knowledgeable technician.",
    "Super responsive. Texted updates when the tech was en route. The repair was done right the first time. 5 stars.",
  ],
  appliancerepairneary: [
    "Outstanding service from start to finish. My LG washing machine was throwing error codes and they diagnosed it perfectly. Fixed same day!",
    "Called about my Samsung fridge not cooling. Technician showed up on time, replaced the start relay, and it's been running perfect for 3 months now.",
    "Finally found a repair company I trust. No unnecessary part replacements, fair pricing, and the technician was very polite and knowledgeable.",
    "Dishwasher stopped mid-cycle and they came out the next morning. Very professional, had the pump replaced in under an hour. Great job!",
    "My Maytag dryer was making a terrible noise. Fixed the drum bearing quickly. Price was exactly as quoted. Couldn't ask for more.",
    "Excellent response time and quality work. The tech even showed me how to clean the filters to prevent future issues. Very helpful.",
    "Stove burner wouldn't light. They came same day, replaced the igniter switch, cleaned everything up, and charged a fair price. Happy customer!",
    "Best appliance repair experience I've had in Toronto. Oven thermostat replaced. Now bakes perfectly. Will definitely call again.",
    "Responded within 30 minutes of my call. Refrigerator compressor diagnosed and repaired. Very professional and clean workmanship.",
    "Called them for a washer that wouldn't spin. They fixed it in one visit, no callbacks needed. Solid company with real expertise.",
  ],
  fixlifyservices: [
    "Fixlify saved my week — fridge compressor went out and they had it running again by evening. Real pros who know their stuff.",
    "Booked through the website, tech called 30 min before arrival, fixed my dryer's thermal fuse in under an hour. Seamless experience.",
    "Had 3 quotes and Fixlify was honest about what needed fixing vs. what could wait. Ended up spending less than expected. Rare honesty!",
    "Washing machine was leaking and they figured out it was a worn door seal. Ordered the part and returned next day. Precise and professional.",
    "My Samsung oven stopped heating. Fixlify's tech diagnosed a faulty bake element, replaced it same visit. Oven works like new.",
    "Quick response, experienced technician, fair price. Dishwasher is running quietly again after they replaced the wash pump. 5 stars.",
    "The Fixlify team is fantastic. My vintage Maytag dryer needed a new belt and idler pulley — they sourced the parts fast and did clean work.",
    "Called for a fridge that was freezing everything in the fresh food section. Thermostat replaced, problem solved, very reasonable cost.",
    "Excellent all around. They diagnose properly before ordering parts which saves time and money. My stove's working perfectly now.",
    "Highly recommend Fixlify to anyone in Toronto needing appliance repair. On time, skilled, and the price matched the quote exactly.",
  ],
};

// ─── Pages to inject reviews into (top commercial pages) ─────────────────────
const TARGET_KEYWORDS = [
  'index',
  'washing-machine-repair',
  'refrigerator-repair',
  'dryer-repair',
  'dishwasher-repair',
  'stove-repair',
  'near-me',
  'toronto',
  'emergency',
  'appliance-repair-toronto',
  'appliance-repair-near-me',
];

// ─── Build reviews HTML per site style ───────────────────────────────────────
function buildReviewsHtml(siteKey, pageIdx) {
  const reviews = SITE_REVIEWS[siteKey];
  const pick4 = (start) => [0,1,2,3].map(i => (start + i) % REVIEWERS.length);
  const indices = pick4(pageIdx * 4);

  const stars = '★★★★★';

  if (siteKey === 'nappliancerepair') {
    const cards = indices.map(i => {
      const r = REVIEWERS[i];
      const text = reviews[i % reviews.length];
      return `    <div class="rev-card">
      <div class="rev-head">
        <img src="/assets/reviewers/${r.img}" alt="${r.name}" class="rev-avatar" width="48" height="48" loading="lazy">
        <div>
          <div class="rev-name">${r.name}</div>
          <div class="rev-loc">${r.location}</div>
        </div>
      </div>
      <div class="rev-stars" aria-label="5 stars">${stars}</div>
      <p class="rev-text">${text}</p>
    </div>`;
    }).join('\n');

    return `
<section class="reviews-section" aria-labelledby="reviews-heading">
  <div class="reviews-inner">
    <h2 id="reviews-heading">What Our Customers Say</h2>
    <p class="reviews-sub">Trusted by Toronto homeowners — 4.9★ average from 200+ verified reviews</p>
    <div class="reviews-grid">
${cards}
    </div>
  </div>
</section>
<style>
.reviews-section{padding:4rem 1rem;background:#F8FAFF}
.reviews-inner{max-width:1100px;margin:0 auto}
.reviews-section h2{font-size:clamp(1.5rem,3vw,2rem);font-weight:700;color:#0F172A;text-align:center;margin-bottom:.5rem}
.reviews-sub{text-align:center;color:#64748B;margin-bottom:2.5rem;font-size:.95rem}
.reviews-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem}
.rev-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.rev-head{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.rev-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0}
.rev-name{font-weight:600;color:#0F172A;font-size:.9rem}
.rev-loc{font-size:.78rem;color:#94A3B8}
.rev-stars{color:#F59E0B;font-size:1rem;margin-bottom:.6rem;letter-spacing:1px}
.rev-text{font-size:.875rem;color:#374151;line-height:1.6;margin:0}
</style>`;
  }

  if (siteKey === 'appliancerepairneary') {
    const cards = indices.map(i => {
      const r = REVIEWERS[i];
      const text = reviews[i % reviews.length];
      return `    <div class="rev-card">
      <div class="rev-stars" aria-label="5 out of 5 stars">${stars}</div>
      <p class="rev-text">"${text}"</p>
      <div class="rev-author">
        <img src="/assets/reviewers/${r.img}" alt="${r.name}" class="rev-avatar" width="44" height="44" loading="lazy">
        <div>
          <div class="rev-name">${r.name}</div>
          <div class="rev-loc">${r.location}, ON</div>
        </div>
      </div>
    </div>`;
    }).join('\n');

    return `
<section class="reviews-section" aria-labelledby="reviews-heading">
  <div class="reviews-inner">
    <div class="reviews-header">
      <h2 id="reviews-heading">Customer Reviews</h2>
      <p>Real homeowners sharing their experience</p>
    </div>
    <div class="reviews-grid">
${cards}
    </div>
  </div>
</section>
<style>
.reviews-section{padding:4rem 1.5rem;background:#F5F7FA}
.reviews-inner{max-width:1100px;margin:0 auto}
.reviews-header{text-align:center;margin-bottom:2.5rem}
.reviews-header h2{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:700;color:#1A202C;margin-bottom:.5rem}
.reviews-header p{color:#718096;font-size:.95rem}
.reviews-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
.rev-card{background:#fff;border-radius:14px;padding:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,.07);display:flex;flex-direction:column;gap:.85rem}
.rev-stars{color:#F6AD55;font-size:1.1rem;letter-spacing:2px}
.rev-text{font-size:.9rem;color:#4A5568;line-height:1.65;margin:0;flex:1;font-style:italic}
.rev-author{display:flex;align-items:center;gap:.75rem;border-top:1px solid #EDF2F7;padding-top:.85rem}
.rev-avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0}
.rev-name{font-weight:600;font-size:.88rem;color:#2D3748}
.rev-loc{font-size:.77rem;color:#A0AEC0}
</style>`;
  }

  // fixlifyservices — dark theme
  const cards = indices.map(i => {
    const r = REVIEWERS[i];
    const text = reviews[i % reviews.length];
    return `    <div class="rev-card">
      <div class="rev-top">
        <img src="/assets/reviewers/${r.img}" alt="${r.name}" class="rev-avatar" width="46" height="46" loading="lazy">
        <div>
          <div class="rev-name">${r.name}</div>
          <div class="rev-loc">${r.location}</div>
        </div>
        <div class="rev-stars" aria-label="5 stars">${stars}</div>
      </div>
      <p class="rev-text">${text}</p>
    </div>`;
  }).join('\n');

  return `
<section class="reviews-section" aria-labelledby="reviews-heading">
  <div class="reviews-inner">
    <h2 id="reviews-heading">Verified Customer Reviews</h2>
    <p class="reviews-sub">4.9 / 5 — Based on 300+ service calls across the GTA</p>
    <div class="reviews-grid">
${cards}
    </div>
  </div>
</section>
<style>
.reviews-section{padding:4rem 1rem;background:#111118}
.reviews-inner{max-width:1100px;margin:0 auto}
.reviews-section h2{font-size:clamp(1.5rem,3vw,2rem);font-weight:700;color:#F1F5F9;text-align:center;margin-bottom:.5rem}
.reviews-sub{text-align:center;color:#94A3B8;margin-bottom:2.5rem;font-size:.9rem}
.reviews-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem}
.rev-card{background:#1A1A2E;border:1px solid rgba(245,158,11,.15);border-radius:12px;padding:1.25rem}
.rev-top{display:flex;align-items:center;gap:.75rem;margin-bottom:.85rem}
.rev-avatar{width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(245,158,11,.3)}
.rev-name{font-weight:600;color:#F1F5F9;font-size:.88rem}
.rev-loc{font-size:.77rem;color:#64748B}
.rev-stars{color:#F59E0B;font-size:.9rem;letter-spacing:1px;margin-left:auto;white-space:nowrap}
.rev-text{font-size:.875rem;color:#94A3B8;line-height:1.65;margin:0}
</style>`;
}

// ─── Sites config ─────────────────────────────────────────────────────────────
const SITES = [
  { dir: 'C:/nappliancerepair',      key: 'nappliancerepair'    },
  { dir: 'C:/appliancerepairneary',  key: 'appliancerepairneary'},
  { dir: 'C:/fixlifyservices',       key: 'fixlifyservices'     },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
let totalCopied = 0, totalInjected = 0;

for (const { dir, key } of SITES) {
  if (!fs.existsSync(dir)) { console.log('SKIP (not found):', dir); continue; }

  // 1. Create assets/reviewers/ and copy images
  const reviewersDir = path.join(dir, 'assets', 'reviewers');
  fs.mkdirSync(reviewersDir, { recursive: true });

  for (const [dest, src] of Object.entries(IMAGE_MAP)) {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(reviewersDir, dest));
      totalCopied++;
    } else {
      console.warn('  Missing source:', src);
    }
  }
  console.log(`${key}: copied ${Object.keys(IMAGE_MAP).length} reviewer images`);

  // 2. Inject reviews into target pages
  let injected = 0;
  // Find matching pages by keyword substring
  const allPages = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  const targetPages = allPages.filter(f =>
    TARGET_KEYWORDS.some(kw => f === kw + '.html' || f.startsWith(kw) || f.includes(kw))
  ).slice(0, 12); // cap at 12 pages per site

  targetPages.forEach((page, pageIdx) => {
    const filePath = path.join(dir, page);
    if (!fs.existsSync(filePath)) return;

    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('reviews-section')) return; // already injected

    const reviewsHtml = buildReviewsHtml(key, pageIdx);

    // Inject before </main>, <footer, or </body>
    if (html.includes('</main>')) {
      html = html.replace('</main>', reviewsHtml + '\n</main>');
      injected++;
    } else if (html.includes('<footer')) {
      html = html.replace('<footer', reviewsHtml + '\n<footer');
      injected++;
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', reviewsHtml + '\n</body>');
      injected++;
    }

    fs.writeFileSync(filePath, html);
  });

  console.log(`${key}: injected reviews into ${injected} pages`);
  totalInjected += injected;
}

console.log(`\nDone! Copied ${totalCopied} images total, injected reviews into ${totalInjected} pages.`);
