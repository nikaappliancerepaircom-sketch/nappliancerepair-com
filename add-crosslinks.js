/**
 * add-crosslinks.js
 * Adds "Brands We Service" 3rd column to the related section on all pages
 * across all 3 sites. Also updates grid CSS from 2-col to 3-col.
 *
 * Run: node add-crosslinks.js
 */

const fs = require('fs');
const path = require('path');

// ─── Per-site config ─────────────────────────────────────────────────────────

const SITES = [
  {
    dir: 'C:/nappliancerepair',
    name: 'nappliancerepair',
    sectionMarker: 'aria-label="Related pages"',
    // Pattern that comes AFTER the last col's closing </div>
    // = grid close (4sp) + section close (2sp)
    endAfterLastCol: '\n    </div>\n  </section>',
    buildBrandsCol() {
      const brands = [
        ['/samsung-repair',    'Samsung'],
        ['/lg-repair',        'LG'],
        ['/whirlpool-repair', 'Whirlpool'],
        ['/ge-repair',        'GE'],
        ['/bosch-repair',     'Bosch'],
        ['/frigidaire-repair','Frigidaire'],
        ['/kenmore-repair',   'Kenmore'],
        ['/maytag-repair',    'Maytag'],
        ['/kitchenaid-repair','KitchenAid'],
      ];
      const items = brands.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n');
      return `      <div class="related-col">
        <h3>Brands We Service</h3>
        <ul class="related-list">${items}</ul>
      </div>`;
    },
    fixCss(html) {
      return html.replace(
        /(\.related-links-grid\s*\{[^}]*?)grid-template-columns:\s*1fr\s+1fr\s*;/,
        '$1grid-template-columns: 1fr 1fr 1fr;'
      );
    },
  },
  {
    dir: 'C:/appliancerepairneary',
    name: 'appliancerepairneary',
    sectionMarker: 'class="related-section"',
    // After last col close (6sp): grid close (4sp) + container close (2sp) + section close (0sp)
    endAfterLastCol: '\n    </div>\n  </div>\n</section>',
    buildBrandsCol() {
      const brands = ['Samsung','LG','Whirlpool','GE','Bosch','Frigidaire','Kenmore','Maytag','KitchenAid'];
      const items = brands.map(b => `<li>${b}</li>`).join('\n');
      return `      <div class="related-col">
        <h3>Brands We Service</h3>
        <ul class="related-links" style="list-style:none;padding-left:0">${items}</ul>
      </div>`;
    },
    fixCss(html) {
      return html.replace(
        /(\.related-grid\s*\{[^}]*?)grid-template-columns:\s*1fr\s+1fr\s*;/,
        '$1grid-template-columns: 1fr 1fr 1fr;'
      );
    },
  },
  {
    dir: 'C:/fixlifyservices',
    name: 'fixlifyservices',
    sectionMarker: 'aria-label="Related pages"',
    // After last col close (6sp): empty line + two-col close (4sp) + container close (2sp) + section (0sp)
    endAfterLastCol: '\n\n    </div>\n  </div>\n</section>',
    buildBrandsCol() {
      const brands = [
        ['/samsung-appliance-repair',    'Samsung'],
        ['/lg-appliance-repair',        'LG'],
        ['/whirlpool-appliance-repair', 'Whirlpool'],
        ['/ge-appliance-repair',        'GE'],
        ['/bosch-appliance-repair',     'Bosch'],
        ['/frigidaire-appliance-repair','Frigidaire'],
      ];
      const cards = brands.map(([href, label]) =>
        `<a href="${href}" class="related-card glass-card">
    <div class="related-card-label">Brand</div>
    <div class="related-card-title">${label}</div>
  </a>`).join('\n');
      return `      <div>
        <h3 style="font-family:var(--font-head);font-weight:800;font-size:18px;margin-bottom:6px;color:var(--text);">
          Brands We Repair
        </h3>
        <div class="related-grid">
          ${cards}
        </div>
      </div>`;
    },
    fixCss(html) {
      // Fix the inline style on .related-two-col div
      return html.replace(
        /(style="[^"]*?grid-template-columns:)1fr 1fr(;[^"]*?"[^>]*?class="related-two-col")/,
        '$11fr 1fr 1fr$2'
      ).replace(
        // Also handle when class comes first
        /(class="related-two-col"[^>]*?style="[^"]*?grid-template-columns:)1fr 1fr(;)/,
        '$11fr 1fr 1fr$2'
      ).replace(
        // Simpler: just replace in the related-two-col div directly
        /(<div[^>]*class="related-two-col"[^>]*?)grid-template-columns:1fr 1fr/,
        '$1grid-template-columns:1fr 1fr 1fr'
      );
    },
  },
];

