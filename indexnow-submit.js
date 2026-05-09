/**
 * indexnow-submit.js
 * Submits URLs from NAR sitemap to IndexNow (Bing/Yandex/Naver)
 * Key: nar2026indexnow  (file exists at /nar2026indexnow.txt on the site)
 */

const https = require('https');
const fs = require('fs');

const HOST = 'nappliancerepair.com';
const KEY = 'nar2026indexnow';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_API = 'api.indexnow.org';

// Read all URLs from sitemap
const sitemapXml = fs.readFileSync('C:/nappliancerepair/sitemap.xml', 'utf8');
const urls = [];
const locRegex = /<loc>(https:\/\/nappliancerepair\.com\/[^<]*)<\/loc>/g;
let m;
while ((m = locRegex.exec(sitemapXml)) !== null) {
  urls.push(m[1]);
}

console.log(`Total URLs to submit: ${urls.length}`);

function submitBatch(batch, batchNum) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch
    });

    const options = {
      hostname: INDEXNOW_API,
      path: '/IndexNow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log(`Batch ${batchNum} (${batch.length} URLs): HTTP ${res.statusCode} ${body.trim() || '(no body)'}`);
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error(`Batch ${batchNum} error: ${e.message}`);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  const BATCH_SIZE = 100;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    await submitBatch(batch, batchNum);
    // Small delay between batches
    if (i + BATCH_SIZE < urls.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  console.log('IndexNow submission complete.');
}

run();
