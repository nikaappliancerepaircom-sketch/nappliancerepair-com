#!/usr/bin/env node
/**
 * inject-city-content-nar.js — Replace first long <p> in each city page
 * with 3 unique paragraphs from city-content-data.json (Gemini-generated).
 * Marker: <!-- CITY-CONTENT-v2 --> to prevent re-runs.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname; // /c/nappliancerepair
const DATA_FILE = path.join('C:', 'NikaApplianceRepair', 'city-content-data.json');

function splitIntoParagraphs(text, count) {
  // Split text into roughly equal paragraphs by sentence boundaries
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length < count) return [text]; // Can't split enough

  const totalLen = text.length;
  const targetLen = totalLen / count;
  const result = [];
  let current = '';

  for (const sentence of sentences) {
    current += sentence;
    if (current.length >= targetLen && result.length < count - 1) {
      result.push(current.trim());
      current = '';
    }
  }
  if (current.trim()) {
    result.push(current.trim());
  }

  // If we got fewer than count, merge the last ones
  while (result.length > count) {
    const last = result.pop();
    result[result.length - 1] += ' ' + last;
  }

  return result;
}

function escapeHtml(text) {
  // Only escape ampersands that aren't already entities, leave everything else as-is
  return text
    .replace(/&(?!amp;|lt;|gt;|quot;|#\d+;|#x[\da-fA-F]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function main() {
  // Load city content data
  if (!fs.existsSync(DATA_FILE)) {
    console.error('ERROR: city-content-data.json not found at', DATA_FILE);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DATA_FILE, 'utf8');
  let cityData;
  try {
    cityData = JSON.parse(rawData);
  } catch (e) {
    console.error('ERROR: Failed to parse city-content-data.json:', e.message);
    process.exit(1);
  }

  const cityKeys = Object.keys(cityData);
  if (cityKeys.length === 0) {
    console.error('ERROR: city-content-data.json is empty');
    process.exit(1);
  }
  console.log('Loaded ' + cityKeys.length + ' cities from city-content-data.json');

  // Sort city keys by length descending for greedy matching
  const sortedCityKeys = cityKeys.sort((a, b) => b.length - a.length);

  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

  let updated = 0;
  let skippedMarker = 0;
  let skippedNoCity = 0;
  let skippedNoP = 0;
  let skippedNoData = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Skip if already has v2 content
    if (html.includes('<!-- CITY-CONTENT-v2 -->')) {
      skippedMarker++;
      continue;
    }

    // Must be a city page (has main content area)
    if (!html.includes('<main') && !html.includes('<article')) {
      skippedNoCity++;
      continue;
    }

    // Detect city from filename
    const basename = path.basename(file, '.html');
    let matchedCityKey = null;

    for (const cityKey of sortedCityKeys) {
      if (basename === cityKey) {
        matchedCityKey = cityKey;
        break;
      }
      if (basename.endsWith('-' + cityKey)) {
        matchedCityKey = cityKey;
        break;
      }
    }

    if (!matchedCityKey) {
      skippedNoCity++;
      continue;
    }

    // Check if we have content for this city
    // Data format: either raw string or {paragraphs: [...]}
    let rawContent = cityData[matchedCityKey];
    if (!rawContent) {
      skippedNoData++;
      continue;
    }

    // Extract paragraphs from the content
    let paragraphs;
    if (typeof rawContent === 'string') {
      // Raw text — split into 3 roughly equal paragraphs by sentence boundaries
      if (rawContent.split(/\s+/).length < 100) {
        skippedNoData++; // Not enough content yet
        continue;
      }
      paragraphs = splitIntoParagraphs(rawContent, 3);
    } else if (rawContent.paragraphs && rawContent.paragraphs.length >= 3) {
      paragraphs = rawContent.paragraphs.slice(0, 3);
    } else {
      skippedNoData++;
      continue;
    }

    if (paragraphs.length < 3) {
      skippedNoData++;
      continue;
    }

    // Find the <main> or <article> section
    const mainMatch = html.match(/<main[^>]*>/);
    const articleMatch = html.match(/<article[^>]*>/);
    const sectionStart = mainMatch ? html.indexOf(mainMatch[0]) : (articleMatch ? html.indexOf(articleMatch[0]) : -1);

    if (sectionStart === -1) {
      skippedNoP++;
      continue;
    }

    const afterMain = html.slice(sectionStart);

    // Find the first <h1> or <h2> tag (we want paragraphs AFTER the heading)
    const h1Match = afterMain.match(/<h[12][^>]*>/);
    if (!h1Match) {
      skippedNoP++;
      continue;
    }

    const afterH1Start = afterMain.indexOf(h1Match[0]) + h1Match[0].length;
    const afterH1 = afterMain.slice(afterH1Start);

    // Find the first <p> tag longer than 200 characters
    const pRegex = /<p(?:\s[^>]*)?>[\s\S]*?<\/p>/g;
    let pMatch;
    let foundP = null;
    let foundPIndex = -1;

    while ((pMatch = pRegex.exec(afterH1)) !== null) {
      const pText = pMatch[0].replace(/<[^>]+>/g, '').trim();
      if (pText.length > 200) {
        foundP = pMatch[0];
        foundPIndex = sectionStart + afterH1Start + pMatch.index;
        break;
      }
    }

    if (!foundP || foundPIndex === -1) {
      skippedNoP++;
      continue;
    }

    // Build replacement: 3 paragraphs with v2 marker
    const p1 = paragraphs[0];
    const p2 = paragraphs[1];
    const p3 = paragraphs[2];

    const replacement = '<!-- CITY-CONTENT-v2 -->\n    <p>' + escapeHtml(p1) + '</p>\n    <p>' + escapeHtml(p2) + '</p>\n    <p>' + escapeHtml(p3) + '</p>\n    <!-- END-CITY-CONTENT-v2 -->';

    // Replace the first long <p> with our 3 paragraphs
    html = html.slice(0, foundPIndex) + replacement + html.slice(foundPIndex + foundP.length);

    fs.writeFileSync(filePath, html, 'utf8');
    updated++;
    console.log('  + ' + file + ' (' + matchedCityKey + ')');
  }

  console.log('\n=== NAR City Content v2 Injection ===');
  console.log('Updated: ' + updated + ' pages');
  console.log('Skipped (already v2): ' + skippedMarker);
  console.log('Skipped (no city match): ' + skippedNoCity);
  console.log('Skipped (no long <p> found): ' + skippedNoP);
  console.log('Skipped (no data for city): ' + skippedNoData);
  console.log('Total HTML files: ' + htmlFiles.length);
}

main();