// ─── Inject function ─────────────────────────────────────────────────────────

function injectBrands(html, site) {
  const secIdx = html.indexOf(site.sectionMarker);
  if (secIdx === -1) return html;

  const END = site.endAfterLastCol;
  const afterIdx = html.indexOf(END, secIdx);
  if (afterIdx === -1) return html;

  // html.slice(0, afterIdx) ends with the last col's closing </div>
  // We inject brandsCol BETWEEN last col close and grid/container close
  const brandsCol = site.buildBrandsCol();
  return html.slice(0, afterIdx) + '\n' + brandsCol + END + html.slice(afterIdx + END.length);
}

// ─── Files to process ────────────────────────────────────────────────────────

const EXCLUDE = new Set([
  'service-template.html', '404.html', 'book.html',
  'index.html', 'about.html', 'contact.html', 'pricing.html',
]);

function getHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  fs.readdirSync(dir).filter(f => f.endsWith('.html') && !EXCLUDE.has(f))
    .forEach(f => files.push(path.join(dir, f)));
  const blogDir = path.join(dir, 'blog');
  if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && !EXCLUDE.has(f))
      .forEach(f => files.push(path.join(blogDir, f)));
  }
  return files;
}

// ─── Run ─────────────────────────────────────────────────────────────────────

let globalFixed = 0;
let globalFiles = 0;

for (const site of SITES) {
  if (!fs.existsSync(site.dir)) { console.log('SKIP:', site.dir); continue; }

  const files = getHtmlFiles(site.dir);
  let fixed = 0;
  let skipped = 0;
  let noMatch = 0;

  for (const fp of files) {
    let html = fs.readFileSync(fp, 'utf8');
    // Normalize CRLF → LF so string patterns work consistently
    html = html.replace(/\r\n/g, '\n');
    const before = html;

    // Skip if already has brands section
    if (html.includes('Brands We Service') || html.includes('Brands We Repair')) {
      skipped++;
      continue;
    }

    // Skip if no related section marker
    if (!html.includes(site.sectionMarker)) {
      noMatch++;
      continue;
    }

    // Fix grid CSS to 3 columns
    html = site.fixCss(html);

    // Inject brands column
    html = injectBrands(html, site);

    if (html !== before) {
      // Verify injection happened
      if (!html.includes('Brands We Service') && !html.includes('Brands We Repair')) {
        console.log(`  ⚠ injection failed: ${path.relative(site.dir, fp)}`);
        continue;
      }
      fs.writeFileSync(fp, html);
      fixed++;
      if (fixed <= 3) console.log(`  ✓ ${path.relative(site.dir, fp)}`);
    } else {
      console.log(`  ⚠ no change: ${path.relative(site.dir, fp)}`);
    }
  }

  console.log(`${path.basename(site.dir)}: updated ${fixed}/${files.length} pages (${skipped} already, ${noMatch} no marker)`);
  globalFixed += fixed;
  globalFiles += files.length;
}

console.log(`\n✅ Done. ${globalFixed}/${globalFiles} pages updated with Brands cross-links`);
