/**
 * make-book-pages.js
 * Creates proper on-site /book pages that look like real pages with full header/footer
 * Run: node make-book-pages.js
 */
const fs = require('fs');
const path = require('path');

const SITES = [
  {
    dir: 'C:/nappliancerepair',
    domain: 'nappliancerepair.com',
    phone: '(437) 524-1053',
    phoneHref: '+14375241053',
    bookingUrl: 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce',
    name: 'N Appliance Repair',
    color: '#2563EB',
    colorDark: '#1D4ED8',
    colorLight: '#EFF6FF',
    colorBorder: '#BFDBFE',
    rating: '4.9',
    reviews: '5,200+',
  },
  {
    dir: 'C:/appliancerepairneary',
    domain: 'appliancerepairneary.com',
    phone: '(437) 524-1053',
    phoneHref: '+14375241053',
    bookingUrl: 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce',
    name: 'Appliance Repair Neary',
    color: '#16A34A',
    colorDark: '#15803D',
    colorLight: '#F0FDF4',
    colorBorder: '#BBF7D0',
    rating: '4.9',
    reviews: '3,800+',
  },
  {
    dir: 'C:/fixlifyservices',
    domain: 'fixlifyservices.com',
    phone: '(437) 524-1053',
    phoneHref: '+14375241053',
    bookingUrl: 'https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce',
    name: 'Fixlify Services',
    color: '#7C3AED',
    colorDark: '#6D28D9',
    colorLight: '#F5F3FF',
    colorBorder: '#DDD6FE',
    rating: '4.9',
    reviews: '2,100+',
  },
];

function buildBook(s) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Book Appliance Repair | Same-Day Service | ${s.name}</title>
<meta name="description" content="Book same-day appliance repair online — instant confirmation, ${s.rating}★ rated. Dryer, fridge, washer, dishwasher repair across Toronto &amp; GTA. Call ${s.phone}.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://${s.domain}/book">
<meta property="og:title" content="Book Appliance Repair | Same-Day | ${s.name}">
<meta property="og:description" content="Book online — instant confirmation, same-day slots available. ${s.rating}★ from ${s.reviews} reviews.">
<meta property="og:url" content="https://${s.domain}/book">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Book Appliance Repair | ${s.name}">
<meta name="twitter:description" content="Same-day appliance repair in Toronto &amp; GTA. Book online, instant confirmation.">

<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "name": "${s.name}",
      "telephone": "${s.phoneHref}",
      "url": "https://${s.domain}",
      "address": {"@type": "PostalAddress", "addressLocality": "Toronto", "addressRegion": "Ontario", "addressCountry": "CA"},
      "aggregateRating": {"@type": "AggregateRating", "ratingValue": "${s.rating}", "reviewCount": "${s.reviews.replace(/[^0-9]/g, '')}"}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://${s.domain}/"},
        {"@type": "ListItem", "position": 2, "name": "Book Repair", "item": "https://${s.domain}/book"}
      ]
    }
  ]
}</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/tokens.css">

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #F9FAFB;
  color: #0A0A0A;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ── Breadcrumb ── */
