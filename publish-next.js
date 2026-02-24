/**
 * Publish the next queued blog post from blog/_queue/
 * - Reads oldest file (alphabetical) from blog/_queue/
 * - Extracts title, tag, excerpt, date from HTML
 * - Injects card at top of blog/index.html
 * - Moves file to blog/
 * - Optionally submits URL to Google Indexing API
 *
 * Usage: node publish-next.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const QUEUE_DIR = path.join(__dirname, 'blog', '_queue');
const BLOG_DIR = path.join(__dirname, 'blog');
const BLOG_INDEX = path.join(BLOG_DIR, 'index.html');
const DOMAIN = 'https://nappliancerepair.com';

function extractMeta(html) {
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1] || '';
  const date = (html.match(/"datePublished":\s*"([^"]+)"/) || [])[1] || '';
  const tag = (html.match(/class="article-tag"[^>]*>([^<]+)</) || [])[1] || 'Appliance Repair';
  const h1 = (html.match(/<h1[^>]*>([^<]+)<\/h1>/) || [])[1] || title.split('|')[0].trim();
  return { title, desc, date, tag, h1 };
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function submitIndexing(url) {
  const saJson = process.env.GOOGLE_INDEXING_SA;
  if (!saJson) return;
  const { createSign } = require('crypto');
  const sa = JSON.parse(saJson);
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email, scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now,
  })).toString('base64url');
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const jwt = `${header}.${payload}.${sign.sign(sa.private_key, 'base64url')}`;
  const tokenBody = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const token = await new Promise((res, rej) => {
    const req = https.request({ hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': tokenBody.length } },
      r => { let d = ''; r.on('data', c => d += c); r.on('end', () => { const j = JSON.parse(d); j.access_token ? res(j.access_token) : rej(new Error(d)); }); });
    req.on('error', rej); req.write(tokenBody); req.end();
  });
  const body = JSON.stringify({ url, type: 'URL_UPDATED' });
  return new Promise(res => {
    const req = https.request({ hostname: 'indexing.googleapis.com', path: '/v3/urlNotifications:publish',
      method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(r.statusCode)); });
    req.on('error', e => res('ERR:' + e.message)); req.write(body); req.end();
  });
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('No _queue directory found. Nothing to publish.');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.html')).sort();
  if (files.length === 0) {
    console.log('Queue is empty. Nothing to publish today.');
    return;
  }

  const file = files[0];
  const srcPath = path.join(QUEUE_DIR, file);
  const destPath = path.join(BLOG_DIR, file);
  const html = fs.readFileSync(srcPath, 'utf8');
  const { desc, date, tag, h1 } = extractMeta(html);
  const slug = file.replace('.html', '');
  const url = `${DOMAIN}/blog/${slug}`;
  const displayDate = formatDate(date);

  console.log(`Publishing: ${file}`);
  console.log(`  Title: ${h1}`);
  console.log(`  Date: ${displayDate}`);
  console.log(`  URL: ${url}`);

  if (dryRun) {
    console.log('[DRY RUN] Would publish this post. No changes made.');
    return;
  }

  // Move file to blog/
  fs.copyFileSync(srcPath, destPath);
  fs.unlinkSync(srcPath);

  // Inject card into blog/index.html
  if (fs.existsSync(BLOG_INDEX)) {
    let indexHtml = fs.readFileSync(BLOG_INDEX, 'utf8');
    const card = `
        <!-- Auto-published ${date} -->
        <article class="post-card">
          <div class="post-card-stripe"></div>
          <div class="post-card-header">
            <div class="post-tag">${tag}</div>
            <h2><a href="/blog/${slug}">${h1}</a></h2>
          </div>
          <div class="post-card-body">
            <p class="post-excerpt">${desc}</p>
          </div>
          <div class="post-card-footer">
            <span class="post-date">${displayDate}</span>
            <a href="/blog/${slug}" class="read-more">
              Read More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </article>

        <!-- Post 1 -->`;
    if (indexHtml.includes('<!-- Post 1 -->')) {
      indexHtml = indexHtml.replace('<!-- Post 1 -->', card);
      fs.writeFileSync(BLOG_INDEX, indexHtml);
      console.log('  ✓ Added card to blog/index.html');
    } else {
      console.log('  ⚠ Could not find injection point in blog/index.html');
    }
  }

  // Submit to Google Indexing API
  if (process.env.GOOGLE_INDEXING_SA) {
    const status = await submitIndexing(url);
    console.log(`  ✓ Submitted to Indexing API: [${status}] ${url}`);
  }

  console.log(`\nPublished: ${file} → blog/${file}`);
  console.log(`Remaining in queue: ${files.length - 1}`);
}

main().catch(e => { console.error(e); process.exit(1); });
