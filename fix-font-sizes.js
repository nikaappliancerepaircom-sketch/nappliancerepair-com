/**
 * fix-font-sizes.js
 * Fix font sizes across all 3 sites:
 * - .pricing-items li: 0.8125rem (13px) → 0.875rem (14px) [Google min readable]
 * - footer.html small text: 0.6875rem → 0.875rem, 0.75rem → 0.875rem (for footer body text)
 * Run: node fix-font-sizes.js
 */

const fs = require('fs');
const path = require('path');

const SITES = [
  'C:/nappliancerepair',
  'C:/appliancerepairneary',
  'C:/fixlifyservices',
];

let totalFixed = 0;

for (const dir of SITES) {
  if (!fs.existsSync(dir)) { console.log('SKIP:', dir); continue; }

  let siteFixed = 0;

  // Fix HTML files: .pricing-items li font size
  const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    const fp = path.join(dir, file);
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;

    // Fix .pricing-items li font-size (13px → 14px)
    html = html.replace(
      /\.pricing-items li \{([^}]*?)font-size:\s*0\.8125rem/g,
      '.pricing-items li {$1font-size: 0.875rem'
    );

    // Fix .hero-tech-label or similar small content labels (not footer)
    // Only if they're in content sections (not footer)
    html = html.replace(
      /\.hero-tech-label \{([^}]*?)font-size:\s*0\.8125rem/g,
      '.hero-tech-label {$1font-size: 0.875rem'
    );

    if (html !== before) {
      fs.writeFileSync(fp, html);
      siteFixed++;
    }
  }

  // Fix blog HTML files
  const blogDir = path.join(dir, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));
    for (const file of blogFiles) {
      const fp = path.join(blogDir, file);
      let html = fs.readFileSync(fp, 'utf8');
      const before = html;
      html = html.replace(
        /\.pricing-items li \{([^}]*?)font-size:\s*0\.8125rem/g,
        '.pricing-items li {$1font-size: 0.875rem'
      );
      if (html !== before) {
        fs.writeFileSync(fp, html);
        siteFixed++;
      }
    }
  }

  // Fix footer.html include — bump very small footer content text to min 14px
  const footerPath = path.join(dir, 'includes', 'footer.html');
  if (fs.existsSync(footerPath)) {
    let footer = fs.readFileSync(footerPath, 'utf8');
    const before = footer;
    // 0.6875rem = 11px → 0.875rem = 14px for body text (not decorative/label text)
    // Only update contact info body text, not tiny label caps
    // Use targeted class names
    footer = footer
      .replace(/\.narf-contact-item[^{]*\{([^}]*?)font-size:\s*0\.8125rem/g,
        '.narf-contact-item{$1font-size: 0.875rem')
      .replace(/\.narf-copy[^{]*\{([^}]*?)font-size:\s*0\.75rem/g,
        '.narf-copy{$1font-size: 0.875rem')
      .replace(/\.narf-copy[^{]*\{([^}]*?)font-size:\s*0\.8125rem/g,
        '.narf-copy{$1font-size: 0.875rem')
      .replace(/\.narf-crosslink[^{]*\{([^}]*?)font-size:\s*0\.[67]\d+rem/g,
        '.narf-crosslink{$1font-size: 0.875rem');
    if (footer !== before) {
      fs.writeFileSync(footerPath, footer);
      siteFixed++;
      console.log(`  Fixed footer.html`);
    }
  }

  console.log(`${path.basename(dir)}: fixed ${siteFixed} files`);
  totalFixed += siteFixed;
}

console.log(`\nTotal: ${totalFixed} files fixed`);