.breadcrumb { padding: 14px 0; border-bottom: 1px solid #E5E7EB; background: #FAFAFA; }
.breadcrumb .container { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.breadcrumb a { font-size: 0.8125rem; font-weight: 500; color: #6B7280; text-decoration: none; }
.breadcrumb a:hover { color: ${s.color}; }
.breadcrumb-sep { font-size: 0.8125rem; color: #D1D5DB; }
.breadcrumb-current { font-size: 0.8125rem; font-weight: 600; color: #0A0A0A; }

/* ── Page Hero ── */
.book-hero {
  background: ${s.color};
  color: #fff;
  padding: 48px 24px 40px;
}
.book-hero-inner { max-width: 1200px; margin: 0 auto; }
.book-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
  line-height: 1.2;
}
.book-hero p {
  font-size: 1.0625rem;
  opacity: 0.9;
  max-width: 600px;
  margin-bottom: 24px;
}
.hero-badges { display: flex; flex-wrap: wrap; gap: 10px; }
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* ── Main layout ── */
.book-page { max-width: 1200px; margin: 40px auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
@media (max-width: 900px) { .book-page { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .book-page { padding: 0 16px; margin: 24px auto; } }

/* ── Booking panel ── */
.booking-panel {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}
.booking-panel-head {
  background: ${s.color};
  padding: 20px 24px;
  color: #fff;
}
.booking-panel-head h2 { font-size: 1.0625rem; font-weight: 700; margin-bottom: 4px; }
.booking-panel-head p { font-size: 0.875rem; opacity: 0.85; }
.booking-iframe {
  width: 100%;
  height: 720px;
  border: none;
  display: block;
}
@media (max-width: 480px) { .booking-iframe { height: 640px; } }

/* ── Sidebar ── */
.book-sidebar { display: flex; flex-direction: column; gap: 20px; }

.call-box {
  background: ${s.color};
  color: #fff;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
}
.call-box .call-label { font-size: 0.875rem; opacity: 0.85; margin-bottom: 14px; }
.call-box a.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  color: ${s.color};
  font-size: 1.125rem;
  font-weight: 700;
  padding: 14px 24px;
  border-radius: 6px;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: background 0.15s;
}
.call-box a.call-btn:hover { background: rgba(255,255,255,0.9); }
.call-box .call-hours { margin-top: 10px; font-size: 0.8125rem; opacity: 0.8; }

.info-box {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 20px;
}
.info-box h3 { font-size: 0.9375rem; font-weight: 700; margin-bottom: 14px; color: #111827; }
.check-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.875rem; color: #374151; line-height: 1.4; }
.check-list li::before { content: '✓'; color: ${s.color}; font-weight: 700; flex-shrink: 0; margin-top: 1px; font-size: 0.9375rem; }

.pills { display: flex; flex-wrap: wrap; gap: 6px; }
.pill {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  padding: 6px 12px;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.pill:hover { background: ${s.color}; color: #fff; border-color: ${s.color}; }

.rating-box {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.rating-stars { font-size: 1.25rem; letter-spacing: 1px; }
.rating-text { font-size: 0.875rem; color: #374151; }
.rating-text strong { font-weight: 700; color: #0A0A0A; }

/* ── Process section ── */
.process-section { max-width: 1200px; margin: 48px auto 0; padding: 0 24px 64px; }
.process-section h2 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 32px; }
.process-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.process-step { padding: 24px; background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; }
.step-num { width: 36px; height: 36px; background: ${s.colorLight}; color: ${s.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9375rem; margin-bottom: 12px; border: 2px solid ${s.colorBorder}; }
.process-step h3 { font-size: 0.9375rem; font-weight: 700; margin-bottom: 6px; }
.process-step p { font-size: 0.875rem; color: #6B7280; line-height: 1.5; }
</style>
</head>
<body>

<!-- Header -->
<div id="header-placeholder"></div>
<script src="/includes/header-loader.js" defer></script>

<!-- Breadcrumb -->
<nav class="breadcrumb" aria-label="Breadcrumb">
  <div class="container">
    <a href="/">Home</a>
    <span class="breadcrumb-sep" aria-hidden="true">/</span>
    <span class="breadcrumb-current">Book Repair</span>
  </div>
</nav>

<!-- Hero -->
<section class="book-hero">
  <div class="book-hero-inner">
    <h1>Book Same-Day Appliance Repair</h1>
    <p>Choose your time slot — a certified technician arrives in 1–3 hours. Serving Toronto, Mississauga, Brampton &amp; all GTA.</p>
    <div class="hero-badges">
      <span class="hero-badge">⚡ Same-day service</span>
      <span class="hero-badge">✓ 90-day warranty</span>
      <span class="hero-badge">⭐ ${s.rating}★ · ${s.reviews} reviews</span>
      <span class="hero-badge">💳 Upfront pricing</span>
    </div>
  </div>
</section>

<!-- Main content -->
<main>
  <div class="book-page">

    <!-- Booking iframe -->
    <div class="booking-panel">
      <div class="booking-panel-head">
        <h2>Select Your Appointment Time</h2>
        <p>Instant confirmation — no waiting for callbacks</p>
      </div>
      <iframe
        class="booking-iframe"
        src="${s.bookingUrl}?embed=true"
        title="Book appliance repair appointment"
        loading="lazy"
        allow="payment">
      </iframe>
    </div>

    <!-- Sidebar -->
    <aside class="book-sidebar" aria-label="Booking information">

      <div class="rating-box">
        <div class="rating-stars">⭐⭐⭐⭐⭐</div>
        <div class="rating-text"><strong>${s.rating} out of 5</strong><br>${s.reviews} verified reviews</div>
      </div>

      <div class="call-box">
        <p class="call-label">Prefer to talk first?</p>
        <a href="tel:${s.phoneHref}" class="call-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${s.phone}
        </a>
        <div class="call-hours">Mon–Sat 8am–8pm · Sun 9am–6pm</div>
      </div>

      <div class="info-box">
        <h3>What Happens After Booking</h3>
        <ul class="check-list">
          <li>Technician arrives within the chosen 2-hour window</li>
          <li>Diagnosis &amp; upfront quote before any work starts</li>
          <li>Most repairs completed same visit</li>
          <li>90-day warranty on parts &amp; labor</li>
          <li>Pay only if you approve the repair</li>
        </ul>
      </div>

      <div class="info-box">
        <h3>Appliances We Fix</h3>
        <div class="pills">
          <a href="/fridge-repair" class="pill">Refrigerator</a>
          <a href="/washer-repair" class="pill">Washer</a>
          <a href="/dryer-repair" class="pill">Dryer</a>
          <a href="/dishwasher-repair" class="pill">Dishwasher</a>
          <a href="/oven-repair" class="pill">Oven</a>
          <a href="/stove-repair" class="pill">Stove</a>
        </div>
      </div>

      <div class="info-box">
        <h3>Service Areas</h3>
        <div class="pills">
          <a href="/toronto" class="pill">Toronto</a>
          <a href="/mississauga" class="pill">Mississauga</a>
          <a href="/brampton" class="pill">Brampton</a>
          <a href="/scarborough" class="pill">Scarborough</a>
          <a href="/north-york" class="pill">North York</a>
          <a href="/etobicoke" class="pill">Etobicoke</a>
          <a href="/vaughan" class="pill">Vaughan</a>
          <a href="/markham" class="pill">Markham</a>
          <a href="/richmond-hill" class="pill">Richmond Hill</a>
          <a href="/oakville" class="pill">Oakville</a>
        </div>
      </div>
    </aside>
  </div>

  <!-- Process section -->
  <section class="process-section">
    <h2>How Our Booking Works</h2>
    <div class="process-grid">
      <div class="process-step">
        <div class="step-num">1</div>
        <h3>Pick a Time</h3>
        <p>Choose a same-day or next-day slot from the calendar above. 2-hour arrival windows.</p>
      </div>
      <div class="process-step">
        <div class="step-num">2</div>
        <h3>Technician Arrives</h3>
        <p>Our certified technician arrives on time, fully equipped with common parts.</p>
      </div>
      <div class="process-step">
        <div class="step-num">3</div>
        <h3>Upfront Quote</h3>
        <p>Diagnose the problem, give you a clear price. No surprises. No work without approval.</p>
      </div>
      <div class="process-step">
        <div class="step-num">4</div>
        <h3>Fixed &amp; Warranted</h3>
        <p>Most repairs done same-visit. 90-day warranty on all work, guaranteed.</p>
      </div>
    </div>
  </section>
</main>

<!-- Footer -->
<div id="footer-placeholder"></div>
<script src="/includes/footer-loader.js" defer></script>

</body>
</html>`;
}

for (const s of SITES) {
  if (!fs.existsSync(s.dir)) { console.log('SKIP:', s.dir); continue; }
  const bookPath = path.join(s.dir, 'book.html');
  fs.writeFileSync(bookPath, buildBook(s));
  console.log(`✓ ${s.domain}/book.html created`);
}
console.log('\nDone — book.html pages use real header/footer, full design, embedded Fixlify form');
