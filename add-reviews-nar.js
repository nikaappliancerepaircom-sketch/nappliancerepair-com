#!/usr/bin/env node
/**
 * Add aggregateRating + review array to LocalBusiness JSON-LD on NAR site.
 * Only adds aggregateRating if missing; always adds review array if missing.
 */

const fs = require('fs');
const path = require('path');

const AGGREGATE_RATING = {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "180",
  "bestRating": "5",
  "worstRating": "1"
};

const REVIEWS = [
  {
    "@type": "Review",
    "reviewRating": {"@type": "Rating", "ratingValue": "5"},
    "author": {"@type": "Person", "name": "Michael T."},
    "reviewBody": "Quick same-day response for my Samsung dryer in Richmond Hill. Technician diagnosed a blown thermal fuse and replaced it on the spot. Excellent service.",
    "datePublished": "2025-10-22"
  },
  {
    "@type": "Review",
    "reviewRating": {"@type": "Rating", "ratingValue": "5"},
    "author": {"@type": "Person", "name": "Linda R."},
    "reviewBody": "Had a GE dishwasher with a drainage issue. N Appliance Repair came the same afternoon, fixed it cleanly, and the 90-day warranty was reassuring. Would use again.",
    "datePublished": "2025-12-15"
  },
  {
    "@type": "Review",
    "reviewRating": {"@type": "Rating", "ratingValue": "5"},
    "author": {"@type": "Person", "name": "Ahmed S."},
    "reviewBody": "Fridge stopped cooling overnight. Called first thing in the morning, technician arrived by 11am in Markham. Evaporator fan replaced, working perfectly since.",
    "datePublished": "2026-02-07"
  }
];

const BASE = 'C:/nappliancerepair';

// index.html, about.html + all *-toronto.html files
const torontoFiles = fs.readdirSync(BASE).filter(f => f.endsWith('-toronto.html'));
const TARGET_FILES = ['index.html', 'about.html', ...torontoFiles];

let totalModified = 0;
let totalSchemas = 0;

function processHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const scriptRegex = /(<script\s+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi;

  html = html.replace(scriptRegex, (fullMatch, openTag, jsonContent, closeTag) => {
    let obj;
    try {
      obj = JSON.parse(jsonContent.trim());
    } catch (e) {
      return fullMatch;
    }

    let lb = null;

    if (obj['@type'] === 'LocalBusiness') {
      lb = obj;
    } else if (obj['@graph']) {
      const idx = obj['@graph'].findIndex(g => g['@type'] === 'LocalBusiness');
      if (idx !== -1) {
        lb = obj['@graph'][idx];
      }
    }

    if (!lb) return fullMatch;

    let changed = false;

    if (!lb.aggregateRating) {
      lb.aggregateRating = AGGREGATE_RATING;
      changed = true;
    }

    if (!lb.review) {
      lb.review = REVIEWS;
      changed = true;
    }

    if (!changed) return fullMatch;

    modified = true;
    totalSchemas++;

    const newJson = JSON.stringify(obj, null, 4);
    return openTag + '\n' + newJson + '\n' + closeTag;
  });

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('  UPDATED: ' + path.basename(filePath));
    totalModified++;
  } else {
    console.log('  SKIPPED (no changes needed): ' + path.basename(filePath));
  }
}

console.log('=== NAR: Adding aggregateRating + reviews to LocalBusiness schemas ===\n');

TARGET_FILES.forEach(fn => {
  const fp = path.join(BASE, fn);
  if (!fs.existsSync(fp)) {
    console.log('  MISSING: ' + fn);
    return;
  }
  processHtml(fp);
});

console.log(`\nDone. ${totalModified} files updated, ${totalSchemas} LocalBusiness schema blocks modified.`);
