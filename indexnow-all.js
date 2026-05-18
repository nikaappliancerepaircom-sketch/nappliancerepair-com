const https = require('https');
const fs = require('fs');
const path = require('path');

// Find key file
const files = fs.readdirSync('C:/nappliancerepair').filter(f => f.endsWith('.txt') && f.length < 50 && !['robots.txt', 'llms.txt'].includes(f));
const key = files.length > 0 ? files[0].replace('.txt', '') : 'nappliancerepair2026';

// Read all URLs from sitemap.xml
const sitemap = fs.readFileSync('C:/nappliancerepair/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

console.log(`Total URLs to ping: ${urls.length}`);
console.log(`Using key: ${key}`);

async function pingBatch(batch, batchNum) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      host: 'nappliancerepair.com',
      key: key,
      keyLocation: `https://nappliancerepair.com/${key}.txt`,
      urlList: batch
    });
    const options = {
      hostname: 'api.indexnow.org',
      path: '/indexnow',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      console.log(`Batch ${batchNum}: HTTP ${res.statusCode} — ${batch.length} URLs`);
      resolve();
    });
    req.on('error', e => { console.error(`Batch ${batchNum} error:`, e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

async function main() {
  const batchSize = 100;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await pingBatch(batch, Math.floor(i/batchSize) + 1);
  }
  console.log('Done.');
}

main();
